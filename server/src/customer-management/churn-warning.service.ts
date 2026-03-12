import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

export interface ChurnRiskConfig {
  // 时间阈值（天）
  yellowThreshold: number;   // 黄色预警：7天未跟进
  orangeThreshold: number;   // 橙色预警：14天未跟进
  redThreshold: number;      // 红色预警：30天未跟进
  
  // 风险加分项
  competitorMentionWeight: number;  // 提及竞品加分
  priceSensitivityWeight: number;   // 价格敏感加分
  negativeFeedbackWeight: number;   // 负面反馈加分
  
  // 风险减分项
  highValueDiscount: number;        // 高价值客户减分
  loyalCustomerDiscount: number;    // 老客户减分
}

export interface ChurnRiskAssessment {
  customerId: string;
  customerName: string;
  riskLevel: 'low' | 'yellow' | 'orange' | 'red';
  riskScore: number;  // 0-100
  daysSinceLastFollowUp: number;
  riskFactors: string[];
  suggestedActions: string[];
  lastFollowUpDate?: string;
  salesName?: string;
  estimatedAmount?: number;
}

// 预警处理记录接口
export interface ChurnWarningRecord {
  id?: string;
  customer_id: string;
  customer_name: string;
  risk_level: 'yellow' | 'orange' | 'red';
  risk_score: number;
  handled_by: string;
  handler_name: string;
  handle_action: 'phone' | 'visit' | 'message' | 'email' | 'other';
  handle_result: 'success' | 'pending' | 'failed' | 'converted';
  handle_notes?: string;
  follow_up_date?: string;
  created_at?: string;
  updated_at?: string;
}

// 处理结果统计
export interface HandleResultStats {
  totalWarnings: number;
  handledCount: number;
  successCount: number;
  convertedCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;  // 成功率（包含converted）
  conversionRate: number;  // 转化率
  byActionType: Record<string, { count: number; successRate: number }>;
  byRiskLevel: Record<string, { count: number; successRate: number }>;
  monthlyTrend: Array<{
    month: string;
    warnings: number;
    handled: number;
    success: number;
    converted: number;
  }>;
}

// 默认预警配置
export const DEFAULT_CHURN_CONFIG: ChurnRiskConfig = {
  yellowThreshold: 7,
  orangeThreshold: 14,
  redThreshold: 30,
  competitorMentionWeight: 20,
  priceSensitivityWeight: 15,
  negativeFeedbackWeight: 25,
  highValueDiscount: 10,
  loyalCustomerDiscount: 15,
};

@Injectable()
export class ChurnWarningService {
  private config: ChurnRiskConfig = DEFAULT_CHURN_CONFIG;

  /**
   * 更新预警配置
   */
  updateConfig(newConfig: Partial<ChurnRiskConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): ChurnRiskConfig {
    return { ...this.config };
  }

  /**
   * 评估单个客户的流失风险
   */
  async assessCustomerRisk(customerId: string): Promise<ChurnRiskAssessment | null> {
    const supabase = getSupabaseClient();

    // 获取客户信息和跟进记录
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*, users(name)')
      .eq('id', customerId)
      .eq('is_deleted', false)
      .single();

    if (customerError || !customer) {
      console.error('[ChurnWarning] Customer not found:', customerId);
      return null;
    }

    // 获取最近的跟进记录
    const { data: followUps, error: followUpError } = await supabase
      .from('customer_follow_ups')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (followUpError) {
      console.error('[ChurnWarning] Follow-up query error:', followUpError);
    }

    const lastFollowUp = followUps?.[0];
    const lastFollowUpDate = lastFollowUp?.created_at;
    
    // 计算距离上次跟进的天数
    const daysSinceLastFollowUp = lastFollowUpDate
      ? Math.floor((Date.now() - new Date(lastFollowUpDate).getTime()) / (1000 * 60 * 60 * 24))
      : Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));

    // 风险评估
    let riskScore = 0;
    const riskFactors: string[] = [];
    const suggestedActions: string[] = [];

    // 基于时间的风险评分
    if (daysSinceLastFollowUp >= this.config.redThreshold) {
      riskScore += 50;
      riskFactors.push(`超过${this.config.redThreshold}天未跟进`);
      suggestedActions.push('立即电话回访，了解客户现状');
      suggestedActions.push('发送关怀短信或微信');
    } else if (daysSinceLastFollowUp >= this.config.orangeThreshold) {
      riskScore += 35;
      riskFactors.push(`超过${this.config.orangeThreshold}天未跟进`);
      suggestedActions.push('安排专人跟进，了解客户需求变化');
    } else if (daysSinceLastFollowUp >= this.config.yellowThreshold) {
      riskScore += 20;
      riskFactors.push(`超过${this.config.yellowThreshold}天未跟进`);
      suggestedActions.push('发送产品资料或优惠信息');
    }

    // 分析跟进内容中的风险信号
    followUps?.forEach(fu => {
      const content = fu.content?.toLowerCase() || '';
      
      // 竞品提及
      if (content.includes('竞品') || content.includes('竞争对手') || content.includes('别家')) {
        riskScore += this.config.competitorMentionWeight;
        if (!riskFactors.includes('客户提及竞品')) {
          riskFactors.push('客户提及竞品');
          suggestedActions.push('准备竞品对比资料，突出差异化优势');
        }
      }
      
      // 价格敏感
      if (content.includes('贵') || content.includes('便宜') || content.includes('预算') || content.includes('降价')) {
        riskScore += this.config.priceSensitivityWeight;
        if (!riskFactors.includes('客户对价格敏感')) {
          riskFactors.push('客户对价格敏感');
          suggestedActions.push('提供优惠方案或分期付款选项');
        }
      }
      
      // 负面反馈
      if (content.includes('不满意') || content.includes('失望') || content.includes('问题') || content.includes('投诉')) {
        riskScore += this.config.negativeFeedbackWeight;
        if (!riskFactors.includes('客户表达不满')) {
          riskFactors.push('客户表达不满');
          suggestedActions.push('主管亲自跟进，解决客户问题');
        }
      }
    });

    // 客户状态风险
    if (customer.status === 'at_risk') {
      riskScore += 15;
      riskFactors.push('客户状态标记为有风险');
    } else if (customer.status === 'lost') {
      riskScore += 30;
      riskFactors.push('客户已流失');
    }

    // 订单状态风险
    if (customer.order_status === 'in_progress' && daysSinceLastFollowUp > 14) {
      riskScore += 10;
      riskFactors.push('进行中的订单长期无进展');
    }

    // 高价值客户减分（优先处理）
    const estimatedAmount = parseFloat(customer.estimated_amount) || 0;
    if (estimatedAmount > 100000) {
      riskScore -= this.config.highValueDiscount;
      riskFactors.push('高价值客户（优先级提升）');
    }

    // 确保分数在0-100之间
    riskScore = Math.max(0, Math.min(100, riskScore));

    // 确定风险等级
    let riskLevel: 'low' | 'yellow' | 'orange' | 'red' = 'low';
    if (riskScore >= 60 || daysSinceLastFollowUp >= this.config.redThreshold) {
      riskLevel = 'red';
    } else if (riskScore >= 40 || daysSinceLastFollowUp >= this.config.orangeThreshold) {
      riskLevel = 'orange';
    } else if (riskScore >= 20 || daysSinceLastFollowUp >= this.config.yellowThreshold) {
      riskLevel = 'yellow';
    }

    // 如果没有特定建议，添加默认建议
    if (suggestedActions.length === 0) {
      suggestedActions.push('定期保持联系，维护客户关系');
    }

    return {
      customerId,
      customerName: customer.name,
      riskLevel,
      riskScore,
      daysSinceLastFollowUp,
      riskFactors,
      suggestedActions,
      lastFollowUpDate,
      salesName: Array.isArray(customer.users) && customer.users[0]?.name
        ? customer.users[0].name
        : (customer.users?.name || '未知'),
      estimatedAmount,
    };
  }

  /**
   * 批量评估所有客户的风险
   */
  async assessAllCustomers(salesId?: string): Promise<ChurnRiskAssessment[]> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('customers')
      .select('id')
      .eq('is_deleted', false);

    if (salesId && salesId.trim() !== '') {
      query = query.eq('user_id', salesId);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('[ChurnWarning] Query error:', error);
      throw new Error(`查询客户失败: ${error.message}`);
    }

    const assessments: ChurnRiskAssessment[] = [];

    for (const customer of customers || []) {
      const assessment = await this.assessCustomerRisk(customer.id);
      if (assessment && assessment.riskLevel !== 'low') {
        assessments.push(assessment);
      }
    }

    // 按风险分数排序（高风险在前）
    return assessments.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * 获取风险统计
   */
  async getRiskStatistics(salesId?: string) {
    const assessments = await this.assessAllCustomers(salesId);

    const stats = {
      total: assessments.length,
      red: assessments.filter(a => a.riskLevel === 'red').length,
      orange: assessments.filter(a => a.riskLevel === 'orange').length,
      yellow: assessments.filter(a => a.riskLevel === 'yellow').length,
      totalAtRisk: assessments.filter(a => a.estimatedAmount).reduce((sum, a) => sum + (a.estimatedAmount || 0), 0),
    };

    return stats;
  }

  /**
   * 生成预警报告
   */
  async generateWarningReport(salesId?: string) {
    const assessments = await this.assessAllCustomers(salesId);
    const stats = await this.getRiskStatistics(salesId);

    // 按销售分组
    const bySales: Record<string, ChurnRiskAssessment[]> = {};
    assessments.forEach(a => {
      const salesName = a.salesName || '未知';
      if (!bySales[salesName]) {
        bySales[salesName] = [];
      }
      bySales[salesName].push(a);
    });

    return {
      generatedAt: new Date().toISOString(),
      statistics: stats,
      highRiskCustomers: assessments.slice(0, 10), // Top 10 最高风险
      bySales,
    };
  }

  /**
   * 创建预警处理记录
   */
  async createHandleRecord(record: Omit<ChurnWarningRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ChurnWarningRecord | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('churn_warning_records')
      .insert([{
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[ChurnWarning] Create handle record error:', error);
      return null;
    }

    // 如果处理成功或转化，更新客户状态
    if (record.handle_result === 'success' || record.handle_result === 'converted') {
      await supabase
        .from('customers')
        .update({
          status: record.handle_result === 'converted' ? 'converted' : 'normal',
          updated_at: new Date().toISOString(),
        })
        .eq('id', record.customer_id);
    }

    return data;
  }

  /**
   * 获取预警处理记录列表
   */
  async getHandleRecords(params: {
    customerId?: string;
    handlerId?: string;
    riskLevel?: string;
    handleResult?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ records: ChurnWarningRecord[]; total: number }> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('churn_warning_records')
      .select('*', { count: 'exact' });

    if (params.customerId) {
      query = query.eq('customer_id', params.customerId);
    }
    if (params.handlerId) {
      query = query.eq('handled_by', params.handlerId);
    }
    if (params.riskLevel) {
      query = query.eq('risk_level', params.riskLevel);
    }
    if (params.handleResult) {
      query = query.eq('handle_result', params.handleResult);
    }
    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);

    if (error) {
      console.error('[ChurnWarning] Get handle records error:', error);
      return { records: [], total: 0 };
    }

    return { records: data || [], total: count || 0 };
  }

  /**
   * 更新处理记录
   */
  async updateHandleRecord(recordId: string, updates: Partial<ChurnWarningRecord>): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('churn_warning_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) {
      console.error('[ChurnWarning] Update handle record error:', error);
      return false;
    }

    return true;
  }

  /**
   * 获取处理效果分析统计
   */
  async getHandleResultStats(params: {
    handlerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HandleResultStats> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('churn_warning_records')
      .select('*');

    if (params.handlerId) {
      query = query.eq('handled_by', params.handlerId);
    }
    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const { data: records, error } = await query;

    if (error || !records) {
      console.error('[ChurnWarning] Get stats error:', error);
      return this.getEmptyStats();
    }

    const totalWarnings = records.length;
    const handledRecords = records.filter(r => r.handle_result !== 'pending');
    const handledCount = handledRecords.length;
    const successCount = records.filter(r => r.handle_result === 'success').length;
    const convertedCount = records.filter(r => r.handle_result === 'converted').length;
    const failedCount = records.filter(r => r.handle_result === 'failed').length;
    const pendingCount = records.filter(r => r.handle_result === 'pending').length;

    // 成功率（包含成功和转化）
    const successRate = handledCount > 0 
      ? Math.round(((successCount + convertedCount) / handledCount) * 100) 
      : 0;
    
    // 转化率
    const conversionRate = handledCount > 0 
      ? Math.round((convertedCount / handledCount) * 100) 
      : 0;

    // 按处理方式统计
    const byActionType: Record<string, { count: number; successRate: number }> = {};
    const actionTypes = ['phone', 'visit', 'message', 'email', 'other'];
    actionTypes.forEach(action => {
      const actionRecords = records.filter(r => r.handle_action === action);
      const actionHandled = actionRecords.filter(r => r.handle_result !== 'pending');
      const actionSuccess = actionRecords.filter(r => r.handle_result === 'success' || r.handle_result === 'converted').length;
      byActionType[action] = {
        count: actionRecords.length,
        successRate: actionHandled.length > 0 ? Math.round((actionSuccess / actionHandled.length) * 100) : 0,
      };
    });

    // 按风险等级统计
    const byRiskLevel: Record<string, { count: number; successRate: number }> = {};
    const riskLevels = ['yellow', 'orange', 'red'];
    riskLevels.forEach(level => {
      const levelRecords = records.filter(r => r.risk_level === level);
      const levelHandled = levelRecords.filter(r => r.handle_result !== 'pending');
      const levelSuccess = levelRecords.filter(r => r.handle_result === 'success' || r.handle_result === 'converted').length;
      byRiskLevel[level] = {
        count: levelRecords.length,
        successRate: levelHandled.length > 0 ? Math.round((levelSuccess / levelHandled.length) * 100) : 0,
      };
    });

    // 月度趋势（最近6个月）
    const monthlyTrend: Array<{
      month: string;
      warnings: number;
      handled: number;
      success: number;
      converted: number;
    }> = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
      
      const monthRecords = records.filter(r => r.created_at?.startsWith(monthStr));
      monthlyTrend.push({
        month: monthStr,
        warnings: monthRecords.length,
        handled: monthRecords.filter(r => r.handle_result !== 'pending').length,
        success: monthRecords.filter(r => r.handle_result === 'success').length,
        converted: monthRecords.filter(r => r.handle_result === 'converted').length,
      });
    }

    return {
      totalWarnings,
      handledCount,
      successCount,
      convertedCount,
      failedCount,
      pendingCount,
      successRate,
      conversionRate,
      byActionType,
      byRiskLevel,
      monthlyTrend,
    };
  }

  /**
   * 获取个人处理排行榜
   */
  async getHandlerRanking(limit: number = 10): Promise<Array<{
    handlerId: string;
    handlerName: string;
    totalHandled: number;
    successCount: number;
    convertedCount: number;
    successRate: number;
  }>> {
    const supabase = getSupabaseClient();

    const { data: records, error } = await supabase
      .from('churn_warning_records')
      .select('handled_by, handler_name, handle_result');

    if (error || !records) {
      console.error('[ChurnWarning] Get ranking error:', error);
      return [];
    }

    // 按处理人分组统计
    const handlerMap: Record<string, {
      handlerId: string;
      handlerName: string;
      totalHandled: number;
      successCount: number;
      convertedCount: number;
    }> = {};

    records.forEach(record => {
      const key = record.handled_by;
      if (!handlerMap[key]) {
        handlerMap[key] = {
          handlerId: record.handled_by,
          handlerName: record.handler_name,
          totalHandled: 0,
          successCount: 0,
          convertedCount: 0,
        };
      }

      if (record.handle_result !== 'pending') {
        handlerMap[key].totalHandled++;
        if (record.handle_result === 'success') {
          handlerMap[key].successCount++;
        } else if (record.handle_result === 'converted') {
          handlerMap[key].convertedCount++;
        }
      }
    });

    // 转换为数组并计算成功率
    const rankings = Object.values(handlerMap).map(h => ({
      ...h,
      successRate: h.totalHandled > 0 
        ? Math.round(((h.successCount + h.convertedCount) / h.totalHandled) * 100)
        : 0,
    }));

    // 按处理数量排序
    return rankings
      .sort((a, b) => b.totalHandled - a.totalHandled)
      .slice(0, limit);
  }

  private getEmptyStats(): HandleResultStats {
    return {
      totalWarnings: 0,
      handledCount: 0,
      successCount: 0,
      convertedCount: 0,
      failedCount: 0,
      pendingCount: 0,
      successRate: 0,
      conversionRate: 0,
      byActionType: {},
      byRiskLevel: {},
      monthlyTrend: [],
    };
  }
}
