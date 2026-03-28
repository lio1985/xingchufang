export interface CreateNotificationDto {
    title: string;
    content: string;
    type?: 'system' | 'activity' | 'update';
    targetType?: 'all' | 'team' | 'user';
    targetTeams?: string[];
    targetUsers?: string[];
    senderId?: string;
}
export interface Notification {
    id: string;
    title: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}
export declare class NotificationService {
    private get supabase();
    sendNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            list: {
                id: any;
                title: any;
                content: any;
                type: any;
                createdAt: any;
                isRead: any;
                readAt: any;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
            unreadCount: number;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUnreadCount(userId: string): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    deleteNotification(notificationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
