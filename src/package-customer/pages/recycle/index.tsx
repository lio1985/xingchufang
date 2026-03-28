import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  Store,
  Phone,
  MapPin,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  CircleDollarSign,
} from 'lucide-react-taro';

interface RecycleStore {
  id: string;
  store_name: string;
  phone?: string;
  city?: string;
  recycle_status: 'pending' | 'contacted' | 'assessing' | 'negotiating' | 'deal' | 'recycling' | 'completed' | 'cancelled';
  business_type: string;
  estimated_value?: number;
  updated_at: string;
}

interface Statistics {
  total: number;
  statusDistribution: Record<string, number>;
  totalEstimatedValue: number;
}

const statusMap = {
  pending: { label: '待接触', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)' },
  contacted: { label: '已接触', color: '#60a5fa', bgColor: 'rgba(59, 130, 246, 0.2)' },
  assessing: { label: '评估中', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' },
  negotiating: { label: '谈判中', color: '#38bdf8', bgColor: 'rgba(245, 158, 11, 0.2)' },
  deal: { label: '已签约', color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
  recycling: { label: '回收中', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.2)' },
  completed: { label: '已完成', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.2)' },
  cancelled: { label: '已取消', color: '#f87171', bgColor: 'rgba(239, 68, 68, 0.2)' }
};

export default function RecycleStoreList() {
  const [stores, setStores] = useState<RecycleStore[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadStores = async (isRefresh = false, currentKeyword = keyword, currentStatus = statusFilter) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = isRefresh ? 1 : page;
      const res = await Network.request({
        url: '/api/recycle/stores',
        data: {
          page: currentPage,
          pageSize: 20,
          keyword: currentKeyword || undefined,
          status: currentStatus || undefined
        }
      });
      console.log('[RecycleList] Stores:', res.data);

      if (res.data.code === 200) {
        const newData = res.data.data.data || [];
        if (isRefresh) {
          setStores(newData);
          setPage(2);
        } else {
          setStores(prev => [...prev, ...newData]);
          setPage(currentPage + 1);
        }
        setHasMore(newData.length === 20);
      }
    } catch (err) {
      console.error('[RecycleList] Load stores error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const res = await Network.request({ url: '/api/recycle/statistics/overview' });
        console.log('[RecycleList] Statistics:', res.data);
        if (res.data.code === 200) {
          setStatistics(res.data.data);
        }
      } catch (err) {
        console.error('[RecycleList] Load statistics error:', err);
      }
    };

    loadStatistics();
    loadStores(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    loadStores(true, keyword, statusFilter);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadStores(false);
    }
  };

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/recycle/detail?id=${id}` });
  };

  const goToCreate = () => {
    Taro.navigateTo({ url: '/package-customer/pages/recycle/edit' });
  };

  const goToDashboard = () => {
    Taro.navigateTo({ url: '/package-customer/pages/recycle/dashboard' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <View
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={24} color="#38bdf8" />
          </View>
          <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>整店回收</Text>
        </View>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginLeft: '56px' }}>回收业务全流程管理</Text>
      </View>

      {/* 统计概览 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '20px' }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>回收总览</Text>
            <View
              style={{ padding: '6px 12px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}
              onClick={goToDashboard}
            >
              <Text style={{ fontSize: '12px', color: '#60a5fa' }}>查看详情</Text>
            </View>
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, textAlign: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{statistics?.total || 0}</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>接触门店</Text>
            </View>
            <View style={{ width: '1px', backgroundColor: '#1e3a5f' }} />
            <View style={{ flex: 1, textAlign: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>
                {statistics?.statusDistribution?.completed || 0}
              </Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>已完成</Text>
            </View>
            <View style={{ width: '1px', backgroundColor: '#1e3a5f' }} />
            <View style={{ flex: 1, textAlign: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#38bdf8' }}>
                ¥{(statistics?.totalEstimatedValue || 0).toFixed(0)}
              </Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>预估价值(万)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={{ padding: '16px 20px 0' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#71717a" />
            <Input
              style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
              placeholder="搜索门店名称/电话/微信"
              placeholderStyle="color: #64748b"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              onConfirm={handleSearch}
            />
          </View>
          <View
            style={{ backgroundColor: '#60a5fa', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleSearch}
          >
            <Text style={{ fontSize: '14px', color: '#ffffff' }}>搜索</Text>
          </View>
        </View>
      </View>

      {/* 状态筛选 */}
      <View style={{ padding: '16px 20px 0' }}>
        <ScrollView scrollX style={{ width: '100%', whiteSpace: 'nowrap' }}>
          <View style={{ display: 'inline-flex', gap: '8px' }}>
            <View
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: statusFilter === '' ? '#60a5fa' : '#111827',
                border: statusFilter === '' ? 'none' : '1px solid #1e3a5f'
              }}
              onClick={() => { setStatusFilter(''); loadStores(true, keyword, ''); }}
            >
              <Text style={{ fontSize: '13px', color: statusFilter === '' ? '#ffffff' : '#94a3b8' }}>全部</Text>
            </View>
            {Object.entries(statusMap).slice(0, 6).map(([key, config]) => (
              <View
                key={key}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: statusFilter === key ? '#60a5fa' : '#111827',
                  border: statusFilter === key ? 'none' : '1px solid #1e3a5f'
                }}
                onClick={() => { setStatusFilter(key); loadStores(true, keyword, key); }}
              >
                <Text style={{ fontSize: '13px', color: statusFilter === key ? '#ffffff' : '#94a3b8' }}>{config.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 门店列表 */}
      <View style={{ padding: '16px 20px 0' }}>
        {stores.length === 0 && !loading ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
            <Store size={48} color="#64748b" />
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>暂无回收门店</Text>
            <View
              style={{ marginTop: '16px', backgroundColor: '#60a5fa', borderRadius: '24px', padding: '12px 24px' }}
              onClick={goToCreate}
            >
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>新增门店</Text>
            </View>
          </View>
        ) : (
          <View>
            {stores.map((store) => {
              const statusConfig = statusMap[store.recycle_status];
              return (
                <View
                  key={store.id}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1e3a5f',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                  onClick={() => goToDetail(store.id)}
                >
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{store.store_name}</Text>
                        <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: statusConfig.bgColor }}>
                          <Text style={{ fontSize: '12px', color: statusConfig.color }}>{statusConfig.label}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>{store.business_type || '未分类'}</Text>
                    </View>
                    <ChevronRight size={18} color="#64748b" />
                  </View>

                  <View style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid #1e3a5f' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} color="#64748b" />
                      <Text style={{ fontSize: '13px', color: '#94a3b8' }}>{store.phone || '未填写'}</Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color="#64748b" />
                      <Text style={{ fontSize: '13px', color: '#94a3b8' }}>{store.city || '未填写'}</Text>
                    </View>
                  </View>

                  {store.estimated_value && (
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1e3a5f' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CircleDollarSign size={14} color="#64748b" />
                        <Text style={{ fontSize: '13px', color: '#71717a' }}>预估价值</Text>
                      </View>
                      <Text style={{ fontSize: '16px', fontWeight: '600', color: '#60a5fa' }}>¥{store.estimated_value.toFixed(0)}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {loading && (
          <View style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <Text style={{ fontSize: '14px', color: '#71717a' }}>加载中...</Text>
          </View>
        )}

        {!hasMore && stores.length > 0 && (
          <View style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }} onClick={handleLoadMore}>
            <Text style={{ fontSize: '12px', color: '#64748b' }}>没有更多了</Text>
          </View>
        )}
      </View>

      {/* 浮动新增按钮 */}
      <View
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          backgroundColor: '#60a5fa',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
        }}
        onClick={goToCreate}
      >
        <Plus size={24} color="#ffffff" />
      </View>
    </View>
  );
}
