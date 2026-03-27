import { Controller, Get, Request, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';

@Controller('statistics')
@UseGuards(ActiveUserGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 获取数据看板（根据用户角色返回不同数据）
   * 管理员：全局数据
   * 普通用户：个人数据 + 团队数据
   */
  @Get('dashboard')
  async getDashboard(@Request() req, @Query('period') period?: string) {
    try {
      const userId = req.user.sub;
      const userRole = req.user.role;

      if (userRole === 'admin') {
        // 管理员：返回全局数据
        const globalStats = await this.statisticsService.getGlobalStatistics();
        const trends = await this.statisticsService.getGlobalTrends(period || 'week');
        
        return {
          code: 200,
          msg: 'success',
          data: {
            type: 'global',
            stats: globalStats,
            trends,
          },
        };
      } else {
        // 普通用户：返回个人数据 + 团队数据
        const personalStats = await this.statisticsService.getUserDashboardStats(userId, period || 'week');
        const teamStats = await this.statisticsService.getTeamDashboardStats(userId, period || 'week');
        
        return {
          code: 200,
          msg: 'success',
          data: {
            type: 'personal',
            personal: personalStats,
            team: teamStats,
          },
        };
      }
    } catch (error) {
      console.error('获取数据看板失败:', error);
      return {
        code: 500,
        msg: '获取数据看板失败',
        data: null,
      };
    }
  }

  /**
   * 获取当前用户统计
   */
  @Get('me')
  async getCurrentUserStatistics(@Request() req) {
    try {
      const userId = req.user.sub;
      const today = new Date().toISOString().split('T')[0];

      const statistics = await this.statisticsService.getUserStatistics(userId, today);

      return {
        code: 200,
        msg: 'success',
        data: statistics,
      };
    } catch (error) {
      console.error('获取当前用户统计失败:', error);
      return {
        code: 500,
        msg: '获取统计失败',
        data: null,
      };
    }
  }

  /**
   * 获取当前用户统计列表
   */
  @Get('me/history')
  async getCurrentUserStatisticsList(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const userId = req.user.sub;
      const statistics = await this.statisticsService.getUserStatisticsList(userId, {
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : undefined,
      });

      return {
        code: 200,
        msg: 'success',
        data: statistics,
      };
    } catch (error) {
      console.error('获取用户统计列表失败:', error);
      return {
        code: 500,
        msg: '获取统计列表失败',
        data: null,
      };
    }
  }

  /**
   * 获取全局统计（仅管理员）
   */
  @Get('overview')
  @UseGuards(AdminGuard)
  async getGlobalStatistics() {
    try {
      const statistics = await this.statisticsService.getGlobalStatistics();

      return {
        code: 200,
        msg: 'success',
        data: statistics,
      };
    } catch (error) {
      console.error('获取全局统计失败:', error);
      return {
        code: 500,
        msg: '获取全局统计失败',
        data: null,
      };
    }
  }

  /**
   * 获取活跃用户排行（仅管理员）
   */
  @Get('ranking/active')
  @UseGuards(AdminGuard)
  async getActiveUserRanking(@Query('limit') limit?: string) {
    try {
      const rankings = await this.statisticsService.getActiveUserRanking(
        limit ? parseInt(limit) : 10,
      );

      return {
        code: 200,
        msg: 'success',
        data: rankings,
      };
    } catch (error) {
      console.error('获取活跃用户排行失败:', error);
      return {
        code: 500,
        msg: '获取排行失败',
        data: null,
      };
    }
  }
}
