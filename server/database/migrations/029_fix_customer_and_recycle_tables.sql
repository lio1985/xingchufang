-- ===================================
-- 修复客户管理和整店回收表结构
-- ===================================
-- 使用方法：
-- 1. 打开 Supabase Dashboard -> SQL Editor
-- 2. 复制本文件内容
-- 3. 点击 "Run" 执行
-- ===================================

-- ===================================
-- 1. 修复 customers 表
-- ===================================

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS customer_follow_ups CASCADE;
DROP TABLE IF EXISTS customer_status_history CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- 重新创建 customers 表
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- 基本信息
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  wechat VARCHAR(100),
  xiaohongshu VARCHAR(100),
  douyin VARCHAR(100),
  
  -- 分类信息
  category VARCHAR(50), -- 餐饮类别
  city VARCHAR(100),
  location JSONB, -- { latitude, longitude, address }
  source VARCHAR(50), -- 抖音/小红书/转介绍/线下/其他
  customer_type VARCHAR(50), -- 餐饮小白创业/餐饮老板/其他
  
  -- 业务信息
  requirements TEXT,
  estimated_amount DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'at_risk', 'lost')),
  order_belonging VARCHAR(100), -- 星厨房总仓/巴国城店/五里店董家溪店
  order_status VARCHAR(20) DEFAULT 'in_progress' CHECK (order_status IN ('in_progress', 'completed')),
  
  -- 跟进信息
  first_follow_up_at TIMESTAMP WITH TIME ZONE,
  last_follow_up_at TIMESTAMP WITH TIME ZONE,
  
  -- 系统字段
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_order_status ON customers(order_status);
CREATE INDEX IF NOT EXISTS idx_customers_is_deleted ON customers(is_deleted);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- 创建客户跟进记录表
CREATE TABLE IF NOT EXISTS customer_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  follow_up_time TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT NOT NULL,
  follow_up_method VARCHAR(50),
  next_follow_up_plan TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customer_follow_ups_customer_id ON customer_follow_ups(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_follow_ups_user_id ON customer_follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_follow_ups_time ON customer_follow_ups(follow_up_time DESC);

-- 创建客户状态变更历史表
CREATE TABLE IF NOT EXISTS customer_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_status_history_customer_id ON customer_status_history(customer_id);

-- ===================================
-- 2. 修复 recycle_stores 表
-- ===================================

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS recycle_follow_ups CASCADE;
DROP TABLE IF EXISTS recycle_stores CASCADE;

-- 重新创建 recycle_stores 表
CREATE TABLE IF NOT EXISTS recycle_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- 基本信息
  store_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  wechat VARCHAR(100),
  xiaohongshu VARCHAR(100),
  douyin VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  location JSONB, -- { latitude, longitude, address }
  
  -- 业务信息
  business_type VARCHAR(50), -- 火锅/烧烤/中餐/西餐/快餐/饮品店/其他
  area_size DECIMAL(10,2), -- 面积（平方米）
  open_date DATE,
  close_reason TEXT,
  
  -- 回收状态
  recycle_status VARCHAR(20) DEFAULT 'pending' CHECK (recycle_status IN ('pending', 'contacted', 'assessing', 'negotiating', 'deal', 'recycling', 'completed', 'cancelled')),
  
  -- 设备信息
  estimated_devices TEXT, -- 预估设备
  estimated_value DECIMAL(15,2), -- 预估价值
  device_count INTEGER, -- 设备数量
  device_status VARCHAR(50), -- 全部回收/部分回收
  
  -- 成本信息
  purchase_price DECIMAL(15,2), -- 收购价格
  transport_cost DECIMAL(15,2), -- 运输成本
  labor_cost DECIMAL(15,2), -- 人工成本
  total_cost DECIMAL(15,2), -- 总成本
  
  -- 回收日期
  recycle_date DATE,
  
  -- 跟进信息
  first_follow_up_at TIMESTAMP WITH TIME ZONE,
  last_follow_up_at TIMESTAMP WITH TIME ZONE,
  
  -- 系统字段
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recycle_stores_user_id ON recycle_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_store_name ON recycle_stores(store_name);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_phone ON recycle_stores(phone);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_status ON recycle_stores(recycle_status);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_is_deleted ON recycle_stores(is_deleted);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_created_at ON recycle_stores(created_at DESC);

-- 创建回收跟进记录表
CREATE TABLE IF NOT EXISTS recycle_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES recycle_stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  follow_up_time TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT NOT NULL,
  follow_up_method VARCHAR(50),
  next_follow_up_plan TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recycle_follow_ups_store_id ON recycle_follow_ups(store_id);
CREATE INDEX IF NOT EXISTS idx_recycle_follow_ups_user_id ON recycle_follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_follow_ups_time ON recycle_follow_ups(follow_up_time DESC);

-- ===================================
-- 3. 添加触发器
-- ===================================

-- 自动更新 updated_at 字段
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recycle_stores_updated_at ON recycle_stores;
CREATE TRIGGER update_recycle_stores_updated_at BEFORE UPDATE ON recycle_stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 4. 配置行级安全策略（RLS）
-- ===================================

-- 启用 RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_follow_ups ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "允许用户查看客户" ON customers;
DROP POLICY IF EXISTS "允许用户创建客户" ON customers;
DROP POLICY IF EXISTS "允许用户更新客户" ON customers;
DROP POLICY IF EXISTS "允许用户删除客户" ON customers;

-- customers 表策略
CREATE POLICY "允许用户查看客户" ON customers
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "允许用户创建客户" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许用户更新客户" ON customers
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "允许用户删除客户" ON customers
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- customer_follow_ups 表策略
CREATE POLICY "允许用户查看跟进记录" ON customer_follow_ups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = customer_id
      AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "允许用户创建跟进记录" ON customer_follow_ups
  FOR INSERT WITH CHECK (true);

-- recycle_stores 表策略
CREATE POLICY "允许用户查看回收门店" ON recycle_stores
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "允许用户创建回收门店" ON recycle_stores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许用户更新回收门店" ON recycle_stores
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- recycle_follow_ups 表策略
CREATE POLICY "允许用户查看回收跟进记录" ON recycle_follow_ups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recycle_stores s
      WHERE s.id = store_id
      AND (s.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "允许用户创建回收跟进记录" ON recycle_follow_ups
  FOR INSERT WITH CHECK (true);

-- ===================================
-- 完成提示
-- ===================================
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '表结构修复完成！';
  RAISE NOTICE '====================================';
  RAISE NOTICE '已修复的表：';
  RAISE NOTICE '  - customers (客户表)';
  RAISE NOTICE '  - customer_follow_ups (客户跟进记录表)';
  RAISE NOTICE '  - customer_status_history (客户状态历史表)';
  RAISE NOTICE '  - recycle_stores (回收门店表)';
  RAISE NOTICE '  - recycle_follow_ups (回收跟进记录表)';
  RAISE NOTICE '====================================';
  RAISE NOTICE '已配置行级安全策略（RLS）';
  RAISE NOTICE '已创建自动更新 updated_at 触发器';
  RAISE NOTICE '====================================';
END $$;
