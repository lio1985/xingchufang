import { MultimediaService } from './multimedia.service';
export declare class MultimediaController {
    private readonly multimediaService;
    constructor(multimediaService: MultimediaService);
    uploadFile(file: Express.Multer.File, req: any, transcribeAudio?: string): Promise<{
        code: number;
        msg: string;
        data: import("./multimedia.service").UploadResult;
    }>;
    getUserResources(req: any, targetUserId?: string, type?: string, limit?: string, offset?: string): Promise<{
        code: number;
        msg: string;
        data: {
            resources: import("./multimedia.service").MultimediaResource[];
            total: number;
        };
    }>;
    getResourceById(resourceId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: import("./multimedia.service").MultimediaResource;
    }>;
    deleteResource(resourceId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    }>;
    transcribeAudio(audioUrl: string): Promise<{
        code: number;
        msg: string;
        data: {
            text: string;
        };
    }>;
}
