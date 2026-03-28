import { DataExportService } from './data-export.service';
import { ExportConfig } from './types';
export declare class DataExportController {
    private readonly dataExportService;
    constructor(dataExportService: DataExportService);
    getScopeOptions(req: any): Promise<{
        code: number;
        msg: string;
        data: import("./types").ExportScopeOption[];
    }>;
    getAvailableTeams(req: any): Promise<{
        code: number;
        msg: string;
        data: any[];
    }>;
    createExportTask(req: any, body: ExportConfig): Promise<{
        code: number;
        msg: string;
        data: import("./types").ExportTask;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getExportTaskStatus(req: any, taskId: string): Promise<{
        code: number;
        msg: string;
        data: import("./types").ExportTask;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getExportHistory(req: any, page?: number, pageSize?: number): Promise<{
        code: number;
        msg: string;
        data: import("./types").ExportTask[];
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getExportStats(req: any): Promise<{
        code: number;
        msg: string;
        data: import("./types").ExportStats;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    downloadExportFile(req: any, taskId: string): Promise<{
        code: number;
        msg: string;
        data: {
            downloadUrl: string;
            fileName: string;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
}
