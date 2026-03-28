import { UserService } from '../../user/user.service';
import { SharedLexiconInfo, SharePermission, ShareRecord, CanAccessResult, ShareHistory } from '../../share/types';
export declare class LexiconService {
    private readonly userService;
    private client;
    private asrClient;
    private llmClient;
    constructor(userService: UserService);
    private validateAccess;
    getAll(userId: string, category?: string, type?: string, product_id?: string, targetUserId?: string, page?: number, pageSize?: number, search?: string, viewAll?: boolean): Promise<{
        items: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getById(userId: string, id: string): Promise<any>;
    create(userId: string, body: {
        title: string;
        content: string;
        category: string;
        type?: string;
        tags?: string[];
    }): Promise<any>;
    update(userId: string, id: string, body: {
        title?: string;
        content?: string;
        category?: string;
        tags?: string[];
    }): Promise<any>;
    delete(userId: string, id: string): Promise<any[]>;
    uploadFile(userId: string, file: Express.Multer.File): Promise<{
        fileKey: string;
        fileUrl: string;
        fileType: "audio" | "word" | "pdf" | "video" | "other";
    }>;
    speechToText(userId: string, audioUrl: string): Promise<{
        text: string;
        duration: number | undefined;
    }>;
    correctText(userId: string, text: string): Promise<{
        correctedText: string;
    }>;
    generateProfile(userId: string, type: 'enterprise' | 'personal'): Promise<any>;
    optimize(userId: string, inputText: string, lexiconIds: string[]): Promise<{
        optimizedText: string;
    }>;
    canAccessLexicon(userId: string, lexiconId: string): Promise<CanAccessResult>;
    shareLexicon(userId: string, lexiconId: string, shareScope: 'custom' | 'all' | 'department', sharedWithUsers?: string[]): Promise<SharedLexiconInfo>;
    unshareLexicon(userId: string, lexiconId: string): Promise<void>;
    getSharedWithMe(userId: string, page?: number, pageSize?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getMySharedLexicons(userId: string, page?: number, pageSize?: number): Promise<{
        items: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    forceShareLexicon(adminId: string, lexiconId: string, isGloballyShared: boolean): Promise<SharePermission>;
    getAllShareRecords(userId: string, page?: number, pageSize?: number): Promise<ShareRecord[]>;
    private recordShareHistory;
    getShareHistory(userId: string, lexiconId?: string, page?: number, pageSize?: number): Promise<{
        items: ShareHistory[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
