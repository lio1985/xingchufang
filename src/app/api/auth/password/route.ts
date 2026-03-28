import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 修改密码（支持已登录用户和未登录用户）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, oldPassword, newPassword } = body;
    
    // 验证必填字段
    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '请填写完整信息' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '新密码长度不能少于6位' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 验证用户名和旧密码
    const { data: user, error: fetchError } = await client
      .from('admin_users')
      .select('username, password_hash, role')
      .eq('username', username)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 400 }
      );
    }

    // 验证旧密码（当前使用明文比较，生产环境应使用bcrypt）
    if (user.password_hash !== oldPassword) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 400 }
      );
    }

    // 更新密码
    const { error: updateError } = await client
      .from('admin_users')
      .update({ password_hash: newPassword })
      .eq('username', username);

    if (updateError) {
      console.error('更新密码失败:', updateError);
      return NextResponse.json(
        { success: false, error: '修改密码失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error: any) {
    console.error('修改密码失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
