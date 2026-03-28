import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个商品详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw new Error(`查询商品失败: ${error.message}`);
    if (!data) throw new Error('商品不存在');

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
