import { relations } from "drizzle-orm/relations";
import { aiConversations, aiMessages, users, customerDemands, demandTransfers, liveStreams, liveProducts, liveAnalysis, purchaseTransfers, conversations, messages, notifications, userNotifications, userProfiles, demandActivityLogs, equipmentOrders, orderTransfers } from "./schema";

export const aiMessagesRelations = relations(aiMessages, ({one}) => ({
	aiConversation: one(aiConversations, {
		fields: [aiMessages.conversationId],
		references: [aiConversations.id]
	}),
}));

export const aiConversationsRelations = relations(aiConversations, ({many}) => ({
	aiMessages: many(aiMessages),
}));

export const customerDemandsRelations = relations(customerDemands, ({one, many}) => ({
	user_acceptedBy: one(users, {
		fields: [customerDemands.acceptedBy],
		references: [users.id],
		relationName: "customerDemands_acceptedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [customerDemands.createdBy],
		references: [users.id],
		relationName: "customerDemands_createdBy_users_id"
	}),
	demandTransfers: many(demandTransfers),
	demandActivityLogs: many(demandActivityLogs),
}));

export const usersRelations = relations(users, ({many}) => ({
	customerDemands_acceptedBy: many(customerDemands, {
		relationName: "customerDemands_acceptedBy_users_id"
	}),
	customerDemands_createdBy: many(customerDemands, {
		relationName: "customerDemands_createdBy_users_id"
	}),
	demandTransfers_fromUserId: many(demandTransfers, {
		relationName: "demandTransfers_fromUserId_users_id"
	}),
	demandTransfers_toUserId: many(demandTransfers, {
		relationName: "demandTransfers_toUserId_users_id"
	}),
	purchaseTransfers_createdBy: many(purchaseTransfers, {
		relationName: "purchaseTransfers_createdBy_users_id"
	}),
	purchaseTransfers_takenBy: many(purchaseTransfers, {
		relationName: "purchaseTransfers_takenBy_users_id"
	}),
	userProfiles: many(userProfiles),
	demandActivityLogs: many(demandActivityLogs),
	equipmentOrders_takenBy: many(equipmentOrders, {
		relationName: "equipmentOrders_takenBy_users_id"
	}),
	equipmentOrders_createdBy: many(equipmentOrders, {
		relationName: "equipmentOrders_createdBy_users_id"
	}),
	orderTransfers_fromUserId: many(orderTransfers, {
		relationName: "orderTransfers_fromUserId_users_id"
	}),
	orderTransfers_toUserId: many(orderTransfers, {
		relationName: "orderTransfers_toUserId_users_id"
	}),
}));

export const demandTransfersRelations = relations(demandTransfers, ({one}) => ({
	customerDemand: one(customerDemands, {
		fields: [demandTransfers.demandId],
		references: [customerDemands.id]
	}),
	user_fromUserId: one(users, {
		fields: [demandTransfers.fromUserId],
		references: [users.id],
		relationName: "demandTransfers_fromUserId_users_id"
	}),
	user_toUserId: one(users, {
		fields: [demandTransfers.toUserId],
		references: [users.id],
		relationName: "demandTransfers_toUserId_users_id"
	}),
}));

export const liveProductsRelations = relations(liveProducts, ({one}) => ({
	liveStream: one(liveStreams, {
		fields: [liveProducts.liveStreamId],
		references: [liveStreams.id]
	}),
}));

export const liveStreamsRelations = relations(liveStreams, ({many}) => ({
	liveProducts: many(liveProducts),
	liveAnalyses: many(liveAnalysis),
}));

export const liveAnalysisRelations = relations(liveAnalysis, ({one}) => ({
	liveStream: one(liveStreams, {
		fields: [liveAnalysis.liveStreamId],
		references: [liveStreams.id]
	}),
}));

export const purchaseTransfersRelations = relations(purchaseTransfers, ({one}) => ({
	user_createdBy: one(users, {
		fields: [purchaseTransfers.createdBy],
		references: [users.id],
		relationName: "purchaseTransfers_createdBy_users_id"
	}),
	user_takenBy: one(users, {
		fields: [purchaseTransfers.takenBy],
		references: [users.id],
		relationName: "purchaseTransfers_takenBy_users_id"
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({many}) => ({
	messages: many(messages),
}));

export const userNotificationsRelations = relations(userNotifications, ({one}) => ({
	notification: one(notifications, {
		fields: [userNotifications.notificationId],
		references: [notifications.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({many}) => ({
	userNotifications: many(userNotifications),
}));

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));

export const demandActivityLogsRelations = relations(demandActivityLogs, ({one}) => ({
	customerDemand: one(customerDemands, {
		fields: [demandActivityLogs.demandId],
		references: [customerDemands.id]
	}),
	user: one(users, {
		fields: [demandActivityLogs.userId],
		references: [users.id]
	}),
}));

export const equipmentOrdersRelations = relations(equipmentOrders, ({one, many}) => ({
	user_takenBy: one(users, {
		fields: [equipmentOrders.takenBy],
		references: [users.id],
		relationName: "equipmentOrders_takenBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [equipmentOrders.createdBy],
		references: [users.id],
		relationName: "equipmentOrders_createdBy_users_id"
	}),
	orderTransfers: many(orderTransfers),
}));

export const orderTransfersRelations = relations(orderTransfers, ({one}) => ({
	equipmentOrder: one(equipmentOrders, {
		fields: [orderTransfers.orderId],
		references: [equipmentOrders.id]
	}),
	user_fromUserId: one(users, {
		fields: [orderTransfers.fromUserId],
		references: [users.id],
		relationName: "orderTransfers_fromUserId_users_id"
	}),
	user_toUserId: one(users, {
		fields: [orderTransfers.toUserId],
		references: [users.id],
		relationName: "orderTransfers_toUserId_users_id"
	}),
}));