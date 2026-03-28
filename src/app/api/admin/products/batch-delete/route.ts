import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 批量删除商品
export async function POST(request: NextRequest) {
  // 验证管理员权限
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const { product_ids } = body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '请选择要删除的商品' },
        { status: 400 }
      );
    }

    // 验证所有ID都是有效数字
    const validIds = product_ids
      .map((id: string | number) => parseInt(String(id)))
      .filter((id: number) => !isNaN(id));

    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '无效的商品ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 先删除商品关联的图片
    const { error: imageDeleteError } = await client
      .from('product_images')
      .delete()
      .in('product_id', validIds);

    if (imageDeleteError) {
      console.error('批量删除商品图片失败:', imageDeleteError);
    }

    // 批量删除商品
    const { error, count } = await client
      .from('products')
      .delete()
      .in('id', validIds);

    if (error) {
      throw new Error(`批量删除商品失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `成功删除 ${count || validIds.length} 个商品`,
      deleted_count: count || validIds.length,
    });
  } catch (error: any) {
    console.error('批量删除商品失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
