import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 获取商品列表（管理员）
export async function GET(request: NextRequest) {
  // 验证管理员权限
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const client = getSupabaseClient();
    
    // 构建查询
    let query = client
      .from('products')
      .select('id, name, brand, spec, supplier, level2_category', { count: 'exact' });

    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .order('id')
      .range(from, to);

    if (error) throw new Error(`查询商品失败: ${error.message}`);

    // 查询每个商品是否有图片
    const productIds = data?.map(p => p.id) || [];
    const { data: imagesData } = await client
      .from('product_images')
      .select('product_id')
      .in('product_id', productIds);

    const productsWithImages = new Set(imagesData?.map(img => img.product_id) || []);

    // 合并数据
    const products = data?.map(p => ({
      ...p,
      has_image: productsWithImages.has(p.id),
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        products,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 新建商品
export async function POST(request: NextRequest) {
  // 验证管理员权限
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const {
      product_code,
      name,
      brand,
      spec,
      params,
      price,
      supplier,
      level1_category,
      level2_category,
      origin,
      warranty,
      selling_points,
      remarks,
    } = body;

    // 验证必填字段
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '商品名称不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 插入商品
    const { data, error } = await client
      .from('products')
      .insert({
        product_code: product_code?.trim() || null,
        name: name.trim(),
        brand: brand?.trim() || null,
        spec: spec?.trim() || null,
        params: params?.trim() || null,
        price: price?.trim() || null,
        supplier: supplier?.trim() || null,
        level1_category: level1_category?.trim() || null,
        level2_category: level2_category?.trim() || null,
        origin: origin?.trim() || null,
        warranty: warranty?.trim() || null,
        selling_points: selling_points?.trim() || null,
        remarks: remarks?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('创建商品失败:', error);
      return NextResponse.json(
        { success: false, error: `创建商品失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: '商品创建成功',
    });
  } catch (error: any) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
