import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { ReportGenerationRequest } from './types';

@Controller('admin/reports')
@UseGuards(ActiveUserGuard, AdminGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * 生成 AI 运营报告
   */
  @Post('generate')
  async generateReport(@Body() body: ReportGenerationRequest) {
    try {
      const { timeRange = 'week' } = body;
      const report = await this.reportsService.generateReport(timeRange);

      return {
        code: 200,
        msg: '报告生成成功',
        data: report,
      };
    } catch (error) {
      console.error('生成报告失败:', error);
      return {
        code: 500,
        msg: '生成报告失败',
        data: null,
      };
    }
  }

  /**
   * 获取最新报告
   */
  @Get('latest')
  async getLatestReport() {
    try {
      const report = await this.reportsService.getLatestReport();

      if (!report) {
        return {
          code: 404,
          msg: '暂无报告',
          data: null,
        };
      }

      return {
        code: 200,
        msg: 'success',
        data: report,
      };
    } catch (error) {
      console.error('获取报告失败:', error);
      return {
        code: 500,
        msg: '获取报告失败',
        data: null,
      };
    }
  }
}
