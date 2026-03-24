/**
 * 执行数据库迁移脚本
 * 用法: node server/scripts/run-migration.js <migration_file>
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.DATABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('错误: 缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY 环境变量');
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('用法: node server/scripts/run-migration.js <migration_file>');
  console.error('示例: node server/scripts/run-migration.js database/migrations/024_create_recycle_management.sql');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '../../', migrationFile);
if (!fs.existsSync(migrationPath)) {
  console.error(`错误: 文件不存在: ${migrationPath}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function executeMigration() {
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`正在执行迁移: ${migrationFile}`);
    console.log(`文件路径: ${migrationPath}`);

    // 使用 Supabase 的 rpc 方法执行 SQL
    // 注意: Supabase 的默认 client 可能无法直接执行 DDL
    // 我们需要使用 PostgREST 的 rpc 端点，或者直接连接到 PostgreSQL

    // 由于 Supabase SDK 的限制，我们使用另一种方法
    // 创建一个临时的 SQL 函数来执行迁移
    console.log('SQL 内容:');
    console.log(sql.substring(0, 200) + '...');
    console.log('注意: Supabase SDK 可能不支持直接执行 DDL，请使用 psql 或 Supabase Dashboard 执行此迁移');

    console.log('\n提示: 你可以在 Supabase Dashboard 的 SQL Editor 中执行这个文件');
    console.log(`文件路径: ${migrationPath}`);

  } catch (error) {
    console.error('执行迁移失败:', error.message);
    process.exit(1);
  }
}

executeMigration();
