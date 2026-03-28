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
exports.DataExportController = void 0;
const common_1 = require("@nestjs/common");
const data_export_service_1 = require("./data-export.service");
const active_user_guard_1 = require("../guards/active-user.guard");
let DataExportController = class DataExportController {
    constructor(dataExportService) {
        this.dataExportService = dataExportService;
    }
    async getScopeOptions(req) {
        const userId = req.user.id;
        const options = await this.dataExportService.getAvailableScopeOptions(userId);
        return {
            code: 200,
            msg: 'success',
            data: options,
        };
    }
    async getAvailableTeams(req) {
        const userId = req.user.id;
        const teams = await this.dataExportService.getAvailableTeams(userId);
        return {
            code: 200,
            msg: 'success',
            data: teams,
        };
    }
    async createExportTask(req, body) {
        try {
            const userId = req.user.id;
            const task = await this.dataExportService.createExportTask(userId, body);
            return {
                code: 200,
                msg: '导出任务创建成功',
                data: task,
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message || '创建导出任务失败',
                data: null,
            };
        }
    }
    async getExportTaskStatus(req, taskId) {
        try {
            const userId = req.user.id;
            const task = await this.dataExportService.getExportTaskStatus(taskId, userId);
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message || '获取导出任务状态失败',
                data: null,
            };
        }
    }
    async getExportHistory(req, page, pageSize) {
        try {
            const userId = req.user.id;
            const tasks = await this.dataExportService.getExportHistory(userId, page ? parseInt(page.toString()) : 1, pageSize ? parseInt(pageSize.toString()) : 20);
            return {
                code: 200,
                msg: 'success',
                data: tasks,
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message || '获取导出历史失败',
                data: null,
            };
        }
    }
    async getExportStats(req) {
        try {
            const userId = req.user.id;
            const stats = await this.dataExportService.getExportStats(userId);
            return {
                code: 200,
                msg: 'success',
                data: stats,
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message || '获取导出统计失败',
                data: null,
            };
        }
    }
    async downloadExportFile(req, taskId) {
        try {
            const userId = req.user.id;
            const result = await this.dataExportService.downloadExportFile(taskId, userId);
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message || '获取下载链接失败',
                data: null,
            };
        }
    }
};
exports.DataExportController = DataExportController;
__decorate([
    (0, common_1.Get)('scope-options'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataExportController.prototype, "getScopeOptions", null);
__decorate([
    (0, common_1.Get)('teams'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataExportController.prototype, "getAvailableTeams", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DataExportController.prototype, "createExportTask", null);
__decorate([
    (0, common_1.Get)('task/:taskId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DataExportController.prototype, "getExportTaskStatus", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], DataExportController.prototype, "getExportHistory", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataExportController.prototype, "getExportStats", null);
__decorate([
    (0, common_1.Get)('download/:taskId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DataExportController.prototype, "downloadExportFile", null);
exports.DataExportController = DataExportController = __decorate([
    (0, common_1.Controller)('data-export'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __metadata("design:paramtypes", [data_export_service_1.DataExportService])
], DataExportController);
//# sourceMappingURL=data-export.controller.js.map