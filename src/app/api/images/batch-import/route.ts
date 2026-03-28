import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 批量导入图片
export async function POST(request: NextRequest) {
  // 验证权限
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到上传文件' },
        { status: 400 }
      );
    }

    // 解析 Excel 文件
    const buffer = Buffer.from(await file.arrayBuffer());
    const xlsx = await import('xlsx');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const client = getSupabaseClient();
    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // 逐条处理
    for (const row of data as any[]) {
      try {
        const productCode = row['商品编码'] || row['product_code'] || row['货号'];
        const imageUrl = row['图片URL'] || row['image_url'] || row['图片链接'];

        if (!productCode || !imageUrl) {
          results.failed++;
          results.errors.push(`缺少必要字段：${JSON.stringify(row)}`);
          continue;
        }

        // 查找商品
        const { data: product, error: productError } = await client
          .from('products')
          .select('id')
          .eq('product_code', productCode)
          .single();

        if (productError || !product) {
          results.failed++;
          results.errors.push(`商品不存在：${productCode}`);
          continue;
        }

        // 从 URL 下载并上传图片
        const imageKey = await storage.uploadFromUrl({ url: imageUrl, timeout: 30000 });

        // 保存到数据库
        const { error: insertError } = await client.from('product_images').insert({
          product_id: product.id,
          image_key: imageKey,
          is_primary: false,
        });

        if (insertError) {
          results.failed++;
          results.errors.push(`保存失败：${productCode} - ${insertError.message}`);
        } else {
          results.success++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`处理失败：${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('批量导入失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
