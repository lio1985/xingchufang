import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { ChevronRight, TrendingUp, Users, Target, Award, Crown, TrendingDown, Minus } from 'lucide-react-taro';

interface TeamStats {
  totalTargets: number;
  achievedTargets: number;
  totalTargetAmount: number;
  totalAchievedAmount: number;
  overallProgress: number;
  byMember: Array<{
    userId: string;
    userName: string;
    targetAmount: number;
    achievedAmount: number;
    progress: number;
    rank: number;
  }>;
}

interface TargetProgress {
  target: {
    target_type: 'monthly' | 'quarterly' | 'yearly';
    target_year: number;
    target_month?: number;
    target_quarter?: number;
    target_amount: number;
  };
  currentAmount: number;
  amountProgress: number;
  timeProgress: number;
  isAhead: boolean;
}

const typeLabels: Record<string, string> = {
  monthly: '月度',
  quarterly: '季度',
  yearly: '年度',
};

export default function SalesDashboard() {
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [myProgress, setMyProgress] = useState<TargetProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'personal' | 'team'>('personal');
  const [currentPeriod, setCurrentPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const loadTeamStats = async () => {
    try {
      const now = new Date();
      const res = await Network.request({
        url: '/api/sales-targets/team/stats',
        data: {
          year: now.getFullYear(),
          ...(currentPeriod === 'month' && { month: now.getMonth() + 1 }),
          ...(currentPeriod === 'quarter' && { quarter: Math.floor(now.getMonth() / 3) + 1 }),
        }
      });
      console.log('[SalesDashboard] Team stats:', res.data);

      if (res.data.code === 200) {
        setTeamStats(res.data.data);
      }
    } catch (err) {
      console.error('[SalesDashboard] Team stats error:', err);
    }
  };

  const loadMyProgress = async () => {
    try {
      const res = await Network.request({
        url: '/api/sales-targets/my/progress'
      });
      console.log('[SalesDashboard] My progress:', res.data);

      if (res.data.code === 200) {
        setMyProgress(res.data.data || []);
      }
    } catch (err) {
      console.error('[SalesDashboard] My progress error:', err);
    }
  };

  useEffect(() => {
    loadMyProgress();
    loadTeamStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPeriod]);

  // 获取当前期间的进度
  const getCurrentProgress = () => {
    const now = new Date();
    return myProgress.find(p => {
      if (currentPeriod === 'month') {
        return p.target.target_type === 'monthly' && 
               p.target.target_year === now.getFullYear() && 
               p.target.target_month === now.getMonth() + 1;
      } else if (currentPeriod === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return p.target.target_type === 'quarterly' && 
               p.target.target_year === now.getFullYear() && 
               p.target.target_quarter === quarter;
      } else {
        return p.target.target_type === 'yearly' && p.target.target_year === now.getFullYear();
      }
    });
  };

  const currentProgress = getCurrentProgress();

  // 计算趋势（与上一期比较）
  const getTrend = () => {
    if (myProgress.length < 2) return null;
    const sorted = [...myProgress].sort((a, b) => b.amountProgress - a.amountProgress);
    const current = sorted[0];
    const previous = sorted[1];
    if (!current || !previous) return null;
    
    const diff = current.amountProgress - previous.amountProgress;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
      diff: Math.abs(diff),
    };
  };

  const trend = getTrend();

  return (
    <View className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-800 to-slate-900">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-slate-900/95 sticky top-0 z-20 border-b border-slate-700">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-3">
            <View
              onClick={() => Taro.navigateBack()}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center active:scale-95"
            >
              <ChevronRight size={18} color="#94a3b8" />
            </View>
            <Text className="block text-white text-xl font-bold">业绩看板</Text>
          </View>
        </View>

        {/* 期间选择 */}
        <View className="flex gap-2 mb-4">
          {[
            { key: 'month', label: '本月' },
            { key: 'quarter', label: '本季' },
            { key: 'year', label: '本年' },
          ].map((period) => (
            <View
              key={period.key}
              onClick={() => setCurrentPeriod(period.key as any)}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${
                currentPeriod === period.key
                  ? 'bg-slate-9000/20 border border-blue-500/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <Text className={`block text-sm font-medium ${currentPeriod === period.key ? 'text-blue-400' : 'text-slate-400'}`}>
                {period.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Tab切换 */}
        <View className="flex gap-2">
          {[
            { key: 'personal', label: '个人业绩' },
            { key: 'team', label: '团队排行' },
          ].map((tab) => (
            <View
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-500/20 border border-emerald-500/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <Text className={`block text-sm font-medium ${activeTab === tab.key ? 'text-emerald-400' : 'text-slate-400'}`}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 内容区域 */}
      <ScrollView
        scrollY
        className="flex-1 px-4 py-4"
        style={{ height: 'calc(100vh - 180px)' }}
      >
        {activeTab === 'personal' && (
          <View className="space-y-4">
            {/* 核心指标卡片 */}
            <View className="grid grid-cols-2 gap-3">
              <View className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-4 border border-sky-500/30">
                <View className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} color="#60a5fa" />
                  <Text className="block text-slate-300 text-xs">完成进度</Text>
                </View>
                <View className="flex items-baseline gap-1">
                  <Text className="block text-white text-3xl font-bold">
                    {currentProgress?.amountProgress || 0}%
                  </Text>
                  {trend && (
                    <View className="flex items-center">
                      {trend.direction === 'up' && <TrendingUp size={14} color="#34d399" />}
                      {trend.direction === 'down' && <TrendingDown size={14} color="#f87171" />}
                      {trend.direction === 'flat' && <Minus size={14} color="#94a3b8" />}
                      <Text className={`block text-xs ml-0.5 ${
                        trend.direction === 'up' ? 'text-emerald-400' :
                        trend.direction === 'down' ? 'text-red-400' :
                        'text-slate-400'
                      }`}
                      >{trend.diff}%</Text>
                    </View>
                  )}
                </View>
                <Text className="block text-slate-400 text-xs mt-1">
                  {currentProgress ? `¥${(currentProgress.currentAmount / 10000).toFixed(1)}万 / ¥${(currentProgress.target.target_amount / 10000).toFixed(1)}万` : '暂无目标'}
                </Text>
              </View>
              
              <View className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl p-4 border border-emerald-500/30">
                <View className="flex items-center gap-2 mb-2">
                  <Target size={16} color="#34d399" />
                  <Text className="block text-slate-300 text-xs">目标状态</Text>
                </View>
                <Text className="block text-white text-3xl font-bold">
                  {currentProgress ? (currentProgress.isAhead ? '超前' : '追赶') : '未设'}
                </Text>
                <Text className="block text-slate-400 text-xs mt-1">
                  {currentProgress ? (currentProgress.isAhead ? '完成度超前时间进度' : '需加快进度') : '请设置业绩目标'}
                </Text>
              </View>
            </View>

            {/* 进度详情 */}
            {currentProgress && (
              <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <Text className="block text-white font-semibold mb-4">
                  {currentProgress.target.target_year}年
                  {currentProgress.target.target_month && `${currentProgress.target.target_month}月`}
                  {currentProgress.target.target_quarter && `Q${currentProgress.target.target_quarter}`}
                  {typeLabels[currentProgress.target.target_type]}目标
                </Text>
                
                {/* 金额进度条 */}
                <View className="mb-4">
                  <View className="flex items-center justify-between mb-2">
                    <Text className="block text-slate-400 text-sm">金额完成度</Text>
                    <Text className="block text-white font-semibold">{currentProgress.amountProgress}%</Text>
                  </View>
                  <View className="h-4 bg-slate-800 rounded-full overflow-hidden">
                    <View
                      className={`h-full rounded-full ${currentProgress.amountProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(currentProgress.amountProgress, 100)}%` }}
                    />
                  </View>
                  <Text className="block text-slate-400 text-xs mt-2 text-right">
                    已完成 ¥{(currentProgress.currentAmount / 10000).toFixed(1)}万
                  </Text>
                </View>

                {/* 时间进度对比 */}
                <View className="bg-slate-800/30 rounded-xl p-3">
                  <View className="flex items-center justify-between mb-2">
                    <Text className="block text-slate-400 text-xs">时间进度</Text>
                    <Text className="block text-slate-300 text-xs">{currentProgress.timeProgress}%</Text>
                  </View>
                  <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <View className="h-full bg-slate-400 rounded-full" style={{ width: `${currentProgress.timeProgress}%` }} />
                  </View>
                  <Text className={`block text-xs mt-2 ${currentProgress.isAhead ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentProgress.isAhead 
                      ? `✓ 超前 ${currentProgress.amountProgress - currentProgress.timeProgress}%` 
                      : `⚠ 落后 ${currentProgress.timeProgress - currentProgress.amountProgress}%`}
                  </Text>
                </View>
              </View>
            )}

            {/* 历史表现 */}
            {myProgress.length > 0 && (
              <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <Text className="block text-white font-semibold mb-4">历史目标完成情况</Text>
                <View className="space-y-3">
                  {myProgress.slice(0, 5).map((progress, idx) => (
                    <View key={idx} className="flex items-center gap-3">
                      <View className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        progress.amountProgress >= 100 ? 'bg-emerald-500/20' :
                        progress.amountProgress >= 60 ? 'bg-slate-9000/20' :
                        'bg-amber-500/20'
                      }`}
                      >
                        {progress.amountProgress >= 100 ? (
                          <Crown size={14} color="#34d399" />
                        ) : (
                          <Text className={`block text-xs font-bold ${
                            progress.amountProgress >= 60 ? 'text-blue-400' : 'text-amber-400'
                          }`}
                          >{idx + 1}</Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <View className="flex items-center justify-between">
                          <Text className="block text-slate-300 text-sm">
                            {progress.target.target_year}年
                            {progress.target.target_month && `${progress.target.target_month}月`}
                            {progress.target.target_quarter && `Q${progress.target.target_quarter}`}
                          </Text>
                          <Text className={`block font-semibold ${
                            progress.amountProgress >= 100 ? 'text-emerald-400' :
                            progress.amountProgress >= 60 ? 'text-blue-400' :
                            'text-amber-400'
                          }`}
                          >{progress.amountProgress}%</Text>
                        </View>
                        <View className="h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <View
                            className={`h-full rounded-full ${
                              progress.amountProgress >= 100 ? 'bg-emerald-500' :
                              progress.amountProgress >= 60 ? 'bg-blue-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(progress.amountProgress, 100)}%` }}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'team' && (
          <View className="space-y-4">
            {/* 团队总览 */}
            {teamStats && (
              <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <Text className="block text-white font-semibold mb-4">团队总览</Text>
                <View className="grid grid-cols-3 gap-4">
                  <View className="text-center">
                    <Text className="block text-white text-xl font-bold">{teamStats.totalTargets}</Text>
                    <Text className="block text-slate-400 text-xs mt-1">目标数</Text>
                  </View>
                  <View className="text-center">
                    <Text className="block text-emerald-400 text-xl font-bold">{teamStats.achievedTargets}</Text>
                    <Text className="block text-slate-400 text-xs mt-1">已完成</Text>
                  </View>
                  <View className="text-center">
                    <Text className="block text-blue-400 text-xl font-bold">{teamStats.overallProgress}%</Text>
                    <Text className="block text-slate-400 text-xs mt-1">总进度</Text>
                  </View>
                </View>
                <View className="mt-4 pt-4 border-t border-slate-700">
                  <View className="flex items-center justify-between">
                    <Text className="block text-slate-400 text-sm">团队总目标</Text>
                    <Text className="block text-white font-semibold">
                      ¥{(teamStats.totalAchievedAmount / 10000).toFixed(1)}万 / ¥{(teamStats.totalTargetAmount / 10000).toFixed(1)}万
                    </Text>
                  </View>
                  <View className="h-3 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <View
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(teamStats.overallProgress, 100)}%` }}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* 排行榜 */}
            {teamStats && teamStats.byMember.length > 0 && (
              <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <View className="flex items-center gap-2 mb-4">
                  <Award size={18} color="#fbbf24" />
                  <Text className="block text-white font-semibold">业绩排行榜</Text>
                </View>
                <View className="space-y-3">
                  {teamStats.byMember.map((member) => (
                    <View key={member.userId} className="flex items-center gap-3 py-2 border-b border-slate-700 last:border-0">
                      {/* 排名 */}
                      <View className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        member.rank === 1 ? 'bg-yellow-500/20' :
                        member.rank === 2 ? 'bg-slate-300/20' :
                        member.rank === 3 ? 'bg-amber-600/20' :
                        'bg-slate-800'
                      }`}
                      >
                        {member.rank <= 3 ? (
                          <Crown size={14} color={
                            member.rank === 1 ? '#facc15' :
                            member.rank === 2 ? '#cbd5e1' :
                            '#d97706'
                          }
                          />
                        ) : (
                          <Text className="block text-slate-400 font-bold">{member.rank}</Text>
                        )}
                      </View>

                      {/* 头像 */}
                      <View className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Text className="block text-white font-bold">{member.userName.charAt(0)}</Text>
                      </View>

                      {/* 信息 */}
                      <View className="flex-1">
                        <Text className="block text-white font-medium">{member.userName}</Text>
                        <Text className="block text-slate-400 text-xs">
                          ¥{(member.achievedAmount / 10000).toFixed(1)}万 / ¥{(member.targetAmount / 10000).toFixed(1)}万
                        </Text>
                      </View>

                      {/* 进度 */}
                      <View className="text-right">
                        <Text className={`block font-bold ${
                          member.progress >= 100 ? 'text-emerald-400' :
                          member.progress >= 60 ? 'text-blue-400' :
                          'text-amber-400'
                        }`}
                        >{member.progress}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(!teamStats || teamStats.byMember.length === 0) && (
              <View className="py-20 text-center">
                <Users size={48} color="#475569" className="mx-auto mb-4" />
                <Text className="block text-slate-400">暂无团队数据</Text>
                <Text className="block text-slate-400 text-sm mt-2">团队成员设置目标后将显示排行</Text>
              </View>
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
