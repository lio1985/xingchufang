import { UserRole, UserStatus, DataVisibility, PermissionAction, PermissionResource } from './permission.constants';
export interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
}
export interface UserPermissionContext {
    userId: string;
    role: UserRole;
    status: UserStatus;
    teamId?: string;
    isTeamLeader: boolean;
}
export declare class PermissionService {
    getUserContext(userId: string): Promise<UserPermissionContext | null>;
    hasPermission(userId: string, resource: PermissionResource, action: PermissionAction): Promise<boolean>;
    requirePermission(userId: string, resource: PermissionResource, action: PermissionAction): Promise<void>;
    isGuest(userId: string): Promise<boolean>;
    isAdmin(userId: string): Promise<boolean>;
    isTeamLeader(userId: string): Promise<boolean>;
    isActiveUser(userId: string): Promise<boolean>;
    canAccessData(currentUserId: string, resourceUserId: string, visibility?: DataVisibility, resourceTeamId?: string): Promise<boolean>;
    getAccessibleUserIds(currentUserId: string): Promise<string[]>;
    canViewOrderDetail(currentUserId: string, orderId: string): Promise<{
        canView: boolean;
        canViewContact: boolean;
        reason?: string;
    }>;
    canAcceptOrder(currentUserId: string, orderId: string): Promise<{
        canAccept: boolean;
        reason?: string;
    }>;
    canTransferOrder(currentUserId: string, orderId: string): Promise<{
        canTransfer: boolean;
        reason?: string;
    }>;
    canCancelOrder(currentUserId: string, orderId: string): Promise<{
        canCancel: boolean;
        needAdminConfirm: boolean;
        reason?: string;
    }>;
    canEditContent(currentUserId: string, contentId: string, contentType: 'lexicon' | 'quick_note' | 'knowledge_share'): Promise<{
        canEdit: boolean;
        reason?: string;
    }>;
    canDeleteContent(currentUserId: string, contentId: string, contentType: 'lexicon' | 'quick_note' | 'knowledge_share'): Promise<{
        canDelete: boolean;
        reason?: string;
    }>;
    isInSameTeam(userId1: string, userId2: string): Promise<boolean>;
    getTeamMemberIds(userId: string): Promise<string[]>;
}
