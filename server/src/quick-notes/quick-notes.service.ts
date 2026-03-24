import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { UserService } from '../user/user.service';
import {
  QuickNote,
  QuickNoteListResponse,
  CreateQuickNoteDto,
  UpdateQuickNoteDto,
} from './types';

@Injectable()
export class QuickNotesService {
  private client = getSupabaseClient();

  constructor(private readonly userService: UserService) {}

  /**
   * 验证用户是否有权访问笔记
   */
  private async validateAccess(userId: string, noteId: string): Promise<QuickNote> {
    const { data: note, error } = await this.client
      .from('quick_notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (error) {
      throw new NotFoundException('笔记不存在');
    }

    // 检查用户是否是管理员
    const isAdmin = await this.userService.isAdmin(userId);

    // 如果不是管理员且不是所有者，拒绝访问
    if (!isAdmin && note.user_id !== userId) {
      throw new ForbiddenException('无权访问此笔记');
    }

    return note;
  }

  /**
   * 获取所有用户的笔记（管理员）
   */
  async getAllForAdmin(
    userId: string,
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    tag?: string,
    showStarredOnly?: boolean,
  ): Promise<QuickNoteListResponse> {
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    let query = this.client
      .from('quick_notes')
      .select('*', { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    // 搜索功能
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // 标签筛选
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // 仅星标
    if (showStarredOnly) {
      query = query.eq('is_starred', true);
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      notes: (data as QuickNote[]) || [],
      total: count || 0,
      page,
      pageSize,
    };
  }

  /**
   * 获取指定用户的笔记
   */
  async getByUserId(
    currentUserId: string,
    targetUserId: string,
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    tag?: string,
    showStarredOnly?: boolean,
  ): Promise<QuickNoteListResponse> {
    // 验证权限
    const isAdmin = await this.userService.isAdmin(currentUserId);
    if (!isAdmin && currentUserId !== targetUserId) {
      throw new ForbiddenException('无权查看其他用户的笔记');
    }

    let query = this.client
      .from('quick_notes')
      .select('*', { count: 'exact' })
      .eq('user_id', targetUserId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    // 搜索功能
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // 标签筛选
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // 仅星标
    if (showStarredOnly) {
      query = query.eq('is_starred', true);
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      notes: (data as QuickNote[]) || [],
      total: count || 0,
      page,
      pageSize,
    };
  }

  /**
   * 根据 ID 获取笔记详情
   */
  async getById(userId: string, id: string): Promise<QuickNote> {
    const note = await this.validateAccess(userId, id);

    // 获取用户信息（昵称）
    const { data: userData } = await this.client
      .from('users')
      .select('nickname, username, avatar_url')
      .eq('id', note.user_id)
      .single();

    return {
      ...note,
      userNickname: userData?.nickname || userData?.username || '',
      userAvatar: userData?.avatar_url || '',
    } as any;
  }

  /**
   * 创建笔记
   */
  async create(userId: string, dto: CreateQuickNoteDto): Promise<QuickNote> {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('quick_notes')
      .insert({
        user_id: userId,
        title: dto.title,
        content: dto.content,
        tags: dto.tags || [],
        images: dto.images || [],
        is_starred: dto.is_starred || false,
        is_pinned: dto.is_pinned || false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as QuickNote;
  }

  /**
   * 更新笔记
   */
  async update(userId: string, id: string, dto: UpdateQuickNoteDto): Promise<QuickNote> {
    await this.validateAccess(userId, id);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.is_starred !== undefined) updateData.is_starred = dto.is_starred;
    if (dto.is_pinned !== undefined) updateData.is_pinned = dto.is_pinned;

    const { data, error } = await this.client
      .from('quick_notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as QuickNote;
  }

  /**
   * 删除笔记
   */
  async delete(userId: string, id: string): Promise<void> {
    await this.validateAccess(userId, id);

    const { error } = await this.client
      .from('quick_notes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * 批量删除笔记（管理员）
   */
  async batchDelete(userId: string, ids: string[]): Promise<void> {
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const { error } = await this.client
      .from('quick_notes')
      .delete()
      .in('id', ids);

    if (error) throw new Error(error.message);
  }

  /**
   * 切换星标状态
   */
  async toggleStar(userId: string, id: string): Promise<QuickNote> {
    const note = await this.validateAccess(userId, id);

    const { data, error } = await this.client
      .from('quick_notes')
      .update({ is_starred: !note.is_starred, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as QuickNote;
  }

  /**
   * 切换置顶状态
   */
  async togglePin(userId: string, id: string): Promise<QuickNote> {
    const note = await this.validateAccess(userId, id);

    const { data, error } = await this.client
      .from('quick_notes')
      .update({ is_pinned: !note.is_pinned, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as QuickNote;
  }

  /**
   * 获取所有标签（管理员）
   */
  async getAllTags(userId: string): Promise<string[]> {
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const { data, error } = await this.client
      .from('quick_notes')
      .select('tags');

    if (error) throw new Error(error.message);

    // 提取所有标签并去重
    const allTags = new Set<string>();
    (data as QuickNote[]).forEach(note => {
      note.tags.forEach(tag => allTags.add(tag));
    });

    return Array.from(allTags);
  }
}
