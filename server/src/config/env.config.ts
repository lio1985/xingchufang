/**
 * 环境变量配置
 */
export const config = {
  // Supabase配置
  supabase: {
    url: process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'xingchufang-ai-system-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 微信小程序配置
  wechat: {
    appId: process.env.WECHAT_APP_ID || process.env.TARO_APP_WEAPP_APPID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
  },

  // 应用配置
  app: {
    name: process.env.APP_NAME || '星厨房内容创作助手',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.SERVER_PORT || process.env.PORT || '3000', 10),
  },

  // 对象存储配置
  s3: {
    endpoint: process.env.S3_ENDPOINT || process.env.COZE_S3_ENDPOINT || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.COZE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.COZE_S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET || process.env.COZE_S3_BUCKET || '',
    region: process.env.S3_REGION || process.env.COZE_S3_REGION || '',
  },

  // LLM配置
  llm: {
    apiKey: process.env.LLM_API_KEY || process.env.COZE_API_KEY || '',
    apiUrl: process.env.LLM_API_URL || process.env.COZE_API_URL || '',
  },
};

export default config;
