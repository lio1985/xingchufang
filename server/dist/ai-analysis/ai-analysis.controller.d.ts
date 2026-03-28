import { AiAnalysisService, AnalysisResult, RecommendedTopic } from './ai-analysis.service';
export declare class AiAnalysisController {
    private readonly aiAnalysisService;
    constructor(aiAnalysisService: AiAnalysisService);
    analyzeQuestions(body: {
        questions: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: AnalysisResult;
    }>;
    recommendTopics(body: {
        platforms: string[];
        questions: string[];
        hotTopics: any[];
        preferences?: {
            industries: string[];
            interests: string[];
            newsCategories: string[];
        };
    }): Promise<{
        code: number;
        msg: string;
        data: RecommendedTopic[];
    }>;
}
