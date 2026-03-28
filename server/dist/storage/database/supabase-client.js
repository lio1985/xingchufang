"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
exports.getSupabaseCredentials = getSupabaseCredentials;
exports.getSupabaseClient = getSupabaseClient;
const supabase_js_1 = require("@supabase/supabase-js");
const child_process_1 = require("child_process");
const dotenv = require("dotenv");
const path = require("path");
let envLoaded = false;
function loadEnv() {
    if (envLoaded) {
        return;
    }
    try {
        const envPaths = [
            path.resolve(process.cwd(), '.env'),
            path.resolve(process.cwd(), '..', '.env'),
            path.resolve('/root/server', '.env'),
        ];
        for (const envPath of envPaths) {
            try {
                const result = dotenv.config({ path: envPath });
                if (result.parsed && (result.parsed.COZE_SUPABASE_URL || result.parsed.COZE_SUPABASE_ANON_KEY)) {
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
            }
            catch {
            }
        }
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
        const output = (0, child_process_1.execSync)(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
            encoding: 'utf-8',
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        const lines = output.trim().split('\n');
        for (const line of lines) {
            if (line.startsWith('#'))
                continue;
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
    }
    catch (err) {
        console.error('[SupabaseClient] Failed to load env:', err);
    }
}
function getSupabaseCredentials() {
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
        return {
            url: 'https://fallback.supabase.co',
            anonKey: 'fallback-key'
        };
    }
    return { url, anonKey };
}
function getSupabaseClient(token) {
    const credentials = getSupabaseCredentials();
    const { url, anonKey } = credentials;
    if (url === 'https://fallback.supabase.co') {
        console.warn('⚠️  Supabase client is using fallback configuration. Database operations will fail.');
    }
    if (token) {
        return (0, supabase_js_1.createClient)(url, anonKey, {
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
    return (0, supabase_js_1.createClient)(url, anonKey, {
        db: {
            timeout: 60000,
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
//# sourceMappingURL=supabase-client.js.map