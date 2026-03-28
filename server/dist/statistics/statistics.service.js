"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
let StatisticsService = class StatisticsService {
    constructor() {
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async getUserStatistics(userId, date) {
        const { data, error } = await this.client
            .from('user_statistics')
            .select('*')
            .eq('userId', userId)
            .eq('statDate', date)
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return this.createInitialStatistics(userId, date);
            }
            console.error('获取用户统计失败:', error);
            throw new Error('获取用户统计失败');
        }
        return data;
    }
    async getUserStatisticsList(userId, options = {}) {
        const { startDate, endDate, limit = 30 } = options;
        let query = this.client
            .from('user_statistics')
            .select('*')
            .eq('userId', userId)
            .order('statDate', { ascending: false })
            .limit(limit);
        if (startDate) {
            query = query.gte('statDate', startDate);
        }
        if (endDate) {
            query = query.lte('statDate', endDate);
        }
        const { data, error } = await query;
        if (error) {
            console.error('获取用户统计列表失败:', error);
            throw new Error('获取用户统计列表失败');
        }
        return data || [];
    }
    async getUserDashboardStats(userId, period = 'week') {
        const today = new Date();
        const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
        const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { data: statsList } = await this.client
            .from('user_statistics')
            .select('*')
            .eq('userId', userId)
            .gte('statDate', startDate)
            .order('statDate', { ascending: true });
        const { count: customerCount } = await this.client
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', userId);
        const { data: recycleOrders } = await this.client
            .from('recycle_orders')
            .select('deal_value')
            .eq('owner_id', userId)
            .eq('status', 'completed')
            .gte('created_at', startDate);
        const totalDealValue = recycleOrders?.reduce((sum, order) => sum + (order.deal_value || 0), 0) || 0;
        const { count: contentCount } = await this.client
            .from('quick_notes')
            .select('*', { count: 'exact', head: true })
            .eq('userId', userId);
        return {
            customerCount: customerCount || 0,
            totalDealValue,
            contentCount: contentCount || 0,
            dialogCount: statsList?.reduce((sum, stat) => sum + stat.dialogCount, 0) || 0,
            messageCount: statsList?.reduce((sum, stat) => sum + stat.messageCount, 0) || 0,
            lexiconCount: statsList?.reduce((sum, stat) => sum + stat.lexiconCount, 0) || 0,
            uploadFileCount: statsList?.reduce((sum, stat) => sum + stat.uploadFileCount, 0) || 0,
            trends: statsList?.map(stat => ({
                date: stat.statDate,
                dialogCount: stat.dialogCount,
                messageCount: stat.messageCount,
            })) || [],
        };
    }
    async getTeamDashboardStats(userId, period = 'week') {
        const today = new Date();
        const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
        const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { data: teamMember } = await this.client
            .from('team_members')
            .select('teamId, role')
            .eq('userId', userId)
            .single();
        if (!teamMember) {
            return null;
        }
        const { data: members } = await this.client
            .from('team_members')
            .select('userId')
            .eq('teamId', teamMember.teamId);
        const memberIds = members?.map(m => m.userId) || [];
        const { data: teamStats } = await this.client
            .from('user_statistics')
            .select('*')
            .in('userId', memberIds)
            .gte('statDate', startDate);
        const { count: teamCustomerCount } = await this.client
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .in('owner_id', memberIds);
        const { data: teamRecycleOrders } = await this.client
            .from('recycle_orders')
            .select('deal_value, owner_id')
            .in('owner_id', memberIds)
            .eq('status', 'completed')
            .gte('created_at', startDate);
        const teamTotalDealValue = teamRecycleOrders?.reduce((sum, order) => sum + (order.deal_value || 0), 0) || 0;
        const { count: teamContentCount } = await this.client
            .from('quick_notes')
            .select('*', { count: 'exact', head: true })
            .in('userId', memberIds);
        const memberStats = memberIds.map(memberId => {
            const memberData = teamStats?.filter(stat => stat.userId === memberId) || [];
            const memberDealValue = teamRecycleOrders?.filter(order => order.owner_id === memberId)
                .reduce((sum, order) => sum + (order.deal_value || 0), 0) || 0;
            return {
                userId: memberId,
                dialogCount: memberData.reduce((sum, stat) => sum + stat.dialogCount, 0),
                messageCount: memberData.reduce((sum, stat) => sum + stat.messageCount, 0),
                dealValue: memberDealValue,
            };
        });
        return {
            teamId: teamMember.teamId,
            memberCount: memberIds.length,
            customerCount: teamCustomerCount || 0,
            totalDealValue: teamTotalDealValue,
            contentCount: teamContentCount || 0,
            dialogCount: teamStats?.reduce((sum, stat) => sum + stat.dialogCount, 0) || 0,
            messageCount: teamStats?.reduce((sum, stat) => sum + stat.messageCount, 0) || 0,
            memberStats,
        };
    }
    async getGlobalTrends(period = 'week') {
        const today = new Date();
        const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
        const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { data: statsList } = await this.client
            .from('user_statistics')
            .select('*')
            .gte('statDate', startDate)
            .order('statDate', { ascending: true });
        const dateMap = new Map();
        for (const stat of statsList || []) {
            if (!dateMap.has(stat.statDate)) {
                dateMap.set(stat.statDate, {
                    date: stat.statDate,
                    dialogCount: 0,
                    messageCount: 0,
                    uploadFileCount: 0,
                    activeUsers: new Set(),
                });
            }
            const dayData = dateMap.get(stat.statDate);
            dayData.dialogCount += stat.dialogCount;
            dayData.messageCount += stat.messageCount;
            dayData.uploadFileCount += stat.uploadFileCount;
            dayData.activeUsers.add(stat.userId);
        }
        return Array.from(dateMap.values()).map(d => ({
            date: d.date,
            dialogCount: d.dialogCount,
            messageCount: d.messageCount,
            uploadFileCount: d.uploadFileCount,
            activeUsers: d.activeUsers.size,
        }));
    }
    async getGlobalStatistics() {
        const today = new Date().toISOString().split('T')[0];
        const { data: usersData } = await this.client
            .from('users')
            .select('id, status')
            .eq('status', 'active');
        const { count: totalUsers } = await this.client
            .from('users')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'deleted');
        const activeUsers = usersData?.length || 0;
        const { count: totalDialogs } = await this.client
            .from('ai_conversations')
            .select('*', { count: 'exact', head: true });
        const { count: totalMessages } = await this.client
            .from('ai_messages')
            .select('*', { count: 'exact', head: true });
        const { count: totalLexicons } = await this.client
            .from('lexicons')
            .select('*', { count: 'exact', head: true });
        const { count: totalViralReplicas } = await this.client
            .from('viral_favorites')
            .select('*', { count: 'exact', head: true });
        const { count: totalScheduledTasks } = await this.client
            .from('scheduled_tasks')
            .select('*', { count: 'exact', head: true });
        const { count: totalWorkPlans } = await this.client
            .from('work_plans')
            .select('*', { count: 'exact', head: true });
        const { count: totalWorkPlanTasks } = await this.client
            .from('work_plan_tasks')
            .select('*', { count: 'exact', head: true });
        const { data: filesData } = await this.client
            .from('multimedia_resources')
            .select('fileSize');
        const totalUploadFiles = filesData?.length || 0;
        const totalUploadFileSize = filesData?.reduce((sum, file) => sum + (file.fileSize || 0), 0) || 0;
        const { data: todayStats } = await this.client
            .from('user_statistics')
            .select('*')
            .eq('statDate', today);
        const todayActiveUsers = todayStats?.filter((stat) => stat.dialogCount > 0).length || 0;
        const todayDialogs = todayStats?.reduce((sum, stat) => sum + stat.dialogCount, 0) || 0;
        const todayMessages = todayStats?.reduce((sum, stat) => sum + stat.messageCount, 0) || 0;
        const todayUploads = todayStats?.reduce((sum, stat) => sum + stat.uploadFileCount, 0) || 0;
        return {
            totalUsers: totalUsers || 0,
            activeUsers,
            totalDialogs: totalDialogs || 0,
            totalMessages: totalMessages || 0,
            totalLexicons: totalLexicons || 0,
            totalLexiconItems: totalLexicons || 0,
            totalHotWords: 0,
            totalViralReplicas: totalViralReplicas || 0,
            totalScheduledTasks: totalScheduledTasks || 0,
            totalWorkPlans: totalWorkPlans || 0,
            totalWorkPlanTasks: totalWorkPlanTasks || 0,
            totalUploadFiles,
            totalUploadFileSize,
            totalTokensUsed: 0,
            todayActiveUsers,
            todayDialogs,
            todayMessages,
            todayUploads,
        };
    }
    async getActiveUserRanking(limit = 10) {
        const { data: statisticsData } = await this.client
            .from('user_statistics')
            .select('userId, dialogCount, messageCount, lexiconCount, uploadFileCount')
            .gte('statDate', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('dialogCount', { ascending: false });
        if (!statisticsData || statisticsData.length === 0) {
            return [];
        }
        const userStatsMap = new Map();
        for (const stat of statisticsData) {
            if (!userStatsMap.has(stat.userId)) {
                userStatsMap.set(stat.userId, {
                    userId: stat.userId,
                    dialogCount: 0,
                    messageCount: 0,
                    lexiconCount: 0,
                    uploadFileCount: 0,
                });
            }
            const userStat = userStatsMap.get(stat.userId);
            userStat.dialogCount += stat.dialogCount;
            userStat.messageCount += stat.messageCount;
            userStat.lexiconCount += stat.lexiconCount;
            userStat.uploadFileCount += stat.uploadFileCount;
        }
        const userIds = Array.from(userStatsMap.keys()).slice(0, limit);
        const { data: usersData } = await this.client
            .from('users')
            .select('id, nickname, avatarUrl')
            .in('id', userIds);
        const { data: profilesData } = await this.client
            .from('user_profiles')
            .select('userId, department, position')
            .in('userId', userIds);
        const rankings = Array.from(userStatsMap.values())
            .sort((a, b) => b.dialogCount - a.dialogCount)
            .slice(0, limit)
            .map((stat, index) => {
            const user = usersData?.find((u) => u.id === stat.userId);
            const profile = profilesData?.find((p) => p.userId === stat.userId);
            return {
                userId: stat.userId,
                nickname: user?.nickname,
                avatarUrl: user?.avatarUrl,
                department: profile?.department,
                position: profile?.position,
                dialogCount: stat.dialogCount,
                messageCount: stat.messageCount,
                lexiconCount: stat.lexiconCount,
                uploadFileCount: stat.uploadFileCount,
                rank: index + 1,
            };
        });
        return rankings;
    }
    async updateUserStatistics(userId, updates) {
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await this.client
            .from('user_statistics')
            .select('*')
            .eq('userId', userId)
            .eq('statDate', today)
            .limit(1)
            .single();
        if (existing) {
            await this.client
                .from('user_statistics')
                .update({
                ...updates,
                updatedAt: new Date().toISOString(),
            })
                .eq('userId', userId)
                .eq('statDate', today);
        }
        else {
            await this.createInitialStatistics(userId, today);
        }
    }
    async createInitialStatistics(userId, date) {
        const { data, error } = await this.client
            .from('user_statistics')
            .insert({
            userId,
            statDate: date,
            dialogCount: 0,
            messageCount: 0,
            lexiconCount: 0,
            lexiconItemCount: 0,
            hotWordCount: 0,
            viralReplicaCount: 0,
            scheduledTaskCount: 0,
            workPlanCount: 0,
            workPlanTaskCount: 0,
            uploadFileCount: 0,
            uploadFileSize: BigInt(0),
            totalTokensUsed: BigInt(0),
        })
            .select()
            .single();
        if (error) {
            console.error('创建初始统计失败:', error);
            throw new Error('创建初始统计失败');
        }
        return data;
    }
    async incrementDialogCount(userId) {
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await this.client
            .from('user_statistics')
            .select('dialogCount')
            .eq('userId', userId)
            .eq('statDate', today)
            .limit(1)
            .single();
        if (existing) {
            await this.client
                .from('user_statistics')
                .update({
                dialogCount: existing.dialogCount + 1,
                updatedAt: new Date().toISOString(),
            })
                .eq('userId', userId)
                .eq('statDate', today);
        }
        else {
            await this.createInitialStatistics(userId, today);
        }
    }
    async incrementMessageCount(userId, count = 1) {
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await this.client
            .from('user_statistics')
            .select('messageCount')
            .eq('userId', userId)
            .eq('statDate', today)
            .limit(1)
            .single();
        if (existing) {
            await this.client
                .from('user_statistics')
                .update({
                messageCount: existing.messageCount + count,
                updatedAt: new Date().toISOString(),
            })
                .eq('userId', userId)
                .eq('statDate', today);
        }
        else {
            await this.createInitialStatistics(userId, today);
        }
    }
    async incrementUploadFileCount(userId, fileSize) {
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await this.client
            .from('user_statistics')
            .select('uploadFileCount, uploadFileSize')
            .eq('userId', userId)
            .eq('statDate', today)
            .limit(1)
            .single();
        if (existing) {
            await this.client
                .from('user_statistics')
                .update({
                uploadFileCount: existing.uploadFileCount + 1,
                uploadFileSize: existing.uploadFileSize + BigInt(fileSize),
                updatedAt: new Date().toISOString(),
            })
                .eq('userId', userId)
                .eq('statDate', today);
        }
        else {
            await this.createInitialStatistics(userId, today);
        }
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)()
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map