import { ViralService } from './viral.service';
export declare class ViralController {
    private readonly viralService;
    constructor(viralService: ViralService);
    extractVideo(body: {
        url: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    transcribeAudio(body: {
        audioUrl: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    transcribeAudioFromBase64(body: {
        base64Audio: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    analyzeContent(body: {
        transcript?: string;
        content?: string;
        platform?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    favoriteStructure(body: {
        title: string;
        structure: any;
        framework: any;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    getFavorites(): Promise<{
        code: number;
        msg: string;
        data: any[];
    }>;
    analyzeDouyin(body: {
        url?: string;
        shareText?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    remixContent(body: {
        transcript: string;
        structure: any;
        framework: any;
        remixIdea: string;
        lexiconContents: string;
        style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq';
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    optimizeIdea(body: {
        idea: string;
        transcript?: string;
        style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq';
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
}
