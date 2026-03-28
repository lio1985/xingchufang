export declare class StorageService {
    private readonly logger;
    private storage;
    constructor();
    uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<string>;
    getFileUrl(fileKey: string, expireTime?: number): Promise<string>;
    generatePresignedUrl(fileKey: string, expireTime?: number): Promise<string>;
    deleteFile(fileKey: string): Promise<boolean>;
    fileExists(fileKey: string): Promise<boolean>;
}
