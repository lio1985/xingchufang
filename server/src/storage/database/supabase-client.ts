import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (envLoaded) {
    return;
  }

  try {
    // 尝试从多个位置加载 .env 文件
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '..', '.env'),
      path.resolve('/root/server', '.env'),
    ];
    
    for (const envPath of envPaths) {
      try {
        const result = dotenv.config({ path: envPath });
        if (result.parsed && (result.parsed.COZE_SUPABASE_URL || result.parsed.COZE_SUPABASE_ANON_KEY)) {
          // 优先使用 .env 文件中的配置（覆盖预设环境变量）
          if (result.parsed.COZE_SUPABASE_URL) {
            process.env.COZE_SUPABASE_URL = result.parsed.COZE_SUPABASE_URL;
          }
          if (result.parsed.COZE_SUPABASE_ANON_KEY) {
            process.env.COZE_SUPABASE_ANON_KEY = result.parsed.COZE_SUPABASE_ANON_KEY;
          }
          console.log(`[SupabaseClient] Loaded env from: ${envPath}`);
          envLoaded = true;
          return;
        }
      } catch {
        // 继续尝试下一个路径
      }
    }

    // 如果 dotenv 加载失败，尝试 Python 方式
    const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }

    envLoaded = true;
  } catch (err) {
    console.error('[SupabaseClient] Failed to load env:', err);
  }
}

function getSupabaseCredentials(): SupabaseCredentials {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  console.log('[SupabaseClient] Environment check:', {
    hasUrl: !!url,
    hasKey: !!anonKey,
    urlPrefix: url ? url.substring(0, 30) + '...' : 'missing',
  });

  if (!url || !anonKey) {
    console.warn('⚠️  Supabase credentials not configured. Using fallback configuration.');
    // 返回一个默认配置，避免应用启动失败
    return {
      url: 'https://fallback.supabase.co',
      anonKey: 'fallback-key'
    };
  }

  return { url, anonKey };
}

function getSupabaseClient(token?: string): SupabaseClient {
  const credentials = getSupabaseCredentials();
  const { url, anonKey } = credentials;

  if (url === 'https://fallback.supabase.co') {
    console.warn('⚠️  Supabase client is using fallback configuration. Database operations will fail.');
  }

  if (token) {
    return createClient(url, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return createClient(url, anonKey, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { loadEnv, getSupabaseCredentials, getSupabaseClient };
