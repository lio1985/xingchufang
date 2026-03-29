import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth } from '@/lib/auth';

// 获取所有编码配置
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // suppliers | categories | config | all

    const result: any = {};

    if (type === 'suppliers' || type === 'all' || !type) {
      const { data: suppliers, error: supplierError } = await client
        .from('supplier_codes')
        .select('*')
        .order('supplier_name');

      if (supplierError) throw new Error(`获取供应商代码失败: ${supplierError.message}`);
      result.suppliers = suppliers;
    }

    if (type === 'categories' || type === 'all' || !type) {
      const { data: categories, error: categoryError } = await client
        .from('category_codes')
        .select('*')
        .order('category_code');

      if (categoryError) throw new Error(`获取分类编码失败: ${categoryError.message}`);
      result.categories = categories;
    }

    if (type === 'config' || type === 'all' || !type) {
      const { data: config, error: configError } = await client
        .from('code_config')
        .select('*');

      if (configError) throw new Error(`获取配置失败: ${configError.message}`);
      result.config = config;
    }

    // 获取未配置代码的供应商列表
    if (type === 'missing-suppliers' || type === 'all') {
      const { data: missingSuppliers, error: missingError } = await client
        .from('products')
        .select('supplier')
        .is('supplier', 'not.null')
        .not('supplier', 'eq', '')
        .order('supplier');

      if (!missingError && missingSuppliers) {
        // 获取已配置的供应商
        const { data: existingCodes } = await client
          .from('supplier_codes')
          .select('supplier_name');

        const existingSet = new Set((existingCodes || []).map(s => s.supplier_name));
        const allSuppliers = [...new Set(missingSuppliers.map(s => s.supplier))];
        result.missingSupplierCodes = allSuppliers.filter(s => !existingSet.has(s!));
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('获取编码配置失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 添加或更新供应商代码
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
    const { type, data } = body;

    const client = getSupabaseClient();

    if (type === 'supplier') {
      // 添加或更新供应商代码
      const { supplierName, supplierCode, description } = data;

      if (!supplierName || !supplierCode) {
        return NextResponse.json(
          { success: false, error: '供应商名称和代码不能为空' },
          { status: 400 }
        );
      }

      const { data: result, error } = await client
        .from('supplier_codes')
        .upsert({
          supplier_name: supplierName,
          supplier_code: supplierCode.toUpperCase(),
          description: description || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'supplier_name' })
        .select()
        .single();

      if (error) throw new Error(`保存供应商代码失败: ${error.message}`);

      return NextResponse.json({ success: true, data: result });
    }

    if (type === 'category') {
      // 添加或更新分类编码
      const { level1Category, level2Category, categoryCode, description } = data;

      if (!categoryCode) {
        return NextResponse.json(
          { success: false, error: '分类编码不能为空' },
          { status: 400 }
        );
      }

      const { data: result, error } = await client
        .from('category_codes')
        .upsert({
          level1_category: level1Category || null,
          level2_category: level2Category || null,
          category_code: categoryCode,
          description: description || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'level1_category,level2_category,category_code' })
        .select()
        .single();

      if (error) throw new Error(`保存分类编码失败: ${error.message}`);

      return NextResponse.json({ success: true, data: result });
    }

    if (type === 'config') {
      // 更新配置
      const { key, value, description } = data;

      if (!key || !value) {
        return NextResponse.json(
          { success: false, error: '配置键和值不能为空' },
          { status: 400 }
        );
      }

      const { data: result, error } = await client
        .from('code_config')
        .upsert({
          config_key: key,
          config_value: value,
          description: description || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'config_key' })
        .select()
        .single();

      if (error) throw new Error(`保存配置失败: ${error.message}`);

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: '未知的操作类型' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('保存编码配置失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除配置
export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized || auth.user?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: '需要管理员权限' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    let error;

    if (type === 'supplier') {
      const result = await client.from('supplier_codes').delete().eq('id', parseInt(id));
      error = result.error;
    } else if (type === 'category') {
      const result = await client.from('category_codes').delete().eq('id', parseInt(id));
      error = result.error;
    } else {
      return NextResponse.json(
        { success: false, error: '未知的删除类型' },
        { status: 400 }
      );
    }

    if (error) throw new Error(`删除失败: ${error.message}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除配置失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
