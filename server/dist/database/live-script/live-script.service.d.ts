export interface LiveAnalysis {
    banned_words: string[];
    sensitive_words: string[];
    suggestions: string[];
    score: number;
    summary: string;
    highlights: string[];
}
export declare class LiveScriptService {
    private client;
    private llmClient;
    constructor();
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    delete(id: string): Promise<void>;
    analyze(id: string): Promise<LiveAnalysis>;
}
