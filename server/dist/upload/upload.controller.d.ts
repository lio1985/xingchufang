export declare class UploadController {
    uploadImage(file: Express.Multer.File): Promise<{
        code: number;
        msg: string;
        data: {
            url: string;
            filename: string;
            size: number;
        };
    }>;
    uploadAudio(file: Express.Multer.File): Promise<{
        code: number;
        msg: string;
        data: {
            transcript: string;
            filename: string;
            duration: number;
        };
    }>;
}
