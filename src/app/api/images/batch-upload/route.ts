import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';
import JSZip from 'jszip';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 批量上传图片文件
export async function POST(request: NextRequest) {
  // 验证权限
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到上传文件' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const results = {
      total: files.length,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // 处理每个文件
    for (const file of files) {
      try {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          results.skipped++;
          results.errors.push(`跳过非图片文件：${file.name}`);
          continue;
        }

        // 从文件名提取商品编码（支持多种格式）
        // 格式：商品编码_序号.jpg 或 商品编码.jpg
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
        const productCode = fileName.split('_')[0]; // 取下划线前的部分

        if (!productCode) {
          results.failed++;
          results.errors.push(`无法从文件名提取商品编码：${file.name}`);
          continue;
        }

        // 查找商品
        const { data: products, error: productError } = await client
          .from('products')
          .select('id')
          .eq('product_code', productCode)
          .limit(1);

        if (productError || !products || products.length === 0) {
          results.failed++;
          results.errors.push(`商品不存在：${productCode} (${file.name})`);
          continue;
        }

        const product = products[0];

        // 上传图片
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const imageKey = await storage.uploadFile({
          fileContent: fileBuffer,
          fileName: `products/${product.id}/${Date.now()}_${file.name}`,
          contentType: file.type,
        });

        // 检查是否已有图片
        const { data: existingImages } = await client
          .from('product_images')
          .select('id')
          .eq('product_id', product.id);

        const isFirstImage = !existingImages || existingImages.length === 0;

        // 保存到数据库
        const { error: insertError } = await client.from('product_images').insert({
          product_id: product.id,
          image_key: imageKey,
          is_primary: isFirstImage,
        });

        if (insertError) {
          results.failed++;
          results.errors.push(`保存失败：${file.name} - ${insertError.message}`);
        } else {
          results.success++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`处理失败：${file.name} - ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('批量上传失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
