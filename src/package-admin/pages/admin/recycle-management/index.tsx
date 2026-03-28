import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  Store,
  DollarSign,
  Check,
  Target,
  RefreshCw,
  ChevronLeft,
  User,
  CircleAlert,
  Award,
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

  const renderOverview = () => {
    if (!statistics) return null;

    return (
      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 核心指标 */}
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            { icon: Store, label: '总门店数', value: statistics.totalStores, color: '#fbbf24' },
            { icon: DollarSign, label: '总预估价值', value: `¥${(statistics.totalEstimatedValue / 10000).toFixed(1)}万`, color: '#4ade80' },
            { icon: Check, label: '已成交价值', value: `¥${(statistics.totalDealValue / 10000).toFixed(1)}万`, color: '#60a5fa' },
            { icon: Target, label: '成交率', value: `${(statistics.dealRate * 100).toFixed(1)}%`, color: '#a855f7' },
          ].map((card, index) => (
            <View
              key={index}
              style={{
                backgroundColor: 'rgba(30, 58, 95, 0.3)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #1e3a5f',
              }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <View style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: `rgba(${card.color === '#fbbf24' ? '251, 191, 36' : card.color === '#4ade80' ? '74, 222, 128' : card.color === '#60a5fa' ? '96, 165, 250' : '168, 85, 247'}, 0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <card.icon size={16} color={card.color} />
                </View>
                <Text style={{ fontSize: '22px', color: '#94a3b8' }}>{card.label}</Text>
              </View>
              <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>{card.value}</Text>
            </View>
          ))}
        </View>

        {/* 状态分布 */}
        <View style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
        >
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>状态分布</Text>

          {[
            { key: 'pendingCount', label: '待跟进', value: statistics.pendingCount, color: '#94a3b8' },
            { key: 'assessingCount', label: '评估中', value: statistics.assessingCount, color: '#a855f7' },
            { key: 'negotiatingCount', label: '谈判中', value: statistics.negotiatingCount, color: '#fbbf24' },
            { key: 'recyclingCount', label: '回收中', value: statistics.recyclingCount, color: '#38bdf8' },
            { key: 'completedCount', label: '已完成', value: statistics.completedCount, color: '#4ade80' },
          ].map((item) => {
            const total = statistics.totalStores || 1;
            const percentage = Math.round((item.value / total) * 100);

            return (
              <View key={item.key} style={{ marginBottom: '12px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '22px', color: item.color }}>{item.label}</Text>
                  <Text style={{ fontSize: '22px', color: '#f1f5f9' }}>{item.value}</Text>
                </View>
                <View style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#1e3a5f', overflow: 'hidden' }}>
                  <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: item.color, borderRadius: '3px' }} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRanking = () => (
    <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <User size={18} color="#38bdf8" />
        <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>回收业绩排行</Text>
      </View>

      {salesRankings.length > 0 ? (
        salesRankings.map((ranking, index) => (
          <View
            key={ranking.userId}
            style={{
              backgroundColor: 'rgba(30, 58, 95, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #1e3a5f',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <View style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#f97316' : '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              >
                {index < 3 ? (
                  <Award size={16} color="#fff" />
                ) : (
                  <Text style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>{index + 1}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>{ranking.realName || ranking.username}</Text>
                <Text style={{ fontSize: '20px', color: '#64748b' }}>{ranking.storeCount} 家门店</Text>
              </View>
              <View style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>¥{(ranking.totalDealValue / 10000).toFixed(1)}万</Text>
                <Text style={{ fontSize: '20px', color: '#64748b' }}>成交额</Text>
              </View>
            </View>

            <View style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #1e3a5f' }}>
              <Text style={{ fontSize: '20px', color: '#64748b' }}>预估: ¥{(ranking.totalEstimatedValue / 10000).toFixed(1)}万</Text>
              <Text style={{ fontSize: '20px', color: '#64748b' }}>成交率: {(ranking.dealRate * 100).toFixed(1)}%</Text>
              <Text style={{ fontSize: '20px', color: '#64748b' }}>回收中: {ranking.recyclingCount}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <User size={80} color="#71717a" />
          <Text style={{ fontSize: '28px', color: '#64748b', marginTop: '16px' }}>暂无排行数据</Text>
        </View>
      )}
    </View>
  );

  const renderRisk = () => {
    const getRiskColor = (level: string) => {
      switch (level) {
        case 'high': return { bg: 'rgba(248, 113, 113, 0.15)', color: '#f87171', icon: '#f87171' };
        case 'medium': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', icon: '#f97316' };
        case 'low': return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', icon: '#38bdf8' };
        default: return { bg: 'rgba(30, 58, 95, 0.3)', color: '#64748b', icon: '#71717a' };
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
      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <CircleAlert size={18} color="#38bdf8" />
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>风险预警门店</Text>
        </View>

        {riskStores.length > 0 ? (
          riskStores.map((store) => {
            const riskStyle = getRiskColor(store.risk_level);

            return (
              <View
                key={store.id}
                style={{
                  backgroundColor: 'rgba(30, 58, 95, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #1e3a5f',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <View style={{
                    marginTop: '4px',
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: riskStyle.bg,
                  }}
                  >
                    <CircleAlert size={16} color={riskStyle.icon} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>{store.store_name}</Text>
                      <View style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: riskStyle.bg,
                      }}
                      >
                        <Text style={{ fontSize: '20px', color: riskStyle.color }}>{getRiskLabel(store.risk_level)}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: '22px', color: '#64748b', marginBottom: '8px' }}>销售: {store.sales_name}</Text>
                    <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '20px', color: '#64748b' }}>状态: {store.recycle_status}</Text>
                      <Text style={{ fontSize: '20px', color: '#64748b' }}>预估: ¥{store.estimated_value?.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Check size={80} color="#4ade80" />
            <Text style={{ fontSize: '28px', color: '#64748b', marginTop: '16px' }}>暂无风险门店</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <View
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => {
              const pages = Taro.getCurrentPages();
              if (pages.length > 1) {
                Taro.navigateBack();
              } else {
                Taro.redirectTo({ url: '/package-admin/pages/admin/dashboard/index' });
              }
            }}
          >
            <ChevronLeft size={24} color="#f1f5f9" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>回收门店</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>门店回收管理</Text>
          </View>
          <View onClick={handleRefresh} style={{ padding: '8px' }}>
            <RefreshCw size={20} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>

        {/* Tab 切换 */}
        <View style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'overview', label: '总览' },
            { key: 'ranking', label: '回收排行' },
            { key: 'risk', label: '风险预警' },
          ].map((tab) => (
            <View
              key={tab.key}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: activeTab === tab.key ? '#38bdf8' : '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text style={{ fontSize: '14px', fontWeight: '600', color: activeTab === tab.key ? '#000' : '#64748b' }}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 180px)' }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'ranking' && renderRanking()}
        {activeTab === 'risk' && renderRisk()}
        <View style={{ height: '20px' }} />
      </ScrollView>
    </View>
  );
}
