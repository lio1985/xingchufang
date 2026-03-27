import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * 统一权限服务
 * 提供集中的权限检查和管理功能
 */
@Injectable()
export class PermissionService {
  constructor(private readonly userService: UserService) {}

  /**
   * 检查用户是否是管理员
   * @param userId 用户ID
   * @throws ForbiddenException 如果不是管理员
   */
  async requireAdmin(userId: string): Promise<void> {
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }
  }

  /**
   * 检查用户是否可以访问指定资源
   * 管理员可以访问所有资源，普通用户只能访问自己的资源
   * @param currentUserId 当前用户ID
   * @param resourceUserId 资源所属用户ID
   * @returns 是否有权限访问
   */
  async canAccessResource(
    currentUserId: string,
    resourceUserId: string,
  ): Promise<boolean> {
    const isAdmin = await this.userService.isAdmin(currentUserId);
    return isAdmin || currentUserId === resourceUserId;
  }

  /**
   * 检查用户是否可以访问指定资源，无权限时抛出异常
   * @param currentUserId 当前用户ID
   * @param resourceUserId 资源所属用户ID
   * @param resourceName 资源名称（用于错误消息）
   * @throws ForbiddenException 如果无权访问
   */
  async requireResourceAccess(
    currentUserId: string,
    resourceUserId: string,
    resourceName: string = '此资源',
  ): Promise<void> {
    const canAccess = await this.canAccessResource(currentUserId, resourceUserId);
    if (!canAccess) {
      throw new ForbiddenException(`无权访问${resourceName}`);
    }
  }

  /**
   * 检查用户是否可以修改指定资源
   * 管理员可以修改所有资源，普通用户只能修改自己的资源
   * @param currentUserId 当前用户ID
   * @param resourceUserId 资源所属用户ID
   * @returns 是否有权限修改
   */
  async canModifyResource(
    currentUserId: string,
    resourceUserId: string,
  ): Promise<boolean> {
    const isAdmin = await this.userService.isAdmin(currentUserId);
    return isAdmin || currentUserId === resourceUserId;
  }

  /**
   * 检查用户是否可以修改指定资源，无权限时抛出异常
   * @param currentUserId 当前用户ID
   * @param resourceUserId 资源所属用户ID
   * @param resourceName 资源名称（用于错误消息）
   * @throws ForbiddenException 如果无权修改
   */
  async requireModifyAccess(
    currentUserId: string,
    resourceUserId: string,
    resourceName: string = '此资源',
  ): Promise<void> {
    const canModify = await this.canModifyResource(currentUserId, resourceUserId);
    if (!canModify) {
      throw new ForbiddenException(`无权修改${resourceName}`);
    }
  }

  /**
   * 检查用户是否可以删除指定资源
   * 管理员可以删除所有资源，普通用户只能删除自己的资源
   * @param currentUserId 当前用户ID
   * @param resourceUserId 资源所属用户ID
   * @returns 是否有权限删除
   */
  async canDeleteResource(
    currentUserId: string,
    resourceUserId: string,
  ): Promise<boolean> {
    const isAdmin = await this.userService.isAdmin(currentUserId);
    return isAdmin || currentUserId === resourceUserId;
  }

  /**
   * 检查用户是否可以删除指定资源，无权限时抛出异常
   * @param currentUserId 当前用户ID
   * @param resourceUserId 资源所属用户ID
   * @param resourceName 资源名称（用于错误消息）
   * @throws ForbiddenException 如果无权删除
   */
  async requireDeleteAccess(
    currentUserId: string,
    resourceUserId: string,
    resourceName: string = '此资源',
  ): Promise<void> {
    const canDelete = await this.canDeleteResource(currentUserId, resourceUserId);
    if (!canDelete) {
      throw new ForbiddenException(`无权删除${resourceName}`);
    }
  }

  /**
   * 获取用户的数据查询范围
   * 管理员可以查看所有数据，普通用户只能查看自己的数据
   * @param userId 用户ID
   * @param targetUserId 目标用户ID（可选）
   * @returns 应该查询的用户ID，null 表示查询所有
   */
  async getDataQueryScope(
    userId: string,
    targetUserId?: string,
  ): Promise<string | null> {
    const isAdmin = await this.userService.isAdmin(userId);

    // 管理员且指定了目标用户，查询目标用户的数据
    if (isAdmin && targetUserId) {
      return targetUserId;
    }

    // 管理员未指定目标用户，查询所有数据
    if (isAdmin) {
      return null;
    }

    // 非管理员只能查询自己的数据
    // 如果指定了目标用户但不是自己，拒绝访问
    if (targetUserId && targetUserId !== userId) {
      throw new ForbiddenException('无权查看其他用户的数据');
    }

    return userId;
  }

  /**
   * 批量检查权限
   * @param checks 权限检查列表
   * @returns 所有检查是否都通过
   */
  async checkMultiplePermissions(
    checks: Array<() => Promise<void>>,
  ): Promise<PermissionCheckResult> {
    try {
      for (const check of checks) {
        await check();
      }
      return { allowed: true };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        return { allowed: false, reason: error.message };
      }
      return { allowed: false, reason: '权限检查失败' };
    }
  }
}
