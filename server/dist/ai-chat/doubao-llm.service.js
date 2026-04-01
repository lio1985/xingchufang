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
exports.DoubaoLLMService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let DoubaoLLMService = class DoubaoLLMService {
    constructor() {
        this.apiKey = process.env.DOUBAO_API_KEY || 'b01b6e17-95c5-4e3a-b6bf-4bc5b6872f73';
        this.apiUrl = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
        this.endpointId = process.env.DOUBAO_ENDPOINT_ID || 'ep-20260330092928-8pdcz';
        console.log('=== DoubaoLLM: 初始化 ===');
        console.log('API URL:', this.apiUrl);
        console.log('接入点 ID:', this.endpointId);
        console.log('API Key 前8位:', this.apiKey?.substring(0, 8) + '...');
    }
    async invoke(messages, options) {
        console.log('=== DoubaoLLM: 调用 API ===');
        console.log('消息数量:', messages.length);
        console.log('使用模型(接入点ID):', this.endpointId);
        const requestBody = {
            model: this.endpointId,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.max_tokens ?? 2000,
        };
        console.log('请求体:', JSON.stringify(requestBody, null, 2));
        try {
            const startTime = Date.now();
            const response = await axios_1.default.post(this.apiUrl, requestBody, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            const elapsed = Date.now() - startTime;
            console.log('=== DoubaoLLM: API 响应成功 ===');
            console.log('耗时:', elapsed, 'ms');
            const data = response.data;
            const content = data.choices?.[0]?.message?.content || '';
            console.log('响应内容长度:', content.length);
            console.log('Token 使用:', data.usage);
            return {
                content,
                usage: data.usage,
            };
        }
        catch (error) {
            console.error('=== DoubaoLLM: API 调用失败 ===');
            console.error('错误信息:', error.message);
            if (error.response) {
                console.error('响应状态:', error.response.status);
                console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }
    }
};
exports.DoubaoLLMService = DoubaoLLMService;
exports.DoubaoLLMService = DoubaoLLMService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DoubaoLLMService);
//# sourceMappingURL=doubao-llm.service.js.map