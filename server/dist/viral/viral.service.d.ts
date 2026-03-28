import { DatabaseService } from '../database/database.service';
export declare class ViralService {
    private databaseService;
    private asrClient;
    private llmClient;
    constructor(databaseService: DatabaseService);
    parseDouyinUrl(url: string): Promise<{
        videoUrl: string;
        title: string;
        desc: string;
    } | null>;
    extractTextWithLLM(shareText: string): Promise<string>;
    extractTextFromShare(shareText: string): string;
    extractVideoAudioToText(videoUrl: string): Promise<string>;
    extractVideo(url: string): Promise<void>;
    transcribeAudio(audioUrl: string): Promise<{
        transcript: string;
        duration: number | undefined;
    }>;
    transcribeAudioFromBase64(base64Audio: string): Promise<{
        transcript: string;
        duration: number | undefined;
    }>;
    analyzeContent(transcript: string, platform: string): Promise<any>;
    analyzeDouyinContent(shareText: string): Promise<{
        transcript: string;
        structure: any;
        framework: any;
        source: string;
    }>;
    private analyzeTranscript;
    favoriteFramework(userId: string | null | undefined, title: string, structure: any, framework: any): Promise<{
        id: any;
    }>;
    getFavorites(userId: string | null | undefined): Promise<any[]>;
    remixContent(data: {
        transcript: string;
        structure: any;
        framework: any;
        remixIdea: string;
        lexiconContents: string;
        style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq';
    }): Promise<{
        schemes: any;
    }>;
    optimizeIdea(idea: string, transcript?: string, style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq'): Promise<{
        optimizedIdea: string;
    }>;
}
