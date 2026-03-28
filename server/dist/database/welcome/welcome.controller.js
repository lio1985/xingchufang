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
exports.WelcomeController = void 0;
const common_1 = require("@nestjs/common");
const welcome_service_1 = require("./welcome.service");
let WelcomeController = class WelcomeController {
    constructor(welcomeService) {
        this.welcomeService = welcomeService;
    }
    async getAll() {
        try {
            const data = await this.welcomeService.getAll();
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async create(body) {
        try {
            const data = await this.welcomeService.create(body);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async update(id, body) {
        try {
            const data = await this.welcomeService.update(id, body);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
    async delete(id) {
        try {
            const data = await this.welcomeService.delete(id);
            return { code: 200, msg: 'success', data };
        }
        catch (error) {
            return { code: 500, msg: error.message, data: null };
        }
    }
};
exports.WelcomeController = WelcomeController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WelcomeController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WelcomeController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WelcomeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WelcomeController.prototype, "delete", null);
exports.WelcomeController = WelcomeController = __decorate([
    (0, common_1.Controller)('welcome'),
    __metadata("design:paramtypes", [welcome_service_1.WelcomeService])
], WelcomeController);
//# sourceMappingURL=welcome.controller.js.map