export declare class AdminKnowledgeShareService {
    findAll(params: {
        page: number;
        pageSize: number;
        keyword?: string;
        category?: string;
        status?: 'published' | 'draft';
        authorId?: string;
        startDate?: string;
        endDate?: string;
        attachmentType?: 'image' | 'file' | 'audio' | 'none';
        sortBy?: string;
        sortOrder?: string;
    }): Promise<{
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
    }>;
    remove(id: string): Promise<void>;
    batchRemove(ids: string[]): Promise<{
        successCount: number;
        failedCount: number;
        failedIds: string[];
    }>;
    feature(id: string, isFeatured: boolean): Promise<void>;
    getSummary(): Promise<{
        totalCount: number;
        publishedCount: number;
        draftCount: number;
        weeklyNewCount: number;
        totalViewCount: any;
        totalLikeCount: any;
        activeAuthorCount: number;
    }>;
    getStats(): Promise<{
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
    }>;
    getTrend(days: number): Promise<{
        daily: {
            date: string;
            count: number;
        }[];
        total: number;
    }>;
    getTop(type: 'view' | 'like', limit: number): Promise<{
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
    }>;
    getTopAuthors(limit: number): Promise<{
        items: any[];
    }>;
    private mapSortField;
    getPending(params: {
        page: number;
        pageSize: number;
    }): Promise<{
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
    }>;
    approve(id: string, approverId: string): Promise<void>;
    reject(id: string, reason: string, approverId: string): Promise<void>;
    getTimeAnalysis(days: number): Promise<{
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
    }>;
    batchExport(ids: string[]): Promise<{
        filename: string;
        content: string;
        mimeType: string;
        count: number;
    }>;
    exportReport(): Promise<{
        filename: string;
        content: string;
        mimeType: string;
    }>;
}
