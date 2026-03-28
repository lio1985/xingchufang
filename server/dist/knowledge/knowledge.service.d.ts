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
export { KnowledgeItem, KnowledgeStats };
export declare class KnowledgeService {
    private readonly permissionService;
    private client;
    constructor(permissionService: PermissionService);
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
