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
