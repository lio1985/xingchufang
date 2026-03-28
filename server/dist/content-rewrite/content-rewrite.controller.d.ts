import { ContentRewriteService } from './content-rewrite.service';
export declare class ContentRewriteController {
    private readonly contentRewriteService;
    constructor(contentRewriteService: ContentRewriteService);
    rewriteContent(body: {
        content: string;
        prompt: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            rewrittenContent: string;
        };
    }>;
}
