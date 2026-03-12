import { Controller, Post, Get, Put, Delete, Param, Body, Query, BadRequestException, Req } from '@nestjs/common';
import { ScheduledTaskService, CreateTaskDto, UpdateTaskDto } from './scheduled-task.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { UseGuards } from '@nestjs/common';
import { parseOptionalUUID } from '../utils/uuid.util';

@Controller('tasks/scheduled')
export class ScheduledTaskController {
  constructor(private readonly scheduledTaskService: ScheduledTaskService) {}

  /**
   * 创建定时任务
   */
  @Post()
  @UseGuards(ActiveUserGuard)
  async createTask(@Req() req: any, @Body() dto: Omit<CreateTaskDto, 'userId'>) {
    try {
      console.log('=== Controller: 创建定时任务请求 ===');
      console.log('当前用户ID:', req.user?.id);
      console.log('Title:', dto.title);

      if (!req.user?.id || !dto.title || !dto.reminderTime) {
        throw new BadRequestException('用户ID、标题和提醒时间不能为空');
      }

      const task = await this.scheduledTaskService.createTask({
        userId: req.user.id,
        ...dto,
      });

      console.log('=== Controller: 任务创建成功 ===');

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      console.error('Controller: 创建任务失败:', error);
      throw new BadRequestException(error.message || '创建任务失败');
    }
  }

  /**
   * 获取用户的定时任务列表
   */
  @Get()
  @UseGuards(ActiveUserGuard)
  async getUserTasks(
    @Req() req: any,
    @Query('userId') targetUserId?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      console.log('=== Controller: 获取任务列表 ===');
      console.log('当前用户ID:', req.user?.id);
      console.log('目标用户ID:', targetUserId);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      // 验证 targetUserId 参数（如果是非法字符串会抛出 400 错误）
      const validatedTargetUserId = parseOptionalUUID(targetUserId, 'userId');

      const result = await this.scheduledTaskService.getUserTasks(
        req.user.id,
        validatedTargetUserId,
        status,
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
      );

      console.log('=== Controller: 返回任务列表 ===');
      console.log('Total:', result.total);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error: any) {
      console.error('Controller: 获取任务列表失败:', error);
      throw new BadRequestException(error.message || '获取任务列表失败');
    }
  }

  /**
   * 获取任务详情
   */
  @Get(':taskId')
  @UseGuards(ActiveUserGuard)
  async getTaskById(
    @Param('taskId') taskId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 获取任务详情 ===');
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const task = await this.scheduledTaskService.getTaskById(taskId, req.user.id);

      console.log('=== Controller: 返回任务详情 ===');

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      console.error('Controller: 获取任务详情失败:', error);
      throw new BadRequestException(error.message || '获取任务详情失败');
    }
  }

  /**
   * 更新任务
   */
  @Put(':taskId')
  @UseGuards(ActiveUserGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @Req() req: any,
    @Body() dto: UpdateTaskDto,
  ) {
    try {
      console.log('=== Controller: 更新任务 ===');
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const task = await this.scheduledTaskService.updateTask(taskId, req.user.id, dto);

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
  @Delete(':taskId')
  @UseGuards(ActiveUserGuard)
  async deleteTask(
    @Param('taskId') taskId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 删除任务 ===');
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      await this.scheduledTaskService.deleteTask(taskId, req.user.id);

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

  /**
   * 完成任务
   */
  @Post(':taskId/complete')
  @UseGuards(ActiveUserGuard)
  async completeTask(
    @Param('taskId') taskId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 完成任务 ===');
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const task = await this.scheduledTaskService.completeTask(taskId, req.user.id);

      console.log('=== Controller: 任务已完成 ===');

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      console.error('Controller: 完成任务失败:', error);
      throw new BadRequestException(error.message || '完成任务失败');
    }
  }

  /**
   * 取消任务
   */
  @Post(':taskId/cancel')
  @UseGuards(ActiveUserGuard)
  async cancelTask(
    @Param('taskId') taskId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 取消任务 ===');
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const task = await this.scheduledTaskService.cancelTask(taskId, req.user.id);

      console.log('=== Controller: 任务已取消 ===');

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      console.error('Controller: 取消任务失败:', error);
      throw new BadRequestException(error.message || '取消任务失败');
    }
  }

  /**
   * 暂停/激活任务
   */
  @Post(':taskId/toggle')
  @UseGuards(ActiveUserGuard)
  async toggleTaskActive(
    @Param('taskId') taskId: string,
    @Req() req: any,
    @Body('isActive') isActive: boolean,
  ) {
    try {
      console.log('=== Controller: 切换任务激活状态 ===');
      console.log('TaskId:', taskId);
      console.log('当前用户ID:', req.user?.id);
      console.log('IsActive:', isActive);

      if (!req.user?.id) {
        throw new BadRequestException('用户ID不能为空');
      }

      const task = await this.scheduledTaskService.toggleTaskActive(taskId, req.user.id, isActive);

      console.log('=== Controller: 任务状态已切换 ===');

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      console.error('Controller: 切换任务状态失败:', error);
      throw new BadRequestException(error.message || '切换任务状态失败');
    }
  }

  /**
   * 获取即将到期的任务
   */
  @Get('upcoming')
  @UseGuards(ActiveUserGuard)
  async getUpcomingTasks(
    @Req() req: any,
    @Query('hours') hours?: string,
  ) {
    try {
      console.log('=== Controller: 获取即将到期任务 ===');
      console.log('当前用户ID:', req.user?.id);
      console.log('Hours:', hours);

      const tasks = await this.scheduledTaskService.getUpcomingTasks(
        req.user.id,
        hours ? parseInt(hours) : 24
      );

      console.log('=== Controller: 返回即将到期任务 ===');
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
      console.error('Controller: 获取即将到期任务失败:', error);
      throw new BadRequestException(error.message || '获取即将到期任务失败');
    }
  }
}
