import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { IntentRecognitionService, Intent, Message } from './intent-recognition.service';
import { ConversationManagerService } from './conversation-manager.service';
import { FunctionExecutorService } from './function-executor.service';

export interface ChatRequest {
  message: string;
  userId: string;
  conversationId?: string;
  model?: string;
}

export interface ChatResponse {
  type: 'text' | 'collect_params' | 'execute' | 'error';
  message?: string;
  data?: any;
  intent?: Intent;
  conversationId?: string;
  recommendedModel?: string;
}

@Injectable()
export class AiChatService {
  private llmClient: LLMClient;

  constructor(
    private intentRecognitionService: IntentRecognitionService,
    private conversationManagerService: ConversationManagerService,
    private functionExecutorService: FunctionExecutorService,
  ) {
    const config = new Config();
    this.llmClient = new LLMClient(config);
  }

  /**
   * 处理聊天消息
   */
  async handleMessage(request: ChatRequest): Promise<ChatResponse> {
    console.log('=== AI Chat: 开始处理消息 ===');
    console.log('用户ID:', request.userId);
    console.log('消息内容:', request.message);

    try {
      // 1. 获取或创建对话
      let conversationId = request.conversationId;
      let conversation;

      if (conversationId) {
        conversation = await this.conversationManagerService.getConversation(conversationId);
      }

      if (!conversation) {
        // 如果没有提供对话ID或对话不存在，获取或创建活跃对话
        conversation = await this.conversationManagerService.getActiveConversation(request.userId);
        if (!conversation) {
          conversation = await this.conversationManagerService.createConversation(request.userId);
        }
        conversationId = conversation.id;
      }

      console.log('对话ID:', conversationId);

      // 2. 添加用户消息到对话历史
      if (!conversationId) {
        throw new Error('对话ID不能为空');
      }

      await this.conversationManagerService.addMessage(conversationId, 'user', request.message);

      // 3. 获取对话历史
      const history = await this.conversationManagerService.getConversationHistory(conversationId);

      // 4. 识别用户意图
      const intent = await this.intentRecognitionService.recognizeIntent(request.message, history);

      // 使用推荐的模型（如果用户没有指定模型）
      const modelToUse = request.model || intent.recommendedModel || 'doubao-seed-2-0-pro-260215';
      console.log('使用模型:', modelToUse);
      console.log('推荐模型:', intent.recommendedModel);

      // 5. 根据意图处理
      if (intent.type === 'unknown') {
        // 未知意图，调用LLM进行普通对话
        const response = await this.chatWithLLM(request.message, history, modelToUse);

        await this.conversationManagerService.addMessage(conversationId, 'assistant', response);

        return {
          type: 'text',
          message: response,
          conversationId,
          recommendedModel: intent.recommendedModel,
        };
      }

      // 6. 更新对话意图
      await this.conversationManagerService.updateConversationIntent(conversationId, intent);

      // 7. 检查参数是否完整
      if (this.intentRecognitionService.isParamsComplete(intent)) {
        // 参数完整，执行功能
        const result = await this.executeFunction(conversationId, intent, request.userId, modelToUse);
        return result;
      } else {
        // 参数缺失，收集参数
        const collectResult = await this.collectParameters(conversationId, intent);
        return {
          ...collectResult,
          recommendedModel: intent.recommendedModel,
        };
      }
    } catch (error: any) {
      console.error('处理消息失败:', error);
      return {
        type: 'error',
        message: error.message || '处理消息失败',
      };
    }
  }

  /**
   * 收集参数
   */
  private async collectParameters(conversationId: string, intent: Intent): Promise<ChatResponse> {
    console.log('=== AI Chat: 需要收集参数 ===');
    console.log('缺失参数:', intent.missingParams);

    // 生成参数收集提示
    const prompt = this.generateParameterPrompt(intent);

    // 添加助手消息到对话历史
    await this.conversationManagerService.addMessage(conversationId, 'assistant', prompt);

    return {
      type: 'collect_params',
      message: prompt,
      intent,
      conversationId,
    };
  }

  /**
   * 执行功能
   */
  private async executeFunction(
    conversationId: string,
    intent: Intent,
    userId: string,
    model: string
  ): Promise<ChatResponse> {
    console.log('=== AI Chat: 执行功能 ===');
    console.log('功能类型:', intent.type);
    console.log('使用模型:', model);

    // 获取已收集的参数
    const conversation = await this.conversationManagerService.getConversation(conversationId);
    if (!conversation) {
      throw new Error('对话不存在');
    }

    if (!conversation.userId) {
      throw new Error('对话用户ID不存在');
    }

    // 合并提取的参数和已收集的参数
    const allParams = {
      ...conversation.collectedParams,
      ...intent.extractedParams,
    };

    // 执行功能
    const result = await this.functionExecutorService.executeFunction(intent, allParams, conversation.userId);

    // 生成响应消息
    let responseMessage = '';
    if (result.success) {
      responseMessage = result.data?.message || '功能执行完成！';
    } else {
      responseMessage = `❌ ${result.error || '功能执行失败'}`;
    }

    // 添加助手消息到对话历史
    await this.conversationManagerService.addMessage(conversationId, 'assistant', responseMessage, {
      result,
    });

    // 如果功能执行成功，完成对话
    if (result.success) {
      await this.conversationManagerService.completeConversation(conversationId);
    }

    return {
      type: 'execute',
      message: responseMessage,
      data: result,
      conversationId,
      recommendedModel: intent.recommendedModel,
    };
  }

  /**
   * 接收用户提交的参数
   */
  async submitParams(
    conversationId: string,
    params: Record<string, any>
  ): Promise<ChatResponse> {
    console.log('=== AI Chat: 提交参数 ===');
    console.log('参数:', params);

    // 更新已收集的参数
    await this.conversationManagerService.mergeCollectedParams(conversationId, params);

    // 获取当前对话
    const conversation = await this.conversationManagerService.getConversation(conversationId);
    if (!conversation || !conversation.currentIntent) {
      return {
        type: 'error',
        message: '对话不存在或没有待执行的功能',
      };
    }

    // 检查参数是否完整
    const intent = conversation.currentIntent;

    // 简单的参数完整性检查（实际应该根据意图类型验证）
    const isComplete = this.validateParams(intent, params);

    if (isComplete) {
      // 参数完整，执行功能
      const modelToUse = intent.recommendedModel || 'doubao-seed-2-0-pro-260215';
      return await this.executeFunction(conversationId, intent, conversation.userId, modelToUse);
    } else {
      // 参数仍不完整，继续收集
      const prompt = this.generateParameterPrompt(intent);

      await this.conversationManagerService.addMessage(conversationId, 'assistant', prompt);

      return {
        type: 'collect_params',
        message: prompt,
        intent,
        conversationId,
        recommendedModel: intent.recommendedModel,
      };
    }
  }

  /**
   * 与LLM进行普通对话
   */
  private async chatWithLLM(
    message: string,
    history: Message[],
    model: string = 'doubao-seed-1-8-251228'
  ): Promise<string> {
    console.log('=== AI Chat: LLM对话 ===');
    console.log('使用模型:', model);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: '你是星小帮，一个专业的智能助手，专业、友好、乐于助人。请用简洁明了的语言回答问题。',
      },
      ...history
        .filter(m => m.role !== 'system')
        .slice(-10)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      {
        role: 'user',
        content: message,
      },
    ];

    try {
      const response = await this.llmClient.invoke(messages, {
        model,
        temperature: 0.7,
        thinking: 'disabled',
        caching: 'disabled',
      });

      console.log('=== AI Chat: LLM响应成功 ===');
      console.log('响应长度:', response.content?.length || 0);

      return response.content || '抱歉，我暂时无法生成回复，请稍后再试。';
    } catch (error: any) {
      console.error('=== AI Chat: LLM调用失败 ===');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);

      // 返回友好的错误信息
      if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        return '抱歉，响应超时了，请稍后再试。';
      }
      if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        return '抱歉，服务配置有误，请联系管理员。';
      }
      return `抱歉，服务暂时不可用，请稍后再试。${error.message ? `（错误: ${error.message}）` : ''}`;
    }
  }

  /**
   * 生成参数收集提示
   */
  private generateParameterPrompt(intent: Intent): string {
    const prompts: Record<string, string> = {
      quick_note: '请告诉我您想记录的灵感内容。',
      topic_generation: '请告诉我您想在哪些平台发布选题？（例如：抖音、小红书、视频号）',
      content_generation: '请告诉我：\n1️⃣ 您想生成什么内容？\n2️⃣ 发布到哪些平台？\n3️⃣ 需要几个版本？',
      lexicon_optimize: '请提供您想优化的文本内容。',
      viral_replicate: '请提供您想分析的抖音视频链接。',
    };

    return prompts[intent.type] || '请提供更多信息...';
  }

  /**
   * 验证参数完整性
   */
  private validateParams(intent: Intent, params: Record<string, any>): boolean {
    const requiredParams: Record<string, string[]> = {
      quick_note: ['content'],
      topic_generation: ['platforms'],
      content_generation: ['topics', 'platforms'],
      lexicon_optimize: ['inputText'],
      viral_replicate: ['douyinUrl'],
    };

    const required = requiredParams[intent.type] || [];

    return required.every(param => {
      const value = params[param];
      return value !== undefined && value !== null && value !== '';
    });
  }

  /**
   * 获取对话历史
   */
  async getHistory(conversationId: string): Promise<Message[]> {
    return this.conversationManagerService.getConversationHistory(conversationId);
  }

  /**
   * 完成对话
   */
  async completeConversation(conversationId: string): Promise<void> {
    await this.conversationManagerService.completeConversation(conversationId);
  }

  /**
   * 取消对话
   */
  async cancelConversation(conversationId: string): Promise<void> {
    await this.conversationManagerService.cancelConversation(conversationId);
  }
}
