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
exports.TagGenerationController = void 0;
const common_1 = require("@nestjs/common");
const tag_generation_service_1 = require("./tag-generation.service");
let TagGenerationController = class TagGenerationController {
    constructor(tagGenerationService) {
        this.tagGenerationService = tagGenerationService;
    }
    async generateTags(body) {
        const { content } = body;
        if (!content || content.trim().length === 0) {
            return {
                code: 400,
                msg: '内容不能为空',
                data: null
            };
        }
        try {
            const tags = await this.tagGenerationService.generateTags(content);
            return {
                code: 200,
                msg: 'success',
                data: { tags }
            };
        }
        catch (error) {
            console.error('生成标签失败:', error);
            return {
                code: 500,
                msg: '生成标签失败',
                data: null
            };
        }
    }
    async generateTitle(body) {
        const { content } = body;
        if (!content || content.trim().length === 0) {
            return {
                code: 400,
                msg: '内容不能为空',
                data: null
            };
        }
        try {
            const title = await this.tagGenerationService.generateTitle(content);
            return {
                code: 200,
                msg: 'success',
                data: { title }
            };
        }
        catch (error) {
            console.error('生成标题失败:', error);
            return {
                code: 500,
                msg: '生成标题失败',
                data: null
            };
        }
    }
};
exports.TagGenerationController = TagGenerationController;
__decorate([
    (0, common_1.Post)('generate-tags'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagGenerationController.prototype, "generateTags", null);
__decorate([
    (0, common_1.Post)('generate-title'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagGenerationController.prototype, "generateTitle", null);
exports.TagGenerationController = TagGenerationController = __decorate([
    (0, common_1.Controller)('quick-note'),
    __metadata("design:paramtypes", [tag_generation_service_1.TagGenerationService])
], TagGenerationController);
//# sourceMappingURL=tag-generation.controller.js.map