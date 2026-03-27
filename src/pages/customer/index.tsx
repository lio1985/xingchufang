import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import {
  User,
  Phone,
  MapPin,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  CircleCheck,
  CircleX,
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
  updated_at: string;
}

interface Statistics {
  total: number;
  statusDistribution: { normal: number; atRisk: number; lost: number };
  orderDistribution: { inProgress: number; completed: number };
  totalEstimatedAmount: number;
}

const statusConfig = {
  normal: { label: '正常', color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
  at_risk: { label: '有风险', color: '#38bdf8', bgColor: 'rgba(245, 158, 11, 0.2)' },
  lost: { label: '已流失', color: '#f87171', bgColor: 'rgba(239, 68, 68, 0.2)' }
};

const orderStatusConfig = {
  in_progress: { label: '进行中', color: '#60a5fa' },
  completed: { label: '已成交', color: '#4ade80' }
};

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadCustomers = async (isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = isRefresh ? 1 : page;
      const res = await Network.request({
        url: '/api/customers',
        data: {
          page: currentPage,
          pageSize: 20,
          keyword: keyword || undefined,
          status: statusFilter || undefined,
        }
      });

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
      console.error('加载客户列表失败:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const res = await Network.request({ url: '/api/customers/statistics/overview' });
        if (res.data.code === 200) {
          setStatistics(res.data.data);
        }
      } catch (err) {
        console.error('加载统计数据失败:', err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await Network.request({
          url: '/api/customers',
          data: { page: 1, pageSize: 20 }
        });

        if (res.data.code === 200) {
          const newData = res.data.data.data || [];
          setCustomers(newData);
          setPage(2);
          setHasMore(newData.length === 20);
        }
      } catch (err) {
        console.error('加载客户列表失败:', err);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
    loadData();
  }, []);

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    loadCustomers(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadCustomers(false);
    }
  };

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/customer/detail?id=${id}` });
  };

  const goToCreate = () => {
    Taro.navigateTo({ url: '/pages/customer/edit' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={24} color="#f1f5f9" />
          </View>
          <View>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>获客登记</Text>
            <Text style={{ fontSize: '14px', color: '#71717a' }}>客户信息管理</Text>
          </View>
        </View>
      </View>

      {/* 统计概览 */}
      <View style={{ padding: '0 20px', marginTop: '-8px' }}>
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Text style={{ fontSize: '14px', color: '#94a3b8' }}>客户总览</Text>
            <Text style={{ fontSize: '12px', color: '#38bdf8' }}>查看详情</Text>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{statistics?.total || 0}</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>总客户</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>{statistics?.orderDistribution?.completed || 0}</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>已成交</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#38bdf8' }}>{statistics?.statusDistribution?.atRisk || 0}</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>有风险</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 状态筛选 */}
      <View style={{ padding: '16px 20px 0' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View
            style={{ 
              flex: 1, 
              backgroundColor: statusFilter === '' ? 'rgba(245, 158, 11, 0.2)' : '#111827', 
              border: statusFilter === '' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #1e3a5f', 
              borderRadius: '8px', 
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={() => { setStatusFilter(''); loadCustomers(true); }}
          >
            <CircleCheck size={18} color={statusFilter === '' ? '#38bdf8' : '#71717a'} />
            <Text style={{ fontSize: '14px', color: statusFilter === '' ? '#38bdf8' : '#94a3b8', marginTop: '4px' }}>全部</Text>
          </View>
          <View
            style={{ 
              flex: 1, 
              backgroundColor: statusFilter === 'normal' ? 'rgba(34, 197, 94, 0.2)' : '#111827', 
              border: statusFilter === 'normal' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #1e3a5f', 
              borderRadius: '8px', 
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={() => { setStatusFilter('normal'); loadCustomers(true); }}
          >
            <CircleCheck size={18} color={statusFilter === 'normal' ? '#4ade80' : '#71717a'} />
            <Text style={{ fontSize: '14px', color: statusFilter === 'normal' ? '#4ade80' : '#94a3b8', marginTop: '4px' }}>正常</Text>
          </View>
          <View
            style={{ 
              flex: 1, 
              backgroundColor: statusFilter === 'at_risk' ? 'rgba(245, 158, 11, 0.2)' : '#111827', 
              border: statusFilter === 'at_risk' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #1e3a5f', 
              borderRadius: '8px', 
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={() => { setStatusFilter('at_risk'); loadCustomers(true); }}
          >
            <TrendingUp size={18} color={statusFilter === 'at_risk' ? '#38bdf8' : '#71717a'} />
            <Text style={{ fontSize: '14px', color: statusFilter === 'at_risk' ? '#38bdf8' : '#94a3b8', marginTop: '4px' }}>有风险</Text>
          </View>
          <View
            style={{ 
              flex: 1, 
              backgroundColor: statusFilter === 'lost' ? 'rgba(239, 68, 68, 0.2)' : '#111827', 
              border: statusFilter === 'lost' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #1e3a5f', 
              borderRadius: '8px', 
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={() => { setStatusFilter('lost'); loadCustomers(true); }}
          >
            <CircleX size={18} color={statusFilter === 'lost' ? '#f87171' : '#71717a'} />
            <Text style={{ fontSize: '14px', color: statusFilter === 'lost' ? '#f87171' : '#94a3b8', marginTop: '4px' }}>已流失</Text>
          </View>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={{ padding: '16px 20px 0' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#71717a" />
            <Input
              style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
              placeholder="搜索客户姓名/电话"
              placeholderStyle="color: #71717a"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              onConfirm={handleSearch}
            />
          </View>
          <View
            style={{ backgroundColor: '#38bdf8', borderRadius: '8px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleSearch}
          >
            <Text style={{ fontSize: '14px', color: '#000000', fontWeight: '500' }}>搜索</Text>
          </View>
        </View>
      </View>

      {/* 客户列表标题 */}
      <View style={{ padding: '20px 20px 12px' }}>
        <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>客户列表</Text>
      </View>

      {/* 客户列表 */}
      <ScrollView
        style={{ padding: '0 20px', height: 'calc(100vh - 380px)' }}
        scrollY
        onScrollToLower={handleLoadMore}
      >
        {customers.map((customer) => {
          const status = statusConfig[customer.status];
          const orderStatus = orderStatusConfig[customer.order_status];
          return (
            <View
              key={customer.id}
              style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}
              onClick={() => goToDetail(customer.id)}
            >
              {/* 顶部：姓名 + 状态 */}
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <View style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="#71717a" />
                  </View>
                  <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', marginLeft: '12px' }}>{customer.name}</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <View style={{ padding: '4px 8px', backgroundColor: status.bgColor, borderRadius: '4px' }}>
                    <Text style={{ fontSize: '12px', color: status.color }}>{status.label}</Text>
                  </View>
                  <ChevronRight size={18} color="#64748b" style={{ marginLeft: '8px' }} />
                </View>
              </View>

              {/* 中部：联系方式 */}
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                {customer.phone && (
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Phone size={14} color="#64748b" />
                    <Text style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '4px' }}>{customer.phone}</Text>
                  </View>
                )}
                {customer.city && (
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '4px' }}>{customer.city}</Text>
                  </View>
                )}
              </View>

              {/* 底部：类型 + 金额 */}
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #1e3a5f' }}>
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{customer.customer_type || '未分类'}</Text>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: '12px', color: orderStatus.color, marginRight: '12px' }}>{orderStatus.label}</Text>
                  <Text style={{ fontSize: '14px', color: '#4ade80', fontWeight: '500' }}>¥{(customer.estimated_amount || 0).toFixed(0)}万</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* 加载状态 */}
        {loading && (
          <View style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#71717a' }}>加载中...</Text>
          </View>
        )}

        {/* 无更多数据 */}
        {!hasMore && customers.length > 0 && (
          <View style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#64748b' }}>没有更多数据了</Text>
          </View>
        )}

        {/* 空状态 */}
        {customers.length === 0 && !loading && (
          <View style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <User size={48} color="#334155" />
            <Text style={{ fontSize: '14px', color: '#71717a', marginTop: '16px' }}>暂无客户数据</Text>
            <Text style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>点击右下角添加新客户</Text>
          </View>
        )}
      </ScrollView>

      {/* 添加按钮 */}
      <View
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          width: '56px', 
          height: '56px', 
          backgroundColor: '#38bdf8', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
          zIndex: 100
        }}
        onClick={goToCreate}
      >
        <Plus size={24} color="#000000" />
      </View>
    </View>
  );
}
