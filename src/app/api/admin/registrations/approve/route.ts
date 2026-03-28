import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 审核通过注册申请
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: '缺少注册申请ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取注册申请信息
    const { data: registration, error: fetchError } = await client
      .from('user_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { success: false, error: '注册申请不存在' },
        { status: 404 }
      );
    }

    if (registration.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '该申请已被处理' },
        { status: 400 }
      );
    }

    // 检查用户名是否已被占用
    const { data: existingUser } = await client
      .from('admin_users')
      .select('username')
      .eq('username', registration.username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该用户名已被占用' },
        { status: 400 }
      );
    }

    // 创建用户
    const { error: insertError } = await client
      .from('admin_users')
      .insert({
        username: registration.username,
        password_hash: registration.password_hash,
        role: registration.role,
      });

    if (insertError) {
      console.error('创建用户失败:', insertError);
      return NextResponse.json(
        { success: false, error: '创建用户失败' },
        { status: 500 }
      );
    }

    // 更新注册申请状态
    const { error: updateError } = await client
      .from('user_registrations')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user!.username,
      })
      .eq('id', registrationId);

    if (updateError) {
      console.error('更新申请状态失败:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: `用户 ${registration.username} 已审核通过`,
    });
  } catch (error: any) {
    console.error('审核失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
