import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '../../storage/database/supabase-client';
import { UserService } from '../../user/user.service';

@Injectable()
export class ConversationService {
  private client = getSupabaseClient();

  constructor(private readonly userService: UserService) {}

  async getList(currentUserId: string, targetUserId?: string) {
    console.log('=== 获取对话列表 ===');
    console.log('当前用户ID:', currentUserId);
    console.log('目标用户ID:', targetUserId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 如果不是管理员且指定了目标用户ID，则只能查看自己的对话
      if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
        throw new ForbiddenException('无权查看其他用户的对话');
      }

      // 确定要查询的用户ID
      // targetUserId 在 controller 层已验证，如果是非法字符串会抛出 400
      // 如果 targetUserId 是 undefined，表示不传参数，查询当前用户的对话
      const queryUserId = targetUserId || currentUserId;

      const { data, error } = await this.client
        .from('conversations')
        .select('*')
        .eq('user_id', queryUserId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      console.log(`找到 ${data?.length || 0} 个对话`);
      return data;
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

  async create(body: { userId: string; title: string; model: string }) {
    console.log('=== 创建对话 ===');
    console.log('用户ID:', body.userId);
    console.log('标题:', body.title);
    console.log('模型:', body.model);

    const { data, error } = await this.client
      .from('conversations')
      .insert({
        user_id: body.userId,
        title: body.title,
        model: body.model,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    console.log('对话创建成功:', data.id);
    return data;
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
