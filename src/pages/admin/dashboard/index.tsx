import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
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
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none',
      });
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

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <View className="flex items-center gap-3 mb-2">
        <View className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </View>
        <Text className="text-slate-400 text-sm">{label}</Text>
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
    </View>
  );

  const RankingItem = ({ ranking, index }: { ranking: UserRanking; index: number }) => {
    const getRankColor = (idx: number) => {
      if (idx === 0) return 'bg-yellow-500';
      if (idx === 1) return 'bg-gray-400';
      if (idx === 2) return 'bg-orange-500';
      return 'bg-slate-800';
    };

    const getRankText = (idx: number) => {
      if (idx < 3) return idx + 1;
      return index + 1;
    };

    return (
      <View className="bg-slate-800 rounded-lg p-4 mb-3 border border-slate-700">
        <View className="flex items-center gap-3">
          <View className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(index)}`}>
            <Text className="text-white font-bold text-sm">{getRankText(index)}</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-white font-semibold block truncate">{ranking.username}</Text>
            {ranking.profile?.realName && (
              <Text className="text-slate-400 text-sm block truncate">{ranking.profile.realName}</Text>
            )}
          </View>
          <View className="text-right">
            <Text className="text-blue-400 font-bold block">{ranking.activityScore}</Text>
            <Text className="text-slate-400 text-xs">活跃分</Text>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs">
          <View className="flex items-center gap-1">
            <Text>💬</Text>
            <Text className="text-slate-400">对话: </Text>
            <Text className="text-white">{ranking.statistics.conversationCount}</Text>
          </View>
          <View className="flex items-center gap-1">
            <Text>💬</Text>
            <Text className="text-slate-400">消息: </Text>
            <Text className="text-white">{ranking.statistics.messageCount}</Text>
          </View>
          <View className="flex items-center gap-1">
            <Text>📄</Text>
            <Text className="text-slate-400">文件: </Text>
            <Text className="text-white">{ranking.statistics.fileCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部标题栏 */}
      <View className="sticky top-0 z-10 bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <Text className="text-white text-lg font-bold">数据监控</Text>
        <View className={`p-2 rounded-lg bg-slate-800 ${loading ? 'opacity-50' : ''}`} onClick={handleRefresh}>
          <Text>🔄</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        scrollY
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View className="px-4 py-3 space-y-4">
          {/* 系统报告卡片 */}
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/admin/ai-report/index' })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 relative overflow-hidden"
          >
            <View className="absolute top-0 right-0 w-32 h-32 bg-slate-800 opacity-5 rounded-full -mr-16 -mt-16"></View>
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-slate-800 opacity-5 rounded-full -ml-12 -mb-12"></View>
            <View className="relative z-10">
              <View className="flex items-center gap-3 mb-2">
                <View className="p-2 bg-slate-800 bg-opacity-20 rounded-lg">
                  <Text>📁</Text>
                </View>
                <Text className="text-white text-base font-semibold">运营报告</Text>
              </View>
              <Text className="text-white text-opacity-80 text-xs mb-3">
                分析用户行为与系统运营数据，一键创建专业运营报告
              </Text>
              <View className="flex items-center gap-2">
                <Text>📊</Text>
                <Text className="text-white text-xs">点击创建报告</Text>
              </View>
            </View>
          </View>

          {/* 共享管理卡片 */}
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/admin/share-manage/index' })}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 relative overflow-hidden"
          >
            <View className="absolute top-0 right-0 w-32 h-32 bg-slate-800 opacity-5 rounded-full -mr-16 -mt-16"></View>
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-slate-800 opacity-5 rounded-full -ml-12 -mb-12"></View>
            <View className="relative z-10">
              <View className="flex items-center gap-3 mb-2">
                <View className="p-2 bg-slate-800 bg-opacity-20 rounded-lg">
                  <Text>🔗</Text>
                </View>
                <Text className="text-white text-base font-semibold">共享管理</Text>
              </View>
              <Text className="text-white text-opacity-80 text-xs mb-3">
                管理语料库共享权限，支持用户共享和全局共享设置
              </Text>
              <View className="flex items-center gap-2">
                <Text>🌐</Text>
                <Text className="text-white text-xs">点击管理共享</Text>
              </View>
            </View>
          </View>

          {/* 数据导出卡片 */}
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/admin/data-export/index' })}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 relative overflow-hidden"
          >
            <View className="absolute top-0 right-0 w-32 h-32 bg-slate-800 opacity-5 rounded-full -mr-16 -mt-16"></View>
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-slate-800 opacity-5 rounded-full -ml-12 -mb-12"></View>
            <View className="relative z-10">
              <View className="flex items-center gap-3 mb-2">
                <View className="p-2 bg-slate-800 bg-opacity-20 rounded-lg">
                  <Text>⬇</Text>
                </View>
                <Text className="text-white text-base font-semibold">数据导出</Text>
              </View>
              <Text className="text-white text-opacity-80 text-xs mb-3">
                导出用户数据、语料库、操作日志等，支持 JSON 和 CSV 格式
              </Text>
              <View className="flex items-center gap-2">
                <Text>📊</Text>
                <Text className="text-white text-xs">点击导出数据</Text>
              </View>
            </View>
          </View>

          {/* 待审核用户提示卡片 */}
          {pendingUsersCount > 0 && (
            <View
              onClick={() => Taro.navigateTo({ url: '/pages/admin/users/index?status=pending' })}
              className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 relative overflow-hidden border border-amber-400/30"
            >
              <View className="absolute top-0 right-0 w-32 h-32 bg-slate-800 opacity-5 rounded-full -mr-16 -mt-16"></View>
              <View className="absolute bottom-0 left-0 w-24 h-24 bg-slate-800 opacity-5 rounded-full -ml-12 -mb-12"></View>
              <View className="relative z-10">
                <View className="flex items-center gap-3 mb-2">
                  <View className="p-2 bg-slate-800 bg-opacity-20 rounded-lg">
                    <Text>🔔</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold block">待审核用户</Text>
                    <Text className="text-white text-opacity-80 text-xs">
                      有 {pendingUsersCount} 位用户等待审核
                    </Text>
                  </View>
                  <View className="bg-slate-800 bg-opacity-20 px-3 py-1 rounded-full">
                    <Text className="text-white font-bold">{pendingUsersCount}</Text>
                  </View>
                </View>
                <Text className="text-white text-xs mb-2 opacity-90">
                  点击前往审核用户，批准或拒绝用户访问权限
                </Text>
                <View className="flex items-center gap-2">
                  <Text>👤</Text>
                  <Text className="text-white text-xs">立即审核</Text>
                </View>
              </View>
            </View>
          )}

          {/* 管理功能入口组 */}
          <View>
            <Text className="text-white font-semibold mb-3 block">管理功能</Text>
            <View className="grid grid-cols-2 gap-3">
              {/* 用户管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/users/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-blue-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-slate-9000/20 rounded-lg">
                      <Text>👤</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">用户管理</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">查看/审核用户</Text>
                </View>
              </View>

              {/* 语料库管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/lexicon-manage/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-emerald-500/20 rounded-lg">
                      <Text>📖</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">语料库</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">管理语料库</Text>
                </View>
              </View>

              {/* 用户数据查看 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/user-data/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-purple-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-purple-500/20 rounded-lg">
                      <Text>💾</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">用户数据</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">查看详细数据</Text>
                </View>
              </View>

              {/* 快速笔记管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/quick-note-manage/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-amber-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-amber-500/20 rounded-lg">
                      <Text>📁</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">快速笔记</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">管理用户笔记</Text>
                </View>
              </View>

              {/* 审计日志 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/audit/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-red-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-red-500/20 rounded-lg">
                      <Text>📋</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">审计日志</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">操作记录</Text>
                </View>
              </View>

              {/* 共享统计 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/share-stats/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-cyan-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-cyan-500/20 rounded-lg">
                      <Text>📈</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">共享统计</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">共享数据分析</Text>
                </View>
              </View>

              {/* 发送通知 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/send-notification/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-pink-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-pink-500/20 rounded-lg">
                      <Text>💬</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">发送通知</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">给用户发消息</Text>
                </View>
              </View>

              {/* 客户信息管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/customer-management/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-indigo-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-indigo-500/20 rounded-lg">
                      <Text>👤</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">客户管理</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">全局数据看板</Text>
                </View>
              </View>

              {/* 知识分享管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin-knowledge-share/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-pink-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-pink-500/20 rounded-lg">
                      <Text>📖</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">知识分享</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">管理知识分享</Text>
                </View>
              </View>

              {/* 回收门店管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/recycle-management/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-cyan-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-cyan-500/20 rounded-lg">
                      <Text>🏪</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">回收门店</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">全局数据看板</Text>
                </View>
              </View>

              {/* 团队管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/admin/team-management/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-emerald-500/20 rounded-lg">
                      <Text>👤</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">团队管理</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">管理团队和成员</Text>
                </View>
              </View>

              {/* 直播数据管理 */}
              <View
                onClick={() => Taro.navigateTo({ url: '/pages/live-data/admin/index' })}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 border border-slate-700 relative overflow-hidden active:scale-95 transition-transform"
              >
                <View className="absolute top-0 right-0 w-20 h-20 bg-rose-500 opacity-5 rounded-full -mr-10 -mt-10"></View>
                <View className="relative z-10">
                  <View className="flex items-center gap-2 mb-2">
                    <View className="p-2 bg-rose-500/20 rounded-lg">
                      <Text>🎬</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">直播数据</Text>
                  </View>
                  <Text className="text-slate-400 text-xs">查看直播统计</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 全局统计卡片 */}
          <View>
            <Text className="text-white font-semibold mb-3 block">全局统计</Text>
            <View className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Users}
                label="总用户数"
                value={statistics?.totalUsers || 0}
                color="bg-blue-500"
              />
              <StatCard
                icon={Users}
                label="活跃用户"
                value={statistics?.activeUsers || 0}
                color="bg-green-500"
              />
              <StatCard
                icon={MessageSquare}
                label="总对话数"
                value={statistics?.totalConversations || 0}
                color="bg-purple-500"
              />
              <StatCard
                icon={MessageSquare}
                label="总消息数"
                value={statistics?.totalMessages || 0}
                color="bg-pink-500"
              />
              <StatCard
                icon={FileText}
                label="总文件数"
                value={statistics?.totalFiles || 0}
                color="bg-cyan-500"
              />
              <StatCard
                icon={FileText}
                label="总语料数"
                value={statistics?.totalLexicons || 0}
                color="bg-orange-500"
              />
            </View>
          </View>

          {/* 用户分布 */}
          <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Text className="text-white font-semibold mb-3 block">用户状态分布</Text>
            <View className="space-y-2">
              <View className="flex items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-green-500"></View>
                <Text className="text-slate-300 flex-1">正常</Text>
                <Text className="text-white font-semibold">{statistics?.activeUsers || 0}</Text>
              </View>
              <View className="flex items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-yellow-500"></View>
                <Text className="text-slate-300 flex-1">禁用</Text>
                <Text className="text-white font-semibold">{statistics?.disabledUsers || 0}</Text>
              </View>
              <View className="flex items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-red-500"></View>
                <Text className="text-slate-300 flex-1">已删除</Text>
                <Text className="text-white font-semibold">{statistics?.deletedUsers || 0}</Text>
              </View>
            </View>
          </View>

          {/* 活跃用户排行 */}
          <View>
            <View className="flex justify-between items-center mb-3">
              <View className="flex items-center gap-2">
                <Text>🏆</Text>
                <Text className="text-white font-semibold">活跃用户排行</Text>
              </View>
              <Text className="text-slate-400 text-sm">Top {rankingLimit}</Text>
            </View>

            {userRankings.length > 0 ? (
              <View>
                {userRankings.map((ranking, index) => (
                  <RankingItem key={ranking.userId} ranking={ranking} index={index} />
                ))}
              </View>
            ) : (
              <View className="bg-slate-800 rounded-lg p-8 text-center">
                <Text>🏆</Text>
                <Text className="text-slate-400 block">暂无排行数据</Text>
              </View>
            )}
          </View>

          {/* 更新时间 */}
          <View className="text-center py-4">
            <Text className="text-slate-400 text-xs">
              最后更新: {new Date().toLocaleString('zh-CN')}
            </Text>
          </View>
        </View>

        {/* 底部空间 */}
        <View className="h-20"></View>
      </ScrollView>
    </View>
  );
}
