import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 删除单个商品
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
    const productId = parseInt(id);

    if (isNaN(productId)) {
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
      .eq('product_id', productId);

    if (imageDeleteError) {
      console.error('删除商品图片失败:', imageDeleteError);
    }

    // 删除商品
    const { error, count } = await client
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw new Error(`删除商品失败: ${error.message}`);
    }

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '商品删除成功',
    });
  } catch (error: any) {
    console.error('删除商品失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 更新商品
export async function PUT(
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
    const productId = parseInt(id);
    const body = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: '无效的商品ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 构建更新数据
    const updateData: Record<string, string | null> = {};
    
    const fields = [
      'product_code', 'name', 'brand', 'spec', 'params', 'price',
      'supplier', 'level1_category', 'level2_category', 'origin',
      'warranty', 'selling_points', 'remarks'
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]?.trim() || null;
      }
    });

    // 验证必填字段
    if (updateData.name === '') {
      return NextResponse.json(
        { success: false, error: '商品名称不能为空' },
        { status: 400 }
      );
    }

    // 更新商品
    const { data, error } = await client
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`更新商品失败: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: '商品更新成功',
    });
  } catch (error: any) {
    console.error('更新商品失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
