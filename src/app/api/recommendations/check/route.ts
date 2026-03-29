import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 批量检查商品的推荐状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIdsStr = searchParams.get('productIds');

    if (!productIdsStr) {
      return NextResponse.json(
        { success: false, error: '缺少商品ID' },
        { status: 400 }
      );
    }

    const productIds = productIdsStr.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));

    if (productIds.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const client = getSupabaseClient();

    // 查询这些商品的推荐状态
    const { data, error } = await client
      .from('product_recommendations')
      .select('product_id, recommend_type')
      .in('product_id', productIds);

    if (error) throw new Error(`查询推荐状态失败: ${error.message}`);

    // 构建返回结构: { productId: { hot: true, new: false, ... } }
    const result: Record<number, Record<string, boolean>> = {};
    
    // 初始化所有商品
    productIds.forEach(id => {
      result[id] = { hot: false, new: false, sale: false, featured: false };
    });

    // 填充推荐状态
    (data || []).forEach((item: any) => {
      if (result[item.product_id]) {
        result[item.product_id][item.recommend_type] = true;
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('检查推荐状态失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
