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
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const permission_service_1 = require("../permission/permission.service");
let KnowledgeService = class KnowledgeService {
    constructor(permissionService) {
        this.permissionService = permissionService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async getCategories() {
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
        const categoriesWithCount = await Promise.all((categories || []).map(async (category) => {
            const { count } = await this.client
                .from('knowledge_articles')
                .select('id', { count: 'exact', head: true })
                .eq('category_id', category.id)
                .eq('status', 'published');
            return {
                ...category,
                article_count: count || 0,
            };
        }));
        return categoriesWithCount;
    }
    async createCategory(userId, body) {
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
    async updateCategory(userId, categoryId, body) {
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
        const { count } = await this.client
            .from('knowledge_articles')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', categoryId)
            .eq('status', 'published');
        return { ...data, article_count: count || 0 };
    }
    async deleteCategory(userId, categoryId) {
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
    async getArticles(categoryId, keyword, page = 1, pageSize = 20) {
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
    async getArticleById(articleId) {
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
        await this.client
            .from('knowledge_articles')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', articleId);
        return data;
    }
    async createArticle(userId, body) {
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
    async updateArticle(userId, articleId, body) {
        const { data: article } = await this.client
            .from('knowledge_articles')
            .select('author_id')
            .eq('id', articleId)
            .single();
        if (!article) {
            throw new common_1.NotFoundException('文章不存在');
        }
        const isAdmin = await this.isAdmin(userId);
        if (article.author_id !== userId && !isAdmin) {
            throw new common_1.ForbiddenException('无权编辑此文章');
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
    async deleteArticle(userId, articleId) {
        const { data: article } = await this.client
            .from('knowledge_articles')
            .select('author_id')
            .eq('id', articleId)
            .single();
        if (!article) {
            throw new common_1.NotFoundException('文章不存在');
        }
        const isAdmin = await this.isAdmin(userId);
        if (article.author_id !== userId && !isAdmin) {
            throw new common_1.ForbiddenException('无权删除此文章');
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
    async getCompanyStats() {
        const { count: total } = await this.client
            .from('knowledge_articles')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'published');
        const { count: categories } = await this.client
            .from('knowledge_categories')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);
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
    async checkAdminPermission(userId) {
        const isAdmin = await this.isAdmin(userId);
        if (!isAdmin) {
            throw new common_1.ForbiddenException('需要管理员权限');
        }
    }
    async isAdmin(userId) {
        const { data: user } = await this.client
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();
        return user?.role === 'admin';
    }
    async getKnowledgeStats(userId) {
        const supabase = this.client;
        const [lexiconResult, knowledgeShareResult, productManualResult, designKnowledgeResult] = await Promise.all([
            supabase
                .from('lexicons')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_deleted', false),
            supabase
                .from('knowledge_shares')
                .select('id', { count: 'exact', head: true })
                .or(`visibility.eq.public,user_id.eq.${userId},team_id.in.(SELECT team_id FROM team_members WHERE user_id = ${userId})`)
                .eq('is_deleted', false),
            supabase
                .from('product_manuals')
                .select('id', { count: 'exact', head: true })
                .eq('is_published', true),
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
    async searchAllKnowledge(userId, keyword, sources, limit) {
        const results = [];
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
    async getKnowledgeByType(userId, type, keyword, page, pageSize) {
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
    async getKnowledgeByIds(userId, ids, types) {
        const supabase = this.client;
        const results = [];
        const typeMap = new Map();
        ids.forEach((id, index) => {
            const type = types[index] || 'lexicon';
            if (!typeMap.has(type)) {
                typeMap.set(type, []);
            }
            typeMap.get(type).push(id);
        });
        for (const [type, typeIds] of typeMap) {
            const items = await this.fetchItemsByIds(supabase, userId, type, typeIds);
            results.push(...items);
        }
        return results;
    }
    async searchLexicon(supabase, userId, keyword, limit) {
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
    async searchKnowledgeShare(supabase, userId, keyword, limit) {
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
    async searchProductManual(supabase, keyword, limit) {
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
    async searchDesignKnowledge(supabase, keyword, limit) {
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
    async fetchItemsByIds(supabase, userId, type, ids) {
        if (ids.length === 0)
            return [];
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
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map