export interface AnalysisResult {
    summary: string;
    keyPoints: string[];
    suggestions: string[];
}
export interface RecommendedTopic {
    question: string;
    hotness: string;
    type: string;
    platforms: string[];
    category?: string;
    reason?: string;
}
export declare class AiAnalysisService {
    analyzeQuestions(questions: string[]): Promise<AnalysisResult>;
    recommendTopics(platforms: string[], questions: string[], hotTopics: any[], preferences?: {
        industries: string[];
        interests: string[];
        newsCategories: string[];
    }): Promise<RecommendedTopic[]>;
    private extractKeywords;
}
