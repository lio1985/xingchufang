import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { CustomerManagementService } from '../customer-management/customer-management.service';
import { getSupabaseClient } from '../storage/database/supabase-client';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard, ActiveUserGuard, AdminGuard)
export class AdminCustomerController {
  constructor(private readonly customerService: CustomerManagementService) {}

  /**
   * 获取所有客户列表（管理员）
   */
  @Get()
  async getAllCustomers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('salesId') salesId?: string,
    @Query('orderStatus') orderStatus?: string
  ) {
    console.log('[AdminCustomer] Get all customers:', { keyword, status, salesId });

    const supabase = getSupabaseClient();
    let query = supabase
      .from('customers')
      .select('*, users(name)', { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    // 关键词搜索
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%`);
    }

    // 状态筛选
    if (status) {
      query = query.eq('status', status);
    }

    // 订单状态筛选
    if (orderStatus) {
      query = query.eq('order_status', orderStatus);
    }

    // 销售筛选
    if (salesId && salesId.trim() !== '') {
      query = query.eq('user_id', salesId);
    }

    const pageNum = parseInt(page || '1', 10);
    const size = parseInt(pageSize || '20', 10);
    const from = (pageNum - 1) * size;
    const to = from + size - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('[AdminCustomer] Query error:', error);
      throw new Error(`查询失败: ${error.message}`);
    }

    // 处理数据格式
    const customers = data?.map(c => ({
      ...c,
      sales_name: Array.isArray(c.users) && c.users[0]?.name
        ? c.users[0].name
        : (c.users?.name || '未知')
    })) || [];

    return {
      code: 200,
      msg: 'success',
      data: {
        data: customers,
        total: count || 0,
        page: pageNum,
        pageSize: size
      }
    };
  }

  /**
   * 获取全局统计数据
   */
  @Get('statistics')
  async getGlobalStatistics() {
    console.log('[AdminCustomer] Get global statistics');

    const supabase = getSupabaseClient();

    // 获取总览数据
    const { data: overview, error: overviewError } = await supabase
      .from('customers')
      .select('status, order_status, estimated_amount, created_at')
      .eq('is_deleted', false);

    if (overviewError) {
      console.error('[AdminCustomer] Overview error:', overviewError);
      throw new Error(`获取统计失败: ${overviewError.message}`);
    }

    // 计算统计数据
    const totalCustomers = overview?.length || 0;
    let totalEstimatedAmount = 0;
    let completedOrders = 0;
    let inProgressOrders = 0;
    const statusDistribution = { normal: 0, atRisk: 0, lost: 0 };
    const typeDistribution: Record<string, number> = {};

    overview?.forEach(c => {
      totalEstimatedAmount += parseFloat(c.estimated_amount) || 0;

      if (c.order_status === 'completed') {
        completedOrders++;
      } else {
        inProgressOrders++;
      }

      if (c.status === 'normal') statusDistribution.normal++;
      else if (c.status === 'at_risk') statusDistribution.atRisk++;
      else if (c.status === 'lost') statusDistribution.lost++;
    });

    // 计算本周和上周增长
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeek = overview?.filter(c =>
      new Date(c.created_at) >= thisWeekStart
    ).length || 0;

    const lastWeek = overview?.filter(c => {
      const d = new Date(c.created_at);
      return d >= lastWeekStart && d < thisWeekStart;
    }).length || 0;

    const growthRate = lastWeek > 0
      ? ((thisWeek - lastWeek) / lastWeek) * 100
      : 0;

    return {
      code: 200,
      msg: 'success',
      data: {
        overview: {
          totalCustomers,
          totalEstimatedAmount,
          completedOrders,
          inProgressOrders
        },
        statusDistribution,
        orderDistribution: {
          inProgress: inProgressOrders,
          completed: completedOrders
        },
        typeDistribution,
        recentGrowth: {
          thisWeek,
          lastWeek,
          growthRate
        }
      }
    };
  }

  /**
   * 获取销售业绩排行
   */
  @Get('sales-ranking')
  async getSalesRanking() {
    console.log('[AdminCustomer] Get sales ranking');

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .select('user_id, status, order_status, estimated_amount, users(name)')
      .eq('is_deleted', false);

    if (error) {
      console.error('[AdminCustomer] Ranking error:', error);
      throw new Error(`获取排行失败: ${error.message}`);
    }

    // 按销售聚合
    const salesMap: Record<string, {
      user_id: string;
      sales_name: string;
      total: number;
      normal: number;
      atRisk: number;
      lost: number;
      completed: number;
      totalAmount: number;
    }> = {};

    data?.forEach(c => {
      const userId = c.user_id;
      const userName = Array.isArray(c.users) && c.users[0]?.name ? c.users[0].name : '未知';

      if (!salesMap[userId]) {
        salesMap[userId] = {
          user_id: userId,
          sales_name: userName,
          total: 0,
          normal: 0,
          atRisk: 0,
          lost: 0,
          completed: 0,
          totalAmount: 0
        };
      }

      salesMap[userId].total++;
      if (c.status === 'normal') salesMap[userId].normal++;
      if (c.status === 'at_risk') salesMap[userId].atRisk++;
      if (c.status === 'lost') salesMap[userId].lost++;
      if (c.order_status === 'completed') salesMap[userId].completed++;
      salesMap[userId].totalAmount += parseFloat(c.estimated_amount) || 0;
    });

    return {
      code: 200,
      msg: 'success',
      data: Object.values(salesMap)
    };
  }

  /**
   * 导出客户数据
   */
  @Post('export')
  async exportCustomers(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('salesId') salesId?: string
  ) {
    console.log('[AdminCustomer] Export customers');

    // TODO: 实现导出功能，生成CSV/Excel文件并返回下载链接
    // 这里先返回一个模拟的成功响应

    return {
      code: 200,
      msg: '导出功能开发中',
      data: {
        downloadUrl: ''
      }
    };
  }
}
