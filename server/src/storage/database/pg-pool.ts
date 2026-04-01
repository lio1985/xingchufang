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
    
    // 优先使用直接的 DATABASE_URL
    let connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      // 从 Supabase URL 解析数据库连接信息
      const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
      
      // 提取项目引用（从 URL 中）
      const match = supabaseUrl.match(/https:\/\/([a-zA-Z0-9]+)\.supabase\.co/);
      const projectRef = match ? match[1] : '';
      
      if (projectRef && process.env.COZE_SUPABASE_DB_PASSWORD) {
        // 使用专用的数据库密码（推荐方式）
        connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(process.env.COZE_SUPABASE_DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
      } else if (projectRef) {
        // 使用 Service Role Key 作为密码（备用方式，可能不被 pooler 接受）
        const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';
        connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(supabaseKey)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
      }
    }
    
    if (!connectionString) {
      console.error('[PgPool] ERROR: No database connection string available');
      throw new Error('Database connection string not configured');
    }
    
    console.log('[PgPool] Creating database pool...');
    
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    // 添加错误处理
    pool.on('error', (err) => {
      console.error('[PgPool] Unexpected error on idle client:', err);
    });
    
    // 测试连接
    pool.query('SELECT 1')
      .then(() => console.log('[PgPool] Database connection test successful'))
      .catch((err) => console.error('[PgPool] Database connection test failed:', err.message));
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
