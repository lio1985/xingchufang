/**
 * 执行数据库迁移脚本（使用 pg 客户端）
 * 用法: node server/scripts/run-migration-pg.js <migration_file>
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 从 DATABASE_URL 中提取连接信息
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_URL;

if (!DATABASE_URL) {
  console.error('错误: 缺少 DATABASE_URL 环境变量');
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('用法: node server/scripts/run-migration-pg.js <migration_file>');
  console.error('示例: node server/scripts/run-migration-pg.js database/migrations/024_create_recycle_management.sql');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '../../', migrationFile);
if (!fs.existsSync(migrationPath)) {
  console.error(`错误: 文件不存在: ${migrationPath}`);
  process.exit(1);
}

async function executeMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`正在执行迁移: ${migrationFile}`);
    console.log(`文件路径: ${migrationPath}`);
    console.log(`连接数据库: ${DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);

    // 执行 SQL
    await pool.query(sql);

    console.log('✅ 迁移执行成功!');

    // 验证表是否创建成功
    const checkTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('recycle_stores', 'recycle_follow_ups')
      ORDER BY table_name
    `);

    if (checkTables.rows.length > 0) {
      console.log('\n已创建的表:');
      checkTables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ 执行迁移失败:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executeMigration();
