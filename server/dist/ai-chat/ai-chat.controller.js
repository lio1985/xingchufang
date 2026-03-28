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
exports.AiChatController = void 0;
const common_1 = require("@nestjs/common");
const ai_chat_service_1 = require("./ai-chat.service");
const optional_auth_guard_1 = require("../guards/optional-auth.guard");
const uuid_1 = require("uuid");
let AiChatController = class AiChatController {
    constructor(aiChatService) {
        this.aiChatService = aiChatService;
    }
    async sendMessage(body) {
        try {
            console.log('=== Controller: 接收消息请求 ===');
            console.log('Message:', body.message);
            console.log('UserId:', body.userId);
            console.log('ConversationId:', body.conversationId);
            if (!body.message || !body.userId) {
                throw new common_1.HttpException('消息和用户ID不能为空', common_1.HttpStatus.BAD_REQUEST);
            }
            const response = await this.aiChatService.handleMessage({
                message: body.message,
                userId: body.userId,
                conversationId: body.conversationId,
                model: body.model || 'doubao-seed-1-8-251228',
            });
            console.log('=== Controller: 返回响应 ===');
            console.log('Response type:', response.type);
            return {
                code: 200,
                msg: 'success',
                data: response,
            };
        }
        catch (error) {
            console.error('Controller: 处理消息失败:', error);
            throw new common_1.HttpException(error.message || '处理消息失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async submitParams(body) {
        try {
            console.log('=== Controller: 接收参数提交 ===');
            console.log('ConversationId:', body.conversationId);
            console.log('Params:', body.params);
            if (!body.conversationId || !body.params) {
                throw new common_1.HttpException('对话ID和参数不能为空', common_1.HttpStatus.BAD_REQUEST);
            }
            const response = await this.aiChatService.submitParams(body.conversationId, body.params);
            console.log('=== Controller: 返回参数提交响应 ===');
            console.log('Response type:', response.type);
            return {
                code: 200,
                msg: 'success',
                data: response,
            };
        }
        catch (error) {
            console.error('Controller: 提交参数失败:', error);
            throw new common_1.HttpException(error.message || '提交参数失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getHistory(conversationId) {
        try {
            console.log('=== Controller: 获取对话历史 ===');
            console.log('ConversationId:', conversationId);
            const history = await this.aiChatService.getHistory(conversationId);
            console.log('=== Controller: 返回对话历史 ===');
            console.log('History length:', history.length);
            return {
                code: 200,
                msg: 'success',
                data: {
                    history,
                },
            };
        }
        catch (error) {
            console.error('Controller: 获取对话历史失败:', error);
            throw new common_1.HttpException(error.message || '获取对话历史失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async completeConversation(conversationId) {
        try {
            console.log('=== Controller: 完成对话 ===');
            console.log('ConversationId:', conversationId);
            await this.aiChatService.completeConversation(conversationId);
            return {
                code: 200,
                msg: 'success',
                data: {
                    message: '对话已完成',
                },
            };
        }
        catch (error) {
            console.error('Controller: 完成对话失败:', error);
            throw new common_1.HttpException(error.message || '完成对话失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelConversation(conversationId) {
        try {
            console.log('=== Controller: 取消对话 ===');
            console.log('ConversationId:', conversationId);
            await this.aiChatService.cancelConversation(conversationId);
            return {
                code: 200,
                msg: 'success',
                data: {
                    message: '对话已取消',
                },
            };
        }
        catch (error) {
            console.error('Controller: 取消对话失败:', error);
            throw new common_1.HttpException(error.message || '取消对话失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async chat(body, req) {
        try {
            console.log('=== Controller: 旧版对话接口 ===');
            const { message, model = 'doubao-seed-1-8-251228', history = [] } = body;
            if (!message) {
                throw new common_1.HttpException('消息不能为空', common_1.HttpStatus.BAD_REQUEST);
            }
            const userId = req.user?.id || (0, uuid_1.v4)();
            console.log('使用用户ID:', userId);
            const response = await this.aiChatService.handleMessage({
                message,
                userId,
                model,
            });
            return {
                code: 200,
                msg: 'success',
                data: {
                    content: response.message,
                },
            };
        }
        catch (error) {
            console.error('Controller: 旧版对话失败:', error);
            throw new common_1.HttpException(error.message || '对话失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AiChatController = AiChatController;
__decorate([
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('submit-params'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "submitParams", null);
__decorate([
    (0, common_1.Get)('history/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)('complete/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "completeConversation", null);
__decorate([
    (0, common_1.Post)('cancel/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "cancelConversation", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "chat", null);
exports.AiChatController = AiChatController = __decorate([
    (0, common_1.Controller)('ai-chat'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __metadata("design:paramtypes", [ai_chat_service_1.AiChatService])
], AiChatController);
//# sourceMappingURL=ai-chat.controller.js.map