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
exports.ViralController = void 0;
const common_1 = require("@nestjs/common");
const viral_service_1 = require("./viral.service");
let ViralController = class ViralController {
    constructor(viralService) {
        this.viralService = viralService;
    }
    async extractVideo(body) {
        console.log('📥 [controller] 收到提取请求:', body);
        try {
            const result = await this.viralService.extractVideo(body.url);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            return { code: 400, msg: error.message || '视频提取失败', data: null };
        }
    }
    async transcribeAudio(body) {
        console.log('🎤 [controller] 收到语音识别请求:', body);
        try {
            const result = await this.viralService.transcribeAudio(body.audioUrl);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            return { code: 400, msg: error.message || '语音识别失败', data: null };
        }
    }
    async transcribeAudioFromBase64(body) {
        console.log('🎤 [controller] 收到语音识别请求（Base64）');
        try {
            const result = await this.viralService.transcribeAudioFromBase64(body.base64Audio);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            return { code: 400, msg: error.message || '语音识别失败', data: null };
        }
    }
    async analyzeContent(body) {
        const text = body.transcript || body.content || '';
        console.log('🔍 [controller] 收到分析请求:', { transcriptLength: text.length, platform: body.platform });
        if (!text) {
            return { code: 400, msg: '分析内容不能为空', data: null };
        }
        const result = await this.viralService.analyzeContent(text, body.platform || '通用');
        return { code: 200, msg: 'success', data: result };
    }
    async favoriteStructure(body) {
        console.log('❤️ [controller] 收到收藏请求:', { title: body.title });
        try {
            const userId = undefined;
            const result = await this.viralService.favoriteFramework(userId, body.title, body.structure, body.framework);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            console.error('❤️ [controller] 收藏失败:', error);
            return { code: 400, msg: error.message || '收藏失败', data: null };
        }
    }
    async getFavorites() {
        console.log('📋 [controller] 收到获取收藏列表请求');
        try {
            const userId = undefined;
            const result = await this.viralService.getFavorites(userId);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            console.error('📋 [controller] 获取收藏列表失败:', error);
            return { code: 400, msg: error.message || '获取失败', data: [] };
        }
    }
    async analyzeDouyin(body) {
        const content = body.shareText || body.url || '';
        console.log('📥 [controller] 收到抖音内容分析请求:', { shareText: content.substring(0, 100) });
        if (!content) {
            return { code: 400, msg: '分享内容不能为空', data: null };
        }
        try {
            const result = await this.viralService.analyzeDouyinContent(content);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            console.error('抖音内容分析失败:', error);
            return { code: 400, msg: error.message || '分析失败', data: null };
        }
    }
    async remixContent(body) {
        console.log('🚀 [controller] 收到二创改写请求:', {
            transcriptLength: body.transcript?.length,
            frameworkType: body.framework?.type,
            ideaLength: body.remixIdea?.length,
            lexiconContentLength: body.lexiconContents?.length,
            style: body.style
        });
        try {
            const result = await this.viralService.remixContent(body);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            console.error('🚀 [controller] 二创改写失败:', error);
            return { code: 400, msg: error.message || '改写失败', data: null };
        }
    }
    async optimizeIdea(body) {
        console.log('🪄 [controller] 收到优化改写想法请求:', {
            ideaLength: body.idea?.length,
            transcriptLength: body.transcript?.length,
            style: body.style
        });
        try {
            const result = await this.viralService.optimizeIdea(body.idea, body.transcript, body.style);
            return { code: 200, msg: 'success', data: result };
        }
        catch (error) {
            console.error('🪄 [controller] 优化改写想法失败:', error);
            return { code: 400, msg: error.message || '优化失败', data: null };
        }
    }
};
exports.ViralController = ViralController;
__decorate([
    (0, common_1.Post)('extract'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "extractVideo", null);
__decorate([
    (0, common_1.Post)('transcribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "transcribeAudio", null);
__decorate([
    (0, common_1.Post)('transcribe-base64'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "transcribeAudioFromBase64", null);
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "analyzeContent", null);
__decorate([
    (0, common_1.Post)('favorite'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "favoriteStructure", null);
__decorate([
    (0, common_1.Get)('favorites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Post)('analyze-douyin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "analyzeDouyin", null);
__decorate([
    (0, common_1.Post)('remix'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "remixContent", null);
__decorate([
    (0, common_1.Post)('optimize-idea'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralController.prototype, "optimizeIdea", null);
exports.ViralController = ViralController = __decorate([
    (0, common_1.Controller)('viral'),
    __metadata("design:paramtypes", [viral_service_1.ViralService])
], ViralController);
//# sourceMappingURL=viral.controller.js.map