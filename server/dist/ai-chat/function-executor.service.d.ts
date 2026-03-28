import { Intent } from './intent-recognition.service';
import { ContentGenerationService } from '../content-generation/content-generation.service';
export interface FunctionResult {
    success: boolean;
    data?: any;
    error?: string;
    type: string;
}
export declare class FunctionExecutorService {
    private readonly contentGenerationService;
    constructor(contentGenerationService: ContentGenerationService);
    executeFunction(intent: Intent, params: Record<string, any>, userId: string): Promise<FunctionResult>;
    private executeQuickNote;
    private executeTopicGeneration;
    private executeContentGeneration;
    private executeLexiconOptimize;
    private executeViralReplicate;
}
