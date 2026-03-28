import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const supabaseUrl = process.env.COZE_SUPABASE_URL
const supabaseServiceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration(migrationFile: string) {
  console.log(`\n🚀 开始执行迁移: ${migrationFile}`)
  
  const filePath = path.join(__dirname, '../database/migrations', migrationFile)
  const sql = fs.readFileSync(filePath, 'utf8')
  
  console.log('SQL 内容:')
  console.log(sql)
  
  try {
    // 使用 Supabase RPC 执行原始 SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // 如果 RPC 不存在，尝试分块执行
      console.log('⚠️  RPC 方法不存在，尝试分块执行...')
      
      // 将 SQL 分割成单独的语句
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      for (const statement of statements) {
        if (statement.includes('DO $$') || statement.includes('BEGIN') || statement.includes('END')) {
          // 跳过 DO 块，稍后处理
          console.log('跳过 DO 块...')
          continue
        }
        
        console.log(`执行语句: ${statement.substring(0, 100)}...`)
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement })
        if (stmtError) {
          console.error('❌ 语句执行失败:', stmtError)
        }
      }
    } else {
      console.log('✅ 迁移执行成功')
    }
  } catch (err) {
    console.error('❌ 迁移执行失败:', err)
    console.log('\n💡 请手动在 Supabase Dashboard 中执行迁移脚本:')
    console.log(`   文件路径: server/database/migrations/${migrationFile}`)
  }
}

// 获取命令行参数
const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ 请指定迁移文件名')
  console.log('用法: ts-node scripts/run-migration.ts <migration-file>')
  process.exit(1)
}

runMigration(migrationFile)
