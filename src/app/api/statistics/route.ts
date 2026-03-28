import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取统计数据
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取商品总数
    const { count: totalProducts } = await client
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 获取供应商统计
    const { data: supplierStats } = await client
      .from('products')
      .select('supplier')
      .not('supplier', 'is', null);

    const supplierCount: Record<string, number> = {};
    (supplierStats || []).forEach((item) => {
      if (item.supplier) {
        supplierCount[item.supplier] = (supplierCount[item.supplier] || 0) + 1;
      }
    });

    const topSuppliers = Object.entries(supplierCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 获取一级分类统计
    const { data: level1Stats } = await client
      .from('products')
      .select('level1_category')
      .not('level1_category', 'is', null);

    const level1Count: Record<string, number> = {};
    (level1Stats || []).forEach((item) => {
      if (item.level1_category) {
        level1Count[item.level1_category] = (level1Count[item.level1_category] || 0) + 1;
      }
    });

    const categoryStats = Object.entries(level1Count)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // 获取二级分类统计（前10）
    const { data: level2Stats } = await client
      .from('products')
      .select('level2_category')
      .not('level2_category', 'is', null);

    const level2Count: Record<string, number> = {};
    (level2Stats || []).forEach((item) => {
      if (item.level2_category) {
        level2Count[item.level2_category] = (level2Count[item.level2_category] || 0) + 1;
      }
    });

    const subCategoryStats = Object.entries(level2Count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 获取图片统计
    const { count: totalImages } = await client
      .from('product_images')
      .select('*', { count: 'exact', head: true });

    const { count: productsWithImages } = await client
      .from('products')
      .select('id', { count: 'exact' })
      .not('id', 'is', null);

    // 价格分布（将价格转换为数字）
    const { data: priceData } = await client
      .from('products')
      .select('price')
      .not('price', 'is', null);

    const prices = (priceData || [])
      .map((item) => parseFloat(item.price || '0'))
      .filter((p) => !isNaN(p) && p > 0);

    const priceRanges = [
      { label: '0-500', min: 0, max: 500, count: 0 },
      { label: '500-1000', min: 500, max: 1000, count: 0 },
      { label: '1000-2000', min: 1000, max: 2000, count: 0 },
      { label: '2000-5000', min: 2000, max: 5000, count: 0 },
      { label: '5000-10000', min: 5000, max: 10000, count: 0 },
      { label: '10000+', min: 10000, max: Infinity, count: 0 },
    ];

    prices.forEach((price) => {
      for (const range of priceRanges) {
        if (price >= range.min && price < range.max) {
          range.count++;
          break;
        }
      }
    });

    const priceStats = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      avg: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
      ranges: priceRanges,
    };

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        totalImages: totalImages || 0,
        productsWithImages: productsWithImages || 0,
        topSuppliers,
        categoryStats,
        subCategoryStats,
        priceStats,
      },
    });
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
