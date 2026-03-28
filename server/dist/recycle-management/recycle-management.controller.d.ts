import { RecycleManagementService } from './recycle-management.service';
import { CreateRecycleStoreDto, UpdateRecycleStoreDto, CreateFollowUpDto, RecycleStoreQueryDto } from './recycle-management.dto';
export declare class RecycleManagementController {
    private readonly recycleService;
    constructor(recycleService: RecycleManagementService);
    getStores(req: any, query: RecycleStoreQueryDto): Promise<{
        code: number;
        msg: string;
        data: {
            data: any[];
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    getStoreDetail(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    createStore(req: any, dto: CreateRecycleStoreDto): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    updateStore(req: any, id: string, dto: UpdateRecycleStoreDto): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    deleteStore(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: {
            success: boolean;
        };
    }>;
    getStoreFollowUps(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: any[];
    }>;
    createStoreFollowUp(req: any, id: string, dto: CreateFollowUpDto): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    getOverviewStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            total: number;
            pending: number;
            negotiating: number;
            deal: number;
            recycling: number;
            completed: number;
            cancelled: number;
            totalEstimatedValue: number;
            monthlyGrowth: number;
            statusDistribution: {};
            businessTypeDistribution: {};
        };
    } | {
        code: number;
        msg: string;
        data: {
            total: number;
            statusDistribution: Record<string, number>;
            totalEstimatedValue: number;
            businessTypeDistribution: Record<string, number>;
        };
    }>;
    getDashboardStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            overview: {
                totalStores: number;
                totalEstimatedValue: number;
                completedRecycles: number;
                inProgressRecycles: number;
                totalCost: any;
            };
            statusDistribution: Record<string, number>;
            businessTypeDistribution: Record<string, number>;
            recentGrowth: {
                thisWeek: number;
                lastWeek: number;
                growthRate: number;
            };
            monthlyTrend: {
                month: string;
                count: number;
                value: number;
            }[];
        };
    }>;
}
