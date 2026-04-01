import { DoubaoLLMService } from './doubao-llm.service';
import { IntentRecognitionService, Intent, Message } from './intent-recognition.service';
import { ConversationManagerService } from './conversation-manager.service';
import { FunctionExecutorService } from './function-executor.service';
export interface ChatRequest {
    message: string;
    userId: string;
    conversationId?: string;
    model?: string;
}
export interface ChatResponse {
    type: 'text' | 'collect_params' | 'execute' | 'error';
    message?: string;
    data?: any;
    intent?: Intent;
    conversationId?: string;
    recommendedModel?: string;
}
export declare class AiChatService {
    private doubaoLLMService;
    private intentRecognitionService;
    private conversationManagerService;
    private functionExecutorService;
    private readonly endpointId;
    constructor(doubaoLLMService: DoubaoLLMService, intentRecognitionService: IntentRecognitionService, conversationManagerService: ConversationManagerService, functionExecutorService: FunctionExecutorService);
    handleMessage(request: ChatRequest): Promise<ChatResponse>;
    private collectParameters;
    private executeFunction;
    submitParams(conversationId: string, params: Record<string, any>): Promise<ChatResponse>;
    private chatWithLLM;
    private generateParameterPrompt;
    private validateParams;
    getHistory(conversationId: string): Promise<Message[]>;
    completeConversation(conversationId: string): Promise<void>;
    cancelConversation(conversationId: string): Promise<void>;
}
