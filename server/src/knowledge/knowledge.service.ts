import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { PermissionService } from '../permission/permission.service';

interface KnowledgeItem {
  id: string;
  title: string;
  content?: string;
  category?: string;
  type: string;
  created_at: string;
}

interface KnowledgeStats {
  lexicon: { count: number; label: string };
  knowledge_share: { count: number; label: string };
  product_manual: { count: number; label: string };
  design_knowledge: { count: number; label: string };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  article_count: number;
  created_at: string;
}

interface Article {
  id: string;
  category_id: string;
  title: string;
  content?: string;
  summary?: string;
  author_id?: string;
  view_count: number;
  status: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export { KnowledgeItem, KnowledgeStats, Category, Article };

@Injectable()
export class KnowledgeService {
  private client = getSupabaseClient();

  constructor(private readonly permissionService: PermissionService) {}

  // ==================== 公司资料 - 分类管理 ====================

  /**
   * 获取知识分类列表
   */
  async getCategories(): Promise<Category[]> {
    const { data: categories, error } = await this.client
      .from('knowledge_categories')
      .select(`
        id,
        name,
        description,
        icon,
        color,
        parent_id,
        sort_order,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取分类失败:', error);
      return [];
    }

    // 获取每个分类的文章数量
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await this.client
          .from('knowledge_articles')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'published');

        return {
          ...category,
          article_count: count || 0,
        };
      })
    );

    return categoriesWithCount;
  }

  /**
   * 创建知识分类（管理员）
   */
  async createCategory(userId: string, body: any): Promise<Category> {
    // 验证管理员权限
    await this.checkAdminPermission(userId);

    const { data, error } = await this.client
      .from('knowledge_categories')
      .insert({
        name: body.name,
        description: body.description,
        icon: body.icon,
        color: body.color,
        parent_id: body.parent_id,
        sort_order: body.sort_order || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('创建分类失败:', error);
      throw new Error('创建分类失败');
    }

    return { ...data, article_count: 0 };
  }

  /**
   * 更新知识分类（管理员）
   */
  async updateCategory(userId: string, categoryId: string, body: any): Promise<Category> {
    // 验证管理员权限
    await this.checkAdminPermission(userId);

    const { data, error } = await this.client
      .from('knowledge_categories')
      .update({
        name: body.name,
        description: body.description,
        icon: body.icon,
        color: body.color,
        sort_order: body.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('更新分类失败:', error);
      throw new Error('更新分类失败');
    }

    // 获取文章数量
    const { count } = await this.client
      .from('knowledge_articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('status', 'published');

    return { ...data, article_count: count || 0 };
  }

  /**
   * 删除知识分类（管理员）
   */
  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    // 验证管理员权限
    await this.checkAdminPermission(userId);

    const { error } = await this.client
      .from('knowledge_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', categoryId);

    if (error) {
      console.error('删除分类失败:', error);
      throw new Error('删除分类失败');
    }
  }

  // ==================== 公司资料 - 文章管理 ====================

  /**
   * 获取知识文章列表
   */
  async getArticles(
    categoryId?: string,
    keyword?: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ items: Article[]; total: number }> {
    const offset = (page - 1) * pageSize;

    let query = this.client
      .from('knowledge_articles')
      .select('id, category_id, title, summary, author_id, view_count, status, tags, created_at, updated_at', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%,summary.ilike.%${keyword}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('获取文章列表失败:', error);
      return { items: [], total: 0 };
    }

    return { items: data || [], total: count || 0 };
  }

  /**
   * 获取文章详情
   */
  async getArticleById(articleId: string): Promise<Article | null> {
    const { data, error } = await this.client
      .from('knowledge_articles')
      .select('id, category_id, title, content, summary, author_id, view_count, status, tags, created_at, updated_at')
      .eq('id', articleId)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('获取文章详情失败:', error);
      return null;
    }

    // 增加浏览次数
    await this.client
      .from('knowledge_articles')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', articleId);

    return data;
  }

  /**
   * 创建知识文章
   */
  async createArticle(userId: string, body: any): Promise<Article> {
    const { data, error } = await this.client
      .from('knowledge_articles')
      .insert({
        category_id: body.category_id,
        title: body.title,
        content: body.content,
        summary: body.summary,
        author_id: userId,
        status: body.status || 'draft',
        tags: body.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('创建文章失败:', error);
      throw new Error('创建文章失败');
    }

    return data;
  }

  /**
   * 更新知识文章
   */
  async updateArticle(userId: string, articleId: string, body: any): Promise<Article> {
    // 检查权限：作者或管理员可以编辑
    const { data: article } = await this.client
      .from('knowledge_articles')
      .select('author_id')
      .eq('id', articleId)
      .single();

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    const isAdmin = await this.isAdmin(userId);
    if (article.author_id !== userId && !isAdmin) {
      throw new ForbiddenException('无权编辑此文章');
    }

    const { data, error } = await this.client
      .from('knowledge_articles')
      .update({
        category_id: body.category_id,
        title: body.title,
        content: body.content,
        summary: body.summary,
        status: body.status,
        tags: body.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)
      .select()
      .single();

    if (error) {
      console.error('更新文章失败:', error);
      throw new Error('更新文章失败');
    }

    return data;
  }

  /**
   * 删除知识文章
   */
  async deleteArticle(userId: string, articleId: string): Promise<void> {
    // 检查权限：作者或管理员可以删除
    const { data: article } = await this.client
      .from('knowledge_articles')
      .select('author_id')
      .eq('id', articleId)
      .single();

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    const isAdmin = await this.isAdmin(userId);
    if (article.author_id !== userId && !isAdmin) {
      throw new ForbiddenException('无权删除此文章');
    }

    const { error } = await this.client
      .from('knowledge_articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      console.error('删除文章失败:', error);
      throw new Error('删除文章失败');
    }
  }

  // ==================== 公司资料 - 统计 ====================

  /**
   * 获取公司资料统计
   */
  async getCompanyStats(): Promise<{ total: number; categories: number; weeklyUpdates: number }> {
    // 获取文章总数
    const { count: total } = await this.client
      .from('knowledge_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');

    // 获取分类数
    const { count: categories } = await this.client
      .from('knowledge_categories')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // 获取本周更新数
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const { count: weeklyUpdates } = await this.client
      .from('knowledge_articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('updated_at', oneWeekAgo.toISOString());

    return {
      total: total || 0,
      categories: categories || 0,
      weeklyUpdates: weeklyUpdates || 0,
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 检查管理员权限
   */
  private async checkAdminPermission(userId: string): Promise<void> {
    const isAdmin = await this.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }
  }

  /**
   * 判断是否为管理员
   */
  private async isAdmin(userId: string): Promise<boolean> {
    const { data: user } = await this.client
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    return user?.role === 'admin';
  }

  /**
   * 获取各知识库统计
   */
  async getKnowledgeStats(userId: string): Promise<KnowledgeStats> {
    const supabase = this.client;

    // 并行查询各知识库数量
    const [lexiconResult, knowledgeShareResult, productManualResult, designKnowledgeResult] = await Promise.all([
      // 个人语料
      supabase
        .from('lexicons')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false),
      
      // 公司资料（可见性过滤）
      supabase
        .from('knowledge_shares')
        .select('id', { count: 'exact', head: true })
        .or(`visibility.eq.public,user_id.eq.${userId},team_id.in.(SELECT team_id FROM team_members WHERE user_id = ${userId})`)
        .eq('is_deleted', false),
      
      // 产品手册
      supabase
        .from('product_manuals')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true),
      
      // 设计知识
      supabase
        .from('design_knowledge')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true),
    ]);

    return {
      lexicon: {
        count: lexiconResult.count || 0,
        label: '个人语料',
      },
      knowledge_share: {
        count: knowledgeShareResult.count || 0,
        label: '公司资料',
      },
      product_manual: {
        count: productManualResult.count || 0,
        label: '产品手册',
      },
      design_knowledge: {
        count: designKnowledgeResult.count || 0,
        label: '设计知识',
      },
    };
  }

  /**
   * 搜索所有知识库
   */
  async searchAllKnowledge(
    userId: string,
    keyword: string,
    sources: string[],
    limit: number,
  ): Promise<KnowledgeItem[]> {
    const results: KnowledgeItem[] = [];
    const supabase = this.client;

    const searchPromises = sources.map(async (source) => {
      switch (source) {
        case 'lexicon':
          return this.searchLexicon(supabase, userId, keyword, limit);
        case 'knowledge_share':
          return this.searchKnowledgeShare(supabase, userId, keyword, limit);
        case 'product_manual':
          return this.searchProductManual(supabase, keyword, limit);
        case 'design_knowledge':
          return this.searchDesignKnowledge(supabase, keyword, limit);
        default:
          return [];
      }
    });

    const allResults = await Promise.all(searchPromises);
    return allResults.flat();
  }

  /**
   * 根据类型获取知识库内容
   */
  async getKnowledgeByType(
    userId: string,
    type: string,
    keyword: string,
    page: number,
    pageSize: number,
  ): Promise<{ items: KnowledgeItem[]; total: number }> {
    const supabase = this.client;
    const offset = (page - 1) * pageSize;

    switch (type) {
      case 'lexicon': {
        let query = supabase
          .from('lexicons')
          .select('id, title, content, category, created_at', { count: 'exact' })
          .eq('user_id', userId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (keyword) {
          query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
        }

        const { data, count } = await query;
        return {
          items: (data || []).map((item) => ({ ...item, type: 'lexicon' })),
          total: count || 0,
        };
      }

      case 'knowledge_share': {
        let query = supabase
          .from('knowledge_shares')
          .select('id, title, content, category, created_at', { count: 'exact' })
          .or(`visibility.eq.public,user_id.eq.${userId}`)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (keyword) {
          query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
        }

        const { data, count } = await query;
        return {
          items: (data || []).map((item) => ({ ...item, type: 'knowledge_share' })),
          total: count || 0,
        };
      }

      case 'product_manual': {
        let query = supabase
          .from('product_manuals')
          .select('id, title, description:content, category, created_at', { count: 'exact' })
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (keyword) {
          query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
        }

        const { data, count } = await query;
        return {
          items: (data || []).map((item) => ({ ...item, type: 'product_manual', content: item.description })),
          total: count || 0,
        };
      }

      case 'design_knowledge': {
        let query = supabase
          .from('design_knowledge')
          .select('id, title, description:content, category, created_at', { count: 'exact' })
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (keyword) {
          query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
        }

        const { data, count } = await query;
        return {
          items: (data || []).map((item) => ({ ...item, type: 'design_knowledge', content: item.description })),
          total: count || 0,
        };
      }

      default:
        return { items: [], total: 0 };
    }
  }

  /**
   * 批量获取知识库内容详情
   */
  async getKnowledgeByIds(
    userId: string,
    ids: string[],
    types: string[],
  ): Promise<KnowledgeItem[]> {
    const supabase = this.client;
    const results: KnowledgeItem[] = [];

    // 按类型分组
    const typeMap = new Map<string, string[]>();
    ids.forEach((id, index) => {
      const type = types[index] || 'lexicon';
      if (!typeMap.has(type)) {
        typeMap.set(type, []);
      }
      typeMap.get(type)!.push(id);
    });

    // 并行查询
    for (const [type, typeIds] of typeMap) {
      const items = await this.fetchItemsByIds(supabase, userId, type, typeIds);
      results.push(...items);
    }

    return results;
  }

  // 私有方法

  private async searchLexicon(
    supabase: any,
    userId: string,
    keyword: string,
    limit: number,
  ): Promise<KnowledgeItem[]> {
    let query = supabase
      .from('lexicons')
      .select('id, title, content, category, created_at')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data } = await query;
    return (data || []).map((item) => ({ ...item, type: 'lexicon' }));
  }

  private async searchKnowledgeShare(
    supabase: any,
    userId: string,
    keyword: string,
    limit: number,
  ): Promise<KnowledgeItem[]> {
    let query = supabase
      .from('knowledge_shares')
      .select('id, title, content, category, created_at')
      .or(`visibility.eq.public,user_id.eq.${userId}`)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data } = await query;
    return (data || []).map((item) => ({ ...item, type: 'knowledge_share' }));
  }

  private async searchProductManual(
    supabase: any,
    keyword: string,
    limit: number,
  ): Promise<KnowledgeItem[]> {
    let query = supabase
      .from('product_manuals')
      .select('id, title, description:content, category, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data } = await query;
    return (data || []).map((item) => ({ ...item, type: 'product_manual', content: item.description }));
  }

  private async searchDesignKnowledge(
    supabase: any,
    keyword: string,
    limit: number,
  ): Promise<KnowledgeItem[]> {
    let query = supabase
      .from('design_knowledge')
      .select('id, title, description:content, category, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data } = await query;
    return (data || []).map((item) => ({ ...item, type: 'design_knowledge', content: item.description }));
  }

  private async fetchItemsByIds(
    supabase: any,
    userId: string,
    type: string,
    ids: string[],
  ): Promise<KnowledgeItem[]> {
    if (ids.length === 0) return [];

    switch (type) {
      case 'lexicon': {
        const { data } = await supabase
          .from('lexicons')
          .select('id, title, content, category, created_at')
          .in('id', ids)
          .eq('user_id', userId);
        return (data || []).map((item) => ({ ...item, type: 'lexicon' }));
      }

      case 'knowledge_share': {
        const { data } = await supabase
          .from('knowledge_shares')
          .select('id, title, content, category, created_at')
          .in('id', ids);
        return (data || []).map((item) => ({ ...item, type: 'knowledge_share' }));
      }

      case 'product_manual': {
        const { data } = await supabase
          .from('product_manuals')
          .select('id, title, description:content, category, created_at')
          .in('id', ids)
          .eq('is_published', true);
        return (data || []).map((item) => ({ ...item, type: 'product_manual', content: item.description }));
      }

      case 'design_knowledge': {
        const { data } = await supabase
          .from('design_knowledge')
          .select('id, title, description:content, category, created_at')
          .in('id', ids)
          .eq('is_published', true);
        return (data || []).map((item) => ({ ...item, type: 'design_knowledge', content: item.description }));
      }

      default:
        return [];
    }
  }
}
