-- ===================================
-- 迁移：为 export_tasks 表添加权限相关字段
-- ===================================

-- 1. 添加 scope 字段（导出范围）
ALTER TABLE export_tasks 
ADD COLUMN IF NOT EXISTS scope VARCHAR(20) DEFAULT 'self';

COMMENT ON COLUMN export_tasks.scope IS '导出范围: self-个人数据, team-团队数据, all-全部数据';

-- 2. 添加 team_id 字段（团队ID，当 scope=team 时使用）
ALTER TABLE export_tasks 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN export_tasks.team_id IS '团队ID，导出团队数据时指定';

-- 3. 添加索引
CREATE INDEX IF NOT EXISTS idx_export_tasks_scope ON export_tasks(scope);
CREATE INDEX IF NOT EXISTS idx_export_tasks_team_id ON export_tasks(team_id);
