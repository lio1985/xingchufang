import { ReportsService } from './reports.service';
import { ReportGenerationRequest } from './types';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generateReport(body: ReportGenerationRequest): Promise<{
        code: number;
        msg: string;
        data: import("./types").ReportData;
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getLatestReport(): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: import("./types").ReportData;
    }>;
}
