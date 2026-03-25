import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  RefreshCw,
  Users,
  UserCheck,
  MessageSquare,
  FileText,
  BookOpen,
  Share2,
  Download,
  Bell,
  TrendingUp,
  ChevronRight,
  TriangleAlert,
  FileChartColumn,
  Database,
  StickyNote,
  ScrollText,
  Building2,
  UsersRound,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

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

  const getRankStyle = (index: number) => {
    if (index === 0) return 'ranking-position-1';
    if (index === 1) return 'ranking-position-2';
    if (index === 2) return 'ranking-position-3';
    return '';
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <Text className="admin-title">数据监控</Text>
          <View
            style={{
              padding: '8px',
              borderRadius: '12px',
              backgroundColor: '#1a1a1d',
              opacity: loading ? 0.5 : 1,
            }}
            onClick={handleRefresh}
          >
            <RefreshCw size={24} color="#f59e0b" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        scrollY
        style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View className="admin-content">
          {/* 运营报告卡片 */}
          <View
            className="admin-card"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              border: 'none',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/admin/ai-report/index' })}
          >
            <View className="admin-card-header" style={{ borderBottom: 'none', marginBottom: 0 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <View
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                  }}
                >
                  <FileChartColumn size={28} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: '30px', fontWeight: '600', color: '#fff', display: 'block' }}>
                    运营报告
                  </Text>
                  <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    分析用户行为与系统运营数据
                  </Text>
                </View>
              </View>
              <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

          {/* 共享管理卡片 */}
          <View
            className="admin-card"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
              border: 'none',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/admin/share-manage/index' })}
          >
            <View className="admin-card-header" style={{ borderBottom: 'none', marginBottom: 0 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <View
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                  }}
                >
                  <Share2 size={28} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: '30px', fontWeight: '600', color: '#fff', display: 'block' }}>
                    共享管理
                  </Text>
                  <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    管理语料库共享权限
                  </Text>
                </View>
              </View>
              <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

          {/* 数据导出卡片 */}
          <View
            className="admin-card"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: 'none',
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/admin/data-export/index' })}
          >
            <View className="admin-card-header" style={{ borderBottom: 'none', marginBottom: 0 }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <View
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                  }}
                >
                  <Download size={28} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: '30px', fontWeight: '600', color: '#fff', display: 'block' }}>
                    数据导出
                  </Text>
                  <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                    导出用户数据、语料库、日志
                  </Text>
                </View>
              </View>
              <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

          {/* 待审核用户提示 */}
          {pendingUsersCount > 0 && (
            <View
              className="admin-card"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                border: 'none',
              }}
              onClick={() => Taro.navigateTo({ url: '/pages/admin/users/index?status=pending' })}
            >
              <View className="admin-card-header" style={{ borderBottom: 'none', marginBottom: 0 }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <View
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '12px',
                    }}
                  >
                    <TriangleAlert size={28} color="#fff" />
                  </View>
                  <View>
                    <Text style={{ fontSize: '30px', fontWeight: '600', color: '#fff', display: 'block' }}>
                      待审核用户
                    </Text>
                    <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                      有 {pendingUsersCount} 位用户等待审核
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '20px',
                  }}
                >
                  <Text style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>
                    {pendingUsersCount}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 统计卡片 */}
          {statistics && (
            <View style={{ marginTop: '16px' }}>
              <Text
                style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#fafafa',
                  marginBottom: '16px',
                  display: 'block',
                }}
              >
                全局统计
              </Text>
              <View className="stats-grid">
                <View className="stat-card">
                  <View className="stat-icon-wrapper stat-icon-primary">
                    <Users size={24} color="#f59e0b" />
                  </View>
                  <Text className="stat-value">{statistics.totalUsers}</Text>
                  <Text className="stat-label">总用户数</Text>
                </View>

                <View className="stat-card">
                  <View className="stat-icon-wrapper stat-icon-success">
                    <UserCheck size={24} color="#22c55e" />
                  </View>
                  <Text className="stat-value">{statistics.activeUsers}</Text>
                  <Text className="stat-label">活跃用户</Text>
                </View>

                <View className="stat-card">
                  <View className="stat-icon-wrapper stat-icon-info">
                    <MessageSquare size={24} color="#3b82f6" />
                  </View>
                  <Text className="stat-value">{statistics.totalConversations}</Text>
                  <Text className="stat-label">对话总数</Text>
                </View>

                <View className="stat-card">
                  <View className="stat-icon-wrapper stat-icon-warning">
                    <FileText size={24} color="#eab308" />
                  </View>
                  <Text className="stat-value">{statistics.totalMessages}</Text>
                  <Text className="stat-label">消息总数</Text>
                </View>
              </View>
            </View>
          )}

          {/* 管理功能入口 */}
          <View style={{ marginTop: '24px' }}>
            <Text
              style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#fafafa',
                marginBottom: '16px',
                display: 'block',
              }}
            >
              管理功能
            </Text>
            <View className="stats-grid">
              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/users/index' })}
              >
                <View className="stat-icon-wrapper stat-icon-info">
                  <Users size={24} color="#3b82f6" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  用户管理
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  查看/审核用户
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/lexicon-manage/index' })}
              >
                <View className="stat-icon-wrapper stat-icon-success">
                  <BookOpen size={24} color="#22c55e" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  语料库
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  管理语料库
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/user-data/index' })}
              >
                <View className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                  <Database size={24} color="#a855f7" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  用户数据
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  查看详细数据
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/quick-note-manage/index' })}
              >
                <View className="stat-icon-wrapper stat-icon-primary">
                  <StickyNote size={24} color="#f59e0b" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  快速笔记
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  管理用户笔记
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/audit/index' })}
              >
                <View className="stat-icon-wrapper stat-icon-danger">
                  <ScrollText size={24} color="#ef4444" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  审计日志
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  操作记录
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/share-stats/index' })}
              >
                <View className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                  <TrendingUp size={24} color="#06b6d4" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  共享统计
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  共享数据分析
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/send-notification/index' })}
              >
                <View className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                  <Bell size={24} color="#ec4899" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  发送通知
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  给用户发消息
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/customer-management/index' })}
              >
                <View className="stat-icon-wrapper stat-icon-info">
                  <Users size={24} color="#3b82f6" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  客户管理
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  全局数据看板
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/recycle-management/index' })}
              >
                <View className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                  <Building2 size={24} color="#06b6d4" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  回收门店
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  全局数据看板
                </Text>
              </View>

              <View
                className="stat-card"
                onClick={() => Taro.navigateTo({ url: '/pages/admin/team-management/index' })}
              >
                <View className="stat-icon-wrapper stat-icon-success">
                  <UsersRound size={24} color="#22c55e" />
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                  团队管理
                </Text>
                <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                  管理团队和成员
                </Text>
              </View>
            </View>
          </View>

          {/* 活跃用户排行 */}
          {userRankings.length > 0 && (
            <View style={{ marginTop: '24px' }}>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <Text
                  style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#fafafa',
                  }}
                >
                  活跃用户排行
                </Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={20} color="#f59e0b" />
                  <Text style={{ fontSize: '22px', color: '#f59e0b' }}>TOP {rankingLimit}</Text>
                </View>
              </View>

              <View className="ranking-list">
                {userRankings.map((ranking, index) => (
                  <View key={ranking.userId} className="ranking-item">
                    <View
                      className={`ranking-position ${getRankStyle(index)}`}
                    >
                      <Text style={{ fontSize: '22px', fontWeight: '700' }}>{index + 1}</Text>
                    </View>

                    <View className="ranking-user-info">
                      <Text className="ranking-username">{ranking.username}</Text>
                      {ranking.profile?.realName && (
                        <Text className="ranking-score">{ranking.profile.realName}</Text>
                      )}
                    </View>

                    <Text className="ranking-stat">{ranking.activityScore}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
