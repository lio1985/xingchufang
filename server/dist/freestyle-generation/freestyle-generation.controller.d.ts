import { FreestyleGenerationService, FreestyleInput, GeneratedContent } from './freestyle-generation.service';
export declare class FreestyleGenerationController {
    private readonly freestyleGenerationService;
    constructor(freestyleGenerationService: FreestyleGenerationService);
    generateFreestyle(body: FreestyleInput): Promise<{
        code: number;
        msg: string;
        data: GeneratedContent;
    }>;
}
