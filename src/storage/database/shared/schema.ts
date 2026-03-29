import { pgTable, serial, timestamp, varchar, integer, text, boolean, index, numeric, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 推荐类型枚举
export type RecommendType = 'hot' | 'new' | 'sale' | 'featured';

// 商品推荐表
export const productRecommendations = pgTable(
  "product_recommendations",
  {
    id: serial().primaryKey(),
    product_id: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    recommend_type: varchar("recommend_type", { length: 20 }).notNull(), // hot/new/sale/featured
    start_date: timestamp("start_date", { withTimezone: true }),
    end_date: timestamp("end_date", { withTimezone: true }),
    sort_order: integer("sort_order").default(0).notNull(),
    created_by: varchar("created_by", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("product_recommendations_type_idx").on(table.recommend_type),
    index("product_recommendations_product_id_idx").on(table.product_id),
    unique("product_recommendations_unique").on(table.product_id, table.recommend_type),
  ]
);

// 供应商代码映射表
export const supplierCodes = pgTable(
  "supplier_codes",
  {
    id: serial().primaryKey(),
    supplier_name: varchar("supplier_name", { length: 100 }).notNull().unique(),
    supplier_code: varchar("supplier_code", { length: 10 }).notNull().unique(),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_supplier_codes_name").on(table.supplier_name),
  ]
);

// 分类编码规则表
export const categoryCodes = pgTable(
  "category_codes",
  {
    id: serial().primaryKey(),
    level1_category: varchar("level1_category", { length: 100 }),
    level2_category: varchar("level2_category", { length: 100 }),
    category_code: varchar("category_code", { length: 20 }).notNull(),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_category_codes_code").on(table.category_code),
    unique("category_codes_unique").on(table.level1_category, table.level2_category, table.category_code),
  ]
);

// 编码配置表
export const codeConfig = pgTable(
  "code_config",
  {
    id: serial().primaryKey(),
    config_key: varchar("config_key", { length: 50 }).notNull().unique(),
    config_value: text("config_value").notNull(),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  }
);

// 商品表
export const products = pgTable(
  "products",
  {
    id: serial().primaryKey(),
    category_code: varchar("category_code", { length: 50 }),
    level1_code: integer("level1_code"),
    level1_category: varchar("level1_category", { length: 100 }),
    level2_code: integer("level2_code"),
    level2_category: varchar("level2_category", { length: 100 }),
    name: varchar("name", { length: 255 }).notNull(),
    brand: varchar("brand", { length: 100 }),
    spec: varchar("spec", { length: 255 }),
    params: text("params"),
    price: varchar("price", { length: 100 }),
    supplier: varchar("supplier", { length: 100 }),
    product_code: varchar("product_code", { length: 50 }),
    origin: varchar("origin", { length: 100 }),
    warranty: text("warranty"),
    selling_points: text("selling_points"),
    remarks: text("remarks"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("products_name_idx").on(table.name),
    index("products_supplier_idx").on(table.supplier),
    index("products_level1_category_idx").on(table.level1_category),
    index("products_level2_category_idx").on(table.level2_category),
  ]
);

// 商品图片表
export const productImages = pgTable(
  "product_images",
  {
    id: serial().primaryKey(),
    product_id: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    image_key: varchar("image_key", { length: 255 }).notNull(),
    is_primary: boolean("is_primary").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_images_product_id_idx").on(table.product_id),
  ]
);
