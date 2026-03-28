import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取商品列表（支持搜索和筛选）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const supplier = searchParams.get('supplier');
    const level1Category = searchParams.get('level1Category');
    const level2Category = searchParams.get('level2Category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const client = getSupabaseClient();
    
    // 构建查询
    let query = client
      .from('products')
      .select('*', { count: 'exact' });

    // 关键词搜索（搜索名称、品牌、规格）
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%,spec.ilike.%${keyword}%`);
    }

    // 供应商筛选
    if (supplier) {
      query = query.eq('supplier', supplier);
    }

    // 一级分类筛选
    if (level1Category) {
      query = query.eq('level1_category', level1Category);
    }

    // 二级分类筛选
    if (level2Category) {
      query = query.eq('level2_category', level2Category);
    }

    // 分页
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
  } catch (error: any) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 获取筛选选项（供应商、分类等）
export async function getFilterOptions() {
  try {
    const client = getSupabaseClient();

    // 获取所有供应商
    const { data: suppliers } = await client
      .from('products')
      .select('supplier')
      .not('supplier', 'is', null);

    // 获取所有一级分类
    const { data: level1Categories } = await client
      .from('products')
      .select('level1_category')
      .not('level1_category', 'is', null);

    // 获取所有二级分类
    const { data: level2Categories } = await client
      .from('products')
      .select('level2_category')
      .not('level2_category', 'is', null);

    return {
      suppliers: [...new Set(suppliers?.map((s) => s.supplier) || [])],
      level1Categories: [...new Set(level1Categories?.map((c) => c.level1_category) || [])],
      level2Categories: [...new Set(level2Categories?.map((c) => c.level2_category) || [])],
    };
  } catch (error: any) {
    console.error('获取筛选选项失败:', error);
    return {
      suppliers: [],
      level1Categories: [],
      level2Categories: [],
    };
  }
}
