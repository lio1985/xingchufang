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
exports.IntentRecognitionService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let IntentRecognitionService = class IntentRecognitionService {
    constructor() {
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async recognizeIntent(userMessage, conversationHistory = []) {
        console.log('=== 开始意图识别 ===');
        console.log('用户消息:', userMessage);
        console.log('对话历史长度:', conversationHistory.length);
        const quickIntent = this.quickIntentRecognition(userMessage);
        if (quickIntent) {
            console.log('快速识别到意图:', quickIntent.type);
            quickIntent.recommendedModel = this.recommendModel(quickIntent);
            return quickIntent;
        }
        const prompt = this.buildIntentPrompt(userMessage, conversationHistory);
        const messages = [
            {
                role: 'system',
                content: '你是星小帮的意图识别助手，需要准确识别用户的意图并以JSON格式返回结果。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];
        try {
            const response = await this.llmClient.invoke(messages, {
                model: 'doubao-seed-1-8-251228',
                temperature: 0.3,
                thinking: 'disabled',
                caching: 'disabled'
            });
            const intent = this.parseIntentResponse(response.content);
            intent.recommendedModel = this.recommendModel(intent);
            console.log('识别到的意图:', intent);
            console.log('推荐模型:', intent.recommendedModel);
            return intent;
        }
        catch (error) {
            console.error('意图识别失败:', error);
            return {
                type: 'unknown',
                confidence: 0,
                extractedParams: {},
                missingParams: [],
                needsComplexUI: false
            };
        }
    }
    quickIntentRecognition(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('记一下') || lowerMessage.includes('记录') || lowerMessage.includes('备忘') || lowerMessage.includes('记个')) {
            return {
                type: 'quick_note',
                confidence: 0.9,
                extractedParams: { content: userMessage.replace(/^(记一下|记录|备忘|记个)/, '').trim() },
                missingParams: [],
                needsComplexUI: false
            };
        }
        if (lowerMessage.includes('选题') || lowerMessage.includes('话题') || lowerMessage.includes('主题')) {
            return {
                type: 'topic_generation',
                confidence: 0.8,
                extractedParams: {},
                missingParams: ['platforms'],
                needsComplexUI: false
            };
        }
        if (lowerMessage.includes('写脚本') || lowerMessage.includes('写文案') || lowerMessage.includes('生成内容') || lowerMessage.includes('帮我写')) {
            return {
                type: 'content_generation',
                confidence: 0.8,
                extractedParams: { topics: userMessage },
                missingParams: ['platforms'],
                needsComplexUI: false
            };
        }
        if (lowerMessage.includes('优化') || lowerMessage.includes('去ai味') || lowerMessage.includes('改写') || lowerMessage.includes('润色')) {
            return {
                type: 'lexicon_optimize',
                confidence: 0.8,
                extractedParams: { inputText: userMessage },
                missingParams: [],
                needsComplexUI: false
            };
        }
        if (lowerMessage.includes('爆款') || lowerMessage.includes('抖音链接') || lowerMessage.includes('分析视频')) {
            return {
                type: 'viral_replicate',
                confidence: 0.8,
                extractedParams: {},
                missingParams: ['douyinUrl'],
                needsComplexUI: false
            };
        }
        return null;
    }
    buildIntentPrompt(userMessage, conversationHistory) {
        const historyContext = conversationHistory
            .filter(m => m.role !== 'system')
            .slice(-5)
            .map(m => `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`)
            .join('\n');
        return `
你是一个智能意图识别助手。请分析用户的消息，识别用户的意图并提取相关参数。

## 支持的功能意图

1. **quick_note**（灵感速记）：用户想要记录某个想法、笔记、灵感
   - 参数：content（必填）、tags（选填）
   - 示例："记一下明天要做牛排"、"帮我记录一个想法"、"我有灵感了"

2. **topic_generation**（选题生成）：用户想要生成选题、话题、内容方向
   - 参数：platforms（必填）、category（选填）、keywords（选填）
   - 示例："帮我生成几个选题"、"生成美食类选题"、"生成抖音选题"

3. **content_generation**（内容生成）：用户想要生成内容、脚本、文案
   - 参数：topics（必填）、platforms（必填）、versions（选填，默认2）
   - 示例："我要生成内容"、"帮我写个脚本"、"生成3个版本"

4. **lexicon_optimize**（语料优化）：用户想要优化文本、去AI味、改写文案
   - 参数：inputText（必填）、lexiconIds（选填）
   - 示例："帮我优化这段文案"、"去AI味"、"改写一下"

5. **viral_replicate**（爆款复刻）：用户想要分析爆款视频、分析热门内容
   - 参数：douyinUrl（必填）
   - 示例："分析这个爆款视频"、"复制爆款链接"、"抖音爆款分析"

## 分析要求

1. 识别用户的主要意图类型
2. 提取消息中已提供的参数
3. 判断哪些必要参数缺失
4. 评估识别的置信度（0-1之间）
5. 判断是否需要复杂的UI交互（如需要多选、多步填写等）

## 当前对话上下文

${historyContext || '（无历史对话）'}

## 用户当前消息

${userMessage}

## 返回格式

请以纯JSON格式返回，不要包含任何其他文字：

{
  "type": "意图类型",
  "confidence": 0.95,
  "extractedParams": {
    "参数名": "参数值"
  },
  "missingParams": ["缺失的参数名"],
  "needsComplexUI": false
}

## 注意事项

- confidence: 基于消息清晰度的置信度评分（0-1）
- extractedParams: 从消息中提取的参数，如未提取到则为空对象 {}
- missingParams: 必要参数列表，如果所有必要参数都已提供则为空数组 []
- needsComplexUI: 是否需要复杂的UI交互（如多选题、多步表单等）
`;
    }
    parseIntentResponse(response) {
        try {
            let cleanResponse = response.trim();
            const firstBrace = cleanResponse.indexOf('{');
            const lastBrace = cleanResponse.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
            }
            const parsed = JSON.parse(cleanResponse);
            const validTypes = ['quick_note', 'topic_generation', 'content_generation', 'lexicon_optimize', 'viral_replicate', 'unknown'];
            const type = validTypes.includes(parsed.type) ? parsed.type : 'unknown';
            return {
                type,
                confidence: parsed.confidence || 0,
                extractedParams: parsed.extractedParams || {},
                missingParams: parsed.missingParams || [],
                needsComplexUI: parsed.needsComplexUI || false
            };
        }
        catch (error) {
            console.error('解析意图响应失败:', error);
            console.error('原始响应:', response);
            return {
                type: 'unknown',
                confidence: 0,
                extractedParams: {},
                missingParams: [],
                needsComplexUI: false
            };
        }
    }
    isParamsComplete(intent) {
        return intent.missingParams.length === 0;
    }
    recommendModel(intent) {
        const modelConfig = {
            doubao_seed_2_0_pro_260215: {
                capabilities: ['complex_reasoning', 'long_context', 'multi_task'],
                description: '豆包 Pro - 最强大的模型'
            },
            doubao_seed_2_0_lite_260215: {
                capabilities: ['standard_reasoning', 'medium_context'],
                description: '豆包 Lite - 平衡性能和速度'
            },
            doubao_seed_2_0_mini_260215: {
                capabilities: ['simple_reasoning', 'short_context', 'fast_response'],
                description: '豆包 Mini - 快速响应'
            },
            doubao_seed_1_8_251228: {
                capabilities: ['stable', 'general_purpose'],
                description: '豆包 1.8 - 成熟稳定'
            },
            doubao_seed_1_6_thinking_250715: {
                capabilities: ['deep_reasoning', 'analytical'],
                description: '思考模型 - 深度思考'
            }
        };
        switch (intent.type) {
            case 'viral_replicate':
                return 'doubao-seed-2-0-pro-260215';
            case 'content_generation':
                return 'doubao-seed-2-0-pro-260215';
            case 'lexicon_optimize':
                return 'doubao-seed-2-0-lite-260215';
            case 'topic_generation':
                return 'doubao-seed-2-0-lite-260215';
            case 'quick_note':
                return 'doubao-seed-2-0-mini-260215';
            case 'unknown':
            default:
                return 'doubao-seed-2-0-pro-260215';
        }
    }
};
exports.IntentRecognitionService = IntentRecognitionService;
exports.IntentRecognitionService = IntentRecognitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], IntentRecognitionService);
//# sourceMappingURL=intent-recognition.service.js.map