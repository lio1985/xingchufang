import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth } from '@/lib/auth';

// 批量检查商品是否已收藏
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: true, data: {} });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('productIds');

    if (!productIds) {
      return NextResponse.json({ success: true, data: {} });
    }

    const ids = productIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const client = getSupabaseClient();
    
    // 获取用户ID
    let userId = auth.user?.id;
    if (!userId && auth.user?.username) {
      const { data: userData } = await client
        .from('admin_users')
        .select('id')
        .eq('username', auth.user.username)
        .single();
      userId = userData?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: true, data: {} });
    }

    // 查询已收藏的商品
    const { data, error } = await client
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId)
      .in('product_id', ids);

    if (error) throw new Error(`查询收藏状态失败: ${error.message}`);

    // 构建结果映射
    const result: Record<number, boolean> = {};
    ids.forEach(id => {
      result[id] = false;
    });
    (data || []).forEach((fav: any) => {
      result[fav.product_id] = true;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('查询收藏状态失败:', error);
    return NextResponse.json({ success: true, data: {} });
  }
}
