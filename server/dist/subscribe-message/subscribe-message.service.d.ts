export declare class SubscribeMessageService {
    private readonly logger;
    private get supabase();
    private accessTokenCache;
    private getAccessToken;
    subscribe(userId: string, templateId: string, wxTemplateId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unsubscribe(userId: string, templateId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSubscribeStatus(userId: string): Promise<{
        success: boolean;
        data: {
            subscribedIds: any[];
        };
    }>;
    sendSubscribeMessage(userId: string, templateId: string, data: Record<string, {
        value: string;
    }>, page?: string): Promise<{
        success: boolean;
        message: any;
    }>;
    batchSendSubscribeMessage(userIds: string[], templateId: string, data: Record<string, {
        value: string;
    }>, page?: string): Promise<{
        success: boolean;
        data: {
            total: number;
            success: number;
            failed: number;
            results: {
                userId: string;
                success: boolean;
                message: string;
            }[];
        };
    }>;
}
