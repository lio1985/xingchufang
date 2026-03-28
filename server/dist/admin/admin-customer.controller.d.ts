import { CustomerManagementService } from '../customer-management/customer-management.service';
export declare class AdminCustomerController {
    private readonly customerService;
    constructor(customerService: CustomerManagementService);
    getAllCustomers(page?: string, pageSize?: string, keyword?: string, status?: string, salesId?: string, orderStatus?: string): Promise<{
        code: number;
        msg: string;
        data: {
            data: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    }>;
    getGlobalStatistics(): Promise<{
        code: number;
        msg: string;
        data: {
            overview: {
                totalCustomers: number;
                totalEstimatedAmount: number;
                completedOrders: number;
                inProgressOrders: number;
            };
            statusDistribution: {
                normal: number;
                atRisk: number;
                lost: number;
            };
            orderDistribution: {
                inProgress: number;
                completed: number;
            };
            typeDistribution: Record<string, number>;
            recentGrowth: {
                thisWeek: number;
                lastWeek: number;
                growthRate: number;
            };
        };
    }>;
    getSalesRanking(): Promise<{
        code: number;
        msg: string;
        data: {
            user_id: string;
            sales_name: string;
            total: number;
            normal: number;
            atRisk: number;
            lost: number;
            completed: number;
            totalAmount: number;
        }[];
    }>;
    exportCustomers(keyword?: string, status?: string, salesId?: string): Promise<{
        code: number;
        msg: string;
        data: {
            downloadUrl: string;
        };
    }>;
}
