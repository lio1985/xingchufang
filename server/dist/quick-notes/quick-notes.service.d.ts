import { PermissionService } from '../permission/permission.service';
import { QuickNote, QuickNoteListResponse, CreateQuickNoteDto, UpdateQuickNoteDto } from './types';
export declare class QuickNotesService {
    private readonly permissionService;
    private client;
    constructor(permissionService: PermissionService);
    private getAccessibleUserIds;
    private validateAccess;
    private validateEditPermission;
    getAllForAdmin(userId: string, page?: number, pageSize?: number, search?: string, tag?: string, showStarredOnly?: boolean): Promise<QuickNoteListResponse>;
    getByUserId(currentUserId: string, targetUserId: string, page?: number, pageSize?: number, search?: string, tag?: string, showStarredOnly?: boolean): Promise<QuickNoteListResponse>;
    getVisibleNotes(currentUserId: string, page?: number, pageSize?: number, search?: string, tag?: string, showStarredOnly?: boolean): Promise<QuickNoteListResponse>;
    getById(userId: string, id: string): Promise<QuickNote>;
    create(userId: string, dto: CreateQuickNoteDto): Promise<QuickNote>;
    update(userId: string, id: string, dto: UpdateQuickNoteDto): Promise<QuickNote>;
    delete(userId: string, id: string): Promise<void>;
    batchDelete(userId: string, ids: string[]): Promise<void>;
    toggleStar(userId: string, id: string): Promise<QuickNote>;
    togglePin(userId: string, id: string): Promise<QuickNote>;
    getAllTags(userId: string): Promise<string[]>;
}
