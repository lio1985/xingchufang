import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private readonly knowledgeService;
    constructor(knowledgeService: KnowledgeService);
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
