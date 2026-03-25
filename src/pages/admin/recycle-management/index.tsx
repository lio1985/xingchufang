import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  Store,
  DollarSign,
  Check,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  User,
  CircleAlert,
  Award,
  ChartBar
} from 'lucide-react-taro';

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
    <View className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
      <View className="flex items-center justify-between mb-2">
        <View className="flex items-center gap-2">
          <View className={`p-2 rounded-lg ${color}`}>
            <Icon size={18} color="#fff" />
          </View>
          <Text className="text-zinc-400 text-sm">{label}</Text>
        </View>
        {trend !== undefined && (
          <View className="flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp size={12} color="#10b981" />
            ) : trend < 0 ? (
              <TrendingDown size={12} color="#ef4444" />
            ) : (
              <Minus size={12} color="#71717a" />
            )}
            <Text className={`text-xs ${trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
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
      if (idx === 0) return 'bg-amber-500';
      if (idx === 1) return 'bg-zinc-400';
      if (idx === 2) return 'bg-orange-600';
      return 'bg-zinc-700';
    };

    return (
      <View className="bg-zinc-800/60 rounded-xl p-4 mb-3 border border-zinc-700/50">
        <View className="flex items-center gap-3 mb-3">
          <View className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(index)}`}>
            {index < 3 ? (
              <Award size={16} color="#fff" />
            ) : (
              <Text className="text-white font-bold text-sm">{index + 1}</Text>
            )}
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-white font-semibold block truncate">{ranking.realName || ranking.username}</Text>
            <Text className="text-zinc-500 text-sm">{ranking.storeCount} 家门店</Text>
          </View>
          <View className="text-right">
            <Text className="text-amber-500 font-bold">¥{(ranking.totalDealValue / 10000).toFixed(1)}万</Text>
            <Text className="text-zinc-500 text-xs">成交额</Text>
          </View>
        </View>
        <View className="flex justify-between text-xs pt-3 border-t border-zinc-700/50">
          <Text className="text-zinc-500">预估: ¥{(ranking.totalEstimatedValue / 10000).toFixed(1)}万</Text>
          <Text className="text-zinc-500">成交率: {(ranking.dealRate * 100).toFixed(1)}%</Text>
          <Text className="text-zinc-500">回收中: {ranking.recyclingCount}</Text>
        </View>
      </View>
    );
  };

  const RiskStoreItem = ({ store }: { store: RiskStore }) => {
    const getRiskColor = (level: string) => {
      switch (level) {
        case 'high': return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: '#ef4444' };
        case 'medium': return { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', icon: '#f97316' };
        case 'low': return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', icon: '#f59e0b' };
        default: return { bg: 'bg-zinc-700', border: 'border-zinc-600', text: 'text-zinc-400', icon: '#71717a' };
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

    const riskStyle = getRiskColor(store.risk_level);

    return (
      <View className="bg-zinc-800/60 rounded-xl p-4 mb-3 border border-zinc-700/50">
        <View className="flex items-start gap-3">
          <View className={`mt-1 p-1.5 rounded-lg ${riskStyle.bg}`}>
            <CircleAlert size={16} color={riskStyle.icon} />
          </View>
          <View className="flex-1">
            <View className="flex items-center justify-between mb-2">
              <Text className="text-white font-semibold">{store.store_name}</Text>
              <View className={`px-2 py-0.5 rounded ${riskStyle.bg} ${riskStyle.border} border`}>
                <Text className={`${riskStyle.text} text-xs`}>{getRiskLabel(store.risk_level)}</Text>
              </View>
            </View>
            <Text className="text-zinc-500 text-sm mb-2">销售: {store.sales_name}</Text>
            <View className="flex justify-between text-xs">
              <Text className="text-zinc-500">状态: {store.recycle_status}</Text>
              <Text className="text-zinc-500">预估: ¥{store.estimated_value?.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 顶部标题栏 */}
      <View className="sticky top-0 z-10 bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
        <View className="flex items-center gap-3">
          <View className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
            <ChartBar size={20} color="#f59e0b" />
          </View>
          <Text className="text-white text-lg font-bold">回收门店管理</Text>
        </View>
        <View className={`p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 ${loading ? 'opacity-50' : ''}`} onClick={handleRefresh}>
          <RefreshCw size={18} color="#f59e0b" className={loading ? 'animate-spin' : ''} />
        </View>
      </View>

      {/* 标签切换 */}
      <View className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex gap-2">
        <View
          className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <Text>总览</Text>
        </View>
        <View
          className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium ${
            activeTab === 'ranking'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50'
          }`}
          onClick={() => setActiveTab('ranking')}
        >
          <Text>回收排行</Text>
        </View>
        <View
          className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium ${
            activeTab === 'risk'
              ? 'bg-amber-500 text-black'
              : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50'
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
                    color="bg-amber-500"
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
              <View className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
                <Text className="text-white font-semibold mb-3 block">状态分布</Text>
                <View className="space-y-3">
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-zinc-500 text-sm mb-1">待跟进</Text>
                      <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-zinc-400 rounded-full"
                          style={{ width: `${((statistics?.pendingCount || 0) / (statistics?.totalStores || 1)) * 100}%` }}
                        />
                      </View>
                    </View>
                    <Text className="text-white font-semibold w-12 text-right">{statistics?.pendingCount || 0}</Text>
                  </View>
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <Text className="text-zinc-500 text-sm mb-1">评估中</Text>
                      <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
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
                      <Text className="text-zinc-500 text-sm mb-1">谈判中</Text>
                      <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
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
                      <Text className="text-zinc-500 text-sm mb-1">回收中</Text>
                      <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
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
                      <Text className="text-zinc-500 text-sm mb-1">已完成</Text>
                      <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-emerald-400 rounded-full"
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
                  <User size={16} color="#f59e0b" />
                  <Text className="text-white font-semibold">回收业绩排行</Text>
                </View>
                <Text className="text-zinc-500 text-sm">Top {salesRankings.length}</Text>
              </View>

              {salesRankings.length > 0 ? (
                <View>
                  {salesRankings.map((ranking, index) => (
                    <RankingItem key={ranking.userId} ranking={ranking} index={index} />
                  ))}
                </View>
              ) : (
                <View className="bg-zinc-800/60 rounded-xl p-8 text-center border border-zinc-700/50">
                  <User size={32} color="#71717a" />
                  <Text className="text-zinc-500 block mt-2">暂无排行数据</Text>
                </View>
              )}
            </View>
          )}

          {/* 风险预警标签 */}
          {activeTab === 'risk' && (
            <View>
              <View className="flex justify-between items-center mb-3">
                <View className="flex items-center gap-2">
                  <CircleAlert size={16} color="#f59e0b" />
                  <Text className="text-white font-semibold">风险预警门店</Text>
                </View>
                <Text className="text-zinc-500 text-sm">近期需要跟进</Text>
              </View>

              {riskStores.length > 0 ? (
                <View>
                  {riskStores.map((store) => (
                    <RiskStoreItem key={store.id} store={store} />
                  ))}
                </View>
              ) : (
                <View className="bg-zinc-800/60 rounded-xl p-8 text-center border border-zinc-700/50">
                  <Check size={32} color="#10b981" />
                  <Text className="text-zinc-500 block mt-2">暂无风险门店</Text>
                </View>
              )}
            </View>
          )}

          {/* 更新时间 */}
          <View className="text-center py-4">
            <Text className="text-zinc-600 text-xs">
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
