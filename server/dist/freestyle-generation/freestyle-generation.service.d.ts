export interface FreestyleInput {
    text?: string;
    imageUrl?: string;
    style?: string;
    platform?: string;
}
export interface GeneratedContent {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'image' | 'mixed';
    platform?: string;
    style?: string;
    createdAt: Date;
}
export declare class FreestyleGenerationService {
    generateFreestyle(input: FreestyleInput): Promise<GeneratedContent>;
    private generateFromText;
    private generateFromImage;
    private generateTitle;
}
