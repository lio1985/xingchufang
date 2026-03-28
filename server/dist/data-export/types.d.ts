export type ExportDataType = 'users' | 'lexicons' | 'logs' | 'customers' | 'recycles' | 'equipment_orders' | 'all';
export type ExportFormat = 'json' | 'csv';
export type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ExportScope = 'all' | 'team' | 'self';
export interface ExportConfig {
    dataType: ExportDataType;
    format: ExportFormat;
    scope?: ExportScope;
    teamId?: string;
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
