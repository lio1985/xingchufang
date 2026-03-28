import { WelcomeService } from './welcome.service';
export declare class WelcomeController {
    private readonly welcomeService;
    constructor(welcomeService: WelcomeService);
    getAll(): Promise<{
        code: number;
        msg: string;
        data: any[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    create(body: {
        title: string;
        content: string;
        imageUrl?: string;
        order: string;
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
        content?: string;
        imageUrl?: string;
        order?: string;
        isActive?: string;
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
        msg: string;
        data: any;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
}
