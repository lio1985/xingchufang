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
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const news_service_1 = require("./news.service");
let NewsController = class NewsController {
    constructor(newsService) {
        this.newsService = newsService;
    }
    async search(body) {
        try {
            console.log('=== 后端接收请求 ===');
            console.log('Body:', body);
            const { keyword, timeRange = '1d' } = body;
            if (!keyword) {
                throw new common_1.HttpException('关键词不能为空', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.newsService.search(keyword, timeRange);
            console.log('=== 后端返回结果 ===');
            console.log('Summary length:', result.summary?.length || 0);
            console.log('Results count:', result.results?.length || 0);
            return {
                code: 200,
                msg: 'success',
                data: result
            };
        }
        catch (error) {
            console.error('新闻搜索错误:', error);
            throw new common_1.HttpException(error.message || '搜索失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "search", null);
exports.NewsController = NewsController = __decorate([
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsController);
//# sourceMappingURL=news.controller.js.map