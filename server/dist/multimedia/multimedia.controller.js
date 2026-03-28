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
exports.MultimediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multimedia_service_1 = require("./multimedia.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const uuid_util_1 = require("../utils/uuid.util");
let MultimediaController = class MultimediaController {
    constructor(multimediaService) {
        this.multimediaService = multimediaService;
    }
    async uploadFile(file, req, transcribeAudio) {
        try {
            console.log('=== Controller: 上传文件请求 ===');
            console.log('当前用户ID:', req.user?.id);
            console.log('FileName:', file?.originalname);
            console.log('Transcribe Audio:', transcribeAudio);
            if (!file) {
                throw new common_1.BadRequestException('请选择要上传的文件');
            }
            const userId = req.user?.id;
            if (!userId) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const result = await this.multimediaService.uploadFile(userId, file, {
                transcribeAudio: transcribeAudio === 'true',
            });
            console.log('=== Controller: 文件上传成功 ===');
            console.log('ResourceId:', result.id);
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('Controller: 上传文件失败:', error);
            throw new common_1.BadRequestException(error.message || '上传文件失败');
        }
    }
    async getUserResources(req, targetUserId, type, limit, offset) {
        try {
            console.log('=== Controller: 获取资源列表 ===');
            console.log('当前用户ID:', req.user?.id);
            console.log('目标用户ID:', targetUserId);
            console.log('Type:', type);
            const currentUserId = req.user?.id;
            if (!currentUserId) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const validatedTargetUserId = (0, uuid_util_1.parseOptionalUUID)(targetUserId);
            const result = await this.multimediaService.getUserResources(currentUserId, validatedTargetUserId, type, limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
            console.log('=== Controller: 返回资源列表 ===');
            console.log('Total:', result.total);
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('Controller: 获取资源列表失败:', error);
            throw new common_1.BadRequestException(error.message || '获取资源列表失败');
        }
    }
    async getResourceById(resourceId, req) {
        try {
            console.log('=== Controller: 获取资源详情 ===');
            console.log('ResourceId:', resourceId);
            console.log('当前用户ID:', req.user?.id);
            const userId = req.user?.id;
            if (!userId) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const resource = await this.multimediaService.getResourceById(resourceId, userId);
            console.log('=== Controller: 返回资源详情 ===');
            return {
                code: 200,
                msg: 'success',
                data: resource,
            };
        }
        catch (error) {
            console.error('Controller: 获取资源详情失败:', error);
            throw new common_1.BadRequestException(error.message || '获取资源详情失败');
        }
    }
    async deleteResource(resourceId, req) {
        try {
            console.log('=== Controller: 删除资源 ===');
            console.log('ResourceId:', resourceId);
            console.log('当前用户ID:', req.user?.id);
            const userId = req.user?.id;
            if (!userId) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            await this.multimediaService.deleteResource(resourceId, userId);
            console.log('=== Controller: 资源已删除 ===');
            return {
                code: 200,
                msg: 'success',
                data: {
                    message: '资源已删除',
                },
            };
        }
        catch (error) {
            console.error('Controller: 删除资源失败:', error);
            throw new common_1.BadRequestException(error.message || '删除资源失败');
        }
    }
    async transcribeAudio(audioUrl) {
        try {
            console.log('=== Controller: 语音识别请求 ===');
            console.log('AudioUrl:', audioUrl);
            if (!audioUrl) {
                throw new common_1.BadRequestException('音频URL不能为空');
            }
            const text = await this.multimediaService.transcribeAudio(audioUrl);
            console.log('=== Controller: 语音识别完成 ===');
            return {
                code: 200,
                msg: 'success',
                data: {
                    text,
                },
            };
        }
        catch (error) {
            console.error('Controller: 语音识别失败:', error);
            throw new common_1.BadRequestException(error.message || '语音识别失败');
        }
    }
};
exports.MultimediaController = MultimediaController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('transcribeAudio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], MultimediaController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MultimediaController.prototype, "getUserResources", null);
__decorate([
    (0, common_1.Get)(':resourceId'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('resourceId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MultimediaController.prototype, "getResourceById", null);
__decorate([
    (0, common_1.Delete)(':resourceId'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('resourceId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MultimediaController.prototype, "deleteResource", null);
__decorate([
    (0, common_1.Post)('transcribe'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Body)('audioUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MultimediaController.prototype, "transcribeAudio", null);
exports.MultimediaController = MultimediaController = __decorate([
    (0, common_1.Controller)('multimedia'),
    __metadata("design:paramtypes", [multimedia_service_1.MultimediaService])
], MultimediaController);
//# sourceMappingURL=multimedia.controller.js.map