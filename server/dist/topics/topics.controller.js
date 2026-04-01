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
exports.TopicsController = void 0;
const common_1 = require("@nestjs/common");
const topics_service_1 = require("./topics.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let TopicsController = class TopicsController {
    constructor(topicsService) {
        this.topicsService = topicsService;
    }
    async getAll(req, query) {
        console.log('=== 获取选题列表 ===');
        console.log('用户ID:', req.user.id);
        console.log('查询参数:', query);
        const result = await this.topicsService.getAll(req.user.id, query);
        return {
            code: 200,
            msg: 'success',
            data: result,
        };
    }
    async getStatistics(req) {
        console.log('=== 获取选题统计 ===');
        console.log('用户ID:', req.user.id);
        const statistics = await this.topicsService.getStatistics(req.user.id);
        return {
            code: 200,
            msg: 'success',
            data: statistics,
        };
    }
    async getById(req, id) {
        console.log('=== 获取选题详情 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题ID:', id);
        const topic = await this.topicsService.getById(req.user.id, id);
        return {
            code: 200,
            msg: 'success',
            data: topic,
        };
    }
    async create(req, dto) {
        try {
            console.log('=== 创建选题 ===');
            console.log('用户ID:', req.user.id);
            console.log('选题数据:', dto);
            const topic = await this.topicsService.create(req.user.id, dto);
            return {
                code: 200,
                msg: '创建成功',
                data: topic,
            };
        }
        catch (error) {
            console.error('[TopicsController] 创建选题失败:', error);
            return {
                code: 500,
                msg: error.message || '创建失败',
                data: null,
            };
        }
    }
    async update(req, id, dto) {
        console.log('=== 更新选题 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题ID:', id);
        console.log('更新数据:', dto);
        const topic = await this.topicsService.update(req.user.id, id, dto);
        return {
            code: 200,
            msg: '更新成功',
            data: topic,
        };
    }
    async delete(req, id) {
        console.log('=== 删除选题 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题ID:', id);
        await this.topicsService.delete(req.user.id, id);
        return {
            code: 200,
            msg: '删除成功',
            data: null,
        };
    }
    async analyzeWithAI(req, id) {
        console.log('=== AI分析选题 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题ID:', id);
        const analysis = await this.topicsService.analyzeWithAI(req.user.id, id);
        return {
            code: 200,
            msg: '分析完成',
            data: analysis,
        };
    }
    async batchUpdateStatus(req, body) {
        console.log('=== 批量更新状态 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题IDs:', body.ids);
        console.log('新状态:', body.status);
        await this.topicsService.batchUpdateStatus(req.user.id, body.ids, body.status);
        return {
            code: 200,
            msg: '批量更新成功',
            data: null,
        };
    }
};
exports.TopicsController = TopicsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/analyze'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "analyzeWithAI", null);
__decorate([
    (0, common_1.Post)('batch/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TopicsController.prototype, "batchUpdateStatus", null);
exports.TopicsController = TopicsController = __decorate([
    (0, common_1.Controller)('topics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [topics_service_1.TopicsService])
], TopicsController);
//# sourceMappingURL=topics.controller.js.map