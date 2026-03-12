import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { UserService } from '../user/user.service';

export interface ScheduledTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  reminderTime: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateTaskDto {
  userId: string;
  title: string;
  description?: string;
  reminderTime: string;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  reminderTime?: string;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
  status?: 'pending' | 'completed' | 'cancelled';
  isActive?: boolean;
}

@Injectable()
export class ScheduledTaskService {
  private client = getSupabaseClient();

  constructor(private readonly userService: UserService) {}

  /**
   * 创建定时任务
   */
  async createTask(dto: CreateTaskDto): Promise<ScheduledTask> {
    console.log('=== 创建定时任务 ===');
    console.log('用户ID:', dto.userId);
    console.log('标题:', dto.title);
    console.log('提醒时间:', dto.reminderTime);

    const { data, error } = await this.client
      .from('scheduled_tasks')
      .insert({
        user_id: dto.userId,
        title: dto.title,
        description: dto.description,
        reminder_time: dto.reminderTime,
        repeat_type: dto.repeatType || 'none',
        status: 'pending',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('创建任务失败:', error);
      throw new Error(`创建任务失败: ${error.message}`);
    }

    console.log('任务创建成功:', data.id);

    return this.mapToTask(data);
  }

  /**
   * 获取用户的定时任务列表
   */
  async getUserTasks(
    currentUserId: string,
    targetUserId?: string,
    status?: string,
    isActive?: boolean,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ tasks: ScheduledTask[]; total: number }> {
    console.log('=== 获取用户定时任务 ===');
    console.log('当前用户ID:', currentUserId);
    console.log('目标用户ID:', targetUserId);
    console.log('状态过滤:', status);
    console.log('激活状态:', isActive);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 如果不是管理员且指定了目标用户ID，则只能查看自己的任务
      if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
        throw new ForbiddenException('无权查看其他用户的任务');
      }

      // 确定要查询的用户ID
      // targetUserId 在 controller 层已验证，如果是非法字符串会抛出 400
      // 如果 targetUserId 是 undefined，表示不传参数，查询当前用户的任务
      const queryUserId = targetUserId || currentUserId;

      let query = this.client
        .from('scheduled_tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', queryUserId)
        .order('reminder_time', { ascending: true })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('获取任务列表失败:', error);
        throw new Error(`获取任务列表失败: ${error.message}`);
      }

      console.log(`找到 ${count} 个任务`);

      return {
        tasks: (data || []).map(item => this.mapToTask(item)),
        total: count || 0,
      };
    } catch (error: any) {
      console.error('获取任务列表失败:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`获取任务列表失败: ${error.message}`);
    }
  }

  /**
   * 获取任务详情
   */
  async getTaskById(taskId: string, currentUserId: string): Promise<ScheduledTask> {
    console.log('=== 获取任务详情 ===');
    console.log('任务ID:', taskId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取任务信息
      const { data, error } = await this.client
        .from('scheduled_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error || !data) {
        throw new NotFoundException('任务不存在');
      }

      // 验证访问权限
      if (!isAdmin && data.user_id !== currentUserId) {
        throw new ForbiddenException('无权访问此任务');
      }

      return this.mapToTask(data);
    } catch (error: any) {
      console.error('获取任务详情失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`获取任务详情失败: ${error.message}`);
    }
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, currentUserId: string, dto: UpdateTaskDto): Promise<ScheduledTask> {
    console.log('=== 更新定时任务 ===');
    console.log('任务ID:', taskId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取任务信息
      const { data: task, error: fetchError } = await this.client
        .from('scheduled_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (fetchError || !task) {
        throw new NotFoundException('任务不存在');
      }

      // 验证权限
      if (!isAdmin && task.user_id !== currentUserId) {
        throw new ForbiddenException('无权修改此任务');
      }

      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.reminderTime !== undefined) updateData.reminder_time = dto.reminderTime;
      if (dto.repeatType !== undefined) updateData.repeat_type = dto.repeatType;
      if (dto.status !== undefined) {
        updateData.status = dto.status;
        if (dto.status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
      }
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

      const { data, error } = await this.client
        .from('scheduled_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('更新任务失败:', error);
        throw new Error(`更新任务失败: ${error.message}`);
      }

      console.log('任务更新成功');

      return this.mapToTask(data);
    } catch (error: any) {
      console.error('更新任务失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`更新任务失败: ${error.message}`);
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string, currentUserId: string): Promise<void> {
    console.log('=== 删除定时任务 ===');
    console.log('任务ID:', taskId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取任务信息
      const { data: task, error: fetchError } = await this.client
        .from('scheduled_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (fetchError || !task) {
        throw new NotFoundException('任务不存在');
      }

      // 验证权限
      if (!isAdmin && task.user_id !== currentUserId) {
        throw new ForbiddenException('无权删除此任务');
      }

      const { error } = await this.client
        .from('scheduled_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('删除任务失败:', error);
        throw new Error(`删除任务失败: ${error.message}`);
      }

      console.log('任务已删除');
    } catch (error: any) {
      console.error('删除任务失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`删除任务失败: ${error.message}`);
    }
  }

  /**
   * 获取即将到期的任务（用于提醒）
   */
  async getUpcomingTasks(userId: string, hours: number = 24): Promise<ScheduledTask[]> {
    console.log('=== 获取即将到期的任务 ===');
    console.log('用户ID:', userId);
    console.log('时间范围:', hours, '小时');

    const now = new Date();
    const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const { data, error } = await this.client
      .from('scheduled_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .eq('is_active', true)
      .gte('reminder_time', now.toISOString())
      .lte('reminder_time', endTime.toISOString())
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('获取即将到期任务失败:', error);
      throw new Error(`获取即将到期任务失败: ${error.message}`);
    }

    console.log(`找到 ${data?.length || 0} 个即将到期任务`);

    return (data || []).map(item => this.mapToTask(item));
  }

  /**
   * 完成任务
   */
  async completeTask(taskId: string, userId: string): Promise<ScheduledTask> {
    console.log('=== 完成定时任务 ===');
    console.log('任务ID:', taskId);

    return this.updateTask(taskId, userId, {
      status: 'completed',
    });
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string, userId: string): Promise<ScheduledTask> {
    console.log('=== 取消定时任务 ===');
    console.log('任务ID:', taskId);

    return this.updateTask(taskId, userId, {
      status: 'cancelled',
    });
  }

  /**
   * 暂停/激活任务
   */
  async toggleTaskActive(taskId: string, userId: string, isActive: boolean): Promise<ScheduledTask> {
    console.log('=== 切换任务激活状态 ===');
    console.log('任务ID:', taskId);
    console.log('激活状态:', isActive);

    return this.updateTask(taskId, userId, {
      isActive,
    });
  }

  /**
   * 映射数据库对象到DTO
   */
  private mapToTask(data: any): ScheduledTask {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      reminderTime: data.reminder_time,
      repeatType: data.repeat_type,
      status: data.status,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
    };
  }
}
