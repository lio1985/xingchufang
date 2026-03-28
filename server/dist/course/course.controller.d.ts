import { CourseService, CreateCourseDto, UpdateCourseDto, UpdateLearningDto, ContentType, CourseStatus } from './course.service';
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
    getCategories(): Promise<{
        code: number;
        msg: string;
        data: any[];
    }>;
    getList(categoryId?: string, contentType?: ContentType, status?: CourseStatus, keyword?: string, page?: string, limit?: string, req?: any): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }>;
    getDetail(id: string, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    create(dto: CreateCourseDto, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    update(id: string, dto: UpdateCourseDto, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    delete(id: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    publish(id: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    archive(id: string): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    uploadFile(file: Express.Multer.File): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            url: string;
            filename: string;
            size: number;
            mimetype: string;
            contentType: ContentType.IMAGE_TEXT | ContentType.PDF | ContentType.PPT | ContentType.OTHER;
        };
    }>;
    updateLearning(id: string, dto: UpdateLearningDto, req: any): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    toggleFavorite(id: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            isFavorite: boolean;
        };
    }>;
    getFavorites(page: string | undefined, limit: string | undefined, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            list: {
                favoriteAt: any;
                length: number;
                toString(): string;
                toLocaleString(): string;
                toLocaleString(locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
                pop(): any;
                push(...items: any[]): number;
                concat(...items: ConcatArray<any>[]): any[];
                concat(...items: any[]): any[];
                join(separator?: string): string;
                reverse(): any[];
                shift(): any;
                slice(start?: number, end?: number): any[];
                sort(compareFn?: ((a: any, b: any) => number) | undefined): any[];
                splice(start: number, deleteCount?: number): any[];
                splice(start: number, deleteCount: number, ...items: any[]): any[];
                unshift(...items: any[]): number;
                indexOf(searchElement: any, fromIndex?: number): number;
                lastIndexOf(searchElement: any, fromIndex?: number): number;
                every<S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): this is S[];
                every(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean;
                some(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean;
                forEach(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): void;
                map<U>(callbackfn: (value: any, index: number, array: any[]) => U, thisArg?: any): U[];
                filter<S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): S[];
                filter(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): any[];
                reduce(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any;
                reduce(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any;
                reduce<U>(callbackfn: (previousValue: U, currentValue: any, currentIndex: number, array: any[]) => U, initialValue: U): U;
                reduceRight(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any;
                reduceRight(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any;
                reduceRight<U>(callbackfn: (previousValue: U, currentValue: any, currentIndex: number, array: any[]) => U, initialValue: U): U;
                find<S extends any>(predicate: (value: any, index: number, obj: any[]) => value is S, thisArg?: any): S | undefined;
                find(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): any;
                findIndex(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): number;
                fill(value: any, start?: number, end?: number): any[];
                copyWithin(target: number, start: number, end?: number): any[];
                entries(): ArrayIterator<[number, any]>;
                keys(): ArrayIterator<number>;
                values(): ArrayIterator<any>;
                includes(searchElement: any, fromIndex?: number): boolean;
                flatMap<U, This = undefined>(callback: (this: This, value: any, index: number, array: any[]) => U | readonly U[], thisArg?: This | undefined): U[];
                flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[];
                [Symbol.iterator](): ArrayIterator<any>;
                [Symbol.unscopables]: {
                    [x: number]: boolean | undefined;
                    length?: boolean | undefined;
                    toString?: boolean | undefined;
                    toLocaleString?: boolean | undefined;
                    pop?: boolean | undefined;
                    push?: boolean | undefined;
                    concat?: boolean | undefined;
                    join?: boolean | undefined;
                    reverse?: boolean | undefined;
                    shift?: boolean | undefined;
                    slice?: boolean | undefined;
                    sort?: boolean | undefined;
                    splice?: boolean | undefined;
                    unshift?: boolean | undefined;
                    indexOf?: boolean | undefined;
                    lastIndexOf?: boolean | undefined;
                    every?: boolean | undefined;
                    some?: boolean | undefined;
                    forEach?: boolean | undefined;
                    map?: boolean | undefined;
                    filter?: boolean | undefined;
                    reduce?: boolean | undefined;
                    reduceRight?: boolean | undefined;
                    find?: boolean | undefined;
                    findIndex?: boolean | undefined;
                    fill?: boolean | undefined;
                    copyWithin?: boolean | undefined;
                    entries?: boolean | undefined;
                    keys?: boolean | undefined;
                    values?: boolean | undefined;
                    includes?: boolean | undefined;
                    flatMap?: boolean | undefined;
                    flat?: boolean | undefined;
                    [Symbol.iterator]?: boolean | undefined;
                    readonly [Symbol.unscopables]?: boolean | undefined;
                    at?: boolean | undefined;
                };
                at(index: number): any;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }>;
    getLearnings(page: string | undefined, limit: string | undefined, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            list: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }>;
    getStatistics(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            totalCourses: number;
            userStats: {
                completedCount: number;
                inProgressCount: number;
                totalTimeSpent: number;
            } | null;
            categoryStats: {
                id: string;
                name: string;
                count: number;
            }[];
        };
    }>;
    getRecommended(limit: string | undefined, req: any): Promise<{
        code: number;
        msg: string;
        data: any[];
    }>;
}
