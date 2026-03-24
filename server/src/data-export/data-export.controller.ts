import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { DataExportService } from './data-export.service';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { ExportConfig } from './types';

@Controller('admin/data-export')
@UseGuards(ActiveUserGuard, AdminGuard)
export class DataExportController {
  constructor(private readonly dataExportService: DataExportService) {}

  /**
   * 创建导出任务
   */
  @Post('export')
  async createExportTask(@Request() req, @Body() body: ExportConfig) {
    try {
      const adminId = req.user.sub;
      const task = await this.dataExportService.createExportTask(adminId, body);

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
      const adminId = req.user.sub;
      const task = await this.dataExportService.getExportTaskStatus(taskId, adminId);

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
      const adminId = req.user.sub;
      const tasks = await this.dataExportService.getExportHistory(
        adminId,
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
      const adminId = req.user.sub;
      const stats = await this.dataExportService.getExportStats(adminId);

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
      const adminId = req.user.sub;
      const result = await this.dataExportService.downloadExportFile(taskId, adminId);

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
