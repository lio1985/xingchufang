import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 初始化对象存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

// 获取商品的所有图片
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false });

    if (error) throw new Error(`查询图片失败: ${error.message}`);

    // 为每个图片生成签名 URL
    const imagesWithUrls = await Promise.all(
      (data || []).map(async (img) => ({
        ...img,
        url: await storage.generatePresignedUrl({
          key: img.image_key,
          expireTime: 86400, // 1天有效期
        }),
      }))
    );

    return NextResponse.json({ success: true, data: imagesWithUrls });
  } catch (error: any) {
    console.error('获取图片失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 上传图片
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到上传文件' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `products/${productId}/${Date.now()}_${file.name}`;

    // 上传到对象存储
    const imageKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: fileName,
      contentType: file.type,
    });

    // 如果设置为主图，先取消其他主图
    const client = getSupabaseClient();
    if (isPrimary) {
      await client
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
    }

    // 保存图片记录到数据库
    const { data, error } = await client
      .from('product_images')
      .insert({
        product_id: productId,
        image_key: imageKey,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (error) throw new Error(`保存图片记录失败: ${error.message}`);

    // 生成访问 URL
    const imageUrl = await storage.generatePresignedUrl({
      key: imageKey,
      expireTime: 86400,
    });

    return NextResponse.json({
      success: true,
      data: { ...data, url: imageUrl },
    });
  } catch (error: any) {
    console.error('上传图片失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除图片
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: '缺少图片ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取图片信息
    const { data: image, error: fetchError } = await client
      .from('product_images')
      .select('*')
      .eq('id', parseInt(imageId))
      .single();

    if (fetchError) throw new Error(`查询图片失败: ${fetchError.message}`);
    if (!image) throw new Error('图片不存在');

    // 从对象存储删除
    await storage.deleteFile({ fileKey: image.image_key });

    // 从数据库删除记录
    const { error: deleteError } = await client
      .from('product_images')
      .delete()
      .eq('id', parseInt(imageId));

    if (deleteError) throw new Error(`删除图片记录失败: ${deleteError.message}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除图片失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
