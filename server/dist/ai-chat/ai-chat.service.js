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
exports.AiChatService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
const intent_recognition_service_1 = require("./intent-recognition.service");
const conversation_manager_service_1 = require("./conversation-manager.service");
const function_executor_service_1 = require("./function-executor.service");
let AiChatService = class AiChatService {
    constructor(intentRecognitionService, conversationManagerService, functionExecutorService) {
        this.intentRecognitionService = intentRecognitionService;
        this.conversationManagerService = conversationManagerService;
        this.functionExecutorService = functionExecutorService;
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async handleMessage(request) {
        console.log('=== AI Chat: 开始处理消息 ===');
        console.log('用户ID:', request.userId);
        console.log('消息内容:', request.message);
        try {
            let conversationId = request.conversationId;
            let conversation;
            if (conversationId) {
                conversation = await this.conversationManagerService.getConversation(conversationId);
            }
            if (!conversation) {
                conversation = await this.conversationManagerService.getActiveConversation(request.userId);
                if (!conversation) {
                    conversation = await this.conversationManagerService.createConversation(request.userId);
                }
                conversationId = conversation.id;
            }
            console.log('对话ID:', conversationId);
            if (!conversationId) {
                throw new Error('对话ID不能为空');
            }
            await this.conversationManagerService.addMessage(conversationId, 'user', request.message);
            const history = await this.conversationManagerService.getConversationHistory(conversationId);
            const intent = await this.intentRecognitionService.recognizeIntent(request.message, history);
            const modelToUse = request.model || intent.recommendedModel || 'doubao-seed-2-0-pro-260215';
            console.log('使用模型:', modelToUse);
            console.log('推荐模型:', intent.recommendedModel);
            if (intent.type === 'unknown') {
                const response = await this.chatWithLLM(request.message, history, modelToUse);
                await this.conversationManagerService.addMessage(conversationId, 'assistant', response);
                return {
                    type: 'text',
                    message: response,
                    conversationId,
                    recommendedModel: intent.recommendedModel,
                };
            }
            await this.conversationManagerService.updateConversationIntent(conversationId, intent);
            if (this.intentRecognitionService.isParamsComplete(intent)) {
                const result = await this.executeFunction(conversationId, intent, request.userId, modelToUse);
                return result;
            }
            else {
                const collectResult = await this.collectParameters(conversationId, intent);
                return {
                    ...collectResult,
                    recommendedModel: intent.recommendedModel,
                };
            }
        }
        catch (error) {
            console.error('处理消息失败:', error);
            return {
                type: 'error',
                message: error.message || '处理消息失败',
            };
        }
    }
    async collectParameters(conversationId, intent) {
        console.log('=== AI Chat: 需要收集参数 ===');
        console.log('缺失参数:', intent.missingParams);
        const prompt = this.generateParameterPrompt(intent);
        await this.conversationManagerService.addMessage(conversationId, 'assistant', prompt);
        return {
            type: 'collect_params',
            message: prompt,
            intent,
            conversationId,
        };
    }
    async executeFunction(conversationId, intent, userId, model) {
        console.log('=== AI Chat: 执行功能 ===');
        console.log('功能类型:', intent.type);
        console.log('使用模型:', model);
        const conversation = await this.conversationManagerService.getConversation(conversationId);
        if (!conversation) {
            throw new Error('对话不存在');
        }
        if (!conversation.userId) {
            throw new Error('对话用户ID不存在');
        }
        const allParams = {
            ...conversation.collectedParams,
            ...intent.extractedParams,
        };
        const result = await this.functionExecutorService.executeFunction(intent, allParams, conversation.userId);
        let responseMessage = '';
        if (result.success) {
            responseMessage = result.data?.message || '功能执行完成！';
        }
        else {
            responseMessage = `❌ ${result.error || '功能执行失败'}`;
        }
        await this.conversationManagerService.addMessage(conversationId, 'assistant', responseMessage, {
            result,
        });
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
    async submitParams(conversationId, params) {
        console.log('=== AI Chat: 提交参数 ===');
        console.log('参数:', params);
        await this.conversationManagerService.mergeCollectedParams(conversationId, params);
        const conversation = await this.conversationManagerService.getConversation(conversationId);
        if (!conversation || !conversation.currentIntent) {
            return {
                type: 'error',
                message: '对话不存在或没有待执行的功能',
            };
        }
        const intent = conversation.currentIntent;
        const isComplete = this.validateParams(intent, params);
        if (isComplete) {
            const modelToUse = intent.recommendedModel || 'doubao-seed-2-0-pro-260215';
            return await this.executeFunction(conversationId, intent, conversation.userId, modelToUse);
        }
        else {
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
    async chatWithLLM(message, history, model = 'doubao-seed-1-8-251228') {
        console.log('=== AI Chat: LLM对话 ===');
        console.log('使用模型:', model);
        const messages = [
            {
                role: 'system',
                content: '你是星小帮，一个专业的智能助手，专业、友好、乐于助人。请用简洁明了的语言回答问题。',
            },
            ...history
                .filter(m => m.role !== 'system')
                .slice(-10)
                .map(m => ({
                role: m.role,
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
        }
        catch (error) {
            console.error('=== AI Chat: LLM调用失败 ===');
            console.error('错误信息:', error.message);
            console.error('错误堆栈:', error.stack);
            if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
                return '抱歉，响应超时了，请稍后再试。';
            }
            if (error.message?.includes('API key') || error.message?.includes('authentication')) {
                return '抱歉，服务配置有误，请联系管理员。';
            }
            return `抱歉，服务暂时不可用，请稍后再试。${error.message ? `（错误: ${error.message}）` : ''}`;
        }
    }
    generateParameterPrompt(intent) {
        const prompts = {
            quick_note: '请告诉我您想记录的灵感内容。',
            topic_generation: '请告诉我您想在哪些平台发布选题？（例如：抖音、小红书、视频号）',
            content_generation: '请告诉我：\n1️⃣ 您想生成什么内容？\n2️⃣ 发布到哪些平台？\n3️⃣ 需要几个版本？',
            lexicon_optimize: '请提供您想优化的文本内容。',
            viral_replicate: '请提供您想分析的抖音视频链接。',
        };
        return prompts[intent.type] || '请提供更多信息...';
    }
    validateParams(intent, params) {
        const requiredParams = {
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
    async getHistory(conversationId) {
        return this.conversationManagerService.getConversationHistory(conversationId);
    }
    async completeConversation(conversationId) {
        await this.conversationManagerService.completeConversation(conversationId);
    }
    async cancelConversation(conversationId) {
        await this.conversationManagerService.cancelConversation(conversationId);
    }
};
exports.AiChatService = AiChatService;
exports.AiChatService = AiChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [intent_recognition_service_1.IntentRecognitionService,
        conversation_manager_service_1.ConversationManagerService,
        function_executor_service_1.FunctionExecutorService])
], AiChatService);
//# sourceMappingURL=ai-chat.service.js.map