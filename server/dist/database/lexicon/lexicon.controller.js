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
exports.LexiconController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const lexicon_service_1 = require("./lexicon.service");
const active_user_guard_1 = require("../../guards/active-user.guard");
const optional_auth_guard_1 = require("../../guards/optional-auth.guard");
const admin_guard_1 = require("../../guards/admin.guard");
const uuid_util_1 = require("../../utils/uuid.util");
let LexiconController = class LexiconController {
    constructor(lexiconService) {
        this.lexiconService = lexiconService;
    }
    async getAll(req, category, type, product_id, targetUserId, page, pageSize, search, viewAll) {
        try {
            if (!req.user) {
                return {
                    code: 200,
                    msg: 'success',
                    data: {
                        list: [],
                        pagination: {
                            page: page || 1,
                            pageSize: pageSize || 20,
                            total: 0,
                            totalPages: 0,
                        }
                    }
                };
            }
            const currentUserId = req.user.sub;
            const validatedTargetUserId = (0, uuid_util_1.parseOptionalUUID)(targetUserId, 'userId');
            const data = await this.lexiconService.getAll(currentUserId, category, type, product_id, validatedTargetUserId, page, pageSize, search, viewAll === 'true');
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async getById(req, id) {
        try {
            if (!req.user) {
                return { code: 200, msg: 'success', data: null };
            }
            const currentUserId = req.user.sub;
            const data = await this.lexiconService.getById(currentUserId, id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async create(req, body) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.create(userId, body);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async update(req, id, body) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.update(userId, id, body);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async delete(req, id) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.delete(userId, id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async uploadFile(req, file) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.uploadFile(userId, file);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async speechToText(req, body) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.speechToText(userId, body.audioUrl);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async correctText(req, body) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.correctText(userId, body.text);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async generateProfile(req, body) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.generateProfile(userId, body.type);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async optimize(req, body) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.optimize(userId, body.inputText, body.lexiconIds);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async shareLexicon(req, id, body) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.shareLexicon(userId, id, body.shareScope, body.sharedWithUsers);
            return { code: 200, msg: '共享成功', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async unshareLexicon(req, id) {
        try {
            const userId = req.user.sub;
            await this.lexiconService.unshareLexicon(userId, id);
            return { code: 200, msg: '取消共享成功', data: null };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async getSharedWithMe(req, page, pageSize) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.getSharedWithMe(userId, page, pageSize);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async getMySharedLexicons(req, page, pageSize) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.getMySharedLexicons(userId, page, pageSize);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async getShareHistory(req, lexiconId, page, pageSize) {
        try {
            const userId = req.user.sub;
            const data = await this.lexiconService.getShareHistory(userId, lexiconId, page, pageSize);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
};
exports.LexiconController = LexiconController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('product_id')),
    __param(4, (0, common_1.Query)('userId')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('pageSize')),
    __param(7, (0, common_1.Query)('search')),
    __param(8, (0, common_1.Query)('viewAll')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('upload-file'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('speech-to-text'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "speechToText", null);
__decorate([
    (0, common_1.Post)('correct-text'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "correctText", null);
__decorate([
    (0, common_1.Post)('generate-profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "generateProfile", null);
__decorate([
    (0, common_1.Post)('optimize'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "optimize", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "shareLexicon", null);
__decorate([
    (0, common_1.Delete)(':id/share'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "unshareLexicon", null);
__decorate([
    (0, common_1.Get)('shared/me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "getSharedWithMe", null);
__decorate([
    (0, common_1.Get)('shared/my'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "getMySharedLexicons", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Get)('share-history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('lexiconId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], LexiconController.prototype, "getShareHistory", null);
exports.LexiconController = LexiconController = __decorate([
    (0, common_1.Controller)('lexicon'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __metadata("design:paramtypes", [lexicon_service_1.LexiconService])
], LexiconController);
//# sourceMappingURL=lexicon.controller.js.map