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
exports.SalesTargetController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../../guards/admin.guard");
const active_user_guard_1 = require("../../guards/active-user.guard");
const sales_target_service_1 = require("./sales-target.service");
let SalesTargetController = class SalesTargetController {
    constructor(salesTargetService) {
        this.salesTargetService = salesTargetService;
    }
    async createTarget(body, req) {
        console.log('[SalesTarget] Create:', body);
        try {
            const user = req.user;
            if (!user) {
                return { code: 401, msg: '未登录', data: null };
            }
            const userId = body.user_id || user.userId;
            if (userId !== user.userId && user.role !== 'admin') {
                return { code: 403, msg: '无权为其他用户创建目标', data: null };
            }
            const target = {
                user_id: userId,
                target_type: body.target_type,
                target_year: body.target_year,
                target_month: body.target_month,
                target_quarter: body.target_quarter,
                target_amount: body.target_amount,
                target_deals: body.target_deals || 0,
                target_customers: body.target_customers || 0,
                description: body.description,
                start_date: body.start_date,
                end_date: body.end_date,
                status: 'active',
                created_by: user.userId,
            };
            const result = await this.salesTargetService.createTarget(target);
            return {
                code: result ? 200 : 500,
                msg: result ? '创建成功' : '创建失败',
                data: result,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Create error:', error);
            return {
                code: 500,
                msg: error.message || '创建失败',
                data: null,
            };
        }
    }
    async updateTarget(targetId, updates, req) {
        console.log('[SalesTarget] Update:', targetId, updates);
        try {
            const user = req.user;
            if (!user) {
                return { code: 401, msg: '未登录', data: null };
            }
            const existingTarget = await this.salesTargetService.getTargetById(targetId);
            if (!existingTarget) {
                return { code: 404, msg: '目标不存在', data: null };
            }
            if (existingTarget.user_id !== user.userId && user.role !== 'admin') {
                return { code: 403, msg: '无权修改此目标', data: null };
            }
            const success = await this.salesTargetService.updateTarget(targetId, updates);
            return {
                code: success ? 200 : 500,
                msg: success ? '更新成功' : '更新失败',
                data: null,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Update error:', error);
            return {
                code: 500,
                msg: error.message || '更新失败',
                data: null,
            };
        }
    }
    async deleteTarget(targetId, req) {
        console.log('[SalesTarget] Delete:', targetId);
        try {
            const user = req.user;
            if (!user) {
                return { code: 401, msg: '未登录', data: null };
            }
            const existingTarget = await this.salesTargetService.getTargetById(targetId);
            if (!existingTarget) {
                return { code: 404, msg: '目标不存在', data: null };
            }
            if (existingTarget.user_id !== user.userId && user.role !== 'admin') {
                return { code: 403, msg: '无权删除此目标', data: null };
            }
            const success = await this.salesTargetService.deleteTarget(targetId);
            return {
                code: success ? 200 : 500,
                msg: success ? '删除成功' : '删除失败',
                data: null,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Delete error:', error);
            return {
                code: 500,
                msg: error.message || '删除失败',
                data: null,
            };
        }
    }
    async getTargetDetail(targetId) {
        console.log('[SalesTarget] Get detail:', targetId);
        try {
            const target = await this.salesTargetService.getTargetById(targetId);
            return {
                code: target ? 200 : 404,
                msg: target ? 'success' : '目标不存在',
                data: target,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Get detail error:', error);
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getTargets(req, userId, targetType, year, month, quarter, status, limit, offset) {
        console.log('[SalesTarget] Get list:', { userId, targetType, year, month });
        try {
            const user = req.user;
            if (!user) {
                return { code: 401, msg: '未登录', data: { targets: [], total: 0 } };
            }
            let queryUserId = userId;
            if (user.role !== 'admin' && userId && userId !== user.userId) {
                return { code: 403, msg: '无权查看其他用户目标', data: { targets: [], total: 0 } };
            }
            if (!queryUserId) {
                queryUserId = user.userId;
            }
            const result = await this.salesTargetService.getTargets({
                userId: queryUserId,
                targetType,
                year: year ? parseInt(year) : undefined,
                month: month ? parseInt(month) : undefined,
                quarter: quarter ? parseInt(quarter) : undefined,
                status,
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0,
            });
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Get list error:', error);
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: { targets: [], total: 0 },
            };
        }
    }
    async getCurrentTarget(type, req) {
        console.log('[SalesTarget] Get current:', type);
        try {
            const user = req.user;
            if (!user) {
                return { code: 401, msg: '未登录', data: null };
            }
            const target = await this.salesTargetService.getCurrentTarget(user.userId, type);
            return {
                code: 200,
                msg: 'success',
                data: target,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Get current error:', error);
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getTargetProgress(targetId) {
        console.log('[SalesTarget] Get progress:', targetId);
        try {
            const progress = await this.salesTargetService.getTargetProgress(targetId);
            return {
                code: progress ? 200 : 404,
                msg: progress ? 'success' : '目标不存在',
                data: progress,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Get progress error:', error);
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getMyTargetsProgress(req) {
        console.log('[SalesTarget] Get my progress');
        try {
            const user = req.user;
            if (!user) {
                return { code: 401, msg: '未登录', data: [] };
            }
            const progresses = await this.salesTargetService.getUserTargetsProgress(user.userId);
            return {
                code: 200,
                msg: 'success',
                data: progresses,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Get my progress error:', error);
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: [],
            };
        }
    }
    async getTeamStats(year, month, quarter) {
        console.log('[SalesTarget] Get team stats:', { year, month, quarter });
        try {
            const stats = await this.salesTargetService.getTeamTargetStats(year ? parseInt(year) : undefined, month ? parseInt(month) : undefined, quarter ? parseInt(quarter) : undefined);
            return {
                code: 200,
                msg: 'success',
                data: stats,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Get team stats error:', error);
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async checkTargetReminder(req) {
        console.log('[SalesTarget] Check reminder');
        try {
            const user = req.user;
            if (!user) {
                return { code: 401, msg: '未登录', data: null };
            }
            const reminder = await this.salesTargetService.checkAndSuggestTarget(user.userId);
            return {
                code: 200,
                msg: 'success',
                data: reminder,
            };
        }
        catch (error) {
            console.error('[SalesTarget] Check reminder error:', error);
            return {
                code: 500,
                msg: error.message || '检查失败',
                data: null,
            };
        }
    }
};
exports.SalesTargetController = SalesTargetController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "createTarget", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "updateTarget", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "deleteTarget", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "getTargetDetail", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('targetType')),
    __param(3, (0, common_1.Query)('year')),
    __param(4, (0, common_1.Query)('month')),
    __param(5, (0, common_1.Query)('quarter')),
    __param(6, (0, common_1.Query)('status')),
    __param(7, (0, common_1.Query)('limit')),
    __param(8, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "getTargets", null);
__decorate([
    (0, common_1.Get)('current/:type'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "getCurrentTarget", null);
__decorate([
    (0, common_1.Get)(':id/progress'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "getTargetProgress", null);
__decorate([
    (0, common_1.Get)('my/progress'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "getMyTargetsProgress", null);
__decorate([
    (0, common_1.Get)('team/stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('quarter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "getTeamStats", null);
__decorate([
    (0, common_1.Get)('check/reminder'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesTargetController.prototype, "checkTargetReminder", null);
exports.SalesTargetController = SalesTargetController = __decorate([
    (0, common_1.Controller)('sales-targets'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __metadata("design:paramtypes", [sales_target_service_1.SalesTargetService])
], SalesTargetController);
//# sourceMappingURL=sales-target.controller.js.map