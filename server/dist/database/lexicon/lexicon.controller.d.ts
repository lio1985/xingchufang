import { LexiconService } from './lexicon.service';
export declare class LexiconController {
    private readonly lexiconService;
    constructor(lexiconService: LexiconService);
    getAll(req: any, category?: string, type?: string, product_id?: string, targetUserId?: string, page?: number, pageSize?: number, search?: string, viewAll?: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: never[];
            pagination: {
                page: number;
                pageSize: number;
                total: number;
                totalPages: number;
            };
        };
    } | {
        code: number;
        msg: string;
        data: {
            items: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getById(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    create(req: any, body: {
        title: string;
        content: string;
        category: string;
        type?: string;
        product_id?: string;
        tags?: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    update(req: any, id: string, body: {
        title?: string;
        content?: string;
        category?: string;
        product_id?: string;
        tags?: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    delete(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: any[];
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    uploadFile(req: any, file: Express.Multer.File): Promise<{
        code: number;
        msg: string;
        data: {
            fileKey: string;
            fileUrl: string;
            fileType: "audio" | "word" | "pdf" | "video" | "other";
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    speechToText(req: any, body: {
        audioUrl: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            text: string;
            duration: number | undefined;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    correctText(req: any, body: {
        text: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            correctedText: string;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    generateProfile(req: any, body: {
        type: 'enterprise' | 'personal';
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    optimize(req: any, body: {
        inputText: string;
        lexiconIds: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: {
            optimizedText: string;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    shareLexicon(req: any, id: string, body: {
        shareScope: 'custom' | 'all' | 'department';
        sharedWithUsers?: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: import("../../share/types").SharedLexiconInfo;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    unshareLexicon(req: any, id: string): Promise<{
        code: any;
        msg: any;
        data: null;
    }>;
    getSharedWithMe(req: any, page?: number, pageSize?: number): Promise<{
        code: number;
        msg: string;
        data: {
            items: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getMySharedLexicons(req: any, page?: number, pageSize?: number): Promise<{
        code: number;
        msg: string;
        data: {
            items: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getShareHistory(req: any, lexiconId?: string, page?: number, pageSize?: number): Promise<{
        code: number;
        msg: string;
        data: {
            items: import("../../share/types").ShareHistory[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
}
