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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const statistics_service_1 = require("./statistics.service");
const admin_guard_1 = require("../guards/admin.guard");
const active_user_guard_1 = require("../guards/active-user.guard");
let StatisticsController = class StatisticsController {
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getDashboard(req, period) {
        try {
            const userId = req.user.sub;
            const userRole = req.user.role;
            if (userRole === 'admin') {
                const globalStats = await this.statisticsService.getGlobalStatistics();
                const trends = await this.statisticsService.getGlobalTrends(period || 'week');
                return {
                    code: 200,
                    msg: 'success',
                    data: {
                        type: 'global',
                        stats: globalStats,
                        trends,
                    },
                };
            }
            else {
                const personalStats = await this.statisticsService.getUserDashboardStats(userId, period || 'week');
                const teamStats = await this.statisticsService.getTeamDashboardStats(userId, period || 'week');
                return {
                    code: 200,
                    msg: 'success',
                    data: {
                        type: 'personal',
                        personal: personalStats,
                        team: teamStats,
                    },
                };
            }
        }
        catch (error) {
            console.error('获取数据看板失败:', error);
            return {
                code: 500,
                msg: '获取数据看板失败',
                data: null,
            };
        }
    }
    async getCurrentUserStatistics(req) {
        try {
            const userId = req.user.sub;
            const today = new Date().toISOString().split('T')[0];
            const statistics = await this.statisticsService.getUserStatistics(userId, today);
            return {
                code: 200,
                msg: 'success',
                data: statistics,
            };
        }
        catch (error) {
            console.error('获取当前用户统计失败:', error);
            return {
                code: 500,
                msg: '获取统计失败',
                data: null,
            };
        }
    }
    async getCurrentUserStatisticsList(req, startDate, endDate, limit) {
        try {
            const userId = req.user.sub;
            const statistics = await this.statisticsService.getUserStatisticsList(userId, {
                startDate,
                endDate,
                limit: limit ? parseInt(limit) : undefined,
            });
            return {
                code: 200,
                msg: 'success',
                data: statistics,
            };
        }
        catch (error) {
            console.error('获取用户统计列表失败:', error);
            return {
                code: 500,
                msg: '获取统计列表失败',
                data: null,
            };
        }
    }
    async getGlobalStatistics() {
        try {
            const statistics = await this.statisticsService.getGlobalStatistics();
            return {
                code: 200,
                msg: 'success',
                data: statistics,
            };
        }
        catch (error) {
            console.error('获取全局统计失败:', error);
            return {
                code: 500,
                msg: '获取全局统计失败',
                data: null,
            };
        }
    }
    async getActiveUserRanking(limit) {
        try {
            const rankings = await this.statisticsService.getActiveUserRanking(limit ? parseInt(limit) : 10);
            return {
                code: 200,
                msg: 'success',
                data: rankings,
            };
        }
        catch (error) {
            console.error('获取活跃用户排行失败:', error);
            return {
                code: 500,
                msg: '获取排行失败',
                data: null,
            };
        }
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getCurrentUserStatistics", null);
__decorate([
    (0, common_1.Get)('me/history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getCurrentUserStatisticsList", null);
__decorate([
    (0, common_1.Get)('overview'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getGlobalStatistics", null);
__decorate([
    (0, common_1.Get)('ranking/active'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getActiveUserRanking", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, common_1.Controller)('statistics'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map