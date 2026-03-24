/**
 * 检查回收管理数据表是否存在
 * 用法: node server/scripts/check-recycle-tables.js
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFiles = ['.env.local', '.env.development', '.env'];
  for (const file of envFiles) {
    const envPath = path.join(__dirname, '../../', file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          if (value.startsWith("'") && value.endsWith("'") ||
              value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      });
      console.log(`✅ 已加载环境变量: ${file}`);
      break;
    }
  }
}

async function checkTables() {
  try {
    loadEnv();

    const SUPABASE_URL = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ 错误: 缺少 Supabase 环境变量');
      console.error('请确保 .env.local 文件中配置了 COZE_SUPABASE_URL 和 COZE_SUPABASE_ANON_KEY');
      process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('🔍 正在检查数据表...\n');

    // 检查 recycle_stores 表
    console.log('检查 recycle_stores 表...');
    const { data: storesTable, error: storesError } = await supabase
      .from('recycle_stores')
      .select('id')
      .limit(1);

    if (storesError && storesError.code === 'PGRST205') {
      console.log('❌ recycle_stores 表不存在\n');
    } else if (storesError) {
      console.log(`⚠️  检查 recycle_stores 表时出错: ${storesError.message}\n`);
    } else {
      console.log('✅ recycle_stores 表已存在\n');
    }

    // 检查 recycle_follow_ups 表
    console.log('检查 recycle_follow_ups 表...');
    const { data: followUpsTable, error: followUpsError } = await supabase
      .from('recycle_follow_ups')
      .select('id')
      .limit(1);

    if (followUpsError && followUpsError.code === 'PGRST205') {
      console.log('❌ recycle_follow_ups 表不存在\n');
    } else if (followUpsError) {
      console.log(`⚠️  检查 recycle_follow_ups 表时出错: ${followUpsError.message}\n`);
    } else {
      console.log('✅ recycle_follow_ups 表已存在\n');
    }

    // 如果两个表都不存在，给出创建说明
    if ((storesError?.code === 'PGRST205') && (followUpsError?.code === 'PGRST205')) {
      console.log('⚠️  数据表尚未创建\n');
      console.log('请按照以下步骤创建数据表:\n');
      console.log('方法 1: 使用 Supabase Dashboard（推荐）');
      console.log('  1. 打开浏览器，访问: https://supabase.com/dashboard');
      console.log('  2. 选择项目: xkufzwehvgdmxhutfggh');
      console.log('  3. 左侧导航栏 → SQL Editor → New Query');
      console.log('  4. 复制并执行以下文件内容:');
      console.log('     server/database/migrations/024_create_recycle_management.sql');
      console.log('  5. 点击 Run 执行\n');
      console.log('方法 2: 使用 psql 命令');
      console.log('  psql $DATABASE_URL -f server/database/migrations/024_create_recycle_management.sql\n');
      console.log('详细说明请查看:');
      console.log('  server/database/migrations/024_create_recycle_management_README.md\n');
      process.exit(1);
    }

    console.log('✅ 数据表检查完成');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
  }
}

checkTables();
