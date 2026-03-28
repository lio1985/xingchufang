export interface GeneratedContent {
    id: string;
    topic: string;
    title: string;
    content: string;
    platform?: string;
    version?: string;
    variant?: 'A' | 'B';
    createdAt: Date;
}
export declare class ContentGenerationService {
    private readonly logger;
    private llmClient;
    private isLLMAvailable;
    private contentCache;
    private readonly CACHE_TTL;
    constructor();
    private getCacheKey;
    private getFromCache;
    private setCache;
    generateContent(topics: string[], options?: {
        platform?: string;
        style?: string;
        length?: 'short' | 'medium' | 'long';
    }): Promise<GeneratedContent[]>;
    private generateSingleContent;
    private generateScript;
    private generateScriptWithLLM;
    private buildPrompt;
    private generateTitle;
    private generateTitlesWithLLM;
    private getTitleTemplate;
    private getScriptTemplates;
    private generateFiveParagraphScript;
    private generateListScript;
    private generateQAScript;
    private generateStoryScript;
    private generateComparisonScript;
    private generateTipsScript;
    private getTitleTemplates;
}
