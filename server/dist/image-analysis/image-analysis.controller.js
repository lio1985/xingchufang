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
exports.ImageAnalysisController = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let ImageAnalysisController = class ImageAnalysisController {
    async analyzeImage(body) {
        const { imageUrl } = body;
        const config = new coze_coding_dev_sdk_1.Config();
        const client = new coze_coding_dev_sdk_1.LLMClient(config);
        try {
            const messages = [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: '请详细分析这张图片中的内容，特别是其中包含的规划、设计或需求信息。如果图片包含界面设计图、功能规划或项目需求，请详细描述所有可见的元素、文字、布局结构，以及这些元素之间的关系。'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ];
            const response = await client.invoke(messages, {
                model: 'doubao-seed-1-6-vision-250815',
                temperature: 0.3
            });
            return {
                code: 200,
                msg: 'success',
                data: {
                    analysis: response.content
                }
            };
        }
        catch (error) {
            console.error('Image analysis error:', error);
            return {
                code: 500,
                msg: 'error',
                data: {
                    error: error.message,
                    stack: error.stack
                }
            };
        }
    }
};
exports.ImageAnalysisController = ImageAnalysisController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ImageAnalysisController.prototype, "analyzeImage", null);
exports.ImageAnalysisController = ImageAnalysisController = __decorate([
    (0, common_1.Controller)('image-analysis')
], ImageAnalysisController);
//# sourceMappingURL=image-analysis.controller.js.map