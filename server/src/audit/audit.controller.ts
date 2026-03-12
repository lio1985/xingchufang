import { Controller, Get, Delete, Query, Param, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { parseOptionalUUID } from '../utils/uuid.util';

@Controller('audit')
@UseGuards(ActiveUserGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * 查询操作日志（仅管理员）
   */
  @Get('logs')
  @UseGuards(AdminGuard)
  async getLogs(
    @Request() req,
    @Query('userId') userId?: string,
    @Query('operation') operation?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      // 验证 userId 参数（如果是非法字符串会抛出 400 错误）
      const validatedUserId = parseOptionalUUID(userId, 'userId');

      const result = await this.auditService.getLogs({
        userId: validatedUserId,
        operation,
        resourceType,
        resourceId,
        status: status as any,
        startDate,
        endDate,
        page: page ? parseInt(page) : undefined,
        pageSize: pageSize ? parseInt(pageSize) : undefined,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      // 如果是 BadRequestException，直接抛出（返回 400）
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('查询操作日志失败:', error);
      return {
        code: 500,
        msg: '查询操作日志失败',
        data: null,
      };
    }
  }

  /**
   * 获取当前用户的操作记录
   */
  @Get('my-logs')
  async getMyLogs(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const userId = req.user.sub;
      const result = await this.auditService.getUserLogs(userId, {
        startDate,
        endDate,
        page: page ? parseInt(page) : undefined,
        pageSize: pageSize ? parseInt(pageSize) : undefined,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('获取用户操作记录失败:', error);
      return {
        code: 500,
        msg: '获取用户操作记录失败',
        data: null,
      };
    }
  }

  /**
   * 获取操作统计（仅管理员）
   */
  @Get('statistics')
  @UseGuards(AdminGuard)
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const statistics = await this.auditService.getStatistics({
        startDate,
        endDate,
      });

      return {
        code: 200,
        msg: 'success',
        data: statistics,
      };
    } catch (error) {
      console.error('获取操作统计失败:', error);
      return {
        code: 500,
        msg: '获取操作统计失败',
        data: null,
      };
    }
  }

  /**
   * 获取用户操作记录（仅管理员）
   */
  @Get('users/:userId/logs')
  @UseGuards(AdminGuard)
  async getUserLogs(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const result = await this.auditService.getUserLogs(userId, {
        startDate,
        endDate,
        page: page ? parseInt(page) : undefined,
        pageSize: pageSize ? parseInt(pageSize) : undefined,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('获取用户操作记录失败:', error);
      return {
        code: 500,
        msg: '获取用户操作记录失败',
        data: null,
      };
    }
  }

  /**
   * 获取资源操作历史（仅管理员）
   */
  @Get('resources/:resourceType/:resourceId/history')
  @UseGuards(AdminGuard)
  async getResourceHistory(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    try {
      const logs = await this.auditService.getResourceHistory(resourceType, resourceId);

      return {
        code: 200,
        msg: 'success',
        data: logs,
      };
    } catch (error) {
      console.error('获取资源操作历史失败:', error);
      return {
        code: 500,
        msg: '获取资源操作历史失败',
        data: null,
      };
    }
  }

  /**
   * 删除操作日志（仅管理员）
   */
  @Delete('logs/:logId')
  @UseGuards(AdminGuard)
  async deleteLog(@Param('logId') logId: string) {
    try {
      await this.auditService.deleteLogs(logId);

      return {
        code: 200,
        msg: '删除成功',
        data: null,
      };
    } catch (error) {
      console.error('删除操作日志失败:', error);
      return {
        code: 500,
        msg: '删除操作日志失败',
        data: null,
      };
    }
  }

  /**
   * 批量删除操作日志（仅管理员）
   */
  @Delete('logs')
  @UseGuards(AdminGuard)
  async deleteLogsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const count = await this.auditService.deleteLogsByDateRange(startDate, endDate);

      return {
        code: 200,
        msg: `删除成功，共删除 ${count} 条记录`,
        data: { count },
      };
    } catch (error) {
      console.error('批量删除操作日志失败:', error);
      return {
        code: 500,
        msg: '批量删除操作日志失败',
        data: null,
      };
    }
  }
}
