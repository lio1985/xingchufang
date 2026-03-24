-- ===================================
-- 星厨房创作助手 - 数据库初始化脚本
-- ===================================
-- 使用方法：
-- 1. 打开 Supabase Dashboard -> SQL Editor
-- 2. 复制本文件内容
-- 3. 点击 "Run" 执行
-- ===================================

-- ===================================
-- 1. 用户表 (users)
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(255) UNIQUE NOT NULL,
  employee_id VARCHAR(50),
  nickname VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ===================================
-- 2. 词库表 (lexicons)
-- ===================================
CREATE TABLE IF NOT EXISTS lexicons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  usage_example TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_lexicons_word ON lexicons(word);
CREATE INDEX IF NOT EXISTS idx_lexicons_category ON lexicons(category);
CREATE INDEX IF NOT EXISTS idx_lexicons_created_by ON lexicons(created_by);

-- ===================================
-- 3. 欢迎语表 (welcome_messages)
-- ===================================
CREATE TABLE IF NOT EXISTS welcome_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  category VARCHAR(50),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_welcome_messages_category ON welcome_messages(category);

-- ===================================
-- 4. 产品表 (products)
-- ===================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10,2),
  image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ===================================
-- 5. 直播脚本表 (live_scripts)
-- ===================================
CREATE TABLE IF NOT EXISTS live_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_live_scripts_status ON live_scripts(status);
CREATE INDEX IF NOT EXISTS idx_live_scripts_created_by ON live_scripts(created_by);

-- ===================================
-- 6. 对话记录表 (conversations)
-- ===================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- ===================================
-- 7. 回收站门店表 (recycle_stores)
-- ===================================
CREATE TABLE IF NOT EXISTS recycle_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name VARCHAR(200) NOT NULL,
  store_code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recycle_stores_code ON recycle_stores(store_code);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_status ON recycle_stores(status);

-- ===================================
-- 8. 回收跟进记录表 (recycle_follow_ups)
-- ===================================
CREATE TABLE IF NOT EXISTS recycle_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES recycle_stores(id) ON DELETE CASCADE,
  follow_up_type VARCHAR(50) NOT NULL,
  follow_up_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  outcome VARCHAR(50),
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recycle_follow_ups_store_id ON recycle_follow_ups(store_id);
CREATE INDEX IF NOT EXISTS idx_recycle_follow_ups_date ON recycle_follow_ups(follow_up_date);

-- ===================================
-- 9. 热点话题表 (hot_topics)
-- ===================================
CREATE TABLE IF NOT EXISTS hot_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50),
  source VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_hot_topics_category ON hot_topics(category);
CREATE INDEX IF NOT EXISTS idx_hot_topics_status ON hot_topics(status);

-- ===================================
-- 10. 热点话题收藏表 (hot_topic_favorites)
-- ===================================
CREATE TABLE IF NOT EXISTS hot_topic_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES hot_topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_hot_topic_favorites_user_id ON hot_topic_favorites(user_id);

-- ===================================
-- 11. 客户管理表 (customers)
-- ===================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  tags TEXT[],
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- ===================================
-- 12. 销售目标表 (sales_targets)
-- ===================================
CREATE TABLE IF NOT EXISTS sales_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN target_amount > 0 THEN (actual_amount / target_amount) * 100
      ELSE 0
    END
  ) STORED,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, year, month)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sales_targets_year_month ON sales_targets(year, month);

-- ===================================
-- 13. 知识分享表 (knowledge_shares)
-- ===================================
CREATE TABLE IF NOT EXISTS knowledge_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_knowledge_shares_category ON knowledge_shares(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_shares_status ON knowledge_shares(status);

-- ===================================
-- 14. 审计日志表 (audit_logs)
-- ===================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ===================================
-- 触发器：自动更新 updated_at 字段
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有需要的表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lexicons_updated_at ON lexicons;
CREATE TRIGGER update_lexicons_updated_at BEFORE UPDATE ON lexicons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_live_scripts_updated_at ON live_scripts;
CREATE TRIGGER update_live_scripts_updated_at BEFORE UPDATE ON live_scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recycle_stores_updated_at ON recycle_stores;
CREATE TRIGGER update_recycle_stores_updated_at BEFORE UPDATE ON recycle_stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hot_topics_updated_at ON hot_topics;
CREATE TRIGGER update_hot_topics_updated_at BEFORE UPDATE ON hot_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_targets_updated_at ON sales_targets;
CREATE TRIGGER update_sales_targets_updated_at BEFORE UPDATE ON sales_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_shares_updated_at ON knowledge_shares;
CREATE TRIGGER update_knowledge_shares_updated_at BEFORE UPDATE ON knowledge_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 行级安全策略（RLS）
-- ===================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicons ENABLE ROW LEVEL SECURITY;
ALTER TABLE welcome_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_topic_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_shares ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "允许公开读取用户" ON users
  FOR SELECT USING (true);

CREATE POLICY "允许用户创建" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许用户更新自己" ON users
  FOR UPDATE USING (auth.uid()::text = openid OR
                   EXISTS (
                     SELECT 1 FROM users u
                     WHERE u.id = auth.uid()
                     AND u.role IN ('admin', 'super_admin')
                   ));

-- 词库表策略
CREATE POLICY "允许认证用户读取词库" ON lexicons
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "允许认证用户创建词库" ON lexicons
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "允许词库创建者更新" ON lexicons
  FOR UPDATE USING (created_by = auth.uid() OR
                   EXISTS (
                     SELECT 1 FROM users u
                     WHERE u.id = auth.uid()
                     AND u.role IN ('admin', 'super_admin')
                   ));

-- 对话记录策略
CREATE POLICY "允许用户读取自己的对话" ON conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "允许用户创建对话" ON conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 热点话题收藏策略
CREATE POLICY "允许用户查看自己的收藏" ON hot_topic_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "允许用户添加收藏" ON hot_topic_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "允许用户删除收藏" ON hot_topic_favorites
  FOR DELETE USING (user_id = auth.uid());

-- 客户表策略
CREATE POLICY "允许用户查看客户" ON customers
  FOR SELECT USING (created_by = auth.uid() OR
                   EXISTS (
                     SELECT 1 FROM users u
                     WHERE u.id = auth.uid()
                     AND u.role IN ('admin', 'super_admin')
                   ));

CREATE POLICY "允许用户创建客户" ON customers
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- ===================================
-- 完成提示
-- ===================================
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '数据库初始化完成！';
  RAISE NOTICE '====================================';
  RAISE NOTICE '已创建的表：';
  RAISE NOTICE '  - users (用户表)';
  RAISE NOTICE '  - lexicons (词库表)';
  RAISE NOTICE '  - welcome_messages (欢迎语表)';
  RAISE NOTICE '  - products (产品表)';
  RAISE NOTICE '  - live_scripts (直播脚本表)';
  RAISE NOTICE '  - conversations (对话记录表)';
  RAISE NOTICE '  - recycle_stores (回收站门店表)';
  RAISE NOTICE '  - recycle_follow_ups (回收跟进记录表)';
  RAISE NOTICE '  - hot_topics (热点话题表)';
  RAISE NOTICE '  - hot_topic_favorites (热点话题收藏表)';
  RAISE NOTICE '  - customers (客户管理表)';
  RAISE NOTICE '  - sales_targets (销售目标表)';
  RAISE NOTICE '  - knowledge_shares (知识分享表)';
  RAISE NOTICE '  - audit_logs (审计日志表)';
  RAISE NOTICE '====================================';
  RAISE NOTICE '已配置行级安全策略（RLS）';
  RAISE NOTICE '已创建自动更新 updated_at 触发器';
  RAISE NOTICE '====================================';
END $$;
