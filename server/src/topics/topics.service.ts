import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '../storage/database/supabase-client';

export interface Topic {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  platform: string;
  content_type: string;
  status: 'draft' | 'in_progress' | 'published' | 'archived';
  priority: number;
  tags: string[] | null;
  target_audience: string | null;
  key_points: string | null;
  reference_urls: string[] | null;
  ai_analysis: Record<string, any> | null;
  inspiration_data: Record<string, any> | null;
  scheduled_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTopicDto {
  title: string;
  description?: string;
  category?: string;
  platform?: string;
  content_type?: string;
  status?: 'draft' | 'in_progress' | 'published' | 'archived';
  priority?: number;
  tags?: string[];
  target_audience?: string;
  key_points?: string;
  reference_urls?: string[];
  ai_analysis?: Record<string, any>;
  inspiration_data?: Record<string, any>;
  scheduled_date?: string;
}

export interface UpdateTopicDto {
  title?: string;
  description?: string;
  category?: string;
  platform?: string;
  content_type?: string;
  status?: 'draft' | 'in_progress' | 'published' | 'archived';
  priority?: number;
  tags?: string[];
  target_audience?: string;
  key_points?: string;
  reference_urls?: string[];
  inspiration_data?: Record<string, any>;
  scheduled_date?: string;
  published_at?: string;
}

export interface TopicQueryDto {
  status?: string;
  category?: string;
  platform?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class TopicsService {
  private llmClient: LLMClient;

  constructor() {
    const config = new Config();
    this.llmClient = new LLMClient(config);
  }

  /**
   * 获取选题列表
   */
  async getAll(userId: string, query: TopicQueryDto) {
    const client = getSupabaseClient();
    const { status, category, platform, search, page = 1, pageSize = 20 } = query;

    try {
      // 构建查询
      let queryBuilder = client
        .from('topics')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // 添加筛选条件
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

      // 分页
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[TopicsService] 获取选题列表失败:', error);
        throw new BadRequestException(`获取选题列表失败: ${error.message}`);
      }

      return {
        items: data || [],
        total: count || 0,
        page,
        pageSize,
      };
    } catch (error: any) {
      console.error('[TopicsService] getAll error:', error);
      throw error;
    }
  }

  /**
   * 获取单个选题
   */
  async getById(userId: string, id: string): Promise<Topic> {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('选题不存在');
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException('无权访问此选题');
    }

    return data as Topic;
  }

  /**
   * 创建选题
   */
  async create(userId: string, dto: CreateTopicDto): Promise<Topic> {
    const client = getSupabaseClient();

    try {
      console.log('[TopicsService] 创建选题, userId:', userId, 'dto:', JSON.stringify(dto));

      // 验证必填字段
      if (!dto.title) {
        throw new BadRequestException('标题不能为空');
      }

      if (!userId) {
        throw new BadRequestException('用户ID不能为空');
      }

      const insertData: Record<string, any> = {
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
        throw new BadRequestException(`创建选题失败: ${error.message}`);
      }

      console.log('[TopicsService] 创建成功, topicId:', data?.id);
      return data as Topic;
    } catch (error: any) {
      console.error('[TopicsService] 创建选题失败:', error.message, error.stack);
      throw error;
    }
  }

  /**
   * 更新选题
   */
  async update(userId: string, id: string, dto: UpdateTopicDto): Promise<Topic> {
    const client = getSupabaseClient();

    // 验证所有权
    await this.getById(userId, id);

    const updateData: Record<string, any> = {
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
      throw new BadRequestException(`更新选题失败: ${error.message}`);
    }

    return data as Topic;
  }

  /**
   * 删除选题
   */
  async delete(userId: string, id: string): Promise<void> {
    const client = getSupabaseClient();

    // 验证所有权
    await this.getById(userId, id);

    const { error } = await client
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`删除选题失败: ${error.message}`);
    }
  }

  /**
   * AI分析选题
   */
  async analyzeWithAI(userId: string, id: string): Promise<Record<string, any>> {
    // 获取选题信息
    const topic = await this.getById(userId, id);

    const messages = [
      {
        role: 'system' as const,
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
        role: 'user' as const,
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

    // 解析 AI 响应
    let analysisResult: Record<string, any>;
    try {
      // 尝试提取 JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = { rawContent: response.content };
      }
    } catch (error) {
      analysisResult = { rawContent: response.content, parseError: true };
    }

    // 保存分析结果到数据库
    const client = getSupabaseClient();
    await client
      .from('topics')
      .update({ ai_analysis: analysisResult, updated_at: new Date().toISOString() })
      .eq('id', id);

    return analysisResult;
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(
    userId: string,
    ids: string[],
    status: 'draft' | 'in_progress' | 'published' | 'archived'
  ): Promise<void> {
    const client = getSupabaseClient();

    const { error } = await client
      .from('topics')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException(`批量更新失败: ${error.message}`);
    }
  }

  /**
   * 获取统计数据
   */
  async getStatistics(userId: string): Promise<Record<string, any>> {
    const client = getSupabaseClient();

    try {
      // 获取各状态数量
      const { data: statusData, error: statusError } = await client
        .from('topics')
        .select('status')
        .eq('user_id', userId);

      if (statusError) {
        console.error('[TopicsService] 获取状态统计失败:', statusError);
      }

      const statusCounts: Record<string, number> = {
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

      // 获取分类分布
      const { data: categoryData } = await client
        .from('topics')
        .select('category')
        .eq('user_id', userId)
        .not('category', 'is', null);

      const categoryCounts: Record<string, number> = {};
      (categoryData || []).forEach(item => {
        if (item.category) {
          categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        }
      });

      // 获取平台分布
      const { data: platformData } = await client
        .from('topics')
        .select('platform')
        .eq('user_id', userId);

      const platformCounts: Record<string, number> = {};
      (platformData || []).forEach(item => {
        if (item.platform) {
          platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
        }
      });

      // 获取总数
      const total = (statusData || []).length;

      return {
        total,
        byStatus: statusCounts,
        byCategory: categoryCounts,
        byPlatform: platformCounts,
      };
    } catch (error: any) {
      console.error('[TopicsService] 获取统计数据失败:', error);
      // 返回默认值，避免 500 错误
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
}
