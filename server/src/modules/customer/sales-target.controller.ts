import { Controller, Get, Post, Put, Delete, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { ActiveUserGuard } from '../../guards/active-user.guard';
import { SalesTargetService, SalesTarget } from './sales-target.service';
import { Request } from 'express';

@Controller('sales-targets')
@UseGuards(ActiveUserGuard)
export class SalesTargetController {
  constructor(private readonly salesTargetService: SalesTargetService) {}

  /**
   * 创建业绩目标
   */
  @Post()
  async createTarget(
    @Body() body: {
      user_id?: string;
      target_type: 'monthly' | 'quarterly' | 'yearly';
      target_year: number;
      target_month?: number;
      target_quarter?: number;
      target_amount: number;
      target_deals?: number;
      target_customers?: number;
      description?: string;
      start_date: string;
      end_date: string;
    },
    @Req() req: Request,
  ) {
    console.log('[SalesTarget] Create:', body);

    try {
      const user = (req as any).user;
      if (!user) {
        return { code: 401, msg: '未登录', data: null };
      }

      // 如果没有指定用户ID，则使用当前用户
      const userId = body.user_id || user.userId;
      
      // 检查权限：只能为自己创建目标，管理员可以为他人创建
      if (userId !== user.userId && user.role !== 'admin') {
        return { code: 403, msg: '无权为其他用户创建目标', data: null };
      }

      const target: Omit<SalesTarget, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        target_type: body.target_type,
        target_year: body.target_year,
        target_month: body.target_month,
        target_quarter: body.target_quarter,
        target_amount: body.target_amount,
        target_deals: body.target_deals || 0,
        target_customers: body.target_customers || 0,
        description: body.description,
        start_date: body.start_date,
        end_date: body.end_date,
        status: 'active',
        created_by: user.userId,
      };

      const result = await this.salesTargetService.createTarget(target);
      
      return {
        code: result ? 200 : 500,
        msg: result ? '创建成功' : '创建失败',
        data: result,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Create error:', error);
      return {
        code: 500,
        msg: error.message || '创建失败',
        data: null,
      };
    }
  }

  /**
   * 更新业绩目标
   */
  @Put(':id')
  async updateTarget(
    @Query('id') targetId: string,
    @Body() updates: Partial<SalesTarget>,
    @Req() req: Request,
  ) {
    console.log('[SalesTarget] Update:', targetId, updates);

    try {
      const user = (req as any).user;
      if (!user) {
        return { code: 401, msg: '未登录', data: null };
      }

      // 获取原目标信息
      const existingTarget = await this.salesTargetService.getTargetById(targetId);
      if (!existingTarget) {
        return { code: 404, msg: '目标不存在', data: null };
      }

      // 检查权限
      if (existingTarget.user_id !== user.userId && user.role !== 'admin') {
        return { code: 403, msg: '无权修改此目标', data: null };
      }

      const success = await this.salesTargetService.updateTarget(targetId, updates);
      
      return {
        code: success ? 200 : 500,
        msg: success ? '更新成功' : '更新失败',
        data: null,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Update error:', error);
      return {
        code: 500,
        msg: error.message || '更新失败',
        data: null,
      };
    }
  }

  /**
   * 删除业绩目标
   */
  @Delete(':id')
  async deleteTarget(
    @Query('id') targetId: string,
    @Req() req: Request,
  ) {
    console.log('[SalesTarget] Delete:', targetId);

    try {
      const user = (req as any).user;
      if (!user) {
        return { code: 401, msg: '未登录', data: null };
      }

      // 获取原目标信息
      const existingTarget = await this.salesTargetService.getTargetById(targetId);
      if (!existingTarget) {
        return { code: 404, msg: '目标不存在', data: null };
      }

      // 检查权限
      if (existingTarget.user_id !== user.userId && user.role !== 'admin') {
        return { code: 403, msg: '无权删除此目标', data: null };
      }

      const success = await this.salesTargetService.deleteTarget(targetId);
      
      return {
        code: success ? 200 : 500,
        msg: success ? '删除成功' : '删除失败',
        data: null,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Delete error:', error);
      return {
        code: 500,
        msg: error.message || '删除失败',
        data: null,
      };
    }
  }

  /**
   * 获取目标详情
   */
  @Get(':id')
  async getTargetDetail(@Query('id') targetId: string) {
    console.log('[SalesTarget] Get detail:', targetId);

    try {
      const target = await this.salesTargetService.getTargetById(targetId);
      
      return {
        code: target ? 200 : 404,
        msg: target ? 'success' : '目标不存在',
        data: target,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Get detail error:', error);
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  /**
   * 查询目标列表
   */
  @Get()
  async getTargets(
    @Req() req: Request,
    @Query('userId') userId?: string,
    @Query('targetType') targetType?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    console.log('[SalesTarget] Get list:', { userId, targetType, year, month });

    try {
      const user = (req as any).user;
      if (!user) {
        return { code: 401, msg: '未登录', data: { targets: [], total: 0 } };
      }

      // 非管理员只能查看自己的目标
      let queryUserId = userId;
      if (user.role !== 'admin' && userId && userId !== user.userId) {
        return { code: 403, msg: '无权查看其他用户目标', data: { targets: [], total: 0 } };
      }
      if (!queryUserId) {
        queryUserId = user.userId;
      }

      const result = await this.salesTargetService.getTargets({
        userId: queryUserId,
        targetType,
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
        quarter: quarter ? parseInt(quarter) : undefined,
        status,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Get list error:', error);
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: { targets: [], total: 0 },
      };
    }
  }

  /**
   * 获取当前目标
   */
  @Get('current/:type')
  async getCurrentTarget(
    @Query('type') type: 'monthly' | 'quarterly' | 'yearly',
    @Req() req: Request,
  ) {
    console.log('[SalesTarget] Get current:', type);

    try {
      const user = (req as any).user;
      if (!user) {
        return { code: 401, msg: '未登录', data: null };
      }

      const target = await this.salesTargetService.getCurrentTarget(user.userId, type);
      
      return {
        code: 200,
        msg: 'success',
        data: target,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Get current error:', error);
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  /**
   * 获取目标进度
   */
  @Get(':id/progress')
  async getTargetProgress(@Query('id') targetId: string) {
    console.log('[SalesTarget] Get progress:', targetId);

    try {
      const progress = await this.salesTargetService.getTargetProgress(targetId);
      
      return {
        code: progress ? 200 : 404,
        msg: progress ? 'success' : '目标不存在',
        data: progress,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Get progress error:', error);
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  /**
   * 获取用户所有目标进度
   */
  @Get('my/progress')
  async getMyTargetsProgress(@Req() req: Request) {
    console.log('[SalesTarget] Get my progress');

    try {
      const user = (req as any).user;
      if (!user) {
        return { code: 401, msg: '未登录', data: [] };
      }

      const progresses = await this.salesTargetService.getUserTargetsProgress(user.userId);
      
      return {
        code: 200,
        msg: 'success',
        data: progresses,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Get my progress error:', error);
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: [],
      };
    }
  }

  /**
   * 获取团队目标统计（管理员）
   */
  @Get('team/stats')
  @UseGuards(AdminGuard)
  async getTeamStats(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
  ) {
    console.log('[SalesTarget] Get team stats:', { year, month, quarter });

    try {
      const stats = await this.salesTargetService.getTeamTargetStats(
        year ? parseInt(year) : undefined,
        month ? parseInt(month) : undefined,
        quarter ? parseInt(quarter) : undefined,
      );

      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Get team stats error:', error);
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  /**
   * 检查目标设置提醒
   */
  @Get('check/reminder')
  async checkTargetReminder(@Req() req: Request) {
    console.log('[SalesTarget] Check reminder');

    try {
      const user = (req as any).user;
      if (!user) {
        return { code: 401, msg: '未登录', data: null };
      }

      const reminder = await this.salesTargetService.checkAndSuggestTarget(user.userId);
      
      return {
        code: 200,
        msg: 'success',
        data: reminder,
      };
    } catch (error: any) {
      console.error('[SalesTarget] Check reminder error:', error);
      return {
        code: 500,
        msg: error.message || '检查失败',
        data: null,
      };
    }
  }
}
