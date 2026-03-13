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
@UseGuards(ActiveUserGuard)
export class LiveDataController {
  constructor(private readonly liveDataService: LiveDataService) {}

  /**
   * 导入直播数据
   * POST /api/live-data/import
   */
  @Post('import')
  async importLiveData(@Body() dto: ImportDto, @Request() req) {
    const userId = req.user?.sub;
    return this.liveDataService.importLiveData(userId, dto);
  }

  /**
   * 获取直播列表
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
    const userId = req.user?.sub;
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.liveDataService.getLiveStreams(userId, pageNum, limitNum, startDate, endDate);
  }

  /**
   * 获取直播详情
   * GET /api/live-data/detail/:id
   */
  @Get('detail/:id')
  async getLiveStreamDetail(@Param('id') liveId: string, @Request() req) {
    const userId = req.user?.sub;
    return this.liveDataService.getLiveStreamDetail(userId, liveId);
  }

  /**
   * 删除直播记录
   * DELETE /api/live-data/:id
   */
  @Delete(':id')
  async deleteLiveStream(@Param('id') liveId: string, @Request() req) {
    const userId = req.user?.sub;
    return this.liveDataService.deleteLiveStream(userId, liveId);
  }

  /**
   * 获取每日统计
   * GET /api/live-data/daily-stats?startDate=&endDate=
   */
  @Get('daily-stats')
  async getDailyStats(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = req.user?.sub;
    return this.liveDataService.getDailyStats(userId, startDate, endDate);
  }

  /**
   * 获取看板统计数据
   * GET /api/live-data/dashboard?period=day|week|month|year
   */
  @Get('dashboard')
  async getDashboardStats(
    @Request() req,
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
  ) {
    const userId = req.user?.sub;
    return this.liveDataService.getDashboardStats(userId, period);
  }

  /**
   * 获取历史平均数据（用于对比）
   * GET /api/live-data/historical-average
   */
  @Get('historical-average')
  async getHistoricalAverage(@Request() req) {
    const userId = req.user?.sub;
    const data = await this.liveDataService.getHistoricalAverage(userId);
    return { success: true, data };
  }

  /**
   * 管理员：获取所有用户的直播数据
   * GET /api/live-data/admin/all-list
   */
  @Get('admin/all-list')
  @UseGuards(AdminGuard)
  async getAllLiveStreamsForAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.liveDataService.getAllLiveStreamsForAdmin(pageNum, limitNum, userId, startDate, endDate);
  }
}
