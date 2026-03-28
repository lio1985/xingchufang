import { pgTable, serial, timestamp, varchar, integer, text, boolean, index, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

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
