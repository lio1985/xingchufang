import { SubscribeMessageService } from './subscribe-message.service';
export declare class SubscribeMessageController {
    private readonly subscribeService;
    constructor(subscribeService: SubscribeMessageService);
    subscribe(req: any, body: {
        templateId: string;
        wxTemplateId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    unsubscribe(req: any, body: {
        templateId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getStatus(req: any): Promise<{
        success: boolean;
        data: {
            subscribedIds: any[];
        };
    }>;
    send(body: {
        userId: string;
        templateId: string;
        data: Record<string, {
            value: string;
        }>;
        page?: string;
    }): Promise<{
        success: boolean;
        message: any;
    }>;
    batchSend(body: {
        userIds: string[];
        templateId: string;
        data: Record<string, {
            value: string;
        }>;
        page?: string;
    }): Promise<{
        success: boolean;
        data: {
            total: number;
            success: number;
            failed: number;
            results: {
                userId: string;
                success: boolean;
                message: string;
            }[];
        };
    }>;
}
