import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  RefreshCw,
  Users,
  MessageSquare,
  BookOpen,
  Share2,
  Download,
  Bell,
  TrendingUp,
  ChevronLeft,
  TriangleAlert,
  FileChartColumn,
  Database,
  StickyNote,
  ScrollText,
  Building2,
  UsersRound,
  ShoppingCart,
  Bot,
  Radio,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface GlobalStatistics {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  deletedUsers: number;
  totalConversations: number;
  totalMessages: number;
  totalFiles: number;
  totalLexicons: number;
}

interface UserRanking {
  userId: string;
  username: string;
  avatar?: string;
  profile?: {
    realName?: string;
  };
  statistics: {
    conversationCount: number;
    messageCount: number;
    fileCount: number;
    lastActiveAt: string;
  };
  activityScore: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<GlobalStatistics | null>(null);
  const [userRankings, setUserRankings] = useState<UserRanking[]>([]);
  const [rankingLimit] = useState(10);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  const loadStatistics = async () => {
    try {
      const res = await Network.request({
        url: '/api/statistics/overview',
        method: 'GET',
      });

      console.log('全局统计响应:', res.data);

      if (res.data && res.data.data) {
        setStatistics(res.data.data);
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none',
      });
    }
  };

  const loadUserRankings = async () => {
    try {
      const res = await Network.request({
        url: '/api/statistics/ranking/active',
        method: 'GET',
        data: { limit: rankingLimit },
      });

      console.log('活跃用户排行响应:', res.data);

      if (res.data && res.data.data) {
        setUserRankings(res.data.data);
      }
    } catch (error: any) {
      console.error('加载用户排行失败:', error);
    }
  };

  const loadPendingUsersCount = async () => {
    try {
      const res = await Network.request({
        url: '/api/admin/pending-users/count',
        method: 'GET',
      });

      console.log('待审核用户数量响应:', res.data);

      if (res.data && res.data.data) {
        setPendingUsersCount(res.data.data.count || 0);
      }
    } catch (error: any) {
      console.error('加载待审核用户数量失败:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStatistics(), loadUserRankings(), loadPendingUsersCount()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    return `${Math.floor(diff / 86400000)}天前`;
  };

  // 快捷功能入口
  const quickActions = [
    {
      icon: FileChartColumn,
      title: '运营报告',
      desc: '分析用户行为与系统运营数据',
      path: '/package-admin/pages/admin/ai-report/index',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.2)',
    },
    {
      icon: Share2,
      title: '共享管理',
      desc: '管理语料库共享权限',
      path: '/package-admin/pages/admin/share-manage/index',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.2)',
    },
    {
      icon: Download,
      title: '数据导出',
      desc: '导出用户数据、语料库、日志',
      path: '/package-admin/pages/admin/data-export/index',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.2)',
    },
    {
      icon: Bell,
      title: '发送通知',
      desc: '给用户发送消息通知',
      path: '/package-admin/pages/admin/send-notification/index',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.2)',
    },
  ];

  // 管理功能入口
  const manageActions = [
    {
      icon: Users,
      title: '用户管理',
      desc: '查看/审核用户',
      path: '/package-admin/pages/admin/users/index',
      color: '#60a5fa',
      bgColor: 'rgba(96, 165, 250, 0.2)',
    },
    {
      icon: Bot,
      title: '管理中心',
      desc: '模型与模块配置',
      path: '/package-admin/pages/admin/ai-management/index',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.2)',
    },
    {
      icon: BookOpen,
      title: '语料库',
      desc: '管理语料库',
      path: '/package-admin/pages/admin/lexicon-manage/index',
      color: '#4ade80',
      bgColor: 'rgba(74, 222, 128, 0.2)',
    },
    {
      icon: Database,
      title: '用户数据',
      desc: '查看详细数据',
      path: '/package-admin/pages/admin/user-data/index',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.2)',
    },
    {
      icon: StickyNote,
      title: '快速笔记',
      desc: '管理用户笔记',
      path: '/package-admin/pages/admin/quick-note-manage/index',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.2)',
    },
    {
      icon: ScrollText,
      title: '审计日志',
      desc: '操作记录',
      path: '/package-admin/pages/admin/audit/index',
      color: '#f87171',
      bgColor: 'rgba(248, 113, 113, 0.2)',
    },
    {
      icon: TrendingUp,
      title: '共享统计',
      desc: '共享数据分析',
      path: '/package-admin/pages/admin/share-stats/index',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.2)',
    },
    {
      icon: Users,
      title: '客户管理',
      desc: '全局数据看板',
      path: '/package-admin/pages/admin/customer-management/index',
      color: '#60a5fa',
      bgColor: 'rgba(96, 165, 250, 0.2)',
    },
    {
      icon: Building2,
      title: '回收门店',
      desc: '全局数据看板',
      path: '/package-admin/pages/admin/recycle-management/index',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.2)',
    },
    {
      icon: UsersRound,
      title: '团队管理',
      desc: '管理团队和成员',
      path: '/package-admin/pages/admin/team-management/index',
      color: '#4ade80',
      bgColor: 'rgba(74, 222, 128, 0.2)',
    },
    {
      icon: ShoppingCart,
      title: '设备订单',
      desc: '求购转让管理',
      path: '/package-customer/pages/equipment-orders/index',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.2)',
    },
    {
      icon: BookOpen,
      title: '课程管理',
      desc: '上传培训课程',
      path: '/package-admin/pages/admin/course-manage/index',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.2)',
    },
    {
      icon: Radio,
      title: '直播数据',
      desc: '数据上传分析',
      path: '/package-live/pages/live-data/admin/index',
      color: '#f43f5e',
      bgColor: 'rgba(244, 63, 94, 0.2)',
    },
  ];

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <View
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => Taro.switchTab({ url: '/pages/tab-profile/index' })}
          >
            <ChevronLeft size={24} color="#f1f5f9" />
          </View>
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>数据监控</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>全局数据统计与快捷入口</Text>
          </View>
        </View>
      </View>

      <ScrollView
        scrollY
        style={{ height: 'calc(100vh - 120px)' }}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        {/* 待审核用户提示 */}
        {pendingUsersCount > 0 && (
          <View style={{ padding: '20px 20px 0' }}>
            <View
              style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => Taro.navigateTo({ url: '/package-admin/pages/admin/users/index?status=pending' })}
            >
              <View style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(248, 113, 113, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TriangleAlert size={22} color="#f87171" />
              </View>
              <View style={{ flex: 1, marginLeft: '12px' }}>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>待审核用户</Text>
                <Text style={{ fontSize: '12px', color: '#f87171', display: 'block', marginTop: '4px' }}>有 {pendingUsersCount} 位用户等待审核</Text>
              </View>
              <View style={{ backgroundColor: '#f87171', borderRadius: '12px', padding: '6px 12px' }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{pendingUsersCount}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 统计卡片 */}
        {statistics && (
          <View style={{ padding: '20px 20px 0' }}>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <Users size={20} color="#60a5fa" />
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '8px' }}>{statistics.totalUsers}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>总用户</Text>
              </View>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <Users size={20} color="#4ade80" />
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80', display: 'block', marginTop: '8px' }}>{statistics.activeUsers}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>活跃用户</Text>
              </View>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <MessageSquare size={20} color="#60a5fa" />
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '8px' }}>{statistics.totalConversations}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>对话数</Text>
              </View>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <BookOpen size={20} color="#fbbf24" />
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '8px' }}>{statistics.totalMessages}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>消息数</Text>
              </View>
            </View>
          </View>
        )}

        {/* 快捷功能 */}
        <View style={{ padding: '24px 20px 0' }}>
          <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>快捷功能</Text>
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {quickActions.map((item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
                onClick={() => handleNav(item.path)}
              >
                <View style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: item.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <item.icon size={22} color={item.color} />
                </View>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>{item.title}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 管理功能 */}
        <View style={{ padding: '24px 20px 0' }}>
          <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>管理功能</Text>
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {manageActions.map((item, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
                onClick={() => handleNav(item.path)}
              >
                <View style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: item.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <item.icon size={22} color={item.color} />
                </View>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>{item.title}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 活跃用户排行 */}
        {userRankings.length > 0 && (
          <View style={{ padding: '24px 20px 0' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>活跃用户排行</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleRefresh}>
                <RefreshCw size={14} color="#38bdf8" />
                <Text style={{ fontSize: '12px', color: '#38bdf8' }}>刷新</Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
              {userRankings.slice(0, 5).map((user, index) => (
                <View
                  key={user.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: index < Math.min(userRankings.length, 5) - 1 ? '1px solid #1e3a5f' : 'none',
                  }}
                >
                  <View
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#a16207' : '#1e3a5f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0,
                    }}
                  >
                    <Text style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.profile?.realName || user.username}
                    </Text>
                    <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>
                      活跃度 {user.activityScore} · {formatTime(user.statistics.lastActiveAt)}
                    </Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <MessageSquare size={12} color="#64748b" />
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>{user.statistics.messageCount}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: '20px' }} />
      </ScrollView>
    </View>
  );
}
