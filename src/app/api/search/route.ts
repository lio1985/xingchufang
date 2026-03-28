import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 高级搜索（使用全文搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const supplier = searchParams.get('supplier');
    const level1Category = searchParams.get('level1Category');
    const level2Category = searchParams.get('level2Category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const client = getSupabaseClient();

    // 使用 RPC 调用全文搜索函数
    const { data, error } = await client.rpc('search_products', {
      search_query: keyword,
      filter_supplier: supplier || null,
      filter_level1: level1Category || null,
      filter_level2: level2Category || null,
      page_size: pageSize,
      page_offset: (page - 1) * pageSize,
    });

    if (error) {
      // 如果全文搜索失败，回退到普通搜索
      console.warn('全文搜索失败，回退到普通搜索:', error.message);
      return fallbackSearch(request);
    }

    // 提取总数
    const total = data && data.length > 0 ? data[0].total_count : 0;

    return NextResponse.json({
      success: true,
      data: {
        products: data || [],
        total: total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('搜索失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 回退搜索（使用普通 ILIKE）
async function fallbackSearch(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const supplier = searchParams.get('supplier');
  const level1Category = searchParams.get('level1Category');
  const level2Category = searchParams.get('level2Category');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const client = getSupabaseClient();
  
  let query = client
    .from('products')
    .select('*', { count: 'exact' });

  if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%,spec.ilike.%${keyword}%`);
  }

  if (supplier) {
    query = query.eq('supplier', supplier);
  }

  if (level1Category) {
    query = query.eq('level1_category', level1Category);
  }

  if (level2Category) {
    query = query.eq('level2_category', level2Category);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await query
    .order('id')
    .range(from, to);

  if (error) throw new Error(`查询商品失败: ${error.message}`);

  return NextResponse.json({
    success: true,
    data: {
      products: data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  });
}
