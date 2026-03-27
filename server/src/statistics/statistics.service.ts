import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

export interface UserStatistics {
  id: string;
  userId: string;
  statDate: string;
  dialogCount: number;
  messageCount: number;
  lexiconCount: number;
  lexiconItemCount: number;
  hotWordCount: number;
  viralReplicaCount: number;
  scheduledTaskCount: number;
  workPlanCount: number;
  workPlanTaskCount: number;
  uploadFileCount: number;
  uploadFileSize: number;
  totalTokensUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalStatistics {
  totalUsers: number;
  activeUsers: number;
  totalDialogs: number;
  totalMessages: number;
  totalLexicons: number;
  totalLexiconItems: number;
  totalHotWords: number;
  totalViralReplicas: number;
  totalScheduledTasks: number;
  totalWorkPlans: number;
  totalWorkPlanTasks: number;
  totalUploadFiles: number;
  totalUploadFileSize: number;
  totalTokensUsed: number;
  todayActiveUsers: number;
  todayDialogs: number;
  todayMessages: number;
  todayUploads: number;
}

export interface UserRanking {
  userId: string;
  nickname?: string;
  avatarUrl?: string;
  department?: string;
  position?: string;
  dialogCount: number;
  messageCount: number;
  lexiconCount: number;
  uploadFileCount: number;
  rank: number;
}

@Injectable()
export class StatisticsService {
  private client = getSupabaseClient();

  /**
   * 获取用户统计数据（指定日期）
   */
  async getUserStatistics(userId: string, date: string): Promise<UserStatistics | null> {
    const { data, error } = await this.client
      .from('user_statistics')
      .select('*')
      .eq('userId', userId)
      .eq('statDate', date)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 统计数据不存在，创建初始统计
        return this.createInitialStatistics(userId, date);
      }
      console.error('获取用户统计失败:', error);
      throw new Error('获取用户统计失败');
    }

    return data;
  }

  /**
   * 获取用户统计列表（按日期范围）
   */
  async getUserStatisticsList(
    userId: string,
    options: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {},
  ): Promise<UserStatistics[]> {
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

  /**
   * 获取用户数据看板统计
   */
  async getUserDashboardStats(userId: string, period: string = 'week') {
    const today = new Date();
    const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 获取用户统计列表
    const { data: statsList } = await this.client
      .from('user_statistics')
      .select('*')
      .eq('userId', userId)
      .gte('statDate', startDate)
      .order('statDate', { ascending: true });

    // 获取客户数据
    const { count: customerCount } = await this.client
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    // 获取回收订单数据
    const { data: recycleOrders } = await this.client
      .from('recycle_orders')
      .select('deal_value')
      .eq('owner_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startDate);

    const totalDealValue = recycleOrders?.reduce((sum, order) => sum + (order.deal_value || 0), 0) || 0;

    // 获取内容数据
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

  /**
   * 获取团队数据看板统计
   */
  async getTeamDashboardStats(userId: string, period: string = 'week') {
    const today = new Date();
    const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 查找用户所在的团队
    const { data: teamMember } = await this.client
      .from('team_members')
      .select('teamId, role')
      .eq('userId', userId)
      .single();

    if (!teamMember) {
      return null; // 用户不在任何团队中
    }

    // 获取团队成员
    const { data: members } = await this.client
      .from('team_members')
      .select('userId')
      .eq('teamId', teamMember.teamId);

    const memberIds = members?.map(m => m.userId) || [];

    // 获取团队统计数据
    const { data: teamStats } = await this.client
      .from('user_statistics')
      .select('*')
      .in('userId', memberIds)
      .gte('statDate', startDate);

    // 获取团队客户总数
    const { count: teamCustomerCount } = await this.client
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .in('owner_id', memberIds);

    // 获取团队成交总额
    const { data: teamRecycleOrders } = await this.client
      .from('recycle_orders')
      .select('deal_value, owner_id')
      .in('owner_id', memberIds)
      .eq('status', 'completed')
      .gte('created_at', startDate);

    const teamTotalDealValue = teamRecycleOrders?.reduce((sum, order) => sum + (order.deal_value || 0), 0) || 0;

    // 获取团队内容总数
    const { count: teamContentCount } = await this.client
      .from('quick_notes')
      .select('*', { count: 'exact', head: true })
      .in('userId', memberIds);

    // 按成员聚合数据
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

  /**
   * 获取全局趋势数据
   */
  async getGlobalTrends(period: string = 'week') {
    const today = new Date();
    const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: statsList } = await this.client
      .from('user_statistics')
      .select('*')
      .gte('statDate', startDate)
      .order('statDate', { ascending: true });

    // 按日期聚合
    const dateMap = new Map<string, any>();

    for (const stat of statsList || []) {
      if (!dateMap.has(stat.statDate)) {
        dateMap.set(stat.statDate, {
          date: stat.statDate,
          dialogCount: 0,
          messageCount: 0,
          uploadFileCount: 0,
          activeUsers: new Set<string>(),
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

  /**
   * 获取全局统计数据
   */
  async getGlobalStatistics(): Promise<GlobalStatistics> {
    const today = new Date().toISOString().split('T')[0];

    // 获取总用户数和激活用户数 - 排除 deleted 状态的用户
    const { data: usersData } = await this.client
      .from('users')
      .select('id, status')
      .eq('status', 'active');

    const { count: totalUsers } = await this.client
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted');

    const activeUsers = usersData?.length || 0;

    // 获取对话总数
    const { count: totalDialogs } = await this.client
      .from('ai_conversations')
      .select('*', { count: 'exact', head: true });

    // 获取消息总数
    const { count: totalMessages } = await this.client
      .from('ai_messages')
      .select('*', { count: 'exact', head: true });

    // 获取语料库总数
    const { count: totalLexicons } = await this.client
      .from('lexicons')
      .select('*', { count: 'exact', head: true });

    // 获取爆款收藏总数
    const { count: totalViralReplicas } = await this.client
      .from('viral_favorites')
      .select('*', { count: 'exact', head: true });

    // 获取定时任务总数
    const { count: totalScheduledTasks } = await this.client
      .from('scheduled_tasks')
      .select('*', { count: 'exact', head: true });

    // 获取工作计划总数
    const { count: totalWorkPlans } = await this.client
      .from('work_plans')
      .select('*', { count: 'exact', head: true });

    // 获取工作计划任务总数
    const { count: totalWorkPlanTasks } = await this.client
      .from('work_plan_tasks')
      .select('*', { count: 'exact', head: true });

    // 获取上传文件总数和大小
    const { data: filesData } = await this.client
      .from('multimedia_resources')
      .select('fileSize');

    const totalUploadFiles = filesData?.length || 0;
    const totalUploadFileSize =
      filesData?.reduce((sum, file) => sum + (file.fileSize || 0), 0) || 0;

    // 获取今日统计数据
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
      totalLexiconItems: totalLexicons || 0, // 语料条目数暂时与语料库数相同
      totalHotWords: 0, // TODO: 实现热点词统计
      totalViralReplicas: totalViralReplicas || 0,
      totalScheduledTasks: totalScheduledTasks || 0,
      totalWorkPlans: totalWorkPlans || 0,
      totalWorkPlanTasks: totalWorkPlanTasks || 0,
      totalUploadFiles,
      totalUploadFileSize,
      totalTokensUsed: 0, // TODO: 实现 Token 使用统计
      todayActiveUsers,
      todayDialogs,
      todayMessages,
      todayUploads,
    };
  }

  /**
   * 获取活跃用户排行榜
   */
  async getActiveUserRanking(limit: number = 10): Promise<UserRanking[]> {
    const { data: statisticsData } = await this.client
      .from('user_statistics')
      .select('userId, dialogCount, messageCount, lexiconCount, uploadFileCount')
      .gte('statDate', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('dialogCount', { ascending: false });

    if (!statisticsData || statisticsData.length === 0) {
      return [];
    }

    // 按用户聚合统计
    const userStatsMap = new Map<string, any>();

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

    // 获取用户详情
    const userIds = Array.from(userStatsMap.keys()).slice(0, limit);
    const { data: usersData } = await this.client
      .from('users')
      .select('id, nickname, avatarUrl')
      .in('id', userIds);

    const { data: profilesData } = await this.client
      .from('user_profiles')
      .select('userId, department, position')
      .in('userId', userIds);

    // 合并用户信息和统计信息
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

  /**
   * 更新用户统计数据
   */
  async updateUserStatistics(userId: string, updates: Partial<UserStatistics>): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await this.client
      .from('user_statistics')
      .select('*')
      .eq('userId', userId)
      .eq('statDate', today)
      .limit(1)
      .single();

    if (existing) {
      // 更新现有统计
      await this.client
        .from('user_statistics')
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .eq('userId', userId)
        .eq('statDate', today);
    } else {
      // 创建新统计
      await this.createInitialStatistics(userId, today);
    }
  }

  /**
   * 创建初始统计数据
   */
  private async createInitialStatistics(userId: string, date: string): Promise<UserStatistics> {
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

  /**
   * 增加对话次数
   */
  async incrementDialogCount(userId: string): Promise<void> {
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
    } else {
      await this.createInitialStatistics(userId, today);
    }
  }

  /**
   * 增加消息数量
   */
  async incrementMessageCount(userId: string, count: number = 1): Promise<void> {
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
    } else {
      await this.createInitialStatistics(userId, today);
    }
  }

  /**
   * 增加上传文件数量
   */
  async incrementUploadFileCount(userId: string, fileSize: number): Promise<void> {
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
    } else {
      await this.createInitialStatistics(userId, today);
    }
  }
}
