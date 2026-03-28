import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getDashboard(req: any, period?: string): Promise<{
        code: number;
        msg: string;
        data: {
            type: string;
            stats: import("./statistics.service").GlobalStatistics;
            trends: {
                date: any;
                dialogCount: any;
                messageCount: any;
                uploadFileCount: any;
                activeUsers: any;
            }[];
            personal?: undefined;
            team?: undefined;
        };
    } | {
        code: number;
        msg: string;
        data: {
            type: string;
            personal: {
                customerCount: number;
                totalDealValue: any;
                contentCount: number;
                dialogCount: any;
                messageCount: any;
                lexiconCount: any;
                uploadFileCount: any;
                trends: {
                    date: any;
                    dialogCount: any;
                    messageCount: any;
                }[];
            };
            team: {
                teamId: any;
                memberCount: number;
                customerCount: number;
                totalDealValue: any;
                contentCount: number;
                dialogCount: any;
                messageCount: any;
                memberStats: {
                    userId: any;
                    dialogCount: any;
                    messageCount: any;
                    dealValue: any;
                }[];
            } | null;
            stats?: undefined;
            trends?: undefined;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getCurrentUserStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: import("./statistics.service").UserStatistics | null;
    }>;
    getCurrentUserStatisticsList(req: any, startDate?: string, endDate?: string, limit?: string): Promise<{
        code: number;
        msg: string;
        data: import("./statistics.service").UserStatistics[];
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getGlobalStatistics(): Promise<{
        code: number;
        msg: string;
        data: import("./statistics.service").GlobalStatistics;
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getActiveUserRanking(limit?: string): Promise<{
        code: number;
        msg: string;
        data: import("./statistics.service").UserRanking[];
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
}
