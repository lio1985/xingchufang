import { ProductService } from './product.service';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    findAll(): Promise<{
        code: number;
        msg: string;
        data: any[];
    }>;
    findOne(id: string): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    create(body: {
        name: string;
        category?: string;
        description?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    update(id: string, body: {
        name?: string;
        category?: string;
        description?: string;
    }): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    delete(id: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
}
