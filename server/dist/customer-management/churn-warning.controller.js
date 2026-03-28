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
exports.ChurnWarningController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../guards/admin.guard");
const active_user_guard_1 = require("../guards/active-user.guard");
const churn_warning_service_1 = require("./churn-warning.service");
let ChurnWarningController = class ChurnWarningController {
    constructor(churnWarningService) {
        this.churnWarningService = churnWarningService;
    }
    async getRiskList(salesId, riskLevel) {
        console.log('[ChurnWarning] Get risk list:', { salesId, riskLevel });
        try {
            const assessments = await this.churnWarningService.assessAllCustomers(salesId);
            let filtered = assessments;
            if (riskLevel && riskLevel !== 'all') {
                filtered = assessments.filter(a => a.riskLevel === riskLevel);
            }
            return {
                code: 200,
                msg: 'success',
                data: filtered,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Get risk list error:', error);
            return {
                code: 500,
                msg: error.message || '获取风险列表失败',
                data: [],
            };
        }
    }
    async getRiskStatistics(salesId) {
        console.log('[ChurnWarning] Get statistics:', { salesId });
        try {
            const stats = await this.churnWarningService.getRiskStatistics(salesId);
            return {
                code: 200,
                msg: 'success',
                data: stats,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Get statistics error:', error);
            return {
                code: 500,
                msg: error.message || '获取统计失败',
                data: null,
            };
        }
    }
    async getCustomerAssessment(customerId) {
        console.log('[ChurnWarning] Get assessment:', customerId);
        try {
            const assessment = await this.churnWarningService.assessCustomerRisk(customerId);
            return {
                code: 200,
                msg: 'success',
                data: assessment,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Get assessment error:', error);
            return {
                code: 500,
                msg: error.message || '获取评估失败',
                data: null,
            };
        }
    }
    async generateReport(salesId) {
        console.log('[ChurnWarning] Generate report:', { salesId });
        try {
            const report = await this.churnWarningService.generateWarningReport(salesId);
            return {
                code: 200,
                msg: 'success',
                data: report,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Generate report error:', error);
            return {
                code: 500,
                msg: error.message || '生成报告失败',
                data: null,
            };
        }
    }
    async updateConfig(config) {
        console.log('[ChurnWarning] Update config:', config);
        try {
            this.churnWarningService.updateConfig(config);
            return {
                code: 200,
                msg: '配置更新成功',
                data: this.churnWarningService.getConfig(),
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Update config error:', error);
            return {
                code: 500,
                msg: error.message || '更新配置失败',
                data: null,
            };
        }
    }
    async getConfig() {
        return {
            code: 200,
            msg: 'success',
            data: this.churnWarningService.getConfig(),
        };
    }
    async createHandleRecord(body, req) {
        console.log('[ChurnWarning] Create handle record:', body);
        try {
            const user = req.user;
            if (!user) {
                return {
                    code: 401,
                    msg: '未登录',
                    data: null,
                };
            }
            const record = {
                customer_id: body.customer_id,
                customer_name: body.customer_name,
                risk_level: body.risk_level,
                risk_score: body.risk_score,
                handled_by: user.userId,
                handler_name: user.username || user.name || '未知',
                handle_action: body.handle_action,
                handle_result: body.handle_result,
                handle_notes: body.handle_notes,
                follow_up_date: body.follow_up_date,
            };
            const result = await this.churnWarningService.createHandleRecord(record);
            return {
                code: 200,
                msg: '处理记录创建成功',
                data: result,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Create handle record error:', error);
            return {
                code: 500,
                msg: error.message || '创建处理记录失败',
                data: null,
            };
        }
    }
    async getHandleRecords(customerId, handlerId, riskLevel, handleResult, startDate, endDate, limit, offset) {
        console.log('[ChurnWarning] Get handle records:', { customerId, handlerId, riskLevel, handleResult });
        try {
            const result = await this.churnWarningService.getHandleRecords({
                customerId,
                handlerId,
                riskLevel,
                handleResult,
                startDate,
                endDate,
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
            console.error('[ChurnWarning] Get handle records error:', error);
            return {
                code: 500,
                msg: error.message || '获取处理记录失败',
                data: { records: [], total: 0 },
            };
        }
    }
    async updateHandleRecord(recordId, updates) {
        console.log('[ChurnWarning] Update handle record:', recordId, updates);
        try {
            const success = await this.churnWarningService.updateHandleRecord(recordId, updates);
            return {
                code: success ? 200 : 500,
                msg: success ? '更新成功' : '更新失败',
                data: null,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Update handle record error:', error);
            return {
                code: 500,
                msg: error.message || '更新处理记录失败',
                data: null,
            };
        }
    }
    async getHandleResultStats(handlerId, startDate, endDate) {
        console.log('[ChurnWarning] Get handle result stats:', { handlerId, startDate, endDate });
        try {
            const stats = await this.churnWarningService.getHandleResultStats({
                handlerId,
                startDate,
                endDate,
            });
            return {
                code: 200,
                msg: 'success',
                data: stats,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Get handle result stats error:', error);
            return {
                code: 500,
                msg: error.message || '获取效果分析失败',
                data: null,
            };
        }
    }
    async getHandlerRanking(limit) {
        console.log('[ChurnWarning] Get handler ranking:', { limit });
        try {
            const rankings = await this.churnWarningService.getHandlerRanking(limit ? parseInt(limit) : 10);
            return {
                code: 200,
                msg: 'success',
                data: rankings,
            };
        }
        catch (error) {
            console.error('[ChurnWarning] Get handler ranking error:', error);
            return {
                code: 500,
                msg: error.message || '获取排行榜失败',
                data: [],
            };
        }
    }
};
exports.ChurnWarningController = ChurnWarningController;
__decorate([
    (0, common_1.Get)('risk-list'),
    __param(0, (0, common_1.Query)('salesId')),
    __param(1, (0, common_1.Query)('riskLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "getRiskList", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Query)('salesId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "getRiskStatistics", null);
__decorate([
    (0, common_1.Get)(':id/assessment'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "getCustomerAssessment", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('salesId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Post)('config'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('handle'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "createHandleRecord", null);
__decorate([
    (0, common_1.Get)('handle-records'),
    __param(0, (0, common_1.Query)('customerId')),
    __param(1, (0, common_1.Query)('handlerId')),
    __param(2, (0, common_1.Query)('riskLevel')),
    __param(3, (0, common_1.Query)('handleResult')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "getHandleRecords", null);
__decorate([
    (0, common_1.Put)('handle/:id'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "updateHandleRecord", null);
__decorate([
    (0, common_1.Get)('analysis/stats'),
    __param(0, (0, common_1.Query)('handlerId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "getHandleResultStats", null);
__decorate([
    (0, common_1.Get)('analysis/ranking'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChurnWarningController.prototype, "getHandlerRanking", null);
exports.ChurnWarningController = ChurnWarningController = __decorate([
    (0, common_1.Controller)('customers/churn-warning'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __metadata("design:paramtypes", [churn_warning_service_1.ChurnWarningService])
], ChurnWarningController);
//# sourceMappingURL=churn-warning.controller.js.map