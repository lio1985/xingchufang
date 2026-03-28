import { PermissionService } from '../permission/permission.service';
import { ExportConfig, ExportTask, ExportStats, ExportScopeOption } from './types';
export declare class DataExportService {
    private readonly permissionService;
    private client;
    private s3Storage;
    constructor(permissionService: PermissionService);
    getAvailableScopeOptions(userId: string): Promise<ExportScopeOption[]>;
    getAvailableTeams(userId: string): Promise<any[]>;
    private validateExportScope;
    private getUserIdsForScope;
    createExportTask(userId: string, config: ExportConfig): Promise<ExportTask>;
    private processExportTask;
    private exportUsers;
    private exportLexicons;
    private exportLogs;
    private exportCustomers;
    private exportRecycles;
    private exportEquipmentOrders;
    private exportAll;
    private convertToCSV;
    downloadExportFile(taskId: string, userId: string): Promise<{
        downloadUrl: string;
        fileName: string;
    }>;
    getExportTaskStatus(taskId: string, userId: string): Promise<ExportTask>;
    getExportHistory(userId: string, page?: number, pageSize?: number): Promise<ExportTask[]>;
    getExportStats(userId: string): Promise<ExportStats>;
    private mapTaskToExportTask;
}
