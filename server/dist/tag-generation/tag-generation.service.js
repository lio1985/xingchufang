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
exports.TagGenerationService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let TagGenerationService = class TagGenerationService {
    constructor() {
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async generateTags(content) {
        console.log('=== 开始生成标签 ===');
        console.log('Content length:', content.length);
        try {
            const prompt = `请分析以下内容，提取3-5个核心标签。

要求：
1. 标签应该简洁明了，用2-4个字表示
2. 标签应该准确反映内容的主题和关键词
3. 优先提取名词和关键概念
4. 避免重复和过于宽泛的标签
5. 只返回标签列表，用逗号分隔

内容：
${content.substring(0, 1000)}

标签：`;
            const response = await this.llmClient.invoke([
                {
                    role: 'system',
                    content: '你是一个专业的标签生成助手，擅长从文本中提取核心关键词和主题标签。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ], {
                model: 'doubao-seed-1-8-251228',
                temperature: 0.3,
                thinking: 'disabled',
                caching: 'disabled'
            });
            console.log('=== LLM Response ===');
            console.log('Tags response:', response.content?.substring(0, 200) || 'No content');
            const tags = this.parseTags(response.content);
            console.log('Parsed tags:', tags);
            return tags;
        }
        catch (error) {
            console.error('LLM 生成标签失败:', error);
            return this.extractFallbackTags(content);
        }
    }
    parseTags(response) {
        if (!response)
            return [];
        const cleaned = response
            .replace(/^.*?[:：]\s*/, '')
            .replace(/[、\n\r]/g, ',')
            .replace(/，/g, ',')
            .replace(/#+/g, '')
            .trim();
        const tags = cleaned
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0 && tag.length <= 10)
            .slice(0, 5);
        return tags;
    }
    extractFallbackTags(content) {
        const keywords = [
            '灵感', '笔记', '创意', '想法', '计划',
            '工作', '学习', '生活', '思考', '总结',
            '心得', '经验', '技巧', '方法', '工具'
        ];
        const contentLower = content.toLowerCase();
        const matchedTags = keywords.filter(keyword => contentLower.includes(keyword));
        return matchedTags.length > 0 ? matchedTags.slice(0, 3) : ['笔记'];
    }
    async generateTitle(content) {
        console.log('=== 开始生成标题 ===');
        console.log('Content length:', content.length);
        try {
            const prompt = `请为以下内容生成一个简洁、吸引人的标题。

要求：
1. 标题长度控制在5-15个字
2. 标题应该准确反映内容的主题和重点
3. 标题应该简洁有力，避免过长
4. 使用吸引人的语言，增强可读性
5. 只返回标题，不需要其他说明

内容：
${content.substring(0, 800)}

标题：`;
            const response = await this.llmClient.invoke([
                {
                    role: 'system',
                    content: '你是一个专业的标题生成助手，擅长根据内容创作简洁、吸引人的标题。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ], {
                model: 'doubao-seed-1-8-251228',
                temperature: 0.4,
                thinking: 'disabled',
                caching: 'disabled'
            });
            console.log('=== LLM Response ===');
            console.log('Title response:', response.content?.substring(0, 100) || 'No content');
            const title = this.parseTitle(response.content);
            console.log('Parsed title:', title);
            return title;
        }
        catch (error) {
            console.error('LLM 生成标题失败:', error);
            return this.extractFallbackTitle(content);
        }
    }
    parseTitle(response) {
        if (!response)
            return '';
        const cleaned = response
            .replace(/^.*?[:：]\s*/, '')
            .replace(/[【】\[\]]/g, '')
            .replace(/《》/g, '')
            .replace(/^\d+[、.]\s*/, '')
            .trim();
        const title = cleaned.substring(0, 15);
        return title;
    }
    extractFallbackTitle(content) {
        const fallbackTitle = content.trim().substring(0, 15);
        return fallbackTitle || '无标题笔记';
    }
};
exports.TagGenerationService = TagGenerationService;
exports.TagGenerationService = TagGenerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TagGenerationService);
//# sourceMappingURL=tag-generation.service.js.map