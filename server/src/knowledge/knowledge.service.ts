import { Injectable } from '@nestjs/common';
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

export { KnowledgeItem, KnowledgeStats };

@Injectable()
export class KnowledgeService {
  private client = getSupabaseClient();

  constructor(private readonly permissionService: PermissionService) {}

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
