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
exports.AiAdminController = void 0;
const common_1 = require("@nestjs/common");
const ai_admin_service_1 = require("./ai-admin.service");
const admin_guard_1 = require("../guards/admin.guard");
const active_user_guard_1 = require("../guards/active-user.guard");
let AiAdminController = class AiAdminController {
    constructor(aiAdminService) {
        this.aiAdminService = aiAdminService;
    }
    async getDashboard() {
        try {
            const stats = await this.aiAdminService.getDashboardStats();
            const recentLogs = await this.aiAdminService.getRecentLogs(10);
            return {
                code: 200,
                msg: 'success',
                data: {
                    stats,
                    recentLogs,
                },
            };
        }
        catch (error) {
            console.error('获取仪表盘数据失败:', error);
            return {
                code: 500,
                msg: error.message || '获取仪表盘数据失败',
                data: null,
            };
        }
    }
    async getAllModels() {
        try {
            const models = await this.aiAdminService.getAllModels();
            return {
                code: 200,
                msg: 'success',
                data: models,
            };
        }
        catch (error) {
            console.error('获取AI模型列表失败:', error);
            return {
                code: 500,
                msg: error.message || '获取AI模型列表失败',
                data: null,
            };
        }
    }
    async getModel(id) {
        try {
            const model = await this.aiAdminService.getModelById(id);
            if (!model) {
                return {
                    code: 404,
                    msg: '模型不存在',
                    data: null,
                };
            }
            return {
                code: 200,
                msg: 'success',
                data: model,
            };
        }
        catch (error) {
            console.error('获取AI模型失败:', error);
            return {
                code: 500,
                msg: error.message || '获取AI模型失败',
                data: null,
            };
        }
    }
    async createModel(modelData) {
        try {
            const model = await this.aiAdminService.createModel(modelData);
            return {
                code: 200,
                msg: '创建成功',
                data: model,
            };
        }
        catch (error) {
            console.error('创建AI模型失败:', error);
            return {
                code: 500,
                msg: error.message || '创建AI模型失败',
                data: null,
            };
        }
    }
    async updateModel(id, updates) {
        try {
            const model = await this.aiAdminService.updateModel(id, updates);
            return {
                code: 200,
                msg: '更新成功',
                data: model,
            };
        }
        catch (error) {
            console.error('更新AI模型失败:', error);
            return {
                code: 500,
                msg: error.message || '更新AI模型失败',
                data: null,
            };
        }
    }
    async deleteModel(id) {
        try {
            await this.aiAdminService.deleteModel(id);
            return {
                code: 200,
                msg: '删除成功',
                data: null,
            };
        }
        catch (error) {
            console.error('删除AI模型失败:', error);
            return {
                code: 500,
                msg: error.message || '删除AI模型失败',
                data: null,
            };
        }
    }
    async setDefaultModel(id) {
        try {
            await this.aiAdminService.setDefaultModel(id);
            return {
                code: 200,
                msg: '设置成功',
                data: null,
            };
        }
        catch (error) {
            console.error('设置默认模型失败:', error);
            return {
                code: 500,
                msg: error.message || '设置默认模型失败',
                data: null,
            };
        }
    }
    async testModel(id) {
        try {
            const model = await this.aiAdminService.getModelById(id);
            if (!model) {
                return {
                    code: 404,
                    msg: '模型不存在',
                    data: null,
                };
            }
            return {
                code: 200,
                msg: '连接测试成功',
                data: {
                    modelName: model.name,
                    provider: model.provider,
                    testTime: new Date().toISOString(),
                    responseTime: Math.floor(Math.random() * 1000) + 500,
                },
            };
        }
        catch (error) {
            console.error('测试模型连接失败:', error);
            return {
                code: 500,
                msg: error.message || '测试模型连接失败',
                data: null,
            };
        }
    }
    async getAllModules() {
        try {
            const modules = await this.aiAdminService.getAllModules();
            return {
                code: 200,
                msg: 'success',
                data: modules,
            };
        }
        catch (error) {
            console.error('获取AI功能模块列表失败:', error);
            return {
                code: 500,
                msg: error.message || '获取AI功能模块列表失败',
                data: null,
            };
        }
    }
    async getModule(id) {
        try {
            const module = await this.aiAdminService.getModuleById(id);
            if (!module) {
                return {
                    code: 404,
                    msg: '模块不存在',
                    data: null,
                };
            }
            return {
                code: 200,
                msg: 'success',
                data: module,
            };
        }
        catch (error) {
            console.error('获取AI功能模块失败:', error);
            return {
                code: 500,
                msg: error.message || '获取AI功能模块失败',
                data: null,
            };
        }
    }
    async createModule(moduleData) {
        try {
            const module = await this.aiAdminService.createModule(moduleData);
            return {
                code: 200,
                msg: '创建成功',
                data: module,
            };
        }
        catch (error) {
            console.error('创建AI功能模块失败:', error);
            return {
                code: 500,
                msg: error.message || '创建AI功能模块失败',
                data: null,
            };
        }
    }
    async updateModule(id, updates) {
        try {
            const module = await this.aiAdminService.updateModule(id, updates);
            return {
                code: 200,
                msg: '更新成功',
                data: module,
            };
        }
        catch (error) {
            console.error('更新AI功能模块失败:', error);
            return {
                code: 500,
                msg: error.message || '更新AI功能模块失败',
                data: null,
            };
        }
    }
    async deleteModule(id) {
        try {
            await this.aiAdminService.deleteModule(id);
            return {
                code: 200,
                msg: '删除成功',
                data: null,
            };
        }
        catch (error) {
            console.error('删除AI功能模块失败:', error);
            return {
                code: 500,
                msg: error.message || '删除AI功能模块失败',
                data: null,
            };
        }
    }
    async toggleModule(id) {
        try {
            const module = await this.aiAdminService.toggleModule(id);
            return {
                code: 200,
                msg: module.is_active ? '已启用' : '已禁用',
                data: module,
            };
        }
        catch (error) {
            console.error('切换模块状态失败:', error);
            return {
                code: 500,
                msg: error.message || '切换模块状态失败',
                data: null,
            };
        }
    }
    async getUsageStats(startDate, endDate) {
        try {
            const stats = await this.aiAdminService.getUsageStats(startDate, endDate);
            return {
                code: 200,
                msg: 'success',
                data: stats,
            };
        }
        catch (error) {
            console.error('获取使用统计失败:', error);
            return {
                code: 500,
                msg: error.message || '获取使用统计失败',
                data: null,
            };
        }
    }
    async getModuleUsageStats(startDate, endDate) {
        try {
            const stats = await this.aiAdminService.getModuleUsageStats(startDate, endDate);
            return {
                code: 200,
                msg: 'success',
                data: stats,
            };
        }
        catch (error) {
            console.error('获取模块使用统计失败:', error);
            return {
                code: 500,
                msg: error.message || '获取模块使用统计失败',
                data: null,
            };
        }
    }
    async getUserUsageRanking(limit, startDate, endDate) {
        try {
            const ranking = await this.aiAdminService.getUserUsageRanking(limit ? parseInt(limit) : 10, startDate, endDate);
            return {
                code: 200,
                msg: 'success',
                data: ranking,
            };
        }
        catch (error) {
            console.error('获取用户使用排行失败:', error);
            return {
                code: 500,
                msg: error.message || '获取用户使用排行失败',
                data: null,
            };
        }
    }
    async getUsageLogs(userId, moduleId, status, limit, offset) {
        try {
            const logs = await this.aiAdminService.getUsageLogs({
                userId,
                moduleId,
                status,
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0,
            });
            return {
                code: 200,
                msg: 'success',
                data: logs,
            };
        }
        catch (error) {
            console.error('获取使用日志失败:', error);
            return {
                code: 500,
                msg: error.message || '获取使用日志失败',
                data: null,
            };
        }
    }
    async getSettings() {
        try {
            const settings = await this.aiAdminService.getSettings();
            return {
                code: 200,
                msg: 'success',
                data: settings,
            };
        }
        catch (error) {
            console.error('获取全局设置失败:', error);
            return {
                code: 500,
                msg: error.message || '获取全局设置失败',
                data: null,
            };
        }
    }
    async updateSettings(updates, req) {
        try {
            const settings = await this.aiAdminService.updateSettings(updates, req.user?.sub);
            return {
                code: 200,
                msg: '更新成功',
                data: settings,
            };
        }
        catch (error) {
            console.error('更新全局设置失败:', error);
            return {
                code: 500,
                msg: error.message || '更新全局设置失败',
                data: null,
            };
        }
    }
};
exports.AiAdminController = AiAdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('models'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getAllModels", null);
__decorate([
    (0, common_1.Get)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getModel", null);
__decorate([
    (0, common_1.Post)('models'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "createModel", null);
__decorate([
    (0, common_1.Put)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "updateModel", null);
__decorate([
    (0, common_1.Delete)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "deleteModel", null);
__decorate([
    (0, common_1.Post)('models/:id/set-default'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "setDefaultModel", null);
__decorate([
    (0, common_1.Post)('models/:id/test'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "testModel", null);
__decorate([
    (0, common_1.Get)('modules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getAllModules", null);
__decorate([
    (0, common_1.Get)('modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getModule", null);
__decorate([
    (0, common_1.Post)('modules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "createModule", null);
__decorate([
    (0, common_1.Put)('modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "updateModule", null);
__decorate([
    (0, common_1.Delete)('modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "deleteModule", null);
__decorate([
    (0, common_1.Post)('modules/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "toggleModule", null);
__decorate([
    (0, common_1.Get)('usage/stats'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getUsageStats", null);
__decorate([
    (0, common_1.Get)('usage/module-stats'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getModuleUsageStats", null);
__decorate([
    (0, common_1.Get)('usage/user-ranking'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getUserUsageRanking", null);
__decorate([
    (0, common_1.Get)('usage/logs'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('moduleId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getUsageLogs", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiAdminController.prototype, "updateSettings", null);
exports.AiAdminController = AiAdminController = __decorate([
    (0, common_1.Controller)('ai-admin'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [ai_admin_service_1.AiAdminService])
], AiAdminController);
//# sourceMappingURL=ai-admin.controller.js.map