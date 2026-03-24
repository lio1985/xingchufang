import { pgTable, serial, timestamp, index, uuid, varchar, text, boolean, foreignKey, unique, integer, numeric, jsonb, date, check, pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	type: varchar({ length: 50 }).default('system'),
	targetType: varchar("target_type", { length: 50 }).default('all'),
	targetUsers: uuid("target_users").array().default([""]),
	senderId: uuid("sender_id"),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_notifications_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
]);

export const userNotifications = pgTable("user_notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	notificationId: uuid("notification_id").notNull(),
	isRead: boolean("is_read").default(false),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_notifications_notification_id").using("btree", table.notificationId.asc().nullsLast().op("uuid_ops")),
	index("idx_user_notifications_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.notificationId],
			foreignColumns: [notifications.id],
			name: "user_notifications_notification_id_fkey"
		}).onDelete("cascade"),
	unique("user_notifications_user_id_notification_id_key").on(table.userId, table.notificationId),
]);

export const liveStreams = pgTable("live_streams", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	liveId: varchar("live_id", { length: 100 }),
	title: varchar({ length: 500 }),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }),
	durationSeconds: integer("duration_seconds"),
	totalViews: integer("total_views").default(0),
	peakOnline: integer("peak_online").default(0),
	avgOnline: integer("avg_online").default(0),
	newFollowers: integer("new_followers").default(0),
	shareCount: integer("share_count").default(0),
	totalComments: integer("total_comments").default(0),
	totalLikes: integer("total_likes").default(0),
	totalGifts: integer("total_gifts").default(0),
	productClicks: integer("product_clicks").default(0),
	productExposures: integer("product_exposures").default(0),
	ordersCount: integer("orders_count").default(0),
	gmv: numeric({ precision: 12, scale:  2 }).default('0'),
	audienceGender: jsonb("audience_gender"),
	audienceAge: jsonb("audience_age"),
	audienceRegion: jsonb("audience_region"),
	rawData: jsonb("raw_data"),
	status: varchar({ length: 50 }).default('active'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_live_streams_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_live_streams_start_time").using("btree", table.startTime.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_live_streams_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_live_streams_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	unique("live_streams_live_id_key").on(table.liveId),
]);

export const liveProducts = pgTable("live_products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	liveStreamId: uuid("live_stream_id").notNull(),
	userId: uuid("user_id").notNull(),
	productName: varchar("product_name", { length: 500 }),
	productId: varchar("product_id", { length: 100 }),
	productImage: varchar("product_image", { length: 1000 }),
	productPrice: numeric("product_price", { precision: 10, scale:  2 }),
	exposures: integer().default(0),
	clicks: integer().default(0),
	orders: integer().default(0),
	gmv: numeric({ precision: 12, scale:  2 }).default('0'),
	refundOrders: integer("refund_orders").default(0),
	refundAmount: numeric("refund_amount", { precision: 12, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_live_products_live_stream_id").using("btree", table.liveStreamId.asc().nullsLast().op("uuid_ops")),
	index("idx_live_products_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.liveStreamId],
			foreignColumns: [liveStreams.id],
			name: "live_products_live_stream_id_fkey"
		}).onDelete("cascade"),
]);

export const liveAnalysis = pgTable("live_analysis", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	liveStreamId: uuid("live_stream_id").notNull(),
	userId: uuid("user_id").notNull(),
	summary: text(),
	strengths: text().array(),
	weaknesses: text().array(),
	suggestions: text().array(),
	trafficScore: integer("traffic_score"),
	interactionScore: integer("interaction_score"),
	conversionScore: integer("conversion_score"),
	overallScore: integer("overall_score"),
	comparisonData: jsonb("comparison_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_live_analysis_live_stream_id").using("btree", table.liveStreamId.asc().nullsLast().op("uuid_ops")),
	index("idx_live_analysis_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.liveStreamId],
			foreignColumns: [liveStreams.id],
			name: "live_analysis_live_stream_id_fkey"
		}).onDelete("cascade"),
]);

export const liveDailyStats = pgTable("live_daily_stats", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	statsDate: date("stats_date").notNull(),
	liveCount: integer("live_count").default(0),
	totalDurationSeconds: integer("total_duration_seconds").default(0),
	totalViews: integer("total_views").default(0),
	peakOnline: integer("peak_online").default(0),
	newFollowers: integer("new_followers").default(0),
	totalComments: integer("total_comments").default(0),
	totalLikes: integer("total_likes").default(0),
	totalGmv: numeric("total_gmv", { precision: 12, scale:  2 }).default('0'),
	totalOrders: integer("total_orders").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_live_daily_stats_date").using("btree", table.statsDate.desc().nullsFirst().op("date_ops")),
	index("idx_live_daily_stats_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	unique("live_daily_stats_user_id_stats_date_key").on(table.userId, table.statsDate),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	openid: text().notNull(),
	unionid: text(),
	employeeId: text("employee_id"),
	nickname: text(),
	avatarUrl: text("avatar_url"),
	role: text().default('user').notNull(),
	status: text().default('active').notNull(),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	password: text(),
}, (table) => [
	unique("users_openid_key").on(table.openid),
	unique("users_employee_id_key").on(table.employeeId),
	check("users_role_check", sql`role = ANY (ARRAY['user'::text, 'admin'::text])`),
	check("users_status_check", sql`status = ANY (ARRAY['active'::text, 'disabled'::text, 'deleted'::text, 'pending'::text])`),
]);

export const userProfiles = pgTable("user_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	realName: text("real_name"),
	phone: text(),
	email: text(),
	department: text(),
	position: text(),
	company: text(),
	employeeId: text("employee_id"),
	gender: text(),
	birthday: text(),
	address: text(),
	bio: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_profiles_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_profiles_user_id_key").on(table.userId),
]);

export const aiConversations = pgTable("ai_conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	status: varchar({ length: 20 }).default('active').notNull(),
	currentIntent: jsonb("current_intent"),
	collectedParams: jsonb("collected_params").default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ai_conversations_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_ai_conversations_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("idx_ai_conversations_user_status").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	pgPolicy("允许所有操作", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
	check("ai_conversations_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])`),
]);

export const aiMessages = pgTable("ai_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	role: varchar({ length: 20 }).notNull(),
	content: text().notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ai_messages_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("idx_ai_messages_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [aiConversations.id],
			name: "ai_messages_conversation_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("允许所有操作", { as: "permissive", for: "all", to: ["public"], using: sql`true`, withCheck: sql`true`  }),
	check("ai_messages_role_check", sql`(role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[])`),
]);

export const hotKeywords = pgTable("hot_keywords", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	platform: text().notNull(),
	rank: integer().notNull(),
	title: text().notNull(),
	hot: text(),
	url: text(),
	summary: text(),
	category: text(),
	trend: text(),
	trendChange: integer("trend_change"),
	isBursting: boolean("is_bursting").default(false),
	fetchedAt: timestamp("fetched_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id"),
	role: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "messages_conversation_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can insert messages in own conversations", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = messages.conversation_id) AND (c.user_id = auth.uid()))))`  }),
	pgPolicy("Users can view messages in own conversations", { as: "permissive", for: "select", to: ["public"] }),
	check("messages_role_check", sql`role = ANY (ARRAY['user'::text, 'assistant'::text])`),
]);

export const welcomeMessages = pgTable("welcome_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	message: text().notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	order: integer().default(0),
});

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	title: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	model: text(),
});
