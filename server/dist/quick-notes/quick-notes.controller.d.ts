import { QuickNotesService } from './quick-notes.service';
import { QuickNote, QuickNoteListResponse } from './types';
export declare class QuickNotesController {
    private readonly quickNotesService;
    constructor(quickNotesService: QuickNotesService);
    getAll(req: any, page?: number, pageSize?: number, search?: string, tag?: string, showStarredOnly?: string): Promise<{
        code: number;
        msg: string;
        data: {
            list: never[];
            pagination: {
                page: number;
                pageSize: number;
                total: number;
                totalPages: number;
            };
        };
    } | {
        code: number;
        msg: string;
        data: QuickNoteListResponse;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getAllForAdmin(req: any, page?: number, pageSize?: number, search?: string, tag?: string, showStarredOnly?: string): Promise<{
        code: number;
        msg: string;
        data: QuickNoteListResponse;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getAllTags(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            tags: string[];
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getById(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: QuickNote;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    create(req: any, body: {
        title: string;
        content: string;
        tags?: string[];
        images?: string[];
        is_starred?: boolean;
        is_pinned?: boolean;
    }): Promise<{
        code: number;
        msg: string;
        data: QuickNote;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    update(req: any, id: string, body: {
        title?: string;
        content?: string;
        tags?: string[];
        images?: string[];
        is_starred?: boolean;
        is_pinned?: boolean;
    }): Promise<{
        code: number;
        msg: string;
        data: QuickNote;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    delete(req: any, id: string): Promise<{
        code: any;
        msg: any;
        data: null;
    }>;
    batchDelete(req: any, body: {
        ids: string[];
    }): Promise<{
        code: any;
        msg: any;
        data: null;
    }>;
    toggleStar(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: QuickNote;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    togglePin(req: any, id: string): Promise<{
        code: number;
        msg: string;
        data: QuickNote;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
}
