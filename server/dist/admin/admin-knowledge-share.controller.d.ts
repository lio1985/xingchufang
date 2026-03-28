import { AdminKnowledgeShareService } from './admin-knowledge-share.service';
export declare class AdminKnowledgeShareController {
    private readonly adminKnowledgeShareService;
    constructor(adminKnowledgeShareService: AdminKnowledgeShareService);
    findAll(page?: string, pageSize?: string, keyword?: string, category?: string, status?: 'published' | 'draft', authorId?: string, startDate?: string, endDate?: string, attachmentType?: 'image' | 'file' | 'audio' | 'none', sortBy?: string, sortOrder?: string): Promise<{
        code: number;
        msg: string;
        data: {
            items: {
                id: any;
                title: any;
                author: {
                    id: any;
                    nickname: any;
                    avatar: any;
                };
                category: any;
                tags: any;
                isPublished: any;
                viewCount: any;
                likeCount: any;
                attachmentCount: any;
                createdAt: any;
                isFeatured: any;
            }[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    remove(id: string): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    batchRemove(body: {
        ids: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: {
            successCount: number;
            failedCount: number;
            failedIds: string[];
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    feature(id: string, body: {
        isFeatured: boolean;
    }): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    getSummary(): Promise<{
        code: number;
        msg: string;
        data: {
            totalCount: number;
            publishedCount: number;
            draftCount: number;
            weeklyNewCount: number;
            totalViewCount: any;
            totalLikeCount: any;
            activeAuthorCount: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getStats(): Promise<{
        code: number;
        msg: string;
        data: {
            monthlyNewCount: number;
            categoryStats: Record<string, number>;
            attachmentStats: {
                withImage: number;
                withFile: number;
                withAudio: number;
                noAttachment: number;
            };
            attachmentCountStats: {
                '1': number;
                '2-5': number;
                '6-10': number;
                '10+': number;
            };
            totalCount: number;
            publishedCount: number;
            draftCount: number;
            weeklyNewCount: number;
            totalViewCount: any;
            totalLikeCount: any;
            activeAuthorCount: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getTrend(days?: string): Promise<{
        code: number;
        msg: string;
        data: {
            daily: {
                date: string;
                count: number;
            }[];
            total: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getTop(type?: 'view' | 'like', limit?: string): Promise<{
        code: number;
        msg: string;
        data: {
            items: {
                id: any;
                title: any;
                author: {
                    id: any;
                    nickname: any;
                    avatar: any;
                };
                viewCount: any;
                likeCount: any;
                category: any;
                createdAt: any;
            }[];
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getTopAuthors(limit?: string): Promise<{
        code: number;
        msg: string;
        data: {
            items: any[];
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getPending(page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            items: {
                id: any;
                title: any;
                author: {
                    id: any;
                    nickname: any;
                    avatar: any;
                };
                category: any;
                tags: any;
                viewCount: any;
                likeCount: any;
                attachmentCount: any;
                createdAt: any;
            }[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    approve(id: string, req: any): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    reject(id: string, body: {
        reason: string;
    }, req: any): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    getTimeAnalysis(days?: string): Promise<{
        code: number;
        msg: string;
        data: {
            hourly: {
                hour: string;
                count: any;
            }[];
            weekly: {
                day: string;
                count: any;
            }[];
            daily: {
                date: string;
                count: number;
            }[];
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    batchExport(body: {
        ids: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: {
            filename: string;
            content: string;
            mimeType: string;
            count: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    exportReport(): Promise<{
        code: number;
        msg: string;
        data: {
            filename: string;
            content: string;
            mimeType: string;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
}
