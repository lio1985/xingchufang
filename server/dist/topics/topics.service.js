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
exports.TopicsService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
const supabase_client_1 = require("../storage/database/supabase-client");
let TopicsService = class TopicsService {
    constructor() {
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async getAll(userId, query) {
        const client = (0, supabase_client_1.getSupabaseClient)();
        const { status, category, platform, search, page = 1, pageSize = 20 } = query;
        try {
            let queryBuilder = client
                .from('topics')
                .select('*', { count: 'exact' })
                .eq('user_id', userId);
            if (status && status !== 'all') {
                queryBuilder = queryBuilder.eq('status', status);
            }
            if (category) {
                queryBuilder = queryBuilder.eq('category', category);
            }
            if (platform && platform !== 'all') {
                queryBuilder = queryBuilder.eq('platform', platform);
            }
            if (search) {
                queryBuilder = queryBuilder.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            const { data, error, count } = await queryBuilder
                .order('created_at', { ascending: false })
                .range(from, to);
            if (error) {
                console.error('[TopicsService] 获取选题列表失败:', error);
                throw new common_1.BadRequestException(`获取选题列表失败: ${error.message}`);
            }
            return {
                items: data || [],
                total: count || 0,
                page,
                pageSize,
            };
        }
        catch (error) {
            console.error('[TopicsService] getAll error:', error);
            throw error;
        }
    }
    async getById(userId, id) {
        const client = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await client
            .from('topics')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('选题不存在');
        }
        if (data.user_id !== userId) {
            throw new common_1.ForbiddenException('无权访问此选题');
        }
        return data;
    }
    async create(userId, dto) {
        const client = (0, supabase_client_1.getSupabaseClient)();
        try {
            console.log('[TopicsService] 创建选题, userId:', userId, 'dto:', JSON.stringify(dto));
            if (!dto.title) {
                throw new common_1.BadRequestException('标题不能为空');
            }
            if (!userId) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const insertData = {
                user_id: userId,
                title: dto.title,
                description: dto.description || null,
                category: dto.category || null,
                platform: dto.platform || '公众号',
                content_type: dto.content_type || '图文',
                status: dto.status || 'draft',
                priority: dto.priority || 0,
                tags: dto.tags || null,
                target_audience: dto.target_audience || null,
                key_points: dto.key_points || null,
                reference_urls: dto.reference_urls || null,
                ai_analysis: dto.ai_analysis || null,
                inspiration_data: dto.inspiration_data || null,
                scheduled_date: dto.scheduled_date || null,
            };
            console.log('[TopicsService] 插入数据:', JSON.stringify(insertData));
            const { data, error } = await client
                .from('topics')
                .insert(insertData)
                .select()
                .single();
            if (error) {
                console.error('[TopicsService] 创建选题数据库错误:', error);
                throw new common_1.BadRequestException(`创建选题失败: ${error.message}`);
            }
            console.log('[TopicsService] 创建成功, topicId:', data?.id);
            return data;
        }
        catch (error) {
            console.error('[TopicsService] 创建选题失败:', error.message, error.stack);
            throw error;
        }
    }
    async update(userId, id, dto) {
        const client = (0, supabase_client_1.getSupabaseClient)();
        await this.getById(userId, id);
        const updateData = {
            ...dto,
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await client
            .from('topics')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`更新选题失败: ${error.message}`);
        }
        return data;
    }
    async delete(userId, id) {
        const client = (0, supabase_client_1.getSupabaseClient)();
        await this.getById(userId, id);
        const { error } = await client
            .from('topics')
            .delete()
            .eq('id', id);
        if (error) {
            throw new common_1.BadRequestException(`删除选题失败: ${error.message}`);
        }
    }
    async analyzeWithAI(userId, id) {
        const topic = await this.getById(userId, id);
        const messages = [
            {
                role: 'system',
                content: `你是一个专业的内容策划专家，擅长分析选题并提供创作建议。请基于选题信息，提供详细的分析和建议。

返回格式要求（JSON格式）：
{
  "creativeAngles": [
    {
      "angle": "创意角度名称",
      "description": "角度描述",
      "example": "示例标题或切入点"
    }
  ],
  "suggestedKeywords": ["关键词1", "关键词2", "关键词3"],
  "contentStructure": {
    "introduction": "开头建议",
    "mainPoints": ["要点1", "要点2", "要点3"],
    "conclusion": "结尾建议"
  },
  "targetAudienceAnalysis": {
    "coreAudience": "核心受众描述",
    "painPoints": ["痛点1", "痛点2"],
    "interests": ["兴趣点1", "兴趣点2"]
  },
  "platformOptimization": {
    "title": "优化后的标题建议",
    "coverSuggestion": "封面/头图建议",
    "formatTips": "该平台的内容格式建议"
  },
  "timingSuggestion": {
    "bestPublishTime": "最佳发布时间",
    "reason": "原因分析"
  },
  "riskAssessment": {
    "sensitivePoints": ["敏感点1"],
    "suggestions": ["规避建议"]
  }
}`,
            },
            {
                role: 'user',
                content: `请分析以下选题：

标题：${topic.title}
描述：${topic.description || '无'}
分类：${topic.category || '未分类'}
平台：${topic.platform}
内容类型：${topic.content_type}
目标受众：${topic.target_audience || '未指定'}
核心要点：${topic.key_points || '未指定'}
${topic.inspiration_data ? `灵感数据：${JSON.stringify(topic.inspiration_data)}` : ''}

请提供详细的创作分析和建议。`,
            },
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.7,
        });
        let analysisResult;
        try {
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
            }
            else {
                analysisResult = { rawContent: response.content };
            }
        }
        catch (error) {
            analysisResult = { rawContent: response.content, parseError: true };
        }
        const client = (0, supabase_client_1.getSupabaseClient)();
        await client
            .from('topics')
            .update({ ai_analysis: analysisResult, updated_at: new Date().toISOString() })
            .eq('id', id);
        return analysisResult;
    }
    async batchUpdateStatus(userId, ids, status) {
        const client = (0, supabase_client_1.getSupabaseClient)();
        const { error } = await client
            .from('topics')
            .update({ status, updated_at: new Date().toISOString() })
            .in('id', ids)
            .eq('user_id', userId);
        if (error) {
            throw new common_1.BadRequestException(`批量更新失败: ${error.message}`);
        }
    }
    async getStatistics(userId) {
        const client = (0, supabase_client_1.getSupabaseClient)();
        try {
            const { data: statusData, error: statusError } = await client
                .from('topics')
                .select('status')
                .eq('user_id', userId);
            if (statusError) {
                console.error('[TopicsService] 获取状态统计失败:', statusError);
            }
            const statusCounts = {
                draft: 0,
                in_progress: 0,
                published: 0,
                archived: 0,
            };
            (statusData || []).forEach(item => {
                if (statusCounts.hasOwnProperty(item.status)) {
                    statusCounts[item.status]++;
                }
            });
            const { data: categoryData } = await client
                .from('topics')
                .select('category')
                .eq('user_id', userId)
                .not('category', 'is', null);
            const categoryCounts = {};
            (categoryData || []).forEach(item => {
                if (item.category) {
                    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                }
            });
            const { data: platformData } = await client
                .from('topics')
                .select('platform')
                .eq('user_id', userId);
            const platformCounts = {};
            (platformData || []).forEach(item => {
                if (item.platform) {
                    platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
                }
            });
            const total = (statusData || []).length;
            return {
                total,
                byStatus: statusCounts,
                byCategory: categoryCounts,
                byPlatform: platformCounts,
            };
        }
        catch (error) {
            console.error('[TopicsService] 获取统计数据失败:', error);
            return {
                total: 0,
                byStatus: {
                    draft: 0,
                    in_progress: 0,
                    published: 0,
                    archived: 0,
                },
                byCategory: {},
                byPlatform: {},
            };
        }
    }
};
exports.TopicsService = TopicsService;
exports.TopicsService = TopicsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TopicsService);
//# sourceMappingURL=topics.service.js.map