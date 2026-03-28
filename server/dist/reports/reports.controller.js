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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const admin_guard_1 = require("../guards/admin.guard");
const active_user_guard_1 = require("../guards/active-user.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async generateReport(body) {
        try {
            const { timeRange = 'week' } = body;
            const report = await this.reportsService.generateReport(timeRange);
            return {
                code: 200,
                msg: '报告生成成功',
                data: report,
            };
        }
        catch (error) {
            console.error('生成报告失败:', error);
            return {
                code: 500,
                msg: '生成报告失败',
                data: null,
            };
        }
    }
    async getLatestReport() {
        try {
            const report = await this.reportsService.getLatestReport();
            if (!report) {
                return {
                    code: 404,
                    msg: '暂无报告',
                    data: null,
                };
            }
            return {
                code: 200,
                msg: 'success',
                data: report,
            };
        }
        catch (error) {
            console.error('获取报告失败:', error);
            return {
                code: 500,
                msg: '获取报告失败',
                data: null,
            };
        }
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getLatestReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('admin/reports'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map