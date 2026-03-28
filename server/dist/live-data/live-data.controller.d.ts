import { LiveDataService } from './live-data.service';
declare class ImportDto {
    title: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    totalViews: number;
    peakOnline: number;
    avgOnline: number;
    newFollowers: number;
    shareCount: number;
    totalComments: number;
    totalLikes: number;
    totalGifts: number;
    productClicks: number;
    productExposures: number;
    ordersCount: number;
    gmv: number;
    products?: any[];
}
export declare class LiveDataController {
    private readonly liveDataService;
    constructor(liveDataService: LiveDataService);
    importLiveData(dto: ImportDto, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getLiveStreams(req: any, page?: string, limit?: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            list: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    } | {
        code: number;
        msg: string;
        data: {
            list: never[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }>;
    getLiveStreamDetail(liveId: string, req: any): Promise<{
        success: boolean;
        data: any;
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    deleteLiveStream(liveId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getDashboard(req: any, period?: string): Promise<{
        success: boolean;
        data: {
            totalViews: any;
            peakOnline: number;
            avgOnline: number;
            newFollowers: any;
            totalComments: any;
            totalLikes: any;
            ordersCount: any;
            gmv: any;
            avgWatchDuration: number;
            conversionRate: number;
            interactionRate: number;
            followerConversionRate: number;
            streamCount: number;
            exposureCount: any;
            enterRoomCount: any;
            onlinePeak: number;
            interactionCount: any;
            privateMessageCount: any;
            enterRoomRate: number;
            prevPeriod: {
                gmv: any;
                ordersCount: any;
                totalViews: any;
                newFollowers: any;
                exposureCount: any;
            };
            trend: {
                date: any;
                views: any;
                gmv: any;
                orders: any;
            }[];
        };
    } | {
        code: number;
        msg: string;
        data: {
            summary: {
                totalStreams: number;
                totalViews: number;
                totalGmv: number;
                avgOnline: number;
            };
            trends: never[];
            comparison: {
                vsLastPeriod: number;
            };
        };
    }>;
    getDailyStats(req: any, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: any[];
    } | {
        code: number;
        msg: string;
        data: never[];
    }>;
    getAllLiveStreams(req: any, userId?: string, page?: string, limit?: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            list: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }>;
    getAdminStats(req: any, userId?: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            totalStreams: number;
            totalUsers: number;
            totalGMV: any;
            totalOrders: any;
            totalViews: any;
            avgGMVPerStream: number;
            avgWatchDuration: number;
            conversionRate: number;
            interactionRate: number;
            exposureCount: any;
            enterRoomCount: any;
            onlinePeak: number;
            avgOnline: number;
            newFollowers: any;
            interactionCount: any;
            privateMessageCount: any;
            enterRoomRate: number;
        };
    }>;
}
export {};
