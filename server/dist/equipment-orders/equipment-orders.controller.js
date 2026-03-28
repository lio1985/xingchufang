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
exports.EquipmentOrdersController = void 0;
const common_1 = require("@nestjs/common");
const equipment_orders_service_1 = require("./equipment-orders.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const optional_auth_guard_1 = require("../guards/optional-auth.guard");
const admin_guard_1 = require("../guards/admin.guard");
let EquipmentOrdersController = class EquipmentOrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(dto, req) {
        return this.ordersService.createOrder(dto, req.user.id);
    }
    async getList(orderType, status, page = '1', limit = '20', req) {
        if (!req.user?.id) {
            return {
                success: true,
                data: {
                    list: [],
                    pagination: { page: 1, limit: 20, total: 0 },
                },
            };
        }
        return this.ordersService.getOrders({
            userId: req.user.id,
            userRole: req.user.role,
            orderType,
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
        });
    }
    async getDetail(id, req) {
        return this.ordersService.getOrderDetail(id, req.user.id);
    }
    async accept(id, req) {
        return this.ordersService.acceptOrder(id, req.user.id);
    }
    async transfer(id, toUserId, reason, req) {
        return this.ordersService.transferOrder(id, req.user.id, toUserId, reason);
    }
    async requestCancel(id, reason, req) {
        return this.ordersService.requestCancel(id, req.user.id, reason);
    }
    async confirmCancel(id, approved, req) {
        return this.ordersService.confirmCancel(id, req.user.id, approved);
    }
    async addFollowUp(id, dto, req) {
        return this.ordersService.addFollowUp(id, req.user.id, dto);
    }
    async complete(id, req) {
        return this.ordersService.completeOrder(id, req.user.id);
    }
    async reassign(id, newUserId, req) {
        return this.ordersService.reassignOrder(id, newUserId, req.user.id);
    }
    async update(id, dto, req) {
        return this.ordersService.updateOrder(id, dto, req.user.id);
    }
    async delete(id, req) {
        return this.ordersService.deleteOrder(id, req.user.id);
    }
    async getAvailableUsers() {
        return this.ordersService.getAvailableUsers();
    }
};
exports.EquipmentOrdersController = EquipmentOrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('orderType')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "getList", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('toUserId')),
    __param(2, (0, common_1.Body)('reason')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)(':id/request-cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "requestCancel", null);
__decorate([
    (0, common_1.Post)(':id/confirm-cancel'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('approved')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "confirmCancel", null);
__decorate([
    (0, common_1.Post)(':id/follow-up'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "addFollowUp", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/reassign'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newUserId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "reassign", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('users/available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EquipmentOrdersController.prototype, "getAvailableUsers", null);
exports.EquipmentOrdersController = EquipmentOrdersController = __decorate([
    (0, common_1.Controller)('equipment-orders'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __metadata("design:paramtypes", [equipment_orders_service_1.EquipmentOrdersService])
], EquipmentOrdersController);
//# sourceMappingURL=equipment-orders.controller.js.map