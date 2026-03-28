import { NewsService } from './news.service';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    search(body: {
        keyword: string;
        timeRange?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            summary: string;
            results: {
                id: string;
                title: string;
                url: string | undefined;
                snippet: string;
                siteName: string | undefined;
                publishTime: string | undefined;
            }[];
        };
    }>;
}
