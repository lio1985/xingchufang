import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

/**
 * 审计日志操作类型
 */
export enum AuditAction {
  // 用户管理
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_DISABLE = 'user_disable',
  USER_ENABLE = 'user_enable',
  USER_ROLE_CHANGE = 'user_role_change',
  USER_APPROVE = 'user_approve',
  USER_REJECT = 'user_reject',

  // 登录相关
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',

  // 数据操作
  DATA_CREATE = 'data_create',
  DATA_UPDATE = 'data_update',
  DATA_DELETE = 'data_delete',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',

  // 权限操作
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  SHARE_CREATE = 'share_create',
  SHARE_DELETE = 'share_delete',

  // 系统操作
  SYSTEM_CONFIG_CHANGE = 'system_config_change',
  ADMIN_ACCESS = 'admin_access',
}

/**
 * 资源类型
 */
export enum ResourceType {
  USER = 'user',
  CUSTOMER = 'customer',
  RECYCLE_STORE = 'recycle_store',
  LEXICON = 'lexicon',
  QUICK_NOTE = 'quick_note',
  TEAM = 'team',
  SHARE = 'share',
  EQUIPMENT_ORDER = 'equipment_order',
  CONVERSATION = 'conversation',
  SYSTEM = 'system',
}

/**
 * 审计日志创建参数
 */
export interface CreateAuditLogParams {
  userId: string;
  action: AuditAction | string;
  resourceType?: ResourceType | string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed';
  errorMessage?: string;
}

/**
 * 审计日志查询参数
 */
export interface QueryAuditLogsParams {
  userId?: string;
  operation?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 审计日志服务
 */
@Injectable()
export class AuditService {
  /**
   * 记录审计日志
   */
  async log(params: CreateAuditLogParams): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('audit_logs').insert({
        user_id: params.userId,
        action: params.action,
        resource_type: params.resourceType || null,
        resource_id: params.resourceId || null,
        details: params.details || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
        status: params.status || 'success',
        error_message: params.errorMessage || null,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('记录审计日志失败:', error);
      }
    } catch (error) {
      console.error('记录审计日志异常:', error);
    }
  }

  /**
   * 批量记录审计日志
   */
  async logBatch(logs: CreateAuditLogParams[]): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('audit_logs').insert(
        logs.map((log) => ({
          user_id: log.userId,
          action: log.action,
          resource_type: log.resourceType || null,
          resource_id: log.resourceId || null,
          details: log.details || null,
          ip_address: log.ipAddress || null,
          user_agent: log.userAgent || null,
          status: log.status || 'success',
          error_message: log.errorMessage || null,
          created_at: new Date().toISOString(),
        })),
      );

      if (error) {
        console.error('批量记录审计日志失败:', error);
      }
    } catch (error) {
      console.error('批量记录审计日志异常:', error);
    }
  }

  /**
   * 查询审计日志（兼容旧接口）
   */
  async getLogs(params: QueryAuditLogsParams): Promise<{
    list: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.query(params);
  }

  /**
   * 查询审计日志
   */
  async query(params: QueryAuditLogsParams): Promise<{
    list: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const supabase = getSupabaseClient();
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    try {
      // 构建查询
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      // 添加过滤条件
      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }
      // 支持两种参数名
      const action = params.action || params.operation;
      if (action) {
        query = query.eq('action', action);
      }
      if (params.resourceType) {
        query = query.eq('resource_type', params.resourceType);
      }
      if (params.resourceId) {
        query = query.eq('resource_id', params.resourceId);
      }
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.startDate) {
        query = query.gte('created_at', params.startDate);
      }
      if (params.endDate) {
        query = query.lte('created_at', params.endDate);
      }

      // 分页
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        list: data || [],
        total: count || 0,
        page,
        pageSize,
      };
    } catch (error) {
      console.error('查询审计日志失败:', error);
      return {
        list: [],
        total: 0,
        page,
        pageSize,
      };
    }
  }

  /**
   * 获取用户的操作历史
   */
  async getUserLogs(
    userId: string,
    params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number },
  ): Promise<{
    list: any[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const result = await this.query({
      userId,
      startDate: params?.startDate,
      endDate: params?.endDate,
      page: params?.page,
      pageSize: params?.pageSize,
    });
    return result;
  }

  /**
   * 获取用户的操作历史（别名）
   */
  async getUserHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{
    list: any[];
    total: number;
  }> {
    const result = await this.query({ userId, page, pageSize });
    return {
      list: result.list,
      total: result.total,
    };
  }

  /**
   * 获取资源的操作历史
   */
  async getResourceHistory(
    resourceType: string,
    resourceId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{
    list: any[];
    total: number;
  }> {
    const result = await this.query({ resourceType, resourceId, page, pageSize });
    return {
      list: result.list,
      total: result.total,
    };
  }

  /**
   * 获取操作统计
   */
  async getStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalActions: number;
    actionCounts: Record<string, number>;
    userCounts: number;
    failedCounts: number;
  }> {
    const supabase = getSupabaseClient();
    const startDate = params?.startDate;
    const endDate = params?.endDate;

    try {
      let query = supabase.from('audit_logs').select('action, user_id, status');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const actionCounts: Record<string, number> = {};
      const users = new Set<string>();
      let failedCounts = 0;

      for (const log of data || []) {
        // 统计操作类型
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

        // 统计用户数
        users.add(log.user_id);

        // 统计失败数
        if (log.status === 'failed') {
          failedCounts++;
        }
      }

      return {
        totalActions: data?.length || 0,
        actionCounts,
        userCounts: users.size,
        failedCounts,
      };
    } catch (error) {
      console.error('获取审计统计失败:', error);
      return {
        totalActions: 0,
        actionCounts: {},
        userCounts: 0,
        failedCounts: 0,
      };
    }
  }

  /**
   * 删除单条日志
   */
  async deleteLogs(logId: string): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('删除审计日志失败:', error);
      throw error;
    }
  }

  /**
   * 按日期范围删除日志
   */
  async deleteLogsByDateRange(startDate: string, endDate: string): Promise<number> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .delete()
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .select('id');

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('批量删除审计日志失败:', error);
      throw error;
    }
  }

  /**
   * 清理过期的审计日志
   * @param daysToKeep 保留天数
   */
  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    const supabase = getSupabaseClient();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('清理审计日志失败:', error);
      return 0;
    }
  }
}
