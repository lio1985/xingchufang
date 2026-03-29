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
exports.KnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const knowledge_service_1 = require("./knowledge.service");
let KnowledgeController = class KnowledgeController {
    constructor(knowledgeService) {
        this.knowledgeService = knowledgeService;
    }
    async getCategories(req) {
        const data = await this.knowledgeService.getCategories();
        return {
            code: 200,
            msg: '获取成功',
            data,
        };
    }
    async createCategory(req, body) {
        const userId = req.user.id;
        const data = await this.knowledgeService.createCategory(userId, body);
        return {
            code: 200,
            msg: '创建成功',
            data,
        };
    }
    async updateCategory(req, id, body) {
        const userId = req.user.id;
        const data = await this.knowledgeService.updateCategory(userId, id, body);
        return {
            code: 200,
            msg: '更新成功',
            data,
        };
    }
    async deleteCategory(req, id) {
        const userId = req.user.id;
        await this.knowledgeService.deleteCategory(userId, id);
        return {
            code: 200,
            msg: '删除成功',
            data: null,
        };
    }
    async getArticles(req, categoryId, keyword, page, pageSize) {
        const data = await this.knowledgeService.getArticles(categoryId, keyword || '', page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 20);
        return {
            code: 200,
            msg: '获取成功',
            data,
        };
    }
    async getArticleDetail(req, id) {
        const data = await this.knowledgeService.getArticleById(id);
        return {
            code: 200,
            msg: '获取成功',
            data,
        };
    }
    async createArticle(req, body) {
        const userId = req.user.id;
        const data = await this.knowledgeService.createArticle(userId, body);
        return {
            code: 200,
            msg: '创建成功',
            data,
        };
    }
    async updateArticle(req, id, body) {
        const userId = req.user.id;
        const data = await this.knowledgeService.updateArticle(userId, id, body);
        return {
            code: 200,
            msg: '更新成功',
            data,
        };
    }
    async deleteArticle(req, id) {
        const userId = req.user.id;
        await this.knowledgeService.deleteArticle(userId, id);
        return {
            code: 200,
            msg: '删除成功',
            data: null,
        };
    }
    async getCompanyStats(req) {
        const data = await this.knowledgeService.getCompanyStats();
        return {
            code: 200,
            msg: '获取成功',
            data,
        };
    }
    async getKnowledgeStats(req) {
        const userId = req.user.id;
        const data = await this.knowledgeService.getKnowledgeStats(userId);
        return {
            code: 200,
            msg: '获取成功',
            data,
        };
    }
    async searchKnowledge(req, keyword, sources, limit) {
        const userId = req.user.id;
        const sourceList = sources ? sources.split(',') : ['lexicon', 'knowledge_share', 'product_manual', 'design_knowledge'];
        const data = await this.knowledgeService.searchAllKnowledge(userId, keyword || '', sourceList, limit ? parseInt(limit) : 20);
        return {
            code: 200,
            msg: '搜索成功',
            data,
        };
    }
    async getKnowledgeList(req, type, keyword, page, pageSize) {
        const userId = req.user.id;
        const data = await this.knowledgeService.getKnowledgeByType(userId, type, keyword || '', page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 20);
        return {
            code: 200,
            msg: '获取成功',
            data,
        };
    }
    async getKnowledgeByIds(req, ids, types) {
        const userId = req.user.id;
        const idList = ids.split(',');
        const typeList = types.split(',');
        const data = await this.knowledgeService.getKnowledgeByIds(userId, idList, typeList);
        return {
            code: 200,
            msg: '获取成功',
            data,
        };
    }
};
exports.KnowledgeController = KnowledgeController;
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('articles'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getArticles", null);
__decorate([
    (0, common_1.Get)('articles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getArticleDetail", null);
__decorate([
    (0, common_1.Post)('articles'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "createArticle", null);
__decorate([
    (0, common_1.Put)('articles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "updateArticle", null);
__decorate([
    (0, common_1.Delete)('articles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "deleteArticle", null);
__decorate([
    (0, common_1.Get)('company-stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getCompanyStats", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getKnowledgeStats", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('keyword')),
    __param(2, (0, common_1.Query)('sources')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "searchKnowledge", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getKnowledgeList", null);
__decorate([
    (0, common_1.Get)('batch'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('ids')),
    __param(2, (0, common_1.Query)('types')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getKnowledgeByIds", null);
exports.KnowledgeController = KnowledgeController = __decorate([
    (0, common_1.Controller)('knowledge'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [knowledge_service_1.KnowledgeService])
], KnowledgeController);
//# sourceMappingURL=knowledge.controller.js.map