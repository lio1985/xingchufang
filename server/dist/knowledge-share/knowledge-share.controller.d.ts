import { StorageService } from '../storage/storage.service';
import { KnowledgeShareService } from './knowledge-share.service';
export declare class KnowledgeShareController {
    private readonly knowledgeShareService;
    private readonly storageService;
    constructor(knowledgeShareService: KnowledgeShareService, storageService: StorageService);
    findAll(req: any, keyword?: string): Promise<{
        code: number;
        msg: string;
        data: {
            id: any;
            userId: any;
            title: any;
            content: any;
            category: any;
            tags: any;
            source: any;
            visibility: any;
            viewCount: any;
            likeCount: any;
            createdAt: any;
            author: any;
        }[];
    } | {
        code: number;
        msg: any;
        data: never[];
    }>;
    findOne(id: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            id: any;
            userId: any;
            title: any;
            content: any;
            category: any;
            tags: any;
            attachments: any;
            source: any;
            visibility: any;
            viewCount: any;
            likeCount: any;
            isPublished: any;
            createdAt: any;
            updatedAt: any;
            author: any;
            authorAvatar: any;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    create(body: any, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    update(id: string, body: any, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    remove(id: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    like(id: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    findByUserId(req: any, page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    findAllForAdmin(req: any, page?: string, pageSize?: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    uploadAttachment(file: Express.Multer.File): Promise<{
        code: number;
        msg: string;
        data: {
            fileKey: string;
            fileUrl: string;
            fileName: string;
            fileType: string;
            fileSize: number;
            mimeType: string;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getFileUrl(body: {
        fileKey: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            fileKey: string;
            fileUrl: string;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    private getFileType;
}
