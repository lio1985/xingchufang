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
exports.ContentWritingService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let ContentWritingService = class ContentWritingService {
    constructor() {
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async generateOutline(dto) {
        const platformTips = this.getPlatformTips(dto.platform);
        const messages = [
            {
                role: 'system',
                content: `你是一位专业的内容策划专家，擅长为各类平台创作内容大纲。请根据用户提供的选题信息，生成一个详细的内容大纲。

${platformTips}

返回格式要求（JSON格式）：
{
  "title": "优化后的标题",
  "hook": "开场白/开篇吸睛句",
  "sections": [
    {
      "name": "章节名称",
      "duration": "预计时长（秒）",
      "keyPoints": ["要点1", "要点2"],
      "contentHint": "内容提示"
    }
  ],
  "cta": "结尾号召/行动指引",
  "estimatedDuration": "总预计时长",
  "keywords": ["关键词1", "关键词2"],
  "hashtags": ["#标签1", "#标签2"],
  "notes": ["注意事项1", "注意事项2"]
}`,
            },
            {
                role: 'user',
                content: `请为以下选题生成内容大纲：

标题：${dto.title}
${dto.description ? `描述：${dto.description}` : ''}
平台：${dto.platform}
内容类型：${dto.contentType}
${dto.targetAudience ? `目标受众：${dto.targetAudience}` : ''}
${dto.keyPoints ? `核心要点：${dto.keyPoints}` : ''}
${dto.tone ? `语调风格：${dto.tone}` : ''}
${dto.duration ? `目标时长：${dto.duration}` : ''}
${dto.style ? `画面风格：${dto.style}` : ''}

请生成详细的内容大纲。`,
            },
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.7,
        });
        return this.parseAIResponse(response.content);
    }
    async expandContent(dto) {
        const messages = [
            {
                role: 'system',
                content: `你是一位专业的内容创作者，擅长将大纲扩展为详细的脚本内容。请根据用户提供的大纲和章节信息，扩写出详细的内容。

要求：
1. 保持内容的连贯性和吸引力
2. 使用生动的语言和具体的例子
3. 符合平台的内容特点
4. 注意口语化表达（如果是视频/直播内容）

返回格式要求（JSON格式）：
{
  "sectionName": "章节名称",
  "content": "扩写后的完整内容",
  "duration": "预计时长（秒）",
  "tips": ["表达技巧提示"],
  "emotionPoints": ["情感共鸣点"]
}`,
            },
            {
                role: 'user',
                content: `请扩写以下内容：

选题标题：${dto.title}
平台：${dto.platform}
${dto.tone ? `语调风格：${dto.tone}` : ''}
${dto.targetAudience ? `目标受众：${dto.targetAudience}` : ''}

整体大纲：
${dto.outline}

需要扩写的章节：
${dto.section}

${dto.referenceContent ? `参考内容：\n${dto.referenceContent}` : ''}

请扩写出这个章节的详细内容。`,
            },
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.8,
        });
        return this.parseAIResponse(response.content);
    }
    async polishContent(dto) {
        const polishTypeGuide = {
            concise: '精简表达，删除冗余，突出核心信息，让内容更加干练有力',
            emotional: '增加情感共鸣，使用更有感染力的语言，引发读者/观众的情感反应',
            professional: '提升专业度，使用更准确的专业术语，增强内容的权威性',
            engaging: '增强互动性，加入提问、悬念等元素，提高内容的吸引力和参与度',
        };
        const messages = [
            {
                role: 'system',
                content: `你是一位专业的内容编辑，擅长优化和润色各类内容。请根据用户的需求，对内容进行润色优化。

润色方向：${polishTypeGuide[dto.polishType]}

返回格式要求（JSON格式）：
{
  "polishedContent": "润色后的内容",
  "changes": [
    {
      "original": "原文片段",
      "polished": "润色后片段",
      "reason": "修改原因"
    }
  ],
  "improvements": ["改进点1", "改进点2"],
  "score": {
    "original": 70,
    "polished": 90
  }
}`,
            },
            {
                role: 'user',
                content: `请润色以下内容：

平台：${dto.platform}
${dto.tone ? `语调风格：${dto.tone}` : ''}
润色方向：${dto.polishType}

原始内容：
${dto.content}

请优化这段内容。`,
            },
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.6,
        });
        return this.parseAIResponse(response.content);
    }
    async generateFullContent(dto) {
        const platformTips = this.getPlatformTips(dto.platform);
        const messages = [
            {
                role: 'system',
                content: `你是一位专业的内容创作专家，擅长为${dto.platform}平台创作优质内容。请根据用户提供的选题信息，生成完整的内容。

${platformTips}

要求：
1. 开头要有吸引力，能够快速抓住读者/观众注意力
2. 内容结构清晰，层次分明
3. 语言风格符合平台特点和目标受众
4. 结尾要有号召力，引导用户行动
5. 如果有AI分析结果，请参考其中的建议

返回格式要求（JSON格式）：
{
  "title": "优化后的标题",
  "content": "完整内容（包含开场、主体、结尾）",
  "hook": "开场白",
  "mainPoints": ["要点1", "要点2", "要点3"],
  "cta": "结尾号召",
  "keywords": ["关键词1", "关键词2"],
  "hashtags": ["#标签1", "#标签2"],
  "duration": "预计时长",
  "tone": "实际语调",
  "platformTips": ["平台特色提示"],
  "coverSuggestion": "封面/头图建议",
  "musicSuggestion": "配乐建议（如适用）"
}`,
            },
            {
                role: 'user',
                content: `请为以下选题生成完整内容：

标题：${dto.title}
${dto.description ? `描述：${dto.description}` : ''}
平台：${dto.platform}
内容类型：${dto.contentType}
${dto.targetAudience ? `目标受众：${dto.targetAudience}` : ''}
${dto.keyPoints ? `核心要点：${dto.keyPoints}` : ''}
${dto.tone ? `语调风格：${dto.tone}` : ''}
${dto.duration ? `目标时长：${dto.duration}` : ''}
${dto.style ? `画面风格：${dto.style}` : ''}
${dto.aiAnalysis ? `\nAI分析建议：\n${JSON.stringify(dto.aiAnalysis, null, 2)}` : ''}
${dto.referenceContent ? `\n参考内容：\n${dto.referenceContent.substring(0, 2000)}` : ''}

请生成完整的内容脚本。`,
            },
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.75,
        });
        return this.parseAIResponse(response.content);
    }
    async suggestInspiration(dto) {
        const messages = [
            {
                role: 'system',
                content: `你是一位创意策划专家，擅长为内容创作者提供灵感和创意方向。请根据用户的选题，提供创作灵感建议。

返回格式要求（JSON格式）：
{
  "creativeDirections": [
    {
      "angle": "创意角度",
      "description": "详细描述",
      "example": "示例标题或开头"
    }
  ],
  "trendingElements": ["当前热门元素1", "热门元素2"],
  "emotionTriggers": ["情感触发点1", "触发点2"],
  "storyAngles": ["故事切入角度1", "角度2"],
  "controversialPoints": ["可讨论的争议点（慎用）"],
  "interactiveIdeas": ["互动创意1", "创意2"]
}`,
            },
            {
                role: 'user',
                content: `请为以下选题提供创作灵感：

标题：${dto.title}
${dto.category ? `分类：${dto.category}` : ''}
平台：${dto.platform}

请提供详细的创作灵感建议。`,
            },
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.9,
        });
        return this.parseAIResponse(response.content);
    }
    parseAIResponse(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { rawContent: content };
        }
        catch (error) {
            return { rawContent: content, parseError: true };
        }
    }
    getPlatformTips(platform) {
        const tips = {
            '公众号': `
公众号内容特点：
- 标题要有吸引力，但不要标题党
- 开头要快速进入主题，300字内抓住读者
- 排版清晰，适当分段，使用小标题
- 可以使用图片、表情增加可读性
- 结尾引导点赞、在看、分享
- 字数建议：1500-3000字`,
            '小红书': `
小红书内容特点：
- 标题要吸睛，可以使用数字、疑问句
- 开头要有场景感，引发共鸣
- 使用emoji表情，增加亲和力
- 分点清晰，使用数字标记
- 真实体验分享，避免硬广
- 字数建议：300-800字`,
            '抖音': `
抖音短视频脚本特点：
- 开头3秒必须抓住注意力
- 节奏紧凑，避免冗长
- 口语化表达，接地气
- 适当使用悬念、反转
- 结尾号召点赞、关注
- 时长建议：15-60秒`,
            '视频号': `
视频号内容特点：
- 内容真实，贴近生活
- 可以稍微正式一些
- 适合知识分享、教程类
- 注重价值传递
- 引导点赞、转发
- 时长建议：1-5分钟`,
            '微博': `
微博内容特点：
- 简洁有力，140字内突出核心
- 可以使用话题标签
- 图片/视频增加曝光
- 适当使用表情
- 引导转发、评论`,
            'B站': `
B站内容特点：
- 内容深度，干货为主
- 可以使用网络流行语
- 视频时长可以较长
- 注重互动弹幕体验
- 标题要有吸引力但不要夸张`,
        };
        return tips[platform] || '请根据平台特点创作适合的内容。';
    }
};
exports.ContentWritingService = ContentWritingService;
exports.ContentWritingService = ContentWritingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ContentWritingService);
//# sourceMappingURL=content-writing.service.js.map