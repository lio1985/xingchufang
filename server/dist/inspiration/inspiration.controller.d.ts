import { InspirationService } from './inspiration.service';
import { CreateInspirationDto } from '../types/inspiration.types';
export declare class InspirationController {
    private readonly inspirationService;
    constructor(inspirationService: InspirationService);
    findAll(): {
        code: number;
        msg: string;
        data: import("../types/inspiration.types").Inspiration[];
    };
    create(createInspirationDto: CreateInspirationDto): {
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: import("../types/inspiration.types").Inspiration;
    };
    delete(id: string): {
        code: number;
        msg: string;
        data: null;
    };
}
