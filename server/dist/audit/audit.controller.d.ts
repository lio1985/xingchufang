import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLogs(req: any, userId?: string, operation?: string, resourceType?: string, resourceId?: string, status?: string, startDate?: string, endDate?: string, page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getMyLogs(req: any, startDate?: string, endDate?: string, page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getStatistics(startDate?: string, endDate?: string): Promise<{
        code: number;
        msg: string;
        data: {
            totalActions: number;
            actionCounts: Record<string, number>;
            userCounts: number;
            failedCounts: number;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getUserLogs(userId: string, startDate?: string, endDate?: string, page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getResourceHistory(resourceType: string, resourceId: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            total: number;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    deleteLog(logId: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    deleteLogsByDateRange(startDate: string, endDate: string): Promise<{
        code: number;
        msg: string;
        data: {
            count: number;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
}
