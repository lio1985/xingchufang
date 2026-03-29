import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export interface Intent {
  type: 'quick_note' | 'topic_generation' | 'content_generation' | 'lexicon_optimize' | 'viral_replicate' | 'unknown';
  confidence: number;
  extractedParams: Record<string, any>;
  missingParams: string[];
  needsComplexUI: boolean;
  recommendedModel?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

@Injectable()
export class IntentRecognitionService {
  private llmClient: LLMClient;

  constructor() {
    const config = new Config();
    this.llmClient = new LLMClient(config);
  }

  /**
   * 识别用户意图并提取参数
   */
  async recognizeIntent(
    userMessage: string,
    conversationHistory: Message[] = []
  ): Promise<Intent> {
    console.log('=== 开始意图识别 ===');
    console.log('用户消息:', userMessage);
    console.log('对话历史长度:', conversationHistory.length);

    // 简单关键词匹配，快速识别常见意图，避免每次都调用LLM
    const quickIntent = this.quickIntentRecognition(userMessage);
    if (quickIntent) {
      console.log('快速识别到意图:', quickIntent.type);
      quickIntent.recommendedModel = this.recommendModel(quickIntent);
      return quickIntent;
    }

    // 构建提示词
    const prompt = this.buildIntentPrompt(userMessage, conversationHistory);

    // 调用LLM进行意图识别
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
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

      // 解析LLM响应
      const intent = this.parseIntentResponse(response.content);

      // 根据意图推荐模型
      intent.recommendedModel = this.recommendModel(intent);

      console.log('识别到的意图:', intent);
      console.log('推荐模型:', intent.recommendedModel);
      return intent;
    } catch (error) {
      console.error('意图识别失败:', error);
      // 返回未知意图
      return {
        type: 'unknown',
        confidence: 0,
        extractedParams: {},
        missingParams: [],
        needsComplexUI: false
      };
    }
  }

  /**
   * 快速意图识别（基于关键词匹配）
   * 只有当用户明确表达要执行某个功能时才匹配，否则返回 null 让 LLM 进行自然对话
   */
  private quickIntentRecognition(userMessage: string): Intent | null {
    const lowerMessage = userMessage.toLowerCase();

    // 灵感速记 - 必须包含明确的记录动作
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

    // 选题生成 - 必须明确要求生成选题
    if (lowerMessage.match(/(生成|给我|帮我找|我要).*(选题|话题|主题)/) || lowerMessage.match(/(选题|话题|主题).*(生成|列表)/)) {
      return {
        type: 'topic_generation',
        confidence: 0.9,
        extractedParams: {},
        missingParams: ['platforms'],
        needsComplexUI: false
      };
    }

    // 内容生成 - 必须明确要求生成内容/脚本/文案
    if (lowerMessage.match(/(帮我)?写(一个|个)?(脚本|文案|内容)/) || lowerMessage.match(/生成(内容|脚本|文案)/)) {
      return {
        type: 'content_generation',
        confidence: 0.9,
        extractedParams: { topics: userMessage },
        missingParams: ['platforms'],
        needsComplexUI: false
      };
    }

    // 语料优化 - 必须明确要求优化/改写
    if (lowerMessage.match(/(帮我)?(优化|改写|润色|去ai味)/)) {
      return {
        type: 'lexicon_optimize',
        confidence: 0.9,
        extractedParams: { inputText: userMessage },
        missingParams: [],
        needsComplexUI: false
      };
    }

    // 爆款复刻 - 必须提到爆款分析或抖音链接
    if (lowerMessage.includes('爆款') && (lowerMessage.includes('分析') || lowerMessage.includes('复刻'))) {
      return {
        type: 'viral_replicate',
        confidence: 0.9,
        extractedParams: {},
        missingParams: ['douyinUrl'],
        needsComplexUI: false
      };
    }

    // 未匹配到明确的意图，返回 null 让 LLM 进行自然对话
    return null;
  }

  /**
   * 构建意图识别提示词
   */
  private buildIntentPrompt(userMessage: string, conversationHistory: Message[]): string {
    // 构建对话历史上下文
    const historyContext = conversationHistory
      .filter(m => m.role !== 'system')
      .slice(-5) // 只取最近5条消息
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

  /**
   * 解析LLM返回的意图JSON
   */
  private parseIntentResponse(response: string): Intent {
    try {
      // 清理响应文本，提取JSON部分
      let cleanResponse = response.trim();

      // 尝试找到第一个 { 和最后一个 }
      const firstBrace = cleanResponse.indexOf('{');
      const lastBrace = cleanResponse.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanResponse);

      // 验证意图类型，只允许预定义的类型
      const validTypes = ['quick_note', 'topic_generation', 'content_generation', 'lexicon_optimize', 'viral_replicate', 'unknown'];
      const type = validTypes.includes(parsed.type) ? parsed.type : 'unknown';

      // 验证并返回意图
      return {
        type,
        confidence: parsed.confidence || 0,
        extractedParams: parsed.extractedParams || {},
        missingParams: parsed.missingParams || [],
        needsComplexUI: parsed.needsComplexUI || false
      };
    } catch (error) {
      console.error('解析意图响应失败:', error);
      console.error('原始响应:', response);
      // 返回未知意图
      return {
        type: 'unknown',
        confidence: 0,
        extractedParams: {},
        missingParams: [],
        needsComplexUI: false
      };
    }
  }

  /**
   * 判断参数是否完整
   */
  isParamsComplete(intent: Intent): boolean {
    return intent.missingParams.length === 0;
  }

  /**
   * 根据意图推荐合适的大模型
   */
  recommendModel(intent: Intent): string {
    // 模型配置
    const modelConfig = {
      // 豆包 Pro - 最强大的模型，适合复杂任务
      doubao_seed_2_0_pro_260215: {
        capabilities: ['complex_reasoning', 'long_context', 'multi_task'],
        description: '豆包 Pro - 最强大的模型'
      },
      // 豆包 Lite - 平衡性能和速度
      doubao_seed_2_0_lite_260215: {
        capabilities: ['standard_reasoning', 'medium_context'],
        description: '豆包 Lite - 平衡性能和速度'
      },
      // 豆包 Mini - 快速响应，适合简单任务
      doubao_seed_2_0_mini_260215: {
        capabilities: ['simple_reasoning', 'short_context', 'fast_response'],
        description: '豆包 Mini - 快速响应'
      },
      // 豆包 1.8 - 成熟稳定
      doubao_seed_1_8_251228: {
        capabilities: ['stable', 'general_purpose'],
        description: '豆包 1.8 - 成熟稳定'
      },
      // 思考模型 - 深度思考
      doubao_seed_1_6_thinking_250715: {
        capabilities: ['deep_reasoning', 'analytical'],
        description: '思考模型 - 深度思考'
      }
    };

    // 根据意图类型推荐模型
    switch (intent.type) {
      case 'viral_replicate':
        // 爆款复刻需要强大的分析能力，推荐Pro
        return 'doubao-seed-2-0-pro-260215';

      case 'content_generation':
        // 内容生成需要创意和流畅性，推荐Pro
        return 'doubao-seed-2-0-pro-260215';

      case 'lexicon_optimize':
        // 语料优化需要理解力和改写能力，推荐Lite
        return 'doubao-seed-2-0-lite-260215';

      case 'topic_generation':
        // 选题生成需要快速生成多个选项，推荐Lite
        return 'doubao-seed-2-0-lite-260215';

      case 'quick_note':
        // 灵感速记简单快速，推荐Mini
        return 'doubao-seed-2-0-mini-260215';

      case 'unknown':
      default:
        // 未知意图或普通对话，使用Pro
        return 'doubao-seed-2-0-pro-260215';
    }
  }
}
