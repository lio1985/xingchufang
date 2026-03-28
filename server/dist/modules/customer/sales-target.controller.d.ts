import { SalesTargetService, SalesTarget } from './sales-target.service';
import { Request } from 'express';
export declare class SalesTargetController {
    private readonly salesTargetService;
    constructor(salesTargetService: SalesTargetService);
    createTarget(body: {
        user_id?: string;
        target_type: 'monthly' | 'quarterly' | 'yearly';
        target_year: number;
        target_month?: number;
        target_quarter?: number;
        target_amount: number;
        target_deals?: number;
        target_customers?: number;
        description?: string;
        start_date: string;
        end_date: string;
    }, req: Request): Promise<{
        code: number;
        msg: string;
        data: SalesTarget | null;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    updateTarget(targetId: string, updates: Partial<SalesTarget>, req: Request): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    deleteTarget(targetId: string, req: Request): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    getTargetDetail(targetId: string): Promise<{
        code: number;
        msg: string;
        data: SalesTarget | null;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getTargets(req: Request, userId?: string, targetType?: string, year?: string, month?: string, quarter?: string, status?: string, limit?: string, offset?: string): Promise<{
        code: number;
        msg: string;
        data: {
            targets: SalesTarget[];
            total: number;
        };
    } | {
        code: number;
        msg: any;
        data: {
            targets: never[];
            total: number;
        };
    }>;
    getCurrentTarget(type: 'monthly' | 'quarterly' | 'yearly', req: Request): Promise<{
        code: number;
        msg: string;
        data: SalesTarget | null;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getTargetProgress(targetId: string): Promise<{
        code: number;
        msg: string;
        data: import("./sales-target.service").TargetProgress | null;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getMyTargetsProgress(req: Request): Promise<{
        code: number;
        msg: string;
        data: import("./sales-target.service").TargetProgress[];
    } | {
        code: number;
        msg: any;
        data: never[];
    }>;
    getTeamStats(year?: string, month?: string, quarter?: string): Promise<{
        code: number;
        msg: string;
        data: import("./sales-target.service").TeamTargetStats;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    checkTargetReminder(req: Request): Promise<{
        code: number;
        msg: string;
        data: {
            needsTarget: boolean;
            suggestedType: string;
            message: string;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
}
