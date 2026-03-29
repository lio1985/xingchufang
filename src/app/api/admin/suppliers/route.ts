import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

// 获取供应商列表
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    let query = client
      .from('suppliers')
      .select('*')
      .order('name');

    if (keyword) {
      query = query.ilike('name', `%${keyword}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(`获取供应商列表失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('获取供应商列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 新增供应商
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, contact_person, phone, address, remarks } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '供应商名称不能为空' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('suppliers')
      .insert({
        name: name.trim(),
        contact_person: contact_person?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        remarks: remarks?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: '供应商名称已存在' },
          { status: 400 }
        );
      }
      throw new Error(`新增供应商失败: ${error.message}`);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('新增供应商失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 更新供应商
export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, name, contact_person, phone, address, remarks } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少供应商ID' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: '供应商名称不能为空' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('suppliers')
      .update({
        name: name.trim(),
        contact_person: contact_person?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        remarks: remarks?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: '供应商名称已存在' },
          { status: 400 }
        );
      }
      throw new Error(`更新供应商失败: ${error.message}`);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('更新供应商失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 删除供应商
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少供应商ID' },
        { status: 400 }
      );
    }

    // 检查是否有商品使用此供应商
    const { data: products, error: checkError } = await client
      .from('products')
      .select('id')
      .eq('supplier', (
        client.from('suppliers').select('name').eq('id', id).single()
      ))
      .limit(1);

    // 简单检查：先获取供应商名称
    const { data: supplier } = await client
      .from('suppliers')
      .select('name')
      .eq('id', parseInt(id))
      .single();

    if (supplier) {
      const { count } = await client
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('supplier', supplier.name);

      if (count && count > 0) {
        return NextResponse.json(
          { success: false, error: `该供应商下有 ${count} 个商品，无法删除` },
          { status: 400 }
        );
      }
    }

    const { error } = await client
      .from('suppliers')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw new Error(`删除供应商失败: ${error.message}`);

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    console.error('删除供应商失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
