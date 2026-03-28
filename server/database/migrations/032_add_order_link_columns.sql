-- ===================================
-- 迁移：添加获客订单与获客登记关联字段（无外键约束）
-- ===================================
-- 执行状态：✅ 已成功执行
-- 执行时间：2026-03-28
-- 结果：
--   - equipment_orders.recycle_store_id (UUID) 已添加
--   - recycle_stores.equipment_order_id (UUID) 已添加
--   - 索引已创建
-- ===================================

-- 以下 SQL 已执行：

-- ALTER TABLE equipment_orders ADD COLUMN IF NOT EXISTS recycle_store_id UUID;
-- ALTER TABLE recycle_stores ADD COLUMN IF NOT EXISTS equipment_order_id UUID;
-- CREATE INDEX IF NOT EXISTS idx_equipment_orders_recycle_store_id ON equipment_orders(recycle_store_id);
-- CREATE INDEX IF NOT EXISTS idx_recycle_stores_equipment_order_id ON recycle_stores(equipment_order_id);
-- COMMENT ON COLUMN equipment_orders.recycle_store_id IS '关联的获客登记ID，接单时自动创建';
-- COMMENT ON COLUMN recycle_stores.equipment_order_id IS '来源订单ID，从获客订单接单时自动创建';

-- 验证查询：
-- SELECT column_name FROM information_schema.columns 
-- WHERE (table_name = 'equipment_orders' AND column_name = 'recycle_store_id')
--    OR (table_name = 'recycle_stores' AND column_name = 'equipment_order_id');
