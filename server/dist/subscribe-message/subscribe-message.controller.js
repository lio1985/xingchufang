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
exports.SubscribeMessageController = void 0;
const common_1 = require("@nestjs/common");
const subscribe_message_service_1 = require("./subscribe-message.service");
const active_user_guard_1 = require("../guards/active-user.guard");
let SubscribeMessageController = class SubscribeMessageController {
    constructor(subscribeService) {
        this.subscribeService = subscribeService;
    }
    async subscribe(req, body) {
        const userId = req.user?.sub;
        return this.subscribeService.subscribe(userId, body.templateId, body.wxTemplateId);
    }
    async unsubscribe(req, body) {
        const userId = req.user?.sub;
        return this.subscribeService.unsubscribe(userId, body.templateId);
    }
    async getStatus(req) {
        const userId = req.user?.sub;
        return this.subscribeService.getSubscribeStatus(userId);
    }
    async send(body) {
        return this.subscribeService.sendSubscribeMessage(body.userId, body.templateId, body.data, body.page);
    }
    async batchSend(body) {
        return this.subscribeService.batchSendSubscribeMessage(body.userIds, body.templateId, body.data, body.page);
    }
};
exports.SubscribeMessageController = SubscribeMessageController;
__decorate([
    (0, common_1.Post)('subscribe'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscribeMessageController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('unsubscribe'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscribeMessageController.prototype, "unsubscribe", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscribeMessageController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscribeMessageController.prototype, "send", null);
__decorate([
    (0, common_1.Post)('batch-send'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscribeMessageController.prototype, "batchSend", null);
exports.SubscribeMessageController = SubscribeMessageController = __decorate([
    (0, common_1.Controller)('subscribe'),
    __metadata("design:paramtypes", [subscribe_message_service_1.SubscribeMessageService])
], SubscribeMessageController);
//# sourceMappingURL=subscribe-message.controller.js.map