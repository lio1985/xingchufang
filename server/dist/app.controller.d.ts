import { AppService } from '@/app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getApiInfo(): {
        service: string;
        version: string;
        status: string;
        docs: string;
    };
    getHello(): {
        status: string;
        data: string;
    };
    getHealth(): {
        status: string;
        data: string;
    };
}
