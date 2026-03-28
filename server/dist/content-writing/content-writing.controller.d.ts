import { ContentWritingService, GenerateOutlineDto, ExpandContentDto, PolishContentDto, GenerateFullContentDto, SuggestInspirationDto } from './content-writing.service';
export declare class ContentWritingController {
    private readonly contentWritingService;
    constructor(contentWritingService: ContentWritingService);
    generateOutline(req: any, dto: GenerateOutlineDto): Promise<{
        code: number;
        msg: string;
        data: Record<string, any>;
    }>;
    expandContent(req: any, dto: ExpandContentDto): Promise<{
        code: number;
        msg: string;
        data: Record<string, any>;
    }>;
    polishContent(req: any, dto: PolishContentDto): Promise<{
        code: number;
        msg: string;
        data: Record<string, any>;
    }>;
    generateFullContent(req: any, dto: GenerateFullContentDto): Promise<{
        code: number;
        msg: string;
        data: Record<string, any>;
    }>;
    suggestInspiration(req: any, dto: SuggestInspirationDto): Promise<{
        code: number;
        msg: string;
        data: Record<string, any>;
    }>;
}
