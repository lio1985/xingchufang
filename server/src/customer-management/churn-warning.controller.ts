import { Controller, Get, Post, Put, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { ChurnWarningService, ChurnRiskConfig, ChurnWarningRecord } from './churn-warning.service';
import { Request } from 'express';

@Controller('customers/churn-warning')
@UseGuards(ActiveUserGuard)
export class ChurnWarningController {
  constructor(private readonly churnWarningService: ChurnWarningService) {}

  /**
   * 获取高风险客户列表
   */
  @Get('risk-list')
  async getRiskList(
    @Query('salesId') salesId?: string,
    @Query('riskLevel') riskLevel?: string,
  ) {
    console.log('[ChurnWarning] Get risk list:', { salesId, riskLevel });

    try {
      const assessments = await this.churnWarningService.assessAllCustomers(salesId);
      
      // 按风险等级筛选
      let filtered = assessments;
      if (riskLevel && riskLevel !== 'all') {
        filtered = assessments.filter(a => a.riskLevel === riskLevel);
      }

      return {
        code: 200,
        msg: 'success',
        data: filtered,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Get risk list error:', error);
      return {
        code: 500,
        msg: error.message || '获取风险列表失败',
        data: [],
      };
    }
  }

  /**
   * 获取风险统计
   */
  @Get('statistics')
  async getRiskStatistics(@Query('salesId') salesId?: string) {
    console.log('[ChurnWarning] Get statistics:', { salesId });

    try {
      const stats = await this.churnWarningService.getRiskStatistics(salesId);
      
      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Get statistics error:', error);
      return {
        code: 500,
        msg: error.message || '获取统计失败',
        data: null,
      };
    }
  }

  /**
   * 获取单个客户的风险评估
   */
  @Get(':id/assessment')
  async getCustomerAssessment(@Query('id') customerId: string) {
    console.log('[ChurnWarning] Get assessment:', customerId);

    try {
      const assessment = await this.churnWarningService.assessCustomerRisk(customerId);
      
      return {
        code: 200,
        msg: 'success',
        data: assessment,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Get assessment error:', error);
      return {
        code: 500,
        msg: error.message || '获取评估失败',
        data: null,
      };
    }
  }

  /**
   * 生成预警报告（管理员）
   */
  @Get('report')
  @UseGuards(AdminGuard)
  async generateReport(@Query('salesId') salesId?: string) {
    console.log('[ChurnWarning] Generate report:', { salesId });

    try {
      const report = await this.churnWarningService.generateWarningReport(salesId);
      
      return {
        code: 200,
        msg: 'success',
        data: report,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Generate report error:', error);
      return {
        code: 500,
        msg: error.message || '生成报告失败',
        data: null,
      };
    }
  }

  /**
   * 更新预警配置（管理员）
   */
  @Post('config')
  @UseGuards(AdminGuard)
  async updateConfig(@Body() config: Partial<ChurnRiskConfig>) {
    console.log('[ChurnWarning] Update config:', config);

    try {
      this.churnWarningService.updateConfig(config);
      
      return {
        code: 200,
        msg: '配置更新成功',
        data: this.churnWarningService.getConfig(),
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Update config error:', error);
      return {
        code: 500,
        msg: error.message || '更新配置失败',
        data: null,
      };
    }
  }

  /**
   * 获取当前配置
   */
  @Get('config')
  async getConfig() {
    return {
      code: 200,
      msg: 'success',
      data: this.churnWarningService.getConfig(),
    };
  }

  /**
   * 创建预警处理记录
   */
  @Post('handle')
  async createHandleRecord(
    @Body() body: {
      customer_id: string;
      customer_name: string;
      risk_level: 'yellow' | 'orange' | 'red';
      risk_score: number;
      handle_action: 'phone' | 'visit' | 'message' | 'email' | 'other';
      handle_result: 'success' | 'pending' | 'failed' | 'converted';
      handle_notes?: string;
      follow_up_date?: string;
    },
    @Req() req: Request,
  ) {
    console.log('[ChurnWarning] Create handle record:', body);

    try {
      const user = (req as any).user;
      if (!user) {
        return {
          code: 401,
          msg: '未登录',
          data: null,
        };
      }

      const record: Omit<ChurnWarningRecord, 'id' | 'created_at' | 'updated_at'> = {
        customer_id: body.customer_id,
        customer_name: body.customer_name,
        risk_level: body.risk_level,
        risk_score: body.risk_score,
        handled_by: user.userId,
        handler_name: user.username || user.name || '未知',
        handle_action: body.handle_action,
        handle_result: body.handle_result,
        handle_notes: body.handle_notes,
        follow_up_date: body.follow_up_date,
      };

      const result = await this.churnWarningService.createHandleRecord(record);
      
      return {
        code: 200,
        msg: '处理记录创建成功',
        data: result,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Create handle record error:', error);
      return {
        code: 500,
        msg: error.message || '创建处理记录失败',
        data: null,
      };
    }
  }

  /**
   * 获取预警处理记录列表
   */
  @Get('handle-records')
  async getHandleRecords(
    @Query('customerId') customerId?: string,
    @Query('handlerId') handlerId?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('handleResult') handleResult?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    console.log('[ChurnWarning] Get handle records:', { customerId, handlerId, riskLevel, handleResult });

    try {
      const result = await this.churnWarningService.getHandleRecords({
        customerId,
        handlerId,
        riskLevel,
        handleResult,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Get handle records error:', error);
      return {
        code: 500,
        msg: error.message || '获取处理记录失败',
        data: { records: [], total: 0 },
      };
    }
  }

  /**
   * 更新处理记录
   */
  @Put('handle/:id')
  async updateHandleRecord(
    @Query('id') recordId: string,
    @Body() updates: Partial<ChurnWarningRecord>,
  ) {
    console.log('[ChurnWarning] Update handle record:', recordId, updates);

    try {
      const success = await this.churnWarningService.updateHandleRecord(recordId, updates);
      
      return {
        code: success ? 200 : 500,
        msg: success ? '更新成功' : '更新失败',
        data: null,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Update handle record error:', error);
      return {
        code: 500,
        msg: error.message || '更新处理记录失败',
        data: null,
      };
    }
  }

  /**
   * 获取处理效果分析统计
   */
  @Get('analysis/stats')
  async getHandleResultStats(
    @Query('handlerId') handlerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    console.log('[ChurnWarning] Get handle result stats:', { handlerId, startDate, endDate });

    try {
      const stats = await this.churnWarningService.getHandleResultStats({
        handlerId,
        startDate,
        endDate,
      });

      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Get handle result stats error:', error);
      return {
        code: 500,
        msg: error.message || '获取效果分析失败',
        data: null,
      };
    }
  }

  /**
   * 获取处理人排行榜
   */
  @Get('analysis/ranking')
  async getHandlerRanking(@Query('limit') limit?: string) {
    console.log('[ChurnWarning] Get handler ranking:', { limit });

    try {
      const rankings = await this.churnWarningService.getHandlerRanking(
        limit ? parseInt(limit) : 10
      );

      return {
        code: 200,
        msg: 'success',
        data: rankings,
      };
    } catch (error: any) {
      console.error('[ChurnWarning] Get handler ranking error:', error);
      return {
        code: 500,
        msg: error.message || '获取排行榜失败',
        data: [],
      };
    }
  }
}
