/**
 * 环境变量验证脚本
 * 用于验证生产环境配置是否正确
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

import config from '../src/config/env.config';

console.log('======================================');
console.log('环境变量配置验证');
console.log('======================================\n');

// 验证 Supabase 配置
console.log('【数据库配置】');
console.log('✅ Supabase URL:', config.supabase.url ? '已配置' : '未配置');
console.log('✅ Supabase Key:', config.supabase.key ? '已配置' : '未配置');
console.log('');

// 验证 JWT 配置
console.log('【JWT认证配置】');
console.log('✅ JWT Secret:', config.jwt.secret ? '已配置 (长度:' + config.jwt.secret.length + ')' : '未配置');
console.log('✅ JWT ExpiresIn:', config.jwt.expiresIn);
console.log('');

// 验证应用配置
console.log('【应用配置】');
console.log('✅ App Name:', config.app.name);
console.log('✅ App Env:', config.app.env);
console.log('✅ App Port:', config.app.port);
console.log('');

// 验证微信配置
console.log('【微信小程序配置】');
console.log('✅ WeChat AppID:', config.wechat.appId ? '已配置' : '未配置');
console.log('✅ WeChat AppSecret:', config.wechat.appSecret ? '已配置' : '未配置');
console.log('');

// 验证 Coze 配置
console.log('【LLM API配置】');
console.log('✅ LLM API Key:', config.llm.apiKey ? '已配置' : '未配置（可选）');
console.log('✅ LLM API URL:', config.llm.apiUrl ? '已配置' : '未配置（可选）');
console.log('');

// 安全检查
console.log('======================================');
console.log('安全检查');
console.log('======================================\n');

const jwtSecret = config.jwt.secret;
const secretLength = jwtSecret.length;
const isSecure =
  secretLength >= 32 &&
  /[A-Z]/.test(jwtSecret) &&
  /[a-z]/.test(jwtSecret) &&
  /[0-9]/.test(jwtSecret) &&
  /[+/=]/.test(jwtSecret);

if (isSecure) {
  console.log('✅ JWT Secret 强度: 符合生产环境要求');
  console.log(`   - 长度: ${secretLength} 字符 (建议 >= 32)`);
  console.log(`   - 包含: 大小写字母、数字、特殊字符`);
} else {
  console.log('❌ JWT Secret 强度: 不符合生产环境要求');
  console.log(`   - 长度: ${secretLength} 字符 (建议 >= 32)`);
  console.log('   - 建议: 使用 openssl rand -base64 64 生成更强的密钥');
}
console.log('');

// 配置完整性检查
console.log('======================================');
console.log('配置完整性检查');
console.log('======================================\n');

const requiredConfigs = [
  { name: 'Supabase URL', value: config.supabase.url },
  { name: 'Supabase Key', value: config.supabase.key },
  { name: 'JWT Secret', value: config.jwt.secret },
  { name: 'WeChat AppID', value: config.wechat.appId },
];

let allConfigured = true;
requiredConfigs.forEach(config => {
  if (!config.value) {
    console.log(`❌ ${config.name}: 未配置`);
    allConfigured = false;
  }
});

if (allConfigured) {
  console.log('✅ 所有必填配置项均已正确配置');
} else {
  console.log('\n请检查 .env.local 文件，确保所有必填配置项已设置');
}

console.log('\n======================================');
console.log('验证完成');
console.log('======================================');

process.exit(allConfigured ? 0 : 1);
