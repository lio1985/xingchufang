import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

export interface CreateNotificationDto {
  title: string;
  content: string;
  type?: 'system' | 'activity' | 'update';
  targetType?: 'all' | 'team' | 'user';
  targetTeams?: string[];
  targetUsers?: string[];
  senderId?: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable()
export class NotificationService {
  private get supabase() {
    return getSupabaseClient();
  }

  /**
   * 发送通知（管理员调用）
   */
  async sendNotification(dto: CreateNotificationDto) {
    const { title, content, type = 'system', targetType = 'all', targetTeams = [], targetUsers = [], senderId } = dto;

    // 收集所有目标用户
    let resolvedTargetUsers: string[] = [];

    // 如果是团队发送，先获取团队成员
    if (targetType === 'team' && targetTeams && targetTeams.length > 0) {
      const { data: teamMembers, error: teamError } = await this.supabase
        .from('users')
        .select('id')
        .in('team_id', targetTeams)
        .eq('status', 'active');

      if (teamError) {
        console.error('获取团队成员失败:', teamError);
      }

      if (teamMembers && teamMembers.length > 0) {
        resolvedTargetUsers = teamMembers.map(m => m.id);
      }
    }

    // 如果是用户发送，解析用户ID
    if (targetType === 'user' && targetUsers && targetUsers.length > 0) {
      for (const userIdOrEmployeeId of targetUsers) {
        // 如果已经是 UUID 格式，直接使用
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(userIdOrEmployeeId)) {
          resolvedTargetUsers.push(userIdOrEmployeeId);
          continue;
        }

        // 尝试通过 employee_id 查找用户
        const { data: usersByEmployeeId } = await this.supabase
          .from('users')
          .select('id')
          .eq('employee_id', userIdOrEmployeeId)
          .limit(1);

        if (usersByEmployeeId && usersByEmployeeId.length > 0) {
          resolvedTargetUsers.push(usersByEmployeeId[0].id);
          continue;
        }

        // 尝试通过 openid 查找用户 (支持 pwd_ 前缀或纯 openid)
        const openidToSearch = userIdOrEmployeeId.startsWith('pwd_') 
          ? userIdOrEmployeeId 
          : `pwd_${userIdOrEmployeeId}`;
        
        const { data: usersByOpenid } = await this.supabase
          .from('users')
          .select('id')
          .eq('openid', openidToSearch)
          .limit(1);

        if (usersByOpenid && usersByOpenid.length > 0) {
          resolvedTargetUsers.push(usersByOpenid[0].id);
          continue;
        }

        // 如果都找不到，记录警告但继续
        console.warn(`未找到用户: ${userIdOrEmployeeId}`);
      }
    }

    // 去重
    resolvedTargetUsers = [...new Set(resolvedTargetUsers)];

    // 1. 创建通知记录
    console.log('准备创建通知:', { title, content, type, targetType, resolvedTargetUsers: resolvedTargetUsers.length, senderId });
    
    const insertData: any = {
      title,
      content,
      type,
      target_type: targetType,
      sender_id: senderId,
    };
    
    // 只有当有目标用户时才添加 target_users 字段
    if (resolvedTargetUsers.length > 0) {
      insertData.target_users = resolvedTargetUsers;
    }
    
    // 如果是团队发送，记录目标团队
    if (targetType === 'team' && targetTeams && targetTeams.length > 0) {
      insertData.target_teams = targetTeams;
    }
    
    const { data: notification, error } = await this.supabase
      .from('notifications')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('创建通知失败:', error);
      throw new Error(`创建通知失败: ${error.message}`);
    }

    // 2. 如果是定向发送，创建用户通知关联记录
    if ((targetType === 'team' || targetType === 'user') && resolvedTargetUsers.length > 0) {
      const userNotifications = resolvedTargetUsers.map(userId => ({
        user_id: userId,
        notification_id: notification.id,
        is_read: false,
      }));

      const { error: insertError } = await this.supabase
        .from('user_notifications')
        .insert(userNotifications);

      if (insertError) {
        console.error('创建用户通知关联失败:', insertError);
      }
    }

    return {
      success: true,
      data: notification,
      message: `通知发送成功，已发送给 ${resolvedTargetUsers.length} 位用户`,
    };
  }

  /**
   * 获取用户的通知列表
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    // 获取用户所属团队
    const { data: userData } = await this.supabase
      .from('users')
      .select('team_id')
      .eq('id', userId)
      .single();

    const userTeamId = userData?.team_id;

    // 构建查询条件：
    // 1. 全局通知 (target_type = 'all')
    // 2. 发给用户个人的通知 (target_type = 'user' 且 target_users 包含该用户)
    // 3. 发给用户所在团队的通知 (target_type = 'team' 且 target_teams 包含该用户的团队)
    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .or(`target_type.eq.all,and(target_type.eq.user,target_users.cs.{${userId}})`)
      .order('created_at', { ascending: false });

    // 如果用户有团队，也查询团队通知
    if (userTeamId) {
      // 使用单独的查询获取团队通知，然后合并
      const { data: teamNotifications } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('target_type', 'team')
        .contains('target_teams', [userTeamId])
        .order('created_at', { ascending: false });

      // 获取主查询结果
      const { data: mainNotifications, error, count } = await query.range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('获取通知列表失败:', error);
        throw new Error('获取通知列表失败');
      }

      // 合并结果
      const allNotifications = [...(mainNotifications || []), ...(teamNotifications || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // 获取用户的已读状态
      const { data: userNotifications } = await this.supabase
        .from('user_notifications')
        .select('notification_id, is_read, read_at')
        .eq('user_id', userId);

      const readMap = new Map();
      userNotifications?.forEach(un => {
        readMap.set(un.notification_id, { isRead: un.is_read, readAt: un.read_at });
      });

      // 组装返回数据
      const list = allNotifications.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        type: n.type,
        createdAt: n.created_at,
        isRead: readMap.get(n.id)?.isRead || false,
        readAt: readMap.get(n.id)?.readAt || null,
      }));

      // 统计未读数量
      const unreadCount = list.filter(n => !n.isRead).length;

      return {
        success: true,
        data: {
          list,
          pagination: {
            page,
            limit,
            total: count || 0 + (teamNotifications?.length || 0),
          },
          unreadCount,
        },
      };
    }

    // 用户没有团队，只查询普通通知
    const { data: notifications, error, count } = await query.range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('获取通知列表失败:', error);
      throw new Error('获取通知列表失败');
    }

    // 获取用户的已读状态
    const { data: userNotifications } = await this.supabase
      .from('user_notifications')
      .select('notification_id, is_read, read_at')
      .eq('user_id', userId);

    const readMap = new Map();
    userNotifications?.forEach(un => {
      readMap.set(un.notification_id, { isRead: un.is_read, readAt: un.read_at });
    });

    // 组装返回数据
    const list = (notifications || []).map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      type: n.type,
      createdAt: n.created_at,
      isRead: readMap.get(n.id)?.isRead || false,
      readAt: readMap.get(n.id)?.readAt || null,
    }));

    // 统计未读数量
    const unreadCount = list.filter(n => !n.isRead).length;

    return {
      success: true,
      data: {
        list,
        pagination: {
          page,
          limit,
          total: count || 0,
        },
        unreadCount,
      },
    };
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string, userId: string) {
    // 检查是否已存在记录
    const { data: existing } = await this.supabase
      .from('user_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('notification_id', notificationId)
      .single();

    if (existing) {
      // 更新已读状态
      const { error } = await this.supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (error) {
        console.error('标记已读失败:', error);
        throw new Error('标记已读失败');
      }
    } else {
      // 创建新的已读记录
      const { error } = await this.supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          notification_id: notificationId,
          is_read: true,
          read_at: new Date().toISOString(),
        });

      if (error) {
        console.error('创建已读记录失败:', error);
        throw new Error('标记已读失败');
      }
    }

    return {
      success: true,
      message: '标记已读成功',
    };
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: string) {
    // 获取用户未读的通知
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('id')
      .or(`target_type.eq.all,and(target_type.eq.single,target_users.cs.{${userId}})`);

    if (!notifications || notifications.length === 0) {
      return { success: true, message: '没有需要标记的通知' };
    }

    // 批量创建已读记录
    const notificationIds = notifications.map(n => n.id);
    const readRecords = notificationIds.map(id => ({
      user_id: userId,
      notification_id: id,
      is_read: true,
      read_at: new Date().toISOString(),
    }));

    // 使用 upsert 避免重复
    const { error } = await this.supabase
      .from('user_notifications')
      .upsert(readRecords, { onConflict: 'user_id,notification_id' });

    if (error) {
      console.error('批量标记已读失败:', error);
      throw new Error('标记已读失败');
    }

    return {
      success: true,
      message: '全部标记已读成功',
    };
  }

  /**
   * 获取未读通知数量（小红点用）
   */
  async getUnreadCount(userId: string) {
    // 获取用户所属团队
    const { data: userData } = await this.supabase
      .from('users')
      .select('team_id')
      .eq('id', userId)
      .single();

    const userTeamId = userData?.team_id;

    // 获取用户的通知
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('id')
      .or(`target_type.eq.all,and(target_type.eq.user,target_users.cs.{${userId}})`);

    // 如果用户有团队，也获取团队通知
    let teamNotifications: any[] = [];
    if (userTeamId) {
      const { data: teamData } = await this.supabase
        .from('notifications')
        .select('id')
        .eq('target_type', 'team')
        .contains('target_teams', [userTeamId]);
      teamNotifications = teamData || [];
    }

    const allNotifications = [...(notifications || []), ...teamNotifications];

    if (allNotifications.length === 0) {
      return { success: true, data: { count: 0 } };
    }

    const notificationIds = allNotifications.map(n => n.id);

    // 获取已读数量
    const { data: readNotifications } = await this.supabase
      .from('user_notifications')
      .select('notification_id')
      .eq('user_id', userId)
      .eq('is_read', true)
      .in('notification_id', notificationIds);

    const readIds = new Set(readNotifications?.map(n => n.notification_id) || []);
    const unreadCount = notificationIds.filter(id => !readIds.has(id)).length;

    return {
      success: true,
      data: { count: unreadCount },
    };
  }

  /**
   * 删除通知（管理员）
   */
  async deleteNotification(notificationId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('删除通知失败:', error);
      throw new Error('删除通知失败');
    }

    return {
      success: true,
      message: '删除成功',
    };
  }
}
