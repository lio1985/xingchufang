/**
 * 数据导出相关类型定义
 */

export type ExportDataType = 'users' | 'lexicons' | 'logs' | 'customers' | 'recycles' | 'equipment_orders' | 'all';

export type ExportFormat = 'json' | 'csv';

export type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 导出范围
 * - all: 所有数据（仅管理员）
 * - team: 团队数据（管理员、团队队长）
 * - self: 个人数据（所有角色）
 */
export type ExportScope = 'all' | 'team' | 'self';

export interface ExportConfig {
  dataType: ExportDataType;
  format: ExportFormat;
  scope?: ExportScope; // 导出范围，默认为 self
  teamId?: string; // 指定团队ID（仅管理员可用）
  timeRange?: {
    startDate: string;
    endDate: string;
  };
  includeShared?: boolean;
}

export interface ExportTask {
  id: string;
  dataType: ExportDataType;
  format: ExportFormat;
  scope: ExportScope;
  fileName: string;
  status: ExportTaskStatus;
  downloadUrl: string | null;
  fileSize: number;
  recordCount: number;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
  createdBy: string;
}

export interface ExportStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  totalExportSize: number;
}

export interface ExportScopeOption {
  value: ExportScope;
  label: string;
  description: string;
  allowedRoles: string[];
}
