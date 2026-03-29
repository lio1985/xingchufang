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
    lexicon: {
        count: number;
        label: string;
    };
    knowledge_share: {
        count: number;
        label: string;
    };
    product_manual: {
        count: number;
        label: string;
    };
    design_knowledge: {
        count: number;
        label: string;
    };
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
export declare class KnowledgeService {
    private readonly permissionService;
    private client;
    constructor(permissionService: PermissionService);
    getCategories(): Promise<Category[]>;
    createCategory(userId: string, body: any): Promise<Category>;
    updateCategory(userId: string, categoryId: string, body: any): Promise<Category>;
    deleteCategory(userId: string, categoryId: string): Promise<void>;
    getArticles(categoryId?: string, keyword?: string, page?: number, pageSize?: number): Promise<{
        items: Article[];
        total: number;
    }>;
    getArticleById(articleId: string): Promise<Article | null>;
    createArticle(userId: string, body: any): Promise<Article>;
    updateArticle(userId: string, articleId: string, body: any): Promise<Article>;
    deleteArticle(userId: string, articleId: string): Promise<void>;
    getCompanyStats(): Promise<{
        total: number;
        categories: number;
        weeklyUpdates: number;
    }>;
    private checkAdminPermission;
    private isAdmin;
    getKnowledgeStats(userId: string): Promise<KnowledgeStats>;
    searchAllKnowledge(userId: string, keyword: string, sources: string[], limit: number): Promise<KnowledgeItem[]>;
    getKnowledgeByType(userId: string, type: string, keyword: string, page: number, pageSize: number): Promise<{
        items: KnowledgeItem[];
        total: number;
    }>;
    getKnowledgeByIds(userId: string, ids: string[], types: string[]): Promise<KnowledgeItem[]>;
    private searchLexicon;
    private searchKnowledgeShare;
    private searchProductManual;
    private searchDesignKnowledge;
    private fetchItemsByIds;
}
