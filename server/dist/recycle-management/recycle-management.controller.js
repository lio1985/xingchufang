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
exports.RecycleManagementController = void 0;
const common_1 = require("@nestjs/common");
const recycle_management_service_1 = require("./recycle-management.service");
const recycle_management_dto_1 = require("./recycle-management.dto");
const active_user_guard_1 = require("../guards/active-user.guard");
const optional_auth_guard_1 = require("../guards/optional-auth.guard");
let RecycleManagementController = class RecycleManagementController {
    constructor(recycleService) {
        this.recycleService = recycleService;
    }
    async getStores(req, query) {
        if (!req.user) {
            return {
                code: 200,
                msg: '获取成功',
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
        console.log('[RecycleController] Get stores:', { userId, isAdmin, query });
        const result = await this.recycleService.getStores(userId, isAdmin, query);
        return {
            code: 200,
            msg: '获取成功',
            data: result
        };
    }
    async getStoreDetail(req, id) {
        if (!req.user) {
            return {
                code: 200,
                msg: '获取成功',
                data: null
            };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const store = await this.recycleService.getStoreDetail(id, userId, isAdmin);
        return {
            code: 200,
            msg: '获取成功',
            data: store
        };
    }
    async createStore(req, dto) {
        const userId = req.user?.id;
        console.log('[RecycleController] Create store:', { userId, dto });
        const store = await this.recycleService.createStore(dto, userId);
        return {
            code: 200,
            msg: '创建成功',
            data: store
        };
    }
    async updateStore(req, id, dto) {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        console.log('[RecycleController] Update store:', { id, userId, isAdmin, dto });
        const store = await this.recycleService.updateStore(id, dto, userId, isAdmin);
        return {
            code: 200,
            msg: '更新成功',
            data: store
        };
    }
    async deleteStore(req, id) {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        await this.recycleService.deleteStore(id, userId, isAdmin);
        return {
            code: 200,
            msg: '删除成功',
            data: { success: true }
        };
    }
    async getStoreFollowUps(req, id) {
        if (!req.user) {
            return {
                code: 200,
                msg: '获取成功',
                data: []
            };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const followUps = await this.recycleService.getFollowUps(id, userId, isAdmin);
        return {
            code: 200,
            msg: '获取成功',
            data: followUps
        };
    }
    async createStoreFollowUp(req, id, dto) {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        console.log('[RecycleController] Create follow-up:', { storeId: id, userId, dto });
        const followUp = await this.recycleService.createFollowUp(id, dto, userId, isAdmin);
        return {
            code: 200,
            msg: '创建成功',
            data: followUp
        };
    }
    async getOverviewStatistics(req) {
        if (!req.user) {
            return {
                code: 200,
                msg: '获取成功',
                data: {
                    total: 0,
                    pending: 0,
                    negotiating: 0,
                    deal: 0,
                    recycling: 0,
                    completed: 0,
                    cancelled: 0,
                    totalEstimatedValue: 0,
                    monthlyGrowth: 0,
                    statusDistribution: {},
                    businessTypeDistribution: {}
                }
            };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const statistics = await this.recycleService.getOverviewStatistics(userId, isAdmin);
        return {
            code: 200,
            msg: '获取成功',
            data: statistics
        };
    }
    async getDashboardStatistics(req) {
        if (!req.user) {
            return {
                code: 200,
                msg: '获取成功',
                data: {
                    overview: {
                        totalStores: 0,
                        totalEstimatedValue: 0,
                        completedRecycles: 0,
                        inProgressRecycles: 0,
                        totalCost: 0
                    },
                    statusDistribution: {},
                    businessTypeDistribution: {},
                    recentGrowth: {
                        thisWeek: 0,
                        lastWeek: 0,
                        growthRate: 0
                    },
                    monthlyTrend: []
                }
            };
        }
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const overview = await this.recycleService.getOverviewStatistics(userId, isAdmin);
        const now = new Date();
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = month.toISOString().slice(0, 7);
            const { data: monthStores } = await this.recycleService['supabase']
                .from('recycle_stores')
                .select('estimated_value')
                .eq('is_deleted', false)
                .gte('created_at', monthStr)
                .lt('created_at', `${monthStr}-01`);
            const count = monthStores?.length || 0;
            const value = monthStores?.reduce((sum, s) => sum + (s.estimated_value || 0), 0) || 0;
            monthlyTrend.push({
                month: monthStr,
                count,
                value
            });
        }
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay());
        thisWeekStart.setHours(0, 0, 0, 0);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const { data: thisWeekStores } = await this.recycleService['supabase']
            .from('recycle_stores')
            .select('id')
            .eq('is_deleted', false)
            .gte('created_at', thisWeekStart.toISOString());
        const { data: lastWeekStores } = await this.recycleService['supabase']
            .from('recycle_stores')
            .select('id')
            .eq('is_deleted', false)
            .gte('created_at', lastWeekStart.toISOString())
            .lt('created_at', thisWeekStart.toISOString());
        const thisWeekCount = thisWeekStores?.length || 0;
        const lastWeekCount = lastWeekStores?.length || 0;
        const growthRate = lastWeekCount > 0
            ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
            : 0;
        const { data: costStores } = await this.recycleService['supabase']
            .from('recycle_stores')
            .select('total_cost')
            .eq('is_deleted', false);
        const totalCost = costStores?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;
        return {
            code: 200,
            msg: '获取成功',
            data: {
                overview: {
                    totalStores: overview.total,
                    totalEstimatedValue: overview.totalEstimatedValue,
                    completedRecycles: overview.statusDistribution.completed || 0,
                    inProgressRecycles: (overview.statusDistribution.negotiating || 0) +
                        (overview.statusDistribution.deal || 0) +
                        (overview.statusDistribution.recycling || 0),
                    totalCost
                },
                statusDistribution: overview.statusDistribution,
                businessTypeDistribution: overview.businessTypeDistribution,
                recentGrowth: {
                    thisWeek: thisWeekCount,
                    lastWeek: lastWeekCount,
                    growthRate
                },
                monthlyTrend
            }
        };
    }
};
exports.RecycleManagementController = RecycleManagementController;
__decorate([
    (0, common_1.Get)('stores'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recycle_management_dto_1.RecycleStoreQueryDto]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "getStores", null);
__decorate([
    (0, common_1.Get)('stores/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "getStoreDetail", null);
__decorate([
    (0, common_1.Post)('stores'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recycle_management_dto_1.CreateRecycleStoreDto]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "createStore", null);
__decorate([
    (0, common_1.Put)('stores/:id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, recycle_management_dto_1.UpdateRecycleStoreDto]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "updateStore", null);
__decorate([
    (0, common_1.Delete)('stores/:id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "deleteStore", null);
__decorate([
    (0, common_1.Get)('stores/:id/follow-ups'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "getStoreFollowUps", null);
__decorate([
    (0, common_1.Post)('stores/:id/follow-ups'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, recycle_management_dto_1.CreateFollowUpDto]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "createStoreFollowUp", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "getOverviewStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecycleManagementController.prototype, "getDashboardStatistics", null);
exports.RecycleManagementController = RecycleManagementController = __decorate([
    (0, common_1.Controller)('recycle'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __metadata("design:paramtypes", [recycle_management_service_1.RecycleManagementService])
], RecycleManagementController);
//# sourceMappingURL=recycle-management.controller.js.map