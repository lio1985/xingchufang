import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import {
  DollarSign,
  Target,
  TrendingUp,
  FileText,
  Search,
  Phone,
  MapPin,
  Calendar,
  Users,
  Award,
  Activity,
  RefreshCw,
  Trophy,
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

export default function AdminCustomerManagement() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'sales' | 'churn'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [globalStats, setGlobalStats] = useState<GlobalStatistics | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats[]>([]);

  const loadGlobalStats = async () => {
    try {
      const res = await Network.request({ url: '/api/admin/customers/statistics' });
      if (res.data.code === 200) setGlobalStats(res.data.data);
    } catch (err) {
      console.error('[AdminCustomer] Load global stats error:', err);
    }
  };

  const loadSalesStats = async () => {
    try {
      const res = await Network.request({ url: '/api/admin/customers/sales-ranking' });
      if (res.data.code === 200) setSalesStats(res.data.data || []);
    } catch (err) {
      console.error('[AdminCustomer] Load sales stats error:', err);
    }
  };

  const loadCustomers = async (isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = isRefresh ? 1 : page;
      const res = await Network.request({
        url: '/api/admin/customers',
        data: { page: currentPage, pageSize: 20, keyword: keyword || undefined },
      });

      if (res.data.code === 200) {
        const newData = res.data.data.data || [];
        setCustomers(isRefresh ? newData : [...customers, ...newData]);
        setHasMore(newData.length === 20);
        if (!isRefresh) setPage(currentPage + 1);
      }
    } catch (err) {
      console.error('[AdminCustomer] Load customers error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalStats();
    loadSalesStats();
    loadCustomers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#4ade80';
      case 'at_risk': return '#fbbf24';
      case 'lost': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { normal: '正常', at_risk: '有风险', lost: '已流失' };
    return map[status] || status;
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([loadGlobalStats(), loadSalesStats(), loadCustomers(true)]);
    setLoading(false);
  };

  const renderDashboard = () => (
    <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 统计卡片 */}
      <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { icon: Users, label: '总客户数', value: globalStats?.overview.totalCustomers || 0, color: '#60a5fa' },
          { icon: DollarSign, label: '预估总额', value: `¥${((globalStats?.overview.totalEstimatedAmount || 0) / 10000).toFixed(1)}万`, color: '#4ade80' },
          { icon: Target, label: '成交客户', value: globalStats?.overview.completedOrders || 0, color: '#a855f7' },
          { icon: TrendingUp, label: '增长率', value: `${globalStats?.recentGrowth.growthRate || 0}%`, color: '#fbbf24' },
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
              <card.icon size={16} color={card.color} />
              <Text style={{ fontSize: '22px', color: '#94a3b8' }}>{card.label}</Text>
            </View>
            <Text style={{ fontSize: '36px', fontWeight: '700', color: '#f1f5f9' }}>{card.value}</Text>
          </View>
        ))}
      </View>

      {/* 状态分布 */}
      {globalStats && (
        <View style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileText size={20} color="#38bdf8" />
            <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>客户状态分布</Text>
          </View>

          {['normal', 'atRisk', 'lost'].map((key) => {
            const value = globalStats.statusDistribution[key as keyof typeof globalStats.statusDistribution];
            const total = globalStats.overview.totalCustomers || 1;
            const percentage = Math.round((value / total) * 100);

            return (
              <View key={key} style={{ marginBottom: '12px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '22px', color: getStatusColor(key === 'atRisk' ? 'at_risk' : key) }}>
                    {getStatusLabel(key === 'atRisk' ? 'at_risk' : key)}
                  </Text>
                  <Text style={{ fontSize: '22px', color: '#f1f5f9' }}>{value}</Text>
                </View>
                <View style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#1e3a5f', overflow: 'hidden' }}>
                  <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: getStatusColor(key === 'atRisk' ? 'at_risk' : key), borderRadius: '3px' }} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 销售排行 */}
      {salesStats.length > 0 && (
        <View style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trophy size={20} color="#fbbf24" />
            <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>销售业绩 TOP5</Text>
          </View>

          {salesStats.slice(0, 5).map((sales, index) => (
            <View
              key={sales.user_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                marginBottom: '8px',
              }}
            >
              <View style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#f97316' : '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              >
                <Text style={{ fontSize: '18px', fontWeight: '700', color: index < 3 ? '#000' : '#f1f5f9' }}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9' }}>{sales.sales_name}</Text>
                <Text style={{ fontSize: '20px', color: '#64748b' }}>{sales.total}客户 · {sales.completed}成交</Text>
              </View>
              <Text style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80' }}>¥{(sales.totalAmount / 10000).toFixed(1)}万</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderCustomerList = () => (
    <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 搜索栏 */}
      <View style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'rgba(30, 58, 95, 0.3)',
        borderRadius: '12px',
        border: '1px solid #1e3a5f',
      }}
      >
        <Search size={20} color="#71717a" />
        <Input
          style={{ flex: 1, fontSize: '26px', color: '#f1f5f9' }}
          placeholder="搜索客户名称、电话..."
          placeholderStyle="color: #64748b"
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          onConfirm={() => loadCustomers(true)}
        />
      </View>

      {/* 客户列表 */}
      {customers.length === 0 && !loading ? (
        <View style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Users size={80} color="#71717a" />
          <Text style={{ fontSize: '28px', color: '#64748b', marginTop: '16px' }}>暂无客户</Text>
        </View>
      ) : (
        customers.map((customer) => (
          <View
            key={customer.id}
            style={{
              backgroundColor: 'rgba(30, 58, 95, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #1e3a5f',
            }}
            onClick={() => Taro.navigateTo({ url: `/pages/customer/detail?id=${customer.id}` })}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <View>
                <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>{customer.name}</Text>
                <Text style={{ fontSize: '20px', color: '#64748b', marginTop: '4px' }}>销售: {customer.sales_name || '未知'}</Text>
              </View>
              <View style={{
                padding: '4px 10px',
                borderRadius: '8px',
                backgroundColor: `rgba(${customer.status === 'normal' ? '74, 222, 128' : customer.status === 'at_risk' ? '251, 191, 36' : '248, 113, 113'}, 0.15)`,
              }}
              >
                <Text style={{ fontSize: '20px', color: getStatusColor(customer.status) }}>{getStatusLabel(customer.status)}</Text>
              </View>
            </View>

            <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              {customer.phone && (
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} color="#71717a" />
                  <Text style={{ fontSize: '20px', color: '#64748b' }}>{customer.phone}</Text>
                </View>
              )}
              {customer.city && (
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#71717a" />
                  <Text style={{ fontSize: '20px', color: '#64748b' }}>{customer.city}</Text>
                </View>
              )}
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} color="#71717a" />
                <Text style={{ fontSize: '20px', color: '#64748b' }}>{new Date(customer.created_at).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #1e3a5f' }}>
              <Text style={{ fontSize: '22px', color: customer.order_status === 'completed' ? '#4ade80' : '#60a5fa' }}>
                {customer.order_status === 'completed' ? '已成交' : '跟进中'}
              </Text>
              {customer.estimated_amount && (
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>¥{(customer.estimated_amount / 10000).toFixed(1)}万</Text>
              )}
            </View>
          </View>
        ))
      )}

      {loading && (
        <View style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
          <RefreshCw size={40} color="#38bdf8" />
        </View>
      )}

      {hasMore && !loading && (
        <View style={{ padding: '16px 0', textAlign: 'center' }} onClick={() => loadCustomers()}>
          <Text style={{ fontSize: '22px', color: '#64748b' }}>加载更多</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '130px',
        background: 'linear-gradient(180deg, #0f1a2e 0%, #0a1628 100%)',
        borderBottom: '1px solid #1e3a5f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingBottom: '12px',
        zIndex: 100,
      }}
      >
        <View style={{ padding: '0 16px 12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <View
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={18} color="#f59e0b" />
                </View>
                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>客户管理</Text>
              </View>
            </View>
            <View onClick={handleRefresh}>
              <RefreshCw size={22} color={loading ? '#64748b' : '#38bdf8'} />
            </View>
          </View>

          {/* Tab 切换 */}
          <View style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'dashboard', label: '数据看板', icon: Activity },
              { key: 'customers', label: '客户列表', icon: Users },
              { key: 'sales', label: '业绩排行', icon: Award },
            ].map((tab) => (
              <View
                key={tab.key}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === tab.key ? '#f59e0b' : '#1e293b',
                  border: activeTab === tab.key ? 'none' : '1px solid #1e3a5f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <tab.icon size={16} color={activeTab === tab.key ? '#000' : '#71717a'} />
                <Text style={{ fontSize: '22px', fontWeight: '600', color: activeTab === tab.key ? '#000' : '#64748b' }}>{tab.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 130px)', marginTop: '130px' }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'customers' && renderCustomerList()}
        {activeTab === 'sales' && renderDashboard()}
        <View style={{ height: '20px' }} />
      </ScrollView>
    </View>
  );
}
