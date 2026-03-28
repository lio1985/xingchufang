import { CustomerManagementService } from './customer-management.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateFollowUpDto, CustomerQueryDto } from './customer-management.dto';
export declare class CustomerManagementController {
    private readonly customerService;
    constructor(customerService: CustomerManagementService);
    getCustomers(req: any, query: CustomerQueryDto): Promise<{
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
    getCustomerDetail(id: string, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    createCustomer(dto: CreateCustomerDto, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    updateCustomer(id: string, dto: UpdateCustomerDto, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    deleteCustomer(id: string, req: any): Promise<{
        code: number;
        msg: string;
    }>;
    createFollowUp(customerId: string, dto: CreateFollowUpDto, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    getFollowUps(customerId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: any[];
    }>;
    getStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            total: number;
            active: number;
            inactive: number;
            todayFollowUp: number;
            pendingFollowUp: number;
        };
    } | {
        code: number;
        msg: string;
        data: {
            total: number;
            statusDistribution: {
                normal: number;
                atRisk: number;
                lost: number;
            };
            orderDistribution: {
                inProgress: number;
                completed: number;
            };
            totalEstimatedAmount: number;
            conversionRate: string;
        };
    }>;
    getWeeklyStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: never[];
    } | {
        code: number;
        msg: string;
        data: {
            weekStart: string;
            weekEnd: string;
            newCustomers: number;
            dailyStats: Record<string, {
                new: number;
                followUp: number;
            }>;
            totalAmount: number;
        };
    }>;
    getMonthlyStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: never[];
    } | {
        code: number;
        msg: string;
        data: {
            month: number;
            year: number;
            newCustomers: number;
            statusDistribution: {
                normal: number;
                atRisk: number;
                lost: number;
            };
            completedOrders: number;
            totalAmount: number;
        };
    }>;
    getStatisticsBySales(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            conversionRate: string;
            name: string;
            total: number;
            normal: number;
            atRisk: number;
            lost: number;
            completed: number;
            totalAmount: number;
            userId: string;
        }[];
    }>;
}
