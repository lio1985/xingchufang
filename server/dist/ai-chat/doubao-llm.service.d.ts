export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface LLMResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class DoubaoLLMService {
    private readonly apiKey;
    private readonly apiUrl;
    private readonly endpointId;
    constructor();
    invoke(messages: ChatMessage[], options?: {
        temperature?: number;
        max_tokens?: number;
    }): Promise<LLMResponse>;
}
