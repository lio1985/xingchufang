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