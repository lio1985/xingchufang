"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const permission_constants_1 = require("./permission.constants");
let PermissionService = class PermissionService {
    async getUserContext(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, role, status, team_id, is_team_leader')
            .eq('id', userId)
            .single();
        if (error || !user) {
            return null;
        }
        return {
            userId: user.id,
            role: user.role,
            status: user.status,
            teamId: user.team_id,
            isTeamLeader: user.is_team_leader || false,
        };
    }
    async hasPermission(userId, resource, action) {
        const context = await this.getUserContext(userId);
        if (!context) {
            return false;
        }
        if (context.status !== permission_constants_1.UserStatus.ACTIVE) {
            return false;
        }
        const rolePermissions = permission_constants_1.ROLE_PERMISSIONS[context.role];
        if (!rolePermissions) {
            return false;
        }
        const actions = rolePermissions[resource];
        return actions && actions.includes(action);
    }
    async requirePermission(userId, resource, action) {
        const hasPermission = await this.hasPermission(userId, resource, action);
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`无权执行此操作: ${action} ${resource}`);
        }
    }
    async isGuest(userId) {
        const context = await this.getUserContext(userId);
        return context?.role === permission_constants_1.UserRole.GUEST;
    }
    async isAdmin(userId) {
        const context = await this.getUserContext(userId);
        return context?.role === permission_constants_1.UserRole.ADMIN;
    }
    async isTeamLeader(userId) {
        const context = await this.getUserContext(userId);
        return context?.isTeamLeader === true || context?.role === permission_constants_1.UserRole.TEAM_LEADER;
    }
    async isActiveUser(userId) {
        const context = await this.getUserContext(userId);
        return context?.status === permission_constants_1.UserStatus.ACTIVE;
    }
    async canAccessData(currentUserId, resourceUserId, visibility = permission_constants_1.DataVisibility.PRIVATE, resourceTeamId) {
        const context = await this.getUserContext(currentUserId);
        if (!context) {
            return false;
        }
        if (context.role === permission_constants_1.UserRole.ADMIN) {
            return true;
        }
        if (context.role === permission_constants_1.UserRole.GUEST) {
            return visibility === permission_constants_1.DataVisibility.PUBLIC;
        }
        if (currentUserId === resourceUserId) {
            return true;
        }
        if (visibility === permission_constants_1.DataVisibility.PUBLIC) {
            return true;
        }
        if (visibility === permission_constants_1.DataVisibility.TEAM) {
            if (context.teamId && context.teamId === resourceTeamId) {
                return true;
            }
            if (context.isTeamLeader && context.teamId === resourceTeamId) {
                return true;
            }
        }
        if (context.isTeamLeader && context.teamId === resourceTeamId) {
            return true;
        }
        return false;
    }
    async getAccessibleUserIds(currentUserId) {
        const context = await this.getUserContext(currentUserId);
        if (!context) {
            return [];
        }
        const userIds = [currentUserId];
        if (context.role === permission_constants_1.UserRole.ADMIN) {
            const supabase = (0, supabase_client_1.getSupabaseClient)();
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('status', permission_constants_1.UserStatus.ACTIVE);
            return users?.map((u) => u.id) || [];
        }
        if (context.isTeamLeader && context.teamId) {
            const supabase = (0, supabase_client_1.getSupabaseClient)();
            const { data: teamMembers } = await supabase
                .from('users')
                .select('id')
                .eq('team_id', context.teamId)
                .eq('status', permission_constants_1.UserStatus.ACTIVE);
            if (teamMembers) {
                userIds.push(...teamMembers.map((m) => m.id));
            }
        }
        return [...new Set(userIds)];
    }
    async canViewOrderDetail(currentUserId, orderId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: order, error } = await supabase
            .from('equipment_orders')
            .select('id, status, accepted_by, created_by')
            .eq('id', orderId)
            .single();
        if (error || !order) {
            return { canView: false, canViewContact: false, reason: '订单不存在' };
        }
        const context = await this.getUserContext(currentUserId);
        if (!context) {
            return { canView: false, canViewContact: false, reason: '用户不存在' };
        }
        if (context.role === permission_constants_1.UserRole.ADMIN) {
            return { canView: true, canViewContact: true };
        }
        if (context.role === permission_constants_1.UserRole.GUEST) {
            return { canView: true, canViewContact: false, reason: '游客只能查看订单梗要' };
        }
        if (order.created_by === currentUserId) {
            return { canView: true, canViewContact: true };
        }
        if (order.accepted_by === currentUserId) {
            return { canView: true, canViewContact: true };
        }
        if (order.status === 'published') {
            return { canView: true, canViewContact: false };
        }
        return { canView: true, canViewContact: false, reason: '订单已被接单，无法查看联系信息' };
    }
    async canAcceptOrder(currentUserId, orderId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: order, error } = await supabase
            .from('equipment_orders')
            .select('id, status, accepted_by')
            .eq('id', orderId)
            .single();
        if (error || !order) {
            return { canAccept: false, reason: '订单不存在' };
        }
        if (order.status !== 'published') {
            return { canAccept: false, reason: '订单已被接单或已关闭' };
        }
        const hasPermission = await this.hasPermission(currentUserId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.ACCEPT_ORDER);
        if (!hasPermission) {
            return { canAccept: false, reason: '无接单权限' };
        }
        return { canAccept: true };
    }
    async canTransferOrder(currentUserId, orderId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: order, error } = await supabase
            .from('equipment_orders')
            .select('id, status, accepted_by')
            .eq('id', orderId)
            .single();
        if (error || !order) {
            return { canTransfer: false, reason: '订单不存在' };
        }
        if (order.accepted_by !== currentUserId) {
            return { canTransfer: false, reason: '只有接单者可以转让订单' };
        }
        if (order.status !== 'accepted') {
            return { canTransfer: false, reason: '当前订单状态不允许转让' };
        }
        return { canTransfer: true };
    }
    async canCancelOrder(currentUserId, orderId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: order, error } = await supabase
            .from('equipment_orders')
            .select('id, status, accepted_by')
            .eq('id', orderId)
            .single();
        if (error || !order) {
            return { canCancel: false, needAdminConfirm: false, reason: '订单不存在' };
        }
        const context = await this.getUserContext(currentUserId);
        if (!context) {
            return { canCancel: false, needAdminConfirm: false, reason: '用户不存在' };
        }
        if (context.role === permission_constants_1.UserRole.ADMIN) {
            return { canCancel: true, needAdminConfirm: false };
        }
        if (order.accepted_by === currentUserId) {
            return { canCancel: true, needAdminConfirm: true };
        }
        return { canCancel: false, needAdminConfirm: false, reason: '只有接单者可以申请取消订单' };
    }
    async canEditContent(currentUserId, contentId, contentType) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const tableName = contentType === 'lexicon' ? 'lexicons' :
            contentType === 'quick_note' ? 'quick_notes' : 'knowledge_shares';
        const { data: content, error } = await supabase
            .from(tableName)
            .select('id, user_id, source')
            .eq('id', contentId)
            .single();
        if (error || !content) {
            return { canEdit: false, reason: '内容不存在' };
        }
        const context = await this.getUserContext(currentUserId);
        if (!context) {
            return { canEdit: false, reason: '用户不存在' };
        }
        if (content.source === 'admin' && context.role !== permission_constants_1.UserRole.ADMIN) {
            return { canEdit: false, reason: '管理员发布的内容不可编辑' };
        }
        if (context.role === permission_constants_1.UserRole.ADMIN) {
            return { canEdit: true };
        }
        if (content.user_id === currentUserId) {
            return { canEdit: true };
        }
        return { canEdit: false, reason: '无权编辑此内容' };
    }
    async canDeleteContent(currentUserId, contentId, contentType) {
        const result = await this.canEditContent(currentUserId, contentId, contentType);
        return { canDelete: result.canEdit, reason: result.reason };
    }
    async isInSameTeam(userId1, userId2) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: users, error } = await supabase
            .from('users')
            .select('id, team_id')
            .in('id', [userId1, userId2]);
        if (error || !users || users.length < 2) {
            return false;
        }
        const team1 = users.find((u) => u.id === userId1)?.team_id;
        const team2 = users.find((u) => u.id === userId2)?.team_id;
        return team1 && team2 && team1 === team2;
    }
    async getTeamMemberIds(userId) {
        const context = await this.getUserContext(userId);
        if (!context || !context.teamId) {
            return [];
        }
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: members, error } = await supabase
            .from('users')
            .select('id')
            .eq('team_id', context.teamId)
            .eq('status', permission_constants_1.UserStatus.ACTIVE);
        if (error || !members) {
            return [];
        }
        return members.map((m) => m.id);
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)()
], PermissionService);
//# sourceMappingURL=permission.service.js.map