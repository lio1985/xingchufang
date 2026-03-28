export interface ImportLiveDataDto {
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
    products?: LiveProductDto[];
}
export interface LiveProductDto {
    productName: string;
    productId?: string;
    productPrice: number;
    exposures: number;
    clicks: number;
    orders: number;
    gmv: number;
}
export interface LiveStream {
    id: string;
    userId: string;
    title: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    totalViews: number;
    peakOnline: number;
    avgOnline: number;
    newFollowers: number;
    totalComments: number;
    totalLikes: number;
    totalGifts: number;
    productClicks: number;
    productExposures: number;
    ordersCount: number;
    gmv: number;
    createdAt: string;
}
export declare class LiveDataService {
    private readonly logger;
    private get supabase();
    importLiveData(userId: string, data: ImportLiveDataDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getLiveStreams(userId: string, page?: number, limit?: number, startDate?: string, endDate?: string): Promise<{
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
    getLiveStreamDetail(userId: string, liveId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    deleteLiveStream(userId: string, liveId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getDailyStats(userId: string, startDate: string, endDate: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    getDashboardStats(userId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<{
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
    }>;
    getHistoricalAverage(userId: string): Promise<{
        avgViews: number;
        avgOnline: number;
        avgComments: number;
        avgOrders: number;
        avgGMV: number;
    } | null>;
    getAllLiveStreamsForAdmin(page?: number, limit?: number, userId?: string, startDate?: string, endDate?: string): Promise<{
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
    getAdminStats(userId?: string, startDate?: string, endDate?: string): Promise<{
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
    exportLiveDataForAdmin(format: 'csv' | 'json', userId?: string, startDate?: string, endDate?: string): Promise<{
        data: string;
        filename: string;
        contentType: string;
    }>;
    private updateDailyStats;
}
