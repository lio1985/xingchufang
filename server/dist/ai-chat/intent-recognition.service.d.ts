export interface Intent {
    type: 'quick_note' | 'topic_generation' | 'content_generation' | 'lexicon_optimize' | 'viral_replicate' | 'unknown';
    confidence: number;
    extractedParams: Record<string, any>;
    missingParams: string[];
    needsComplexUI: boolean;
    recommendedModel?: string;
}
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
}
export declare class IntentRecognitionService {
    private llmClient;
    constructor();
    recognizeIntent(userMessage: string, conversationHistory?: Message[]): Promise<Intent>;
    private buildIntentPrompt;
    private parseIntentResponse;
    isParamsComplete(intent: Intent): boolean;
    recommendModel(intent: Intent): string;
}
