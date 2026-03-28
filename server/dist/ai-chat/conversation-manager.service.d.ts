import { Intent, Message } from './intent-recognition.service';
export interface Conversation {
    id: string;
    userId: string;
    status: 'active' | 'completed' | 'cancelled';
    currentIntent: Intent | null;
    collectedParams: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface StoredMessage {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata: Record<string, any> | null;
    createdAt: string;
}
export declare class ConversationManagerService {
    private client;
    createConversation(userId: string): Promise<Conversation>;
    getConversation(conversationId: string): Promise<Conversation | null>;
    updateConversationIntent(conversationId: string, intent: Intent): Promise<void>;
    updateCollectedParams(conversationId: string, params: Record<string, any>): Promise<void>;
    mergeCollectedParams(conversationId: string, newParams: Record<string, any>): Promise<void>;
    updateConversationStatus(conversationId: string, status: 'active' | 'completed' | 'cancelled'): Promise<void>;
    addMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any> | null): Promise<StoredMessage>;
    getConversationHistory(conversationId: string, limit?: number): Promise<Message[]>;
    getActiveConversation(userId: string): Promise<Conversation | null>;
    completeConversation(conversationId: string): Promise<void>;
    cancelConversation(conversationId: string): Promise<void>;
    cleanupOldConversations(): Promise<void>;
    private mapToConversation;
}
