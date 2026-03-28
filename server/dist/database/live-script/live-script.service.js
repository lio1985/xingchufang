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
exports.LiveScriptService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../storage/database/supabase-client");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let LiveScriptService = class LiveScriptService {
    constructor() {
        this.client = (0, supabase_client_1.getSupabaseClient)();
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async findAll() {
        const { data, error } = await this.client
            .from('live_scripts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.client
            .from('live_scripts')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async create(body) {
        const { data, error } = await this.client
            .from('live_scripts')
            .insert({
            title: body.title,
            date: body.date,
            content: body.content,
            duration: body.duration ? parseInt(body.duration) : null,
            viewer_count: body.viewer_count ? parseInt(body.viewer_count) : null
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async update(id, body) {
        const updateData = {};
        if (body.title)
            updateData.title = body.title;
        if (body.date)
            updateData.date = body.date;
        if (body.content)
            updateData.content = body.content;
        if (body.duration)
            updateData.duration = parseInt(body.duration);
        if (body.viewer_count)
            updateData.viewer_count = parseInt(body.viewer_count);
        if (body.analysis)
            updateData.analysis = body.analysis;
        const { data, error } = await this.client
            .from('live_scripts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async delete(id) {
        const { error } = await this.client
            .from('live_scripts')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async analyze(id) {
        const script = await this.findOne(id);
        if (!script) {
            throw new Error('直播话术不存在');
        }
        const prompt = `请分析以下直播话术，提供详细的分析报告：

直播标题：${script.title}
直播日期：${script.date || '未知'}
直播时长：${script.duration || '未知'}分钟
观看人数：${script.viewer_count || '未知'}人
直播内容：
${script.content}

请按以下格式返回JSON数据：
{
  "banned_words": ["违禁词列表"],
  "sensitive_words": ["敏感词列表"],
  "suggestions": ["优化建议列表"],
  "score": 评分(0-100),
  "summary": "直播总结",
  "highlights": ["直播亮点列表"]
}

要求：
1. 检测并列出所有违禁词（如暴力、色情、政治敏感等）
2. 检测并列出所有敏感词（如虚假宣传、夸大宣传等）
3. 提供3-5条具体的优化建议
4. 给出综合评分（0-100分）
5. 用一句话总结本次直播
6. 提炼3-5个直播亮点

请只返回JSON格式的数据，不要包含其他内容。`;
        try {
            const response = await this.llmClient.invoke([
                {
                    role: 'user',
                    content: prompt
                }
            ], {
                model: 'ep-20250115141228-dw8f5',
                temperature: 0.3,
                thinking: 'disabled',
                caching: 'disabled'
            });
            let analysis;
            try {
                const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysis = JSON.parse(jsonMatch[0]);
                }
                else {
                    analysis = JSON.parse(response.content);
                }
            }
            catch (e) {
                analysis = {
                    banned_words: [],
                    sensitive_words: [],
                    suggestions: ['话术分析失败，请重试'],
                    score: 60,
                    summary: '分析失败',
                    highlights: []
                };
            }
            await this.update(id, { analysis });
            return analysis;
        }
        catch (error) {
            console.error('AI分析失败:', error);
            throw new Error('AI分析失败');
        }
    }
};
exports.LiveScriptService = LiveScriptService;
exports.LiveScriptService = LiveScriptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LiveScriptService);
//# sourceMappingURL=live-script.service.js.map