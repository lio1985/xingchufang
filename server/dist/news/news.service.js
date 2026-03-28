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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let NewsService = class NewsService {
    constructor() {
        const config = new coze_coding_dev_sdk_1.Config();
        this.searchClient = new coze_coding_dev_sdk_1.SearchClient(config);
    }
    async search(keyword, timeRange) {
        console.log('=== 开始 Web Search ===');
        console.log('Keyword:', keyword);
        console.log('Time Range:', timeRange);
        try {
            const response = await this.searchClient.advancedSearch(keyword, {
                searchType: 'web',
                count: 10,
                needSummary: true,
                timeRange: timeRange,
            });
            console.log('=== Search Response ===');
            console.log('Summary:', response.summary?.substring(0, 100) || 'No summary');
            console.log('Web items count:', response.web_items?.length || 0);
            const results = response.web_items?.map(item => ({
                id: item.id,
                title: item.title,
                url: item.url,
                snippet: item.snippet,
                siteName: item.site_name,
                publishTime: item.publish_time,
            })) || [];
            const summary = response.summary || '';
            return {
                summary,
                results
            };
        }
        catch (error) {
            console.error('Web Search error:', error);
            throw error;
        }
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], NewsService);
//# sourceMappingURL=news.service.js.map