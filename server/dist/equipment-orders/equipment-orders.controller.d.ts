import { EquipmentOrdersService, CreateOrderDto, FollowUpDto, OrderType, OrderStatus } from './equipment-orders.service';
export declare class EquipmentOrdersController {
    private readonly ordersService;
    constructor(ordersService: EquipmentOrdersService);
    create(dto: CreateOrderDto, req: any): Promise<{
        success: boolean;
        data: any;
    }>;
    getList(orderType?: OrderType, status?: OrderStatus, page?: string, limit?: string, req?: any): Promise<{
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
    getDetail(id: string, req: any): Promise<{
        success: boolean;
        data: any;
    }>;
    accept(id: string, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    transfer(id: string, toUserId: string, reason: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    requestCancel(id: string, reason: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    confirmCancel(id: string, approved: boolean, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    addFollowUp(id: string, dto: FollowUpDto, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            content: string;
            nextFollowUpTime: string | undefined;
            createdAt: string;
            createdBy: string;
        };
    }>;
    complete(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    reassign(id: string, newUserId: string | null, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: Partial<CreateOrderDto>, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    delete(id: string, req: any): Promise<{
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
}
