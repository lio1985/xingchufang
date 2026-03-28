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
exports.ConversationController = void 0;
const common_1 = require("@nestjs/common");
const conversation_service_1 = require("./conversation.service");
const active_user_guard_1 = require("../../guards/active-user.guard");
const optional_auth_guard_1 = require("../../guards/optional-auth.guard");
const uuid_util_1 = require("../../utils/uuid.util");
let ConversationController = class ConversationController {
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    async getList(req, targetUserId) {
        try {
            if (!req.user?.id) {
                return { code: 200, msg: 'success', data: [] };
            }
            const validatedTargetUserId = (0, uuid_util_1.parseOptionalUUID)(targetUserId);
            const data = await this.conversationService.getList(req.user.id, validatedTargetUserId);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            return { code: 500, msg: error.message || '获取对话列表失败', data: null };
        }
    }
    async getDetail(conversationId, req) {
        try {
            if (!req.user?.id) {
                return { code: 200, msg: 'success', data: null };
            }
            const data = await this.conversationService.getDetail(conversationId, req.user.id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message || '获取对话详情失败', data: null };
        }
    }
    async create(req, body) {
        try {
            const userId = req.user?.id || body.userId;
            if (!userId) {
                return { code: 400, msg: '用户ID不能为空', data: null };
            }
            const data = await this.conversationService.create({
                userId: userId,
                title: body.title,
                model: body.model,
            });
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message || '创建对话失败', data: null };
        }
    }
    async addMessage(body) {
        try {
            const data = await this.conversationService.addMessage(body);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message || '添加消息失败', data: null };
        }
    }
    async delete(conversationId, req) {
        try {
            if (!req.user?.id) {
                return { code: 400, msg: '用户ID不能为空', data: null };
            }
            const data = await this.conversationService.delete(conversationId, req.user.id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message || '删除对话失败', data: null };
        }
    }
};
exports.ConversationController = ConversationController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)('detail/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('message'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Delete)(':conversationId'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "delete", null);
exports.ConversationController = ConversationController = __decorate([
    (0, common_1.Controller)('conversation'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ConversationController);
//# sourceMappingURL=conversation.controller.js.map