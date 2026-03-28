import { DatabaseService } from '../database/database.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateFollowUpDto, CustomerQueryDto } from './customer-management.dto';
export declare class CustomerManagementService {
    private readonly databaseService;
    private supabase;
    constructor(databaseService: DatabaseService);
    getCustomers(userId: string, isAdmin: boolean, query: CustomerQueryDto): Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getCustomerDetail(id: string, userId: string, isAdmin: boolean): Promise<any>;
    createCustomer(dto: CreateCustomerDto, userId: string): Promise<any>;
    updateCustomer(id: string, dto: UpdateCustomerDto, userId: string, isAdmin: boolean): Promise<any>;
    deleteCustomer(id: string, userId: string, isAdmin: boolean): Promise<void>;
    createFollowUp(customerId: string, dto: CreateFollowUpDto, userId: string, isAdmin: boolean): Promise<any>;
    getFollowUps(customerId: string, userId: string, isAdmin: boolean): Promise<any[]>;
    getStatistics(userId: string, isAdmin: boolean): Promise<{
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
    }>;
    getWeeklyStatistics(userId: string, isAdmin: boolean): Promise<{
        weekStart: string;
        weekEnd: string;
        newCustomers: number;
        dailyStats: Record<string, {
            new: number;
            followUp: number;
        }>;
        totalAmount: number;
    }>;
    getMonthlyStatistics(userId: string, isAdmin: boolean): Promise<{
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
    }>;
    getStatisticsBySales(): Promise<{
        conversionRate: string;
        name: string;
        total: number;
        normal: number;
        atRisk: number;
        lost: number;
        completed: number;
        totalAmount: number;
        userId: string;
    }[]>;
}
