import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';

interface OverviewStats {
  total: number;
  statusDistribution: { normal: number; atRisk: number; lost: number };
  orderDistribution: { inProgress: number; completed: number };
  totalEstimatedAmount: number;
  conversionRate: string;
}

interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  newCustomers: number;
  dailyStats: Record<string, { new: number; followUp: number }>;
  totalAmount: number;
}

interface MonthlyStats {
  month: number;
  year: number;
  newCustomers: number;
  statusDistribution: { normal: number; atRisk: number; lost: number };
  completedOrders: number;
  totalAmount: number;
}

interface SalesStats {
  userId: string;
  name: string;
  total: number;
  normal: number;
  atRisk: number;
  lost: number;
  completed: number;
  totalAmount: number;
  conversionRate: string;
}

const statusMap = {
  normal: { label: '正常', color: '#34d399', bg: 'bg-emerald-500/20' },
  atRisk: { label: '有风险', color: '#fbbf24', bg: 'bg-amber-500/20' },
  lost: { label: '已流失', color: '#f87171', bg: 'bg-red-500/20' }
};

export default function CustomerStatistics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'monthly' | 'sales'>('overview');
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStats | null>(null);
  const [sales, setSales] = useState<SalesStats[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = () => {
      const userInfo = Taro.getStorageSync('userInfo');
      setIsAdmin(userInfo?.role === 'admin');
    };
    checkRole();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === 'overview') {
          const res = await Network.request({ url: '/api/customers/statistics/overview' });
          console.log('[Statistics] Overview:', res.data);
          if (res.data.code === 200) {
            setOverview(res.data.data);
          }
        } else if (activeTab === 'weekly') {
          const res = await Network.request({ url: '/api/customers/statistics/weekly' });
          console.log('[Statistics] Weekly:', res.data);
          if (res.data.code === 200) {
            setWeekly(res.data.data);
          }
        } else if (activeTab === 'monthly') {
          const res = await Network.request({ url: '/api/customers/statistics/monthly' });
          console.log('[Statistics] Monthly:', res.data);
          if (res.data.code === 200) {
            setMonthly(res.data.data);
          }
        } else if (activeTab === 'sales' && isAdmin) {
          const res = await Network.request({ url: '/api/customers/statistics/by-sales' });
          console.log('[Statistics] By Sales:', res.data);
          if (res.data.code === 200) {
            setSales(res.data.data || []);
          }
        }
      } catch (err) {
        console.error('[Statistics] Load error:', err);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      }
    };

    loadData();
  }, [activeTab, isAdmin]);

  const goBack = () => {
    Taro.navigateBack();
  };

  // 下钻到客户列表
  const drillDown = (params: { userId?: string; status?: string; orderStatus?: string }) => {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    Taro.navigateTo({ url: `/pages/customer/index?${query}` });
  };

  const tabs = [
    { key: 'overview', label: '总览', icon: Users },
    { key: 'weekly', label: '本周', icon: Calendar },
    { key: 'monthly', label: '本月', icon: Activity },
    ...(isAdmin ? [{ key: 'sales', label: '销售排行', icon: Target }] : [])
  ];

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 头部 */}
      <View className="px-4 pt-12 pb-4 bg-slate-800/50">
        <View className="flex items-center" onClick={goBack}>
          <Text>←</Text>
          <Text className="block text-white text-lg font-semibold ml-2">客户统计</Text>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className="flex px-4 py-3 bg-slate-800/30">
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`flex-1 py-2 mx-1 rounded-xl flex items-center justify-center ${
              activeTab === tab.key ? 'bg-blue-600' : 'bg-slate-800'
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <tab.icon size={16} color={activeTab === tab.key ? '#ffffff' : '#94a3b8'} />
            <Text className={`block text-sm ml-1 ${activeTab === tab.key ? 'text-white' : 'text-slate-400'}`}>
              {tab.label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView className="px-4 pb-8" scrollY style={{ height: 'calc(100vh - 180px)' }}>
        {/* 总览 */}
        {activeTab === 'overview' && overview && (
          <View>
            {/* 核心指标 - 支持下钻 */}
            <View className="flex flex-wrap gap-3 mb-4">
              <View 
                className="flex-1 min-w-[45%] bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 active:scale-95"
                onClick={() => drillDown({})}
              >
                <Text>👤</Text>
                <Text className="block text-2xl font-bold text-white">{overview.total}</Text>
                <Text className="block text-blue-200 text-xs">总客户数</Text>
              </View>
              <View 
                className="flex-1 min-w-[45%] bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 active:scale-95"
                onClick={() => drillDown({ orderStatus: 'completed' })}
              >
                <Text>💰</Text>
                <Text className="block text-2xl font-bold text-white">
                  ¥{(overview.totalEstimatedAmount || 0).toFixed(0)}万
                </Text>
                <Text className="block text-emerald-200 text-xs">预计总金额</Text>
              </View>
              <View 
                className="flex-1 min-w-[45%] bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 active:scale-95"
                onClick={() => drillDown({ orderStatus: 'completed' })}
              >
                <Text>🎯</Text>
                <Text className="block text-2xl font-bold text-white">{overview.conversionRate}%</Text>
                <Text className="block text-purple-200 text-xs">成交转化率</Text>
              </View>
              <View 
                className="flex-1 min-w-[45%] bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4 active:scale-95"
                onClick={() => drillDown({ orderStatus: 'completed' })}
              >
                <Text>📈</Text>
                <Text className="block text-2xl font-bold text-white">{overview.orderDistribution.completed}</Text>
                <Text className="block text-amber-200 text-xs">已成交订单</Text>
              </View>
            </View>

            {/* 状态分布 - 支持下钻 */}
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <Text className="block text-white text-base font-semibold mb-4">客户状态分布</Text>
              <View className="flex gap-3">
                {Object.entries(overview.statusDistribution).map(([key, value]) => {
                  const config = statusMap[key === 'atRisk' ? 'atRisk' : key];
                  const percentage = overview.total > 0 ? ((value / overview.total) * 100).toFixed(1) : '0';
                  return (
                    <View 
                      key={key} 
                      className={`flex-1 ${config.bg} rounded-xl p-3 items-center active:scale-95`}
                      onClick={() => drillDown({ status: key })}
                    >
                      <Text className="block text-2xl font-bold" style={{ color: config.color }}>
                        {value}
                      </Text>
                      <Text className="block text-slate-400 text-xs mt-1">{config.label}</Text>
                      <Text className="block text-slate-400 text-xs">{percentage}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* 本周统计 */}
        {activeTab === 'weekly' && weekly && (
          <View>
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <Text className="block text-white text-base font-semibold mb-2">
                {weekly.weekStart} ~ {weekly.weekEnd}
              </Text>
              <View className="flex justify-between mb-4">
                <View>
                  <Text className="block text-2xl font-bold text-blue-400">{weekly.newCustomers}</Text>
                  <Text className="block text-slate-400 text-xs">本周新增</Text>
                </View>
                <View>
                  <Text className="block text-2xl font-bold text-emerald-400">
                    ¥{(weekly.totalAmount || 0).toFixed(0)}万
                  </Text>
                  <Text className="block text-slate-400 text-xs">预计金额</Text>
                </View>
              </View>

              {/* 每日统计 */}
              <View className="border-t border-slate-700 pt-4">
                <Text className="block text-slate-400 text-sm mb-3">每日新增</Text>
                {Object.entries(weekly.dailyStats).map(([date, stats]) => (
                  <View key={date} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                    <Text className="block text-slate-300 text-sm">{date}</Text>
                    <View className="flex items-center gap-4">
                      <Text className="block text-blue-400 text-sm">+{stats.new} 新客户</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* 本月统计 */}
        {activeTab === 'monthly' && monthly && (
          <View>
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <Text className="block text-white text-base font-semibold mb-4">
                {monthly.year}年{monthly.month}月
              </Text>
              <View className="flex flex-wrap gap-3">
                <View className="flex-1 min-w-[45%] bg-slate-800 rounded-xl p-3 items-center">
                  <Text className="block text-2xl font-bold text-blue-400">{monthly.newCustomers}</Text>
                  <Text className="block text-slate-400 text-xs">本月新增</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-slate-800 rounded-xl p-3 items-center">
                  <Text className="block text-2xl font-bold text-emerald-400">{monthly.completedOrders}</Text>
                  <Text className="block text-slate-400 text-xs">成交订单</Text>
                </View>
                <View className="w-full bg-slate-800 rounded-xl p-3 items-center">
                  <Text className="block text-2xl font-bold text-amber-400">
                    ¥{(monthly.totalAmount || 0).toFixed(0)}万
                  </Text>
                  <Text className="block text-slate-400 text-xs">预计金额</Text>
                </View>
              </View>
            </View>

            {/* 状态分布 - 支持下钻 */}
            <View className="bg-slate-800 rounded-xl p-4 mb-4">
              <Text className="block text-white text-base font-semibold mb-4">本月状态分布</Text>
              <View className="space-y-3">
                {Object.entries(monthly.statusDistribution).map(([key, value]) => {
                  const config = statusMap[key === 'atRisk' ? 'atRisk' : key];
                  const total = Object.values(monthly.statusDistribution).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return (
                    <View 
                      key={key} 
                      className="flex items-center active:opacity-70"
                      onClick={() => drillDown({ status: key })}
                    >
                      <Text className="block text-slate-400 text-sm w-16">{config.label}</Text>
                      <View className="flex-1 h-2 bg-slate-800 rounded-full mx-3 overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${percentage}%`, backgroundColor: config.color }}
                        />
                      </View>
                      <Text className="block text-white text-sm w-12 text-right">{value}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* 销售排行 */}
        {activeTab === 'sales' && isAdmin && (
          <View>
            {sales.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="block text-slate-400">暂无销售数据</Text>
              </View>
            ) : (
              <View>
                {sales.map((sale, index) => (
                  <View 
                    key={sale.userId} 
                    className="bg-slate-800 rounded-xl p-4 mb-3 active:scale-95"
                    onClick={() => drillDown({ userId: sale.userId })}
                  >
                    <View className="flex items-center mb-3">
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-800'
                        }`}
                      >
                        <Text className="block text-white text-sm font-bold">{index + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="block text-white text-base font-semibold">{sale.name}</Text>
                        <Text className="block text-slate-400 text-xs">转化率 {sale.conversionRate}%</Text>
                      </View>
                      <View className="items-end">
                        <Text className="block text-emerald-400 text-lg font-bold">
                          ¥{(sale.totalAmount || 0).toFixed(0)}万
                        </Text>
                        <Text className="block text-slate-400 text-xs">{sale.total} 客户</Text>
                      </View>
                    </View>
                    <View className="flex gap-2 pt-3 border-t border-slate-700">
                      <View 
                        className="flex-1 bg-emerald-500/20 rounded-lg p-2 items-center active:scale-95"
                        onClick={(e) => { e.stopPropagation(); drillDown({ userId: sale.userId, status: 'normal' }); }}
                      >
                        <Text className="block text-emerald-400 text-sm font-bold">{sale.normal}</Text>
                        <Text className="block text-slate-400 text-xs">正常</Text>
                      </View>
                      <View 
                        className="flex-1 bg-amber-500/20 rounded-lg p-2 items-center active:scale-95"
                        onClick={(e) => { e.stopPropagation(); drillDown({ userId: sale.userId, status: 'at_risk' }); }}
                      >
                        <Text className="block text-amber-400 text-sm font-bold">{sale.atRisk}</Text>
                        <Text className="block text-slate-400 text-xs">有风险</Text>
                      </View>
                      <View 
                        className="flex-1 bg-red-500/20 rounded-lg p-2 items-center active:scale-95"
                        onClick={(e) => { e.stopPropagation(); drillDown({ userId: sale.userId, status: 'lost' }); }}
                      >
                        <Text className="block text-red-400 text-sm font-bold">{sale.lost}</Text>
                        <Text className="block text-slate-400 text-xs">已流失</Text>
                      </View>
                      <View 
                        className="flex-1 bg-slate-9000/20 rounded-lg p-2 items-center active:scale-95"
                        onClick={(e) => { e.stopPropagation(); drillDown({ userId: sale.userId, orderStatus: 'completed' }); }}
                      >
                        <Text className="block text-blue-400 text-sm font-bold">{sale.completed}</Text>
                        <Text className="block text-slate-400 text-xs">已成交</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
