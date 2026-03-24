import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

@Injectable()
export class KnowledgeShareService {
  // 获取知识分享列表
  async findAll(keyword?: string) {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('knowledge_shares')
      .select(`
        id,
        user_id,
        title,
        content,
        category,
        tags,
        view_count,
        like_count,
        created_at,
        users!inner (
          nickname
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // 搜索关键词
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags,
      viewCount: item.view_count,
      likeCount: item.like_count,
      createdAt: item.created_at,
      author: Array.isArray(item.users) && item.users.length > 0 ? item.users[0].nickname : '匿名用户',
    }));
  }

  // 获取单个知识分享详情
  async findOne(id: string) {
    const supabase = getSupabaseClient();

    // 获取知识分享详情
    const { data: share, error: shareError } = await supabase
      .from('knowledge_shares')
      .select(`
        *,
        users!inner (
          nickname,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (shareError || !share) {
      throw new Error('知识分享不存在');
    }

    // 增加浏览量
    await supabase
      .from('knowledge_shares')
      .update({ view_count: (share.view_count || 0) + 1 })
      .eq('id', id);

    return {
      id: share.id,
      userId: share.user_id,
      title: share.title,
      content: share.content,
      category: share.category,
      tags: share.tags,
      attachments: share.attachments || [],
      viewCount: (share.view_count || 0) + 1,
      likeCount: share.like_count || 0,
      isPublished: share.is_published,
      createdAt: share.created_at,
      updatedAt: share.updated_at,
      author: share.users?.nickname || '匿名用户',
      authorAvatar: share.users?.avatar_url || '',
    };
  }

  // 创建知识分享
  async create(userId: string, data: any) {
    const supabase = getSupabaseClient();

    const { data: newShare, error } = await supabase
      .from('knowledge_shares')
      .insert({
        user_id: userId,
        title: data.title,
        content: data.content,
        category: data.category || 'uncategorized',
        tags: data.tags || [],
        attachments: data.attachments || [],
        view_count: 0,
        like_count: 0,
        is_published: data.isPublished !== false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建失败: ${error.message}`);
    }

    return newShare;
  }

  // 更新知识分享
  async update(id: string, userId: string, data: any) {
    const supabase = getSupabaseClient();

    // 检查是否存在且是作者
    const { data: existing, error: checkError } = await supabase
      .from('knowledge_shares')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      throw new Error('知识分享不存在');
    }

    if (existing.user_id !== userId) {
      throw new Error('无权修改此知识分享');
    }

    const { data: updated, error: updateError } = await supabase
      .from('knowledge_shares')
      .update({
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        attachments: data.attachments,
        is_published: data.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`更新失败: ${updateError.message}`);
    }

    return updated;
  }

  // 删除知识分享
  async remove(id: string, userId: string) {
    const supabase = getSupabaseClient();

    // 检查是否存在且是作者
    const { data: existing, error: checkError } = await supabase
      .from('knowledge_shares')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      throw new Error('知识分享不存在');
    }

    if (existing.user_id !== userId) {
      throw new Error('无权删除此知识分享');
    }

    const { error: deleteError } = await supabase
      .from('knowledge_shares')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`删除失败: ${deleteError.message}`);
    }

    return { message: '删除成功' };
  }

  // 点赞知识分享
  async like(id: string) {
    const supabase = getSupabaseClient();

    const { data: share, error: getError } = await supabase
      .from('knowledge_shares')
      .select('like_count')
      .eq('id', id)
      .single();

    if (getError || !share) {
      throw new Error('知识分享不存在');
    }

    const { error: updateError } = await supabase
      .from('knowledge_shares')
      .update({ like_count: (share.like_count || 0) + 1 })
      .eq('id', id);

    if (updateError) {
      throw new Error(`点赞失败: ${updateError.message}`);
    }

    return { message: '点赞成功' };
  }
}
