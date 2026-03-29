import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import * as XLSX from 'xlsx';

// 导出商品数据为 Excel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const supplier = searchParams.get('supplier');
    const level1Category = searchParams.get('level1Category');
    const level2Category = searchParams.get('level2Category');

    const client = getSupabaseClient();
    
    // 构建查询
    let query = client.from('products').select('*');

    // 关键词搜索
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%,spec.ilike.%${keyword}%,supplier.ilike.%${keyword}%`);
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

    // 获取所有数据（不限制条数）
    const { data, error } = await query.order('id');

    if (error) throw new Error(`查询商品失败: ${error.message}`);

    // 转换为 Excel 格式
    const excelData = (data || []).map((product) => ({
      '商品编码': product.product_code || '',
      '一级分类': product.level1_category || '',
      '二级分类': product.level2_category || '',
      '商品名称': product.name || '',
      '品牌': product.brand || '',
      '规格': product.spec || '',
      '参数': product.params || '',
      '价格': product.price || '',
      '供应商': product.supplier || '',
      '产地': product.origin || '',
      '质保': product.warranty || '',
      '产品优势/卖点': product.selling_points || '',
      '备注': product.remarks || '',
    }));

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 设置列宽
    worksheet['!cols'] = [
      { wch: 15 }, // 商品编码
      { wch: 15 }, // 一级分类
      { wch: 15 }, // 二级分类
      { wch: 30 }, // 商品名称
      { wch: 10 }, // 品牌
      { wch: 15 }, // 规格
      { wch: 30 }, // 参数
      { wch: 10 }, // 价格
      { wch: 15 }, // 供应商
      { wch: 10 }, // 产地
      { wch: 10 }, // 质保
      { wch: 30 }, // 产品优势/卖点
      { wch: 20 }, // 备注
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, '商品数据');

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 编码文件名
    const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    // 返回文件
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error: any) {
    console.error('导出失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
