export declare class ImageFetchController {
    fetchImage(body: {
        url: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
}
