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
exports.LiveDataController = void 0;
const common_1 = require("@nestjs/common");
const live_data_service_1 = require("./live-data.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const optional_auth_guard_1 = require("../guards/optional-auth.guard");
const admin_guard_1 = require("../guards/admin.guard");
class ImportDto {
}
let LiveDataController = class LiveDataController {
    constructor(liveDataService) {
        this.liveDataService = liveDataService;
    }
    async importLiveData(dto, req) {
        const userId = req.user?.sub;
        return this.liveDataService.importLiveData(userId, dto);
    }
    async getLiveStreams(req, page, limit, startDate, endDate) {
        if (!req.user) {
            return {
                code: 200,
                msg: 'success',
                data: {
                    list: [],
                    pagination: {
                        page: parseInt(page || '1', 10),
                        limit: parseInt(limit || '20', 10),
                        total: 0,
                    },
                },
            };
        }
        const userId = req.user?.sub;
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '20', 10);
        return this.liveDataService.getLiveStreams(userId, pageNum, limitNum, startDate, endDate);
    }
    async getLiveStreamDetail(liveId, req) {
        if (!req.user) {
            return {
                code: 200,
                msg: 'success',
                data: null,
            };
        }
        const userId = req.user?.sub;
        return this.liveDataService.getLiveStreamDetail(userId, liveId);
    }
    async deleteLiveStream(liveId, req) {
        const userId = req.user?.sub;
        return this.liveDataService.deleteLiveStream(userId, liveId);
    }
    async getDashboard(req, period) {
        if (!req.user) {
            return {
                code: 200,
                msg: 'success',
                data: {
                    summary: {
                        totalStreams: 0,
                        totalViews: 0,
                        totalGmv: 0,
                        avgOnline: 0,
                    },
                    trends: [],
                    comparison: {
                        vsLastPeriod: 0,
                    },
                },
            };
        }
        const userId = req.user?.sub;
        const validPeriod = ['day', 'week', 'month', 'year'].includes(period)
            ? period
            : 'week';
        return this.liveDataService.getDashboardStats(userId, validPeriod);
    }
    async getDailyStats(req, startDate, endDate) {
        if (!req.user) {
            return {
                code: 200,
                msg: 'success',
                data: [],
            };
        }
        const userId = req.user?.sub;
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        return this.liveDataService.getDailyStats(userId, start, end);
    }
    async getAllLiveStreams(req, userId, page, limit, startDate, endDate) {
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '20', 10);
        return this.liveDataService.getAllLiveStreamsForAdmin(pageNum, limitNum, userId, startDate, endDate);
    }
    async getAdminStats(req, userId, startDate, endDate) {
        return this.liveDataService.getAdminStats(userId, startDate, endDate);
    }
};
exports.LiveDataController = LiveDataController;
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ImportDto, Object]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "importLiveData", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "getLiveStreams", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "getLiveStreamDetail", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "deleteLiveStream", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('daily-stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "getDailyStats", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "getAllLiveStreams", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], LiveDataController.prototype, "getAdminStats", null);
exports.LiveDataController = LiveDataController = __decorate([
    (0, common_1.Controller)('live-data'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __metadata("design:paramtypes", [live_data_service_1.LiveDataService])
], LiveDataController);
//# sourceMappingURL=live-data.controller.js.map