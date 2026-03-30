import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 获取用户列表
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('admin_users')
      .select('id, username, role, status, created_at, updated_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`查询用户失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 更新用户状态
export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const { id, status, role } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 不允许修改 admin 账号的状态
    const { data: targetUser } = await client
      .from('admin_users')
      .select('username, role')
      .eq('id', id)
      .single();

    if (targetUser?.username === 'admin') {
      return NextResponse.json(
        { success: false, error: '不能修改超级管理员账号' },
        { status: 403 }
      );
    }

    // 构建更新对象
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const { error } = await client
      .from('admin_users')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`更新用户失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '用户信息已更新',
    });
  } catch (error: any) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 不允许删除 admin 账号
    const { data: targetUser } = await client
      .from('admin_users')
      .select('username')
      .eq('id', id)
      .single();

    if (targetUser?.username === 'admin') {
      return NextResponse.json(
        { success: false, error: '不能删除超级管理员账号' },
        { status: 403 }
      );
    }

    const { error } = await client
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`删除用户失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '用户已删除',
    });
  } catch (error: any) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
