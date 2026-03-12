import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { UserService } from '../user/user.service';

export interface WorkPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkPlanTask {
  id: string;
  planId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  userId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePlanDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

@Injectable()
export class WorkPlanService {
  private client = getSupabaseClient();

  constructor(private readonly userService: UserService) {}

  /**
   * 创建工作计划
   */
  async createPlan(dto: CreatePlanDto): Promise<WorkPlan> {
    console.log('=== 创建工作计划 ===');
    console.log('用户ID:', dto.userId);
    console.log('标题:', dto.title);

    const { data, error } = await this.client
      .from('work_plans')
      .insert({
        user_id: dto.userId,
        title: dto.title,
        description: dto.description,
        start_date: dto.startDate,
        end_date: dto.endDate,
        status: 'draft',
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建工作计划失败:', error);
      throw new Error(`创建工作计划失败: ${error.message}`);
    }

    console.log('工作计划创建成功:', data.id);

    return this.mapToPlan(data);
  }

  /**
   * 获取用户的工作计划列表
   */
  async getUserPlans(
    currentUserId: string,
    targetUserId?: string,
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ plans: WorkPlan[]; total: number }> {
    console.log('=== 获取用户工作计划 ===');
    console.log('当前用户ID:', currentUserId);
    console.log('目标用户ID:', targetUserId);
    console.log('状态过滤:', status);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 如果不是管理员且指定了目标用户ID，则只能查看自己的计划
      if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
        throw new ForbiddenException('无权查看其他用户的工作计划');
      }

      // 确定要查询的用户ID
      // targetUserId 在 controller 层已验证，如果是非法字符串会抛出 400
      // 如果 targetUserId 是 undefined，表示不传参数，查询当前用户的计划
      const queryUserId = targetUserId || currentUserId;

      let query = this.client
        .from('work_plans')
        .select('*', { count: 'exact' })
        .eq('user_id', queryUserId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('获取工作计划列表失败:', error);
        throw new Error(`获取工作计划列表失败: ${error.message}`);
      }

      console.log(`找到 ${count} 个工作计划`);

      return {
        plans: (data || []).map(item => this.mapToPlan(item)),
        total: count || 0,
      };
    } catch (error: any) {
      console.error('获取工作计划列表失败:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`获取工作计划列表失败: ${error.message}`);
    }
  }

  /**
   * 获取工作计划详情
   */
  async getPlanById(planId: string, currentUserId: string): Promise<WorkPlan> {
    console.log('=== 获取工作计划详情 ===');
    console.log('计划ID:', planId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取计划信息
      const { data, error } = await this.client
        .from('work_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error || !data) {
        throw new NotFoundException('工作计划不存在');
      }

      // 验证访问权限
      if (!isAdmin && data.user_id !== currentUserId) {
        throw new ForbiddenException('无权访问此工作计划');
      }

      return this.mapToPlan(data);
    } catch (error: any) {
      console.error('获取工作计划详情失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`获取工作计划详情失败: ${error.message}`);
    }
  }

  /**
   * 更新工作计划
   */
  async updatePlan(planId: string, currentUserId: string, dto: UpdatePlanDto): Promise<WorkPlan> {
    console.log('=== 更新工作计划 ===');
    console.log('计划ID:', planId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取计划信息
      const { data: plan, error: fetchError } = await this.client
        .from('work_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (fetchError || !plan) {
        throw new NotFoundException('工作计划不存在');
      }

      // 验证权限
      if (!isAdmin && plan.user_id !== currentUserId) {
        throw new ForbiddenException('无权修改此工作计划');
      }

      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.startDate !== undefined) updateData.start_date = dto.startDate;
      if (dto.endDate !== undefined) updateData.end_date = dto.endDate;
      if (dto.status !== undefined) updateData.status = dto.status;

      const { data, error } = await this.client
        .from('work_plans')
        .update(updateData)
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        console.error('更新工作计划失败:', error);
        throw new Error(`更新工作计划失败: ${error.message}`);
      }

      console.log('工作计划更新成功');

      return this.mapToPlan(data);
    } catch (error: any) {
      console.error('更新工作计划失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`更新工作计划失败: ${error.message}`);
    }
  }

  /**
   * 删除工作计划
   */
  async deletePlan(planId: string, currentUserId: string): Promise<void> {
    console.log('=== 删除工作计划 ===');
    console.log('计划ID:', planId);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 先获取计划信息
      const { data: plan, error: fetchError } = await this.client
        .from('work_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (fetchError || !plan) {
        throw new NotFoundException('工作计划不存在');
      }

      // 验证权限
      if (!isAdmin && plan.user_id !== currentUserId) {
        throw new ForbiddenException('无权删除此工作计划');
      }

      const { error } = await this.client
        .from('work_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('删除工作计划失败:', error);
        throw new Error(`删除工作计划失败: ${error.message}`);
      }

      console.log('工作计划已删除');
    } catch (error: any) {
      console.error('删除工作计划失败:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`删除工作计划失败: ${error.message}`);
    }
  }

  /**
   * 添加任务到工作计划
   */
  async addTaskToPlan(planId: string, currentUserId: string, dto: CreateTaskDto): Promise<WorkPlanTask> {
    console.log('=== 添加任务到工作计划 ===');
    console.log('计划ID:', planId);
    console.log('任务标题:', dto.title);

    // 检查计划是否存在
    await this.getPlanById(planId, currentUserId);

    const { data, error } = await this.client
      .from('work_plan_tasks')
      .insert({
        plan_id: planId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'medium',
        due_date: dto.dueDate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('添加任务失败:', error);
      throw new Error(`添加任务失败: ${error.message}`);
    }

    console.log('任务添加成功:', data.id);

    return this.mapToTask(data);
  }

  /**
   * 获取工作计划的任务列表
   */
  async getPlanTasks(planId: string, currentUserId: string): Promise<WorkPlanTask[]> {
    console.log('=== 获取工作计划的任务列表 ===');
    console.log('计划ID:', planId);

    // 检查计划是否存在
    await this.getPlanById(planId, currentUserId);

    const { data, error } = await this.client
      .from('work_plan_tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取任务列表失败:', error);
      throw new Error(`获取任务列表失败: ${error.message}`);
    }

    console.log(`找到 ${data?.length || 0} 个任务`);

    return (data || []).map(item => this.mapToTask(item));
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, planId: string, currentUserId: string, dto: UpdateTaskDto): Promise<WorkPlanTask> {
    console.log('=== 更新任务 ===');
    console.log('任务ID:', taskId);
    console.log('计划ID:', planId);

    // 检查任务是否存在
    const task = await this.getTaskById(taskId, planId, currentUserId);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.dueDate !== undefined) updateData.due_date = dto.dueDate;

    const { data, error } = await this.client
      .from('work_plan_tasks')
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
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string, planId: string, currentUserId: string): Promise<void> {
    console.log('=== 删除任务 ===');
    console.log('任务ID:', taskId);

    // 检查任务是否存在
    await this.getTaskById(taskId, planId, currentUserId);

    const { error } = await this.client
      .from('work_plan_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('删除任务失败:', error);
      throw new Error(`删除任务失败: ${error.message}`);
    }

    console.log('任务已删除');
  }

  /**
   * 获取任务详情
   */
  async getTaskById(taskId: string, planId: string, currentUserId: string): Promise<WorkPlanTask> {
    console.log('=== 获取任务详情 ===');
    console.log('任务ID:', taskId);

    const { data, error } = await this.client
      .from('work_plan_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !data) {
      console.error('任务不存在:', error);
      throw new NotFoundException('任务不存在');
    }

    // 检查任务所属的计划是否属于该用户
    const plan = await this.getPlanById(planId, currentUserId);
    if (plan.id !== data.plan_id) {
      throw new BadRequestException('任务不属于该计划');
    }

    return this.mapToTask(data);
  }

  /**
   * 映射数据库对象到DTO
   */
  private mapToPlan(data: any): WorkPlan {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      progress: data.progress,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToTask(data: any): WorkPlanTask {
    return {
      id: data.id,
      planId: data.plan_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
