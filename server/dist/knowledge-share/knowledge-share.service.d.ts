import { PermissionService } from '../permission/permission.service';
export declare class KnowledgeShareService {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    findAll(userId: string, keyword?: string): Promise<{
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
    }[]>;
    findOne(id: string, userId: string): Promise<{
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
    }>;
    create(userId: string, data: any): Promise<any>;
    update(id: string, userId: string, data: any): Promise<any>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    like(id: string, userId: string): Promise<{
        message: string;
    }>;
    findByUserId(userId: string, page?: number, pageSize?: number): Promise<{
        list: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findAllForAdmin(userId: string, page?: number, pageSize?: number): Promise<{
        list: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
