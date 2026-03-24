import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '../../storage/database/supabase-client';
import { UserService } from '../../user/user.service';
import { v5 as uuidv5 } from 'uuid';
import { Pool } from 'pg';

// 命名空间 UUID 用于生成一致的 UUID
const GUEST_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// 直接使用 PostgreSQL 连接，绕过 PostgREST schema 缓存问题
const pgPool = new Pool({
  connectionString: process.env.PGDATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

@Injectable()
export class ConversationService {
  private client = getSupabaseClient();

  constructor(private readonly userService: UserService) {}

  /**
   * 将任意用户ID转换为UUID格式
   * 如果是有效的UUID则直接返回，否则使用v5生成
   */
  private toUuid(userId: string): string {
    // 检查是否已经是有效的UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(userId)) {
      return userId;
    }
    // 使用v5生成一致的UUID
    return uuidv5(userId, GUEST_NAMESPACE);
  }

  async getList(currentUserId: string, targetUserId?: string) {
    console.log('=== 获取对话列表 ===');
    console.log('当前用户ID (原始):', currentUserId);
    console.log('目标用户ID (原始):', targetUserId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 如果不是管理员且指定了目标用户ID，则只能查看自己的对话
      if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
        throw new ForbiddenException('无权查看其他用户的对话');
      }

      // 将用户ID转换为UUID格式（与create方法保持一致）
      const queryUserId = this.toUuid(targetUserId || currentUserId);
      console.log('查询用户ID (转换后):', queryUserId);

      // 使用 pg 直接连接 PostgreSQL，与 create 方法保持一致
      const result = await pgPool.query(
        'SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC',
        [queryUserId]
      );
      
      console.log(`找到 ${result.rows.length} 个对话`);
      return result.rows;
    } catch (error: any) {
      console.error('获取对话列表失败:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(error.message || '获取对话列表失败');
    }
  }

  async getDetail(conversationId: string, currentUserId: string) {
    console.log('=== 获取对话详情 ===');
    console.log('对话ID:', conversationId);
    console.log('当前用户ID:', currentUserId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取对话信息
      const { data, error } = await this.client
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException('对话不存在');
        }
        throw new Error(error.message);
      }

      // 验证访问权限
      if (!isAdmin && data.user_id !== currentUserId) {
        throw new ForbiddenException('无权访问此对话');
      }

      const { data: messages, error: msgError } = await this.client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) throw new Error(msgError.message);

      console.log(`找到 ${messages?.length || 0} 条消息`);
      return { ...data, messages };
    } catch (error: any) {
      console.error('获取对话详情失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || '获取对话详情失败');
    }
  }

  async create(body: { userId: string; title: string; model?: string }) {
    console.log('=== 创建对话 ===');
    console.log('原始用户ID:', body.userId);
    
    // 将用户ID转换为UUID格式
    const userId = this.toUuid(body.userId);
    console.log('转换后用户ID:', userId);
    console.log('标题:', body.title);

    try {
      // 使用 pg 直接连接 PostgreSQL，绕过 PostgREST schema 缓存问题
      const query = `
        INSERT INTO conversations (user_id, title)
        VALUES ($1, $2)
        RETURNING id, user_id, title, created_at, updated_at
      `;
      const values = [userId, body.title];
      
      const result = await pgPool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('创建对话失败：没有返回数据');
      }
      
      const data = result.rows[0];
      console.log('对话创建成功:', data.id);
      return data;
    } catch (err: any) {
      console.error('创建对话异常:', err);
      throw new Error(err?.message || '创建对话失败');
    }
  }

  async addMessage(body: { conversationId: string; role: string; content: string; metadata?: any }) {
    console.log('=== 添加消息 ===');
    console.log('对话ID:', body.conversationId);
    console.log('角色:', body.role);

    const { data, error } = await this.client
      .from('messages')
      .insert({
        conversation_id: body.conversationId,
        role: body.role,
        content: body.content,
        metadata: body.metadata,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    console.log('消息添加成功:', data.id);
    return data;
  }

  async delete(conversationId: string, currentUserId: string) {
    console.log('=== 删除对话 ===');
    console.log('对话ID:', conversationId);
    console.log('当前用户ID:', currentUserId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取对话信息
      const { data, error: fetchError } = await this.client
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new NotFoundException('对话不存在');
        }
        throw new Error(fetchError.message);
      }

      // 验证权限
      if (!isAdmin && data.user_id !== currentUserId) {
        throw new ForbiddenException('无权删除此对话');
      }

      const { error } = await this.client
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw new Error(error.message);
      console.log('对话已删除');
      return { success: true };
    } catch (error: any) {
      console.error('删除对话失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || '删除对话失败');
    }
  }
}
