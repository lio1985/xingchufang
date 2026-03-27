import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  UserPlus,
  Lightbulb,
  ChevronRight,
  Bell,
  FileText,
  User,
  Clock,
  PenTool,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react-taro';

interface RecentActivity {
  id: string;
  type: 'customer' | 'content' | 'recycle' | 'message';
  title: string;
  description?: string;
  time: string;
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
  const [recentActivities] = useState<RecentActivity[]>([
    { id: '1', type: 'customer', title: '新增客户：张三', description: '意向：整店回收', time: '10分钟前' },
    { id: '2', type: 'content', title: '完成写作：厨房收纳技巧', description: '灵感速记', time: '1小时前' },
    { id: '3', type: 'recycle', title: '回收订单完成', description: '李四店铺 - ¥15,000', time: '2小时前' },
    { id: '4', type: 'message', title: '系统通知', description: '您有新的客资待处理', time: '3小时前' },
  ]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  Taro.useDidShow(() => {
    checkLoginStatus();
  });

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
      id: 'orders',
      icon: TrendingUp,
      label: '获客接单',
      desc: '获取客资信息',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
      path: '/pages/equipment-orders/index',
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return User;
      case 'content':
        return PenTool;
      case 'recycle':
        return Store;
      case 'message':
        return Bell;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'customer':
        return '#4ade80';
      case 'content':
        return '#fbbf24';
      case 'recycle':
        return '#60a5fa';
      case 'message':
        return '#38bdf8';
      default:
        return '#71717a';
    }
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 消息入口 */}
      <View
        style={{
          margin: '16px 20px 0',
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        onClick={() => handleNav('/pages/notification/index')}
      >
        <View
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <Bell size={22} color="#f59e0b" />
          {stats.unreadMessage > 0 && (
            <View
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                backgroundColor: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: '4px',
                paddingRight: '4px',
              }}
            >
              <Text style={{ fontSize: '11px', color: '#ffffff', fontWeight: '600' }}>{stats.unreadMessage}</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'block' }}>消息中心</Text>
          <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>
            {stats.unreadMessage > 0 ? `您有 ${stats.unreadMessage} 条未读消息` : '暂无新消息'}
          </Text>
        </View>
        <ChevronRight size={20} color="#64748b" />
      </View>

      {/* 欢迎区 */}
      <View style={{ padding: '20px', backgroundColor: '#111827', marginTop: '12px' }}>
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
              <Text style={{ fontSize: '20px', color: '#71717a' }}>
                {(userInfo.nickname || userInfo.username || '用')[0]}
              </Text>
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
        <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {quickActions.map((action) => {
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
                  flex: '1 1 45%',
                  minWidth: '140px',
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onClick={() => action.isTab ? handleSwitchTab(action.path) : handleNav(action.path)}
              >
                <View
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <IconComp size={22} color={action.color} />
                </View>
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>{action.label}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>{action.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 最近动态 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>最近动态</Text>
        </View>

        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {recentActivities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const activityColor = getActivityColor(activity.type);
            return (
              <View
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: index < recentActivities.length - 1 ? '1px solid #1e3a5f' : 'none',
                }}
              >
                <View
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: `${activityColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ActivityIcon size={16} color={activityColor} />
                </View>
                <View style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
                  <Text style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500', display: 'block' }}>{activity.title}</Text>
                  {activity.description && (
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>{activity.description}</Text>
                  )}
                </View>
                <View style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Clock size={12} color="#64748b" />
                  <Text style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px' }}>{activity.time}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default TabHomePage;
