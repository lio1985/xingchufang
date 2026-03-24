import { relations } from "drizzle-orm/relations";
import { notifications, userNotifications, liveStreams, liveProducts, liveAnalysis, users, userProfiles, aiConversations, aiMessages, conversations, messages } from "./schema";

export const userNotificationsRelations = relations(userNotifications, ({one}) => ({
	notification: one(notifications, {
		fields: [userNotifications.notificationId],
		references: [notifications.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({many}) => ({
	userNotifications: many(userNotifications),
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

export const userProfilesRelations = relations(userProfiles, ({one}) => ({
	user: one(users, {
		fields: [userProfiles.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userProfiles: many(userProfiles),
}));

export const aiMessagesRelations = relations(aiMessages, ({one}) => ({
	aiConversation: one(aiConversations, {
		fields: [aiMessages.conversationId],
		references: [aiConversations.id]
	}),
}));

export const aiConversationsRelations = relations(aiConversations, ({many}) => ({
	aiMessages: many(aiMessages),
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