export declare class ImageAnalysisController {
    analyzeImage(body: {
        imageUrl: string;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            analysis: string;
            error?: undefined;
            stack?: undefined;
        };
    } | {
        code: number;
        msg: string;
        data: {
            error: any;
            stack: any;
            analysis?: undefined;
        };
    }>;
}
