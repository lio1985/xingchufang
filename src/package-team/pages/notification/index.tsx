import { useState, useEffect, useCallback } from 'react';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  Bell,
  BellRing,
  Info,
  Megaphone,
  RefreshCw,
  Check,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react-taro';

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

      console.log('[Notification] 响应:', response.data);

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
      console.error('[Notification] 获取失败:', error);
      Taro.showToast({ title: '获取通知失败', icon: 'none' });
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
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[Notification] 标记已读失败:', error);
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
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        Taro.showToast({ title: '已全部标记为已读', icon: 'success' });
      }
    } catch (error) {
      console.error('[Notification] 标记全部已读失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Bell size={20} color="#60a5fa" />;
      case 'activity':
        return <Megaphone size={20} color="#38bdf8" />;
      case 'update':
        return <RefreshCw size={20} color="#4ade80" />;
      default:
        return <Info size={20} color="#71717a" />;
    }
  };

  // 获取类型名称
  const getTypeName = (type: string) => {
    switch (type) {
      case 'system':
        return '系统通知';
      case 'activity':
        return '活动通知';
      case 'update':
        return '更新通知';
      default:
        return '消息';
    }
  };

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return '#60a5fa';
      case 'activity':
        return '#38bdf8';
      case 'update':
        return '#4ade80';
      default:
        return '#71717a';
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
    }

    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }

    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    }

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
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            {/* 返回按钮 */}
            <View
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
              }}
              onClick={() => Taro.navigateBack({ delta: 1 })}
            >
              <ArrowLeft size={18} color="#38bdf8" />
            </View>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>消息中心</Text>
            {unreadCount > 0 && (
              <View style={{
                marginLeft: '8px',
                backgroundColor: '#f87171',
                borderRadius: '10px',
                padding: '2px 8px',
                minWidth: '20px',
                textAlign: 'center'
              }}
              >
                <Text style={{ fontSize: '12px', color: '#ffffff' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <View
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={markAllAsRead}
            >
              <Check size={14} color="#38bdf8" />
              <Text style={{ fontSize: '13px', color: '#38bdf8' }}>全部已读</Text>
            </View>
          )}
        </View>
      </View>

      {/* 通知列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 140px)' }}>
        {notifications.length === 0 ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
            <View style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BellRing size={32} color="#64748b" />
            </View>
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '16px' }}>暂无消息</Text>
            <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>新的消息将会显示在这里</Text>
          </View>
        ) : (
          <View style={{ padding: '0 20px' }}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={{
                  backgroundColor: '#111827',
                  border: notification.isRead ? '1px solid #1e3a5f' : '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}
                onClick={() => markAsRead(notification.id)}
              >
                <View style={{ display: 'flex', gap: '12px' }}>
                  {/* 图标 */}
                  <View style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: `rgba(${getTypeColor(notification.type) === '#60a5fa' ? '59, 130, 246' : getTypeColor(notification.type) === '#38bdf8' ? '245, 158, 11' : '34, 197, 94'}, 0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  >
                    {getTypeIcon(notification.type)}
                  </View>

                  {/* 内容 */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                        {!notification.isRead && (
                          <View style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: '#38bdf8', flexShrink: 0 }} />
                        )}
                        <Text style={{
                          fontSize: '15px',
                          fontWeight: notification.isRead ? '400' : '600',
                          color: '#ffffff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        >
                          {notification.title}
                        </Text>
                      </View>
                      <Text style={{ fontSize: '12px', color: '#64748b', flexShrink: 0, marginLeft: '8px' }}>
                        {formatTime(notification.createdAt)}
                      </Text>
                    </View>

                    <Text style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      display: 'block',
                      marginBottom: '10px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    >
                      {notification.content}
                    </Text>

                    <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        backgroundColor: `rgba(${getTypeColor(notification.type) === '#60a5fa' ? '59, 130, 246' : getTypeColor(notification.type) === '#38bdf8' ? '245, 158, 11' : '34, 197, 94'}, 0.15)`
                      }}
                      >
                        <Text style={{ fontSize: '11px', color: getTypeColor(notification.type) }}>
                          {getTypeName(notification.type)}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#64748b" />
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {/* 加载状态 */}
            {loading && (
              <View style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>加载中...</Text>
              </View>
            )}

            {/* 没有更多 */}
            {!hasMore && notifications.length > 0 && (
              <View style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <Text style={{ fontSize: '12px', color: '#64748b' }}>没有更多消息了</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationPage;
