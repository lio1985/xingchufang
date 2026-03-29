-- ============================================================================
-- Coze FaaS Database Setup Script - Unified UUID Schema
-- 所有表主键统一使用 UUID
-- 所有关联字段统一使用 UUID 类型
-- 所有外键统一引用 public.users(id)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 辅助函数：自动更新 updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. Users Table - 统一用户主键
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    openid VARCHAR(255) NOT NULL UNIQUE,
    unionid VARCHAR(100),
    nickname VARCHAR(128),
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    phone VARCHAR(20),
    email VARCHAR(255),
    encrypted_password VARCHAR(255),
    employee_id VARCHAR(50),
    team_id UUID,
    team_role VARCHAR(20),
    can_view_team_data BOOLEAN DEFAULT FALSE,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ,
    phone_confirmed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);

-- 自动更新 trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. Teams Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. User Profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    real_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    department VARCHAR(100),
    position VARCHAR(100),
    company VARCHAR(100),
    employee_id VARCHAR(50),
    gender VARCHAR(10),
    birthday DATE,
    address TEXT,
    bio TEXT,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_team_id ON user_profiles(team_id);

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Lexicons
-- ============================================================================
CREATE TABLE IF NOT EXISTS lexicons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    tags JSONB,
    type VARCHAR(64) DEFAULT 'personal' NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lexicons_user_id ON lexicons(user_id);

DROP TRIGGER IF EXISTS update_lexicons_updated_at ON lexicons;
CREATE TRIGGER update_lexicons_updated_at
    BEFORE UPDATE ON lexicons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Welcome Messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS welcome_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_welcome_messages_updated_at ON welcome_messages;
CREATE TRIGGER update_welcome_messages_updated_at
    BEFORE UPDATE ON welcome_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    model VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- ============================================================================
-- 8. AI Conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    current_intent JSONB,
    collected_params JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. AI Messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);

-- ============================================================================
-- 10. Team Members
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- ============================================================================
-- 11. Knowledge Shares
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(64),
    tags JSONB,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_shares_user_id ON knowledge_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_shares_approved_by ON knowledge_shares(approved_by);

DROP TRIGGER IF EXISTS update_knowledge_shares_updated_at ON knowledge_shares;
CREATE TRIGGER update_knowledge_shares_updated_at
    BEFORE UPDATE ON knowledge_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. Quick Notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quick_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags JSONB,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON quick_notes(user_id);

DROP TRIGGER IF EXISTS update_quick_notes_updated_at ON quick_notes;
CREATE TRIGGER update_quick_notes_updated_at
    BEFORE UPDATE ON quick_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 13. Customers - 客户管理
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    company VARCHAR(100),
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    source VARCHAR(64),
    tags JSONB,
    notes TEXT,
    deal_value DECIMAL(12, 2) DEFAULT 0,
    last_contact_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_is_deleted ON customers(is_deleted);

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 14. Customer Follow Ups - 客户跟进记录
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    follow_up_time TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    follow_up_method VARCHAR(32),
    next_follow_up_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_follow_ups_customer_id ON customer_follow_ups(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_follow_ups_user_id ON customer_follow_ups(user_id);

DROP TRIGGER IF EXISTS update_customer_follow_ups_updated_at ON customer_follow_ups;
CREATE TRIGGER update_customer_follow_ups_updated_at
    BEFORE UPDATE ON customer_follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 15. Customer Status History - 客户状态变更历史
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    old_status VARCHAR(32),
    new_status VARCHAR(32) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_status_history_customer_id ON customer_status_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_status_history_user_id ON customer_status_history(user_id);

-- ============================================================================
-- 16. Recycle Stores - 店铺回收管理
-- ============================================================================
CREATE TABLE IF NOT EXISTS recycle_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    store_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    wechat VARCHAR(50),
    xiaohongshu VARCHAR(50),
    douyin VARCHAR(50),
    city VARCHAR(50),
    address TEXT,
    location JSONB,
    business_type VARCHAR(64),
    area_size INTEGER,
    open_date DATE,
    close_reason TEXT,
    recycle_status VARCHAR(32) DEFAULT 'pending',
    estimated_devices VARCHAR(50),
    estimated_value DECIMAL(12, 2),
    purchase_price DECIMAL(12, 2),
    transport_cost DECIMAL(12, 2),
    labor_cost DECIMAL(12, 2),
    total_cost DECIMAL(12, 2),
    recycle_date DATE,
    device_count INTEGER,
    device_status VARCHAR(64),
    first_follow_up_at TIMESTAMPTZ,
    first_follow_up_content TEXT,
    first_follow_up_method VARCHAR(32),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recycle_stores_user_id ON recycle_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_recycle_status ON recycle_stores(recycle_status);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_is_deleted ON recycle_stores(is_deleted);

DROP TRIGGER IF EXISTS update_recycle_stores_updated_at ON recycle_stores;
CREATE TRIGGER update_recycle_stores_updated_at
    BEFORE UPDATE ON recycle_stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 17. Recycle Store Follow Ups - 店铺回收跟进记录
-- ============================================================================
CREATE TABLE IF NOT EXISTS recycle_store_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.recycle_stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    follow_up_time TIMESTAMPTZ NOT NULL,
    content TEXT NOT NULL,
    follow_up_method VARCHAR(32),
    next_follow_up_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recycle_store_follow_ups_store_id ON recycle_store_follow_ups(store_id);
CREATE INDEX IF NOT EXISTS idx_recycle_store_follow_ups_user_id ON recycle_store_follow_ups(user_id);

DROP TRIGGER IF EXISTS update_recycle_store_follow_ups_updated_at ON recycle_store_follow_ups;
CREATE TRIGGER update_recycle_store_follow_ups_updated_at
    BEFORE UPDATE ON recycle_store_follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 18. Viral Favorites
-- ============================================================================
CREATE TABLE IF NOT EXISTS viral_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_url TEXT NOT NULL,
    platform VARCHAR(64),
    view_count INTEGER,
    like_count INTEGER,
    share_count INTEGER,
    tags JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_viral_favorites_user_id ON viral_favorites(user_id);

DROP TRIGGER IF EXISTS update_viral_favorites_updated_at ON viral_favorites;
CREATE TRIGGER update_viral_favorites_updated_at
    BEFORE UPDATE ON viral_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 19. Hot Topic Favorites
-- ============================================================================
CREATE TABLE IF NOT EXISTS hot_topic_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    topic_title VARCHAR(255) NOT NULL,
    topic_url TEXT,
    platform VARCHAR(64),
    heat_score INTEGER,
    tags JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hot_topic_favorites_user_id ON hot_topic_favorites(user_id);

DROP TRIGGER IF EXISTS update_hot_topic_favorites_updated_at ON hot_topic_favorites;
CREATE TRIGGER update_hot_topic_favorites_updated_at
    BEFORE UPDATE ON hot_topic_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 20. Scheduled Tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_id ON scheduled_tasks(user_id);

DROP TRIGGER IF EXISTS update_scheduled_tasks_updated_at ON scheduled_tasks;
CREATE TRIGGER update_scheduled_tasks_updated_at
    BEFORE UPDATE ON scheduled_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 21. Work Plans
-- ============================================================================
CREATE TABLE IF NOT EXISTS work_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_plans_user_id ON work_plans(user_id);

DROP TRIGGER IF EXISTS update_work_plans_updated_at ON work_plans;
CREATE TRIGGER update_work_plans_updated_at
    BEFORE UPDATE ON work_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 22. Export Tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS export_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    task_type VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_export_tasks_user_id ON export_tasks(user_id);

DROP TRIGGER IF EXISTS update_export_tasks_updated_at ON export_tasks;
CREATE TRIGGER update_export_tasks_updated_at
    BEFORE UPDATE ON export_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 23. Operation Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64),
    resource_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_resource_id ON operation_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);

-- ============================================================================
-- 24. Audit Logs - 审计日志
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    operation VARCHAR(64) NOT NULL,
    target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resource_type VARCHAR(64),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 25. Statistics - 统计数据
-- ============================================================================
CREATE TABLE IF NOT EXISTS statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    stat_date DATE NOT NULL,
    stat_type VARCHAR(64) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 2) DEFAULT 0,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_statistics_user_id ON statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_statistics_team_id ON statistics(team_id);
CREATE INDEX IF NOT EXISTS idx_statistics_stat_date ON statistics(stat_date);

DROP TRIGGER IF EXISTS update_statistics_updated_at ON statistics;
CREATE TRIGGER update_statistics_updated_at
    BEFORE UPDATE ON statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 26. Sales Targets - 销售目标
-- ============================================================================
CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    target_type VARCHAR(32) NOT NULL, -- 'personal' | 'team'
    period_type VARCHAR(32) NOT NULL, -- 'monthly' | 'quarterly' | 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    achieved_amount DECIMAL(15, 2) DEFAULT 0,
    target_customers INTEGER DEFAULT 0,
    achieved_customers INTEGER DEFAULT 0,
    target_recycles INTEGER DEFAULT 0,
    achieved_recycles INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_targets_user_id ON sales_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_targets_team_id ON sales_targets(team_id);
CREATE INDEX IF NOT EXISTS idx_sales_targets_created_by ON sales_targets(created_by);

DROP TRIGGER IF EXISTS update_sales_targets_updated_at ON sales_targets;
CREATE TRIGGER update_sales_targets_updated_at
    BEFORE UPDATE ON sales_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 27. Products - 产品库
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(12, 2),
    images JSONB,
    tags JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 28. Live Scripts - 直播脚本
-- ============================================================================
CREATE TABLE IF NOT EXISTS live_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    duration INTEGER, -- 预计直播时长（分钟）
    tags JSONB,
    is_template BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_scripts_user_id ON live_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_live_scripts_product_id ON live_scripts(product_id);

DROP TRIGGER IF EXISTS update_live_scripts_updated_at ON live_scripts;
CREATE TRIGGER update_live_scripts_updated_at
    BEFORE UPDATE ON live_scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 29. Content Generations - 内容生成记录
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    generation_type VARCHAR(64) NOT NULL,
    prompt TEXT NOT NULL,
    result TEXT,
    metadata JSONB,
    tokens_used INTEGER,
    status VARCHAR(32) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_generations_user_id ON content_generations(user_id);

DROP TRIGGER IF EXISTS update_content_generations_updated_at ON content_generations;
CREATE TRIGGER update_content_generations_updated_at
    BEFORE UPDATE ON content_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 30. Inspiration Items - 灵感素材
-- ============================================================================
CREATE TABLE IF NOT EXISTS inspiration_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(64) NOT NULL, -- 'text' | 'image' | 'video' | 'audio'
    media_urls JSONB,
    tags JSONB,
    source_url TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspiration_items_user_id ON inspiration_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inspiration_items_content_type ON inspiration_items(content_type);

DROP TRIGGER IF EXISTS update_inspiration_items_updated_at ON inspiration_items;
CREATE TRIGGER update_inspiration_items_updated_at
    BEFORE UPDATE ON inspiration_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 初始化完成
-- ============================================================================
SELECT 'All tables created successfully with unified UUID schema' AS status;


-- 团队任务表
CREATE TABLE IF NOT EXISTS team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 团队任务负责人关联表
CREATE TABLE IF NOT EXISTS team_task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES team_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- 团队公告表
CREATE TABLE IF NOT EXISTS team_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 团队公告已读记录表
CREATE TABLE IF NOT EXISTS team_announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES team_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- 团队聊天消息表
CREATE TABLE IF NOT EXISTS team_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_team_tasks_team_id ON team_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON team_tasks(status);
CREATE INDEX IF NOT EXISTS idx_team_task_assignees_task_id ON team_task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_team_announcements_team_id ON team_announcements(team_id);
CREATE INDEX IF NOT EXISTS idx_team_announcement_reads_user_id ON team_announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_team_id ON team_chat_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_team_chat_messages_created_at ON team_chat_messages(created_at);

-- 启用 RLS
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS 策略：团队成员可以查看任务
CREATE POLICY "团队成员可以查看任务" ON team_tasks
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

-- RLS 策略：队长可以创建、更新、删除任务
CREATE POLICY "队长可以管理任务" ON team_tasks
  FOR ALL USING (
    team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid())
  );

-- RLS 策略：团队成员可以查看公告
CREATE POLICY "团队成员可以查看公告" ON team_announcements
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

-- RLS 策略：队长可以管理公告
CREATE POLICY "队长可以管理公告" ON team_announcements
  FOR ALL USING (
    team_id IN (SELECT id FROM teams WHERE leader_id = auth.uid())
  );

-- RLS 策略：团队成员可以查看聊天消息
CREATE POLICY "团队成员可以查看聊天消息" ON team_chat_messages
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );

-- RLS 策略：团队成员可以发送消息
CREATE POLICY "团队成员可以发送消息" ON team_chat_messages
  FOR INSERT WITH CHECK (
    team_id IN (SELECT team_id FROM users WHERE id = auth.uid())
  );
