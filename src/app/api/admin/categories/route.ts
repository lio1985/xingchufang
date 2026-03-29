import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

// 获取分类列表
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level'); // 1 或 2

    let query = client
      .from('categories')
      .select(`
        *,
        parent:categories!parent_id(id, name)
      `)
      .order('level')
      .order('sort_order')
      .order('name');

    if (level) {
      query = query.eq('level', parseInt(level));
    }

    const { data, error } = await query;

    if (error) throw new Error(`获取分类列表失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 新增分类
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, level, parent_id, sort_order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '分类名称不能为空' },
        { status: 400 }
      );
    }

    if (!level || ![1, 2].includes(level)) {
      return NextResponse.json(
        { success: false, error: '分类级别必须为1或2' },
        { status: 400 }
      );
    }

    // 二级分类必须有父分类
    if (level === 2 && !parent_id) {
      return NextResponse.json(
        { success: false, error: '二级分类必须指定父分类' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('categories')
      .insert({
        name: name.trim(),
        level,
        parent_id: level === 2 ? parent_id : null,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: '该分类已存在' },
          { status: 400 }
        );
      }
      throw new Error(`新增分类失败: ${error.message}`);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('新增分类失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 更新分类
export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, name, parent_id, sort_order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少分类ID' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '分类名称不能为空' },
        { status: 400 }
      );
    }

    // 获取原分类信息
    const { data: existingCategory } = await client
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      );
    }

    const { data, error } = await client
      .from('categories')
      .update({
        name: name.trim(),
        parent_id: existingCategory.level === 2 ? parent_id : null,
        sort_order: sort_order ?? existingCategory.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: '该分类名称已存在' },
          { status: 400 }
        );
      }
      throw new Error(`更新分类失败: ${error.message}`);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('更新分类失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除分类
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少分类ID' },
        { status: 400 }
      );
    }

    // 获取分类信息
    const { data: category } = await client
      .from('categories')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (!category) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      );
    }

    // 如果是一级分类，检查是否有二级分类
    if (category.level === 1) {
      const { count } = await client
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', parseInt(id));

      if (count && count > 0) {
        return NextResponse.json(
          { success: false, error: `该分类下有 ${count} 个子分类，请先删除子分类` },
          { status: 400 }
        );
      }
    }

    // 检查是否有商品使用此分类
    const categoryField = category.level === 1 ? 'level1_category' : 'level2_category';
    const { count: productCount } = await client
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq(categoryField, category.name);

    if (productCount && productCount > 0) {
      return NextResponse.json(
        { success: false, error: `该分类下有 ${productCount} 个商品，无法删除` },
        { status: 400 }
      );
    }

    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw new Error(`删除分类失败: ${error.message}`);

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    console.error('删除分类失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
