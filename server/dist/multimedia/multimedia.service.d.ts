import { UserService } from '../user/user.service';
export interface UploadResult {
    id: string;
    fileKey: string;
    url: string;
    type: string;
    originalFilename: string;
    fileSize: number;
    contentType: string;
    transcript?: string;
}
export interface MultimediaResource {
    id: string;
    userId: string;
    type: 'image' | 'audio' | 'video' | 'document';
    fileKey: string;
    originalFilename: string;
    fileSize: number;
    contentType: string;
    duration?: number;
    transcript?: string;
    createdAt: string;
}
export declare class MultimediaService {
    private readonly userService;
    private s3Storage;
    private asrClient;
    private client;
    constructor(userService: UserService);
    uploadFile(userId: string, file: Express.Multer.File, options?: {
        transcribeAudio?: boolean;
    }): Promise<UploadResult>;
    getUserResources(currentUserId: string, targetUserId?: string, type?: string, limit?: number, offset?: number): Promise<{
        resources: MultimediaResource[];
        total: number;
    }>;
    getResourceById(resourceId: string, currentUserId: string): Promise<MultimediaResource>;
    deleteResource(resourceId: string, currentUserId: string): Promise<void>;
    transcribeAudio(audioUrl: string): Promise<string>;
    getFileUrl(fileKey: string, expireTime?: number): Promise<string>;
    private getFileType;
}
