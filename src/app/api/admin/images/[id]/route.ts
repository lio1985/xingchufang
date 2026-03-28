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

// 删除图片
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 验证管理员权限
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { id } = await params;
    const imageId = parseInt(id);

    if (isNaN(imageId)) {
      return NextResponse.json(
        { success: false, error: '无效的图片ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取图片信息
    const { data: image, error: fetchError } = await client
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError) throw new Error(`查询图片失败: ${fetchError.message}`);
    if (!image) throw new Error('图片不存在');

    // 从对象存储删除
    try {
      await storage.deleteFile({ fileKey: image.image_key });
    } catch (e) {
      console.warn('删除对象存储文件失败:', e);
      // 继续删除数据库记录
    }

    // 从数据库删除记录
    const { error: deleteError } = await client
      .from('product_images')
      .delete()
      .eq('id', imageId);

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
