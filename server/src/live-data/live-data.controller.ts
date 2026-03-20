import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LiveDataService, ImportLiveDataDto } from './live-data.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

// 导入数据DTO
class ImportDto {
  title: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  totalViews: number;
  peakOnline: number;
  avgOnline: number;
  newFollowers: number;
  shareCount: number;
  totalComments: number;
  totalLikes: number;
  totalGifts: number;
  productClicks: number;
  productExposures: number;
  ordersCount: number;
  gmv: number;
  products?: any[];
}

@Controller('live-data')
@UseGuards(OptionalAuthGuard)
export class LiveDataController {
  constructor(private readonly liveDataService: LiveDataService) {}

  /**
   * 导入直播数据 - 需要登录
   * POST /api/live-data/import
   */
  @Post('import')
  @UseGuards(ActiveUserGuard)
  async importLiveData(@Body() dto: ImportDto, @Request() req) {
    const userId = req.user?.sub;
    return this.liveDataService.importLiveData(userId, dto);
  }

  /**
   * 获取直播列表 - 游客返回空数据
   * GET /api/live-data/list?page=1&limit=20&startDate=&endDate=
   */
  @Get('list')
  async getLiveStreams(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // 游客模式返回空数据
    if (!req.user) {
      return {
        code: 200,
        msg: 'success',
        data: {
          list: [],
          pagination: {
            page: parseInt(page || '1', 10),
            limit: parseInt(limit || '20', 10),
            total: 0,
          },
        },
      };
    }

    const userId = req.user?.sub;
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.liveDataService.getLiveStreams(userId, pageNum, limitNum, startDate, endDate);
  }

  /**
   * 获取直播详情 - 游客返回空数据
   * GET /api/live-data/detail/:id
   */
  @Get('detail/:id')
  async getLiveStreamDetail(@Param('id') liveId: string, @Request() req) {
    // 游客模式返回空数据
    if (!req.user) {
      return {
        code: 200,
        msg: 'success',
        data: null,
      };
    }

    const userId = req.user?.sub;
    return this.liveDataService.getLiveStreamDetail(userId, liveId);
  }

  /**
   * 删除直播数据 - 需要登录
   * DELETE /api/live-data/:id
   */
  @Delete(':id')
  @UseGuards(ActiveUserGuard)
  async deleteLiveStream(@Param('id') liveId: string, @Request() req) {
    const userId = req.user?.sub;
    return this.liveDataService.deleteLiveStream(userId, liveId);
  }

  /**
   * 获取直播数据仪表盘 - 游客返回示例数据
   * GET /api/live-data/dashboard?period=week
   */
  @Get('dashboard')
  async getDashboard(
    @Request() req,
    @Query('period') period?: string,
  ) {
    // 游客模式返回示例数据
    if (!req.user) {
      return {
        code: 200,
        msg: 'success',
        data: {
          summary: {
            totalStreams: 0,
            totalViews: 0,
            totalGmv: 0,
            avgOnline: 0,
          },
          trends: [],
          comparison: {
            vsLastPeriod: 0,
          },
        },
      };
    }

    const userId = req.user?.sub;
    const validPeriod = ['day', 'week', 'month', 'year'].includes(period as string) 
      ? period as 'day' | 'week' | 'month' | 'year'
      : 'week';
    return this.liveDataService.getDashboardStats(userId, validPeriod);
  }

  /**
   * 获取每日统计数据 - 游客返回空数据
   * GET /api/live-data/daily-stats?startDate=&endDate=
   */
  @Get('daily-stats')
  async getDailyStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // 游客模式返回空数据
    if (!req.user) {
      return {
        code: 200,
        msg: 'success',
        data: [],
      };
    }

    const userId = req.user?.sub;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];
    return this.liveDataService.getDailyStats(userId, start, end);
  }

  // ========== 管理员接口 ==========

  /**
   * 获取所有用户的直播数据（管理员）
   * GET /api/live-data/admin/all
   */
  @Get('admin/all')
  @UseGuards(ActiveUserGuard, AdminGuard)
  async getAllLiveStreams(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.liveDataService.getAllLiveStreamsForAdmin(pageNum, limitNum);
  }

  /**
   * 获取管理员统计数据
   * GET /api/live-data/admin/stats
   */
  @Get('admin/stats')
  @UseGuards(ActiveUserGuard, AdminGuard)
  async getAdminStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.liveDataService.getAdminStats(undefined, startDate, endDate);
  }
}
