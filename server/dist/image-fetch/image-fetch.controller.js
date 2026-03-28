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
exports.ImageFetchController = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let ImageFetchController = class ImageFetchController {
    async fetchImage(body) {
        const { url } = body;
        const config = new coze_coding_dev_sdk_1.Config();
        const client = new coze_coding_dev_sdk_1.FetchClient(config);
        try {
            const response = await client.fetch(url);
            return {
                code: 200,
                msg: 'success',
                data: response
            };
        }
        catch (error) {
            return {
                code: 500,
                msg: 'error',
                data: error.message
            };
        }
    }
};
exports.ImageFetchController = ImageFetchController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ImageFetchController.prototype, "fetchImage", null);
exports.ImageFetchController = ImageFetchController = __decorate([
    (0, common_1.Controller)('image-fetch')
], ImageFetchController);
//# sourceMappingURL=image-fetch.controller.js.map