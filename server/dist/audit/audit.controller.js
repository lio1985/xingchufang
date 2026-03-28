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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const admin_guard_1 = require("../guards/admin.guard");
const active_user_guard_1 = require("../guards/active-user.guard");
const uuid_util_1 = require("../utils/uuid.util");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getLogs(req, userId, operation, resourceType, resourceId, status, startDate, endDate, page, pageSize) {
        try {
            const validatedUserId = (0, uuid_util_1.parseOptionalUUID)(userId, 'userId');
            const result = await this.auditService.getLogs({
                userId: validatedUserId,
                operation,
                resourceType,
                resourceId,
                status: status,
                startDate,
                endDate,
                page: page ? parseInt(page) : undefined,
                pageSize: pageSize ? parseInt(pageSize) : undefined,
            });
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('查询操作日志失败:', error);
            return {
                code: 500,
                msg: '查询操作日志失败',
                data: null,
            };
        }
    }
    async getMyLogs(req, startDate, endDate, page, pageSize) {
        try {
            const userId = req.user.sub;
            const result = await this.auditService.getUserLogs(userId, {
                startDate,
                endDate,
                page: page ? parseInt(page) : undefined,
                pageSize: pageSize ? parseInt(pageSize) : undefined,
            });
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('获取用户操作记录失败:', error);
            return {
                code: 500,
                msg: '获取用户操作记录失败',
                data: null,
            };
        }
    }
    async getStatistics(startDate, endDate) {
        try {
            const statistics = await this.auditService.getStatistics({
                startDate,
                endDate,
            });
            return {
                code: 200,
                msg: 'success',
                data: statistics,
            };
        }
        catch (error) {
            console.error('获取操作统计失败:', error);
            return {
                code: 500,
                msg: '获取操作统计失败',
                data: null,
            };
        }
    }
    async getUserLogs(userId, startDate, endDate, page, pageSize) {
        try {
            const result = await this.auditService.getUserLogs(userId, {
                startDate,
                endDate,
                page: page ? parseInt(page) : undefined,
                pageSize: pageSize ? parseInt(pageSize) : undefined,
            });
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('获取用户操作记录失败:', error);
            return {
                code: 500,
                msg: '获取用户操作记录失败',
                data: null,
            };
        }
    }
    async getResourceHistory(resourceType, resourceId) {
        try {
            const logs = await this.auditService.getResourceHistory(resourceType, resourceId);
            return {
                code: 200,
                msg: 'success',
                data: logs,
            };
        }
        catch (error) {
            console.error('获取资源操作历史失败:', error);
            return {
                code: 500,
                msg: '获取资源操作历史失败',
                data: null,
            };
        }
    }
    async deleteLog(logId) {
        try {
            await this.auditService.deleteLogs(logId);
            return {
                code: 200,
                msg: '删除成功',
                data: null,
            };
        }
        catch (error) {
            console.error('删除操作日志失败:', error);
            return {
                code: 500,
                msg: '删除操作日志失败',
                data: null,
            };
        }
    }
    async deleteLogsByDateRange(startDate, endDate) {
        try {
            const count = await this.auditService.deleteLogsByDateRange(startDate, endDate);
            return {
                code: 200,
                msg: `删除成功，共删除 ${count} 条记录`,
                data: { count },
            };
        }
        catch (error) {
            console.error('批量删除操作日志失败:', error);
            return {
                code: 500,
                msg: '批量删除操作日志失败',
                data: null,
            };
        }
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('logs'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('operation')),
    __param(3, (0, common_1.Query)('resourceType')),
    __param(4, (0, common_1.Query)('resourceId')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('my-logs'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getMyLogs", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('users/:userId/logs'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserLogs", null);
__decorate([
    (0, common_1.Get)('resources/:resourceType/:resourceId/history'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('resourceType')),
    __param(1, (0, common_1.Param)('resourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getResourceHistory", null);
__decorate([
    (0, common_1.Delete)('logs/:logId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('logId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "deleteLog", null);
__decorate([
    (0, common_1.Delete)('logs'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "deleteLogsByDateRange", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map