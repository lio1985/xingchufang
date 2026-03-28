import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';

interface RecycleStatistics {
  overview: {
    totalStores: number;
    totalEstimatedValue: number;
    completedRecycles: number;
    inProgressRecycles: number;
    totalCost: number;
    profitMargin?: number;
  };
  statusDistribution: {
    pending: number;
    contacted: number;
    assessing: number;
    negotiating: number;
    deal: number;
    recycling: number;
    completed: number;
    cancelled: number;
  };
  businessTypeDistribution: Record<string, number>;
  recentGrowth: {
    thisWeek: number;
    lastWeek: number;
    growthRate: number;
  };
  monthlyTrend: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

const statusLabels = {
  pending: '待接触',
  contacted: '已接触',
  assessing: '评估中',
  negotiating: '谈判中',
  deal: '已签约',
  recycling: '回收中',
  completed: '已完成',
  cancelled: '已取消'
};

const statusColors = {
  pending: 'bg-slate-8000',
  contacted: 'bg-blue-500',
  assessing: 'bg-purple-500',
  negotiating: 'bg-amber-500',
  deal: 'bg-emerald-500',
  recycling: 'bg-cyan-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500'
};

export default function RecycleDashboard() {
  const [statistics, setStatistics] = useState<RecycleStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/recycle/statistics/dashboard'
      });
      console.log('[RecycleDashboard] Statistics:', res.data);

      if (res.data.code === 200) {
        setStatistics(res.data.data);
      }
    } catch (err) {
      console.error('[RecycleDashboard] Load statistics error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 头部 */}
      <View className="px-4 pt-12 pb-4 bg-slate-800/50">
        <View className="flex items-center justify-between">
          <View className="flex items-center">
            <Text>📊</Text>
            <Text className="block text-white text-lg font-semibold ml-2">回收统计</Text>
          </View>
        </View>
      </View>

      <ScrollView className="px-4 pb-24" scrollY style={{ height: 'calc(100vh - 100px)' }}>
        {!statistics ? (
          <View className="flex flex-col items-center justify-center py-20">
            <Text>📊</Text>
            <Text className="block text-slate-400 text-sm mt-3">
              {loading ? '加载中...' : '暂无数据'}
            </Text>
          </View>
        ) : (
          <View>
            {/* 总览卡片 */}
            <View className="grid grid-cols-2 gap-3 mb-4">
              <View className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-4">
                <Text>🏪</Text>
                <Text className="block text-2xl font-bold text-white">
                  {statistics.overview.totalStores}
                </Text>
                <Text className="block text-cyan-200 text-xs mt-1">接触门店</Text>
              </View>

              <View className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4">
                <Text>✓</Text>
                <Text className="block text-2xl font-bold text-white">
                  {statistics.overview.completedRecycles}
                </Text>
                <Text className="block text-emerald-200 text-xs mt-1">已完成</Text>
              </View>

              <View className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4">
                <Text>📈</Text>
                <Text className="block text-xl font-bold text-white">
                  ¥{(statistics.overview.totalEstimatedValue / 10000).toFixed(1)}万
                </Text>
                <Text className="block text-amber-200 text-xs mt-1">预估价值</Text>
              </View>

              <View className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
                <Text>💰</Text>
                <Text className="block text-xl font-bold text-white">
                  ¥{(statistics.overview.totalCost / 10000).toFixed(1)}万
                </Text>
                <Text className="block text-purple-200 text-xs mt-1">总成本</Text>
              </View>
            </View>

            {/* 周期增长 */}
            {statistics.recentGrowth && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <View className="flex items-center justify-between">
                  <View>
                    <Text className="block text-slate-400 text-xs mb-1">本周新增</Text>
                    <Text className="block text-white text-2xl font-bold">
                      {statistics.recentGrowth.thisWeek}
                    </Text>
                  </View>
                  <View className="text-right">
                    <Text className="block text-slate-400 text-xs mb-1">环比增长</Text>
                    <Text
                      className={`block text-lg font-semibold ${
                        statistics.recentGrowth.growthRate >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {statistics.recentGrowth.growthRate >= 0 ? '+' : ''}
                      {statistics.recentGrowth.growthRate.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 状态分布 */}
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <Text className="block text-white text-base font-semibold mb-4">状态分布</Text>
              <View className="grid grid-cols-4 gap-3">
                {Object.entries(statistics.statusDistribution).map(([status, count]) => (
                  <View key={status} className="text-center">
                    <View
                      className={`${statusColors[status as keyof typeof statusColors]} w-3 h-3 rounded-full mx-auto mb-2`}
                    />
                    <Text className="block text-white text-sm font-semibold">
                      {count}
                    </Text>
                    <Text className="block text-slate-400 text-xs mt-1">
                      {statusLabels[status as keyof typeof statusLabels]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 业务类别分布 */}
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <Text className="block text-white text-base font-semibold mb-4">
                业务类别分布
              </Text>
              {Object.entries(statistics.businessTypeDistribution).map(([type, count]) => (
                <View key={type} className="mb-3">
                  <View className="flex justify-between items-center mb-1">
                    <Text className="block text-white text-sm">{type}</Text>
                    <Text className="block text-slate-400 text-sm">{count}家</Text>
                  </View>
                  <View className="bg-slate-800 rounded-full h-2">
                    <View
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{
                        width: `${(count / statistics.overview.totalStores) * 100}%`
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* 月度趋势 */}
            {statistics.monthlyTrend && statistics.monthlyTrend.length > 0 && (
              <View className="bg-slate-800 rounded-xl p-4 mb-4">
                <Text className="block text-white text-base font-semibold mb-4">月度趋势</Text>
                <View className="flex items-end gap-2 overflow-x-auto pb-2">
                  {statistics.monthlyTrend.map((item, index) => {
                    const maxValue = Math.max(
                      ...statistics.monthlyTrend.map(t => t.count)
                    );
                    const height = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
                    return (
                      <View key={index} className="flex-1 min-w-[40px]">
                        <View
                          className="bg-cyan-500 rounded-t w-full"
                          style={{ height: `${Math.max(height, 4)}px` }}
                        />
                        <Text className="block text-slate-400 text-xs mt-2 text-center">
                          {item.month.slice(5)}
                        </Text>
                        <Text className="block text-white text-xs text-center font-semibold">
                          {item.count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 快捷入口 */}
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <Text className="block text-white text-base font-semibold mb-4">快捷操作</Text>
              <View className="grid grid-cols-2 gap-3">
                <View
                  className="bg-slate-800 rounded-lg p-3 flex items-center gap-3"
                  onClick={() => Taro.navigateTo({ url: '/package-customer/pages/recycle/edit' })}
                >
                  <View className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Text>🎯</Text>
                  </View>
                  <View>
                    <Text className="block text-white text-sm font-medium">新增门店</Text>
                    <Text className="block text-slate-400 text-xs">添加回收目标</Text>
                  </View>
                </View>

                <View
                  className="bg-slate-800 rounded-lg p-3 flex items-center gap-3"
                  onClick={() => Taro.navigateTo({ url: '/package-customer/pages/recycle/index' })}
                >
                  <View className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Text>🏪</Text>
                  </View>
                  <View>
                    <Text className="block text-white text-sm font-medium">门店列表</Text>
                    <Text className="block text-slate-400 text-xs">查看所有门店</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 刷新按钮 */}
      <View
        className="fixed bottom-24 right-4 w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center shadow-lg"
        onClick={loadStatistics}
      >
        <Text>📊</Text>
      </View>
    </View>
  );
}
