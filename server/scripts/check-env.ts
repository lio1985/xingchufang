import { loadEnv, getSupabaseCredentials } from '../src/storage/database/supabase-client';

console.log('=== 检查环境变量加载情况 ===\n');

// 加载环境变量
loadEnv();

// 检查环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

console.log('COZE_SUPABASE_URL:', supabaseUrl ? '✓ 已设置' : '✗ 未设置');
console.log('COZE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ 已设置' : '✗ 未设置');

if (supabaseUrl) {
  console.log('URL 值:', supabaseUrl.substring(0, 20) + '...');
}

// 获取 Supabase 凭据
const credentials = getSupabaseCredentials();
console.log('\n=== 获取到的 Supabase 凭据 ===');
console.log('URL:', credentials.url);
console.log('Key:', credentials.anonKey.substring(0, 20) + '...');

if (credentials.url === 'https://fallback.supabase.co') {
  console.log('\n⚠️  警告：正在使用 fallback 配置，数据库操作将失败！');
  console.log('请检查环境变量 COZE_SUPABASE_URL 和 COZE_SUPABASE_ANON_KEY 是否正确配置。');
}
