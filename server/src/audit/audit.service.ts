import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

export interface OperationLog {
  id: string;
  userId: string;
  operation: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export interface LogOptions {
  userId: string;
  operation: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed';
  errorMessage?: string;
}

export interface OperationStatistics {
  totalOperations: number;
  successOperations: number;
  failedOperations: number;
  operationsByType: Record<string, number>;
  operationsByResource: Record<string, number>;
  operationsByUser: Record<string, number>;
  todayOperations: number;
}

@Injectable()
export class AuditService {
  private client = getSupabaseClient();

  /**
   * 记录操作日志
   */
  async log(options: LogOptions): Promise<OperationLog> {
    const {
      userId,
      operation,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
      status = 'success',
      errorMessage,
    } = options;

    const { data, error } = await this.client
      .from('operation_logs')
      .insert({
        userId,
        operation,
        resourceType,
        resourceId,
        details: details as any,
        ipAddress,
        userAgent,
        status,
        errorMessage,
      })
      .select()
      .single();

    if (error) {
      console.error('记录操作日志失败:', error);
      throw new Error('记录操作日志失败');
    }

    return data;
  }

  /**
   * 查询操作日志
   */
  async getLogs(options: {
    userId?: string;
    operation?: string;
    resourceType?: string;
    resourceId?: string;
    status?: 'success' | 'failed';
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ logs: OperationLog[]; total: number }> {
    const {
      userId,
      operation,
      resourceType,
      resourceId,
      status,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
    } = options;

    let query = this.client
      .from('operation_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (userId && userId.trim() !== '') {
      query = query.eq('user_id', userId);
    }

    if (operation) {
      query = query.eq('operation', operation);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('查询操作日志失败:', error);
      throw new Error('查询操作日志失败');
    }

    return {
      logs: (data || []).map(log => ({
        id: log.id,
        userId: log.user_id,
        operation: log.operation,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        details: log.details,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        status: log.status,
        errorMessage: log.error_message,
        createdAt: log.created_at,
      })),
      total: count || 0,
    };
  }

  /**
   * 获取用户操作记录
   */
  async getUserLogs(
    userId: string,
    options: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
    } = {},
  ): Promise<{ logs: OperationLog[]; total: number }> {
    return this.getLogs({
      userId,
      ...options,
    });
  }

  /**
   * 获取操作统计
   */
  async getStatistics(options: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<OperationStatistics> {
    const { startDate, endDate } = options;

    const today = new Date().toISOString().split('T')[0];
    const todayStart = `${today}T00:00:00Z`;
    const todayEnd = `${today}T23:59:59Z`;

    // 获取总操作数
    let query = this.client.from('operation_logs').select('*', { count: 'exact', head: true });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { count: totalOperations } = await query;

    // 获取成功操作数
    let successQuery = this.client
      .from('operation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success');

    if (startDate) {
      successQuery = successQuery.gte('created_at', startDate);
    }

    if (endDate) {
      successQuery = successQuery.lte('created_at', endDate);
    }

    const { count: successOperations } = await successQuery;

    // 获取今日操作数
    const { count: todayOperations } = await this.client
      .from('operation_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

    // 获取操作类型统计
    let typeQuery = this.client.from('operation_logs').select('operation');

    if (startDate) {
      typeQuery = typeQuery.gte('created_at', startDate);
    }

    if (endDate) {
      typeQuery = typeQuery.lte('created_at', endDate);
    }

    const { data: typeData } = await typeQuery;

    const operationsByType: Record<string, number> = {};
    typeData?.forEach((log) => {
      operationsByType[log.operation] = (operationsByType[log.operation] || 0) + 1;
    });

    // 获取资源类型统计
    let resourceQuery = this.client.from('operation_logs').select('resource_type').not('resource_type', 'is', null);

    if (startDate) {
      resourceQuery = resourceQuery.gte('created_at', startDate);
    }

    if (endDate) {
      resourceQuery = resourceQuery.lte('created_at', endDate);
    }

    const { data: resourceData } = await resourceQuery;

    const operationsByResource: Record<string, number> = {};
    resourceData?.forEach((log) => {
      if (log.resource_type) {
        operationsByResource[log.resource_type] = (operationsByResource[log.resource_type] || 0) + 1;
      }
    });

    // 获取用户操作统计
    let userQuery = this.client.from('operation_logs').select('user_id');

    if (startDate) {
      userQuery = userQuery.gte('created_at', startDate);
    }

    if (endDate) {
      userQuery = userQuery.lte('created_at', endDate);
    }

    const { data: userData } = await userQuery;

    const operationsByUser: Record<string, number> = {};
    userData?.forEach((log) => {
      operationsByUser[log.user_id] = (operationsByUser[log.user_id] || 0) + 1;
    });

    return {
      totalOperations: totalOperations || 0,
      successOperations: successOperations || 0,
      failedOperations: (totalOperations || 0) - (successOperations || 0),
      operationsByType,
      operationsByResource,
      operationsByUser,
      todayOperations: todayOperations || 0,
    };
  }

  /**
   * 获取资源操作历史
   */
  async getResourceHistory(resourceType: string, resourceId: string): Promise<OperationLog[]> {
    const { data, error } = await this.client
      .from('operation_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取资源操作历史失败:', error);
      throw new Error('获取资源操作历史失败');
    }

    return (data || []).map(log => ({
      id: log.id,
      userId: log.user_id,
      operation: log.operation,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      details: log.details,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      status: log.status,
      errorMessage: log.error_message,
      createdAt: log.created_at,
    }));
  }

  /**
   * 删除操作日志（仅管理员）
   */
  async deleteLogs(logId: string): Promise<void> {
    const { error } = await this.client
      .from('operation_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error('删除操作日志失败:', error);
      throw new Error('删除操作日志失败');
    }
  }

  /**
   * 批量删除操作日志（仅管理员）
   */
  async deleteLogsByDateRange(startDate: string, endDate: string): Promise<number> {
    // 先查询符合条件的记录数量
    const { count } = await this.client
      .from('operation_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // 执行删除
    const { error } = await this.client
      .from('operation_logs')
      .delete()
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      console.error('批量删除操作日志失败:', error);
      throw new Error('批量删除操作日志失败');
    }

    return count || 0;
  }
}
