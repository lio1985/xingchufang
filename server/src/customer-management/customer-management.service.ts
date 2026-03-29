import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseService } from '../database/database.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateFollowUpDto, CustomerQueryDto } from './customer-management.dto';

@Injectable()
export class CustomerManagementService {
  private supabase: SupabaseClient;

  constructor(private readonly databaseService: DatabaseService) {
    this.supabase = this.databaseService.getClient();
  }

  // ========== 客户CRUD ==========

  async getCustomers(userId: string, isAdmin: boolean, query: CustomerQueryDto) {
    const { page = 1, pageSize = 20, status, customerType, orderBelonging, keyword, orderBy = 'updated_at', order = 'desc' } = query;

    let dbQuery = this.supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

    // 非管理员只能看自己的数据；管理员可以通过userId参数筛选特定用户的数据
    if (!isAdmin) {
      dbQuery = dbQuery.eq('user_id', userId);
    } else if (query.userId && query.userId.trim() !== '') {
      dbQuery = dbQuery.eq('user_id', query.userId);
    }

    // 筛选条件
    if (status) {
      dbQuery = dbQuery.eq('status', status);
    }
    if (customerType) {
      dbQuery = dbQuery.eq('customer_type', customerType);
    }
    if (orderBelonging) {
      dbQuery = dbQuery.eq('order_belonging', orderBelonging);
    }
    if (query.orderStatus) {
      dbQuery = dbQuery.eq('order_status', query.orderStatus);
    }
    if (keyword) {
      dbQuery = dbQuery.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%,wechat.ilike.%${keyword}%`);
    }

    // 排序和分页
    dbQuery = dbQuery.order(orderBy, { ascending: order === 'asc' });
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dbQuery = dbQuery.range(from, to);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('[CustomerService] Get customers error:', error);
      throw new Error(`获取客户列表失败: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  async getCustomerDetail(id: string, userId: string, isAdmin: boolean) {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .select(`*, follow_ups:customer_follow_ups(*), status_history:customer_status_history(*)`)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error || !customer) {
      throw new NotFoundException('客户不存在');
    }

    // 权限检查
    if (!isAdmin && customer.user_id !== userId) {
      throw new ForbiddenException('无权查看此客户');
    }

    return customer;
  }

  async createCustomer(dto: CreateCustomerDto, userId: string) {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .insert({
        ...dto,
        user_id: userId,
        first_follow_up_at: dto.firstFollowUpAt || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[CustomerService] Create customer error:', error);
      throw new Error(`创建客户失败: ${error.message}`);
    }

    // 如果有跟进记录，创建第一条跟进
    if (dto.firstFollowUpContent) {
      await this.supabase.from('customer_follow_ups').insert({
        customer_id: customer.id,
        user_id: userId,
        follow_up_time: dto.firstFollowUpAt || new Date().toISOString(),
        content: dto.firstFollowUpContent,
        follow_up_method: dto.firstFollowUpMethod || 'other'
      });
    }

    return customer;
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto, userId: string, isAdmin: boolean) {
    // 先检查权限
    const { data: existing } = await this.supabase
      .from('customers')
      .select('user_id, status')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!existing) {
      throw new NotFoundException('客户不存在');
    }

    if (!isAdmin && existing.user_id !== userId) {
      throw new ForbiddenException('无权修改此客户');
    }

    // 如果状态变更，记录历史
    if (dto.status && dto.status !== existing.status) {
      await this.supabase.from('customer_status_history').insert({
        customer_id: id,
        user_id: userId,
        old_status: existing.status,
        new_status: dto.status,
        reason: dto.statusChangeReason
      });
    }

    const { data: customer, error } = await this.supabase
      .from('customers')
      .update({
        ...dto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[CustomerService] Update customer error:', error);
      throw new Error(`更新客户失败: ${error.message}`);
    }

    return customer;
  }

  async deleteCustomer(id: string, userId: string, isAdmin: boolean) {
    const { data: existing } = await this.supabase
      .from('customers')
      .select('user_id')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!existing) {
      throw new NotFoundException('客户不存在');
    }

    if (!isAdmin && existing.user_id !== userId) {
      throw new ForbiddenException('无权删除此客户');
    }

    const { error } = await this.supabase
      .from('customers')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[CustomerService] Delete customer error:', error);
      throw new Error(`删除客户失败: ${error.message}`);
    }
  }

  // ========== 跟进记录 ==========

  async createFollowUp(customerId: string, dto: CreateFollowUpDto, userId: string, isAdmin: boolean) {
    // 检查权限
    const { data: customer } = await this.supabase
      .from('customers')
      .select('user_id')
      .eq('id', customerId)
      .eq('is_deleted', false)
      .single();

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    if (!isAdmin && customer.user_id !== userId) {
      throw new ForbiddenException('无权为此客户添加跟进记录');
    }

    const { data: followUp, error } = await this.supabase
      .from('customer_follow_ups')
      .insert({
        customer_id: customerId,
        user_id: userId,
        follow_up_time: dto.followUpTime,
        content: dto.content,
        follow_up_method: dto.followUpMethod,
        next_follow_up_plan: dto.nextFollowUpPlan
      })
      .select()
      .single();

    if (error) {
      console.error('[CustomerService] Create follow-up error:', error);
      throw new Error(`创建跟进记录失败: ${error.message}`);
    }

    return followUp;
  }

  async getFollowUps(customerId: string, userId: string, isAdmin: boolean) {
    // 检查权限
    const { data: customer } = await this.supabase
      .from('customers')
      .select('user_id')
      .eq('id', customerId)
      .eq('is_deleted', false)
      .single();

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    if (!isAdmin && customer.user_id !== userId) {
      throw new ForbiddenException('无权查看此客户的跟进记录');
    }

    const { data: followUps, error } = await this.supabase
      .from('customer_follow_ups')
      .select('*')
      .eq('customer_id', customerId)
      .order('follow_up_time', { ascending: false });

    if (error) {
      console.error('[CustomerService] Get follow-ups error:', error);
      throw new Error(`获取跟进记录失败: ${error.message}`);
    }

    return followUps || [];
  }

  // ========== 统计功能 ==========

  async getStatistics(userId: string, isAdmin: boolean) {
    // 获取今日新增客户数
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayQuery = this.supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('is_deleted', false)
      .gte('created_at', today.toISOString());

    if (!isAdmin) {
      todayQuery = todayQuery.eq('user_id', userId);
    }

    const { count: todayNew } = await todayQuery;

    // 获取待跟进客户数（需要今日跟进的客户）
    let pendingQuery = this.supabase
      .from('customers')
      .select('id', { count: 'exact' })
      .eq('is_deleted', false)
      .eq('status', 'normal'); // 正常状态的客户

    if (!isAdmin) {
      pendingQuery = pendingQuery.eq('user_id', userId);
    }

    const { count: pendingFollowUp } = await pendingQuery;

    // 获取全部客户的状态分布
    let statusQuery = this.supabase
      .from('customers')
      .select('status, order_status, estimated_amount')
      .eq('is_deleted', false);

    if (!isAdmin) {
      statusQuery = statusQuery.eq('user_id', userId);
    }

    const { data: customers, error } = await statusQuery;

    if (error) {
      console.error('[CustomerService] Get statistics error:', error);
      throw new Error(`获取统计数据失败: ${error.message}`);
    }

    const total = customers?.length || 0;
    const normal = customers?.filter(c => c.status === 'normal').length || 0;
    const atRisk = customers?.filter(c => c.status === 'at_risk').length || 0;
    const lost = customers?.filter(c => c.status === 'lost').length || 0;
    const inProgress = customers?.filter(c => c.order_status === 'in_progress').length || 0;
    const completed = customers?.filter(c => c.order_status === 'completed').length || 0;
    const totalAmount = customers?.reduce((sum, c) => sum + (parseFloat(c.estimated_amount) || 0), 0) || 0;

    return {
      total,
      todayNew: todayNew || 0,
      pendingFollowUp: pendingFollowUp || 0,
      statusDistribution: { normal, atRisk, lost },
      orderDistribution: { inProgress, completed },
      totalEstimatedAmount: totalAmount,
      conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
    };
  }

  async getWeeklyStatistics(userId: string, isAdmin: boolean) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let query = this.supabase
      .from('customers')
      .select('created_at, status, estimated_amount')
      .eq('is_deleted', false)
      .gte('created_at', weekStart.toISOString());

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('[CustomerService] Get weekly statistics error:', error);
      throw new Error(`获取周统计失败: ${error.message}`);
    }

    // 按天统计
    const dailyStats: Record<string, { new: number; followUp: number }> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = { new: 0, followUp: 0 };
    }

    customers?.forEach(c => {
      const dateStr = c.created_at.split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].new++;
      }
    });

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: now.toISOString().split('T')[0],
      newCustomers: customers?.length || 0,
      dailyStats,
      totalAmount: customers?.reduce((sum, c) => sum + (parseFloat(c.estimated_amount) || 0), 0) || 0
    };
  }

  async getMonthlyStatistics(userId: string, isAdmin: boolean) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let query = this.supabase
      .from('customers')
      .select('created_at, status, order_status, estimated_amount')
      .eq('is_deleted', false)
      .gte('created_at', monthStart.toISOString());

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('[CustomerService] Get monthly statistics error:', error);
      throw new Error(`获取月统计失败: ${error.message}`);
    }

    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      newCustomers: customers?.length || 0,
      statusDistribution: {
        normal: customers?.filter(c => c.status === 'normal').length || 0,
        atRisk: customers?.filter(c => c.status === 'at_risk').length || 0,
        lost: customers?.filter(c => c.status === 'lost').length || 0
      },
      completedOrders: customers?.filter(c => c.order_status === 'completed').length || 0,
      totalAmount: customers?.reduce((sum, c) => sum + (parseFloat(c.estimated_amount) || 0), 0) || 0
    };
  }

  async getStatisticsBySales() {
    const { data: stats, error } = await this.supabase
      .from('customers')
      .select('user_id, status, order_status, estimated_amount, users(name)')
      .eq('is_deleted', false);

    if (error) {
      console.error('[CustomerService] Get statistics by sales error:', error);
      throw new Error(`获取销售统计失败: ${error.message}`);
    }

    // 按销售聚合
    const salesMap: Record<string, {
      name: string;
      total: number;
      normal: number;
      atRisk: number;
      lost: number;
      completed: number;
      totalAmount: number;
    }> = {};

    stats?.forEach(c => {
      const userId = c.user_id;
      if (!salesMap[userId]) {
        salesMap[userId] = {
          name: Array.isArray(c.users) && c.users[0]?.name ? c.users[0].name : '未知',
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

    return Object.entries(salesMap).map(([userId, data]) => ({
      userId,
      ...data,
      conversionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : '0'
    }));
  }
}
