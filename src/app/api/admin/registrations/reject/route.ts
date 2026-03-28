import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 拒绝注册申请
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { registrationId, reason } = await request.json();

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

    // 更新注册申请状态为拒绝
    const { error: updateError } = await client
      .from('user_registrations')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user!.username,
        remarks: reason ? `${registration.remarks || ''}\n拒绝原因: ${reason}`.trim() : registration.remarks,
      })
      .eq('id', registrationId);

    if (updateError) {
      console.error('更新申请状态失败:', updateError);
      return NextResponse.json(
        { success: false, error: '操作失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `已拒绝用户 ${registration.username} 的注册申请`,
    });
  } catch (error: any) {
    console.error('操作失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
