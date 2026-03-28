import { ContentGenerationService, GeneratedContent } from './content-generation.service';
export declare class ContentGenerationController {
    private readonly contentGenerationService;
    constructor(contentGenerationService: ContentGenerationService);
    generateContent(body: {
        topics: string[];
        platform?: string;
        style?: string;
        length?: 'short' | 'medium' | 'long';
    }): Promise<{
        code: number;
        msg: string;
        data: GeneratedContent[];
    }>;
}
