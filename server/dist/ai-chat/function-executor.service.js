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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionExecutorService = void 0;
const common_1 = require("@nestjs/common");
const content_generation_service_1 = require("../content-generation/content-generation.service");
let FunctionExecutorService = class FunctionExecutorService {
    constructor(contentGenerationService) {
        this.contentGenerationService = contentGenerationService;
    }
    async executeFunction(intent, params, userId) {
        console.log('=== 开始执行功能 ===');
        console.log('意图类型:', intent.type);
        console.log('参数:', params);
        try {
            let result;
            switch (intent.type) {
                case 'quick_note':
                    result = await this.executeQuickNote(params);
                    break;
                case 'topic_generation':
                    result = await this.executeTopicGeneration(params);
                    break;
                case 'content_generation':
                    result = await this.executeContentGeneration(params);
                    break;
                case 'lexicon_optimize':
                    result = await this.executeLexiconOptimize(params);
                    break;
                case 'viral_replicate':
                    result = await this.executeViralReplicate(params);
                    break;
                default:
                    return {
                        success: false,
                        error: '未知的功能意图',
                        type: intent.type,
                    };
            }
            return {
                success: true,
                data: result,
                type: intent.type,
            };
        }
        catch (error) {
            console.error('执行功能失败:', error);
            return {
                success: false,
                error: error.message || '功能执行失败',
                type: intent.type,
            };
        }
    }
    async executeQuickNote(params) {
        console.log('执行灵感速记:', params);
        const content = params.content || '';
        return {
            id: crypto.randomUUID(),
            content: content,
            tags: params.tags || [],
            createdAt: new Date().toISOString(),
            message: '✅ 已记录您的灵感！',
        };
    }
    async executeTopicGeneration(params) {
        console.log('执行选题生成:', params);
        const platforms = params.platforms || ['douyin'];
        const category = params.category || '美食';
        const keywords = params.keywords || [];
        const topics = [
            { id: '1', title: `${category}：如何在家做出米其林级别的${keywords[0] || '牛排'}` },
            { id: '2', title: `${category}：10分钟快手${keywords[0] || '早餐'}，上班族必备！` },
            { id: '3', title: `${category}：3款低成本但高颜值的网红${keywords[0] || '甜点'}` },
            { id: '4', title: `${category}：揭秘${keywords[0] || '牛排'}的5个隐藏技巧` },
            { id: '5', title: `${category}：用${keywords[0] || '牛排'}做出餐厅级口感` },
        ];
        return {
            topics,
            platforms: platforms,
            message: `✨ 已为您生成${topics.length}个${category}！`,
        };
    }
    async executeContentGeneration(params) {
        console.log('执行内容生成:', params);
        const topicsRaw = params.topics || [];
        const topics = Array.isArray(topicsRaw) ? topicsRaw : [topicsRaw];
        const platformsRaw = params.platforms || ['douyin'];
        const platforms = Array.isArray(platformsRaw) ? platformsRaw : [platformsRaw];
        const versions = params.versions || 2;
        console.log(`开始生成内容: ${topics.length}个选题, ${platforms.join(', ')}, ${versions}个版本`);
        try {
            const generatedContents = await this.contentGenerationService.generateContent(topics, {
                platform: platforms.join(', '),
                style: '标准版',
                length: 'medium'
            });
            console.log(`AI 生成完成，共生成 ${generatedContents.length} 个内容版本`);
            const results = generatedContents.map((content, index) => {
                const versionNum = Math.floor(index / 2) + 1;
                const variantIndex = index % 2;
                const platform = platforms[variantIndex % platforms.length];
                return {
                    topic: content.topic,
                    version: versionNum,
                    platform: platform,
                    variant: content.variant || 'A',
                    title: content.title,
                    content: content.content,
                    id: content.id,
                    createdAt: content.createdAt
                };
            });
            return {
                success: true,
                results,
                platforms: platforms,
                versions: versions,
                totalResults: results.length,
                message: `✨ 已为您生成${results.length}个内容版本（AI生成）！`,
            };
        }
        catch (error) {
            console.error('AI 内容生成失败:', error);
            console.log('降级使用模板生成');
            const results = [];
            for (const topic of topics) {
                for (let i = 0; i < versions; i++) {
                    results.push({
                        topic: topic,
                        version: i + 1,
                        platform: platforms[i % platforms.length],
                        content: `【版本${i + 1}】${topic}\n\n这里是根据您的选题生成的内容...\n\n适合在${platforms[i % platforms.length]}上发布。`,
                    });
                }
            }
            return {
                success: false,
                results,
                platforms: platforms,
                versions,
                message: `⚠️ AI生成失败，已为您生成${results.length}个模板版本`,
                error: error.message
            };
        }
    }
    async executeLexiconOptimize(params) {
        console.log('执行语料优化:', params);
        const inputText = params.inputText || '';
        const optimizedText = inputText
            .replace(/很/g, '特别')
            .replace(/非常/g, '极其')
            .replace(/很/g, '超级');
        return {
            originalText: inputText,
            optimizedText: optimizedText,
            lexiconIds: params.lexiconIds || [],
            message: '✅ 语料优化完成！',
        };
    }
    async executeViralReplicate(params) {
        console.log('执行爆款复刻:', params);
        const douyinUrl = params.douyinUrl || '';
        return {
            url: douyinUrl,
            title: '爆款视频分析结果',
            analysis: {
                title: '视频标题',
                content: '视频内容摘要',
                hooks: ['黄金前3秒', '情感共鸣点'],
                structure: '视频结构分析',
            },
            message: '✨ 爆款分析完成！',
        };
    }
};
exports.FunctionExecutorService = FunctionExecutorService;
exports.FunctionExecutorService = FunctionExecutorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [content_generation_service_1.ContentGenerationService])
], FunctionExecutorService);
//# sourceMappingURL=function-executor.service.js.map