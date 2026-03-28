# 数据库迁移 031：修复 equipment_order_id 外键约束问题

## 问题描述

`recycle_stores.equipment_order_id` 字段（UUID 类型）试图创建外键约束引用 `equipment_orders.id`，但 `equipment_orders.id` 在数据库中可能是 integer 类型，导致类型不匹配错误。

## 解决方案

移除外键约束，保留字段作为普通关联字段，由应用层保证数据一致性。

## 执行步骤

### 方式 1：通过 Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：`bopwfsdkhiunxmhkzebk`
3. 进入 **SQL Editor** 页面
4. 复制以下 SQL 并执行：

```sql
-- 步骤 1：删除外键约束（如果存在）
ALTER TABLE recycle_stores 
DROP CONSTRAINT IF EXISTS recycle_stores_equipment_order_id_fkey;

-- 步骤 2：确保 equipment_orders 表有 recycle_store_id 字段
ALTER TABLE equipment_orders 
ADD COLUMN IF NOT EXISTS recycle_store_id UUID;

-- 步骤 3：创建索引
CREATE INDEX IF NOT EXISTS idx_equipment_orders_recycle_store_id 
ON equipment_orders(recycle_store_id);

CREATE INDEX IF NOT EXISTS idx_recycle_stores_equipment_order_id 
ON recycle_stores(equipment_order_id);

-- 步骤 4：添加注释
COMMENT ON COLUMN equipment_orders.recycle_store_id IS '关联的获客登记ID，接单时自动创建';
COMMENT ON COLUMN recycle_stores.equipment_order_id IS '来源订单ID，从获客订单接单时自动创建';
```

### 方式 2：通过 psql 命令行

如果有数据库连接字符串：

```bash
psql "postgresql://postgres:[PASSWORD]@db.bopwfsdkhiunxmhkzebk.supabase.co:5432/postgres" \
  -f server/database/migrations/031_fix_equipment_order_fkey.sql
```

## 验证

执行完成后，验证表结构：

```sql
-- 检查 recycle_stores 表的 equipment_order_id 字段
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'recycle_stores' 
AND column_name = 'equipment_order_id';

-- 检查外键约束是否已删除
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'recycle_stores'
AND constraint_type = 'FOREIGN KEY'
AND constraint_name LIKE '%equipment_order%';

-- 应该返回 0 行，表示外键约束已删除
```

## 注意事项

- 此迁移会移除外键约束，数据一致性由应用层保证
- 已创建索引以优化查询性能
- 建议在业务低峰期执行迁移
