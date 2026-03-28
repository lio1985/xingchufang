export declare class ProductService {
    private client;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(data: {
        name: string;
        category?: string;
        description?: string;
    }): Promise<any>;
    update(id: string, data: {
        name?: string;
        category?: string;
        description?: string;
    }): Promise<any>;
    delete(id: string): Promise<void>;
}
