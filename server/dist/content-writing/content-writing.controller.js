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
exports.ContentWritingController = void 0;
const common_1 = require("@nestjs/common");
const content_writing_service_1 = require("./content-writing.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
let ContentWritingController = class ContentWritingController {
    constructor(contentWritingService) {
        this.contentWritingService = contentWritingService;
    }
    async generateOutline(req, dto) {
        console.log('=== 生成内容大纲 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题:', dto.title);
        const result = await this.contentWritingService.generateOutline(dto);
        return {
            code: 200,
            msg: 'success',
            data: result,
        };
    }
    async expandContent(req, dto) {
        console.log('=== 扩写内容 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题:', dto.title);
        const result = await this.contentWritingService.expandContent(dto);
        return {
            code: 200,
            msg: 'success',
            data: result,
        };
    }
    async polishContent(req, dto) {
        console.log('=== 润色内容 ===');
        console.log('用户ID:', req.user.id);
        console.log('润色类型:', dto.polishType);
        const result = await this.contentWritingService.polishContent(dto);
        return {
            code: 200,
            msg: 'success',
            data: result,
        };
    }
    async generateFullContent(req, dto) {
        console.log('=== 生成完整内容 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题:', dto.title);
        const result = await this.contentWritingService.generateFullContent(dto);
        return {
            code: 200,
            msg: 'success',
            data: result,
        };
    }
    async suggestInspiration(req, dto) {
        console.log('=== 获取创作灵感 ===');
        console.log('用户ID:', req.user.id);
        console.log('选题:', dto.title);
        const result = await this.contentWritingService.suggestInspiration(dto);
        return {
            code: 200,
            msg: 'success',
            data: result,
        };
    }
};
exports.ContentWritingController = ContentWritingController;
__decorate([
    (0, common_1.Post)('outline'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentWritingController.prototype, "generateOutline", null);
__decorate([
    (0, common_1.Post)('expand'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentWritingController.prototype, "expandContent", null);
__decorate([
    (0, common_1.Post)('polish'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentWritingController.prototype, "polishContent", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentWritingController.prototype, "generateFullContent", null);
__decorate([
    (0, common_1.Post)('inspiration'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentWritingController.prototype, "suggestInspiration", null);
exports.ContentWritingController = ContentWritingController = __decorate([
    (0, common_1.Controller)('content-writing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [content_writing_service_1.ContentWritingService])
], ContentWritingController);
//# sourceMappingURL=content-writing.controller.js.map