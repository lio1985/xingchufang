import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { Store, DollarSign, Users, Target, RefreshCw, ArrowUp, ArrowDown, Minus, Check } from 'lucide-react-taro';

interface GlobalStatistics {
  totalStores: number;
  totalEstimatedValue: number;
  totalDealValue: number;
  dealRate: number;
  recyclingCount: number;
  completedCount: number;
  pendingCount: number;
  assessingCount: number;
  negotiatingCount: number;
}

interface SalesRanking {
  userId: string;
  username: string;
  avatar?: string;
  realName?: string;
  storeCount: number;
  totalEstimatedValue: number;
  totalDealValue: number;
  dealRate: number;
  recyclingCount: number;
}

interface RiskStore {
  id: string;
  store_name: string;
  sales_name: string;
  recycle_status: string;
  estimated_value: number;
  last_follow_up_at: string;
  risk_level: 'high' | 'medium' | 'low';
}

export default function AdminRecycleManagementPage() {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<GlobalStatistics | null>(null);
  const [salesRankings, setSalesRankings] = useState<SalesRanking[]>([]);
  const [riskStores, setRiskStores] = useState<RiskStore[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'ranking' | 'risk'>('overview');

  const loadStatistics = async () => {
    try {
      const res = await Network.request({
        url: '/api/recycle/admin/statistics/overview',
        method: 'GET',
      });

      if (res.data?.data) {
        setStatistics(res.data.data);
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
    }
  };

  const loadSalesRankings = async () => {
    try {
      const res = await Network.request({
        url: '/api/recycle/admin/statistics/sales-ranking',
        method: 'GET',
      });

      if (res.data?.data) {
        setSalesRankings(res.data.data);
      }
    } catch (error: any) {
      console.error('加载销售排行失败:', error);
    }
  };

  const loadRiskStores = async () => {
    try {
      const res = await Network.request({
        url: '/api/recycle/admin/risk-list',
        method: 'GET',
        data: { limit: 10 },
      });

      if (res.data?.data) {
        setRiskStores(res.data.data);
      }
    } catch (error: any) {
      console.error('加载风险门店失败:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStatistics(), loadSalesRankings(), loadRiskStores()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <View className="flex items-center justify-between mb-2">
        <View className="flex items-center gap-2">
          <View className={`p-2 rounded-lg ${color}`}>
            <Icon size={18} className="text-white" />
          </View>
          <Text className="text-slate-400 text-sm">{label}</Text>
        </View>
        {trend && (
          <View className="flex items-center gap-1">
            {trend > 0 ? (
              <ArrowUp size={14} className="text-green-400" />
            ) : trend < 0 ? (
              <ArrowDown size={14} className="text-red-400" />
            ) : (
              <Minus size={14} className="text-slate-400" />
            )}
            <Text className={`text-xs ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text className="text-white text-xl font-bold">{value}</Text>
    </View>
  );

  const RankingItem = ({ ranking, index }: { ranking: SalesRanking; index: number }) => {
    const getRankColor = (idx: number) => {
      if (idx === 0) return 'bg-yellow-500';
      if (idx === 1) return 'bg-gray-400';
      if (idx === 2) return 'bg-orange-500';
      return 'bg-slate-700';
    };

    return (
      <View className="bg-slate-800 rounded-lg p-4 mb-3 border border-slate-700">
        <View className="flex items-center gap-3 mb-3">
          <View className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(index)}`}>
            <Text className="text-white font-bold text-sm">{index + 1}</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-white font-semibold block truncate">{ranking.realName || ranking.username}</Text>
            <Text className="text-slate-400 text-sm">{ranking.storeCount} 家门店</Text>
          </View>
          <View className="text-right">
            <Text className="text-cyan-400 font-bold">¥{(ranking.totalDealValue / 10000).toFixed(1)}万</Text>
            <Text className="text-slate-500 text-xs">成交额</Text>
          </View>
        </View>
        <View className="flex justify-between text-xs pt-3 border-t border-slate-700">
          <Text className="text-slate-400">预估: ¥{(ranking.totalEstimatedValue / 10000).toFixed(1)}万</Text>
          <Text className="text-slate-400">成交率: {(ranking.dealRate * 100).toFixed(1)}%</Text>
          <Text className="text-slate-400">回收中: {ranking.recyclingCount}</Text>
        </View>
      </View>
    );
  };

  const RiskStoreItem = ({ store }: { store: RiskStore }) => {
    const getRiskColor = (level: string) => {
      switch (level) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-orange-500';
        case 'low': return 'bg-yellow-500';
        default: return 'bg-slate-500';
      }
    };

    const getRiskLabel = (level: string) => {
      switch (level) {
        case 'high': return '高风险';
        case 'medium': return '中风险';
        case 'low': return '低风险';
        default: return '未知';
      }
    };

    return (
      <View className="bg-slate-800 rounded-lg p-4 mb-3 border border-slate-700">
        <View className="flex items-start gap-3">
          <View className={`mt-1 p-1.5 rounded ${getRiskColor(store.risk_level)}`}>
            <Target size={16} className="text-white" />
          </View>
          <View className="flex-1">
            <View className="flex items-center justify-between mb-2">
              <Text className="text-white font-semibold">{store.store_name}</Text>
              <View className={`px-2 py-0.5 rounded ${getRiskColor(store.risk_level)}`}>
                <Text className="text-white text-xs">{getRiskLabel(store.risk_level)}</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-sm mb-2">销售: {store.sales_name}</Text>
            <View className="flex justify-between text-xs">
              <Text className="text-slate-400">状态: {store.recycle_status}</Text>
              <Text className="text-slate-400">预估: ¥{store.estimated_value?.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部标题栏 */}
      <View className="sticky top-0 z-10 bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <Text className="text-white text-lg font-bold">回收门店管理</Text>
        <View className={`p-2 rounded-lg bg-slate-700 ${loading ? 'opacity-50' : ''}`} onClick={handleRefresh}>
          <RefreshCw size={20} className={`text-slate-300 ${loading ? 'animate-spin' : ''}`} />
        </View>
      </View>

      {/* 标签切换 */}
      <View className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex gap-2">
        <View
          className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium ${
            activeTab === 'overview'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <Text>总览</Text>
        </View>
        <View
          className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium ${
            activeTab === 'ranking'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
          onClick={() => setActiveTab('ranking')}
        >
          <Text>回收排行</Text>
        </View>
        <View
          className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium ${
            activeTab === 'risk'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-300'
          }`}
          onClick={() => setActiveTab('risk')}
        >
          <Text>风险预警</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        scrollY
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View className="px-4 py-4 space-y-4">
          {/* 总览标签 */}
          {activeTab === 'overview' && (
            <>
              {/* 核心指标 */}
              <View>
                <Text className="text-white font-semibold mb-3 block">核心指标</Text>
                <View className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={Store}
                    label="总门店数"
                    value={statistics?.totalStores || 0}
                    color="bg-cyan-500"
                  />
                  <StatCard
                    icon={DollarSign}
                    label="总预估价值"
                    value={`¥${((statistics?.totalEstimatedValue || 0) / 10000).toFixed(1)}万`}
                    color="bg-emerald-500"
                  />
                  <StatCard
                    icon={Check}
                    label="已成交价值"
                    value={`¥${((statistics?.totalDealValue || 0) / 10000).toFixed(1)}万`}
                    color="bg-blue-500"
                  />
                  <StatCard
                    icon={Target}
                    label="成交率"
                    value={`${((statistics?.dealRate || 0) * 100).toFixed(1)}%`}
                    color="bg-purple-500"
                  />
                </View>
              </View>

              {/* 状态分布 */}
              <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <Text className="text-white font-semibold mb-3 block">状态分布</Text>
                <View className="space-y-3">
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-slate-400 text-sm mb-1">待跟进</Text>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-slate-400 rounded-full"
                          style={{ width: `${((statistics?.pendingCount || 0) / (statistics?.totalStores || 1)) * 100}%` }}
                        />
                      </View>
                    </View>
                    <Text className="text-white font-semibold w-12 text-right">{statistics?.pendingCount || 0}</Text>
                  </View>
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-slate-400 text-sm mb-1">评估中</Text>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-purple-400 rounded-full"
                          style={{ width: `${((statistics?.assessingCount || 0) / (statistics?.totalStores || 1)) * 100}%` }}
                        />
                      </View>
                    </View>
                    <Text className="text-white font-semibold w-12 text-right">{statistics?.assessingCount || 0}</Text>
                  </View>
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-slate-400 text-sm mb-1">谈判中</Text>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${((statistics?.negotiatingCount || 0) / (statistics?.totalStores || 1)) * 100}%` }}
                        />
                      </View>
                    </View>
                    <Text className="text-white font-semibold w-12 text-right">{statistics?.negotiatingCount || 0}</Text>
                  </View>
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-slate-400 text-sm mb-1">回收中</Text>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${((statistics?.recyclingCount || 0) / (statistics?.totalStores || 1)) * 100}%` }}
                        />
                      </View>
                    </View>
                    <Text className="text-white font-semibold w-12 text-right">{statistics?.recyclingCount || 0}</Text>
                  </View>
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-slate-400 text-sm mb-1">已完成</Text>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${((statistics?.completedCount || 0) / (statistics?.totalStores || 1)) * 100}%` }}
                        />
                      </View>
                    </View>
                    <Text className="text-white font-semibold w-12 text-right">{statistics?.completedCount || 0}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* 回收排行标签 */}
          {activeTab === 'ranking' && (
            <View>
              <View className="flex justify-between items-center mb-3">
                <View className="flex items-center gap-2">
                  <Users size={20} className="text-cyan-400" />
                  <Text className="text-white font-semibold">回收业绩排行</Text>
                </View>
                <Text className="text-slate-400 text-sm">Top {salesRankings.length}</Text>
              </View>

              {salesRankings.length > 0 ? (
                <View>
                  {salesRankings.map((ranking, index) => (
                    <RankingItem key={ranking.userId} ranking={ranking} index={index} />
                  ))}
                </View>
              ) : (
                <View className="bg-slate-800 rounded-lg p-8 text-center">
                  <Users size={48} className="text-slate-600 mx-auto mb-3" />
                  <Text className="text-slate-500 block">暂无排行数据</Text>
                </View>
              )}
            </View>
          )}

          {/* 风险预警标签 */}
          {activeTab === 'risk' && (
            <View>
              <View className="flex justify-between items-center mb-3">
                <View className="flex items-center gap-2">
                  <Target size={20} className="text-red-400" />
                  <Text className="text-white font-semibold">风险预警门店</Text>
                </View>
                <Text className="text-slate-400 text-sm">近期需要跟进</Text>
              </View>

              {riskStores.length > 0 ? (
                <View>
                  {riskStores.map((store) => (
                    <RiskStoreItem key={store.id} store={store} />
                  ))}
                </View>
              ) : (
                <View className="bg-slate-800 rounded-lg p-8 text-center">
                  <Check size={48} className="text-green-600 mx-auto mb-3" />
                  <Text className="text-slate-500 block">暂无风险门店</Text>
                </View>
              )}
            </View>
          )}

          {/* 更新时间 */}
          <View className="text-center py-4">
            <Text className="text-slate-500 text-xs">
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
