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
exports.LiveScriptController = void 0;
const common_1 = require("@nestjs/common");
const live_script_service_1 = require("./live-script.service");
let LiveScriptController = class LiveScriptController {
    constructor(liveScriptService) {
        this.liveScriptService = liveScriptService;
    }
    async findAll() {
        try {
            const data = await this.liveScriptService.findAll();
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async findOne(id) {
        try {
            const data = await this.liveScriptService.findOne(id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async create(body) {
        try {
            if (!body.title || !body.title.trim()) {
                return { code: 400, msg: '标题不能为空', data: null };
            }
            if (!body.content || !body.content.trim()) {
                return { code: 400, msg: '内容不能为空', data: null };
            }
            const data = await this.liveScriptService.create({
                title: body.title.trim(),
                date: body.date?.trim(),
                content: body.content.trim(),
                duration: body.duration?.trim(),
                viewer_count: body.viewer_count?.trim()
            });
            return { code: 200, msg: '创建成功', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async update(id, body) {
        try {
            const data = await this.liveScriptService.update(id, body);
            return { code: 200, msg: '更新成功', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async delete(id) {
        try {
            await this.liveScriptService.delete(id);
            return { code: 200, msg: '删除成功', data: null };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async analyze(id) {
        try {
            const data = await this.liveScriptService.analyze(id);
            return { code: 200, msg: '分析成功', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
};
exports.LiveScriptController = LiveScriptController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiveScriptController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LiveScriptController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LiveScriptController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LiveScriptController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LiveScriptController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/analyze'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LiveScriptController.prototype, "analyze", null);
exports.LiveScriptController = LiveScriptController = __decorate([
    (0, common_1.Controller)('live-scripts'),
    __metadata("design:paramtypes", [live_script_service_1.LiveScriptService])
], LiveScriptController);
//# sourceMappingURL=live-script.controller.js.map