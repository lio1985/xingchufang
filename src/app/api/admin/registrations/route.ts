import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 获取注册申请列表
export async function GET(request: NextRequest) {
  // 验证管理员权限
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const client = getSupabaseClient();

    let query = client
      .from('user_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`查询注册申请失败: ${error.message}`);
    }

    // 隐藏密码
    const registrations = (data || []).map(reg => ({
      ...reg,
      password_hash: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: registrations,
    });
  } catch (error: any) {
    console.error('获取注册申请失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
