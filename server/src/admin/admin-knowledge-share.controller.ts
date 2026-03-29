import { Controller, Get, Delete, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminKnowledgeShareService } from './admin-knowledge-share.service';

@Controller('admin/knowledge-shares')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminKnowledgeShareController {
  constructor(
    private readonly adminKnowledgeShareService: AdminKnowledgeShareService
  ) {}

  // 获取知识分享列表（管理员）
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('keyword') keyword?: string,
    @Query('category') category?: string,
    @Query('status') status?: 'published' | 'draft',
    @Query('authorId') authorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('attachmentType') attachmentType?: 'image' | 'file' | 'audio' | 'none',
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: string = 'desc'
  ) {
    try {
      const data = await this.adminKnowledgeShareService.findAll({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        keyword,
        category,
        status,
        authorId,
        startDate,
        endDate,
        attachmentType,
        sortBy,
        sortOrder
      });
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 删除知识分享（管理员）
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.adminKnowledgeShareService.remove(id);
      return {
        code: 200,
        msg: '删除成功',
        data: null,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '删除失败',
        data: null,
      };
    }
  }

  // 批量删除知识分享（管理员）
  @Post('batch-delete')
  async batchRemove(@Body() body: { ids: string[] }) {
    try {
      const result = await this.adminKnowledgeShareService.batchRemove(body.ids);
      return {
        code: 200,
        msg: `成功删除 ${result.successCount} 条知识分享`,
        data: result,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '删除失败',
        data: null,
      };
    }
  }

  // 置顶/取消置顶（管理员）
  @Post(':id/feature')
  async feature(@Param('id') id: string, @Body() body: { isFeatured: boolean }) {
    try {
      await this.adminKnowledgeShareService.feature(id, body.isFeatured);
      return {
        code: 200,
        msg: '操作成功',
        data: null,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '操作失败',
        data: null,
      };
    }
  }

  // 获取知识分享统计数据摘要
  @Get('summary')
  async getSummary() {
    try {
      const data = await this.adminKnowledgeShareService.getSummary();
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 获取综合统计数据
  @Get('stats')
  async getStats() {
    try {
      const data = await this.adminKnowledgeShareService.getStats();
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 获取趋势数据
  @Get('trend')
  async getTrend(@Query('days') days: string = '7') {
    try {
      const data = await this.adminKnowledgeShareService.getTrend(parseInt(days));
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 获取热门知识分享排行
  @Get('top')
  async getTop(
    @Query('type') type: 'view' | 'like' = 'view',
    @Query('limit') limit: string = '10'
  ) {
    try {
      const data = await this.adminKnowledgeShareService.getTop(type, parseInt(limit));
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 获取活跃作者排行
  @Get('authors/top')
  async getTopAuthors(@Query('limit') limit: string = '10') {
    try {
      const data = await this.adminKnowledgeShareService.getTopAuthors(parseInt(limit));
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 获取待审核列表
  @Get('pending')
  async getPending(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20'
  ) {
    try {
      const data = await this.adminKnowledgeShareService.getPending({
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 审核通过
  @Post(':id/approve')
  async approve(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user?.id;
      await this.adminKnowledgeShareService.approve(id, userId);
      return {
        code: 200,
        msg: '审核通过',
        data: null,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '操作失败',
        data: null,
      };
    }
  }

  // 驳回
  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
    try {
      const userId = req.user?.id;
      await this.adminKnowledgeShareService.reject(id, body.reason, userId);
      return {
        code: 200,
        msg: '驳回成功',
        data: null,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '操作失败',
        data: null,
      };
    }
  }

  // 获取时间分析数据
  @Get('time-analysis')
  async getTimeAnalysis(@Query('days') days: string = '30') {
    try {
      const data = await this.adminKnowledgeShareService.getTimeAnalysis(parseInt(days));
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 批量导出
  @Post('export')
  async batchExport(@Body() body: { ids: string[] }) {
    try {
      const data = await this.adminKnowledgeShareService.batchExport(body.ids);
      return {
        code: 200,
        msg: '导出成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '导出失败',
        data: null,
      };
    }
  }

  // 导出统计报告
  @Post('export-report')
  async exportReport() {
    try {
      const data = await this.adminKnowledgeShareService.exportReport();
      return {
        code: 200,
        msg: '导出成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '导出失败',
        data: null,
      };
    }
  }
}
