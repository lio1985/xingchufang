import { Controller, Get, Post, Put, Delete, Query, Body, Param, Request, UseGuards } from '@nestjs/common';
import { RecycleManagementService } from './recycle-management.service';
import { CreateRecycleStoreDto, UpdateRecycleStoreDto, CreateFollowUpDto, RecycleStoreQueryDto } from './recycle-management.dto';
import { ActiveUserGuard } from '../guards/active-user.guard';

@Controller('recycle')
@UseGuards(ActiveUserGuard)
export class RecycleManagementController {
  constructor(private readonly recycleService: RecycleManagementService) {}

  // ========== 回收门店管理 ==========

  /**
   * 获取回收门店列表
   */
  @Get('stores')
  async getStores(@Request() req, @Query() query: RecycleStoreQueryDto) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    console.log('[RecycleController] Get stores:', { userId, isAdmin, query });

    const result = await this.recycleService.getStores(userId, isAdmin, query);

    return {
      code: 200,
      msg: '获取成功',
      data: result
    };
  }

  /**
   * 获取回收门店详情
   */
  @Get('stores/:id')
  async getStoreDetail(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const store = await this.recycleService.getStoreDetail(id, userId, isAdmin);

    return {
      code: 200,
      msg: '获取成功',
      data: store
    };
  }

  /**
   * 创建回收门店
   */
  @Post('stores')
  async createStore(@Request() req, @Body() dto: CreateRecycleStoreDto) {
    const userId = req.user?.id;

    console.log('[RecycleController] Create store:', { userId, dto });

    const store = await this.recycleService.createStore(dto, userId);

    return {
      code: 200,
      msg: '创建成功',
      data: store
    };
  }

  /**
   * 更新回收门店
   */
  @Put('stores/:id')
  async updateStore(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateRecycleStoreDto
  ) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    console.log('[RecycleController] Update store:', { id, userId, isAdmin, dto });

    const store = await this.recycleService.updateStore(id, dto, userId, isAdmin);

    return {
      code: 200,
      msg: '更新成功',
      data: store
    };
  }

  /**
   * 删除回收门店
   */
  @Delete('stores/:id')
  async deleteStore(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    await this.recycleService.deleteStore(id, userId, isAdmin);

    return {
      code: 200,
      msg: '删除成功',
      data: { success: true }
    };
  }

  // ========== 跟进记录 ==========

  /**
   * 获取门店跟进记录
   */
  @Get('stores/:id/follow-ups')
  async getStoreFollowUps(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const followUps = await this.recycleService.getFollowUps(id, userId, isAdmin);

    return {
      code: 200,
      msg: '获取成功',
      data: followUps
    };
  }

  /**
   * 创建跟进记录
   */
  @Post('stores/:id/follow-ups')
  async createStoreFollowUp(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateFollowUpDto
  ) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    console.log('[RecycleController] Create follow-up:', { storeId: id, userId, dto });

    const followUp = await this.recycleService.createFollowUp(id, dto, userId, isAdmin);

    return {
      code: 200,
      msg: '创建成功',
      data: followUp
    };
  }

  // ========== 统计数据 ==========

  /**
   * 获取回收总览统计
   */
  @Get('statistics/overview')
  async getOverviewStatistics(@Request() req) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const statistics = await this.recycleService.getOverviewStatistics(userId, isAdmin);

    return {
      code: 200,
      msg: '获取成功',
      data: statistics
    };
  }

  /**
   * 获取回收详细统计面板
   */
  @Get('statistics/dashboard')
  async getDashboardStatistics(@Request() req) {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const overview = await this.recycleService.getOverviewStatistics(userId, isAdmin);

    // 获取月度趋势（最近6个月）
    const now = new Date();
    const monthlyTrend: Array<{ month: string; count: number; value: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().slice(0, 7);
      const { data: monthStores } = await this.recycleService['supabase']
        .from('recycle_stores')
        .select('estimated_value')
        .eq('is_deleted', false)
        .gte('created_at', monthStr)
        .lt('created_at', `${monthStr}-01`);

      const count = monthStores?.length || 0;
      const value = monthStores?.reduce((sum, s) => sum + (s.estimated_value || 0), 0) || 0;

      monthlyTrend.push({
        month: monthStr,
        count,
        value
      });
    }

    // 计算周环比增长
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const { data: thisWeekStores } = await this.recycleService['supabase']
      .from('recycle_stores')
      .select('id')
      .eq('is_deleted', false)
      .gte('created_at', thisWeekStart.toISOString());

    const { data: lastWeekStores } = await this.recycleService['supabase']
      .from('recycle_stores')
      .select('id')
      .eq('is_deleted', false)
      .gte('created_at', lastWeekStart.toISOString())
      .lt('created_at', thisWeekStart.toISOString());

    const thisWeekCount = thisWeekStores?.length || 0;
    const lastWeekCount = lastWeekStores?.length || 0;
    const growthRate = lastWeekCount > 0
      ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
      : 0;

    // 计算总成本
    const { data: costStores } = await this.recycleService['supabase']
      .from('recycle_stores')
      .select('total_cost')
      .eq('is_deleted', false);

    const totalCost = costStores?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;

    return {
      code: 200,
      msg: '获取成功',
      data: {
        overview: {
          totalStores: overview.total,
          totalEstimatedValue: overview.totalEstimatedValue,
          completedRecycles: overview.statusDistribution.completed || 0,
          inProgressRecycles:
            (overview.statusDistribution.negotiating || 0) +
            (overview.statusDistribution.deal || 0) +
            (overview.statusDistribution.recycling || 0),
          totalCost
        },
        statusDistribution: overview.statusDistribution,
        businessTypeDistribution: overview.businessTypeDistribution,
        recentGrowth: {
          thisWeek: thisWeekCount,
          lastWeek: lastWeekCount,
          growthRate
        },
        monthlyTrend
      }
    };
  }
}
