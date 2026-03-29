import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth } from '@/lib/auth';
import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 推荐类型定义
const RECOMMEND_TYPES = {
  hot: { label: '爆款', color: 'red' },
  new: { label: '新款', color: 'green' },
  sale: { label: '特价', color: 'orange' },
  featured: { label: '精选', color: 'blue' },
} as const;

// 获取推荐列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // hot/new/sale/featured
    const activeOnly = searchParams.get('activeOnly') === 'true'; // 只获取有效的推荐
    const limit = parseInt(searchParams.get('limit') || '20');
    const withProducts = searchParams.get('withProducts') === 'true'; // 是否包含商品详情

    const client = getSupabaseClient();

    let query = client
      .from('product_recommendations')
      .select(withProducts ? `
        id,
        product_id,
        recommend_type,
        start_date,
        end_date,
        sort_order,
        created_by,
        created_at,
        products (
          id,
          name,
          brand,
          spec,
          params,
          price,
          supplier,
          level1_category,
          level2_category,
          product_code
        )
      ` : '*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);

    // 按类型筛选
    if (type && RECOMMEND_TYPES[type as keyof typeof RECOMMEND_TYPES]) {
      query = query.eq('recommend_type', type);
    }

    const { data, error } = await query;

    if (error) throw new Error(`获取推荐列表失败: ${error.message}`);

    // 筛选有效期内的推荐
    let result = data || [];
    if (activeOnly) {
      const now = new Date().toISOString();
      result = result.filter((item: any) => {
        if (item.start_date && item.start_date > now) return false;
        if (item.end_date && item.end_date < now) return false;
        return true;
      });
    }

    // 如果需要商品详情，获取主图
    if (withProducts && result.length > 0) {
      result = await Promise.all(
        result.map(async (item: any) => {
          if (!item.products) return { ...item, primary_image_url: null };

          // 查询主图
          const { data: images } = await client
            .from('product_images')
            .select('image_key')
            .eq('product_id', item.product_id)
            .eq('is_primary', true)
            .limit(1);

          let primaryImageUrl = null;
          if (images && images.length > 0) {
            try {
              primaryImageUrl = await storage.generatePresignedUrl({
                key: images[0].image_key,
                expireTime: 86400,
              });
            } catch (e) {
              console.warn('生成图片URL失败:', e);
            }
          }

          return {
            ...item,
            primary_image_url: primaryImageUrl,
          };
        })
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      types: RECOMMEND_TYPES,
    });
  } catch (error: any) {
    console.error('获取推荐列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 添加推荐
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  // 只有管理员可以添加推荐
  if (auth.user?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: '只有管理员可以添加推荐' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { productId, recommendType, startDate, endDate, sortOrder } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: '缺少商品ID' },
        { status: 400 }
      );
    }

    if (!recommendType || !RECOMMEND_TYPES[recommendType as keyof typeof RECOMMEND_TYPES]) {
      return NextResponse.json(
        { success: false, error: '无效的推荐类型' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查商品是否存在
    const { data: product, error: productError } = await client
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: '商品不存在' },
        { status: 404 }
      );
    }

    // 添加推荐
    const { data, error } = await client
      .from('product_recommendations')
      .insert({
        product_id: productId,
        recommend_type: recommendType,
        start_date: startDate || null,
        end_date: endDate || null,
        sort_order: sortOrder || 0,
        created_by: auth.user?.username || null,
      })
      .select()
      .single();

    if (error) {
      // 唯一约束冲突
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: '该商品已设置此类型推荐' },
          { status: 400 }
        );
      }
      throw new Error(`添加推荐失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
      message: '添加推荐成功',
    });
  } catch (error: any) {
    console.error('添加推荐失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 更新推荐
export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  if (auth.user?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: '只有管理员可以修改推荐' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, recommendType, startDate, endDate, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少推荐ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (recommendType !== undefined) updateData.recommend_type = recommendType;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;

    const { data, error } = await client
      .from('product_recommendations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`更新推荐失败: ${error.message}`);

    return NextResponse.json({
      success: true,
      data,
      message: '更新推荐成功',
    });
  } catch (error: any) {
    console.error('更新推荐失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除推荐
export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  if (auth.user?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: '只有管理员可以删除推荐' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const productId = searchParams.get('productId');
    const recommendType = searchParams.get('recommendType');

    if (!id && !(productId && recommendType)) {
      return NextResponse.json(
        { success: false, error: '缺少推荐ID或商品ID+推荐类型' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    let query = client.from('product_recommendations').delete();

    if (id) {
      query = query.eq('id', parseInt(id));
    } else {
      query = query
        .eq('product_id', parseInt(productId!))
        .eq('recommend_type', recommendType!);
    }

    const { error } = await query;

    if (error) throw new Error(`删除推荐失败: ${error.message}`);

    return NextResponse.json({
      success: true,
      message: '删除推荐成功',
    });
  } catch (error: any) {
    console.error('删除推荐失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
