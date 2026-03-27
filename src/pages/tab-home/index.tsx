import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  UserPlus,
  Lightbulb,
  ChevronRight,
  Bell,
  User,
  TrendingUp,
  Users,
  Package,
  Phone,
  Clock,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface RecentOrder {
  id: string;
  order_no: string;
  title: string;
  customer_phone: string;
  status: string;
  priority: string;
  expected_price?: number;
  created_at: string;
}

interface QuickAction {
  id: string;
  icon: typeof Sparkles;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  path: string;
  isHighlight?: boolean;
  isTab?: boolean;
}

const TabHomePage = () => {
  const [userInfo, setUserInfo] = useState<{
    id?: string;
    username?: string;
    nickname?: string;
    avatar?: string;
    role?: string;
  } | null>(null);
  const [stats] = useState({
    todayNew: 12,
    pendingFollow: 8,
    unreadMessage: 5,
    weekContent: 15,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    checkLoginStatus();
    fetchRecentOrders();
  }, []);

  Taro.useDidShow(() => {
    checkLoginStatus();
    fetchRecentOrders();
  });

  const fetchRecentOrders = async () => {
    try {
      const res = await Network.request({
        url: '/api/equipment-orders?limit=5',
        method: 'GET',
      });
      if (res.data?.success) {
        setRecentOrders(res.data.data.list || []);
      }
    } catch (error) {
      console.log('获取最近订单失败:', error);
    }
  };

  const checkLoginStatus = () => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setUserInfo(user);
      }
    } catch (e) {
      console.log('获取用户信息失败');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const formatDate = () => {
    const now = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDay = weekDays[now.getDay()];
    return `${month}月${date}日 ${weekDay}`;
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleSwitchTab = (path: string) => {
    Taro.switchTab({ url: path });
  };

  const quickActions: QuickAction[] = [
    {
      id: 'orders',
      icon: TrendingUp,
      label: '获客接单',
      desc: '获取客资信息，快速接单赚钱',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      path: '/pages/equipment-orders/index',
      isHighlight: true,
    },
    {
      id: 'ai',
      icon: Sparkles,
      label: '星小帮',
      desc: '智能写作助手',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
      path: '/pages/ai-assistant/index',
      isHighlight: true,
    },
    {
      id: 'customer',
      icon: UserPlus,
      label: '获客登记',
      desc: '客户信息录入',
      color: '#4ade80',
      bgColor: 'rgba(74, 222, 128, 0.15)',
      path: '/pages/customer/index',
    },
    {
      id: 'idea',
      icon: Lightbulb,
      label: '灵感速记',
      desc: '捕捉灵感',
      color: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      path: '/pages/quick-note/index',
    },
    {
      id: 'team',
      icon: Users,
      label: '我的团队',
      desc: '团队协作管理',
      color: '#a78bfa',
      bgColor: 'rgba(167, 139, 250, 0.15)',
      path: '/pages/team/index',
    },
  ];

  // 订单状态映射
  const getOrderStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      published: { text: '待接单', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.15)' },
      taken: { text: '已接单', color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.15)' },
      completed: { text: '已完成', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.15)' },
      closed: { text: '已关闭', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.15)' },
    };
    return statusMap[status] || { text: '未知', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.15)' };
  };

  // 格式化时间
  const formatOrderTime = (timeStr: string) => {
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
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 欢迎区 */}
      <View style={{ padding: '16px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          <View
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              overflow: 'hidden',
            }}
            onClick={() => handleSwitchTab('/pages/tab-profile/index')}
          >
            {userInfo?.avatar ? (
              <Image
                src={userInfo.avatar}
                mode="aspectFill"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <User size={24} color="#71717a" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', display: 'block' }}>
              {getGreeting()}，{userInfo?.nickname || userInfo?.username || '用户'}
            </Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>
              {formatDate()}
            </Text>
          </View>
          {/* 消息铃铛入口 */}
          <View
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/notification/index' })}
          >
            <Bell size={20} color="#38bdf8" />
            {stats.unreadMessage > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                }}
              >
                <Text style={{ fontSize: '10px', color: '#ffffff', fontWeight: '600' }}>
                  {stats.unreadMessage > 99 ? '99+' : stats.unreadMessage}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 数据概览 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{stats.todayNew}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>今日新增</Text>
          </View>
          <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '28px', fontWeight: '700', color: '#38bdf8' }}>{stats.pendingFollow}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>待跟进</Text>
          </View>
          <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>{stats.unreadMessage}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>待处理消息</Text>
          </View>
          <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>{stats.weekContent}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>本周写作</Text>
          </View>
        </View>
      </View>

      {/* 快捷入口 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>快捷入口</Text>

        {/* 获客接单 - 带滚动订单列表 */}
        <View
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: '12px',
            marginBottom: '12px',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
            onClick={() => handleNav('/pages/equipment-orders/index')}
          >
            <View
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TrendingUp size={26} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '17px', fontWeight: '600', color: '#f97316', display: 'block' }}>获客接单</Text>
              <Text style={{ fontSize: '13px', color: 'rgba(249, 115, 22, 0.6)', display: 'block', marginTop: '2px' }}>获取客资信息，快速接单赚钱</Text>
            </View>
            <ChevronRight size={20} color="#f97316" />
          </View>

          {/* 最近5单滚动列表 */}
          {recentOrders.length > 0 && (
            <View style={{ borderTop: '1px solid rgba(249, 115, 22, 0.15)' }}>
              <ScrollView scrollX style={{ padding: '12px 16px' }}>
                <View style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                  {recentOrders.map((order) => {
                    const statusInfo = getOrderStatusInfo(order.status);
                    return (
                      <View
                        key={order.id}
                        style={{
                          minWidth: '200px',
                          backgroundColor: 'rgba(17, 24, 39, 0.8)',
                          border: '1px solid rgba(249, 115, 22, 0.2)',
                          borderRadius: '10px',
                          padding: '12px',
                          flexShrink: 0,
                        }}
                        onClick={() => handleNav(`/pages/equipment-orders/detail?id=${order.id}`)}
                      >
                        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{order.title}</Text>
                          <View style={{ backgroundColor: statusInfo.bgColor, borderRadius: '4px', padding: '2px 6px' }}>
                            <Text style={{ fontSize: '11px', color: statusInfo.color, display: 'block' }}>{statusInfo.text}</Text>
                          </View>
                        </View>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Phone size={12} color="#71717a" />
                          <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>{order.customer_phone}</Text>
                        </View>
                        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} color="#64748b" />
                            <Text style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{formatOrderTime(order.created_at)}</Text>
                          </View>
                          {order.expected_price && (
                            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#f97316', display: 'block' }}>¥{order.expected_price.toLocaleString()}</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {recentOrders.length === 0 && (
            <View style={{ padding: '16px', borderTop: '1px solid rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} color="#64748b" style={{ marginRight: '8px' }} />
              <Text style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>暂无订单，快去接单吧</Text>
            </View>
          )}
        </View>

        {/* 其他快捷入口 */}
        <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {quickActions.filter(a => a.id !== 'orders').map((action) => {
            const IconComp = action.icon;
            if (action.isHighlight) {
              return (
                <View
                  key={action.id}
                  style={{
                    flex: '1 1 100%',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(167, 139, 250, 0.1))',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onClick={() => action.isTab ? handleSwitchTab(action.path) : handleNav(action.path)}
                >
                  <View
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #38bdf8, #f97316)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={26} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '17px', fontWeight: '600', color: '#38bdf8', display: 'block' }}>{action.label}</Text>
                    <Text style={{ fontSize: '13px', color: 'rgba(56, 189, 248, 0.6)', display: 'block', marginTop: '2px' }}>{action.desc}</Text>
                  </View>
                  <ChevronRight size={20} color="#38bdf8" />
                </View>
              );
            }
            return (
              <View
                key={action.id}
                style={{
                  flex: '1 1 30%',
                  minWidth: '100px',
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onClick={() => action.isTab ? handleSwitchTab(action.path) : handleNav(action.path)}
              >
                <View
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <IconComp size={20} color={action.color} />
                </View>
                <Text style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff', display: 'block', textAlign: 'center' }}>{action.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default TabHomePage;
