import { AiChatService } from './ai-chat.service';
export declare class AiChatController {
    private readonly aiChatService;
    constructor(aiChatService: AiChatService);
    sendMessage(body: {
        message: string;
        userId: string;
        conversationId?: string;
        model?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: import("./ai-chat.service").ChatResponse;
    }>;
    submitParams(body: {
        conversationId: string;
        params: Record<string, any>;
    }): Promise<{
        code: number;
        msg: string;
        data: import("./ai-chat.service").ChatResponse;
    }>;
    getHistory(conversationId: string): Promise<{
        code: number;
        msg: string;
        data: {
            history: import("./intent-recognition.service").Message[];
        };
    }>;
    completeConversation(conversationId: string): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    }>;
    cancelConversation(conversationId: string): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    }>;
    chat(body: {
        message: string;
        model?: string;
        history?: Array<{
            role: string;
            content: string;
        }>;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            content: string | undefined;
        };
    }>;
}
