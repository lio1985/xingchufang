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
exports.InspirationController = void 0;
const common_1 = require("@nestjs/common");
const inspiration_service_1 = require("./inspiration.service");
let InspirationController = class InspirationController {
    constructor(inspirationService) {
        this.inspirationService = inspirationService;
    }
    findAll() {
        const inspirations = this.inspirationService.findAll();
        return {
            code: 200,
            msg: 'success',
            data: inspirations
        };
    }
    create(createInspirationDto) {
        console.log('创建灵感，请求参数：', createInspirationDto);
        if (!createInspirationDto.content || createInspirationDto.content.trim() === '') {
            return {
                code: 400,
                msg: '灵感内容不能为空',
                data: null
            };
        }
        const inspiration = this.inspirationService.create(createInspirationDto);
        console.log('灵感创建成功：', inspiration);
        return {
            code: 200,
            msg: 'success',
            data: inspiration
        };
    }
    delete(id) {
        console.log('删除灵感，ID：', id);
        const success = this.inspirationService.delete(id);
        if (success) {
            console.log('灵感删除成功');
            return {
                code: 200,
                msg: 'success',
                data: null
            };
        }
        else {
            console.log('灵感删除失败，未找到该灵感');
            return {
                code: 404,
                msg: '灵感不存在',
                data: null
            };
        }
    }
};
exports.InspirationController = InspirationController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InspirationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InspirationController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspirationController.prototype, "delete", null);
exports.InspirationController = InspirationController = __decorate([
    (0, common_1.Controller)('inspirations'),
    __metadata("design:paramtypes", [inspiration_service_1.InspirationService])
], InspirationController);
//# sourceMappingURL=inspiration.controller.js.map