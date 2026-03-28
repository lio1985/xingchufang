"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickNotesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const permission_service_1 = require("../permission/permission.service");
const permission_constants_1 = require("../permission/permission.constants");
let QuickNotesService = class QuickNotesService {
    constructor(permissionService) {
        this.permissionService = permissionService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async getAccessibleUserIds(currentUserId) {
        return this.permissionService.getAccessibleUserIds(currentUserId);
    }
    async validateAccess(userId, noteId) {
        const { data: note, error } = await this.client
            .from('quick_notes')
            .select('*')
            .eq('id', noteId)
            .single();
        if (error || !note) {
            throw new common_1.NotFoundException('笔记不存在');
        }
        const canAccess = await this.permissionService.canAccessData(userId, note.user_id, note.visibility || permission_constants_1.DataVisibility.PRIVATE, note.team_id);
        if (!canAccess) {
            throw new common_1.ForbiddenException('无权访问此笔记');
        }
        return note;
    }
    async validateEditPermission(userId, noteId) {
        const { data: note, error } = await this.client
            .from('quick_notes')
            .select('*')
            .eq('id', noteId)
            .single();
        if (error || !note) {
            throw new common_1.NotFoundException('笔记不存在');
        }
        const permissionCheck = await this.permissionService.canEditContent(userId, noteId, 'quick_note');
        if (!permissionCheck.canEdit) {
            throw new common_1.ForbiddenException(permissionCheck.reason || '无权编辑此笔记');
        }
        return note;
    }
    async getAllForAdmin(userId, page = 1, pageSize = 50, search, tag, showStarredOnly) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.QUICK_NOTE, permission_constants_1.PermissionAction.READ);
        const isAdmin = await this.permissionService.isAdmin(userId);
        if (!isAdmin) {
            throw new common_1.ForbiddenException('需要管理员权限');
        }
        let query = this.client
            .from('quick_notes')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('updated_at', { ascending: false });
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }
        if (tag) {
            query = query.contains('tags', [tag]);
        }
        if (showStarredOnly) {
            query = query.eq('is_starred', true);
        }
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return {
            notes: data || [],
            total: count || 0,
            page,
            pageSize,
        };
    }
    async getByUserId(currentUserId, targetUserId, page = 1, pageSize = 50, search, tag, showStarredOnly) {
        const context = await this.permissionService.getUserContext(currentUserId);
        if (!context) {
            throw new common_1.ForbiddenException('用户信息不存在');
        }
        if (context.role === permission_constants_1.UserRole.GUEST) {
            throw new common_1.ForbiddenException('游客无权查看笔记');
        }
        const isAdmin = context.role === permission_constants_1.UserRole.ADMIN;
        if (!isAdmin && currentUserId !== targetUserId) {
            const isInSameTeam = await this.permissionService.isInSameTeam(currentUserId, targetUserId);
            if (!isInSameTeam) {
                throw new common_1.ForbiddenException('无权查看其他用户的笔记');
            }
        }
        let query = this.client
            .from('quick_notes')
            .select('*', { count: 'exact' })
            .eq('user_id', targetUserId)
            .order('is_pinned', { ascending: false })
            .order('updated_at', { ascending: false });
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }
        if (tag) {
            query = query.contains('tags', [tag]);
        }
        if (showStarredOnly) {
            query = query.eq('is_starred', true);
        }
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return {
            notes: data || [],
            total: count || 0,
            page,
            pageSize,
        };
    }
    async getVisibleNotes(currentUserId, page = 1, pageSize = 50, search, tag, showStarredOnly) {
        const accessibleUserIds = await this.getAccessibleUserIds(currentUserId);
        let query = this.client
            .from('quick_notes')
            .select('*', { count: 'exact' })
            .in('user_id', accessibleUserIds)
            .order('is_pinned', { ascending: false })
            .order('updated_at', { ascending: false });
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }
        if (tag) {
            query = query.contains('tags', [tag]);
        }
        if (showStarredOnly) {
            query = query.eq('is_starred', true);
        }
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return {
            notes: data || [],
            total: count || 0,
            page,
            pageSize,
        };
    }
    async getById(userId, id) {
        const note = await this.validateAccess(userId, id);
        const { data: userData } = await this.client
            .from('users')
            .select('nickname, username, avatar_url')
            .eq('id', note.user_id)
            .single();
        return {
            ...note,
            userNickname: userData?.nickname || userData?.username || '',
            userAvatar: userData?.avatar_url || '',
        };
    }
    async create(userId, dto) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.QUICK_NOTE, permission_constants_1.PermissionAction.CREATE);
        const context = await this.permissionService.getUserContext(userId);
        const now = new Date().toISOString();
        const { data, error } = await this.client
            .from('quick_notes')
            .insert({
            user_id: userId,
            title: dto.title,
            content: dto.content,
            tags: dto.tags || [],
            images: dto.images || [],
            is_starred: dto.is_starred || false,
            is_pinned: dto.is_pinned || false,
            visibility: dto.visibility || permission_constants_1.DataVisibility.PRIVATE,
            team_id: context?.teamId || null,
            created_at: now,
            updated_at: now,
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async update(userId, id, dto) {
        await this.validateEditPermission(userId, id);
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.content !== undefined)
            updateData.content = dto.content;
        if (dto.tags !== undefined)
            updateData.tags = dto.tags;
        if (dto.images !== undefined)
            updateData.images = dto.images;
        if (dto.is_starred !== undefined)
            updateData.is_starred = dto.is_starred;
        if (dto.is_pinned !== undefined)
            updateData.is_pinned = dto.is_pinned;
        if (dto.visibility !== undefined)
            updateData.visibility = dto.visibility;
        const { data, error } = await this.client
            .from('quick_notes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async delete(userId, id) {
        const permissionCheck = await this.permissionService.canDeleteContent(userId, id, 'quick_note');
        if (!permissionCheck.canDelete) {
            throw new common_1.ForbiddenException(permissionCheck.reason || '无权删除此笔记');
        }
        const { error } = await this.client
            .from('quick_notes')
            .delete()
            .eq('id', id);
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    async batchDelete(userId, ids) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.QUICK_NOTE, permission_constants_1.PermissionAction.DELETE);
        const isAdmin = await this.permissionService.isAdmin(userId);
        if (!isAdmin) {
            throw new common_1.ForbiddenException('需要管理员权限');
        }
        const { error } = await this.client
            .from('quick_notes')
            .delete()
            .in('id', ids);
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    async toggleStar(userId, id) {
        const note = await this.validateEditPermission(userId, id);
        const { data, error } = await this.client
            .from('quick_notes')
            .update({ is_starred: !note.is_starred, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async togglePin(userId, id) {
        const note = await this.validateEditPermission(userId, id);
        const { data, error } = await this.client
            .from('quick_notes')
            .update({ is_pinned: !note.is_pinned, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getAllTags(userId) {
        const accessibleUserIds = await this.getAccessibleUserIds(userId);
        const { data, error } = await this.client
            .from('quick_notes')
            .select('tags')
            .in('user_id', accessibleUserIds);
        if (error)
            throw new common_1.BadRequestException(error.message);
        const allTags = new Set();
        data.forEach(note => {
            note.tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags);
    }
};
exports.QuickNotesService = QuickNotesService;
exports.QuickNotesService = QuickNotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], QuickNotesService);
//# sourceMappingURL=quick-notes.service.js.map