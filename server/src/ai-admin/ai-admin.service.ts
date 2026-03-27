import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

export interface AiModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  api_key?: string;
  api_endpoint?: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  input_cost_per_1k?: number;
  output_cost_per_1k?: number;
  capabilities: string[];
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  position?: string;
  responsibility?: string;
  model_id?: string;
  prompt_template: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  context_enabled: boolean;
  context_max_turns: number;
  allowed_roles: string[];
  daily_limit_per_user?: number;
  is_active: boolean;
  icon?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  model?: AiModel;
}

export interface AiUsageLog {
  id: string;
  user_id: string;
  team_id?: string;
  module_id: string;
  module_code?: string;
  model_id?: string;
  model_name?: string;
  input_messages?: any;
  input_token_count?: number;
  output_content?: string;
  output_token_count?: number;
  response_time_ms?: number;
  estimated_cost?: number;
  status: string;
  error_message?: string;
  user_rating?: number;
  user_feedback?: string;
  created_at: string;
}

export interface AiSettings {
  id: string;
  default_model_id?: string;
  response_style: string;
  response_tone: string;
  max_response_length: number;
  enable_content_filter: boolean;
  sensitive_words: string[];
  global_system_prompt?: string;
  prompt_enhancements?: any;
  monthly_budget?: number;
  alert_threshold?: number;
  enable_ai_chat: boolean;
  enable_ai_writing: boolean;
  enable_ai_analysis: boolean;
  updated_by?: string;
  updated_at: string;
}

@Injectable()
export class AiAdminService {
  private client = getSupabaseClient();

  // ==================== 模型管理 ====================

  /**
   * 获取所有AI模型
   */
  async getAllModels(): Promise<AiModel[]> {
    const { data, error } = await this.client
      .from('ai_models')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * 获取单个AI模型
   */
  async getModelById(id: string): Promise<AiModel | null> {
    const { data, error } = await this.client
      .from('ai_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  /**
   * 创建AI模型
   */
  async createModel(modelData: Partial<AiModel>): Promise<AiModel> {
    const { data, error } = await this.client
      .from('ai_models')
      .insert(modelData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * 更新AI模型
   */
  async updateModel(id: string, updates: Partial<AiModel>): Promise<AiModel> {
    const { data, error } = await this.client
      .from('ai_models')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * 删除AI模型
   */
  async deleteModel(id: string): Promise<void> {
    const { error } = await this.client
      .from('ai_models')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * 设置默认模型
   */
  async setDefaultModel(id: string): Promise<void> {
    // 先清除所有默认
    await this.client
      .from('ai_models')
      .update({ is_default: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // 设置新的默认
    const { error } = await this.client
      .from('ai_models')
      .update({ is_default: true })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // ==================== 功能模块管理 ====================

  /**
   * 获取所有AI功能模块
   */
  async getAllModules(): Promise<AiModule[]> {
    const { data, error } = await this.client
      .from('ai_modules')
      .select(`
        *,
        model:ai_models(*)
      `)
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * 获取单个AI功能模块
   */
  async getModuleById(id: string): Promise<AiModule | null> {
    const { data, error } = await this.client
      .from('ai_modules')
      .select(`
        *,
        model:ai_models(*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  /**
   * 创建AI功能模块
   */
  async createModule(moduleData: Partial<AiModule>): Promise<AiModule> {
    const { data, error } = await this.client
      .from('ai_modules')
      .insert(moduleData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * 更新AI功能模块
   */
  async updateModule(id: string, updates: Partial<AiModule>): Promise<AiModule> {
    const { data, error } = await this.client
      .from('ai_modules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * 删除AI功能模块
   */
  async deleteModule(id: string): Promise<void> {
    const { error } = await this.client
      .from('ai_modules')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * 切换模块状态
   */
  async toggleModule(id: string): Promise<AiModule> {
    const module = await this.getModuleById(id);
    if (!module) throw new Error('模块不存在');

    const { data, error } = await this.client
      .from('ai_modules')
      .update({ is_active: !module.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // ==================== 使用统计 ====================

  /**
   * 获取使用统计概览
   */
  async getUsageStats(startDate?: string, endDate?: string) {
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // 总调用次数
    const { count: totalCalls } = await this.client
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    // 成功调用次数
    const { count: successCalls } = await this.client
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success')
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    // 总Token消耗
    const { data: tokenData } = await this.client
      .from('ai_usage_logs')
      .select('input_token_count, output_token_count')
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    const totalInputTokens = tokenData?.reduce((sum, log) => sum + (log.input_token_count || 0), 0) || 0;
    const totalOutputTokens = tokenData?.reduce((sum, log) => sum + (log.output_token_count || 0), 0) || 0;

    // 总成本
    const { data: costData } = await this.client
      .from('ai_usage_logs')
      .select('estimated_cost')
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    const totalCost = costData?.reduce((sum, log) => sum + (log.estimated_cost || 0), 0) || 0;

    // 活跃用户数
    const { data: activeUsers } = await this.client
      .from('ai_usage_logs')
      .select('user_id')
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    const uniqueUsers = new Set(activeUsers?.map(log => log.user_id) || []).size;

    // 平均响应时间
    const { data: responseTimeData } = await this.client
      .from('ai_usage_logs')
      .select('response_time_ms')
      .not('response_time_ms', 'is', null)
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    const avgResponseTime = responseTimeData && responseTimeData.length > 0
      ? responseTimeData.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / responseTimeData.length
      : 0;

    return {
      totalCalls: totalCalls || 0,
      successCalls: successCalls || 0,
      successRate: totalCalls ? ((successCalls || 0) / totalCalls * 100).toFixed(1) : 0,
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      totalCost,
      activeUsers: uniqueUsers,
      avgResponseTime: Math.round(avgResponseTime),
    };
  }

  /**
   * 获取模块使用统计
   */
  async getModuleUsageStats(startDate?: string, endDate?: string) {
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const { data, error } = await this.client
      .from('ai_usage_logs')
      .select('module_id, module_code')
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    if (error) throw new Error(error.message);

    // 按模块聚合
    const moduleStats = new Map<string, number>();
    for (const log of data || []) {
      const key = log.module_code || log.module_id;
      moduleStats.set(key, (moduleStats.get(key) || 0) + 1);
    }

    // 获取模块详情
    const modules = await this.getAllModules();
    const result = modules.map(module => ({
      ...module,
      callCount: moduleStats.get(module.code) || moduleStats.get(module.id) || 0,
    }));

    // 按调用次数排序
    return result.sort((a, b) => b.callCount - a.callCount);
  }

  /**
   * 获取用户使用排行
   */
  async getUserUsageRanking(limit: number = 10, startDate?: string, endDate?: string) {
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const { data, error } = await this.client
      .from('ai_usage_logs')
      .select('user_id, estimated_cost, input_token_count, output_token_count')
      .gte('created_at', start)
      .lte('created_at', end + ' 23:59:59');

    if (error) throw new Error(error.message);

    // 按用户聚合
    const userStats = new Map<string, any>();
    for (const log of data || []) {
      if (!userStats.has(log.user_id)) {
        userStats.set(log.user_id, {
          userId: log.user_id,
          callCount: 0,
          totalCost: 0,
          totalTokens: 0,
        });
      }
      const stats = userStats.get(log.user_id);
      stats.callCount += 1;
      stats.totalCost += log.estimated_cost || 0;
      stats.totalTokens += (log.input_token_count || 0) + (log.output_token_count || 0);
    }

    // 获取用户信息
    const userIds = Array.from(userStats.keys()).slice(0, limit);
    const { data: users } = await this.client
      .from('users')
      .select('id, nickname, avatarUrl')
      .in('id', userIds);

    // 合并数据并排序
    const ranking = Array.from(userStats.values())
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, limit)
      .map((stats, index) => {
        const user = users?.find(u => u.id === stats.userId);
        return {
          rank: index + 1,
          ...stats,
          nickname: user?.nickname,
          avatarUrl: user?.avatarUrl,
        };
      });

    return ranking;
  }

  /**
   * 获取使用日志
   */
  async getUsageLogs(options: {
    userId?: string;
    moduleId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { userId, moduleId, status, limit = 50, offset = 0 } = options;

    let query = this.client
      .from('ai_usage_logs')
      .select(`
        *,
        user:users(id, nickname, avatarUrl),
        module:ai_modules(id, code, name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) query = query.eq('user_id', userId);
    if (moduleId) query = query.eq('module_id', moduleId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * 记录AI使用日志
   */
  async logUsage(logData: Partial<AiUsageLog>): Promise<AiUsageLog> {
    const { data, error } = await this.client
      .from('ai_usage_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // ==================== 全局设置 ====================

  /**
   * 获取全局设置
   */
  async getSettings(): Promise<AiSettings> {
    const { data, error } = await this.client
      .from('ai_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);

    // 如果不存在，创建默认设置
    if (!data) {
      const { data: newSettings, error: createError } = await this.client
        .from('ai_settings')
        .insert({
          response_style: 'professional',
          response_tone: 'neutral',
          max_response_length: 2000,
          enable_content_filter: true,
          sensitive_words: [],
          enable_ai_chat: true,
          enable_ai_writing: true,
          enable_ai_analysis: true,
        })
        .select()
        .single();

      if (createError) throw new Error(createError.message);
      return newSettings;
    }

    return data;
  }

  /**
   * 更新全局设置
   */
  async updateSettings(updates: Partial<AiSettings>, updatedBy?: string): Promise<AiSettings> {
    const currentSettings = await this.getSettings();

    const { data, error } = await this.client
      .from('ai_settings')
      .update({
        ...updates,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSettings.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // ==================== 仪表盘数据 ====================

  /**
   * 获取仪表盘概览数据
   */
  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 模型数量
    const { count: modelCount } = await this.client
      .from('ai_models')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 模块数量
    const { count: moduleCount } = await this.client
      .from('ai_modules')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 今日调用
    const { count: todayCalls } = await this.client
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // 本月成本
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const { data: monthCostData } = await this.client
      .from('ai_usage_logs')
      .select('estimated_cost')
      .gte('created_at', monthStart);

    const monthCost = monthCostData?.reduce((sum, log) => sum + (log.estimated_cost || 0), 0) || 0;

    // 获取使用统计
    const usageStats = await this.getUsageStats(weekAgo, today);

    return {
      modelCount: modelCount || 0,
      moduleCount: moduleCount || 0,
      todayCalls: todayCalls || 0,
      monthCost,
      ...usageStats,
    };
  }

  /**
   * 获取实时调用日志
   */
  async getRecentLogs(limit: number = 10) {
    const { data, error } = await this.client
      .from('ai_usage_logs')
      .select(`
        id,
        status,
        created_at,
        response_time_ms,
        input_token_count,
        output_token_count,
        user:users(id, nickname),
        module:ai_modules(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }
}
