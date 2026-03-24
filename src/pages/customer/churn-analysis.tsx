import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { ChevronRight, TrendingUp, Target, Award, Phone, MessageSquare, MapPin, Mail, CircleEllipsis, Calendar, Check, MoveHorizontal } from 'lucide-react-taro';

interface HandleResultStats {
  totalWarnings: number;
  handledCount: number;
  successCount: number;
  convertedCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;
  conversionRate: number;
  byActionType: Record<string, { count: number; successRate: number }>;
  byRiskLevel: Record<string, { count: number; successRate: number }>;
  monthlyTrend: Array<{
    month: string;
    warnings: number;
    handled: number;
    success: number;
    converted: number;
  }>;
}

interface HandlerRanking {
  handlerId: string;
  handlerName: string;
  totalHandled: number;
  successCount: number;
  convertedCount: number;
  successRate: number;
}

const actionLabels: Record<string, string> = {
  phone: '电话回访',
  visit: '上门拜访',
  message: '微信/短信',
  email: '邮件沟通',
  other: '其他方式',
};

const actionIcons: Record<string, any> = {
  phone: Phone,
  visit: MapPin,
  message: MessageSquare,
  email: Mail,
  other: CircleEllipsis,
};

const riskLevelLabels: Record<string, string> = {
  yellow: '低危预警',
  orange: '中危预警',
  red: '高危预警',
};

export default function ChurnAnalysis() {
  const [stats, setStats] = useState<HandleResultStats | null>(null);
  const [rankings, setRankings] = useState<HandlerRanking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'ranking'>('overview');

  const loadStats = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await Network.request({
        url: '/api/customers/churn-warning/analysis/stats'
      });
      console.log('[ChurnAnalysis] Stats:', res.data);

      if (res.data.code === 200) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('[ChurnAnalysis] Load stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async () => {
    try {
      const res = await Network.request({
        url: '/api/customers/churn-warning/analysis/ranking',
        data: { limit: 10 }
      });
      console.log('[ChurnAnalysis] Rankings:', res.data);

      if (res.data.code === 200) {
        setRankings(res.data.data || []);
      }
    } catch (err) {
      console.error('[ChurnAnalysis] Load rankings error:', err);
    }
  };

  useEffect(() => {
    loadStats();
    loadRankings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 计算柱状图高度
  const getBarHeight = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.max(20, (value / max) * 100);
  };

  return (
    <View className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-800 to-slate-900">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-slate-900/95 sticky top-0 z-20 border-b border-slate-700">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View
              onClick={() => Taro.navigateBack()}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center active:scale-95"
            >
              <ChevronRight size={18} color="#94a3b8" />
            </View>
            <Text className="block text-white text-xl font-bold">预警效果分析</Text>
          </View>
          <View
            onClick={loadStats}
            className="w-9 h-9 rounded-full bg-slate-9000/20 flex items-center justify-center active:scale-95"
          >
            <TrendingUp size={18} color="#60a5fa" />
          </View>
        </View>

        {/* Tab切换 */}
        <View className="flex gap-2 mt-4">
          {[
            { key: 'overview', label: '总览' },
            { key: 'trend', label: '趋势' },
            { key: 'ranking', label: '排行' },
          ].map((tab) => (
            <View
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-9000/20 border border-blue-500/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <Text className={`block text-sm font-medium ${activeTab === tab.key ? 'text-blue-400' : 'text-slate-400'}`}>
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
        style={{ height: 'calc(100vh - 140px)' }}
      >
        {!stats ? (
          <View className="py-20 text-center">
            <Text className="block text-slate-400">加载中...</Text>
          </View>
        ) : (
          <>
            {/* 总览 Tab */}
            {activeTab === 'overview' && (
              <View className="space-y-4">
                {/* 核心指标卡片 */}
                <View className="grid grid-cols-2 gap-3">
                  <View className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-4 border border-sky-500/30">
                    <View className="flex items-center gap-2 mb-2">
                      <Target size={16} color="#60a5fa" />
                      <Text className="block text-slate-300 text-xs">挽回成功率</Text>
                    </View>
                    <Text className="block text-white text-2xl font-bold">{stats.successRate}%</Text>
                    <Text className="block text-slate-400 text-xs mt-1">
                      {stats.successCount + stats.convertedCount}/{stats.handledCount} 成功挽回
                    </Text>
                  </View>
                  <View className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl p-4 border border-emerald-500/30">
                    <View className="flex items-center gap-2 mb-2">
                      <Check size={16} color="#34d399" />
                      <Text className="block text-slate-300 text-xs">成交转化率</Text>
                    </View>
                    <Text className="block text-white text-2xl font-bold">{stats.conversionRate}%</Text>
                    <Text className="block text-slate-400 text-xs mt-1">
                      {stats.convertedCount} 客户已成交
                    </Text>
                  </View>
                </View>

                {/* 处理统计 */}
                <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                  <Text className="block text-white font-semibold mb-4">处理统计</Text>
                  <View className="grid grid-cols-4 gap-3">
                    <View className="text-center">
                      <Text className="block text-white text-xl font-bold">{stats.totalWarnings}</Text>
                      <Text className="block text-slate-400 text-xs mt-1">总预警</Text>
                    </View>
                    <View className="text-center">
                      <Text className="block text-blue-400 text-xl font-bold">{stats.handledCount}</Text>
                      <Text className="block text-slate-400 text-xs mt-1">已处理</Text>
                    </View>
                    <View className="text-center">
                      <Text className="block text-amber-400 text-xl font-bold">{stats.pendingCount}</Text>
                      <Text className="block text-slate-400 text-xs mt-1">待跟进</Text>
                    </View>
                    <View className="text-center">
                      <Text className="block text-slate-400 text-xl font-bold">{stats.failedCount}</Text>
                      <Text className="block text-slate-400 text-xs mt-1">挽回失败</Text>
                    </View>
                  </View>
                </View>

                {/* 处理方式效果 */}
                {Object.keys(stats.byActionType).length > 0 && (
                  <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                    <Text className="block text-white font-semibold mb-4">处理方式效果</Text>
                    <View className="space-y-3">
                      {Object.entries(stats.byActionType)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([action, data]) => {
                          const Icon = actionIcons[action] || MoveHorizontal;
                          return (
                            <View key={action} className="flex items-center gap-3">
                              <View className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                <Icon size={18} color="#94a3b8" />
                              </View>
                              <View className="flex-1">
                                <View className="flex items-center justify-between mb-1">
                                  <Text className="block text-slate-300 text-sm">{actionLabels[action] || action}</Text>
                                  <Text className="block text-slate-400 text-xs">{data.count}次</Text>
                                </View>
                                <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <View
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${data.successRate}%` }}
                                  />
                                </View>
                                <Text className="block text-blue-400 text-xs mt-1">成功率 {data.successRate}%</Text>
                              </View>
                            </View>
                          );
                        })}
                    </View>
                  </View>
                )}

                {/* 风险等级处理情况 */}
                {Object.keys(stats.byRiskLevel).length > 0 && (
                  <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                    <Text className="block text-white font-semibold mb-4">风险等级处理情况</Text>
                    <View className="space-y-3">
                      {Object.entries(stats.byRiskLevel).map(([level, data]) => (
                        <View key={level} className="flex items-center gap-3">
                          <View className={`w-3 h-3 rounded-full ${
                            level === 'red' ? 'bg-red-500' :
                            level === 'orange' ? 'bg-amber-500' :
                            'bg-yellow-500'
                          }`}
                          />
                          <View className="flex-1">
                            <View className="flex items-center justify-between mb-1">
                              <Text className="block text-slate-300 text-sm">{riskLevelLabels[level]}</Text>
                              <Text className="block text-slate-400 text-xs">{data.count}个</Text>
                            </View>
                            <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <View
                                className={`h-full rounded-full ${
                                  level === 'red' ? 'bg-red-500' :
                                  level === 'orange' ? 'bg-amber-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${data.successRate}%` }}
                              />
                            </View>
                            <Text className={`block text-xs mt-1 ${
                              level === 'red' ? 'text-red-400' :
                              level === 'orange' ? 'text-amber-400' :
                              'text-yellow-400'
                            }`}
                            >成功率 {data.successRate}%</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 趋势 Tab */}
            {activeTab === 'trend' && (
              <View className="space-y-4">
                {stats.monthlyTrend.length > 0 ? (
                  <>
                    {/* 月度趋势图 */}
                    <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <Text className="block text-white font-semibold mb-4">近6个月趋势</Text>
                      <View className="flex items-end justify-between h-40 gap-2">
                        {stats.monthlyTrend.map((month, idx) => {
                          const maxWarnings = Math.max(...stats.monthlyTrend.map(m => m.warnings), 1);
                          return (
                            <View key={idx} className="flex-1 flex flex-col items-center">
                              <View className="w-full flex justify-center gap-0.5 items-end h-32">
                                <View
                                  className="w-3 bg-blue-500/50 rounded-t"
                                  style={{ height: `${getBarHeight(month.warnings, maxWarnings)}%` }}
                                />
                                <View
                                  className="w-3 bg-emerald-500/70 rounded-t"
                                  style={{ height: `${getBarHeight(month.success + month.converted, maxWarnings)}%` }}
                                />
                              </View>
                              <Text className="block text-slate-400 text-xs mt-2">
                                {month.month.slice(5)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <View className="flex items-center justify-center gap-6 mt-4">
                        <View className="flex items-center gap-2">
                          <View className="w-3 h-3 bg-blue-500/50 rounded" />
                          <Text className="block text-slate-400 text-xs">预警数</Text>
                        </View>
                        <View className="flex items-center gap-2">
                          <View className="w-3 h-3 bg-emerald-500/70 rounded" />
                          <Text className="block text-slate-400 text-xs">挽回数</Text>
                        </View>
                      </View>
                    </View>

                    {/* 月度详细数据 */}
                    <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                      <Text className="block text-white font-semibold mb-4">月度详细</Text>
                      <View className="space-y-3">
                        {stats.monthlyTrend.map((month, idx) => (
                          <View key={idx} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                            <View className="flex items-center gap-2">
                              <Calendar size={14} color="#64748b" />
                              <Text className="block text-slate-300 text-sm">{month.month}</Text>
                            </View>
                            <View className="flex items-center gap-4">
                              <Text className="block text-blue-400 text-sm">预警 {month.warnings}</Text>
                              <Text className="block text-emerald-400 text-sm">挽回 {month.success + month.converted}</Text>
                              <Text className="block text-slate-400 text-sm">
                                {month.warnings > 0 ? Math.round(((month.success + month.converted) / month.warnings) * 100) : 0}%
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </>
                ) : (
                  <View className="py-20 text-center">
                    <Calendar size={48} color="#475569" className="mx-auto mb-4" />
                    <Text className="block text-slate-400">暂无趋势数据</Text>
                  </View>
                )}
              </View>
            )}

            {/* 排行 Tab */}
            {activeTab === 'ranking' && (
              <View className="space-y-4">
                {rankings.length > 0 ? (
                  <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                    <Text className="block text-white font-semibold mb-4">处理排行榜</Text>
                    <View className="space-y-3">
                      {rankings.map((handler, idx) => (
                        <View
                          key={handler.handlerId}
                          className="flex items-center gap-3 py-3 border-b border-slate-700 last:border-0"
                        >
                          {/* 排名 */}
                          <View className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            idx === 0 ? 'bg-yellow-500/20' :
                            idx === 1 ? 'bg-slate-400/20' :
                            idx === 2 ? 'bg-amber-600/20' :
                            'bg-slate-800'
                          }`}
                          >
                            <Text className={`block font-bold ${
                              idx === 0 ? 'text-yellow-400' :
                              idx === 1 ? 'text-slate-300' :
                              idx === 2 ? 'text-amber-500' :
                              'text-slate-400'
                            }`}
                            >{idx + 1}</Text>
                          </View>

                          {/* 头像占位 */}
                          <View className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Text className="block text-white font-bold">
                              {handler.handlerName.charAt(0)}
                            </Text>
                          </View>

                          {/* 信息 */}
                          <View className="flex-1">
                            <Text className="block text-white font-medium">{handler.handlerName}</Text>
                            <View className="flex items-center gap-3 mt-1">
                              <Text className="block text-slate-400 text-xs">处理 {handler.totalHandled}</Text>
                              <Text className="block text-emerald-400 text-xs">成交 {handler.convertedCount}</Text>
                            </View>
                          </View>

                          {/* 成功率 */}
                          <View className="text-right">
                            <Text className="block text-blue-400 font-bold">{handler.successRate}%</Text>
                            <Text className="block text-slate-400 text-xs">成功率</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View className="py-20 text-center">
                    <Award size={48} color="#475569" className="mx-auto mb-4" />
                    <Text className="block text-slate-400">暂无排行数据</Text>
                    <Text className="block text-slate-400 text-sm mt-2">处理预警后将显示排行榜</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
