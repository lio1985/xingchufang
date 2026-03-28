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
export declare class TopicsService {
    private client;
    private llmClient;
    constructor();
    getAll(userId: string, query: TopicQueryDto): Promise<{
        items: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getById(userId: string, id: string): Promise<Topic>;
    create(userId: string, dto: CreateTopicDto): Promise<Topic>;
    update(userId: string, id: string, dto: UpdateTopicDto): Promise<Topic>;
    delete(userId: string, id: string): Promise<void>;
    analyzeWithAI(userId: string, id: string): Promise<Record<string, any>>;
    batchUpdateStatus(userId: string, ids: string[], status: 'draft' | 'in_progress' | 'published' | 'archived'): Promise<void>;
    getStatistics(userId: string): Promise<Record<string, any>>;
}
