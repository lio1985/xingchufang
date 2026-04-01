import { TopicsService, CreateTopicDto, UpdateTopicDto, TopicQueryDto } from './topics.service';
export declare class TopicsController {
    private readonly topicsService;
    constructor(topicsService: TopicsService);
    getAll(req: any, query: TopicQueryDto): Promise<{
        code: number;
        msg: string;
        data: {
            items: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    }>;
    getStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: Record<string, any>;
    }>;
    getById(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: import("./topics.service").Topic;
    }>;
    create(req: any, dto: CreateTopicDto): Promise<{
        code: number;
        msg: string;
        data: import("./topics.service").Topic;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    update(req: any, id: string, dto: UpdateTopicDto): Promise<{
        code: number;
        msg: string;
        data: import("./topics.service").Topic;
    }>;
    delete(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    analyzeWithAI(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: Record<string, any>;
    }>;
    batchUpdateStatus(req: any, body: {
        ids: string[];
        status: 'draft' | 'in_progress' | 'published' | 'archived';
    }): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
}
