"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCustomerController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../guards/admin.guard");
const active_user_guard_1 = require("../guards/active-user.guard");
const customer_management_service_1 = require("../customer-management/customer-management.service");
const supabase_client_1 = require("../storage/database/supabase-client");
let AdminCustomerController = class AdminCustomerController {
    constructor(customerService) {
        this.customerService = customerService;
    }
    async getAllCustomers(page, pageSize, keyword, status, salesId, orderStatus) {
        console.log('[AdminCustomer] Get all customers:', { keyword, status, salesId });
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        let query = supabase
            .from('customers')
            .select('*, users(name)', { count: 'exact' })
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });
        if (keyword) {
            query = query.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%`);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (orderStatus) {
            query = query.eq('order_status', orderStatus);
        }
        if (salesId && salesId.trim() !== '') {
            query = query.eq('user_id', salesId);
        }
        const pageNum = parseInt(page || '1', 10);
        const size = parseInt(pageSize || '20', 10);
        const from = (pageNum - 1) * size;
        const to = from + size - 1;
        const { data, error, count } = await query.range(from, to);
        if (error) {
            console.error('[AdminCustomer] Query error:', error);
            throw new Error(`查询失败: ${error.message}`);
        }
        const customers = data?.map(c => ({
            ...c,
            sales_name: Array.isArray(c.users) && c.users[0]?.name
                ? c.users[0].name
                : (c.users?.name || '未知')
        })) || [];
        return {
            code: 200,
            msg: 'success',
            data: {
                data: customers,
                total: count || 0,
                page: pageNum,
                pageSize: size
            }
        };
    }
    async getGlobalStatistics() {
        console.log('[AdminCustomer] Get global statistics');
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: overview, error: overviewError } = await supabase
            .from('customers')
            .select('status, order_status, estimated_amount, created_at')
            .eq('is_deleted', false);
        if (overviewError) {
            console.error('[AdminCustomer] Overview error:', overviewError);
            throw new Error(`获取统计失败: ${overviewError.message}`);
        }
        const totalCustomers = overview?.length || 0;
        let totalEstimatedAmount = 0;
        let completedOrders = 0;
        let inProgressOrders = 0;
        const statusDistribution = { normal: 0, atRisk: 0, lost: 0 };
        const typeDistribution = {};
        overview?.forEach(c => {
            totalEstimatedAmount += parseFloat(c.estimated_amount) || 0;
            if (c.order_status === 'completed') {
                completedOrders++;
            }
            else {
                inProgressOrders++;
            }
            if (c.status === 'normal')
                statusDistribution.normal++;
            else if (c.status === 'at_risk')
                statusDistribution.atRisk++;
            else if (c.status === 'lost')
                statusDistribution.lost++;
        });
        const now = new Date();
        const thisWeekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
        const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeek = overview?.filter(c => new Date(c.created_at) >= thisWeekStart).length || 0;
        const lastWeek = overview?.filter(c => {
            const d = new Date(c.created_at);
            return d >= lastWeekStart && d < thisWeekStart;
        }).length || 0;
        const growthRate = lastWeek > 0
            ? ((thisWeek - lastWeek) / lastWeek) * 100
            : 0;
        return {
            code: 200,
            msg: 'success',
            data: {
                overview: {
                    totalCustomers,
                    totalEstimatedAmount,
                    completedOrders,
                    inProgressOrders
                },
                statusDistribution,
                orderDistribution: {
                    inProgress: inProgressOrders,
                    completed: completedOrders
                },
                typeDistribution,
                recentGrowth: {
                    thisWeek,
                    lastWeek,
                    growthRate
                }
            }
        };
    }
    async getSalesRanking() {
        console.log('[AdminCustomer] Get sales ranking');
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('customers')
            .select('user_id, status, order_status, estimated_amount, users(name)')
            .eq('is_deleted', false);
        if (error) {
            console.error('[AdminCustomer] Ranking error:', error);
            throw new Error(`获取排行失败: ${error.message}`);
        }
        const salesMap = {};
        data?.forEach(c => {
            const userId = c.user_id;
            const userName = Array.isArray(c.users) && c.users[0]?.name ? c.users[0].name : '未知';
            if (!salesMap[userId]) {
                salesMap[userId] = {
                    user_id: userId,
                    sales_name: userName,
                    total: 0,
                    normal: 0,
                    atRisk: 0,
                    lost: 0,
                    completed: 0,
                    totalAmount: 0
                };
            }
            salesMap[userId].total++;
            if (c.status === 'normal')
                salesMap[userId].normal++;
            if (c.status === 'at_risk')
                salesMap[userId].atRisk++;
            if (c.status === 'lost')
                salesMap[userId].lost++;
            if (c.order_status === 'completed')
                salesMap[userId].completed++;
            salesMap[userId].totalAmount += parseFloat(c.estimated_amount) || 0;
        });
        return {
            code: 200,
            msg: 'success',
            data: Object.values(salesMap)
        };
    }
    async exportCustomers(keyword, status, salesId) {
        console.log('[AdminCustomer] Export customers');
        return {
            code: 200,
            msg: '导出功能开发中',
            data: {
                downloadUrl: ''
            }
        };
    }
};
exports.AdminCustomerController = AdminCustomerController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('salesId')),
    __param(5, (0, common_1.Query)('orderStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminCustomerController.prototype, "getAllCustomers", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCustomerController.prototype, "getGlobalStatistics", null);
__decorate([
    (0, common_1.Get)('sales-ranking'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminCustomerController.prototype, "getSalesRanking", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('salesId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminCustomerController.prototype, "exportCustomers", null);
exports.AdminCustomerController = AdminCustomerController = __decorate([
    (0, common_1.Controller)('admin/customers'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [customer_management_service_1.CustomerManagementService])
], AdminCustomerController);
//# sourceMappingURL=admin-customer.controller.js.map