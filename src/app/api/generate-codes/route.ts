import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth } from '@/lib/auth';

interface ProductCodePreview {
  id: number;
  name: string;
  supplier: string | null;
  level1_category: string | null;
  level2_category: string | null;
  current_code: string | null;
  new_code: string | null;
  status: 'ok' | 'missing_supplier_code' | 'missing_category_code' | 'no_change';
  message?: string;
}

// 获取编码预览
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplier = searchParams.get('supplier');
    const level1Category = searchParams.get('level1Category');
    const level2Category = searchParams.get('level2Category');
    const limit = parseInt(searchParams.get('limit') || '100');

    const client = getSupabaseClient();

    // 获取配置
    const { data: configData } = await client
      .from('code_config')
      .select('*');
    
    const configMap = new Map((configData || []).map(c => [c.config_key, c.config_value]));
    const sequenceLength = parseInt(configMap.get('sequence_length') || '3');
    const padChar = configMap.get('sequence_pad') || '0';

    // 获取供应商代码映射
    const { data: supplierCodes } = await client
      .from('supplier_codes')
      .select('*');
    const supplierCodeMap = new Map((supplierCodes || []).map(s => [s.supplier_name, s.supplier_code]));

    // 获取分类编码映射
    const { data: categoryCodes } = await client
      .from('category_codes')
      .select('*');

    // 构建分类编码查找函数
    const findCategoryCode = (level1: string | null, level2: string | null): string | null => {
      if (!categoryCodes) return null;
      
      // 先精确匹配
      const exact = categoryCodes.find(c => 
        c.level1_category === level1 && c.level2_category === level2
      );
      if (exact) return exact.category_code;

      // 再匹配一级分类
      const level1Match = categoryCodes.find(c => 
        c.level1_category === level1 && !c.level2_category
      );
      if (level1Match) return level1Match.category_code;

      return null;
    };

    // 查询商品
    let query = client
      .from('products')
      .select('id, name, supplier, level1_category, level2_category, product_code')
      .order('id');

    if (supplier) {
      query = query.eq('supplier', supplier);
    }
    if (level1Category) {
      query = query.eq('level1_category', level1Category);
    }
    if (level2Category) {
      query = query.eq('level2_category', level2Category);
    }

    const { data: products, error } = await query.limit(limit);

    if (error) throw new Error(`查询商品失败: ${error.message}`);

    // 计算每个供应商+分类组合的当前最大序号
    const maxSequenceMap = new Map<string, number>();

    // 先查询所有现有编码的最大序号
    const { data: existingCodes } = await client
      .from('products')
      .select('product_code, supplier, level1_category, level2_category')
      .not('product_code', 'is', null);

    (existingCodes || []).forEach((p: any) => {
      if (!p.product_code) return;
      const parts = p.product_code.split('-');
      if (parts.length >= 3) {
        const key = `${p.supplier || ''}-${p.level1_category || ''}-${p.level2_category || ''}`;
        const seq = parseInt(parts[parts.length - 1]) || 0;
        const currentMax = maxSequenceMap.get(key) || 0;
        if (seq > currentMax) {
          maxSequenceMap.set(key, seq);
        }
      }
    });

    // 生成预览
    const previews: ProductCodePreview[] = [];
    const sequenceCounters = new Map<string, number>();

    for (const product of products || []) {
      const supplierCode = product.supplier ? supplierCodeMap.get(product.supplier) : null;
      const categoryCode = findCategoryCode(product.level1_category, product.level2_category);

      const key = `${product.supplier || ''}-${product.level1_category || ''}-${product.level2_category || ''}`;

      if (!supplierCode) {
        previews.push({
          id: product.id,
          name: product.name,
          supplier: product.supplier,
          level1_category: product.level1_category,
          level2_category: product.level2_category,
          current_code: product.product_code,
          new_code: null,
          status: 'missing_supplier_code',
          message: `供应商"${product.supplier}"未配置代码`,
        });
        continue;
      }

      if (!categoryCode) {
        previews.push({
          id: product.id,
          name: product.name,
          supplier: product.supplier,
          level1_category: product.level1_category,
          level2_category: product.level2_category,
          current_code: product.product_code,
          new_code: null,
          status: 'missing_category_code',
          message: `分类"${product.level1_category}/${product.level2_category}"未配置编码`,
        });
        continue;
      }

      // 计算序号
      if (!sequenceCounters.has(key)) {
        sequenceCounters.set(key, (maxSequenceMap.get(key) || 0) + 1);
      } else {
        sequenceCounters.set(key, sequenceCounters.get(key)! + 1);
      }

      const sequence = sequenceCounters.get(key)!;
      const paddedSeq = sequence.toString().padStart(sequenceLength, padChar);
      const newCode = `${supplierCode}-${categoryCode}-${paddedSeq}`;

      // 检查是否有变化
      if (product.product_code === newCode) {
        previews.push({
          id: product.id,
          name: product.name,
          supplier: product.supplier,
          level1_category: product.level1_category,
          level2_category: product.level2_category,
          current_code: product.product_code,
          new_code: newCode,
          status: 'no_change',
        });
      } else {
        previews.push({
          id: product.id,
          name: product.name,
          supplier: product.supplier,
          level1_category: product.level1_category,
          level2_category: product.level2_category,
          current_code: product.product_code,
          new_code: newCode,
          status: 'ok',
        });
      }
    }

    // 统计信息
    const stats = {
      total: previews.length,
      ok: previews.filter(p => p.status === 'ok').length,
      noChange: previews.filter(p => p.status === 'no_change').length,
      missingSupplier: previews.filter(p => p.status === 'missing_supplier_code').length,
      missingCategory: previews.filter(p => p.status === 'missing_category_code').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        previews,
        stats,
      },
    });
  } catch (error: any) {
    console.error('生成编码预览失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 执行编码生成
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || auth.user?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: '需要管理员权限' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { productIds, supplier, level1Category, level2Category } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '请选择要生成编码的商品' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取配置
    const { data: configData } = await client
      .from('code_config')
      .select('*');
    
    const configMap = new Map((configData || []).map(c => [c.config_key, c.config_value]));
    const sequenceLength = parseInt(configMap.get('sequence_length') || '3');
    const padChar = configMap.get('sequence_pad') || '0';

    // 获取供应商代码映射
    const { data: supplierCodes } = await client
      .from('supplier_codes')
      .select('*');
    const supplierCodeMap = new Map((supplierCodes || []).map(s => [s.supplier_name, s.supplier_code]));

    // 获取分类编码映射
    const { data: categoryCodes } = await client
      .from('category_codes')
      .select('*');

    const findCategoryCode = (level1: string | null, level2: string | null): string | null => {
      if (!categoryCodes) return null;
      const exact = categoryCodes.find(c => 
        c.level1_category === level1 && c.level2_category === level2
      );
      if (exact) return exact.category_code;
      const level1Match = categoryCodes.find(c => 
        c.level1_category === level1 && !c.level2_category
      );
      if (level1Match) return level1Match.category_code;
      return null;
    };

    // 查询选定商品
    const { data: products, error } = await client
      .from('products')
      .select('id, name, supplier, level1_category, level2_category, product_code')
      .in('id', productIds);

    if (error) throw new Error(`查询商品失败: ${error.message}`);

    // 计算每个组合的最大序号
    const maxSequenceMap = new Map<string, number>();
    const { data: existingCodes } = await client
      .from('products')
      .select('product_code, supplier, level1_category, level2_category')
      .not('product_code', 'is', null);

    (existingCodes || []).forEach((p: any) => {
      if (!p.product_code) return;
      const parts = p.product_code.split('-');
      if (parts.length >= 3) {
        const key = `${p.supplier || ''}-${p.level1_category || ''}-${p.level2_category || ''}`;
        const seq = parseInt(parts[parts.length - 1]) || 0;
        const currentMax = maxSequenceMap.get(key) || 0;
        if (seq > currentMax) {
          maxSequenceMap.set(key, seq);
        }
      }
    });

    // 按供应商+分类分组
    const groupedProducts = new Map<string, typeof products>();
    (products || []).forEach(p => {
      const key = `${p.supplier || ''}-${p.level1_category || ''}-${p.level2_category || ''}`;
      if (!groupedProducts.has(key)) {
        groupedProducts.set(key, []);
      }
      groupedProducts.get(key)!.push(p);
    });

    // 更新编码
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const [key, prods] of groupedProducts) {
      const first = prods[0];
      const supplierCode = first.supplier ? supplierCodeMap.get(first.supplier) : null;
      const categoryCode = findCategoryCode(first.level1_category, first.level2_category);

      if (!supplierCode || !categoryCode) {
        skippedCount += prods.length;
        continue;
      }

      let sequence = maxSequenceMap.get(key) || 0;

      for (const product of prods) {
        sequence++;
        const paddedSeq = sequence.toString().padStart(sequenceLength, padChar);
        const newCode = `${supplierCode}-${categoryCode}-${paddedSeq}`;

        const { error: updateError } = await client
          .from('products')
          .update({ 
            product_code: newCode,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);

        if (updateError) {
          errors.push(`商品 ${product.name} 更新失败: ${updateError.message}`);
        } else {
          updatedCount++;
        }
      }

      // 更新最大序号
      maxSequenceMap.set(key, sequence);
    }

    return NextResponse.json({
      success: true,
      data: {
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `成功更新 ${updatedCount} 个商品编码${skippedCount > 0 ? `，跳过 ${skippedCount} 个` : ''}`,
    });
  } catch (error: any) {
    console.error('生成编码失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
