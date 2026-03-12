import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { Intent, Message } from './intent-recognition.service';

export interface Conversation {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'cancelled';
  currentIntent: Intent | null;
  collectedParams: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

@Injectable()
export class ConversationManagerService {
  private client = getSupabaseClient();

  /**
   * 创建新对话
   */
  async createConversation(userId: string): Promise<Conversation> {
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

  /**
   * 获取对话
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
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

  /**
   * 更新对话意图
   */
  async updateConversationIntent(conversationId: string, intent: Intent): Promise<void> {
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

  /**
   * 更新已收集的参数
   */
  async updateCollectedParams(conversationId: string, params: Record<string, any>): Promise<void> {
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

  /**
   * 合并已收集的参数
   */
  async mergeCollectedParams(conversationId: string, newParams: Record<string, any>): Promise<void> {
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

  /**
   * 更新对话状态
   */
  async updateConversationStatus(
    conversationId: string,
    status: 'active' | 'completed' | 'cancelled'
  ): Promise<void> {
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

  /**
   * 添加消息到对话
   */
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata: Record<string, any> | null = null
  ): Promise<StoredMessage> {
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

  /**
   * 获取对话历史
   */
  async getConversationHistory(conversationId: string, limit: number = 50): Promise<Message[]> {
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

  /**
   * 获取用户的活跃对话
   */
  async getActiveConversation(userId: string): Promise<Conversation | null> {
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

  /**
   * 完成对话
   */
  async completeConversation(conversationId: string): Promise<void> {
    await this.updateConversationStatus(conversationId, 'completed');
  }

  /**
   * 取消对话
   */
  async cancelConversation(conversationId: string): Promise<void> {
    await this.updateConversationStatus(conversationId, 'cancelled');
  }

  /**
   * 清理旧对话（超过24小时的活跃对话）
   */
  async cleanupOldConversations(): Promise<void> {
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

  /**
   * 将数据库记录映射为Conversation对象
   */
  private mapToConversation(data: any): Conversation {
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
}
