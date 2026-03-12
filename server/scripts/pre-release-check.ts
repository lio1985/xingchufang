/**
 * 发布前快速检查脚本
 * 用于快速检查关键配置项是否正确
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

interface CheckResult {
  name: string;
  required: boolean;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const checks: CheckResult[] = [];

// 1. 检查 JWT_SECRET
const jwtSecret = process.env.JWT_SECRET;
checks.push({
  name: 'JWT_SECRET',
  required: true,
  status: jwtSecret && jwtSecret.length >= 32 && jwtSecret !== 'xingchufang-ai-system-secret-key-2024' ? 'pass' : 'fail',
  message: jwtSecret
    ? `长度: ${jwtSecret.length} 字符 ${jwtSecret.length >= 32 ? '✅' : '❌'}`
    : '未配置 ❌',
});

// 2. 检查 Supabase 配置
const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;
checks.push({
  name: 'Supabase URL',
  required: true,
  status: supabaseUrl ? 'pass' : 'fail',
  message: supabaseUrl ? '已配置 ✅' : '未配置 ❌',
});
checks.push({
  name: 'Supabase Key',
  required: true,
  status: supabaseKey ? 'pass' : 'fail',
  message: supabaseKey ? '已配置 ✅' : '未配置 ❌',
});

// 3. 检查对象存储配置
const s3Endpoint = process.env.COZE_S3_ENDPOINT;
const s3KeyId = process.env.COZE_S3_ACCESS_KEY_ID;
const s3Secret = process.env.COZE_S3_SECRET_ACCESS_KEY;
const s3Bucket = process.env.COZE_S3_BUCKET;
const s3Region = process.env.COZE_S3_REGION;

const s3HasDefaults = !s3Endpoint ||
  s3Endpoint.includes('your-s3-endpoint') ||
  !s3KeyId ||
  s3KeyId === 'your-access-key-id' ||
  !s3Secret ||
  s3Secret === 'your-secret-access-key' ||
  !s3Bucket ||
  s3Bucket === 'your-bucket-name' ||
  !s3Region ||
  s3Region === 'your-region';

checks.push({
  name: '对象存储配置',
  required: true,
  status: s3HasDefaults ? 'fail' : 'pass',
  message: s3HasDefaults
    ? '仍使用默认值 ❌（请配置真实S3密钥）'
    : '已配置 ✅',
});

// 4. 检查生产域名
const projectDomain = process.env.PROJECT_DOMAIN;
checks.push({
  name: '生产域名',
  required: true,
  status: projectDomain && !projectDomain.includes('example.com') ? 'pass' : 'fail',
  message: projectDomain
    ? `${projectDomain} ${projectDomain.includes('example.com') ? '❌ 仍是示例域名' : '✅'}`
    : '未配置 ❌',
});

// 5. 检查微信配置
const wechatAppId = process.env.WECHAT_APP_ID || process.env.TARO_APP_WEAPP_APPID;
const wechatSecret = process.env.WECHAT_APP_SECRET;
checks.push({
  name: '微信 AppID',
  required: true,
  status: wechatAppId ? 'pass' : 'fail',
  message: wechatAppId ? `${wechatAppId} ✅` : '未配置 ❌',
});
checks.push({
  name: '微信 AppSecret',
  required: true,
  status: wechatSecret ? 'pass' : 'fail',
  message: wechatSecret ? '已配置 ✅' : '未配置 ❌',
});

// 6. 检查 LLM 配置（可选）
const cozeApiKey = process.env.COZE_API_KEY;
const cozeApiUrl = process.env.COZE_API_URL;
checks.push({
  name: 'Coze API配置（可选）',
  required: false,
  status: cozeApiKey ? 'pass' : 'warning',
  message: cozeApiKey
    ? '已配置 ✅'
    : '未配置 ⚠️（内容生成将使用模板降级）',
});

// 7. 检查应用环境
const nodeEnv = process.env.NODE_ENV;
checks.push({
  name: '应用环境',
  required: true,
  status: nodeEnv === 'production' ? 'pass' : 'warning',
  message: nodeEnv || '未配置',
});

// 输出结果
console.log('\n====================================');
console.log('📋 发布前配置检查');
console.log('====================================\n');

let passCount = 0;
let failCount = 0;
let warningCount = 0;
let requiredFailCount = 0;

checks.forEach((check, index) => {
  const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
  const required = check.required ? '[必填]' : '[可选]';

  console.log(`${index + 1}. ${check.name} ${required}`);
  console.log(`   ${icon} ${check.message}`);

  if (check.status === 'pass') passCount++;
  else if (check.status === 'fail') {
    failCount++;
    if (check.required) requiredFailCount++;
  }
  else if (check.status === 'warning') warningCount++;

  console.log('');
});

console.log('====================================');
console.log('📊 检查结果汇总');
console.log('====================================\n');
console.log(`✅ 通过: ${passCount}`);
console.log(`❌ 失败: ${failCount} (其中必填项失败: ${requiredFailCount})`);
console.log(`⚠️  警告: ${warningCount}`);
console.log('');

// 生成建议
console.log('====================================');
console.log('💡 建议');
console.log('====================================\n');

if (requiredFailCount > 0) {
  console.log('🔴 严重警告：有必填配置项未正确配置，无法发布！');
  console.log('');
  console.log('必须立即处理的项目：\n');
  checks
    .filter(c => c.required && c.status === 'fail')
    .forEach(c => {
      console.log(`  ❌ ${c.name}: ${c.message}`);
    });
  console.log('');
  console.log('请参考 /docs/TODAY-TASKS.md 中的详细说明进行配置。');
} else if (failCount > 0) {
  console.log('⚠️  注意：有可选配置项未配置，某些功能可能无法使用。');
  console.log('');
  console.log('建议处理的项目：\n');
  checks.filter(c => !c.required && c.status === 'fail').forEach(c => {
    console.log(`  ⚠️  ${c.name}: ${c.message}`);
  });
} else if (warningCount > 0) {
  console.log('ℹ️  提示：有警告项，建议处理但不影响发布。');
} else {
  console.log('🎉 恭喜！所有配置项均已正确配置！');
}

console.log('');
console.log('====================================\n');

// 退出码
process.exit(requiredFailCount > 0 ? 1 : 0);
