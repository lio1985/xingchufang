export declare class TagGenerationService {
    private llmClient;
    constructor();
    generateTags(content: string): Promise<string[]>;
    private parseTags;
    private extractFallbackTags;
    generateTitle(content: string): Promise<string>;
    private parseTitle;
    private extractFallbackTitle;
}
