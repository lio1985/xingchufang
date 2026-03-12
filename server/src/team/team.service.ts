import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseService } from '../database/database.service';
import {
  CreateTeamDto,
  UpdateTeamDto,
  AddTeamMemberDto,
  UpdateTeamMemberRoleDto,
  TeamQueryDto,
  TeamStatisticsQueryDto
} from './team.dto';

export interface Team {
  id: string;
  name: string;
  leaderId?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  user?: {
    id: string;
    nickname: string;
    avatarUrl?: string;
    profile?: {
      realName?: string;
      phone?: string;
    };
  };
}

export interface TeamStatistics {
  teamId: string;
  teamName: string;
  memberCount: number;
  totalCustomers: number;
  activeCustomers: number;
  totalRecycleStores: number;
  totalDealValue: number;
  memberRanking: {
    userId: string;
    name: string;
    role: string;
    customerCount: number;
    recycleDealValue: number;
    contributionRate: number;
  }[];
}

@Injectable()
export class TeamService {
  private supabase: SupabaseClient;

  constructor(private readonly databaseService: DatabaseService) {
    this.supabase = this.databaseService.getClient();
  }

  // ========== 团队CRUD ==========

  async getTeams(query: TeamQueryDto) {
    const { keyword, isActive, page = 1, pageSize = 20 } = query;

    let dbQuery = this.supabase
      .from('teams')
      .select('*', { count: 'exact' })
      .eq('is_active', true)  // 默认只返回启用的团队
      .order('created_at', { ascending: false });

    if (isActive !== undefined) {
      // 如果明确指定了 isActive，覆盖默认条件
      dbQuery = dbQuery.eq('is_active', isActive);
    }

    if (keyword) {
      dbQuery = dbQuery.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dbQuery = dbQuery.range(from, to);

    const { data: teams, error, count } = await dbQuery;

    if (error) {
      console.error('[TeamService] Get teams error:', error);
      throw new Error(`获取团队列表失败: ${error.message}`);
    }

    // 获取每个团队的成员数量
    const teamIds = (teams || []).map(t => t.id);
    let memberCounts: Record<string, number> = {};
    
    if (teamIds.length > 0) {
      const { data: membersData, error: membersError } = await this.supabase
        .from('team_members')
        .select('team_id')
        .in('team_id', teamIds);
      
      if (!membersError && membersData) {
        memberCounts = membersData.reduce((acc, m) => {
          acc[m.team_id] = (acc[m.team_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // 获取负责人信息
    const leaderIds = (teams || []).map(t => t.leader_id).filter(Boolean);
    let leaders: Record<string, any> = {};
    
    if (leaderIds.length > 0) {
      const { data: leadersData, error: leadersError } = await this.supabase
        .from('users')
        .select('id, nickname, avatarUrl')
        .in('id', leaderIds);
      
      if (!leadersError && leadersData) {
        leaders = leadersData.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // 组装数据
    const data = (teams || []).map(team => ({
      ...team,
      member_count: memberCounts[team.id] || 0,
      leader: leaders[team.leader_id] || null
    }));

    return {
      data,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  async getTeamDetail(id: string) {
    // 获取团队基本信息
    const { data: team, error } = await this.supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !team) {
      throw new NotFoundException('团队不存在');
    }

    // 获取负责人信息
    let leader: any = null;
    if (team.leader_id) {
      const { data: leaderData } = await this.supabase
        .from('users')
        .select('id, nickname, avatarUrl')
        .eq('id', team.leader_id)
        .single();
      leader = leaderData;
    }

    // 获取团队成员
    const { data: members, error: membersError } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('team_id', id);

    let membersWithUser: any[] = [];
    if (!membersError && members && members.length > 0) {
      const userIds = members.map(m => m.user_id);
      const { data: users } = await this.supabase
        .from('users')
        .select('id, nickname, avatarUrl')
        .in('id', userIds);
      
      const userMap = (users || []).reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {} as Record<string, any>);

      membersWithUser = members.map(m => ({
        ...m,
        user: userMap[m.user_id] || null
      }));
    }

    return {
      ...team,
      leader,
      members: membersWithUser
    };
  }

  async createTeam(dto: CreateTeamDto, createdBy: string) {
    const { data: team, error } = await this.supabase
      .from('teams')
      .insert({
        name: dto.name,
        description: dto.description,
        leader_id: dto.leaderId
      })
      .select()
      .single();

    if (error) {
      console.error('[TeamService] Create team error:', error);
      throw new Error(`创建团队失败: ${error.message}`);
    }

    // 如果有负责人，自动添加为团队成员
    if (dto.leaderId) {
      await this.supabase.from('team_members').insert({
        team_id: team.id,
        user_id: dto.leaderId,
        role: 'leader'
      });

      // 更新用户档案的团队ID
      await this.supabase
        .from('user_profiles')
        .update({ team_id: team.id })
        .eq('user_id', dto.leaderId);
    }

    return team;
  }

  async updateTeam(id: string, dto: UpdateTeamDto) {
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.leaderId !== undefined) updateData.leader_id = dto.leaderId;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const { data: team, error } = await this.supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[TeamService] Update team error:', error);
      throw new Error(`更新团队失败: ${error.message}`);
    }

    // 如果更换了负责人，更新团队成员角色
    if (dto.leaderId) {
      // 将新负责人设为 leader
      await this.supabase
        .from('team_members')
        .upsert({
          team_id: id,
          user_id: dto.leaderId,
          role: 'leader'
        }, { onConflict: 'team_id,user_id' });

      // 更新用户档案的团队ID
      await this.supabase
        .from('user_profiles')
        .update({ team_id: id })
        .eq('user_id', dto.leaderId);
    }

    return team;
  }

  async deleteTeam(id: string) {
    // 软删除
    const { error } = await this.supabase
      .from('teams')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('[TeamService] Delete team error:', error);
      throw new Error(`删除团队失败: ${error.message}`);
    }

    return { success: true };
  }

  // ========== 团队成员管理 ==========

  async getTeamMembers(teamId: string) {
    // 获取团队成员
    const { data: members, error } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('[TeamService] Get team members error:', error);
      throw new Error(`获取团队成员失败: ${error.message}`);
    }

    // 获取用户信息
    if (members && members.length > 0) {
      const userIds = members.map(m => m.user_id);
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id, nickname, avatarUrl')
        .in('id', userIds);
      
      if (!usersError && users) {
        const userMap = users.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {} as Record<string, any>);

        return members.map(m => ({
          ...m,
          user: userMap[m.user_id] || null
        }));
      }
    }

    return members || [];
  }

  async addTeamMember(teamId: string, dto: AddTeamMemberDto) {
    let userId: string;
    
    // 如果传入的是6位数ID，先通过employee_id查找用户
    if (dto.userId && /^\d{6}$/.test(dto.userId)) {
      const { data: user, error: findError } = await this.supabase
        .from('users')
        .select('id')
        .eq('employee_id', dto.userId)
        .single();
      
      if (findError || !user) {
        throw new Error('未找到该员工ID对应的用户');
      }
      userId = user.id;
    } else if (dto.userId && dto.userId.trim() !== '') {
      // 否则直接使用传入的userId（必须是有效的UUID）
      userId = dto.userId;
    } else {
      throw new Error('用户ID不能为空');
    }

    // 检查用户是否已在团队中
    const { data: existing } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new Error('该用户已是团队成员');
    }

    const { data: member, error } = await this.supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: dto.role || 'member'
      })
      .select()
      .single();

    if (error) {
      console.error('[TeamService] Add team member error:', error);
      throw new Error(`添加团队成员失败: ${error.message}`);
    }

    // 更新用户档案的团队ID
    await this.supabase
      .from('user_profiles')
      .update({ team_id: teamId })
      .eq('user_id', userId);

    return member;
  }

  async updateTeamMemberRole(teamId: string, userId: string, dto: UpdateTeamMemberRoleDto) {
    const { data: member, error } = await this.supabase
      .from('team_members')
      .update({ role: dto.role })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[TeamService] Update team member role error:', error);
      throw new Error(`更新成员角色失败: ${error.message}`);
    }

    // 如果设为 leader，更新团队的 leader_id
    if (dto.role === 'leader') {
      await this.supabase
        .from('teams')
        .update({ leader_id: userId })
        .eq('id', teamId);
    }

    return member;
  }

  async removeTeamMember(teamId: string, userId: string) {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('[TeamService] Remove team member error:', error);
      throw new Error(`移除团队成员失败: ${error.message}`);
    }

    // 清除用户档案的团队ID
    await this.supabase
      .from('user_profiles')
      .update({ team_id: null })
      .eq('user_id', userId);

    return { success: true };
  }

  // ========== 团队统计 ==========

  async getTeamStatistics(teamId: string, query: TeamStatisticsQueryDto) {
    const { startDate, endDate } = query;

    // 获取团队信息
    const { data: team } = await this.supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 获取团队成员
    const { data: members } = await this.supabase
      .from('team_members')
      .select(`
        *,
        user:users(id, nickname, avatarUrl)
      `)
      .eq('team_id', teamId);

    const memberIds = members?.map(m => m.user_id) || [];

    // 统计客户数据
    let customerQuery = this.supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .in('user_id', memberIds)
      .eq('is_deleted', false);

    if (startDate) {
      customerQuery = customerQuery.gte('created_at', startDate);
    }
    if (endDate) {
      customerQuery = customerQuery.lte('created_at', endDate);
    }

    const { count: totalCustomers, data: customers } = await customerQuery;

    // 统计回收门店数据
    let recycleQuery = this.supabase
      .from('recycle_stores')
      .select('*')
      .in('user_id', memberIds)
      .eq('is_deleted', false);

    if (startDate) {
      recycleQuery = recycleQuery.gte('created_at', startDate);
    }
    if (endDate) {
      recycleQuery = recycleQuery.lte('created_at', endDate);
    }

    const { data: recycleStores } = await recycleQuery;

    // 计算成员贡献
    const memberRanking = await Promise.all(
      (members || []).map(async (member) => {
        const userCustomers = customers?.filter(c => c.user_id === member.user_id) || [];
        const userRecycles = recycleStores?.filter(r => r.user_id === member.user_id) || [];
        const dealValue = userRecycles
          .filter(r => ['deal', 'completed'].includes(r.recycle_status))
          .reduce((sum, r) => sum + (r.estimated_value || 0), 0);

        return {
          userId: member.user_id,
          name: member.user?.nickname || '未知',
          role: member.role,
          customerCount: userCustomers.length,
          recycleDealValue: dealValue,
          contributionRate: 0 // 稍后计算
        };
      })
    );

    // 计算贡献率
    const totalDealValue = memberRanking.reduce((sum, m) => sum + m.recycleDealValue, 0);
    memberRanking.forEach(m => {
      m.contributionRate = totalDealValue > 0 ? m.recycleDealValue / totalDealValue : 0;
    });

    // 按成交额排序
    memberRanking.sort((a, b) => b.recycleDealValue - a.recycleDealValue);

    const activeCustomers = customers?.filter(c => c.status === 'active').length || 0;
    const totalDealValue2 = recycleStores
      ?.filter(r => ['deal', 'completed'].includes(r.recycle_status))
      .reduce((sum, r) => sum + (r.estimated_value || 0), 0) || 0;

    return {
      teamId: team.id,
      teamName: team.name,
      memberCount: members?.length || 0,
      totalCustomers: totalCustomers || 0,
      activeCustomers,
      totalRecycleStores: recycleStores?.length || 0,
      totalDealValue: totalDealValue2,
      memberRanking
    };
  }

  // ========== 用户团队相关 ==========

  async getUserTeam(userId: string) {
    const { data: member } = await this.supabase
      .from('team_members')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('user_id', userId)
      .single();

    return member?.team || null;
  }

  async getUserTeamMembers(userId: string) {
    // 获取用户所属团队
    const { data: userTeam, error: userTeamError } = await this.supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .maybeSingle(); // 使用 maybeSingle 而不是 single，避免找不到记录时抛出错误

    if (userTeamError) {
      console.error('[TeamService] Get user team error:', userTeamError);
      return [];
    }

    if (!userTeam) {
      return [];
    }

    // 获取团队所有成员
    const { data: members, error } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('team_id', userTeam.team_id);

    if (error || !members || members.length === 0) {
      return [];
    }

    // 获取用户信息
    const userIds = members.map(m => m.user_id);
    const { data: users, error: usersError } = await this.supabase
      .from('users')
      .select('id, nickname, avatarUrl')
      .in('id', userIds);

    if (!usersError && users) {
      const userMap = users.reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {} as Record<string, any>);

      return members.map(m => ({
        ...m,
        user: userMap[m.user_id] || null
      }));
    }

    return members;
  }

  async getUserTeamStatistics(userId: string, query: TeamStatisticsQueryDto) {
    // 获取用户所属团队
    const { data: userTeam, error: userTeamError } = await this.supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (userTeamError || !userTeam) {
      // 用户不在任何团队中，返回个人统计
      return {
        teamId: null,
        teamName: '个人',
        memberCount: 1,
        totalCustomers: 0,
        activeCustomers: 0,
        totalRecycleStores: 0,
        totalDealValue: 0,
        memberRanking: []
      };
    }

    // 调用现有的 getTeamStatistics 方法
    return this.getTeamStatistics(userTeam.team_id, query);
  }

  // ========== 数据访问权限检查 ==========

  async getTeamMemberIds(userId: string): Promise<string[]> {
    const { data: userTeam } = await this.supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .single();

    if (!userTeam) {
      return [userId]; // 没有团队，只能看自己
    }

    const { data: members } = await this.supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', userTeam.team_id);

    return members?.map(m => m.user_id) || [userId];
  }

  async checkSameTeam(userId1: string, userId2: string): Promise<boolean> {
    const { data: team1 } = await this.supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId1)
      .single();

    const { data: team2 } = await this.supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId2)
      .single();

    return team1?.team_id === team2?.team_id && team1?.team_id !== undefined;
  }

  // ========== 审计日志 ==========

  async logDataAccess(
    userId: string,
    targetUserId: string,
    targetType: string,
    targetId: string,
    accessType: string = 'view',
    ipAddress?: string,
    userAgent?: string
  ) {
    const { error } = await this.supabase
      .from('data_access_logs')
      .insert({
        user_id: userId,
        target_user_id: targetUserId,
        target_type: targetType,
        target_id: targetId,
        access_type: accessType,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) {
      console.error('[TeamService] Log data access error:', error);
    }
  }
}
