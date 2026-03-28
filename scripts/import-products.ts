import * as XLSX from 'xlsx';
import { getSupabaseClient } from '../src/storage/database/supabase-client';

interface ProductRow {
  [key: string]: any;
}

async function importProducts() {
  console.log('开始导入商品数据...');
  
  // 读取 Excel 文件
  const workbook = XLSX.readFile('/tmp/product.xlsx');
  const sheetName = '商品总表';
  const sheet = workbook.Sheets[sheetName];
  
  // 转换为 JSON
  const data = XLSX.utils.sheet_to_json<ProductRow>(sheet);
  console.log(`共读取 ${data.length} 条商品数据`);
  
  // 转换为数据库格式
  const products = data.map((row) => ({
    category_code: row['分类编码'] || null,
    level1_code: row['一级编码'] || null,
    level1_category: row['一级分类'] || null,
    level2_code: row['二级编码'] || null,
    level2_category: row['二级分类'] || null,
    name: row['名称'] || '',
    brand: row['品牌'] || null,
    spec: row['规格'] || null,
    params: row['参数'] || null,
    price: row['价格'] ? String(row['价格']) : null,
    supplier: row['供应商'] || null,
    product_code: row['货号'] || null,
    origin: row['产地'] || null,
    warranty: row['质保'] || null,
    selling_points: row['产品优势/卖点'] || null,
    remarks: row['备注'] || null,
  }));
  
  // 批量插入（每次500条）
  const client = getSupabaseClient();
  const batchSize = 500;
  let inserted = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await client.from('products').insert(batch);
    
    if (error) {
      console.error(`插入失败 (批次 ${Math.floor(i / batchSize) + 1}):`, error.message);
      throw error;
    }
    
    inserted += batch.length;
    console.log(`已插入 ${inserted}/${products.length} 条数据`);
  }
  
  console.log(`✅ 导入完成！共导入 ${inserted} 条商品数据`);
}

// 执行导入
importProducts().catch((err) => {
  console.error('导入失败:', err);
  process.exit(1);
});
