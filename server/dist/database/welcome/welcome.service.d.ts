export declare class WelcomeService {
    private client;
    getAll(): Promise<any[]>;
    create(body: {
        title: string;
        content: string;
        imageUrl?: string;
        order: string;
    }): Promise<any>;
    update(id: string, body: {
        title?: string;
        content?: string;
        imageUrl?: string;
        order?: string;
        isActive?: string;
    }): Promise<any>;
    delete(id: string): Promise<any>;
}
