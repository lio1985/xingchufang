"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
let NotificationService = class NotificationService {
    get supabase() {
        return (0, supabase_client_1.getSupabaseClient)();
    }
    async sendNotification(dto) {
        const { title, content, type = 'system', targetType = 'all', targetTeams = [], targetUsers = [], senderId } = dto;
        let resolvedTargetUsers = [];
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
        if (targetType === 'user' && targetUsers && targetUsers.length > 0) {
            for (const userIdOrEmployeeId of targetUsers) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(userIdOrEmployeeId)) {
                    resolvedTargetUsers.push(userIdOrEmployeeId);
                    continue;
                }
                const { data: usersByEmployeeId } = await this.supabase
                    .from('users')
                    .select('id')
                    .eq('employee_id', userIdOrEmployeeId)
                    .limit(1);
                if (usersByEmployeeId && usersByEmployeeId.length > 0) {
                    resolvedTargetUsers.push(usersByEmployeeId[0].id);
                    continue;
                }
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
                console.warn(`未找到用户: ${userIdOrEmployeeId}`);
            }
        }
        resolvedTargetUsers = [...new Set(resolvedTargetUsers)];
        console.log('准备创建通知:', { title, content, type, targetType, resolvedTargetUsers: resolvedTargetUsers.length, senderId });
        const insertData = {
            title,
            content,
            type,
            target_type: targetType,
            sender_id: senderId,
        };
        if (resolvedTargetUsers.length > 0) {
            insertData.target_users = resolvedTargetUsers;
        }
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
    async getUserNotifications(userId, page = 1, limit = 20) {
        const { data: userData } = await this.supabase
            .from('users')
            .select('team_id')
            .eq('id', userId)
            .single();
        const userTeamId = userData?.team_id;
        let query = this.supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .or(`target_type.eq.all,and(target_type.eq.user,target_users.cs.{${userId}})`)
            .order('created_at', { ascending: false });
        if (userTeamId) {
            const { data: teamNotifications } = await this.supabase
                .from('notifications')
                .select('*')
                .eq('target_type', 'team')
                .contains('target_teams', [userTeamId])
                .order('created_at', { ascending: false });
            const { data: mainNotifications, error, count } = await query.range((page - 1) * limit, page * limit - 1);
            if (error) {
                console.error('获取通知列表失败:', error);
                throw new Error('获取通知列表失败');
            }
            const allNotifications = [...(mainNotifications || []), ...(teamNotifications || [])]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const { data: userNotifications } = await this.supabase
                .from('user_notifications')
                .select('notification_id, is_read, read_at')
                .eq('user_id', userId);
            const readMap = new Map();
            userNotifications?.forEach(un => {
                readMap.set(un.notification_id, { isRead: un.is_read, readAt: un.read_at });
            });
            const list = allNotifications.map(n => ({
                id: n.id,
                title: n.title,
                content: n.content,
                type: n.type,
                createdAt: n.created_at,
                isRead: readMap.get(n.id)?.isRead || false,
                readAt: readMap.get(n.id)?.readAt || null,
            }));
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
        const { data: notifications, error, count } = await query.range((page - 1) * limit, page * limit - 1);
        if (error) {
            console.error('获取通知列表失败:', error);
            throw new Error('获取通知列表失败');
        }
        const { data: userNotifications } = await this.supabase
            .from('user_notifications')
            .select('notification_id, is_read, read_at')
            .eq('user_id', userId);
        const readMap = new Map();
        userNotifications?.forEach(un => {
            readMap.set(un.notification_id, { isRead: un.is_read, readAt: un.read_at });
        });
        const list = (notifications || []).map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            type: n.type,
            createdAt: n.created_at,
            isRead: readMap.get(n.id)?.isRead || false,
            readAt: readMap.get(n.id)?.readAt || null,
        }));
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
    async markAsRead(notificationId, userId) {
        const { data: existing } = await this.supabase
            .from('user_notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('notification_id', notificationId)
            .single();
        if (existing) {
            const { error } = await this.supabase
                .from('user_notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', existing.id);
            if (error) {
                console.error('标记已读失败:', error);
                throw new Error('标记已读失败');
            }
        }
        else {
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
    async markAllAsRead(userId) {
        const { data: notifications } = await this.supabase
            .from('notifications')
            .select('id')
            .or(`target_type.eq.all,and(target_type.eq.single,target_users.cs.{${userId}})`);
        if (!notifications || notifications.length === 0) {
            return { success: true, message: '没有需要标记的通知' };
        }
        const notificationIds = notifications.map(n => n.id);
        const readRecords = notificationIds.map(id => ({
            user_id: userId,
            notification_id: id,
            is_read: true,
            read_at: new Date().toISOString(),
        }));
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
    async getUnreadCount(userId) {
        const { data: userData } = await this.supabase
            .from('users')
            .select('team_id')
            .eq('id', userId)
            .single();
        const userTeamId = userData?.team_id;
        const { data: notifications } = await this.supabase
            .from('notifications')
            .select('id')
            .or(`target_type.eq.all,and(target_type.eq.user,target_users.cs.{${userId}})`);
        let teamNotifications = [];
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
    async deleteNotification(notificationId) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)()
], NotificationService);
//# sourceMappingURL=notification.service.js.map