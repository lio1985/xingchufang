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
exports.QuickNotesController = void 0;
const common_1 = require("@nestjs/common");
const quick_notes_service_1 = require("./quick-notes.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const optional_auth_guard_1 = require("../guards/optional-auth.guard");
const admin_guard_1 = require("../guards/admin.guard");
let QuickNotesController = class QuickNotesController {
    constructor(quickNotesService) {
        this.quickNotesService = quickNotesService;
    }
    async getAll(req, page, pageSize, search, tag, showStarredOnly) {
        try {
            if (!req.user) {
                return {
                    code: 200,
                    msg: 'success',
                    data: {
                        list: [],
                        pagination: {
                            page: page || 1,
                            pageSize: pageSize || 20,
                            total: 0,
                            totalPages: 0,
                        }
                    }
                };
            }
            const userId = req.user.sub;
            const data = await this.quickNotesService.getByUserId(userId, userId, page, pageSize, search, tag, showStarredOnly === 'true');
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async getAllForAdmin(req, page, pageSize, search, tag, showStarredOnly) {
        try {
            const userId = req.user.sub;
            const data = await this.quickNotesService.getAllForAdmin(userId, page, pageSize, search, tag, showStarredOnly === 'true');
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async getAllTags(req) {
        try {
            const userId = req.user.sub;
            const data = await this.quickNotesService.getAllTags(userId);
            return { code: 200, msg: 'success', data: { tags: data } };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async getById(req, id) {
        try {
            if (!req.user) {
                return {
                    code: 200,
                    msg: 'success',
                    data: null
                };
            }
            const userId = req.user.sub;
            const data = await this.quickNotesService.getById(userId, id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async create(req, body) {
        try {
            const userId = req.user.sub;
            const data = await this.quickNotesService.create(userId, body);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async update(req, id, body) {
        try {
            const userId = req.user.sub;
            const data = await this.quickNotesService.update(userId, id, body);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async delete(req, id) {
        try {
            const userId = req.user.sub;
            await this.quickNotesService.delete(userId, id);
            return { code: 200, msg: 'success', data: null };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async batchDelete(req, body) {
        try {
            const userId = req.user.sub;
            await this.quickNotesService.batchDelete(userId, body.ids);
            return { code: 200, msg: 'success', data: null };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async toggleStar(req, id) {
        try {
            const userId = req.user.sub;
            const data = await this.quickNotesService.toggleStar(userId, id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
    async togglePin(req, id) {
        try {
            const userId = req.user.sub;
            const data = await this.quickNotesService.togglePin(userId, id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return { code: statusCode, msg: error.message, data: null };
        }
    }
};
exports.QuickNotesController = QuickNotesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('tag')),
    __param(5, (0, common_1.Query)('showStarredOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('tag')),
    __param(5, (0, common_1.Query)('showStarredOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "getAllForAdmin", null);
__decorate([
    (0, common_1.Get)('admin/tags'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "getAllTags", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)('admin/batch'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "batchDelete", null);
__decorate([
    (0, common_1.Post)(':id/toggle-star'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "toggleStar", null);
__decorate([
    (0, common_1.Post)(':id/toggle-pin'),
    (0, common_1.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], QuickNotesController.prototype, "togglePin", null);
exports.QuickNotesController = QuickNotesController = __decorate([
    (0, common_1.Controller)('quick-notes'),
    __metadata("design:paramtypes", [quick_notes_service_1.QuickNotesService])
], QuickNotesController);
//# sourceMappingURL=quick-notes.controller.js.map