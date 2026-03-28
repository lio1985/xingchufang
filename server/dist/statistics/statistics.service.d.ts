export interface UserStatistics {
    id: string;
    userId: string;
    statDate: string;
    dialogCount: number;
    messageCount: number;
    lexiconCount: number;
    lexiconItemCount: number;
    hotWordCount: number;
    viralReplicaCount: number;
    scheduledTaskCount: number;
    workPlanCount: number;
    workPlanTaskCount: number;
    uploadFileCount: number;
    uploadFileSize: number;
    totalTokensUsed: number;
    createdAt: string;
    updatedAt: string;
}
export interface GlobalStatistics {
    totalUsers: number;
    activeUsers: number;
    totalDialogs: number;
    totalMessages: number;
    totalLexicons: number;
    totalLexiconItems: number;
    totalHotWords: number;
    totalViralReplicas: number;
    totalScheduledTasks: number;
    totalWorkPlans: number;
    totalWorkPlanTasks: number;
    totalUploadFiles: number;
    totalUploadFileSize: number;
    totalTokensUsed: number;
    todayActiveUsers: number;
    todayDialogs: number;
    todayMessages: number;
    todayUploads: number;
}
export interface UserRanking {
    userId: string;
    nickname?: string;
    avatarUrl?: string;
    department?: string;
    position?: string;
    dialogCount: number;
    messageCount: number;
    lexiconCount: number;
    uploadFileCount: number;
    rank: number;
}
export declare class StatisticsService {
    private client;
    getUserStatistics(userId: string, date: string): Promise<UserStatistics | null>;
    getUserStatisticsList(userId: string, options?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<UserStatistics[]>;
    getUserDashboardStats(userId: string, period?: string): Promise<{
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
    }>;
    getTeamDashboardStats(userId: string, period?: string): Promise<{
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
    } | null>;
    getGlobalTrends(period?: string): Promise<{
        date: any;
        dialogCount: any;
        messageCount: any;
        uploadFileCount: any;
        activeUsers: any;
    }[]>;
    getGlobalStatistics(): Promise<GlobalStatistics>;
    getActiveUserRanking(limit?: number): Promise<UserRanking[]>;
    updateUserStatistics(userId: string, updates: Partial<UserStatistics>): Promise<void>;
    private createInitialStatistics;
    incrementDialogCount(userId: string): Promise<void>;
    incrementMessageCount(userId: string, count?: number): Promise<void>;
    incrementUploadFileCount(userId: string, fileSize: number): Promise<void>;
}
