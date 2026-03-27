import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { PermissionService } from '../permission/permission.service';
import { UserRole, DataVisibility, PermissionAction, PermissionResource } from '../permission/permission.constants';

@Injectable()
export class KnowledgeShareService {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * 获取知识分享列表（带数据隔离）
   */
  async findAll(userId: string, keyword?: string) {
    const supabase = getSupabaseClient();

    // 获取用户权限上下文
    const context = await this.permissionService.getUserContext(userId);
    if (!context) {
      throw new ForbiddenException('用户信息不存在');
    }

    let query = supabase
      .from('knowledge_shares')
      .select(`
        id,
        user_id,
        title,
        content,
        category,
        tags,
        source,
        visibility,
        view_count,
        like_count,
        created_at,
        users!inner (
          nickname
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // 数据隔离：非管理员只能看到公开的或自己团队的
    if (context.role !== UserRole.ADMIN) {
      // 公开的 + 自己的 + 团队可见且在同一团队
      const accessibleUserIds = await this.permissionService.getAccessibleUserIds(userId);
      query = query.or(`visibility.eq.public,user_id.in.(${accessibleUserIds.join(',')})`);
    }

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`查询失败: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: item.tags,
      source: item.source,
      visibility: item.visibility,
      viewCount: item.view_count,
      likeCount: item.like_count,
      createdAt: item.created_at,
      author: Array.isArray(item.users) && item.users.length > 0 ? item.users[0].nickname : '匿名用户',
    }));
  }

  /**
   * 获取单个知识分享详情
   */
  async findOne(id: string, userId: string) {
    const supabase = getSupabaseClient();

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
      throw new NotFoundException('知识分享不存在');
    }

    // 检查访问权限
    const canAccess = await this.permissionService.canAccessData(
      userId,
      share.user_id,
      share.visibility || DataVisibility.PUBLIC,
      share.team_id,
    );

    if (!canAccess && !share.is_published) {
      throw new ForbiddenException('无权访问此知识分享');
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
      source: share.source,
      visibility: share.visibility,
      viewCount: (share.view_count || 0) + 1,
      likeCount: share.like_count || 0,
      isPublished: share.is_published,
      createdAt: share.created_at,
      updatedAt: share.updated_at,
      author: share.users?.nickname || '匿名用户',
      authorAvatar: share.users?.avatar_url || '',
    };
  }

  /**
   * 创建知识分享
   */
  async create(userId: string, data: any) {
    // 权限检查
    await this.permissionService.requirePermission(
      userId,
      PermissionResource.KNOWLEDGE_SHARE,
      PermissionAction.CREATE,
    );

    const supabase = getSupabaseClient();

    // 获取用户信息判断来源
    const context = await this.permissionService.getUserContext(userId);
    const source = context?.role === UserRole.ADMIN ? 'admin' : 'employee';

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
        source: source,
        visibility: data.visibility || DataVisibility.PUBLIC,
        team_id: context?.teamId || null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`创建失败: ${error.message}`);
    }

    return newShare;
  }

  /**
   * 更新知识分享
   */
  async update(id: string, userId: string, data: any) {
    const supabase = getSupabaseClient();

    // 检查编辑权限
    const permissionCheck = await this.permissionService.canEditContent(userId, id, 'knowledge_share');
    if (!permissionCheck.canEdit) {
      throw new ForbiddenException(permissionCheck.reason || '无权修改此知识分享');
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
        visibility: data.visibility,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(`更新失败: ${updateError.message}`);
    }

    return updated;
  }

  /**
   * 删除知识分享
   */
  async remove(id: string, userId: string) {
    const supabase = getSupabaseClient();

    // 检查删除权限
    const permissionCheck = await this.permissionService.canDeleteContent(userId, id, 'knowledge_share');
    if (!permissionCheck.canDelete) {
      throw new ForbiddenException(permissionCheck.reason || '无权删除此知识分享');
    }

    const { error: deleteError } = await supabase
      .from('knowledge_shares')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new BadRequestException(`删除失败: ${deleteError.message}`);
    }

    return { message: '删除成功' };
  }

  /**
   * 点赞知识分享
   */
  async like(id: string, userId: string) {
    const supabase = getSupabaseClient();

    // 检查是否有查看权限
    const { data: share, error: getError } = await supabase
      .from('knowledge_shares')
      .select('like_count, user_id, visibility, team_id')
      .eq('id', id)
      .single();

    if (getError || !share) {
      throw new NotFoundException('知识分享不存在');
    }

    // 检查访问权限
    const canAccess = await this.permissionService.canAccessData(
      userId,
      share.user_id,
      share.visibility || DataVisibility.PUBLIC,
      share.team_id,
    );

    if (!canAccess) {
      throw new ForbiddenException('无权访问此知识分享');
    }

    const { error: updateError } = await supabase
      .from('knowledge_shares')
      .update({ like_count: (share.like_count || 0) + 1 })
      .eq('id', id);

    if (updateError) {
      throw new BadRequestException(`点赞失败: ${updateError.message}`);
    }

    return { message: '点赞成功' };
  }

  /**
   * 获取用户自己的知识分享列表
   */
  async findByUserId(userId: string, page: number = 1, pageSize: number = 20) {
    const supabase = getSupabaseClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('knowledge_shares')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new BadRequestException(`查询失败: ${error.message}`);
    }

    return {
      list: data,
      total: count || 0,
      page,
      pageSize,
    };
  }

  /**
   * 管理员获取所有知识分享
   */
  async findAllForAdmin(userId: string, page: number = 1, pageSize: number = 20) {
    await this.permissionService.requirePermission(
      userId,
      PermissionResource.KNOWLEDGE_SHARE,
      PermissionAction.READ,
    );

    const isAdmin = await this.permissionService.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const supabase = getSupabaseClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('knowledge_shares')
      .select('*, users(nickname, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new BadRequestException(`查询失败: ${error.message}`);
    }

    return {
      list: data,
      total: count || 0,
      page,
      pageSize,
    };
  }
}
