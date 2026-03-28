import { ConversationService } from './conversation.service';
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    getList(req: any, targetUserId?: string): Promise<{
        code: number;
        msg: string;
        data: any[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getDetail(conversationId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    create(req: any, body: {
        userId: string;
        title: string;
        model: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    addMessage(body: {
        conversationId: string;
        role: string;
        content: string;
        metadata?: any;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    delete(conversationId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            success: boolean;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
}
