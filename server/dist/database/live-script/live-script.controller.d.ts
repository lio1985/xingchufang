import { LiveScriptService } from './live-script.service';
export declare class LiveScriptController {
    private readonly liveScriptService;
    constructor(liveScriptService: LiveScriptService);
    findAll(): Promise<{
        code: number;
        msg: string;
        data: any[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    findOne(id: string): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    create(body: {
        title: string;
        date?: string;
        content: string;
        duration?: string;
        viewer_count?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    update(id: string, body: {
        title?: string;
        date?: string;
        content?: string;
        duration?: string;
        viewer_count?: string;
        analysis?: any;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    delete(id: string): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    analyze(id: string): Promise<{
        code: number;
        msg: string;
        data: import("./live-script.service").LiveAnalysis;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
}
