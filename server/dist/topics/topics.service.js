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
const pg_pool_1 = require("../storage/database/pg-pool");
let TopicsService = class TopicsService {
    constructor() {
        this.client = (0, supabase_client_1.getSupabaseClient)();
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async getAll(userId, query) {
        const pool = (0, pg_pool_1.getPool)();
        const { status, category, platform, search, page = 1, pageSize = 20 } = query;
        const conditions = ['user_id = $1'];
        const values = [userId];
        let paramIndex = 2;
        if (status && status !== 'all') {
            conditions.push(`status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }
        if (category) {
            conditions.push(`category = $${paramIndex}`);
            values.push(category);
            paramIndex++;
        }
        if (platform && platform !== 'all') {
            conditions.push(`platform = $${paramIndex}`);
            values.push(platform);
            paramIndex++;
        }
        if (search) {
            conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }
        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * pageSize;
        const countQuery = `SELECT COUNT(*) as total FROM topics WHERE ${whereClause}`;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].total, 10);
        const listQuery = `
      SELECT * FROM topics 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        values.push(pageSize, offset);
        const listResult = await pool.query(listQuery, values);
        return {
            items: listResult.rows,
            total,
            page,
            pageSize,
        };
    }
    async getById(userId, id) {
        const pool = (0, pg_pool_1.getPool)();
        const query = 'SELECT * FROM topics WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('选题不存在');
        }
        const topic = result.rows[0];
        if (topic.user_id !== userId) {
            throw new common_1.ForbiddenException('无权访问此选题');
        }
        return topic;
    }
    async create(userId, dto) {
        const pool = (0, pg_pool_1.getPool)();
        const query = `
      INSERT INTO topics (
        user_id, title, description, category, platform, content_type,
        status, priority, tags, target_audience, key_points,
        reference_urls, ai_analysis, inspiration_data, scheduled_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
        const values = [
            userId,
            dto.title,
            dto.description || null,
            dto.category || null,
            dto.platform || '公众号',
            dto.content_type || '图文',
            dto.status || 'draft',
            dto.priority || 0,
            dto.tags || null,
            dto.target_audience || null,
            dto.key_points || null,
            dto.reference_urls || null,
            dto.ai_analysis || null,
            dto.inspiration_data || null,
            dto.scheduled_date || null,
        ];
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            console.error('[TopicsService] 创建选题失败:', error);
            throw new Error(`创建选题失败: ${error.message}`);
        }
    }
    async update(userId, id, dto) {
        const pool = (0, pg_pool_1.getPool)();
        await this.getById(userId, id);
        const updateFields = ['updated_at = NOW()'];
        const values = [];
        let paramIndex = 1;
        if (dto.title !== undefined) {
            updateFields.push(`title = $${paramIndex}`);
            values.push(dto.title);
            paramIndex++;
        }
        if (dto.description !== undefined) {
            updateFields.push(`description = $${paramIndex}`);
            values.push(dto.description);
            paramIndex++;
        }
        if (dto.category !== undefined) {
            updateFields.push(`category = $${paramIndex}`);
            values.push(dto.category);
            paramIndex++;
        }
        if (dto.platform !== undefined) {
            updateFields.push(`platform = $${paramIndex}`);
            values.push(dto.platform);
            paramIndex++;
        }
        if (dto.content_type !== undefined) {
            updateFields.push(`content_type = $${paramIndex}`);
            values.push(dto.content_type);
            paramIndex++;
        }
        if (dto.status !== undefined) {
            updateFields.push(`status = $${paramIndex}`);
            values.push(dto.status);
            paramIndex++;
        }
        if (dto.priority !== undefined) {
            updateFields.push(`priority = $${paramIndex}`);
            values.push(dto.priority);
            paramIndex++;
        }
        if (dto.tags !== undefined) {
            updateFields.push(`tags = $${paramIndex}`);
            values.push(dto.tags);
            paramIndex++;
        }
        if (dto.target_audience !== undefined) {
            updateFields.push(`target_audience = $${paramIndex}`);
            values.push(dto.target_audience);
            paramIndex++;
        }
        if (dto.key_points !== undefined) {
            updateFields.push(`key_points = $${paramIndex}`);
            values.push(dto.key_points);
            paramIndex++;
        }
        if (dto.reference_urls !== undefined) {
            updateFields.push(`reference_urls = $${paramIndex}`);
            values.push(dto.reference_urls);
            paramIndex++;
        }
        if (dto.inspiration_data !== undefined) {
            updateFields.push(`inspiration_data = $${paramIndex}`);
            values.push(dto.inspiration_data);
            paramIndex++;
        }
        if (dto.scheduled_date !== undefined) {
            updateFields.push(`scheduled_date = $${paramIndex}`);
            values.push(dto.scheduled_date);
            paramIndex++;
        }
        if (dto.published_at !== undefined) {
            updateFields.push(`published_at = $${paramIndex}`);
            values.push(dto.published_at);
            paramIndex++;
        }
        values.push(id);
        const query = `UPDATE topics SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    async delete(userId, id) {
        const pool = (0, pg_pool_1.getPool)();
        await this.getById(userId, id);
        const query = 'DELETE FROM topics WHERE id = $1';
        await pool.query(query, [id]);
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
        const pool = (0, pg_pool_1.getPool)();
        const updateQuery = 'UPDATE topics SET ai_analysis = $1, updated_at = NOW() WHERE id = $2';
        await pool.query(updateQuery, [JSON.stringify(analysisResult), id]);
        return analysisResult;
    }
    async batchUpdateStatus(userId, ids, status) {
        const pool = (0, pg_pool_1.getPool)();
        const query = `
      UPDATE topics 
      SET status = $1, updated_at = NOW()
      WHERE id = ANY($2) AND user_id = $3
    `;
        await pool.query(query, [status, ids, userId]);
    }
    async getStatistics(userId) {
        try {
            const pool = (0, pg_pool_1.getPool)();
            const statusQuery = 'SELECT status, COUNT(*) as count FROM topics WHERE user_id = $1 GROUP BY status';
            const statusResult = await pool.query(statusQuery, [userId]);
            const statusCounts = {
                draft: 0,
                in_progress: 0,
                published: 0,
                archived: 0,
            };
            statusResult.rows.forEach(row => {
                if (statusCounts.hasOwnProperty(row.status)) {
                    statusCounts[row.status] = parseInt(row.count, 10);
                }
            });
            const categoryQuery = 'SELECT category, COUNT(*) as count FROM topics WHERE user_id = $1 AND category IS NOT NULL GROUP BY category';
            const categoryResult = await pool.query(categoryQuery, [userId]);
            const categoryCounts = {};
            categoryResult.rows.forEach(row => {
                categoryCounts[row.category] = parseInt(row.count, 10);
            });
            const platformQuery = 'SELECT platform, COUNT(*) as count FROM topics WHERE user_id = $1 GROUP BY platform';
            const platformResult = await pool.query(platformQuery, [userId]);
            const platformCounts = {};
            platformResult.rows.forEach(row => {
                platformCounts[row.platform] = parseInt(row.count, 10);
            });
            const totalQuery = 'SELECT COUNT(*) as total FROM topics WHERE user_id = $1';
            const totalResult = await pool.query(totalQuery, [userId]);
            return {
                total: parseInt(totalResult.rows[0].total, 10),
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