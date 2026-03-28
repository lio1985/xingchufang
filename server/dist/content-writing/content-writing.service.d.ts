export interface GenerateOutlineDto {
    title: string;
    description?: string;
    platform: string;
    contentType: string;
    targetAudience?: string;
    keyPoints?: string;
    tone?: string;
    duration?: string;
    style?: string;
}
export interface ExpandContentDto {
    outline: string;
    section: string;
    title: string;
    platform: string;
    tone?: string;
    targetAudience?: string;
    referenceContent?: string;
}
export interface PolishContentDto {
    content: string;
    platform: string;
    tone?: string;
    polishType: 'concise' | 'emotional' | 'professional' | 'engaging';
}
export interface GenerateFullContentDto {
    title: string;
    description?: string;
    platform: string;
    contentType: string;
    targetAudience?: string;
    keyPoints?: string;
    tone?: string;
    duration?: string;
    style?: string;
    aiAnalysis?: Record<string, any>;
    referenceContent?: string;
}
export interface SuggestInspirationDto {
    title: string;
    category?: string;
    platform: string;
}
export declare class ContentWritingService {
    private llmClient;
    constructor();
    generateOutline(dto: GenerateOutlineDto): Promise<Record<string, any>>;
    expandContent(dto: ExpandContentDto): Promise<Record<string, any>>;
    polishContent(dto: PolishContentDto): Promise<Record<string, any>>;
    generateFullContent(dto: GenerateFullContentDto): Promise<Record<string, any>>;
    suggestInspiration(dto: SuggestInspirationDto): Promise<Record<string, any>>;
    private parseAIResponse;
    private getPlatformTips;
}
