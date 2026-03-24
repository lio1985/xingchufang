"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const path = require("path");
const envPath = path.join(__dirname, '../../.env.local');
dotenv.config({ path: envPath });
const env_config_1 = require("../src/config/env.config");
console.log('======================================');
console.log('环境变量配置验证');
console.log('======================================\n');
console.log('【数据库配置】');
console.log('✅ Supabase URL:', env_config_1.default.supabase.url ? '已配置' : '未配置');
console.log('✅ Supabase Key:', env_config_1.default.supabase.key ? '已配置' : '未配置');
console.log('');
console.log('【JWT认证配置】');
console.log('✅ JWT Secret:', env_config_1.default.jwt.secret ? '已配置 (长度:' + env_config_1.default.jwt.secret.length + ')' : '未配置');
console.log('✅ JWT ExpiresIn:', env_config_1.default.jwt.expiresIn);
console.log('');
console.log('【应用配置】');
console.log('✅ App Name:', env_config_1.default.app.name);
console.log('✅ App Env:', env_config_1.default.app.env);
console.log('✅ App Port:', env_config_1.default.app.port);
console.log('');
console.log('【微信小程序配置】');
console.log('✅ WeChat AppID:', env_config_1.default.wechat.appId ? '已配置' : '未配置');
console.log('✅ WeChat AppSecret:', env_config_1.default.wechat.appSecret ? '已配置' : '未配置');
console.log('');
console.log('【LLM API配置】');
console.log('✅ LLM API Key:', env_config_1.default.llm.apiKey ? '已配置' : '未配置（可选）');
console.log('✅ LLM API URL:', env_config_1.default.llm.apiUrl ? '已配置' : '未配置（可选）');
console.log('');
console.log('======================================');
console.log('安全检查');
console.log('======================================\n');
const jwtSecret = env_config_1.default.jwt.secret;
const secretLength = jwtSecret.length;
const isSecure = secretLength >= 32 &&
    /[A-Z]/.test(jwtSecret) &&
    /[a-z]/.test(jwtSecret) &&
    /[0-9]/.test(jwtSecret) &&
    /[+/=]/.test(jwtSecret);
if (isSecure) {
    console.log('✅ JWT Secret 强度: 符合生产环境要求');
    console.log(`   - 长度: ${secretLength} 字符 (建议 >= 32)`);
    console.log(`   - 包含: 大小写字母、数字、特殊字符`);
}
else {
    console.log('❌ JWT Secret 强度: 不符合生产环境要求');
    console.log(`   - 长度: ${secretLength} 字符 (建议 >= 32)`);
    console.log('   - 建议: 使用 openssl rand -base64 64 生成更强的密钥');
}
console.log('');
console.log('======================================');
console.log('配置完整性检查');
console.log('======================================\n');
const requiredConfigs = [
    { name: 'Supabase URL', value: env_config_1.default.supabase.url },
    { name: 'Supabase Key', value: env_config_1.default.supabase.key },
    { name: 'JWT Secret', value: env_config_1.default.jwt.secret },
    { name: 'WeChat AppID', value: env_config_1.default.wechat.appId },
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
}
else {
    console.log('\n请检查 .env.local 文件，确保所有必填配置项已设置');
}
console.log('\n======================================');
console.log('验证完成');
console.log('======================================');
process.exit(allConfigured ? 0 : 1);
//# sourceMappingURL=verify-env.js.map