import { useState, useEffect, useCallback } from 'react';
import Taro, { showToast, usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { Network } from '@/network';
import { Bell, Check, ChevronRight, MessageSquare, Info } from 'lucide-react-taro';
import './index.less';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'activity' | 'update';
  isRead: boolean;
  createdAt: string;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 获取通知列表
  const fetchNotifications = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await Network.request({
        url: `/api/notifications?page=${pageNum}&limit=20`,
        method: 'GET',
      });

      console.log('通知列表响应:', response.data);

      if (response.data?.success) {
        const { list, pagination } = response.data.data;
        
        if (isLoadMore) {
          setNotifications(prev => [...prev, ...list]);
        } else {
          setNotifications(list);
        }
        
        setUnreadCount(response.data.data.unreadCount);
        setHasMore(list.length === 20 && pagination.total > pageNum * 20);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
      showToast({ title: '获取通知失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // 标记已读
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await Network.request({
        url: `/api/notifications/${notificationId}/read`,
        method: 'POST',
      });

      if (response.data?.success) {
        // 更新本地状态
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 标记全部已读
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await Network.request({
        url: '/api/notifications/read-all',
        method: 'POST',
      });

      if (response.data?.success) {
        // 更新本地状态
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        showToast({ title: '已全部标记为已读', icon: 'success' });
      }
    } catch (error) {
      console.error('标记全部已读失败:', error);
      showToast({ title: '操作失败', icon: 'none' });
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Bell size={20} color="#3b82f6" />;
      case 'activity':
        return <Info size={20} color="#f59e0b" />;
      case 'update':
        return <Info size={20} color="#10b981" />;
      default:
        return <MessageSquare size={20} color="#6b7280" />;
    }
  };

  // 获取类型名称
  const getTypeName = (type: string) => {
    switch (type) {
      case 'system':
        return '系统';
      case 'activity':
        return '活动';
      case 'update':
        return '更新';
      default:
        return '消息';
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
    }
    
    // 小于24小时
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }
    
    // 小于7天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    }
    
    // 其他情况显示日期
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 下拉刷新
  usePullDownRefresh(() => {
    setPage(1);
    fetchNotifications(1, false).then(() => {
      Taro.stopPullDownRefresh();
    });
  });

  // 上拉加载更多
  useReachBottom(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  });

  // 初始加载
  useEffect(() => {
    fetchNotifications(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className="notification-page">
      {/* 头部 */}
      <View className="header">
        <View className="title-section">
          <Text className="title">消息中心</Text>
          {unreadCount > 0 && (
            <View className="unread-badge">
              <Text className="unread-count">{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <View className="read-all-btn" onClick={markAllAsRead}>
            <Check size={16} color="#3b82f6" />
            <Text className="read-all-text">全部已读</Text>
          </View>
        )}
      </View>

      {/* 通知列表 */}
      <View className="notification-list">
        {notifications.length === 0 ? (
          <View className="empty-state">
            <Bell size={64} color="#d1d5db" />
            <Text className="empty-text">暂无消息</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <View className="notification-icon">
                {getTypeIcon(notification.type)}
              </View>
              
              <View className="notification-content">
                <View className="notification-header">
                  <View className="notification-title-row">
                    {!notification.isRead && <View className="unread-dot" />}
                    <Text className="notification-title">{notification.title}</Text>
                  </View>
                  <Text className="notification-time">
                    {formatTime(notification.createdAt)}
                  </Text>
                </View>
                
                <Text className="notification-body" numberOfLines={2}>
                  {notification.content}
                </Text>
                
                <View className="notification-footer">
                  <Text className="notification-type">
                    {getTypeName(notification.type)}
                  </Text>
                  <ChevronRight size={16} color="#9ca3af" />
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 加载更多 */}
      {loading && (
        <View className="loading-more">
          <Text className="loading-text">加载中...</Text>
        </View>
      )}
      
      {!hasMore && notifications.length > 0 && (
        <View className="no-more">
          <Text className="no-more-text">没有更多消息了</Text>
        </View>
      )}
    </View>
  );
};

export default NotificationPage;
