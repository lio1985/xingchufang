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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
let UploadController = class UploadController {
    async uploadImage(file) {
        console.log('上传图片，文件名：', file?.originalname);
        console.log('文件类型：', file?.mimetype);
        console.log('文件大小：', file?.size);
        if (!file) {
            throw new common_1.BadRequestException('请上传文件');
        }
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('请上传图片文件');
        }
        const mockUrl = `https://example.com/images/${Date.now()}_${file.originalname}`;
        console.log('图片上传成功：', mockUrl);
        return {
            code: 200,
            msg: 'success',
            data: {
                url: mockUrl,
                filename: file.originalname,
                size: file.size
            }
        };
    }
    async uploadAudio(file) {
        console.log('上传音频，文件名：', file?.originalname);
        console.log('文件类型：', file?.mimetype);
        console.log('文件大小：', file?.size);
        if (!file) {
            throw new common_1.BadRequestException('请上传文件');
        }
        if (!file.mimetype.startsWith('audio/')) {
            throw new common_1.BadRequestException('请上传音频文件');
        }
        const mockTranscript = '这是模拟的语音转文字结果。在实际应用中，应该调用真实的ASR服务。';
        console.log('音频上传成功，转文字结果：', mockTranscript);
        return {
            code: 200,
            msg: 'success',
            data: {
                transcript: mockTranscript,
                filename: file.originalname,
                duration: 30
            }
        };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 }
    })),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('audio'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 }
    })),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadAudio", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload')
], UploadController);
//# sourceMappingURL=upload.controller.js.map