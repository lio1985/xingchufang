import { TagGenerationService } from './tag-generation.service';
export declare class TagGenerationController {
    private readonly tagGenerationService;
    constructor(tagGenerationService: TagGenerationService);
    generateTags(body: {
        content: string;
    }): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            tags: string[];
        };
    }>;
    generateTitle(body: {
        content: string;
    }): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            title: string;
        };
    }>;
}
