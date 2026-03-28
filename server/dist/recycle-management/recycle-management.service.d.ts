import { DatabaseService } from '../database/database.service';
import { CreateRecycleStoreDto, UpdateRecycleStoreDto, CreateFollowUpDto, RecycleStoreQueryDto } from './recycle-management.dto';
export declare class RecycleManagementService {
    private readonly databaseService;
    private supabase;
    constructor(databaseService: DatabaseService);
    getStores(userId: string, isAdmin: boolean, query: RecycleStoreQueryDto): Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getStoreDetail(id: string, userId: string, isAdmin: boolean): Promise<any>;
    createStore(dto: CreateRecycleStoreDto, userId: string): Promise<any>;
    updateStore(id: string, dto: UpdateRecycleStoreDto, userId: string, isAdmin: boolean): Promise<any>;
    deleteStore(id: string, userId: string, isAdmin: boolean): Promise<{
        success: boolean;
    }>;
    getFollowUps(storeId: string, userId: string, isAdmin: boolean): Promise<any[]>;
    createFollowUp(storeId: string, dto: CreateFollowUpDto, userId: string, isAdmin: boolean): Promise<any>;
    getOverviewStatistics(userId: string, isAdmin: boolean): Promise<{
        total: number;
        statusDistribution: Record<string, number>;
        totalEstimatedValue: number;
        businessTypeDistribution: Record<string, number>;
    }>;
}
