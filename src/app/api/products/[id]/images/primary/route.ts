import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

// 设置主图
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 验证权限
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: '缺少图片ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 先取消所有主图
    const { error: updateError1 } = await client
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    if (updateError1) throw new Error(`取消主图失败: ${updateError1.message}`);

    // 设置新的主图
    const { error: updateError2 } = await client
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('product_id', productId);

    if (updateError2) throw new Error(`设置主图失败: ${updateError2.message}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('设置主图失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
