-- ===================================
-- 迁移：添加获客订单与获客登记关联字段
-- ===================================

-- 1. 为 equipment_orders 表添加 recycle_store_id 字段
ALTER TABLE equipment_orders 
ADD COLUMN IF NOT EXISTS recycle_store_id UUID REFERENCES recycle_stores(id) ON DELETE SET NULL;

COMMENT ON COLUMN equipment_orders.recycle_store_id IS '关联的获客登记ID，接单时自动创建';

-- 2. 为 recycle_stores 表添加 equipment_order_id 字段
ALTER TABLE recycle_stores 
ADD COLUMN IF NOT EXISTS equipment_order_id UUID REFERENCES equipment_orders(id) ON DELETE SET NULL;

COMMENT ON COLUMN recycle_stores.equipment_order_id IS '来源订单ID，从获客订单接单时自动创建';

-- 3. 添加索引加速查询
CREATE INDEX IF NOT EXISTS idx_equipment_orders_recycle_store_id ON equipment_orders(recycle_store_id);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_equipment_order_id ON recycle_stores(equipment_order_id);

-- 4. 确保 recycle_stores 表有必要字段（如果不存在则添加）
-- 添加 user_id 字段（负责人）
ALTER TABLE recycle_stores 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 添加 first_follow_up_at 字段
ALTER TABLE recycle_stores 
ADD COLUMN IF NOT EXISTS first_follow_up_at TIMESTAMP WITH TIME ZONE;

-- 添加 is_deleted 字段（软删除）
ALTER TABLE recycle_stores 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 添加 estimated_devices 字段
ALTER TABLE recycle_stores 
ADD COLUMN IF NOT EXISTS estimated_devices TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recycle_stores_user_id ON recycle_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_stores_is_deleted ON recycle_stores(is_deleted);
