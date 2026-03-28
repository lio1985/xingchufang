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
exports.KnowledgeShareService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const permission_service_1 = require("../permission/permission.service");
const permission_constants_1 = require("../permission/permission.constants");
let KnowledgeShareService = class KnowledgeShareService {
    constructor(permissionService) {
        this.permissionService = permissionService;
    }
    async findAll(userId, keyword) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const context = await this.permissionService.getUserContext(userId);
        if (!context) {
            throw new common_1.ForbiddenException('用户信息不存在');
        }
        let query = supabase
            .from('knowledge_shares')
            .select(`
        id,
        user_id,
        title,
        content,
        category,
        tags,
        source,
        visibility,
        view_count,
        like_count,
        created_at,
        users!inner (
          nickname
        )
      `)
            .eq('is_published', true)
            .order('created_at', { ascending: false });
        if (context.role !== permission_constants_1.UserRole.ADMIN) {
            const accessibleUserIds = await this.permissionService.getAccessibleUserIds(userId);
            query = query.or(`visibility.eq.public,user_id.in.(${accessibleUserIds.join(',')})`);
        }
        if (keyword) {
            query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
        }
        const { data, error } = await query;
        if (error) {
            throw new common_1.BadRequestException(`查询失败: ${error.message}`);
        }
        return data.map(item => ({
            id: item.id,
            userId: item.user_id,
            title: item.title,
            content: item.content,
            category: item.category,
            tags: item.tags,
            source: item.source,
            visibility: item.visibility,
            viewCount: item.view_count,
            likeCount: item.like_count,
            createdAt: item.created_at,
            author: Array.isArray(item.users) && item.users.length > 0 ? item.users[0].nickname : '匿名用户',
        }));
    }
    async findOne(id, userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: share, error: shareError } = await supabase
            .from('knowledge_shares')
            .select(`
        *,
        users!inner (
          nickname,
          avatar_url
        )
      `)
            .eq('id', id)
            .single();
        if (shareError || !share) {
            throw new common_1.NotFoundException('知识分享不存在');
        }
        const canAccess = await this.permissionService.canAccessData(userId, share.user_id, share.visibility || permission_constants_1.DataVisibility.PUBLIC, share.team_id);
        if (!canAccess && !share.is_published) {
            throw new common_1.ForbiddenException('无权访问此知识分享');
        }
        await supabase
            .from('knowledge_shares')
            .update({ view_count: (share.view_count || 0) + 1 })
            .eq('id', id);
        return {
            id: share.id,
            userId: share.user_id,
            title: share.title,
            content: share.content,
            category: share.category,
            tags: share.tags,
            attachments: share.attachments || [],
            source: share.source,
            visibility: share.visibility,
            viewCount: (share.view_count || 0) + 1,
            likeCount: share.like_count || 0,
            isPublished: share.is_published,
            createdAt: share.created_at,
            updatedAt: share.updated_at,
            author: share.users?.nickname || '匿名用户',
            authorAvatar: share.users?.avatar_url || '',
        };
    }
    async create(userId, data) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.KNOWLEDGE_SHARE, permission_constants_1.PermissionAction.CREATE);
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const context = await this.permissionService.getUserContext(userId);
        const source = context?.role === permission_constants_1.UserRole.ADMIN ? 'admin' : 'employee';
        const { data: newShare, error } = await supabase
            .from('knowledge_shares')
            .insert({
            user_id: userId,
            title: data.title,
            content: data.content,
            category: data.category || 'uncategorized',
            tags: data.tags || [],
            attachments: data.attachments || [],
            view_count: 0,
            like_count: 0,
            is_published: data.isPublished !== false,
            source: source,
            visibility: data.visibility || permission_constants_1.DataVisibility.PUBLIC,
            team_id: context?.teamId || null,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(`创建失败: ${error.message}`);
        }
        return newShare;
    }
    async update(id, userId, data) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const permissionCheck = await this.permissionService.canEditContent(userId, id, 'knowledge_share');
        if (!permissionCheck.canEdit) {
            throw new common_1.ForbiddenException(permissionCheck.reason || '无权修改此知识分享');
        }
        const { data: updated, error: updateError } = await supabase
            .from('knowledge_shares')
            .update({
            title: data.title,
            content: data.content,
            category: data.category,
            tags: data.tags,
            attachments: data.attachments,
            is_published: data.isPublished,
            visibility: data.visibility,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (updateError) {
            throw new common_1.BadRequestException(`更新失败: ${updateError.message}`);
        }
        return updated;
    }
    async remove(id, userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const permissionCheck = await this.permissionService.canDeleteContent(userId, id, 'knowledge_share');
        if (!permissionCheck.canDelete) {
            throw new common_1.ForbiddenException(permissionCheck.reason || '无权删除此知识分享');
        }
        const { error: deleteError } = await supabase
            .from('knowledge_shares')
            .delete()
            .eq('id', id);
        if (deleteError) {
            throw new common_1.BadRequestException(`删除失败: ${deleteError.message}`);
        }
        return { message: '删除成功' };
    }
    async like(id, userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: share, error: getError } = await supabase
            .from('knowledge_shares')
            .select('like_count, user_id, visibility, team_id')
            .eq('id', id)
            .single();
        if (getError || !share) {
            throw new common_1.NotFoundException('知识分享不存在');
        }
        const canAccess = await this.permissionService.canAccessData(userId, share.user_id, share.visibility || permission_constants_1.DataVisibility.PUBLIC, share.team_id);
        if (!canAccess) {
            throw new common_1.ForbiddenException('无权访问此知识分享');
        }
        const { error: updateError } = await supabase
            .from('knowledge_shares')
            .update({ like_count: (share.like_count || 0) + 1 })
            .eq('id', id);
        if (updateError) {
            throw new common_1.BadRequestException(`点赞失败: ${updateError.message}`);
        }
        return { message: '点赞成功' };
    }
    async findByUserId(userId, page = 1, pageSize = 20) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, error, count } = await supabase
            .from('knowledge_shares')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) {
            throw new common_1.BadRequestException(`查询失败: ${error.message}`);
        }
        return {
            list: data,
            total: count || 0,
            page,
            pageSize,
        };
    }
    async findAllForAdmin(userId, page = 1, pageSize = 20) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.KNOWLEDGE_SHARE, permission_constants_1.PermissionAction.READ);
        const isAdmin = await this.permissionService.isAdmin(userId);
        if (!isAdmin) {
            throw new common_1.ForbiddenException('需要管理员权限');
        }
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, error, count } = await supabase
            .from('knowledge_shares')
            .select('*, users(nickname, avatar_url)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) {
            throw new common_1.BadRequestException(`查询失败: ${error.message}`);
        }
        return {
            list: data,
            total: count || 0,
            page,
            pageSize,
        };
    }
};
exports.KnowledgeShareService = KnowledgeShareService;
exports.KnowledgeShareService = KnowledgeShareService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], KnowledgeShareService);
//# sourceMappingURL=knowledge-share.service.js.map