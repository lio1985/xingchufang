/**
 * 创建回收管理数据表
 * 使用 Supabase Management API 执行 SQL
 * 用法: node server/scripts/create-recycle-tables.js
 */
const https = require('https');
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

function executeSQLViaAPI(sql) {
  return new Promise((resolve, reject) => {
    const PROJECT_REF = process.env.COZE_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    const API_KEY = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.COZE_SUPABASE_ANON_KEY;

    if (!PROJECT_REF || !API_KEY) {
      reject(new Error('缺少 SUPABASE_URL 或 SERVICE_ROLE_KEY 环境变量'));
      return;
    }

    // 使用 Supabase 的 SQL API
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/execute_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

async function main() {
  try {
    loadEnv();

    console.log('📋 准备创建回收管理数据表...\n');

    const migrationFile = path.join(__dirname, '../../server/database/migrations/024_create_recycle_management.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('📝 SQL 内容预览:');
    console.log(sql.substring(0, 300) + '...\n');

    console.log('⚠️  Supabase SDK 不支持直接执行 DDL');
    console.log('尝试使用 API 方法...\n');

    try {
      await executeSQLViaAPI(sql);
      console.log('✅ 数据表创建成功!\n');
    } catch (error) {
      console.log('❌ API 方法失败:', error.message);
      console.log('\n请使用以下方法之一创建表:\n');
      console.log('方法 1: 使用 Supabase Dashboard（推荐）');
      console.log('  1. 打开: https://supabase.com/dashboard/project/xkufzwehvgdmxhutfggh/sql/new');
      console.log('  2. 复制以下文件内容并执行:');
      console.log('     server/database/migrations/024_create_recycle_management.sql\n');
      console.log('方法 2: 使用 psql 命令');
      console.log('  psql $DATABASE_URL -f server/database/migrations/024_create_recycle_management.sql\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
