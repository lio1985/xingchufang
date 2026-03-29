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
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const permission_service_1 = require("../permission/permission.service");
const permission_constants_1 = require("../permission/permission.constants");
let TeamService = class TeamService {
    constructor(permissionService) {
        this.permissionService = permissionService;
    }
    async createTeam(userId, dto) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.TEAM, permission_constants_1.PermissionAction.MANAGE_TEAM);
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: leader, error: leaderError } = await supabase
            .from('users')
            .select('id, role, status, team_id')
            .eq('id', dto.leaderId)
            .single();
        if (leaderError || !leader) {
            throw new common_1.BadRequestException('指定的队长用户不存在');
        }
        if (leader.status !== permission_constants_1.UserStatus.ACTIVE) {
            throw new common_1.BadRequestException('指定的队长用户未激活');
        }
        if (leader.team_id) {
            throw new common_1.BadRequestException('该用户已在其他团队中');
        }
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
            throw new common_1.BadRequestException('创建团队失败: ' + teamError.message);
        }
        await supabase
            .from('users')
            .update({
            team_id: team.id,
            is_team_leader: true,
            role: permission_constants_1.UserRole.TEAM_LEADER,
        })
            .eq('id', dto.leaderId);
        return team;
    }
    async updateTeam(userId, teamId, dto) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const isAdmin = await this.permissionService.isAdmin(userId);
        const isTeamLeader = await this.isTeamLeaderOfTeam(userId, teamId);
        if (!isAdmin && !isTeamLeader) {
            throw new common_1.ForbiddenException('无权修改此团队信息');
        }
        if (dto.leaderId) {
            await this.transferLeadership(userId, teamId, dto.leaderId);
            delete dto.leaderId;
        }
        const { data: team, error } = await supabase
            .from('teams')
            .update(dto)
            .eq('id', teamId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('更新团队失败: ' + error.message);
        }
        return team;
    }
    async transferLeadership(currentUserId, teamId, newLeaderId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const isAdmin = await this.permissionService.isAdmin(currentUserId);
        const isCurrentLeader = await this.isTeamLeaderOfTeam(currentUserId, teamId);
        if (!isAdmin && !isCurrentLeader) {
            throw new common_1.ForbiddenException('无权转移队长权限');
        }
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, leader_id')
            .eq('id', teamId)
            .single();
        if (teamError || !team) {
            throw new common_1.BadRequestException('团队不存在');
        }
        const { data: newLeader, error: newLeaderError } = await supabase
            .from('users')
            .select('id, team_id, status')
            .eq('id', newLeaderId)
            .single();
        if (newLeaderError || !newLeader) {
            throw new common_1.BadRequestException('新队长用户不存在');
        }
        if (newLeader.team_id !== teamId) {
            throw new common_1.BadRequestException('新队长必须在该团队中');
        }
        await supabase
            .from('users')
            .update({
            is_team_leader: false,
            role: permission_constants_1.UserRole.EMPLOYEE,
        })
            .eq('id', team.leader_id);
        await supabase
            .from('users')
            .update({
            is_team_leader: true,
            role: permission_constants_1.UserRole.TEAM_LEADER,
        })
            .eq('id', newLeaderId);
        await supabase
            .from('teams')
            .update({ leader_id: newLeaderId })
            .eq('id', teamId);
        return { success: true };
    }
    async addMember(userId, teamId, memberId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const isAdmin = await this.permissionService.isAdmin(userId);
        const isTeamLeader = await this.isTeamLeaderOfTeam(userId, teamId);
        if (!isAdmin && !isTeamLeader) {
            throw new common_1.ForbiddenException('无权添加团队成员');
        }
        const { data: member, error: memberError } = await supabase
            .from('users')
            .select('id, team_id, status, nickname, avatar_url')
            .eq('id', memberId)
            .single();
        if (memberError || !member) {
            throw new common_1.BadRequestException('用户不存在');
        }
        if (member.team_id) {
            throw new common_1.BadRequestException('该用户已在其他团队中');
        }
        const { error: updateError } = await supabase
            .from('users')
            .update({ team_id: teamId })
            .eq('id', memberId);
        if (updateError) {
            throw new common_1.BadRequestException('添加成员失败: ' + updateError.message);
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
    async removeMember(userId, teamId, memberId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const isAdmin = await this.permissionService.isAdmin(userId);
        const isTeamLeader = await this.isTeamLeaderOfTeam(userId, teamId);
        if (!isAdmin && !isTeamLeader) {
            throw new common_1.ForbiddenException('无权移除团队成员');
        }
        const { data: team } = await supabase
            .from('teams')
            .select('leader_id')
            .eq('id', teamId)
            .single();
        if (team?.leader_id === memberId) {
            throw new common_1.BadRequestException('不能移除队长，请先转移队长权限');
        }
        const { error } = await supabase
            .from('users')
            .update({
            team_id: null,
            is_team_leader: false,
            role: permission_constants_1.UserRole.EMPLOYEE,
        })
            .eq('id', memberId)
            .eq('team_id', teamId);
        if (error) {
            throw new common_1.BadRequestException('移除成员失败: ' + error.message);
        }
        return { success: true };
    }
    async getTeam(teamId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
            throw new common_1.BadRequestException('团队不存在');
        }
        return team;
    }
    async getAllTeams() {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
            throw new common_1.BadRequestException('获取团队列表失败');
        }
        return teams;
    }
    async isTeamLeaderOfTeam(userId, teamId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: team } = await supabase
            .from('teams')
            .select('leader_id')
            .eq('id', teamId)
            .single();
        return team?.leader_id === userId;
    }
    async getUserTeam(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
    async getTeamMembers(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: user } = await supabase
            .from('users')
            .select('team_id')
            .eq('id', userId)
            .single();
        if (!user?.team_id) {
            return [];
        }
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
    async getTeamStatistics(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const team = await this.getUserTeam(userId);
        if (!team) {
            return null;
        }
        const members = await this.getTeamMembers(userId);
        const memberIds = members.map(m => m.user_id);
        const { count: totalCustomers } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .in('owner_id', memberIds);
        const { count: totalRecycleStores } = await supabase
            .from('recycle_stores')
            .select('*', { count: 'exact', head: true })
            .in('owner_id', memberIds);
        const { data: recycleOrders } = await supabase
            .from('recycle_orders')
            .select('deal_value')
            .in('owner_id', memberIds)
            .eq('status', 'completed');
        const totalDealValue = (recycleOrders || []).reduce((sum, order) => sum + (order.deal_value || 0), 0);
        const memberRanking = await Promise.all(members.map(async (member) => {
            const { count: customerCount } = await supabase
                .from('customers')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', member.user_id);
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
        }));
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
    async getAvailableUsers(userId, search) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: user } = await supabase
            .from('users')
            .select('team_id, is_team_leader, role')
            .eq('id', userId)
            .single();
        if (!user?.team_id) {
            throw new common_1.ForbiddenException('您不在任何团队中');
        }
        const isAdmin = await this.permissionService.isAdmin(userId);
        const isTeamLeader = user.is_team_leader;
        if (!isAdmin && !isTeamLeader) {
            throw new common_1.ForbiddenException('无权添加团队成员');
        }
        let query = supabase
            .from('users')
            .select('id, nickname, avatar_url, phone, status')
            .is('team_id', null)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(50);
        if (search) {
            query = query.or(`nickname.ilike.%${search}%,phone.ilike.%${search}%`);
        }
        const { data: users, error } = await query;
        if (error) {
            throw new common_1.BadRequestException('获取用户列表失败');
        }
        return (users || []).map(u => ({
            id: u.id,
            nickname: u.nickname,
            avatarUrl: u.avatar_url,
            phone: u.phone ? `${u.phone.slice(0, 3)}****${u.phone.slice(-4)}` : null,
        }));
    }
    async getTeamTasks(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const team = await this.getUserTeam(userId);
        if (!team) {
            return [];
        }
        const { data: tasks, error } = await supabase
            .from('team_tasks')
            .select(`
        *,
        assignees:team_task_assignees(
          user_id,
          users(id, nickname, avatar_url)
        )
      `)
            .eq('team_id', team.id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('获取团队任务失败:', error);
            return [];
        }
        return (tasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            due_date: task.due_date,
            created_at: task.created_at,
            assignees: (task.assignees || []).map((a) => ({
                id: a.user_id,
                nickname: a.users?.nickname,
                avatar_url: a.users?.avatar_url,
            })),
        }));
    }
    async createTeamTask(userId, body) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const team = await this.getUserTeam(userId);
        if (!team) {
            throw new common_1.BadRequestException('您不在任何团队中');
        }
        const isAdmin = await this.permissionService.isAdmin(userId);
        const isTeamLeader = await this.isTeamLeaderOfTeam(userId, team.id);
        if (!isAdmin && !isTeamLeader) {
            throw new common_1.ForbiddenException('无权创建团队任务');
        }
        const { data: task, error } = await supabase
            .from('team_tasks')
            .insert({
            team_id: team.id,
            title: body.title,
            description: body.description,
            status: body.status || 'pending',
            priority: body.priority || 'medium',
            due_date: body.due_date,
            created_by: userId,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('创建任务失败');
        }
        if (body.assignees && body.assignees.length > 0) {
            const assigneeRecords = body.assignees.map((assigneeId) => ({
                task_id: task.id,
                user_id: assigneeId,
            }));
            await supabase.from('team_task_assignees').insert(assigneeRecords);
        }
        return task;
    }
    async updateTeamTask(userId, taskId, body) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: task, error } = await supabase
            .from('team_tasks')
            .update(body)
            .eq('id', taskId)
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('更新任务失败');
        }
        return task;
    }
    async deleteTeamTask(userId, taskId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { error } = await supabase
            .from('team_tasks')
            .delete()
            .eq('id', taskId);
        if (error) {
            throw new common_1.BadRequestException('删除任务失败');
        }
        return { success: true };
    }
    async getTeamAnnouncements(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const team = await this.getUserTeam(userId);
        if (!team) {
            return [];
        }
        const { data: announcements, error } = await supabase
            .from('team_announcements')
            .select(`
        *,
        author:users(id, nickname, avatar_url)
      `)
            .eq('team_id', team.id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('获取团队公告失败:', error);
            return [];
        }
        const { data: readRecords } = await supabase
            .from('team_announcement_reads')
            .select('announcement_id')
            .eq('user_id', userId);
        const readIds = new Set((readRecords || []).map(r => r.announcement_id));
        return (announcements || []).map(ann => ({
            id: ann.id,
            title: ann.title,
            content: ann.content,
            priority: ann.priority || 'medium',
            created_at: ann.created_at,
            author: ann.author ? {
                nickname: ann.author.nickname,
                avatar_url: ann.author.avatar_url,
            } : null,
            is_read: readIds.has(ann.id),
        }));
    }
    async createTeamAnnouncement(userId, body) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const team = await this.getUserTeam(userId);
        if (!team) {
            throw new common_1.BadRequestException('您不在任何团队中');
        }
        const isAdmin = await this.permissionService.isAdmin(userId);
        const isTeamLeader = await this.isTeamLeaderOfTeam(userId, team.id);
        if (!isAdmin && !isTeamLeader) {
            throw new common_1.ForbiddenException('无权创建团队公告');
        }
        const { data: announcement, error } = await supabase
            .from('team_announcements')
            .insert({
            team_id: team.id,
            title: body.title,
            content: body.content,
            priority: body.priority || 'medium',
            author_id: userId,
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('创建公告失败');
        }
        return announcement;
    }
    async markAnnouncementRead(userId, announcementId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { error } = await supabase
            .from('team_announcement_reads')
            .upsert({
            announcement_id: announcementId,
            user_id: userId,
            read_at: new Date().toISOString(),
        });
        if (error) {
            console.error('标记已读失败:', error);
        }
        return { success: true };
    }
    async getTeamChatMessages(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const team = await this.getUserTeam(userId);
        if (!team) {
            return [];
        }
        const { data: messages, error } = await supabase
            .from('team_chat_messages')
            .select(`
        *,
        sender:users(id, nickname, avatar_url)
      `)
            .eq('team_id', team.id)
            .order('created_at', { ascending: true })
            .limit(100);
        if (error) {
            console.error('获取聊天消息失败:', error);
            return [];
        }
        return (messages || []).map(msg => ({
            id: msg.id,
            content: msg.content,
            type: msg.type || 'text',
            sender_id: msg.sender_id,
            sender_name: msg.sender?.nickname || '未知用户',
            sender_avatar: msg.sender?.avatar_url,
            created_at: msg.created_at,
        }));
    }
    async sendTeamChatMessage(userId, body) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const team = await this.getUserTeam(userId);
        if (!team) {
            throw new common_1.BadRequestException('您不在任何团队中');
        }
        const { data: message, error } = await supabase
            .from('team_chat_messages')
            .insert({
            team_id: team.id,
            sender_id: userId,
            content: body.content,
            type: body.type || 'text',
        })
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException('发送消息失败');
        }
        return message;
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], TeamService);
//# sourceMappingURL=team.service.js.map