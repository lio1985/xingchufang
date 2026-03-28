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
exports.KnowledgeShareController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const storage_service_1 = require("../storage/storage.service");
const knowledge_share_service_1 = require("./knowledge-share.service");
let KnowledgeShareController = class KnowledgeShareController {
    constructor(knowledgeShareService, storageService) {
        this.knowledgeShareService = knowledgeShareService;
        this.storageService = storageService;
    }
    async findAll(req, keyword) {
        try {
            const data = await this.knowledgeShareService.findAll(req.user.id, keyword);
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
                data: [],
            };
        }
    }
    async findOne(id, req) {
        try {
            const data = await this.knowledgeShareService.findOne(id, req.user.id);
            return {
                code: 200,
                msg: '获取成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 404,
                msg: error.message || '获取失败',
                data: null,
            };
        }
    }
    async create(body, req) {
        try {
            const data = await this.knowledgeShareService.create(req.user.id, body);
            return {
                code: 200,
                msg: '创建成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '创建失败',
                data: null,
            };
        }
    }
    async update(id, body, req) {
        try {
            const data = await this.knowledgeShareService.update(id, req.user.id, body);
            return {
                code: 200,
                msg: '更新成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '更新失败',
                data: null,
            };
        }
    }
    async remove(id, req) {
        try {
            const data = await this.knowledgeShareService.remove(id, req.user.id);
            return {
                code: 200,
                msg: '删除成功',
                data,
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
    async like(id, req) {
        try {
            const data = await this.knowledgeShareService.like(id, req.user.id);
            return {
                code: 200,
                msg: '点赞成功',
                data,
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: error.message || '点赞失败',
                data: null,
            };
        }
    }
    async findByUserId(req, page, pageSize) {
        try {
            const data = await this.knowledgeShareService.findByUserId(req.user.id, page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 20);
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
    async findAllForAdmin(req, page, pageSize) {
        try {
            const data = await this.knowledgeShareService.findAllForAdmin(req.user.id, page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 20);
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
    async uploadAttachment(file) {
        try {
            if (!file) {
                return {
                    code: 400,
                    msg: '文件不能为空',
                    data: null,
                };
            }
            const maxSize = 100 * 1024 * 1024;
            if (file.size > maxSize) {
                return {
                    code: 400,
                    msg: `文件大小不能超过 ${maxSize / (1024 * 1024)}MB`,
                    data: null,
                };
            }
            console.log('上传文件信息:', {
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
            });
            const fileType = this.getFileType(file.mimetype);
            if (!fileType) {
                return {
                    code: 400,
                    msg: '不支持的文件类型',
                    data: null,
                };
            }
            const fileKey = await this.storageService.uploadFile(file.buffer, file.originalname, file.mimetype);
            const fileUrl = await this.storageService.generatePresignedUrl(fileKey, 86400);
            return {
                code: 200,
                msg: '上传成功',
                data: {
                    fileKey,
                    fileUrl,
                    fileName: file.originalname,
                    fileType,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                },
            };
        }
        catch (error) {
            console.error('文件上传失败:', error);
            return {
                code: 500,
                msg: error.message || '上传失败',
                data: null,
            };
        }
    }
    async getFileUrl(body) {
        try {
            const { fileKey } = body;
            if (!fileKey) {
                return {
                    code: 400,
                    msg: '文件 key 不能为空',
                    data: null,
                };
            }
            const fileUrl = await this.storageService.generatePresignedUrl(fileKey, 86400);
            return {
                code: 200,
                msg: '获取成功',
                data: {
                    fileKey,
                    fileUrl,
                },
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
    getFileType(mimetype) {
        if (mimetype.startsWith('image/')) {
            return 'image';
        }
        else if (mimetype.startsWith('audio/')) {
            return 'audio';
        }
        else if (mimetype.startsWith('video/')) {
            return 'video';
        }
        else if (mimetype === 'application/pdf' ||
            mimetype.includes('document') ||
            mimetype.includes('spreadsheet') ||
            mimetype.includes('presentation')) {
            return 'document';
        }
        else if (mimetype === 'text/plain' ||
            mimetype === 'text/markdown') {
            return 'document';
        }
        return null;
    }
};
exports.KnowledgeShareController = KnowledgeShareController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "like", null);
__decorate([
    (0, common_1.Get)('my/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "findAllForAdmin", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "uploadAttachment", null);
__decorate([
    (0, common_1.Post)('file-url'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeShareController.prototype, "getFileUrl", null);
exports.KnowledgeShareController = KnowledgeShareController = __decorate([
    (0, common_1.Controller)('knowledge-shares'),
    __metadata("design:paramtypes", [knowledge_share_service_1.KnowledgeShareService,
        storage_service_1.StorageService])
], KnowledgeShareController);
//# sourceMappingURL=knowledge-share.controller.js.map