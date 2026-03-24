import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../../storage/database/supabase-client';

export interface SalesTarget {
  id?: string;
  user_id: string;
  target_type: 'monthly' | 'quarterly' | 'yearly';
  target_year: number;
  target_month?: number;
  target_quarter?: number;
  target_amount: number;
  target_deals: number;
  target_customers: number;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  user_name?: string; // 关联查询字段
}

export interface TargetProgress {
  target: SalesTarget;
  currentAmount: number;
  currentDeals: number;
  currentCustomers: number;
  amountProgress: number; // 金额完成百分比
  dealsProgress: number; // 成交数完成百分比
  customersProgress: number; // 客户数完成百分比
  daysElapsed: number;
  daysTotal: number;
  timeProgress: number; // 时间进度百分比
  isAhead: boolean; // 是否超前完成
  gapAmount: number; // 差额
}

export interface TeamTargetStats {
  totalTargets: number;
  achievedTargets: number;
  totalTargetAmount: number;
  totalAchievedAmount: number;
  overallProgress: number;
  byMember: Array<{
    userId: string;
    userName: string;
    targetAmount: number;
    achievedAmount: number;
    progress: number;
    rank: number;
  }>;
}

@Injectable()
export class SalesTargetService {
  /**
   * 创建业绩目标
   */
  async createTarget(target: Omit<SalesTarget, 'id' | 'created_at' | 'updated_at'>): Promise<SalesTarget | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('sales_targets')
      .insert([{
        ...target,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[SalesTarget] Create error:', error);
      return null;
    }

    return data;
  }

  /**
   * 更新业绩目标
   */
  async updateTarget(targetId: string, updates: Partial<SalesTarget>): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('sales_targets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);

    if (error) {
      console.error('[SalesTarget] Update error:', error);
      return false;
    }

    return true;
  }

  /**
   * 删除业绩目标
   */
  async deleteTarget(targetId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('sales_targets')
      .delete()
      .eq('id', targetId);

    if (error) {
      console.error('[SalesTarget] Delete error:', error);
      return false;
    }

    return true;
  }

  /**
   * 获取单个目标详情
   */
  async getTargetById(targetId: string): Promise<SalesTarget | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('sales_targets')
      .select('*, users(name)')
      .eq('id', targetId)
      .single();

    if (error || !data) {
      console.error('[SalesTarget] Get by id error:', error);
      return null;
    }

    return {
      ...data,
      user_name: data.users?.name,
    };
  }

  /**
   * 查询目标列表
   */
  async getTargets(params: {
    userId?: string;
    targetType?: string;
    year?: number;
    month?: number;
    quarter?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ targets: SalesTarget[]; total: number }> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('sales_targets')
      .select('*, users(name)', { count: 'exact' });

    if (params.userId && params.userId.trim() !== '') {
      query = query.eq('user_id', params.userId);
    }
    if (params.targetType) {
      query = query.eq('target_type', params.targetType);
    }
    if (params.year) {
      query = query.eq('target_year', params.year);
    }
    if (params.month) {
      query = query.eq('target_month', params.month);
    }
    if (params.quarter) {
      query = query.eq('target_quarter', params.quarter);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query
      .order('target_year', { ascending: false })
      .order('target_month', { ascending: false })
      .order('target_quarter', { ascending: false })
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);

    if (error) {
      console.error('[SalesTarget] Get list error:', error);
      return { targets: [], total: 0 };
    }

    const targets = (data || []).map(item => ({
      ...item,
      user_name: item.users?.name,
    }));

    return { targets, total: count || 0 };
  }

  /**
   * 获取当前期间的目标
   */
  async getCurrentTarget(userId: string, type: 'monthly' | 'quarterly' | 'yearly'): Promise<SalesTarget | null> {
    const now = new Date();
    const year = now.getFullYear();
    
    let query = getSupabaseClient()
      .from('sales_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('target_type', type)
      .eq('target_year', year)
      .eq('status', 'active');

    if (type === 'monthly') {
      query = query.eq('target_month', now.getMonth() + 1);
    } else if (type === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      query = query.eq('target_quarter', quarter);
    }

    const { data, error } = await query.single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * 计算目标进度
   */
  async getTargetProgress(targetId: string): Promise<TargetProgress | null> {
    const supabase = getSupabaseClient();

    // 获取目标信息
    const target = await this.getTargetById(targetId);
    if (!target) return null;

    // 获取实际业绩数据
    const { data: customers, error } = await supabase
      .from('customers')
      .select('actual_amount, order_status')
      .eq('user_id', target.user_id)
      .eq('is_deleted', false)
      .gte('created_at', target.start_date)
      .lte('created_at', target.end_date);

    if (error) {
      console.error('[SalesTarget] Get progress error:', error);
      return null;
    }

    // 计算实际完成
    const currentAmount = customers?.reduce((sum, c) => sum + (parseFloat(c.actual_amount) || 0), 0) || 0;
    const currentDeals = customers?.filter(c => c.order_status === 'completed').length || 0;
    const currentCustomers = customers?.length || 0;

    // 计算进度百分比
    const amountProgress = target.target_amount > 0 ? Math.round((currentAmount / target.target_amount) * 100) : 0;
    const dealsProgress = target.target_deals > 0 ? Math.round((currentDeals / target.target_deals) * 100) : 0;
    const customersProgress = target.target_customers > 0 ? Math.round((currentCustomers / target.target_customers) * 100) : 0;

    // 计算时间进度
    const start = new Date(target.start_date);
    const end = new Date(target.end_date);
    const now = new Date();
    const daysTotal = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const timeProgress = daysTotal > 0 ? Math.round((daysElapsed / daysTotal) * 100) : 0;

    // 判断是否超前
    const isAhead = amountProgress >= timeProgress;
    const gapAmount = target.target_amount - currentAmount;

    return {
      target,
      currentAmount,
      currentDeals,
      currentCustomers,
      amountProgress,
      dealsProgress,
      customersProgress,
      daysElapsed,
      daysTotal,
      timeProgress,
      isAhead,
      gapAmount,
    };
  }

  /**
   * 获取用户所有目标的进度
   */
  async getUserTargetsProgress(userId: string): Promise<TargetProgress[]> {
    const { targets } = await this.getTargets({
      userId,
      status: 'active',
      limit: 100,
    });

    const progresses: TargetProgress[] = [];
    for (const target of targets) {
      const progress = await this.getTargetProgress(target.id!);
      if (progress) {
        progresses.push(progress);
      }
    }

    return progresses.sort((a, b) => b.amountProgress - a.amountProgress);
  }

  /**
   * 获取团队目标统计
   */
  async getTeamTargetStats(year?: number, month?: number, quarter?: number): Promise<TeamTargetStats> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    
    const { targets } = await this.getTargets({
      year: targetYear,
      month,
      quarter,
      status: 'active',
      limit: 1000,
    });

    let totalTargetAmount = 0;
    let totalAchievedAmount = 0;
    const memberMap: Record<string, {
      userId: string;
      userName: string;
      targetAmount: number;
      achievedAmount: number;
    }> = {};

    for (const target of targets) {
      const progress = await this.getTargetProgress(target.id!);
      if (!progress) continue;

      totalTargetAmount += target.target_amount;
      totalAchievedAmount += progress.currentAmount;

      const key = target.user_id;
      if (!memberMap[key]) {
        memberMap[key] = {
          userId: target.user_id,
          userName: target.user_name || '未知',
          targetAmount: 0,
          achievedAmount: 0,
        };
      }
      memberMap[key].targetAmount += target.target_amount;
      memberMap[key].achievedAmount += progress.currentAmount;
    }

    const byMember = Object.values(memberMap)
      .map(m => ({
        ...m,
        progress: m.targetAmount > 0 ? Math.round((m.achievedAmount / m.targetAmount) * 100) : 0,
        rank: 0,
      }))
      .sort((a, b) => b.progress - a.progress)
      .map((m, idx) => ({ ...m, rank: idx + 1 }));

    return {
      totalTargets: targets.length,
      achievedTargets: byMember.filter(m => m.progress >= 100).length,
      totalTargetAmount,
      totalAchievedAmount,
      overallProgress: totalTargetAmount > 0 ? Math.round((totalAchievedAmount / totalTargetAmount) * 100) : 0,
      byMember,
    };
  }

  /**
   * 检查是否需要创建目标（如果没有当前期间的目标）
   */
  async checkAndSuggestTarget(userId: string): Promise<{ needsTarget: boolean; suggestedType: string; message: string }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.floor(now.getMonth() / 3) + 1;

    // 检查月度目标
    const monthlyTarget = await this.getCurrentTarget(userId, 'monthly');
    if (!monthlyTarget) {
      return {
        needsTarget: true,
        suggestedType: 'monthly',
        message: `${year}年${month}月业绩目标尚未设置`,
      };
    }

    // 检查季度目标
    const quarterlyTarget = await this.getCurrentTarget(userId, 'quarterly');
    if (!quarterlyTarget) {
      return {
        needsTarget: true,
        suggestedType: 'quarterly',
        message: `${year}年第${quarter}季度业绩目标尚未设置`,
      };
    }

    // 检查年度目标
    const yearlyTarget = await this.getCurrentTarget(userId, 'yearly');
    if (!yearlyTarget) {
      return {
        needsTarget: true,
        suggestedType: 'yearly',
        message: `${year}年年度业绩目标尚未设置`,
      };
    }

    return {
      needsTarget: false,
      suggestedType: '',
      message: '当前期间目标已设置',
    };
  }
}
