import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly knowledgeService;
    constructor(knowledgeService: KnowledgeService);
    getCategories(req: any): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").Category[];
    }>;
    createCategory(req: any, body: any): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").Category;
    }>;
    updateCategory(req: any, id: string, body: any): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").Category;
    }>;
    deleteCategory(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    getArticles(req: any, categoryId?: string, keyword?: string, page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            items: import("./knowledge.service").Article[];
            total: number;
        };
    }>;
    getArticleDetail(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").Article | null;
    }>;
    createArticle(req: any, body: any): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").Article;
    }>;
    updateArticle(req: any, id: string, body: any): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").Article;
    }>;
    deleteArticle(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    getCompanyStats(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            total: number;
            categories: number;
            weeklyUpdates: number;
        };
    }>;
    getKnowledgeStats(req: any): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").KnowledgeStats;
    }>;
    searchKnowledge(req: any, keyword?: string, sources?: string, limit?: string): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").KnowledgeItem[];
    }>;
    getKnowledgeList(req: any, type: string, keyword?: string, page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            items: import("./knowledge.service").KnowledgeItem[];
            total: number;
        };
    }>;
    getKnowledgeByIds(req: any, ids: string, types: string): Promise<{
        code: number;
        msg: string;
        data: import("./knowledge.service").KnowledgeItem[];
    }>;
}
