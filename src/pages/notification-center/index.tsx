import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  CircleCheck,
  CircleAlert,
  Info,
  ChevronRight,
  Clock,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  related_order_id?: string;
}

const NotificationCenterPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeType !== 'all') {
        params.append('type', activeType);
      }

      const res = await Network.request({
        url: `/api/notifications?${params.toString()}`,
        method: 'GET',
      });

      if (res.data?.success) {
        const data = res.data.data;
        setNotifications(data.list || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('获取通知列表失败:', error);
      Taro.showToast({ title: '获取列表失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  const handleNotificationClick = async (notification: Notification) => {
    // 标记为已读
    if (!notification.is_read) {
      try {
        await Network.request({
          url: `/api/notifications/${notification.id}/read`,
          method: 'POST',
        });
        fetchNotifications();
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }

    // 跳转到相关订单
    if (notification.related_order_id) {
      Taro.navigateTo({ url: `/pages/equipment-orders/detail?id=${notification.related_order_id}` });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await Network.request({
        url: '/api/notifications/read-all',
        method: 'POST',
      });

      if (res.data?.success) {
        Taro.showToast({ title: '已全部标记已读', icon: 'success' });
        fetchNotifications();
      }
    } catch (error) {
      console.error('操作失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_taken':
        return <CircleCheck size={20} color="#4ade80" />;
      case 'order_completed':
        return <CircleCheck size={20} color="#60a5fa" />;
      case 'order_transferred':
        return <CircleAlert size={20} color="#38bdf8" />;
      case 'new_order':
        return <Info size={20} color="#60a5fa" />;
      default:
        return <Bell size={20} color="#71717a" />;
    }
  };

  const typeFilters = [
    { key: 'all', label: '全部' },
    { key: 'order', label: '订单通知' },
    { key: 'system', label: '系统消息' },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View style={{ backgroundColor: '#111827', padding: '48px 20px 16px', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={24} color="#38bdf8" />
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>消息中心</Text>
          </View>
          {unreadCount > 0 && (
            <View
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
              }}
              onClick={handleMarkAllRead}
            >
              <Text style={{ fontSize: '12px', color: '#f87171' }}>全部已读 ({unreadCount})</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: '13px', color: '#71717a' }}>订单动态、系统通知</Text>
      </View>

      {/* 类型筛选 */}
      <View style={{ backgroundColor: '#111827', padding: '12px 20px', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', gap: '8px' }}>
          {typeFilters.map((filter) => (
            <View
              key={filter.key}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: activeType === filter.key ? '#38bdf8' : '#1e3a5f',
                flexShrink: 0
              }}
              onClick={() => setActiveType(filter.key)}
            >
              <Text style={{ fontSize: '13px', color: activeType === filter.key ? '#0a0f1a' : '#94a3b8', fontWeight: '500' }}>
                {filter.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 通知列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 180px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {loading ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text style={{ color: '#71717a' }}>加载中...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <View style={{ marginBottom: '12px' }}>
                <BellOff size={48} color="#1e3a5f" />
              </View>
              <Text style={{ color: '#71717a', fontSize: '14px' }}>暂无消息</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <View
                key={notification.id}
                style={{
                  backgroundColor: notification.is_read ? '#111827' : '#1a1a1f',
                  border: notification.is_read ? '1px solid #1e3a5f' : '1px solid #38bdf8',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  opacity: notification.is_read ? 0.8 : 1,
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <View
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: notification.is_read ? '#1e3a5f' : 'rgba(245, 158, 11, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{notification.title}</Text>
                      {!notification.is_read && (
                        <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                      )}
                    </View>
                    <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '20px', marginBottom: '8px' }}>
                      {notification.content}
                    </Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="#64748b" />
                      <Text style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(notification.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  {notification.related_order_id && (
                    <View style={{ flexShrink: 0, marginTop: '12px' }}>
                      <ChevronRight size={16} color="#64748b" />
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationCenterPage;
