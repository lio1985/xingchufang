-- 选题策划表 (topics)
-- 用于存储用户的选题信息，支持从灵感速记转化
-- ===================================

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  platform VARCHAR(50) DEFAULT '公众号',
  content_type VARCHAR(50) DEFAULT '图文',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'published', 'archived')),
  priority INTEGER DEFAULT 0,
  tags TEXT[],
  target_audience VARCHAR(200),
  key_points TEXT,
  reference_urls TEXT[],
  ai_analysis JSONB,
  inspiration_data JSONB,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_platform ON topics(platform);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_scheduled_date ON topics(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_topics_updated_at();

-- 启用行级安全策略
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能访问自己的选题
CREATE POLICY "Users can view their own topics" ON topics
  FOR SELECT USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

CREATE POLICY "Users can insert their own topics" ON topics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

CREATE POLICY "Users can update their own topics" ON topics
  FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

CREATE POLICY "Users can delete their own topics" ON topics
  FOR DELETE USING (auth.uid()::text = user_id::text OR user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- 添加注释
COMMENT ON TABLE topics IS '选题策划表';
COMMENT ON COLUMN topics.id IS '选题唯一ID';
COMMENT ON COLUMN topics.user_id IS '所属用户ID';
COMMENT ON COLUMN topics.title IS '选题标题';
COMMENT ON COLUMN topics.description IS '选题描述';
COMMENT ON COLUMN topics.category IS '选题分类';
COMMENT ON COLUMN topics.platform IS '发布平台';
COMMENT ON COLUMN topics.content_type IS '内容类型';
COMMENT ON COLUMN topics.status IS '选题状态：draft-草稿, in_progress-进行中, published-已发布, archived-已归档';
COMMENT ON COLUMN topics.priority IS '优先级';
COMMENT ON COLUMN topics.tags IS '标签数组';
COMMENT ON COLUMN topics.target_audience IS '目标受众';
COMMENT ON COLUMN topics.key_points IS '核心要点';
COMMENT ON COLUMN topics.reference_urls IS '参考链接';
COMMENT ON COLUMN topics.ai_analysis IS 'AI分析结果（JSON格式）';
COMMENT ON COLUMN topics.inspiration_data IS '灵感来源数据（JSON格式）';
COMMENT ON COLUMN topics.scheduled_date IS '计划发布日期';
COMMENT ON COLUMN topics.published_at IS '实际发布日期';
