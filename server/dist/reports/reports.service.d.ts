import { ReportData } from './types';
import { DatabaseService } from '../database/database.service';
import { StatisticsService } from '../statistics/statistics.service';
export declare class ReportsService {
    private readonly databaseService;
    private readonly statisticsService;
    private readonly llmClient;
    constructor(databaseService: DatabaseService, statisticsService: StatisticsService);
    private getOperationStatistics;
    private getUserBehaviorStatistics;
    private getContentStatistics;
    private buildReportPrompt;
    generateReport(timeRange: string): Promise<ReportData>;
    getLatestReport(): Promise<ReportData | null>;
}
