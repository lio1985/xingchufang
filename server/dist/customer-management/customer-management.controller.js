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
exports.CustomerManagementController = void 0;
const common_1 = require("@nestjs/common");
const customer_management_service_1 = require("./customer-management.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const optional_auth_guard_1 = require("../guards/optional-auth.guard");
const admin_guard_1 = require("../guards/admin.guard");
const customer_management_dto_1 = require("./customer-management.dto");
let CustomerManagementController = class CustomerManagementController {
    constructor(customerService) {
        this.customerService = customerService;
    }
    async getCustomers(req, query) {
        console.log('[CustomerController] Get customers, query:', JSON.stringify(query));
        if (!req.user) {
            return {
                code: 200,
                msg: 'success',
                data: {
                    data: [],
                    total: 0,
                    page: query.page || 1,
                    pageSize: query.pageSize || 10,
                    totalPages: 0
                }
            };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const result = await this.customerService.getCustomers(userId, isAdmin, query);
        console.log('[CustomerController] Get customers result:', { count: result.data.length, total: result.total });
        return { code: 200, msg: 'success', data: result };
    }
    async getCustomerDetail(id, req) {
        console.log('[CustomerController] Get customer detail:', id);
        if (!req.user) {
            return { code: 200, msg: 'success', data: null };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const customer = await this.customerService.getCustomerDetail(id, userId, isAdmin);
        console.log('[CustomerController] Get customer detail success:', id);
        return { code: 200, msg: 'success', data: customer };
    }
    async createCustomer(dto, req) {
        console.log('[CustomerController] Create customer, name:', dto.name);
        const userId = req.user?.id;
        const customer = await this.customerService.createCustomer(dto, userId);
        console.log('[CustomerController] Create customer success:', customer.id);
        return { code: 200, msg: 'success', data: customer };
    }
    async updateCustomer(id, dto, req) {
        console.log('[CustomerController] Update customer:', id);
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const customer = await this.customerService.updateCustomer(id, dto, userId, isAdmin);
        console.log('[CustomerController] Update customer success:', id);
        return { code: 200, msg: 'success', data: customer };
    }
    async deleteCustomer(id, req) {
        console.log('[CustomerController] Delete customer:', id);
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        await this.customerService.deleteCustomer(id, userId, isAdmin);
        console.log('[CustomerController] Delete customer success:', id);
        return { code: 200, msg: 'success' };
    }
    async createFollowUp(customerId, dto, req) {
        console.log('[CustomerController] Create follow-up for customer:', customerId);
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const followUp = await this.customerService.createFollowUp(customerId, dto, userId, isAdmin);
        console.log('[CustomerController] Create follow-up success');
        return { code: 200, msg: 'success', data: followUp };
    }
    async getFollowUps(customerId, req) {
        console.log('[CustomerController] Get follow-ups for customer:', customerId);
        if (!req.user) {
            return { code: 200, msg: 'success', data: [] };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const followUps = await this.customerService.getFollowUps(customerId, userId, isAdmin);
        console.log('[CustomerController] Get follow-ups count:', followUps.length);
        return { code: 200, msg: 'success', data: followUps };
    }
    async getStatistics(req) {
        console.log('[CustomerController] Get statistics');
        if (!req.user) {
            return {
                code: 200,
                msg: 'success',
                data: {
                    total: 0,
                    todayNew: 0,
                    pendingFollowUp: 0,
                    statusDistribution: { normal: 0, atRisk: 0, lost: 0 },
                    orderDistribution: { inProgress: 0, completed: 0 },
                    totalEstimatedAmount: 0,
                    conversionRate: '0'
                }
            };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const stats = await this.customerService.getStatistics(userId, isAdmin);
        console.log('[CustomerController] Get statistics success');
        return { code: 200, msg: 'success', data: stats };
    }
    async getWeeklyStatistics(req) {
        console.log('[CustomerController] Get weekly statistics');
        if (!req.user) {
            return { code: 200, msg: 'success', data: [] };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const stats = await this.customerService.getWeeklyStatistics(userId, isAdmin);
        console.log('[CustomerController] Get weekly statistics success');
        return { code: 200, msg: 'success', data: stats };
    }
    async getMonthlyStatistics(req) {
        console.log('[CustomerController] Get monthly statistics');
        if (!req.user) {
            return { code: 200, msg: 'success', data: [] };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const stats = await this.customerService.getMonthlyStatistics(userId, isAdmin);
        console.log('[CustomerController] Get monthly statistics success');
        return { code: 200, msg: 'success', data: stats };
    }
    async getStatisticsBySales(req) {
        console.log('[CustomerController] Get statistics by sales (admin only)');
        const stats = await this.customerService.getStatisticsBySales();
        console.log('[CustomerController] Get statistics by sales success');
        return { code: 200, msg: 'success', data: stats };
    }
};
exports.CustomerManagementController = CustomerManagementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, customer_management_dto_1.CustomerQueryDto]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCustomerDetail", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_management_dto_1.CreateCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_management_dto_1.UpdateCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "deleteCustomer", null);
__decorate([
    (0, common_1.Post)(':id/follow-ups'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_management_dto_1.CreateFollowUpDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "createFollowUp", null);
__decorate([
    (0, common_1.Get)(':id/follow-ups'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getFollowUps", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/weekly'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getWeeklyStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/monthly'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getMonthlyStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/by-sales'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getStatisticsBySales", null);
exports.CustomerManagementController = CustomerManagementController = __decorate([
    (0, common_1.Controller)('customers'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __metadata("design:paramtypes", [customer_management_service_1.CustomerManagementService])
], CustomerManagementController);
//# sourceMappingURL=customer-management.controller.js.map