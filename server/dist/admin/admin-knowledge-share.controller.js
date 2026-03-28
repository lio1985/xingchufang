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
exports.AdminKnowledgeShareController = void 0;
const common_1 = require("@nestjs/common");
const admin_guard_1 = require("../guards/admin.guard");
const admin_knowledge_share_service_1 = require("./admin-knowledge-share.service");
let AdminKnowledgeShareController = class AdminKnowledgeShareController {
    constructor(adminKnowledgeShareService) {
        this.adminKnowledgeShareService = adminKnowledgeShareService;
    }
    async findAll(page = '1', pageSize = '20', keyword, category, status, authorId, startDate, endDate, attachmentType, sortBy = 'createdAt', sortOrder = 'desc') {
        try {
            const data = await this.adminKnowledgeShareService.findAll({
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                keyword,
                category,
                status,
                authorId,
                startDate,
                endDate,
                attachmentType,
                sortBy,
                sortOrder
            });
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async remove(id) {
        try {
            await this.adminKnowledgeShareService.remove(id);
            return {
                code: 200,
                msg: '删除成功',
                data: null,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '删除失败',
                data: null,
            };
        }
    }
    async batchRemove(body) {
        try {
            const result = await this.adminKnowledgeShareService.batchRemove(body.ids);
            return {
                code: 200,
                msg: `成功删除 ${result.successCount} 条知识分享`,
                data: result,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '删除失败',
                data: null,
            };
        }
    }
    async feature(id, body) {
        try {
            await this.adminKnowledgeShareService.feature(id, body.isFeatured);
            return {
                code: 200,
                msg: '操作成功',
                data: null,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '操作失败',
                data: null,
            };
        }
    }
    async getSummary() {
        try {
            const data = await this.adminKnowledgeShareService.getSummary();
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getStats() {
        try {
            const data = await this.adminKnowledgeShareService.getStats();
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getTrend(days = '7') {
        try {
            const data = await this.adminKnowledgeShareService.getTrend(parseInt(days));
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getTop(type = 'view', limit = '10') {
        try {
            const data = await this.adminKnowledgeShareService.getTop(type, parseInt(limit));
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getTopAuthors(limit = '10') {
        try {
            const data = await this.adminKnowledgeShareService.getTopAuthors(parseInt(limit));
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async getPending(page = '1', pageSize = '20') {
        try {
            const data = await this.adminKnowledgeShareService.getPending({
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            });
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async approve(id, req) {
        try {
            const userId = req.user?.id;
            await this.adminKnowledgeShareService.approve(id, userId);
            return {
                code: 200,
                msg: '审核通过',
                data: null,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '操作失败',
                data: null,
            };
        }
    }
    async reject(id, body, req) {
        try {
            const userId = req.user?.id;
            await this.adminKnowledgeShareService.reject(id, body.reason, userId);
            return {
                code: 200,
                msg: '驳回成功',
                data: null,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '操作失败',
                data: null,
            };
        }
    }
    async getTimeAnalysis(days = '30') {
        try {
            const data = await this.adminKnowledgeShareService.getTimeAnalysis(parseInt(days));
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async batchExport(body) {
        try {
            const data = await this.adminKnowledgeShareService.batchExport(body.ids);
            return {
                code: 200,
                msg: '导出成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '导出失败',
                data: null,
            };
        }
    }
    async exportReport() {
        try {
            const data = await this.adminKnowledgeShareService.exportReport();
            return {
                code: 200,
                msg: '导出成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '导出失败',
                data: null,
            };
        }
    }
};
exports.AdminKnowledgeShareController = AdminKnowledgeShareController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('authorId')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __param(8, (0, common_1.Query)('attachmentType')),
    __param(9, (0, common_1.Query)('sortBy')),
    __param(10, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('batch-delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "batchRemove", null);
__decorate([
    (0, common_1.Post)(':id/feature'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "feature", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('trend'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "getTrend", null);
__decorate([
    (0, common_1.Get)('top'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "getTop", null);
__decorate([
    (0, common_1.Get)('authors/top'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "getTopAuthors", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "getPending", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('time-analysis'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "getTimeAnalysis", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "batchExport", null);
__decorate([
    (0, common_1.Post)('export-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminKnowledgeShareController.prototype, "exportReport", null);
exports.AdminKnowledgeShareController = AdminKnowledgeShareController = __decorate([
    (0, common_1.Controller)('admin/knowledge-shares'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_knowledge_share_service_1.AdminKnowledgeShareService])
], AdminKnowledgeShareController);
//# sourceMappingURL=admin-knowledge-share.controller.js.map