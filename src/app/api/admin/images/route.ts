import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { S3Storage } from 'coze-coding-dev-sdk';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 获取图片列表（管理员）
export async function GET(request: NextRequest) {
  // 验证管理员权限
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const client = getSupabaseClient();
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 查询图片列表
    const { data, error, count } = await client
      .from('product_images')
      .select('id, product_id, image_key, is_primary, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`查询图片失败: ${error.message}`);

    // 获取商品名称
    const productIds = [...new Set(data?.map(img => img.product_id) || [])];
    const { data: productsData } = await client
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productMap = new Map(productsData?.map(p => [p.id, p.name]) || []);

    // 生成签名URL
    const images = await Promise.all(
      (data || []).map(async (img) => ({
        id: img.id,
        product_id: img.product_id,
        product_name: productMap.get(img.product_id) || '未知商品',
        image_url: await storage.generatePresignedUrl({
          key: img.image_key,
          expireTime: 3600,
        }),
        is_primary: img.is_primary,
        created_at: img.created_at,
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        images,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error: any) {
    console.error('获取图片列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
