import { Controller, Get, Post, Body, Param, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { DataExportService } from './data-export.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { ExportConfig, ExportScope } from './types';

@Controller('data-export')
@UseGuards(ActiveUserGuard)
export class DataExportController {
  constructor(private readonly dataExportService: DataExportService) {}

  /**
   * 获取可用的导出范围选项
   */
  @Get('scope-options')
  async getScopeOptions(@Request() req) {
    const userId = req.user.id;
    const options = await this.dataExportService.getAvailableScopeOptions(userId);

    return {
      code: 200,
      msg: 'success',
      data: options,
    };
  }

  /**
   * 获取可导出的团队列表（仅管理员和团队队长）
   */
  @Get('teams')
  async getAvailableTeams(@Request() req) {
    const userId = req.user.id;
    const teams = await this.dataExportService.getAvailableTeams(userId);

    return {
      code: 200,
      msg: 'success',
      data: teams,
    };
  }

  /**
   * 创建导出任务
   */
  @Post('export')
  async createExportTask(@Request() req, @Body() body: ExportConfig) {
    try {
      const userId = req.user.id;
      const task = await this.dataExportService.createExportTask(userId, body);

      return {
        code: 200,
        msg: '导出任务创建成功',
        data: task,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message || '创建导出任务失败',
        data: null,
      };
    }
  }

  /**
   * 获取导出任务状态
   */
  @Get('task/:taskId')
  async getExportTaskStatus(@Request() req, @Param('taskId') taskId: string) {
    try {
      const userId = req.user.id;
      const task = await this.dataExportService.getExportTaskStatus(taskId, userId);

      return {
        code: 200,
        msg: 'success',
        data: task,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message || '获取导出任务状态失败',
        data: null,
      };
    }
  }

  /**
   * 获取导出历史
   */
  @Get('history')
  async getExportHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    try {
      const userId = req.user.id;
      const tasks = await this.dataExportService.getExportHistory(
        userId,
        page ? parseInt(page.toString()) : 1,
        pageSize ? parseInt(pageSize.toString()) : 20,
      );

      return {
        code: 200,
        msg: 'success',
        data: tasks,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message || '获取导出历史失败',
        data: null,
      };
    }
  }

  /**
   * 获取导出统计
   */
  @Get('stats')
  async getExportStats(@Request() req) {
    try {
      const userId = req.user.id;
      const stats = await this.dataExportService.getExportStats(userId);

      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message || '获取导出统计失败',
        data: null,
      };
    }
  }

  /**
   * 下载导出文件
   */
  @Get('download/:taskId')
  async downloadExportFile(@Request() req, @Param('taskId') taskId: string) {
    try {
      const userId = req.user.id;
      const result = await this.dataExportService.downloadExportFile(taskId, userId);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message || '获取下载链接失败',
        data: null,
      };
    }
  }
}
