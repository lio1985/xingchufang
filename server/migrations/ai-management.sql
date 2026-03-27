-- AI管理模块数据库迁移
-- 创建时间: 2024-01-15

-- 1. AI模型配置表
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model_id VARCHAR(100) NOT NULL,
  api_key TEXT,
  api_endpoint VARCHAR(255),
  
  -- 模型参数
  max_tokens INTEGER DEFAULT 4096,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  top_p DECIMAL(3,2) DEFAULT 1.0,
  
  -- 成本设置
  input_cost_per_1k DECIMAL(10,6),
  output_cost_per_1k DECIMAL(10,6),
  
  -- 能力标签
  capabilities JSONB DEFAULT '[]'::jsonb,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE ai_models IS 'AI模型配置表';
COMMENT ON COLUMN ai_models.name IS '模型名称';
COMMENT ON COLUMN ai_models.provider IS '提供商：openai, anthropic, deepseek等';
COMMENT ON COLUMN ai_models.model_id IS 'API模型ID';
COMMENT ON COLUMN ai_models.capabilities IS '能力标签数组：["chat", "vision", "code"]';

-- 2. AI功能模块表
CREATE TABLE IF NOT EXISTS ai_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- 模块定位
  position VARCHAR(100),
  responsibility TEXT,
  
  -- AI配置
  model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  prompt_template TEXT NOT NULL,
  system_prompt TEXT,
  
  -- 参数覆盖
  temperature DECIMAL(3,2),
  max_tokens INTEGER,
  
  -- 上下文配置
  context_enabled BOOLEAN DEFAULT true,
  context_max_turns INTEGER DEFAULT 5,
  
  -- 访问控制
  allowed_roles JSONB DEFAULT '["admin","leader","member"]'::jsonb,
  daily_limit_per_user INTEGER,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE ai_modules IS 'AI功能模块表';
COMMENT ON COLUMN ai_modules.code IS '模块代码：writing-assistant, topic-planning等';
COMMENT ON COLUMN ai_modules.position IS '功能定位';
COMMENT ON COLUMN ai_modules.responsibility IS '职责描述';
COMMENT ON COLUMN ai_modules.prompt_template IS '提示词模板';
COMMENT ON COLUMN ai_modules.allowed_roles IS '允许访问的角色数组';

-- 3. AI使用日志表
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 用户信息
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  
  -- 模块信息
  module_id UUID NOT NULL REFERENCES ai_modules(id) ON DELETE CASCADE,
  module_code VARCHAR(50),
  
  -- 模型信息
  model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  model_name VARCHAR(100),
  
  -- 请求信息
  input_messages JSONB,
  input_token_count INTEGER,
  
  -- 响应信息
  output_content TEXT,
  output_token_count INTEGER,
  
  -- 性能指标
  response_time_ms INTEGER,
  
  -- 成本计算
  estimated_cost DECIMAL(10,6),
  
  -- 状态
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  
  -- 反馈
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE ai_usage_logs IS 'AI使用日志表';
COMMENT ON COLUMN ai_usage_logs.status IS '状态：success, failed, timeout';
COMMENT ON COLUMN ai_usage_logs.user_rating IS '用户评分1-5';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_module ON ai_usage_logs(module_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_team ON ai_usage_logs(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_status ON ai_usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created ON ai_usage_logs(created_at DESC);

-- 4. AI全局设置表
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 默认配置
  default_model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  
  -- 回答风格
  response_style VARCHAR(50) DEFAULT 'professional',
  response_tone VARCHAR(50) DEFAULT 'neutral',
  
  -- 内容限制
  max_response_length INTEGER DEFAULT 2000,
  enable_content_filter BOOLEAN DEFAULT true,
  
  -- 敏感词过滤
  sensitive_words TEXT[] DEFAULT '{}',
  
  -- 提示词增强
  global_system_prompt TEXT,
  prompt_enhancements JSONB DEFAULT '{}'::jsonb,
  
  -- 成本控制
  monthly_budget DECIMAL(10,2),
  alert_threshold DECIMAL(5,2),
  
  -- 功能开关
  enable_ai_chat BOOLEAN DEFAULT true,
  enable_ai_writing BOOLEAN DEFAULT true,
  enable_ai_analysis BOOLEAN DEFAULT true,
  
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保只有一条设置记录
  CONSTRAINT single_settings_row CHECK (id IS NOT NULL)
);

COMMENT ON TABLE ai_settings IS 'AI全局设置表';
COMMENT ON COLUMN ai_settings.response_style IS '回答风格：professional, friendly, concise';
COMMENT ON COLUMN ai_settings.response_tone IS '回答语气：neutral, positive, encouraging';

-- 5. 初始化默认设置
INSERT INTO ai_settings (id, response_style, response_tone, max_response_length, enable_content_filter)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'professional',
  'neutral',
  2000,
  true
) ON CONFLICT (id) DO NOTHING;

-- 6. 初始化默认AI模型
INSERT INTO ai_models (name, provider, model_id, max_tokens, temperature, capabilities, is_active, is_default) VALUES
('GPT-4', 'openai', 'gpt-4-turbo-preview', 4096, 0.7, '["chat", "code", "reasoning"]'::jsonb, true, true),
('Claude-3 Opus', 'anthropic', 'claude-3-opus-20240229', 8192, 0.7, '["chat", "code", "reasoning", "long_context"]'::jsonb, true, false),
('DeepSeek-V3', 'deepseek', 'deepseek-chat', 4096, 0.7, '["chat", "code"]'::jsonb, true, false),
('Kimi', 'moonshot', 'moonshot-v1-8k', 8192, 0.7, '["chat", "long_context"]'::jsonb, true, false),
('Doubao Pro', 'doubao', 'doubao-pro-4k', 4096, 0.7, '["chat"]'::jsonb, true, false)
ON CONFLICT DO NOTHING;

-- 7. 初始化默认AI功能模块
INSERT INTO ai_modules (code, name, description, position, responsibility, prompt_template, is_active, display_order) VALUES
(
  'writing-assistant',
  '写作助手',
  '帮助用户进行文章写作、内容优化、风格调整',
  '内容创作辅助',
  '帮助用户进行文章写作、内容优化、风格调整，提供专业的写作建议',
  '你是一位专业的内容创作助手，擅长短视频脚本、公众号文章、产品文案等多种形式的内容创作。请根据用户的需求，提供高质量的写作支持。',
  true,
  1
),
(
  'topic-planning',
  '选题策划',
  '分析热点话题，生成选题建议，提供内容方向',
  '热点分析专家',
  '分析热点话题，生成选题建议，提供内容方向，帮助用户找到爆款选题',
  '你是一位资深的选题策划专家，擅长分析热点话题、挖掘用户痛点、发现爆款选题。请根据热点数据和用户需求，提供有价值的选题建议。',
  true,
  2
),
(
  'content-analysis',
  '内容分析',
  '分析内容数据，提供优化建议',
  '数据分析师',
  '分析内容数据，提供优化建议，帮助用户提升内容质量',
  '你是一位数据分析专家，擅长分析内容数据、用户行为、传播效果。请根据数据提供专业的分析和优化建议。',
  true,
  3
),
(
  'lexicon-optimization',
  '语料优化',
  '优化个人语料，纠正语法错误，提升表达质量',
  '语言优化专家',
  '优化个人语料，纠正语法错误，提升表达质量，保持用户个人风格',
  '你是一位语言优化专家，擅长纠正语法错误、优化表达方式、提升内容质量，同时保持用户的个人风格。',
  true,
  4
),
(
  'knowledge-qa',
  '知识问答',
  '回答产品知识、设计知识等专业问题',
  '知识顾问',
  '回答产品知识、设计知识等专业问题，提供准确的专业指导',
  '你是一位专业的知识顾问，精通产品知识、设计知识、行业知识。请根据知识库内容，准确回答用户的专业问题。',
  true,
  5
)
ON CONFLICT (code) DO NOTHING;

-- 8. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_modules_updated_at
    BEFORE UPDATE ON ai_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at
    BEFORE UPDATE ON ai_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 完成
SELECT 'AI管理模块数据库迁移完成' as status;
