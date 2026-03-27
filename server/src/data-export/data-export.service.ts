import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { PermissionService } from '../permission/permission.service';
import { UserRole } from '../permission/permission.constants';
import {
  ExportConfig,
  ExportTask,
  ExportTaskStatus,
  ExportStats,
  ExportScopeOption,
  ExportScope,
} from './types';

@Injectable()
export class DataExportService {
  private client = getSupabaseClient();
  private s3Storage: S3Storage;

  constructor(private readonly permissionService: PermissionService) {
    // 初始化 S3Storage
    this.s3Storage = new S3Storage({
      bucketName: process.env.COZE_BUCKET_NAME || '',
      region: 'cn-beijing',
    });
  }

  /**
   * 获取用户可用的导出范围选项
   */
  async getAvailableScopeOptions(userId: string): Promise<ExportScopeOption[]> {
    const context = await this.permissionService.getUserContext(userId);
    if (!context) {
      throw new ForbiddenException('用户不存在');
    }

    const options: ExportScopeOption[] = [];

    // 所有角色都可以导出自己的数据
    options.push({
      value: 'self',
      label: '个人数据',
      description: '仅导出您自己创建的数据',
      allowedRoles: ['employee', 'team_leader', 'admin'],
    });

    // 团队队长和管理员可以导出团队数据
    if (context.role === UserRole.TEAM_LEADER || context.role === UserRole.ADMIN) {
      options.push({
        value: 'team',
        label: '团队数据',
        description: '导出您及团队成员的数据',
        allowedRoles: ['team_leader', 'admin'],
      });
    }

    // 管理员可以导出所有数据
    if (context.role === UserRole.ADMIN) {
      options.push({
        value: 'all',
        label: '全部数据',
        description: '导出系统中的所有数据',
        allowedRoles: ['admin'],
      });
    }

    return options;
  }

  /**
   * 获取用户可访问的团队列表
   */
  async getAvailableTeams(userId: string): Promise<any[]> {
    const context = await this.permissionService.getUserContext(userId);
    if (!context) {
      throw new ForbiddenException('用户不存在');
    }

    // 管理员可以看到所有团队
    if (context.role === UserRole.ADMIN) {
      const { data: teams, error } = await this.client
        .from('teams')
        .select('id, name, leader_id')
        .eq('is_deleted', false);

      if (error) {
        console.error('[DataExport] 获取团队列表失败:', error);
        return [];
      }

      // 获取每个团队成员数量
      const teamsWithCount = await Promise.all(
        (teams || []).map(async (team) => {
          const { count } = await this.client
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);

          return {
            ...team,
            memberCount: count || 0,
          };
        })
      );

      return teamsWithCount;
    }

    // 团队队长只能看到自己负责的团队
    if (context.role === UserRole.TEAM_LEADER) {
      const { data: teams, error } = await this.client
        .from('teams')
        .select('id, name, leader_id')
        .eq('leader_id', userId)
        .eq('is_deleted', false);

      if (error) {
        console.error('[DataExport] 获取团队列表失败:', error);
        return [];
      }

      // 获取每个团队成员数量
      const teamsWithCount = await Promise.all(
        (teams || []).map(async (team) => {
          const { count } = await this.client
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);

          return {
            ...team,
            memberCount: count || 0,
          };
        })
      );

      return teamsWithCount;
    }

    // 员工不能导出团队数据
    return [];
  }

  /**
   * 验证导出权限
   */
  private async validateExportScope(userId: string, scope: ExportScope, teamId?: string): Promise<void> {
    const context = await this.permissionService.getUserContext(userId);
    if (!context) {
      throw new ForbiddenException('用户不存在');
    }

    // 验证导出范围权限
    if (scope === 'all' && context.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以导出全部数据');
    }

    if (scope === 'team') {
      if (context.role !== UserRole.ADMIN && context.role !== UserRole.TEAM_LEADER) {
        throw new ForbiddenException('只有团队队长或管理员可以导出团队数据');
      }

      // 团队队长只能导出自己团队的数据
      if (context.role === UserRole.TEAM_LEADER && teamId) {
        const { data: team } = await this.client
          .from('teams')
          .select('leader_id')
          .eq('id', teamId)
          .single();

        if (!team || team.leader_id !== userId) {
          throw new ForbiddenException('您只能导出自己负责的团队数据');
        }
      }
    }
  }

  /**
   * 获取数据查询的用户ID列表
   */
  private async getUserIdsForScope(userId: string, scope: ExportScope, teamId?: string): Promise<string[]> {
    if (scope === 'self') {
      return [userId];
    }

    if (scope === 'team') {
      // 获取团队成员ID列表
      let queryTeamId = teamId;

      if (!queryTeamId) {
        // 如果没有指定团队，获取用户负责的团队（团队队长）
        const { data: team } = await this.client
          .from('teams')
          .select('id')
          .eq('leader_id', userId)
          .eq('is_deleted', false)
          .single();

        if (team) {
          queryTeamId = team.id;
        } else {
          // 检查用户是否是团队成员
          const { data: membership } = await this.client
            .from('team_members')
            .select('team_id')
            .eq('user_id', userId)
            .single();

          if (membership) {
            queryTeamId = membership.team_id;
          }
        }
      }

      if (!queryTeamId) {
        return [userId];
      }

      // 获取团队成员
      const { data: members } = await this.client
        .from('team_members')
        .select('user_id')
        .eq('team_id', queryTeamId);

      // 同时包括团队队长
      const { data: team } = await this.client
        .from('teams')
        .select('leader_id')
        .eq('id', queryTeamId)
        .single();

      const userIds = new Set<string>();
      (members || []).forEach((m) => userIds.add(m.user_id));
      if (team?.leader_id) {
        userIds.add(team.leader_id);
      }

      return Array.from(userIds);
    }

    // all - 返回空数组表示不限制
    return [];
  }

  /**
   * 创建导出任务
   */
  async createExportTask(
    userId: string,
    config: ExportConfig
  ): Promise<ExportTask> {
    const scope = config.scope || 'self';

    // 验证权限
    await this.validateExportScope(userId, scope, config.teamId);

    // 创建任务记录
    const taskId = uuidv4();
    const fileName = `export_${config.dataType}_${new Date().toISOString().split('T')[0]}.${config.format}`;

    const { data: task, error } = await this.client
      .from('export_tasks')
      .insert({
        id: taskId,
        data_type: config.dataType,
        format: config.format,
        scope: scope,
        team_id: config.teamId,
        status: 'pending',
        file_name: fileName,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error('创建导出任务失败');
    }

    // 异步处理导出
    this.processExportTask(taskId, config, userId, fileName).catch((err) => {
      console.error('处理导出任务失败:', err);
    });

    return this.mapTaskToExportTask(task);
  }

  /**
   * 处理导出任务
   */
  private async processExportTask(
    taskId: string,
    config: ExportConfig,
    userId: string,
    fileName: string
  ) {
    let fileKey: string | null = null;

    try {
      // 更新状态为处理中
      await this.client
        .from('export_tasks')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', taskId);

      const scope = config.scope || 'self';
      const userIds = await this.getUserIdsForScope(userId, scope, config.teamId);

      // 根据数据类型导出数据
      let data: any[];
      let recordCount = 0;

      switch (config.dataType) {
        case 'users':
          data = await this.exportUsers(config, userIds);
          break;
        case 'lexicons':
          data = await this.exportLexicons(config, userIds);
          break;
        case 'logs':
          data = await this.exportLogs(config, userIds);
          break;
        case 'customers':
          data = await this.exportCustomers(config, userIds);
          break;
        case 'recycles':
          data = await this.exportRecycles(config, userIds);
          break;
        case 'equipment_orders':
          data = await this.exportEquipmentOrders(config, userIds);
          break;
        case 'all':
          data = await this.exportAll(config, userIds);
          break;
        default:
          throw new Error('不支持的数据类型');
      }

      recordCount = Array.isArray(data) ? data.length : 1;

      // 生成文件内容
      let content: string;
      let contentType: string;
      if (config.format === 'json') {
        content = JSON.stringify(data, null, 2);
        contentType = 'application/json';
      } else {
        content = this.convertToCSV(data);
        contentType = 'text/csv';
      }

      const fileBuffer = Buffer.from(content, 'utf8');

      // 上传到 S3
      fileKey = await this.s3Storage.uploadFile({
        fileContent: fileBuffer,
        fileName: `exports/${fileName}`,
        contentType: contentType,
      });

      // 生成预签名 URL（1小时有效期）
      const downloadUrl = await this.s3Storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 3600,
      });

      const fileSize = fileBuffer.length;

      // 更新任务为完成
      await this.client
        .from('export_tasks')
        .update({
          status: 'completed',
          download_url: downloadUrl,
          file_key: fileKey,
          file_size: fileSize,
          record_count: recordCount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

    } catch (error: any) {
      console.error('导出任务处理失败:', error);
      // 更新任务为失败
      await this.client
        .from('export_tasks')
        .update({
          status: 'failed',
          error: error.message || '导出失败',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);
    }
  }

  /**
   * 导出用户数据
   */
  private async exportUsers(config: ExportConfig, userIds: string[]): Promise<any[]> {
    let query = this.client
      .from('users')
      .select('id, openid, nickname, avatar_url, role, status, created_at, last_login_at');

    // 权限过滤
    if (userIds.length > 0) {
      query = query.in('id', userIds);
    }

    if (config.timeRange) {
      query = query
        .gte('created_at', config.timeRange.startDate)
        .lte('created_at', config.timeRange.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('导出用户数据失败');
    }

    return data || [];
  }

  /**
   * 导出语料库数据
   */
  private async exportLexicons(config: ExportConfig, userIds: string[]): Promise<any[]> {
    let query = this.client
      .from('lexicons')
      .select('id, title, content, category, type, user_id, created_at, is_shared, share_scope, shared_at');

    // 权限过滤
    if (userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    if (config.timeRange) {
      query = query
        .gte('created_at', config.timeRange.startDate)
        .lte('created_at', config.timeRange.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('导出语料库数据失败');
    }

    return data || [];
  }

  /**
   * 导出操作日志
   */
  private async exportLogs(config: ExportConfig, userIds: string[]): Promise<any[]> {
    let query = this.client
      .from('operation_logs')
      .select('id, user_id, action, resource_type, resource_id, created_at');

    // 权限过滤
    if (userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    if (config.timeRange) {
      query = query
        .gte('created_at', config.timeRange.startDate)
        .lte('created_at', config.timeRange.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('导出操作日志失败');
    }

    return data || [];
  }

  /**
   * 导出客户数据
   */
  private async exportCustomers(config: ExportConfig, userIds: string[]): Promise<any[]> {
    let query = this.client
      .from('customers')
      .select('id, name, phone, wechat, address, status, user_id, created_at, updated_at');

    // 权限过滤
    if (userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    if (config.timeRange) {
      query = query
        .gte('created_at', config.timeRange.startDate)
        .lte('created_at', config.timeRange.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('导出客户数据失败');
    }

    return data || [];
  }

  /**
   * 导出回收门店数据
   */
  private async exportRecycles(config: ExportConfig, userIds: string[]): Promise<any[]> {
    let query = this.client
      .from('recycle_stores')
      .select('id, store_name, phone, wechat, address, recycle_status, user_id, created_at')
      .eq('is_deleted', false);

    // 权限过滤
    if (userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    if (config.timeRange) {
      query = query
        .gte('created_at', config.timeRange.startDate)
        .lte('created_at', config.timeRange.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('导出回收门店数据失败');
    }

    return data || [];
  }

  /**
   * 导出获客订单数据
   */
  private async exportEquipmentOrders(config: ExportConfig, userIds: string[]): Promise<any[]> {
    let query = this.client
      .from('equipment_orders')
      .select('id, order_no, title, customer_name, status, accepted_by, created_at');

    // 权限过滤：根据用户ID列表
    if (userIds.length > 0) {
      query = query.or(`created_by.in.(${userIds.join(',')}),accepted_by.in.(${userIds.join(',')})`);
    }

    if (config.timeRange) {
      query = query
        .gte('created_at', config.timeRange.startDate)
        .lte('created_at', config.timeRange.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('导出获客订单数据失败');
    }

    return data || [];
  }

  /**
   * 导出所有数据
   */
  private async exportAll(config: ExportConfig, userIds: string[]): Promise<any[]> {
    const users = await this.exportUsers(config, userIds);
    const lexicons = await this.exportLexicons(config, userIds);
    const logs = await this.exportLogs(config, userIds);
    const customers = await this.exportCustomers(config, userIds);
    const recycles = await this.exportRecycles(config, userIds);
    const equipmentOrders = await this.exportEquipmentOrders(config, userIds);

    return {
      users,
      lexicons,
      logs,
      customers,
      recycles,
      equipmentOrders,
      exportTime: new Date().toISOString(),
    } as any;
  }

  /**
   * 转换为 CSV 格式
   */
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    // 处理嵌套对象
    const flattenData = data.map((row) => {
      const flat: any = {};
      for (const key of Object.keys(row)) {
        const value = row[key];
        if (value === null || value === undefined) {
          flat[key] = '';
        } else if (typeof value === 'object') {
          flat[key] = JSON.stringify(value);
        } else {
          flat[key] = value;
        }
      }
      return flat;
    });

    const headers = Object.keys(flattenData[0]);
    const rows = flattenData.map((row) =>
      headers
        .map((header) => {
          let value = row[header];
          return String(value).replace(/"/g, '""');
        })
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 下载导出文件
   */
  async downloadExportFile(taskId: string, userId: string): Promise<{ downloadUrl: string; fileName: string }> {
    // 获取任务信息
    const { data: task, error } = await this.client
      .from('export_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      throw new NotFoundException('导出任务不存在');
    }

    // 验证权限：只有创建者才能下载
    if (task.created_by !== userId) {
      const isAdmin = await this.permissionService.isAdmin(userId);
      if (!isAdmin) {
        throw new ForbiddenException('无权下载此文件');
      }
    }

    // 验证任务状态
    if (task.status !== 'completed') {
      throw new ForbiddenException('导出任务尚未完成');
    }

    // 重新生成预签名 URL
    let downloadUrl = task.download_url;
    if (task.file_key) {
      downloadUrl = await this.s3Storage.generatePresignedUrl({
        key: task.file_key,
        expireTime: 3600,
      });

      // 更新数据库中的 URL
      await this.client
        .from('export_tasks')
        .update({ download_url: downloadUrl })
        .eq('id', taskId);
    }

    return {
      downloadUrl: downloadUrl,
      fileName: task.file_name,
    };
  }

  /**
   * 获取导出任务状态
   */
  async getExportTaskStatus(taskId: string, userId: string): Promise<ExportTask> {
    const { data: task, error } = await this.client
      .from('export_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      throw new NotFoundException('导出任务不存在');
    }

    // 验证权限
    if (task.created_by !== userId) {
      const isAdmin = await this.permissionService.isAdmin(userId);
      if (!isAdmin) {
        throw new ForbiddenException('无权查看此任务');
      }
    }

    return this.mapTaskToExportTask(task);
  }

  /**
   * 获取导出历史
   */
  async getExportHistory(userId: string, page?: number, pageSize?: number): Promise<ExportTask[]> {
    const isAdmin = await this.permissionService.isAdmin(userId);

    const currentPage = page || 1;
    const currentPageSize = pageSize || 20;
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;

    let query = this.client
      .from('export_tasks')
      .select('*');

    // 非管理员只能看自己的导出历史
    if (!isAdmin) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error('获取导出历史失败');
    }

    return (data || []).map((task) => this.mapTaskToExportTask(task));
  }

  /**
   * 获取导出统计
   */
  async getExportStats(userId: string): Promise<ExportStats> {
    const isAdmin = await this.permissionService.isAdmin(userId);

    let query = this.client
      .from('export_tasks')
      .select('status, file_size');

    // 非管理员只能看自己的统计
    if (!isAdmin) {
      query = query.eq('created_by', userId);
    }

    const { data: tasks, error } = await query;

    if (error) {
      throw new Error('获取导出统计失败');
    }

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t) => t.status === 'completed').length || 0;
    const pendingTasks = tasks?.filter((t) => t.status === 'pending').length || 0;
    const failedTasks = tasks?.filter((t) => t.status === 'failed').length || 0;
    const totalExportSize =
      tasks?.reduce((sum, t) => sum + (t.file_size || 0), 0) || 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      failedTasks,
      totalExportSize,
    };
  }

  /**
   * 映射数据库任务到导出任务
   */
  private mapTaskToExportTask(task: any): ExportTask {
    return {
      id: task.id,
      dataType: task.data_type,
      format: task.format,
      scope: task.scope || 'self',
      fileName: task.file_name,
      status: task.status,
      downloadUrl: task.download_url,
      fileSize: task.file_size || 0,
      recordCount: task.record_count || 0,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      error: task.error,
      createdBy: task.created_by,
    };
  }
}
