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
        if (lowerMessage.match(/^(记一下|记录|备忘|记个|帮我记|保存)/)) {
            const content = userMessage.replace(/^(记一下|记录|备忘|记个|帮我记|保存)/, '').trim();
            if (content) {
                return {
                    type: 'quick_note',
                    confidence: 0.95,
                    extractedParams: { content },
                    missingParams: [],
                    needsComplexUI: false
                };
            }
        }
        if (lowerMessage.match(/(生成|给我|帮我找|我要).*(选题|话题|主题)/) || lowerMessage.match(/(选题|话题|主题).*(生成|列表)/)) {
            return {
                type: 'topic_generation',
                confidence: 0.9,
                extractedParams: {},
                missingParams: ['platforms'],
                needsComplexUI: false
            };
        }
        if (lowerMessage.match(/(帮我)?写(一个|个)?(脚本|文案|内容)/) || lowerMessage.match(/生成(内容|脚本|文案)/)) {
            return {
                type: 'content_generation',
                confidence: 0.9,
                extractedParams: { topics: userMessage },
                missingParams: ['platforms'],
                needsComplexUI: false
            };
        }
        if (lowerMessage.match(/(帮我)?(优化|改写|润色|去ai味)/)) {
            return {
                type: 'lexicon_optimize',
                confidence: 0.9,
                extractedParams: { inputText: userMessage },
                missingParams: [],
                needsComplexUI: false
            };
        }
        if (lowerMessage.includes('爆款') && (lowerMessage.includes('分析') || lowerMessage.includes('复刻'))) {
            return {
                type: 'viral_replicate',
                confidence: 0.9,
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

## 重要规则

**如果用户只是聊天、问候、提供信息，没有明确要求执行某个功能，必须返回 type: "unknown"**

例如：
- "你好"、"嗨"、"你好啊" → unknown（普通问候）
- "关于厨具的"、"是做厨具的" → unknown（只是在提供信息）
- "我想写点东西" → unknown（没有明确要求执行功能）
- "帮我写个脚本" → content_generation（明确要求执行功能）
- "生成几个选题" → topic_generation（明确要求执行功能）

## 支持的功能意图（只有用户明确要求时才匹配）

1. **quick_note**（灵感速记）：用户明确要记录某个想法、笔记、灵感
   - 参数：content（必填）、tags（选填）
   - 示例："记一下明天要做牛排"、"帮我记录一个想法"、"保存这个灵感"

2. **topic_generation**（选题生成）：用户明确要生成选题、话题、内容方向
   - 参数：platforms（必填）、category（选填）、keywords（选填）
   - 示例："帮我生成几个选题"、"生成美食类选题"、"给我一些抖音选题"

3. **content_generation**（内容生成）：用户明确要生成内容、脚本、文案
   - 参数：topics（必填）、platforms（必填）、versions（选填，默认2）
   - 示例："帮我写个短视频脚本"、"生成产品文案"、"写一个抖音脚本"

4. **lexicon_optimize**（语料优化）：用户明确要优化文本、去AI味、改写文案
   - 参数：inputText（必填）、lexiconIds（选填）
   - 示例："帮我优化这段文案"、"把这个去AI味"、"润色一下这段话"

5. **viral_replicate**（爆款复刻）：用户明确要分析爆款视频
   - 参数：douyinUrl（必填）
   - 示例："分析这个爆款视频"、"帮我复刻这个抖音爆款"

6. **unknown**（普通对话）：用户的聊天、问候、咨询等，不需要执行特定功能
   - 当用户没有明确要求执行上述功能时，返回此类型

## 分析要求

1. 判断用户是否明确要求执行某个功能
2. 如果是，识别具体的功能类型并提取参数
3. 如果不是（只是聊天、问候、提供信息），返回 type: "unknown"
4. 评估识别的置信度（0-1之间）

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

- 当用户只是聊天、问候或提供信息时，type 必须是 "unknown"
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