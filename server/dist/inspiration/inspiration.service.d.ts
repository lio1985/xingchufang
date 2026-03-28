import { Inspiration, CreateInspirationDto } from '../types/inspiration.types';
export declare class InspirationService {
    private inspirations;
    findAll(): Inspiration[];
    findOne(id: string): Inspiration | undefined;
    create(createInspirationDto: CreateInspirationDto): Inspiration;
    delete(id: string): boolean;
}
