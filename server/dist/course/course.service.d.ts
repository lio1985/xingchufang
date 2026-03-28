export declare enum ContentType {
    TEXT = "text",
    IMAGE_TEXT = "image_text",
    PDF = "pdf",
    PPT = "ppt",
    VIDEO = "video",
    OTHER = "other"
}
export declare enum Difficulty {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}
export declare enum CourseStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export interface CreateCourseDto {
    title: string;
    description?: string;
    content?: string;
    categoryId?: string;
    contentType?: ContentType;
    coverImage?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    difficulty?: Difficulty;
    status?: CourseStatus;
    tags?: string[];
}
export interface UpdateCourseDto extends Partial<CreateCourseDto> {
}
export interface UpdateLearningDto {
    progress?: number;
    status?: 'not_started' | 'in_progress' | 'completed';
    lastPosition?: number;
    timeSpent?: number;
}
export declare class CourseService {
    private get supabase();
    getCategories(): Promise<{
        success: boolean;
        data: any[];
    }>;
    createCourse(dto: CreateCourseDto, userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getCourses(params: {
        categoryId?: string;
        contentType?: ContentType;
        status?: CourseStatus;
        keyword?: string;
        page?: number;
        limit?: number;
        userId?: string;
        isAdmin?: boolean;
    }): Promise<{
        success: boolean;
        data: {
            list: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }>;
    getCourseDetail(courseId: string, userId?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateCourse(courseId: string, dto: UpdateCourseDto, userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    deleteCourse(courseId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    publishCourse(courseId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    archiveCourse(courseId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateLearning(courseId: string, userId: string, dto: UpdateLearningDto): Promise<{
        success: boolean;
        data: any;
    }>;
    toggleFavorite(courseId: string, userId: string): Promise<{
        success: boolean;
        data: {
            isFavorite: boolean;
        };
    }>;
    getFavoriteCourses(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
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
    getLearningHistory(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            list: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
            };
        };
    }>;
    getStatistics(userId?: string): Promise<{
        success: boolean;
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
    getRecommendedCourses(userId?: string, limit?: number): Promise<{
        success: boolean;
        data: any[];
    }>;
}
