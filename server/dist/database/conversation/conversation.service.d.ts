import { UserService } from '../../user/user.service';
export declare class ConversationService {
    private readonly userService;
    private client;
    constructor(userService: UserService);
    private toUuid;
    getList(currentUserId: string, targetUserId?: string): Promise<any[]>;
    getDetail(conversationId: string, currentUserId: string): Promise<any>;
    create(body: {
        userId: string;
        title: string;
        model?: string;
    }): Promise<any>;
    addMessage(body: {
        conversationId: string;
        role: string;
        content: string;
        metadata?: any;
    }): Promise<any>;
    delete(conversationId: string, currentUserId: string): Promise<{
        success: boolean;
    }>;
}
