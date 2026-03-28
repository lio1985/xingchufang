import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { PermissionService } from '../permission/permission.service';
import { UserRole, UserStatus, PermissionAction, PermissionResource } from '../permission/permission.constants';

/**
 * 团队创建DTO
 */
export interface CreateTeamDto {
  name: string;
  description?: string;
  leaderId: string;
}

/**
 * 团队更新DTO
 */
export interface UpdateTeamDto {
  name?: string;
  description?: string;
  leaderId?: string;
}

/**
 * 团队服务
 * 处理团队创建、成员管理、权限检查等
 */
@Injectable()
export class TeamService {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * 创建团队
   */
  async createTeam(userId: string, dto: CreateTeamDto) {
    // 检查权限
    await this.permissionService.requirePermission(
      userId,
      PermissionResource.TEAM,
      PermissionAction.MANAGE_TEAM,
    );

    const supabase = getSupabaseClient();

    // 检查队长是否存在且为员工
    const { data: leader, error: leaderError } = await supabase
      .from('users')
      .select('id, role, status, team_id')
      .eq('id', dto.leaderId)
      .single();

    if (leaderError || !leader) {
      throw new BadRequestException('指定的队长用户不存在');
    }

    if (leader.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('指定的队长用户未激活');
    }

    if (leader.team_id) {
      throw new BadRequestException('该用户已在其他团队中');
    }

    // 创建团队
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: dto.name,
        description: dto.description,
        leader_id: dto.leaderId,
      })
      .select()
      .single();

    if (teamError) {
      throw new BadRequestException('创建团队失败: ' + teamError.message);
    }

    // 更新队长的团队信息和角色
    await supabase
      .from('users')
      .update({
        team_id: team.id,
        is_team_leader: true,
        role: UserRole.TEAM_LEADER,
      })
      .eq('id', dto.leaderId);

    return team;
  }

  /**
   * 更新团队信息
   */
  async updateTeam(userId: string, teamId: string, dto: UpdateTeamDto) {
    const supabase = getSupabaseClient();

    // 检查权限
    const isAdmin = await this.permissionService.isAdmin(userId);
    const isTeamLeader = await this.isTeamLeaderOfTeam(userId, teamId);

    if (!isAdmin && !isTeamLeader) {
      throw new ForbiddenException('无权修改此团队信息');
    }

    // 如果要更换队长
    if (dto.leaderId) {
      await this.transferLeadership(userId, teamId, dto.leaderId);
      delete dto.leaderId; // 不在 update 中处理
    }

    const { data: team, error } = await supabase
      .from('teams')
      .update(dto)
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException('更新团队失败: ' + error.message);
    }

    return team;
  }

  /**
   * 转移队长权限
   */
  async transferLeadership(
    currentUserId: string,
    teamId: string,
    newLeaderId: string,
  ) {
    const supabase = getSupabaseClient();

    // 检查权限：管理员或当前队长可以转移
    const isAdmin = await this.permissionService.isAdmin(currentUserId);
    const isCurrentLeader = await this.isTeamLeaderOfTeam(currentUserId, teamId);

    if (!isAdmin && !isCurrentLeader) {
      throw new ForbiddenException('无权转移队长权限');
    }

    // 获取团队信息
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, leader_id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      throw new BadRequestException('团队不存在');
    }

    // 检查新队长是否在团队中
    const { data: newLeader, error: newLeaderError } = await supabase
      .from('users')
      .select('id, team_id, status')
      .eq('id', newLeaderId)
      .single();

    if (newLeaderError || !newLeader) {
      throw new BadRequestException('新队长用户不存在');
    }

    if (newLeader.team_id !== teamId) {
      throw new BadRequestException('新队长必须在该团队中');
    }

    // 更新旧队长
    await supabase
      .from('users')
      .update({
        is_team_leader: false,
        role: UserRole.EMPLOYEE,
      })
      .eq('id', team.leader_id);

    // 更新新队长
    await supabase
      .from('users')
      .update({
        is_team_leader: true,
        role: UserRole.TEAM_LEADER,
      })
      .eq('id', newLeaderId);

    // 更新团队的 leader_id
    await supabase
      .from('teams')
      .update({ leader_id: newLeaderId })
      .eq('id', teamId);

    return { success: true };
  }

  /**
   * 添加成员到团队
   * 权限：管理员或队长可以操作
   */
  async addMember(userId: string, teamId: string, memberId: string) {
    const supabase = getSupabaseClient();

    // 检查权限：管理员或队长
    const isAdmin = await this.permissionService.isAdmin(userId);
    const isTeamLeader = await this.isTeamLeaderOfTeam(userId, teamId);

    if (!isAdmin && !isTeamLeader) {
      throw new ForbiddenException('无权添加团队成员');
    }

    // 检查成员是否存在且不在其他团队
    const { data: member, error: memberError } = await supabase
      .from('users')
      .select('id, team_id, status, nickname, avatar_url')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      throw new BadRequestException('用户不存在');
    }

    if (member.team_id) {
      throw new BadRequestException('该用户已在其他团队中');
    }

    // 添加成员
    const { error: updateError } = await supabase
      .from('users')
      .update({ team_id: teamId })
      .eq('id', memberId);

    if (updateError) {
      throw new BadRequestException('添加成员失败: ' + updateError.message);
    }

    return { 
      success: true, 
      member: {
        id: member.id,
        nickname: member.nickname,
        avatarUrl: member.avatar_url,
      }
    };
  }

  /**
   * 从团队移除成员
   */
  async removeMember(userId: string, teamId: string, memberId: string) {
    const supabase = getSupabaseClient();

    // 检查权限
    const isAdmin = await this.permissionService.isAdmin(userId);
    const isTeamLeader = await this.isTeamLeaderOfTeam(userId, teamId);

    if (!isAdmin && !isTeamLeader) {
      throw new ForbiddenException('无权移除团队成员');
    }

    // 不能移除队长
    const { data: team } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    if (team?.leader_id === memberId) {
      throw new BadRequestException('不能移除队长，请先转移队长权限');
    }

    // 移除成员
    const { error } = await supabase
      .from('users')
      .update({
        team_id: null,
        is_team_leader: false,
        role: UserRole.EMPLOYEE,
      })
      .eq('id', memberId)
      .eq('team_id', teamId);

    if (error) {
      throw new BadRequestException('移除成员失败: ' + error.message);
    }

    return { success: true };
  }

  /**
   * 获取团队详情
   */
  async getTeam(teamId: string) {
    const supabase = getSupabaseClient();

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(id, nickname, avatar_url),
        members:users(id, nickname, avatar_url, role, status)
      `)
      .eq('id', teamId)
      .single();

    if (error) {
      throw new BadRequestException('团队不存在');
    }

    return team;
  }

  /**
   * 获取所有团队列表
   */
  async getAllTeams() {
    const supabase = getSupabaseClient();

    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        leader:users!teams_leader_id_fkey(id, nickname, avatar_url),
        members:users(id, nickname, avatar_url)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException('获取团队列表失败');
    }

    return teams;
  }

  /**
   * 检查用户是否是指定团队的队长
   */
  async isTeamLeaderOfTeam(userId: string, teamId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { data: team } = await supabase
      .from('teams')
      .select('leader_id')
      .eq('id', teamId)
      .single();

    return team?.leader_id === userId;
  }

  /**
   * 获取用户的团队
   */
  async getUserTeam(userId: string) {
    const supabase = getSupabaseClient();

    const { data: user } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', userId)
      .single();

    if (!user?.team_id) {
      return null;
    }

    return this.getTeam(user.team_id);
  }

  /**
   * 获取用户所在团队的成员列表
   */
  async getTeamMembers(userId: string) {
    const supabase = getSupabaseClient();

    // 获取用户的团队ID
    const { data: user } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', userId)
      .single();

    if (!user?.team_id) {
      return [];
    }

    // 获取团队成员
    const { data: members, error } = await supabase
      .from('users')
      .select('id, nickname, avatar_url, role, status, is_team_leader, created_at')
      .eq('team_id', user.team_id)
      .eq('status', 'active')
      .order('is_team_leader', { ascending: false });

    if (error) {
      return [];
    }

    return (members || []).map(m => ({
      id: m.id,
      user_id: m.id,
      role: m.is_team_leader ? 'leader' : 'member',
      joined_at: m.created_at,
      user: {
        id: m.id,
        nickname: m.nickname,
        avatarUrl: m.avatar_url,
      },
    }));
  }

  /**
   * 获取团队统计数据
   */
  async getTeamStatistics(userId: string) {
    const supabase = getSupabaseClient();

    // 获取用户的团队
    const team = await this.getUserTeam(userId);
    if (!team) {
      return null;
    }

    // 获取团队成员
    const members = await this.getTeamMembers(userId);
    const memberIds = members.map(m => m.user_id);

    // 获取客户统计
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .in('owner_id', memberIds);

    // 获取回收门店数
    const { count: totalRecycleStores } = await supabase
      .from('recycle_stores')
      .select('*', { count: 'exact', head: true })
      .in('owner_id', memberIds);

    // 获取成交总额（从回收订单）
    const { data: recycleOrders } = await supabase
      .from('recycle_orders')
      .select('deal_value')
      .in('owner_id', memberIds)
      .eq('status', 'completed');

    const totalDealValue = (recycleOrders || []).reduce((sum, order) => sum + (order.deal_value || 0), 0);

    // 成员业绩排行
    const memberRanking = await Promise.all(
      members.map(async (member) => {
        // 获取该成员的客户数
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', member.user_id);

        // 获取该成员的成交额
        const { data: memberOrders } = await supabase
          .from('recycle_orders')
          .select('deal_value')
          .eq('owner_id', member.user_id)
          .eq('status', 'completed');

        const recycleDealValue = (memberOrders || []).reduce((sum, order) => sum + (order.deal_value || 0), 0);

        return {
          userId: member.user_id,
          name: member.user?.nickname || '未知',
          role: member.role,
          customerCount: customerCount || 0,
          recycleDealValue,
          contributionRate: totalDealValue > 0 ? Math.round((recycleDealValue / totalDealValue) * 100) : 0,
        };
      })
    );

    // 按成交额排序
    memberRanking.sort((a, b) => b.recycleDealValue - a.recycleDealValue);

    return {
      teamId: team.id,
      teamName: team.name,
      memberCount: members.length,
      totalCustomers: totalCustomers || 0,
      activeCustomers: totalCustomers || 0,
      totalRecycleStores: totalRecycleStores || 0,
      totalDealValue,
      memberRanking,
    };
  }

  /**
   * 获取可添加到团队的用户列表
   * 返回未加入任何团队的激活用户
   */
  async getAvailableUsers(userId: string, search?: string): Promise<any[]> {
    const supabase = getSupabaseClient();

    // 获取用户所在团队，验证是否有权限
    const { data: user } = await supabase
      .from('users')
      .select('team_id, is_team_leader, role')
      .eq('id', userId)
      .single();

    if (!user?.team_id) {
      throw new ForbiddenException('您不在任何团队中');
    }

    // 检查是否是队长或管理员
    const isAdmin = await this.permissionService.isAdmin(userId);
    const isTeamLeader = user.is_team_leader;

    if (!isAdmin && !isTeamLeader) {
      throw new ForbiddenException('无权添加团队成员');
    }

    // 查询未加入团队的用户
    let query = supabase
      .from('users')
      .select('id, nickname, avatar_url, phone, status')
      .is('team_id', null)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    // 搜索条件
    if (search) {
      query = query.or(`nickname.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      throw new BadRequestException('获取用户列表失败');
    }

    return (users || []).map(u => ({
      id: u.id,
      nickname: u.nickname,
      avatarUrl: u.avatar_url,
      phone: u.phone ? `${u.phone.slice(0, 3)}****${u.phone.slice(-4)}` : null,
    }));
  }
}
