/**
 * 数据导出相关类型定义
 */

export type ExportDataType = 'users' | 'lexicons' | 'logs' | 'all';

export type ExportFormat = 'json' | 'csv';

export type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportConfig {
  dataType: ExportDataType;
  format: ExportFormat;
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
  status: ExportTaskStatus;
  downloadUrl: string | null;
  fileName: string;
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
