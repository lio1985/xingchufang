"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationManagerService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
let ConversationManagerService = class ConversationManagerService {
    constructor() {
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async createConversation(userId) {
        const conversationId = crypto.randomUUID();
        const { data, error } = await this.client
            .from('ai_conversations')
            .insert({
            id: conversationId,
            user_id: userId,
            status: 'active',
            current_intent: null,
            collected_params: {},
        })
            .select()
            .single();
        if (error) {
            console.error('创建对话失败:', error);
            throw new Error(`创建对话失败: ${error.message}`);
        }
        return this.mapToConversation(data);
    }
    async getConversation(conversationId) {
        const { data, error } = await this.client
            .from('ai_conversations')
            .select('*')
            .eq('id', conversationId)
            .single();
        if (error) {
            console.error('获取对话失败:', error);
            return null;
        }
        return this.mapToConversation(data);
    }
    async updateConversationIntent(conversationId, intent) {
        const { error } = await this.client
            .from('ai_conversations')
            .update({
            current_intent: intent,
            updated_at: new Date().toISOString(),
        })
            .eq('id', conversationId);
        if (error) {
            console.error('更新对话意图失败:', error);
            throw new Error(`更新对话意图失败: ${error.message}`);
        }
    }
    async updateCollectedParams(conversationId, params) {
        const { error } = await this.client
            .from('ai_conversations')
            .update({
            collected_params: params,
            updated_at: new Date().toISOString(),
        })
            .eq('id', conversationId);
        if (error) {
            console.error('更新参数失败:', error);
            throw new Error(`更新参数失败: ${error.message}`);
        }
    }
    async mergeCollectedParams(conversationId, newParams) {
        const conversation = await this.getConversation(conversationId);
        if (!conversation) {
            throw new Error('对话不存在');
        }
        const mergedParams = {
            ...conversation.collectedParams,
            ...newParams,
        };
        await this.updateCollectedParams(conversationId, mergedParams);
    }
    async updateConversationStatus(conversationId, status) {
        const { error } = await this.client
            .from('ai_conversations')
            .update({
            status,
            updated_at: new Date().toISOString(),
        })
            .eq('id', conversationId);
        if (error) {
            console.error('更新对话状态失败:', error);
            throw new Error(`更新对话状态失败: ${error.message}`);
        }
    }
    async addMessage(conversationId, role, content, metadata = null) {
        const messageId = crypto.randomUUID();
        const { data, error } = await this.client
            .from('ai_messages')
            .insert({
            id: messageId,
            conversation_id: conversationId,
            role,
            content,
            metadata,
        })
            .select()
            .single();
        if (error) {
            console.error('添加消息失败:', error);
            throw new Error(`添加消息失败: ${error.message}`);
        }
        return data;
    }
    async getConversationHistory(conversationId, limit = 50) {
        const { data, error } = await this.client
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error) {
            console.error('获取对话历史失败:', error);
            return [];
        }
        return data.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt).getTime(),
        }));
    }
    async getActiveConversation(userId) {
        const { data, error } = await this.client
            .from('ai_conversations')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            console.error('获取活跃对话失败:', error);
            return null;
        }
        return this.mapToConversation(data);
    }
    async completeConversation(conversationId) {
        await this.updateConversationStatus(conversationId, 'completed');
    }
    async cancelConversation(conversationId) {
        await this.updateConversationStatus(conversationId, 'cancelled');
    }
    async cleanupOldConversations() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { error } = await this.client
            .from('ai_conversations')
            .update({ status: 'cancelled' })
            .eq('status', 'active')
            .lt('updated_at', oneDayAgo);
        if (error) {
            console.error('清理旧对话失败:', error);
        }
    }
    mapToConversation(data) {
        return {
            id: data.id,
            userId: data.user_id,
            status: data.status,
            currentIntent: data.current_intent || null,
            collectedParams: data.collected_params || {},
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
};
exports.ConversationManagerService = ConversationManagerService;
exports.ConversationManagerService = ConversationManagerService = __decorate([
    (0, common_1.Injectable)()
], ConversationManagerService);
//# sourceMappingURL=conversation-manager.service.js.map