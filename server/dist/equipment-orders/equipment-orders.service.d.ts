import { NotificationService } from '../notification/notification.service';
import { PermissionService } from '../permission/permission.service';
export declare enum OrderStatus {
    PUBLISHED = "published",
    ACCEPTED = "accepted",
    TRANSFERRED = "transferred",
    CANCELLING = "cancelling",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare enum OrderType {
    PURCHASE = "purchase",
    TRANSFER = "transfer"
}
export interface CreateOrderDto {
    orderType: OrderType;
    title: string;
    description?: string;
    category?: string;
    brand?: string;
    model?: string;
    condition?: string;
    expectedPrice?: number;
    customerName: string;
    customerPhone: string;
    customerWechat?: string;
    customerAddress?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}
export interface FollowUpDto {
    content: string;
    nextFollowUpTime?: string;
}
export declare class EquipmentOrdersService {
    private readonly notificationService;
    private readonly permissionService;
    private get supabase();
    constructor(notificationService: NotificationService, permissionService: PermissionService);
    private generateOrderNo;
    private maskPhone;
    private maskWechat;
    private maskAddress;
    createOrder(dto: CreateOrderDto, userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    private notifyAllOnPublish;
    getOrders(params: {
        userId: string;
        userRole: string;
        orderType?: OrderType;
        status?: OrderStatus;
        page?: number;
        limit?: number;
    }): Promise<{
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
    getOrderDetail(orderId: string, userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    acceptOrder(orderId: string, userId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    private createRecycleStoreFromOrder;
    private extractCity;
    private notifyOnAccept;
    transferOrder(orderId: string, fromUserId: string, toUserId: string, reason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private notifyOnTransfer;
    requestCancel(orderId: string, userId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private notifyAdminsOnCancelRequest;
    confirmCancel(orderId: string, adminId: string, approved: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
    cancelOrder(orderId: string, adminId: string, reason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    completeOrder(orderId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private notifyOnComplete;
    addFollowUp(orderId: string, userId: string, dto: FollowUpDto): Promise<{
        success: boolean;
        data: {
            id: string;
            content: string;
            nextFollowUpTime: string | undefined;
            createdAt: string;
            createdBy: string;
        };
    }>;
    updateOrder(orderId: string, dto: Partial<CreateOrderDto>, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteOrder(orderId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAvailableUsers(): Promise<{
        success: boolean;
        data: {
            id: any;
            nickname: any;
            employee_id: any;
            role: any;
        }[];
    }>;
    reassignOrder(orderId: string, newUserId: string | null, adminId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private notifyOnReassign;
}
