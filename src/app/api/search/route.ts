import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 高级搜索（使用全文搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const supplier = searchParams.get('supplier');
    const level1Category = searchParams.get('level1Category');
    const level2Category = searchParams.get('level2Category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const client = getSupabaseClient();

    // 使用 RPC 调用全文搜索函数
    const { data, error } = await client.rpc('search_products', {
      search_query: keyword,
      filter_supplier: supplier || null,
      filter_level1: level1Category || null,
      filter_level2: level2Category || null,
      page_size: pageSize,
      page_offset: (page - 1) * pageSize,
    });

    if (error) {
      // 如果全文搜索失败，回退到普通搜索
      console.warn('全文搜索失败，回退到普通搜索:', error.message);
      return fallbackSearch(request);
    }

    // 提取总数
    const total = data && data.length > 0 ? data[0].total_count : 0;

    // 为商品添加主图URL
    const productsWithImages = await attachPrimaryImages(data || []);

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithImages,
        total: total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('搜索失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 回退搜索（使用普通 ILIKE）
async function fallbackSearch(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const supplier = searchParams.get('supplier');
  const level1Category = searchParams.get('level1Category');
  const level2Category = searchParams.get('level2Category');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const client = getSupabaseClient();
  
  let query = client
    .from('products')
    .select('*', { count: 'exact' });

  if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%,spec.ilike.%${keyword}%,supplier.ilike.%${keyword}%`);
  }

  if (supplier) {
    query = query.eq('supplier', supplier);
  }

  if (level1Category) {
    query = query.eq('level1_category', level1Category);
  }

  if (level2Category) {
    query = query.eq('level2_category', level2Category);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await query
    .order('id')
    .range(from, to);

  if (error) throw new Error(`查询商品失败: ${error.message}`);

  // 为商品添加主图URL
  const productsWithImages = await attachPrimaryImages(data || []);

  return NextResponse.json({
    success: true,
    data: {
      products: productsWithImages,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  });
}

// 为商品列表附加主图URL和推荐状态
async function attachPrimaryImages(products: any[]) {
  if (!products || products.length === 0) return products;

  const productIds = products.map(p => p.id);
  const client = getSupabaseClient();

  // 批量查询主图
  const { data: images, error } = await client
    .from('product_images')
    .select('product_id, image_key')
    .in('product_id', productIds)
    .eq('is_primary', true);

  if (error) {
    console.warn('查询主图失败:', error.message);
  }

  // 批量查询推荐状态
  const { data: recommendations, error: recError } = await client
    .from('product_recommendations')
    .select('product_id, recommend_type')
    .in('product_id', productIds);

  if (recError) {
    console.warn('查询推荐状态失败:', recError.message);
  }

  // 创建产品ID到图片key的映射
  const imageMap = new Map<number, string>();
  for (const img of images || []) {
    imageMap.set(img.product_id, img.image_key);
  }

  // 创建产品ID到推荐类型的映射
  const recommendationMap = new Map<number, string[]>();
  for (const rec of recommendations || []) {
    const types = recommendationMap.get(rec.product_id) || [];
    types.push(rec.recommend_type);
    recommendationMap.set(rec.product_id, types);
  }

  // 为每个产品生成主图URL
  return Promise.all(products.map(async (product) => {
    const imageKey = imageMap.get(product.id);
    let primaryImageUrl = null;
    
    if (imageKey) {
      try {
        primaryImageUrl = await storage.generatePresignedUrl({
          key: imageKey,
          expireTime: 86400, // 1天有效期
        });
      } catch (e) {
        console.warn(`生成图片URL失败: product_id=${product.id}`, e);
      }
    }

    return { 
      ...product, 
      primary_image_url: primaryImageUrl,
      recommend_types: recommendationMap.get(product.id) || [],
    };
  }));
}
