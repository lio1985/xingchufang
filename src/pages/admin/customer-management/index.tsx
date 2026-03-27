import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  User,
  DollarSign,
  Target,
  TrendingUp,
  ShieldAlert,
  ShieldX,
  Trophy,
  FileText,
  Search,
  Download,
  Phone,
  MapPin,
  Calendar,
  ChartBar,
  Users,
  Award,
  Activity
} from 'lucide-react-taro';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  city?: string;
  status: 'normal' | 'at_risk' | 'lost';
  order_status: 'in_progress' | 'completed';
  customer_type: string;
  estimated_amount?: number;
  user_id: string;
  sales_name?: string;
  created_at: string;
  updated_at: string;
}

interface SalesStats {
  user_id: string;
  sales_name: string;
  total: number;
  normal: number;
  atRisk: number;
  lost: number;
  completed: number;
  totalAmount: number;
}

interface GlobalStatistics {
  overview: {
    totalCustomers: number;
    totalEstimatedAmount: number;
    completedOrders: number;
    inProgressOrders: number;
  };
  statusDistribution: {
    normal: number;
    atRisk: number;
    lost: number;
  };
  orderDistribution: {
    inProgress: number;
    completed: number;
  };
  typeDistribution: Record<string, number>;
  recentGrowth: {
    thisWeek: number;
    lastWeek: number;
    growthRate: number;
  };
}

interface ChurnRiskAssessment {
  customerId: string;
  customerName: string;
  riskLevel: 'low' | 'yellow' | 'orange' | 'red';
  riskScore: number;
  daysSinceLastFollowUp: number;
  riskFactors: string[];
  suggestedActions: string[];
  lastFollowUpDate?: string;
  salesName?: string;
  estimatedAmount?: number;
}

interface ChurnRiskStatistics {
  total: number;
  red: number;
  orange: number;
  yellow: number;
  totalAtRisk: number;
}

const statusMap = {
  normal: { label: '正常', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  at_risk: { label: '有风险', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  lost: { label: '已流失', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
};

const orderStatusMap = {
  in_progress: { label: '跟进中', color: 'text-blue-400' },
  completed: { label: '已成交', color: 'text-emerald-400' }
};

export default function AdminCustomerManagement() {
  // Tab 切换
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'sales' | 'churn'>('dashboard');

  // 客户列表数据
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [salesFilter, setSalesFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 统计数据
  const [globalStats, setGlobalStats] = useState<GlobalStatistics | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats[]>([]);
  const [salesList, setSalesList] = useState<{user_id: string; name: string}[]>([]);

  // 流失预警数据
  const [churnRisks, setChurnRisks] = useState<ChurnRiskAssessment[]>([]);
  const [churnStats, setChurnStats] = useState<ChurnRiskStatistics | null>(null);
  const [churnRiskLevel, setChurnRiskLevel] = useState<string>('all');
  const [churnLoading, setChurnLoading] = useState(false);

  // 加载全局统计
  const loadGlobalStats = async () => {
    try {
      const res = await Network.request({ url: '/api/admin/customers/statistics' });
      console.log('[AdminCustomer] Global stats:', res.data);
      if (res.data.code === 200) {
        setGlobalStats(res.data.data);
      }
    } catch (err) {
      console.error('[AdminCustomer] Load global stats error:', err);
    }
  };

  // 加载销售排行
  const loadSalesStats = async () => {
    try {
      const res = await Network.request({ url: '/api/admin/customers/sales-ranking' });
      console.log('[AdminCustomer] Sales stats:', res.data);
      if (res.data.code === 200) {
        setSalesStats(res.data.data || []);
        const list = res.data.data?.map((s: SalesStats) => ({
          user_id: s.user_id,
          name: s.sales_name
        })) || [];
        setSalesList(list);
      }
    } catch (err) {
      console.error('[AdminCustomer] Load sales stats error:', err);
    }
  };

  // 加载流失预警统计
  const loadChurnStats = async () => {
    try {
      const res = await Network.request({ url: '/api/customers/churn-warning/statistics' });
      console.log('[AdminCustomer] Churn stats:', res.data);
      if (res.data.code === 200) {
        setChurnStats(res.data.data);
      }
    } catch (err) {
      console.error('[AdminCustomer] Load churn stats error:', err);
    }
  };

  // 加载流失预警列表
  const loadChurnRisks = async () => {
    if (churnLoading) return;
    setChurnLoading(true);

    try {
      const res = await Network.request({
        url: '/api/customers/churn-warning/risk-list',
        data: {
          riskLevel: churnRiskLevel === 'all' ? undefined : churnRiskLevel,
          salesId: salesFilter || undefined
        }
      });
      console.log('[AdminCustomer] Churn risks:', res.data);

      if (res.data.code === 200) {
        setChurnRisks(res.data.data || []);
      }
    } catch (err) {
      console.error('[AdminCustomer] Load churn risks error:', err);
      Taro.showToast({ title: '加载预警失败', icon: 'none' });
    } finally {
      setChurnLoading(false);
    }
  };
  const loadCustomers = async (isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = isRefresh ? 1 : page;
      const res = await Network.request({
        url: '/api/admin/customers',
        data: {
          page: currentPage,
          pageSize: 20,
          keyword: keyword || undefined,
          status: statusFilter || undefined,
          orderStatus: orderStatusFilter || undefined,
          salesId: salesFilter || undefined
        }
      });
      console.log('[AdminCustomer] Customers:', res.data);

      if (res.data.code === 200) {
        const newData = res.data.data.data || [];
        if (isRefresh) {
          setCustomers(newData);
          setPage(2);
        } else {
          setCustomers(prev => [...prev, ...newData]);
          setPage(currentPage + 1);
        }
        setHasMore(newData.length === 20);
      }
    } catch (err) {
      console.error('[AdminCustomer] Load customers error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      Taro.showLoading({ title: '创建报表中...' });
      const res = await Network.request({
        url: '/api/admin/customers/export',
        method: 'POST',
        data: {
          keyword: keyword || undefined,
          status: statusFilter || undefined,
          salesId: salesFilter || undefined
        }
      });
      Taro.hideLoading();

      if (res.data.code === 200 && res.data.data?.downloadUrl) {
        Taro.showModal({
          title: '导出成功',
          content: '报表已创建，是否立即下载？',
          success: (m) => {
            if (m.confirm && res.data.data?.downloadUrl) {
              Taro.showToast({ title: '开始下载...', icon: 'none' });
            }
          }
        });
      } else {
        Taro.showToast({ title: '导出失败', icon: 'none' });
      }
    } catch (err) {
      Taro.hideLoading();
      console.error('[AdminCustomer] Export error:', err);
      Taro.showToast({ title: '导出失败', icon: 'none' });
    }
  };

  // 初始加载
  useEffect(() => {
    loadGlobalStats();
    loadSalesStats();
    loadCustomers(true);
    loadChurnStats();
    loadChurnRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选变化时刷新
  useEffect(() => {
    loadCustomers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, salesFilter]);

  // 流失预警筛选变化时刷新
  useEffect(() => {
    loadChurnRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churnRiskLevel]);

  // 下钻到客户列表
  const drillDownToCustomers = (filters: { status?: string; orderStatus?: string; salesId?: string }) => {
    setStatusFilter(filters.status || '');
    setOrderStatusFilter(filters.orderStatus || '');
    setSalesFilter(filters.salesId || '');
    setActiveTab('customers');
    
    setTimeout(() => {
      loadCustomers(true);
    }, 100);
  };

  // 渲染统计卡片
  const renderStatCards = () => {
    if (!globalStats) return null;
    const { overview } = globalStats;

    return (
      <View className="grid grid-cols-2 gap-3 mb-4">
        <View 
          className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-500/30 active:scale-95"
          onClick={() => drillDownToCustomers({})}
        >
          <View className="flex items-center gap-2 mb-2">
            <User size={14} color="#60a5fa" />
            <Text className="text-zinc-400 text-xs">总客户数</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{overview.totalCustomers}</Text>
          <Text className="text-blue-400 text-xs mt-1">
            本周新增 +{globalStats.recentGrowth.thisWeek}
          </Text>
        </View>

        <View 
          className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl p-4 border border-emerald-500/30 active:scale-95"
          onClick={() => drillDownToCustomers({})}
        >
          <View className="flex items-center gap-2 mb-2">
            <DollarSign size={14} color="#10b981" />
            <Text className="text-zinc-400 text-xs">预估总额</Text>
          </View>
          <Text className="text-white text-2xl font-bold">
            ¥{(overview.totalEstimatedAmount / 10000).toFixed(1)}万
          </Text>
          <Text className="text-emerald-400 text-xs mt-1">
            已成交 ¥{(overview.completedOrders * 10000 / 10000).toFixed(0)}万
          </Text>
        </View>

        <View 
          className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30 active:scale-95"
          onClick={() => drillDownToCustomers({ orderStatus: 'completed' })}
        >
          <View className="flex items-center gap-2 mb-2">
            <Target size={14} color="#8b5cf6" />
            <Text className="text-zinc-400 text-xs">成交客户</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{overview.completedOrders}</Text>
          <Text className="text-purple-400 text-xs mt-1">
            转化率 {overview.totalCustomers > 0
              ? ((overview.completedOrders / overview.totalCustomers) * 100).toFixed(1)
              : 0}%
          </Text>
        </View>

        <View 
          className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 rounded-xl p-4 border border-amber-500/30"
        >
          <View className="flex items-center gap-2 mb-2">
            <ChartBar size={14} color="#38bdf8" />
            <Text className="text-zinc-400 text-xs">增长率</Text>
          </View>
          <Text className={`text-2xl font-bold ${globalStats.recentGrowth.growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {globalStats.recentGrowth.growthRate >= 0 ? '+' : ''}{globalStats.recentGrowth.growthRate.toFixed(1)}%
          </Text>
          <Text className="text-amber-400 text-xs mt-1">
            环比上周
          </Text>
        </View>
      </View>
    );
  };

  // 渲染流失预警统计卡片
  const renderChurnStatCards = () => {
    if (!churnStats) return null;

    return (
      <View className="grid grid-cols-2 gap-3 mb-4">
        <View className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl p-4 border border-red-500/30">
          <View className="flex items-center gap-2 mb-2">
            <ShieldX size={14} color="#f87171" />
            <Text className="text-zinc-400 text-xs">高危客户</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{churnStats.red}</Text>
          <Text className="text-red-400 text-xs mt-1">
            超过30天未跟进
          </Text>
        </View>

        <View className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-xl p-4 border border-orange-500/30">
          <View className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} color="#f97316" />
            <Text className="text-zinc-400 text-xs">中危客户</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{churnStats.orange}</Text>
          <Text className="text-orange-400 text-xs mt-1">
            超过14天未跟进
          </Text>
        </View>

        <View className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-xl p-4 border border-yellow-500/30">
          <View className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} color="#eab308" />
            <Text className="text-zinc-400 text-xs">低危客户</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{churnStats.yellow}</Text>
          <Text className="text-yellow-400 text-xs mt-1">
            超过7天未跟进
          </Text>
        </View>

        <View className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-500/30">
          <View className="flex items-center gap-2 mb-2">
            <DollarSign size={14} color="#8b5cf6" />
            <Text className="text-zinc-400 text-xs">风险金额</Text>
          </View>
          <Text className="text-white text-2xl font-bold">
            ¥{(churnStats.totalAtRisk / 10000).toFixed(1)}万
          </Text>
          <Text className="text-purple-400 text-xs mt-1">
            预估总额
          </Text>
        </View>
      </View>
    );
  };

  // 渲染流失预警列表
  const renderChurnRiskList = () => {
    const riskLevelMap = {
      red: { label: '高危', color: '#f87171', bg: 'bg-red-500/20', border: 'border-red-500/30' },
      orange: { label: '中危', color: '#f97316', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
      yellow: { label: '低危', color: '#eab308', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' }
    };

    return (
      <View className="space-y-3">
        {/* 筛选栏 */}
        <View className="bg-zinc-800/40 rounded-xl p-3 border border-zinc-700/50">
          <View className="flex gap-2">
            {[
              { key: 'all', label: '全部预警', color: 'blue' },
              { key: 'red', label: '高危', color: 'red' },
              { key: 'orange', label: '中危', color: 'orange' },
              { key: 'yellow', label: '低危', color: 'yellow' }
            ].map((level) => (
              <View
                key={level.key}
                onClick={() => setChurnRiskLevel(level.key)}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-all ${
                  churnRiskLevel === level.key
                    ? `bg-${level.color}-500/20 border-${level.color}-500/50`
                    : 'bg-zinc-700/50 border-zinc-600/50'
                }`}
              >
                <Text className={`text-xs font-medium ${
                  churnRiskLevel === level.key ? `text-${level.color}-400` : 'text-zinc-500'
                }`}
                >
                  {level.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 预警列表 */}
        {churnRisks.length === 0 ? (
          <View className="py-12 text-center">
            <View className="w-16 h-16 bg-zinc-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
              <ChartBar size={32} color="#71717a" />
            </View>
            <Text className="text-zinc-500 text-sm">暂无流失预警客户</Text>
            <Text className="text-zinc-600 text-xs mt-2">客户跟进情况良好</Text>
          </View>
        ) : (
          churnRisks.map((risk) => {
            const levelInfo = riskLevelMap[risk.riskLevel];

            return (
              <View
                key={risk.customerId}
                onClick={() => Taro.navigateTo({ url: `/pages/customer/detail?id=${risk.customerId}` })}
                className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 active:scale-[0.98] transition-transform"
              >
                {/* 头部：客户名称和风险等级 */}
                <View className="flex items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold">{risk.customerName}</Text>
                    <Text className="text-zinc-500 text-xs mt-1">
                      销售：{risk.salesName || '未知'}
                    </Text>
                  </View>
                  <View className={`flex items-center gap-1 px-2 py-1 rounded-full ${levelInfo.bg} ${levelInfo.border} border`}>
                    <ShieldAlert size={12} color={levelInfo.color} />
                    <Text className="text-xs font-medium" style={{ color: levelInfo.color }}>
                      {levelInfo.label}
                    </Text>
                  </View>
                </View>

                {/* 风险信息 */}
                <View className="flex items-center gap-4 mb-3">
                  <View className="flex items-center gap-1">
                    <TrendingUp size={12} color="#71717a" />
                    <Text className="text-zinc-500 text-xs">
                      {risk.daysSinceLastFollowUp}天未跟进
                    </Text>
                  </View>
                  {risk.estimatedAmount && (
                    <View className="flex items-center gap-1">
                      <DollarSign size={12} color="#10b981" />
                      <Text className="text-emerald-400 text-xs">
                        ¥{(risk.estimatedAmount / 10000).toFixed(1)}万
                      </Text>
                    </View>
                  )}
                </View>

                {/* 风险因素 */}
                {risk.riskFactors.length > 0 && (
                  <View className="mb-3">
                    <Text className="text-zinc-500 text-xs mb-2">风险信号：</Text>
                    <View className="flex flex-wrap gap-2">
                      {risk.riskFactors.map((factor, idx) => (
                        <View key={idx} className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
                          <Text className="text-red-400 text-xs">{factor}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 建议措施 */}
                {risk.suggestedActions.length > 0 && (
                  <View className="pt-3 border-t border-zinc-700/50">
                    <Text className="text-zinc-500 text-xs mb-2">建议措施：</Text>
                    {risk.suggestedActions.slice(0, 2).map((action, idx) => (
                      <View key={idx} className="flex items-start gap-2 mb-1">
                        <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                        <Text className="text-blue-400 text-xs flex-1">{action}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    );
  };

  // 渲染状态分布
  const renderStatusDistribution = () => {
    if (!globalStats) return null;
    const { statusDistribution, overview } = globalStats;
    const total = overview.totalCustomers || 1;

    return (
      <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 mb-4">
        <View className="flex items-center gap-2 mb-4">
          <FileText size={16} color="#38bdf8" />
          <Text className="text-white font-semibold">客户状态分布</Text>
        </View>

        <View className="space-y-3">
          <View 
            className="active:opacity-70"
            onClick={() => drillDownToCustomers({ status: 'normal' })}
          >
            <View className="flex justify-between items-center mb-1">
              <Text className="text-emerald-400 text-sm">正常客户</Text>
              <Text className="text-white text-sm font-semibold">{statusDistribution.normal}</Text>
            </View>
            <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(statusDistribution.normal / total) * 100}%` }}
              />
            </View>
          </View>

          <View 
            className="active:opacity-70"
            onClick={() => drillDownToCustomers({ status: 'at_risk' })}
          >
            <View className="flex justify-between items-center mb-1">
              <Text className="text-amber-400 text-sm">有风险</Text>
              <Text className="text-white text-sm font-semibold">{statusDistribution.atRisk}</Text>
            </View>
            <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(statusDistribution.atRisk / total) * 100}%` }}
              />
            </View>
          </View>

          <View 
            className="active:opacity-70"
            onClick={() => drillDownToCustomers({ status: 'lost' })}
          >
            <View className="flex justify-between items-center mb-1">
              <Text className="text-red-400 text-sm">已流失</Text>
              <Text className="text-white text-sm font-semibold">{statusDistribution.lost}</Text>
            </View>
            <View className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${(statusDistribution.lost / total) * 100}%` }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 渲染销售排行
  const renderSalesRanking = () => {
    if (salesStats.length === 0) return null;

    const sorted = [...salesStats].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);

    return (
      <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 mb-4">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-2">
            <Trophy size={16} color="#38bdf8" />
            <Text className="text-white font-semibold">销售业绩排行 TOP5</Text>
          </View>
          <Text className="text-amber-500 text-xs" onClick={() => setActiveTab('sales')}>
            查看全部
          </Text>
        </View>

        <View className="space-y-3">
          {sorted.map((sales, index) => (
            <View 
              key={sales.user_id} 
              className="flex items-center gap-3 active:opacity-70"
              onClick={() => drillDownToCustomers({ salesId: sales.user_id })}
            >
              <View className={`w-6 h-6 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-amber-500' :
                index === 1 ? 'bg-zinc-400' :
                index === 2 ? 'bg-orange-600' :
                'bg-zinc-700'
              }`}
              >
                <Text className={`text-xs font-bold ${index < 3 ? 'text-white' : 'text-zinc-500'}`}>
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">{sales.sales_name}</Text>
                <Text className="text-zinc-500 text-xs">
                  {sales.total}客户 · {sales.completed}成交
                </Text>
              </View>
              <Text className="text-emerald-400 text-sm font-semibold">
                ¥{(sales.totalAmount / 10000).toFixed(1)}万
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 渲染客户列表
  const renderCustomerList = () => {
    return (
      <View className="space-y-3">
        {/* 筛选栏 */}
        <View className="bg-zinc-800/40 rounded-xl p-3 border border-zinc-700/50">
          <View className="flex items-center gap-2 mb-3">
            <Search size={16} color="#71717a" />
            <Input
              className="flex-1 text-white text-sm bg-transparent"
              placeholder="搜索客户名称、电话..."
              placeholderClass="text-zinc-500"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              onConfirm={() => loadCustomers(true)}
            />
          </View>

          <View className="flex gap-2">
            {/* 状态筛选 */}
            <View
              onClick={() => {
                const statuses = ['', 'normal', 'at_risk', 'lost'];
                const currentIndex = statuses.indexOf(statusFilter);
                setStatusFilter(statuses[(currentIndex + 1) % statuses.length]);
              }}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border ${
                statusFilter
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-zinc-700/50 border-zinc-600/50'
              }`}
            >
              <TrendingUp size={12} color={statusFilter ? '#60a5fa' : '#71717a'} />
              <Text className={`text-xs ${statusFilter ? 'text-blue-400' : 'text-zinc-500'}`}>
                {statusFilter ? statusMap[statusFilter as keyof typeof statusMap]?.label : '全部状态'}
              </Text>
            </View>

            {/* 销售筛选 */}
            {salesList.length > 0 && (
              <View
                onClick={() => {
                  const ids = ['', ...salesList.map(s => s.user_id)];
                  const currentIndex = ids.indexOf(salesFilter);
                  setSalesFilter(ids[(currentIndex + 1) % ids.length]);
                }}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border ${
                  salesFilter
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-zinc-700/50 border-zinc-600/50'
                }`}
              >
                <User size={12} color={salesFilter ? '#8b5cf6' : '#71717a'} />
                <Text className={`text-xs ${salesFilter ? 'text-purple-400' : 'text-zinc-500'}`}>
                  {salesFilter
                    ? salesList.find(s => s.user_id === salesFilter)?.name || '销售'
                    : '全部销售'}
                </Text>
              </View>
            )}

            {/* 导出按钮 */}
            <View
              onClick={handleExport}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30"
            >
              <Download size={12} color="#10b981" />
              <Text className="text-xs text-emerald-400">导出</Text>
            </View>
          </View>
        </View>

        {/* 客户列表 */}
        {customers.map((customer) => (
          <View
            key={customer.id}
            onClick={() => Taro.navigateTo({ url: `/pages/customer/detail?id=${customer.id}` })}
            className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 active:scale-[0.98] transition-transform"
          >
            <View className="flex items-start justify-between mb-3">
              <View>
                <Text className="text-white text-base font-semibold">{customer.name}</Text>
                <Text className="text-zinc-500 text-xs mt-1">
                  销售: {customer.sales_name || '未知'}
                </Text>
              </View>
              <View className={`px-2 py-1 rounded-full ${statusMap[customer.status].bg} ${statusMap[customer.status].border} border`}>
                <Text className={`text-xs ${statusMap[customer.status].color}`}>
                  {statusMap[customer.status].label}
                </Text>
              </View>
            </View>

            <View className="flex items-center gap-4 mb-3">
              {customer.phone && (
                <View className="flex items-center gap-1">
                  <Phone size={12} color="#71717a" />
                  <Text className="text-zinc-500 text-xs">{customer.phone}</Text>
                </View>
              )}
              {customer.city && (
                <View className="flex items-center gap-1">
                  <MapPin size={12} color="#71717a" />
                  <Text className="text-zinc-500 text-xs">{customer.city}</Text>
                </View>
              )}
              <View className="flex items-center gap-1">
                <Calendar size={12} color="#71717a" />
                <Text className="text-zinc-500 text-xs">
                  {new Date(customer.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
              <View>
                <Text className={`text-sm ${orderStatusMap[customer.order_status].color}`}>
                  {orderStatusMap[customer.order_status].label}
                </Text>
                <Text className="text-zinc-500 text-xs">{customer.customer_type}</Text>
              </View>
              {customer.estimated_amount && (
                <Text className="text-emerald-400 text-lg font-bold">
                  ¥{(customer.estimated_amount / 10000).toFixed(1)}万
                </Text>
              )}
            </View>
          </View>
        ))}

        {/* 加载更多 */}
        {hasMore && (
          <View
            onClick={() => loadCustomers()}
            className="py-4 text-center"
          >
            <Text className="text-zinc-500 text-sm">
              {loading ? '加载中...' : '点击加载更多'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // 渲染销售完整排行
  const renderFullSalesRanking = () => {
    const sorted = [...salesStats].sort((a, b) => b.totalAmount - a.totalAmount);

    return (
      <View className="space-y-3">
        {sorted.map((sales, index) => (
          <View
            key={sales.user_id}
            className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50"
          >
            <View 
              className="flex items-center gap-3 mb-3 active:opacity-70"
              onClick={() => drillDownToCustomers({ salesId: sales.user_id })}
            >
              <View className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-amber-500' :
                index === 1 ? 'bg-zinc-400' :
                index === 2 ? 'bg-orange-600' :
                'bg-zinc-700'
              }`}
              >
                <Text className={`text-sm font-bold ${index < 3 ? 'text-white' : 'text-zinc-500'}`}>
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">{sales.sales_name}</Text>
              </View>
              <Text className="text-emerald-400 text-lg font-bold">
                ¥{(sales.totalAmount / 10000).toFixed(1)}万
              </Text>
            </View>

            <View className="grid grid-cols-4 gap-2 pt-3 border-t border-zinc-700/50">
              <View 
                className="text-center active:opacity-70"
                onClick={() => drillDownToCustomers({ salesId: sales.user_id })}
              >
                <Text className="text-white text-lg font-semibold">{sales.total}</Text>
                <Text className="text-zinc-500 text-xs">总客户</Text>
              </View>
              <View 
                className="text-center active:opacity-70"
                onClick={(e) => { e.stopPropagation(); drillDownToCustomers({ salesId: sales.user_id, status: 'normal' }); }}
              >
                <Text className="text-emerald-400 text-lg font-semibold">{sales.normal}</Text>
                <Text className="text-zinc-500 text-xs">正常</Text>
              </View>
              <View 
                className="text-center active:opacity-70"
                onClick={(e) => { e.stopPropagation(); drillDownToCustomers({ salesId: sales.user_id, status: 'at_risk' }); }}
              >
                <Text className="text-amber-400 text-lg font-semibold">{sales.atRisk}</Text>
                <Text className="text-zinc-500 text-xs">有风险</Text>
              </View>
              <View 
                className="text-center active:opacity-70"
                onClick={(e) => { e.stopPropagation(); drillDownToCustomers({ salesId: sales.user_id, orderStatus: 'completed' }); }}
              >
                <Text className="text-blue-400 text-lg font-semibold">{sales.completed}</Text>
                <Text className="text-zinc-500 text-xs">已成交</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-zinc-900/95 sticky top-0 z-20 border-b border-zinc-800">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-3">
            <View
              onClick={() => Taro.navigateBack()}
              className="w-8 h-8 rounded-full bg-zinc-800/60 flex items-center justify-center border border-zinc-700/50 active:scale-95"
            >
              <ArrowLeft size={18} color="#38bdf8" />
            </View>
            <View className="flex items-center gap-2">
              <View className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                <Users size={16} color="#38bdf8" />
              </View>
              <Text className="text-white text-xl font-bold">客户管理看板</Text>
            </View>
          </View>
          <View className="flex items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Text className="text-emerald-400 text-xs">管理员</Text>
          </View>
        </View>

        {/* Tab 切换 */}
        <View className="flex gap-2">
          {[
            { key: 'dashboard', label: '数据看板', icon: Activity },
            { key: 'customers', label: '客户列表', icon: Users },
            { key: 'sales', label: '业绩排行', icon: Award },
            { key: 'churn', label: '流失预警', icon: ShieldAlert }
          ].map((tab) => (
            <View
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-500'
                  : 'bg-zinc-800/60 border border-zinc-700/50'
              }`}
            >
              <tab.icon size={14} color={activeTab === tab.key ? '#000' : '#71717a'} />
              <Text className={`text-sm font-medium ${activeTab === tab.key ? 'text-black' : 'text-zinc-500'}`}>
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
        onScrollToLower={() => activeTab === 'customers' && loadCustomers()}
      >
        {activeTab === 'dashboard' && (
          <>
            {renderStatCards()}
            {renderStatusDistribution()}
            {renderSalesRanking()}
          </>
        )}

        {activeTab === 'customers' && renderCustomerList()}

        {activeTab === 'sales' && renderFullSalesRanking()}

        {activeTab === 'churn' && (
          <>
            {renderChurnStatCards()}
            {renderChurnRiskList()}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
