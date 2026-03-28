"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.closePool = closePool;
const pg_1 = require("pg");
const dotenv = require("dotenv");
const path = require("path");
let pool = null;
function loadEnv() {
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
        }
        catch (e) {
        }
    }
}
function getPool() {
    if (!pool) {
        loadEnv();
        const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
        const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';
        const match = supabaseUrl.match(/https:\/\/([a-zA-Z0-9]+)\.supabase\.co/);
        const projectRef = match ? match[1] : '';
        const connectionString = process.env.DATABASE_URL ||
            `postgresql://postgres.${projectRef}:${encodeURIComponent(supabaseKey)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
        pool = new pg_1.Pool({
            connectionString,
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
        console.log('[PgPool] Database pool created');
    }
    return pool;
}
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('[PgPool] Database pool closed');
    }
}
//# sourceMappingURL=pg-pool.js.map