import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

let pool: Pool | null = null;

function loadEnv(): void {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
  ];
  
  for (const envPath of envPaths) {
    try {
      dotenv.config({ path: envPath });
      if (process.env.COZE_SUPABASE_URL) {
        break;
      }
    } catch (e) {
      // continue
    }
  }
}

export function getPool(): Pool {
  if (!pool) {
    loadEnv();
    
    // 从 Supabase URL 解析数据库连接信息
    const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
    const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';
    
    // 提取项目引用（从 URL 中）
    const match = supabaseUrl.match(/https:\/\/([a-zA-Z0-9]+)\.supabase\.co/);
    const projectRef = match ? match[1] : '';
    
    // 使用环境变量中的数据库连接字符串
    // 如果没有，则使用 Supabase 的 transaction pooler 连接
    const connectionString = process.env.DATABASE_URL || 
      `postgresql://postgres.${projectRef}:${encodeURIComponent(supabaseKey)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
    
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    console.log('[PgPool] Database pool created');
  }
  
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[PgPool] Database pool closed');
  }
}
