import { ChurnWarningService, ChurnRiskConfig, ChurnWarningRecord } from './churn-warning.service';
import { Request } from 'express';
export declare class ChurnWarningController {
    private readonly churnWarningService;
    constructor(churnWarningService: ChurnWarningService);
    getRiskList(salesId?: string, riskLevel?: string): Promise<{
        code: number;
        msg: string;
        data: import("./churn-warning.service").ChurnRiskAssessment[];
    } | {
        code: number;
        msg: any;
        data: never[];
    }>;
    getRiskStatistics(salesId?: string): Promise<{
        code: number;
        msg: string;
        data: {
            total: number;
            red: number;
            orange: number;
            yellow: number;
            totalAtRisk: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getCustomerAssessment(customerId: string): Promise<{
        code: number;
        msg: string;
        data: import("./churn-warning.service").ChurnRiskAssessment | null;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    generateReport(salesId?: string): Promise<{
        code: number;
        msg: string;
        data: {
            generatedAt: string;
            statistics: {
                total: number;
                red: number;
                orange: number;
                yellow: number;
                totalAtRisk: number;
            };
            highRiskCustomers: import("./churn-warning.service").ChurnRiskAssessment[];
            bySales: Record<string, import("./churn-warning.service").ChurnRiskAssessment[]>;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    updateConfig(config: Partial<ChurnRiskConfig>): Promise<{
        code: number;
        msg: string;
        data: ChurnRiskConfig;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getConfig(): Promise<{
        code: number;
        msg: string;
        data: ChurnRiskConfig;
    }>;
    createHandleRecord(body: {
        customer_id: string;
        customer_name: string;
        risk_level: 'yellow' | 'orange' | 'red';
        risk_score: number;
        handle_action: 'phone' | 'visit' | 'message' | 'email' | 'other';
        handle_result: 'success' | 'pending' | 'failed' | 'converted';
        handle_notes?: string;
        follow_up_date?: string;
    }, req: Request): Promise<{
        code: number;
        msg: string;
        data: ChurnWarningRecord | null;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getHandleRecords(customerId?: string, handlerId?: string, riskLevel?: string, handleResult?: string, startDate?: string, endDate?: string, limit?: string, offset?: string): Promise<{
        code: number;
        msg: string;
        data: {
            records: ChurnWarningRecord[];
            total: number;
        };
    } | {
        code: number;
        msg: any;
        data: {
            records: never[];
            total: number;
        };
    }>;
    updateHandleRecord(recordId: string, updates: Partial<ChurnWarningRecord>): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    getHandleResultStats(handlerId?: string, startDate?: string, endDate?: string): Promise<{
        code: number;
        msg: string;
        data: import("./churn-warning.service").HandleResultStats;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getHandlerRanking(limit?: string): Promise<{
        code: number;
        msg: string;
        data: {
            handlerId: string;
            handlerName: string;
            totalHandled: number;
            successCount: number;
            convertedCount: number;
            successRate: number;
        }[];
    } | {
        code: number;
        msg: any;
        data: never[];
    }>;
}
