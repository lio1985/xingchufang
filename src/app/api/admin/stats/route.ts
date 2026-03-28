import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

// 获取统计数据
export async function GET(request: NextRequest) {
  // 验证管理员权限
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const client = getSupabaseClient();

    // 获取商品总数
    const { count: totalProducts } = await client
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 获取有图片的商品数
    const { data: productsWithImagesData } = await client
      .from('product_images')
      .select('product_id', { count: 'exact' });
    
    const uniqueProductIds = new Set(productsWithImagesData?.map(img => img.product_id) || []);
    const productsWithImages = uniqueProductIds.size;

    // 获取供应商数量
    const { data: suppliersData } = await client
      .from('products')
      .select('supplier');
    
    const uniqueSuppliers = new Set(
      suppliersData?.filter(s => s.supplier).map(s => s.supplier) || []
    );

    // 获取分类数量
    const { data: categoriesData } = await client
      .from('products')
      .select('level2_category');
    
    const uniqueCategories = new Set(
      categoriesData?.filter(c => c.level2_category).map(c => c.level2_category) || []
    );

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        productsWithImages,
        productsWithoutImages: (totalProducts || 0) - productsWithImages,
        totalSuppliers: uniqueSuppliers.size,
        totalCategories: uniqueCategories.size,
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
