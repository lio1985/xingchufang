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
  ChevronRight,
  TriangleAlert,
  FileChartColumn,
  Database,
  StickyNote,
  ScrollText,
  Building2,
  UsersRound,
  ShoppingCart,
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

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => Taro.switchTab({ url: '/pages/tab-profile/index' })}
          >
            <ChevronLeft size={18} color="#38bdf8" />
          </View>
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>数据监控</Text>
          <View
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.5 : 1,
            }}
            onClick={handleRefresh}
          >
            <RefreshCw size={18} color={loading ? '#64748b' : '#38bdf8'} />
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
        {/* 快捷功能 */}
        <View style={{ padding: '16px 20px 0' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>快捷功能</Text>

          {/* 运营报告 */}
          <View
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/admin/ai-report/index' })}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileChartColumn size={20} color="#8b5cf6" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>运营报告</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>分析用户行为与系统运营数据</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>

          {/* 共享管理 */}
          <View
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/admin/share-manage/index' })}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Share2 size={20} color="#10b981" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>共享管理</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>管理语料库共享权限</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>

          {/* 数据导出 */}
          <View
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/admin/data-export/index' })}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Download size={20} color="#38bdf8" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>数据导出</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>导出用户数据、语料库、日志</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>

          {/* 待审核用户提示 */}
          {pendingUsersCount > 0 && (
            <View
              style={{
                backgroundColor: '#111827',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}
              onClick={() => Taro.navigateTo({ url: '/pages/admin/users/index?status=pending' })}
            >
              <View style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(248, 113, 113, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TriangleAlert size={20} color="#f87171" />
              </View>
              <View style={{ flex: 1, marginLeft: '12px' }}>
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>待审核用户</Text>
                <Text style={{ fontSize: '12px', color: '#f87171', display: 'block', marginTop: '2px' }}>有 {pendingUsersCount} 位用户等待审核</Text>
              </View>
              <View style={{ backgroundColor: '#f87171', borderRadius: '12px', padding: '4px 10px' }}>
                <Text style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', display: 'block' }}>{pendingUsersCount}</Text>
              </View>
            </View>
          )}
        </View>

        {/* 统计数据 */}
        {statistics && (
          <View style={{ padding: '20px 20px 0' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>全局统计</Text>
            <View style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '14px' }}>
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{statistics.totalUsers}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>总用户数</Text>
              </View>
              <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '14px' }}>
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80', display: 'block' }}>{statistics.activeUsers}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>活跃用户</Text>
              </View>
              <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '14px' }}>
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#60a5fa', display: 'block' }}>{statistics.totalConversations}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>对话总数</Text>
              </View>
              <View style={{ flex: '1 1 45%', minWidth: '140px', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '14px' }}>
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24', display: 'block' }}>{statistics.totalMessages}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>消息总数</Text>
              </View>
            </View>
          </View>
        )}

        {/* 管理功能 */}
        <View style={{ padding: '20px 20px 0' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>管理功能</Text>
          <View style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { icon: Users, label: '用户管理', desc: '查看/审核用户', color: '#60a5fa', path: '/pages/admin/users/index' },
              { icon: BookOpen, label: '语料库', desc: '管理语料库', color: '#4ade80', path: '/pages/admin/lexicon-manage/index' },
              { icon: Database, label: '用户数据', desc: '查看详细数据', color: '#a855f7', path: '/pages/admin/user-data/index' },
              { icon: StickyNote, label: '快速笔记', desc: '管理用户笔记', color: '#38bdf8', path: '/pages/admin/quick-note-manage/index' },
              { icon: ScrollText, label: '审计日志', desc: '操作记录', color: '#f87171', path: '/pages/admin/audit/index' },
              { icon: TrendingUp, label: '共享统计', desc: '共享数据分析', color: '#06b6d4', path: '/pages/admin/share-stats/index' },
              { icon: Bell, label: '发送通知', desc: '给用户发消息', color: '#ec4899', path: '/pages/admin/send-notification/index' },
              { icon: Users, label: '客户管理', desc: '全局数据看板', color: '#60a5fa', path: '/pages/admin/customer-management/index' },
              { icon: Building2, label: '回收门店', desc: '全局数据看板', color: '#06b6d4', path: '/pages/admin/recycle-management/index' },
              { icon: UsersRound, label: '团队管理', desc: '管理团队和成员', color: '#4ade80', path: '/pages/admin/team-management/index' },
              { icon: ShoppingCart, label: '设备订单', desc: '求购转让管理', color: '#38bdf8', path: '/pages/equipment-orders/index' },
              { icon: BookOpen, label: '课程管理', desc: '上传培训课程', color: '#ef4444', path: '/pages/admin/course-manage/index' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <View
                  key={item.path}
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
                  onClick={() => Taro.navigateTo({ url: item.path })}
                >
                  <View style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <IconComp size={18} color={item.color} />
                  </View>
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff', display: 'block', textAlign: 'center' }}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 活跃用户排行 */}
        {userRankings.length > 0 && (
          <View style={{ padding: '20px 20px 0' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>活跃用户排行</Text>
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
