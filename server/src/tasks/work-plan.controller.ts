import { Controller, Post, Get, Put, Delete, Param, Body, Query, BadRequestException, Req } from '@nestjs/common';
import { WorkPlanService, CreatePlanDto, UpdatePlanDto, CreateTaskDto, UpdateTaskDto } from './work-plan.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { UseGuards } from '@nestjs/common';
import { parseOptionalUUID } from '../utils/uuid.util';

@Controller('tasks/work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  /**
   * 创建工作计划
   */
  @Post()
  @UseGuards(ActiveUserGuard)
  async createPlan(@Req() req: any, @Body() dto: Omit<CreatePlanDto, 'userId'>) {
    try {
      console.log('=== Controller: 创建工作计划请求 ===');
      console.log('当前用户ID:', req.user?.id);
      console.log('Title:', dto.title);

      if (!req.user?.id || !dto.title) {
        throw new BadRequestException('用户ID和标题不能为空');
      }

      const plan = await this.workPlanService.createPlan({
        userId: req.user.id,
        ...dto,
      });

      console.log('=== Controller: 工作计划创建成功 ===');

      return {
        code: 200,
        msg: 'success',
        data: plan,
      };
    } catch (error: any) {
      console.error('Controller: 创建工作计划失败:', error);
      throw new BadRequestException(error.message || '创建工作计划失败');
    }
  }

  /**
   * 获取用户的工作计划列表
   */
  @Get()
  @UseGuards(ActiveUserGuard)
  async getUserPlans(
    @Req() req: any,
    @Query('userId') targetUserId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      console.log('=== Controller: 获取工作计划列表 ===');
      console.log('当前用户ID:', req.user?.id);
      console.log('目标用户ID:', targetUserId);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      // 验证 targetUserId 参数（如果是非法字符串会抛出 400 错误）
      const validatedTargetUserId = parseOptionalUUID(targetUserId, 'userId');

      const result = await this.workPlanService.getUserPlans(
        req.user.id,
        validatedTargetUserId,
        status,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
      );

      console.log('=== Controller: 返回工作计划列表 ===');
      console.log('Total:', result.total);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error: any) {
      console.error('Controller: 获取工作计划列表失败:', error);
      throw new BadRequestException(error.message || '获取工作计划列表失败');
    }
  }

  /**
   * 获取工作计划详情
   */
  @Get(':planId')
  @UseGuards(ActiveUserGuard)
  async getPlanById(
    @Param('planId') planId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 获取工作计划详情 ===');
      console.log('PlanId:', planId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const plan = await this.workPlanService.getPlanById(planId, req.user.id);

      console.log('=== Controller: 返回工作计划详情 ===');

      return {
        code: 200,
        msg: 'success',
        data: plan,
      };
    } catch (error: any) {
      console.error('Controller: 获取工作计划详情失败:', error);
      throw new BadRequestException(error.message || '获取工作计划详情失败');
    }
  }

  /**
   * 更新工作计划
   */
  @Put(':planId')
  @UseGuards(ActiveUserGuard)
  async updatePlan(
    @Param('planId') planId: string,
    @Req() req: any,
    @Body() dto: UpdatePlanDto,
  ) {
    try {
      console.log('=== Controller: 更新工作计划 ===');
      console.log('PlanId:', planId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const plan = await this.workPlanService.updatePlan(planId, req.user.id, dto);

      console.log('=== Controller: 工作计划更新成功 ===');

      return {
        code: 200,
        msg: 'success',
        data: plan,
      };
    } catch (error: any) {
      console.error('Controller: 更新工作计划失败:', error);
      throw new BadRequestException(error.message || '更新工作计划失败');
    }
  }

  /**
   * 删除工作计划
   */
  @Delete(':planId')
  @UseGuards(ActiveUserGuard)
  async deletePlan(
    @Param('planId') planId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 删除工作计划 ===');
      console.log('PlanId:', planId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      await this.workPlanService.deletePlan(planId, req.user.id);

      console.log('=== Controller: 工作计划已删除 ===');

      return {
        code: 200,
        msg: 'success',
        data: {
          message: '工作计划已删除',
        },
      };
    } catch (error: any) {
      console.error('Controller: 删除工作计划失败:', error);
      throw new BadRequestException(error.message || '删除工作计划失败');
    }
  }

  /**
   * 添加任务到工作计划
   */
  @Post(':planId/tasks')
  @UseGuards(ActiveUserGuard)
  async addTaskToPlan(
    @Param('planId') planId: string,
    @Req() req: any,
    @Body() dto: CreateTaskDto,
  ) {
    try {
      console.log('=== Controller: 添加任务到工作计划 ===');
      console.log('PlanId:', planId);
      console.log('TaskTitle:', dto.title);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const task = await this.workPlanService.addTaskToPlan(planId, req.user.id, dto);

      console.log('=== Controller: 任务添加成功 ===');

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      console.error('Controller: 添加任务失败:', error);
      throw new BadRequestException(error.message || '添加任务失败');
    }
  }

  /**
   * 获取工作计划的任务列表
   */
  @Get(':planId/tasks')
  @UseGuards(ActiveUserGuard)
  async getPlanTasks(
    @Param('planId') planId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 获取工作计划的任务列表 ===');
      console.log('PlanId:', planId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const tasks = await this.workPlanService.getPlanTasks(planId, req.user.id);

      console.log('=== Controller: 返回任务列表 ===');
      console.log('Count:', tasks.length);

      return {
        code: 200,
        msg: 'success',
        data: {
          tasks,
          count: tasks.length,
        },
      };
    } catch (error: any) {
      console.error('Controller: 获取任务列表失败:', error);
      throw new BadRequestException(error.message || '获取任务列表失败');
    }
  }

  /**
   * 更新任务
   */
  @Put(':planId/tasks/:taskId')
  @UseGuards(ActiveUserGuard)
  async updateTask(
    @Param('planId') planId: string,
    @Param('taskId') taskId: string,
    @Req() req: any,
    @Body() dto: UpdateTaskDto,
  ) {
    try {
      console.log('=== Controller: 更新任务 ===');
      console.log('PlanId:', planId);
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const task = await this.workPlanService.updateTask(taskId, planId, req.user.id, dto);

      console.log('=== Controller: 任务更新成功 ===');

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      console.error('Controller: 更新任务失败:', error);
      throw new BadRequestException(error.message || '更新任务失败');
    }
  }

  /**
   * 删除任务
   */
  @Delete(':planId/tasks/:taskId')
  @UseGuards(ActiveUserGuard)
  async deleteTask(
    @Param('planId') planId: string,
    @Param('taskId') taskId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 删除任务 ===');
      console.log('PlanId:', planId);
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      await this.workPlanService.deleteTask(taskId, planId, req.user.id);

      console.log('=== Controller: 任务已删除 ===');

      return {
        code: 200,
        msg: 'success',
        data: {
          message: '任务已删除',
        },
      };
    } catch (error: any) {
      console.error('Controller: 删除任务失败:', error);
      throw new BadRequestException(error.message || '删除任务失败');
    }
  }
}
