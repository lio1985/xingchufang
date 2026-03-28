import { NotificationService } from './notification.service';
declare class SendNotificationDto {
    title: string;
    content: string;
    type?: 'system' | 'activity' | 'update';
    targetType?: 'all' | 'team' | 'user';
    targetTeams?: string[];
    targetUsers?: string[];
}
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    sendNotification(dto: SendNotificationDto, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getNotifications(req: any, page?: string, limit?: string): Promise<{
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
    markAsRead(notificationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getUnreadCount(req: any): Promise<{
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
export {};
