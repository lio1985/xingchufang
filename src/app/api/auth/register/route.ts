import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 用户注册申请
export async function POST(request: NextRequest) {
  try {
    const { username, password, role, contact, remarks } = await request.json();
    
    // 验证必填字段
    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入用户名' },
        { status: 400 }
      );
    }
    
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 用户名格式验证
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { success: false, error: '用户名只能包含字母、数字、下划线，长度3-20位' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查用户名是否已存在于已审核用户表
    const { data: existingUser } = await client
      .from('admin_users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该用户名已被使用' },
        { status: 400 }
      );
    }

    // 检查是否有待审核的申请
    const { data: pendingRegistration } = await client
      .from('user_registrations')
      .select('id, status')
      .eq('username', username)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (pendingRegistration) {
      if (pendingRegistration.status === 'pending') {
        return NextResponse.json(
          { success: false, error: '您已提交过注册申请，请等待管理员审核' },
          { status: 400 }
        );
      } else if (pendingRegistration.status === 'approved') {
        return NextResponse.json(
          { success: false, error: '该用户名已被使用' },
          { status: 400 }
        );
      }
      // 如果是 rejected，允许重新申请
    }

    // 插入注册申请
    const { error: insertError } = await client
      .from('user_registrations')
      .insert({
        username: username.trim(),
        password_hash: password, // 生产环境应使用bcrypt加密
        role: role || 'sales',
        contact: contact?.trim() || null,
        remarks: remarks?.trim() || null,
        status: 'pending',
      });

    if (insertError) {
      console.error('注册申请失败:', insertError);
      return NextResponse.json(
        { success: false, error: '注册申请提交失败，请重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '注册申请已提交，请等待管理员审核',
    });
  } catch (error: any) {
    console.error('注册申请失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
