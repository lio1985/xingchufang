import { Injectable, ForbiddenException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import {
  UserRole,
  UserStatus,
  DataVisibility,
  PermissionAction,
  PermissionResource,
  ROLE_PERMISSIONS,
  DATA_ISOLATION_RULES,
} from './permission.constants';

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * 用户权限上下文
 */
export interface UserPermissionContext {
  userId: string;
  role: UserRole;
  status: UserStatus;
  teamId?: string;
  isTeamLeader: boolean;
}

/**
 * 统一权限服务
 * 提供集中的权限检查和管理功能
 */
@Injectable()
export class PermissionService {
  /**
   * 获取用户权限上下文
   */
  async getUserContext(userId: string): Promise<UserPermissionContext | null> {
    const supabase = getSupabaseClient();

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
      role: user.role as UserRole,
      status: user.status as UserStatus,
      teamId: user.team_id,
      isTeamLeader: user.is_team_leader || false,
    };
  }

  /**
   * 检查用户是否有指定资源的操作权限
   */
  async hasPermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<boolean> {
    const context = await this.getUserContext(userId);
    if (!context) {
      return false;
    }

    // 检查用户状态
    if (context.status !== UserStatus.ACTIVE) {
      return false;
    }

    // 获取角色权限
    const rolePermissions = ROLE_PERMISSIONS[context.role];
    if (!rolePermissions) {
      return false;
    }

    // 检查是否有该操作权限
    const actions = rolePermissions[resource];
    return actions && actions.includes(action);
  }

  /**
   * 要求用户有指定权限，否则抛出异常
   */
  async requirePermission(
    userId: string,
    resource: PermissionResource,
    action: PermissionAction,
  ): Promise<void> {
    const hasPermission = await this.hasPermission(userId, resource, action);
    if (!hasPermission) {
      throw new ForbiddenException(`无权执行此操作: ${action} ${resource}`);
    }
  }

  // ==================== 角色检查方法 ====================

  /**
   * 检查是否是游客
   */
  async isGuest(userId: string): Promise<boolean> {
    const context = await this.getUserContext(userId);
    return context?.role === UserRole.GUEST;
  }

  /**
   * 检查是否是管理员
   */
  async isAdmin(userId: string): Promise<boolean> {
    const context = await this.getUserContext(userId);
    return context?.role === UserRole.ADMIN;
  }

  /**
   * 检查是否是团队队长
   */
  async isTeamLeader(userId: string): Promise<boolean> {
    const context = await this.getUserContext(userId);
    return context?.isTeamLeader === true || context?.role === UserRole.TEAM_LEADER;
  }

  /**
   * 检查用户是否已激活
   */
  async isActiveUser(userId: string): Promise<boolean> {
    const context = await this.getUserContext(userId);
    return context?.status === UserStatus.ACTIVE;
  }

  // ==================== 数据隔离方法 ====================

  /**
   * 检查数据访问权限
   * @param currentUserId 当前用户ID
   * @param resourceUserId 资源所属用户ID
   * @param visibility 数据可见性
   * @param resourceTeamId 资源所属团队ID（可选）
   */
  async canAccessData(
    currentUserId: string,
    resourceUserId: string,
    visibility: DataVisibility = DataVisibility.PRIVATE,
    resourceTeamId?: string,
  ): Promise<boolean> {
    const context = await this.getUserContext(currentUserId);
    if (!context) {
      return false;
    }

    // 管理员可以访问所有数据
    if (context.role === UserRole.ADMIN) {
      return true;
    }

    // 游客只能访问公开数据
    if (context.role === UserRole.GUEST) {
      return visibility === DataVisibility.PUBLIC;
    }

    // 自己的数据可以访问
    if (currentUserId === resourceUserId) {
      return true;
    }

    // 公开数据可以访问
    if (visibility === DataVisibility.PUBLIC) {
      return true;
    }

    // 团队可见数据
    if (visibility === DataVisibility.TEAM) {
      // 检查是否在同一团队
      if (context.teamId && context.teamId === resourceTeamId) {
        return true;
      }
      // 队长可以访问团队成员数据
      if (context.isTeamLeader && context.teamId === resourceTeamId) {
        return true;
      }
    }

    // 团队队长可以访问团队成员的私有数据
    if (context.isTeamLeader && context.teamId === resourceTeamId) {
      return true;
    }

    return false;
  }

  /**
   * 获取用户可访问的用户ID列表（用于数据查询）
   */
  async getAccessibleUserIds(currentUserId: string): Promise<string[]> {
    const context = await this.getUserContext(currentUserId);
    if (!context) {
      return [];
    }

    const userIds: string[] = [currentUserId];

    // 管理员可访问所有用户数据
    if (context.role === UserRole.ADMIN) {
      const supabase = getSupabaseClient();
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('status', UserStatus.ACTIVE);
      return users?.map((u) => u.id) || [];
    }

    // 团队队长可访问团队成员数据
    if (context.isTeamLeader && context.teamId) {
      const supabase = getSupabaseClient();
      const { data: teamMembers } = await supabase
        .from('users')
        .select('id')
        .eq('team_id', context.teamId)
        .eq('status', UserStatus.ACTIVE);
      if (teamMembers) {
        userIds.push(...teamMembers.map((m) => m.id));
      }
    }

    return [...new Set(userIds)];
  }

  // ==================== 订单权限控制 ====================

  /**
   * 检查是否可以查看订单详情（包含联系信息）
   */
  async canViewOrderDetail(
    currentUserId: string,
    orderId: string,
  ): Promise<{ canView: boolean; canViewContact: boolean; reason?: string }> {
    const supabase = getSupabaseClient();

    // 获取订单信息
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

    // 管理员可以查看所有信息
    if (context.role === UserRole.ADMIN) {
      return { canView: true, canViewContact: true };
    }

    // 游客只能看梗要
    if (context.role === UserRole.GUEST) {
      return { canView: true, canViewContact: false, reason: '游客只能查看订单梗要' };
    }

    // 订单创建者可以查看
    if (order.created_by === currentUserId) {
      return { canView: true, canViewContact: true };
    }

    // 接单者可以查看完整信息
    if (order.accepted_by === currentUserId) {
      return { canView: true, canViewContact: true };
    }

    // 未接单状态，所有员工可以查看梗要
    if (order.status === 'published') {
      return { canView: true, canViewContact: false };
    }

    // 已接单状态，其他人不能查看
    return { canView: true, canViewContact: false, reason: '订单已被接单，无法查看联系信息' };
  }

  /**
   * 检查是否可以接单
   */
  async canAcceptOrder(
    currentUserId: string,
    orderId: string,
  ): Promise<{ canAccept: boolean; reason?: string }> {
    const supabase = getSupabaseClient();

    // 获取订单信息
    const { data: order, error } = await supabase
      .from('equipment_orders')
      .select('id, status, accepted_by')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { canAccept: false, reason: '订单不存在' };
    }

    // 检查订单状态
    if (order.status !== 'published') {
      return { canAccept: false, reason: '订单已被接单或已关闭' };
    }

    // 检查用户权限
    const hasPermission = await this.hasPermission(
      currentUserId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.ACCEPT_ORDER,
    );

    if (!hasPermission) {
      return { canAccept: false, reason: '无接单权限' };
    }

    return { canAccept: true };
  }

  /**
   * 检查是否可以转让订单
   */
  async canTransferOrder(
    currentUserId: string,
    orderId: string,
  ): Promise<{ canTransfer: boolean; reason?: string }> {
    const supabase = getSupabaseClient();

    const { data: order, error } = await supabase
      .from('equipment_orders')
      .select('id, status, accepted_by')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { canTransfer: false, reason: '订单不存在' };
    }

    // 只有接单者可以转让
    if (order.accepted_by !== currentUserId) {
      return { canTransfer: false, reason: '只有接单者可以转让订单' };
    }

    // 只有已接单状态可以转让
    if (order.status !== 'accepted') {
      return { canTransfer: false, reason: '当前订单状态不允许转让' };
    }

    return { canTransfer: true };
  }

  /**
   * 检查是否可以取消订单（申请取消）
   */
  async canCancelOrder(
    currentUserId: string,
    orderId: string,
  ): Promise<{ canCancel: boolean; needAdminConfirm: boolean; reason?: string }> {
    const supabase = getSupabaseClient();

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

    // 管理员可以直接取消
    if (context.role === UserRole.ADMIN) {
      return { canCancel: true, needAdminConfirm: false };
    }

    // 接单者可以申请取消，需要管理员确认
    if (order.accepted_by === currentUserId) {
      return { canCancel: true, needAdminConfirm: true };
    }

    return { canCancel: false, needAdminConfirm: false, reason: '只有接单者可以申请取消订单' };
  }

  // ==================== 内容权限控制 ====================

  /**
   * 检查是否可以编辑内容
   */
  async canEditContent(
    currentUserId: string,
    contentId: string,
    contentType: 'lexicon' | 'quick_note' | 'knowledge_share',
  ): Promise<{ canEdit: boolean; reason?: string }> {
    const supabase = getSupabaseClient();

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

    // 管理员发布的内容，其他员工不能编辑
    if (content.source === 'admin' && context.role !== UserRole.ADMIN) {
      return { canEdit: false, reason: '管理员发布的内容不可编辑' };
    }

    // 管理员可以编辑所有内容
    if (context.role === UserRole.ADMIN) {
      return { canEdit: true };
    }

    // 只有创建者可以编辑自己的内容
    if (content.user_id === currentUserId) {
      return { canEdit: true };
    }

    return { canEdit: false, reason: '无权编辑此内容' };
  }

  /**
   * 检查是否可以删除内容
   */
  async canDeleteContent(
    currentUserId: string,
    contentId: string,
    contentType: 'lexicon' | 'quick_note' | 'knowledge_share',
  ): Promise<{ canDelete: boolean; reason?: string }> {
    // 删除权限与编辑权限相同
    const result = await this.canEditContent(currentUserId, contentId, contentType);
    return { canDelete: result.canEdit, reason: result.reason };
  }

  // ==================== 辅助方法 ====================

  /**
   * 检查两个用户是否在同一团队
   */
  async isInSameTeam(userId1: string, userId2: string): Promise<boolean> {
    const supabase = getSupabaseClient();

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

  /**
   * 获取用户所在团队的所有成员ID
   */
  async getTeamMemberIds(userId: string): Promise<string[]> {
    const context = await this.getUserContext(userId);
    if (!context || !context.teamId) {
      return [];
    }

    const supabase = getSupabaseClient();
    const { data: members, error } = await supabase
      .from('users')
      .select('id')
      .eq('team_id', context.teamId)
      .eq('status', UserStatus.ACTIVE);

    if (error || !members) {
      return [];
    }

    return members.map((m) => m.id);
  }
}
