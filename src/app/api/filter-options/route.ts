import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取筛选选项（供应商、分类等）
export async function GET() {
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

    return NextResponse.json({
      success: true,
      data: {
        suppliers: [...new Set(suppliers?.map((s) => s.supplier) || [])].sort(),
        level1Categories: [...new Set(level1Categories?.map((c) => c.level1_category) || [])].sort(),
        level2Categories: [...new Set(level2Categories?.map((c) => c.level2_category) || [])].sort(),
      },
    });
  } catch (error: any) {
    console.error('获取筛选选项失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
