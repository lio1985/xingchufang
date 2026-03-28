export declare class NewsService {
    private searchClient;
    constructor();
    search(keyword: string, timeRange: string): Promise<{
        summary: string;
        results: {
            id: string;
            title: string;
            url: string | undefined;
            snippet: string;
            siteName: string | undefined;
            publishTime: string | undefined;
        }[];
    }>;
}
