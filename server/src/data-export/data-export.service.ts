import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { UserService } from '../user/user.service';
import {
  ExportConfig,
  ExportTask,
  ExportTaskStatus,
  ExportDataType,
  ExportFormat,
  ExportStats,
} from './types';

@Injectable()
export class DataExportService {
  private client = getSupabaseClient();
  private s3Storage: S3Storage;

  constructor(private readonly userService: UserService) {
    // 初始化 S3Storage
    this.s3Storage = new S3Storage({
      bucketName: process.env.COZE_BUCKET_NAME || '',
      region: 'cn-beijing',
    });
  }

  /**
   * 创建导出任务
   */
  async createExportTask(
    adminId: string,
    config: ExportConfig
  ): Promise<ExportTask> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(adminId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    // 创建任务记录
    const taskId = uuidv4();
    const fileName = `export_${config.dataType}_${new Date().toISOString().split('T')[0]}.${config.format}`;

    const { data: task, error } = await this.client
      .from('export_tasks')
      .insert({
        id: taskId,
        data_type: config.dataType,
        format: config.format,
        status: 'pending',
        file_name: fileName,
        created_by: adminId,
      })
      .select()
      .single();

    if (error) {
      throw new Error('创建导出任务失败');
    }

    // 异步处理导出
    this.processExportTask(taskId, config, fileName).catch((err) => {
      console.error('处理导出任务失败:', err);
    });

    return this.mapTaskToExportTask(task);
  }

  /**
   * 处理导出任务
   */
  private async processExportTask(taskId: string, config: ExportConfig, fileName: string) {
    let fileKey: string | null = null;

    try {
      // 更新状态为处理中
      await this.client
        .from('export_tasks')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', taskId);

      // 根据数据类型导出数据
      let data: any[];
      let recordCount = 0;

      switch (config.dataType) {
        case 'users':
          data = await this.exportUsers(config);
          break;
        case 'lexicons':
          data = await this.exportLexicons(config);
          break;
        case 'logs':
          data = await this.exportLogs(config);
          break;
        case 'all':
          data = await this.exportAll(config);
          break;
        default:
          throw new Error('不支持的数据类型');
      }

      recordCount = data.length;

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
        expireTime: 3600, // 1小时
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
   * 下载导出文件
   */
  async downloadExportFile(taskId: string, adminId: string): Promise<{ downloadUrl: string; fileName: string }> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(adminId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    // 获取任务信息
    const { data: task, error } = await this.client
      .from('export_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      throw new NotFoundException('导出任务不存在');
    }

    // 验证任务状态
    if (task.status !== 'completed') {
      throw new ForbiddenException('导出任务尚未完成');
    }

    // 重新生成预签名 URL（确保链接未过期）
    let downloadUrl = task.download_url;
    if (task.file_key) {
      downloadUrl = await this.s3Storage.generatePresignedUrl({
        key: task.file_key,
        expireTime: 3600, // 1小时
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
   * 导出用户数据
   */
  private async exportUsers(config: ExportConfig): Promise<any[]> {
    let query = this.client
      .from('users')
      .select('id, openid, nickname, avatar_url, role, status, created_at, last_login_at');

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
  private async exportLexicons(config: ExportConfig): Promise<any[]> {
    let query = this.client
      .from('lexicons')
      .select('id, title, content, category, type, user_id, created_at, is_shared, share_scope, shared_at');

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
  private async exportLogs(config: ExportConfig): Promise<any[]> {
    let query = this.client
      .from('operation_logs')
      .select('id, user_id, action, resource_type, resource_id, created_at');

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
   * 导出所有数据
   */
  private async exportAll(config: ExportConfig): Promise<any[]> {
    const users = await this.exportUsers(config);
    const lexicons = await this.exportLexicons(config);
    const logs = await this.exportLogs(config);

    return {
      users,
      lexicons,
      logs,
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

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          return String(value).replace(/"/g, '""');
        })
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 获取导出任务状态
   */
  async getExportTaskStatus(taskId: string, adminId: string): Promise<ExportTask> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(adminId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const { data: task, error } = await this.client
      .from('export_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      throw new NotFoundException('导出任务不存在');
    }

    return this.mapTaskToExportTask(task);
  }

  /**
   * 获取导出历史
   */
  async getExportHistory(adminId: string, page?: number, pageSize?: number): Promise<ExportTask[]> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(adminId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const currentPage = page || 1;
    const currentPageSize = pageSize || 20;
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;

    const { data, error } = await this.client
      .from('export_tasks')
      .select('*')
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
  async getExportStats(adminId: string): Promise<ExportStats> {
    // 验证管理员权限
    const isAdmin = await this.userService.isAdmin(adminId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    const { data: tasks, error } = await this.client
      .from('export_tasks')
      .select('status, file_size');

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
      status: task.status,
      downloadUrl: task.download_url,
      fileName: task.file_name,
      fileSize: task.file_size || 0,
      recordCount: task.record_count || 0,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      error: task.error,
      createdBy: task.created_by,
    };
  }
}
