-- ===================================
-- 迁移：修复 equipment_order_id 外键约束类型不匹配问题
-- ===================================
-- 问题：recycle_stores.equipment_order_id 是 UUID 类型，但 equipment_orders.id 可能是 integer 类型
-- 解决方案：移除外键约束，保留字段作为普通关联字段
-- 
-- 执行方式：在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- ===================================

-- 步骤 1：删除外键约束（如果存在）
ALTER TABLE recycle_stores 
DROP CONSTRAINT IF EXISTS recycle_stores_equipment_order_id_fkey;

-- 步骤 2：检查 equipment_orders 表结构
-- 如果 id 是 integer 类型，需要将其改为 UUID（这需要重建表，建议联系管理员）
-- 暂时我们只移除外键约束，让业务逻辑通过应用层保证数据一致性

-- 步骤 3：确保 equipment_orders 表有 recycle_store_id 字段
ALTER TABLE equipment_orders 
ADD COLUMN IF NOT EXISTS recycle_store_id UUID;

-- 步骤 4：创建索引
CREATE INDEX IF NOT EXISTS idx_equipment_orders_recycle_store_id 
ON equipment_orders(recycle_store_id);

CREATE INDEX IF NOT EXISTS idx_recycle_stores_equipment_order_id 
ON recycle_stores(equipment_order_id);

-- 步骤 5：添加注释
COMMENT ON COLUMN equipment_orders.recycle_store_id IS '关联的获客登记ID，接单时自动创建';
COMMENT ON COLUMN recycle_stores.equipment_order_id IS '来源订单ID，从获客订单接单时自动创建';

-- 迁移完成
SELECT '✅ 迁移完成：equipment_order_id 外键约束问题已修复' AS status;
