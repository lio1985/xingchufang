-- ===================================
-- 修复 lexicons 表结构
-- 将旧的字段结构迁移到新的语料库结构
-- ===================================

-- 0. 创建分享相关表（如果不存在）

-- 分享权限表
CREATE TABLE IF NOT EXISTS share_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  is_globally_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_share_permissions_resource ON share_permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_share_permissions_globally_shared ON share_permissions(is_globally_shared);

-- 分享历史表
CREATE TABLE IF NOT EXISTS share_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lexicon_id UUID REFERENCES lexicons(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  operator_name VARCHAR(100),
  share_type VARCHAR(20),
  share_scope VARCHAR(20),
  shared_with_users UUID[],
  is_global_share BOOLEAN DEFAULT FALSE,
  action VARCHAR(20),
  previous_config JSONB,
  new_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_history_lexicon_id ON share_history(lexicon_id);
CREATE INDEX IF NOT EXISTS idx_share_history_operator_id ON share_history(operator_id);
CREATE INDEX IF NOT EXISTS idx_share_history_created_at ON share_history(created_at);

-- 1. 添加新字段（如果不存在）
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'personal';
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS share_scope VARCHAR(20) DEFAULT 'custom';
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS shared_with_users UUID[] DEFAULT '{}';
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS shared_by UUID;

-- 2. 迁移旧数据（如果存在）
-- 将 word 映射到 title，usage_example 映射到 content
UPDATE lexicons 
SET 
  user_id = created_by,
  title = COALESCE(title, word),
  content = COALESCE(content, usage_example),
  type = COALESCE(type, 'personal')
WHERE title IS NULL OR content IS NULL;

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_lexicons_user_id ON lexicons(user_id);
CREATE INDEX IF NOT EXISTS idx_lexicons_type ON lexicons(type);
CREATE INDEX IF NOT EXISTS idx_lexicons_product_id ON lexicons(product_id);
CREATE INDEX IF NOT EXISTS idx_lexicons_is_shared ON lexicons(is_shared);

-- 4. 删除不再需要的旧索引（可选，保留以兼容旧代码）
-- DROP INDEX IF EXISTS idx_lexicons_word;
-- DROP INDEX IF EXISTS idx_lexicons_created_by;

-- 5. 更新注释
COMMENT ON TABLE lexicons IS '语料库表（原词库表）';
COMMENT ON COLUMN lexicons.user_id IS '所属用户ID';
COMMENT ON COLUMN lexicons.title IS '语料标题';
COMMENT ON COLUMN lexicons.content IS '语料内容';
COMMENT ON COLUMN lexicons.type IS '类型：personal（个人）、enterprise（企业）';
COMMENT ON COLUMN lexicons.tags IS '标签数组';
COMMENT ON COLUMN lexicons.product_id IS '关联产品ID';
COMMENT ON COLUMN lexicons.is_shared IS '是否已共享';
COMMENT ON COLUMN lexicons.share_scope IS '共享范围：custom（指定用户）、all（所有人）、department（部门）';
COMMENT ON COLUMN lexicons.shared_with_users IS '共享给的用户ID列表';
COMMENT ON COLUMN lexicons.shared_at IS '共享时间';
COMMENT ON COLUMN lexicons.shared_by IS '共享操作人';

-- 6. 更新 RLS 策略
-- 删除旧的策略
DROP POLICY IF EXISTS "允许认证用户读取词库" ON lexicons;
DROP POLICY IF EXISTS "允许认证用户创建词库" ON lexicons;
DROP POLICY IF EXISTS "允许词库创建者更新" ON lexicons;

-- 创建新的策略
CREATE POLICY "允许认证用户读取自己的语料" ON lexicons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "允许认证用户创建语料" ON lexicons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "允许语料创建者更新" ON lexicons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "允许语料创建者删除" ON lexicons
  FOR DELETE USING (auth.uid() = user_id);

-- 7. 设置非空约束（在新数据插入后）
-- 注意：只有当所有旧数据都已迁移后才能执行
-- ALTER TABLE lexicons ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE lexicons ALTER COLUMN title SET NOT NULL;
-- ALTER TABLE lexicons ALTER COLUMN content SET NOT NULL;
