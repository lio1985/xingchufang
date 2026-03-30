import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requireAuth } from '@/lib/auth';

// 导出收藏清单为CSV
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const client = getSupabaseClient();
    
    // 获取用户ID
    let userId = auth.user?.id;
    if (!userId && auth.user?.username) {
      const { data: userData } = await client
        .from('admin_users')
        .select('id')
        .eq('username', auth.user.username)
        .single();
      userId = userData?.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 400 });
    }

    // 获取收藏列表
    const { data, error } = await client
      .from('favorites')
      .select(`
        created_at,
        products (
          id,
          name,
          brand,
          spec,
          params,
          price,
          supplier,
          level1_category,
          level2_category,
          product_code,
          origin,
          warranty,
          selling_points,
          remarks
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`获取收藏列表失败: ${error.message}`);

    // 构建CSV内容
    const headers = [
      '序号',
      '商品编码',
      '商品名称',
      '品牌',
      '规格',
      '参数',
      '价格',
      '供应商',
      '一级分类',
      '二级分类',
      '产地',
      '质保',
      '产品优势',
      '备注',
      '收藏时间',
    ];

    const rows = (data || []).map((fav: any, index: number) => {
      const p = fav.products;
      return [
        index + 1,
        p?.product_code || '',
        p?.name || '',
        p?.brand || '',
        p?.spec || '',
        p?.params || '',
        p?.price || '',
        p?.supplier || '',
        p?.level1_category || '',
        p?.level2_category || '',
        p?.origin || '',
        p?.warranty || '',
        p?.selling_points || '',
        p?.remarks || '',
        new Date(fav.created_at).toLocaleString('zh-CN'),
      ];
    });

    // 转义CSV字段（处理包含逗号、引号、换行的情况）
    const escapeCSV = (field: any) => {
      const str = String(field || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\n');

    // 添加BOM以支持中文
    const bom = '\uFEFF';
    const csvBuffer = Buffer.from(bom + csvContent, 'utf-8');

    // 对文件名进行 URL 编码以支持中文
    const filename = `选品清单_${new Date().toISOString().split('T')[0]}.csv`;
    const encodedFilename = encodeURIComponent(filename);

    // 返回CSV文件
    return new NextResponse(csvBuffer, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error: any) {
    console.error('导出收藏清单失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
