import { FileParserService } from './file-parser.service';
export declare class FileParserController {
    private readonly fileParserService;
    constructor(fileParserService: FileParserService);
    parseFile(file: Express.Multer.File): Promise<{
        code: number;
        msg: string;
        data: {
            filename: string;
            size: number;
            content: string;
            mimeType: string;
        };
    }>;
}
