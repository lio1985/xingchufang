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

    // 查询推荐状态
    const { data: recommendations } = await client
      .from('product_recommendations')
      .select('recommend_type, start_date, end_date')
      .eq('product_id', productId);

    // 处理推荐状态，过滤过期推荐
    const now = new Date().toISOString();
    const activeRecommendations = (recommendations || []).filter((rec: any) => {
      if (rec.start_date && rec.start_date > now) return false;
      if (rec.end_date && rec.end_date < now) return false;
      return true;
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        recommend_types: activeRecommendations.map((r: any) => r.recommend_type),
      }
    });
  } catch (error: any) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
