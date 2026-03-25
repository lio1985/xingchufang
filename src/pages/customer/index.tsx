import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import { Check, TrendingUp } from 'lucide-react-taro';

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

const statusMap = {
  normal: { label: '正常', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Check },
  at_risk: { label: '有风险', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: TrendingUp },
  lost: { label: '已流失', color: 'text-red-400', bg: 'bg-red-500/20', icon: TrendingUp }
};

const orderStatusMap = {
  in_progress: { label: '进行中', color: 'text-blue-400' },
  completed: { label: '已成交', color: 'text-emerald-400' }
};

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadCustomers = async (isRefresh = false, currentKeyword = keyword, currentStatus = statusFilter, currentOrderStatus = orderStatusFilter, currentUserId = userIdFilter) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = isRefresh ? 1 : page;
      const res = await Network.request({
        url: '/api/customers',
        data: {
          page: currentPage,
          pageSize: 20,
          keyword: currentKeyword || undefined,
          status: currentStatus || undefined,
          orderStatus: currentOrderStatus || undefined,
          userId: currentUserId || undefined
        }
      });
      console.log('[CustomerList] Customers:', res.data);

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
      console.error('[CustomerList] Load customers error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const res = await Network.request({ url: '/api/customers/statistics/overview' });
        console.log('[CustomerList] Statistics:', res.data);
        if (res.data.code === 200) {
          setStatistics(res.data.data);
        }
      } catch (err) {
        console.error('[CustomerList] Load statistics error:', err);
      }
    };

    // 从URL参数读取筛选条件
    const router = Taro.getCurrentInstance().router;
    const params = router?.params || {};
    console.log('[CustomerList] URL params:', params);
    
    if (params.status) {
      setStatusFilter(params.status);
    }
    if (params.orderStatus) {
      setOrderStatusFilter(params.orderStatus);
    }
    if (params.userId) {
      setUserIdFilter(params.userId);
    }
    if (params.keyword) {
      setKeyword(params.keyword);
    }

    loadStatistics();
    loadCustomers(true, params.keyword || '', params.status || '', params.orderStatus || '', params.userId || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    loadCustomers(true, keyword, statusFilter, orderStatusFilter, userIdFilter);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadCustomers(false, keyword, statusFilter, orderStatusFilter, userIdFilter);
    }
  };

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/customer/detail?id=${id}` });
  };

  const goToCreate = () => {
    Taro.navigateTo({ url: '/pages/customer/edit' });
  };

  const goToStatistics = () => {
    Taro.navigateTo({ url: '/pages/customer/statistics' });
  };

  const goToSalesTarget = () => {
    Taro.navigateTo({ url: '/pages/customer/sales-target' });
  };

  const goToSalesDashboard = () => {
    Taro.navigateTo({ url: '/pages/customer/sales-dashboard' });
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部统计卡片 */}
      <View className="px-4 pt-4 pb-2">
        <View className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 mb-4">
          <View className="flex justify-between items-start mb-3">
            <Text className="text-white text-lg font-semibold block">客户总览</Text>
            <View
              className="bg-slate-800/20 px-3 py-1 rounded-full"
              onClick={goToStatistics}
            >
              <Text className="block text-white text-xs">查看详情</Text>
            </View>
          </View>
          <View className="flex justify-between">
            <View className="items-center">
              <Text className="block text-2xl font-bold text-white">{statistics?.total || 0}</Text>
              <Text className="block text-blue-200 text-xs mt-1">总客户数</Text>
            </View>
            <View className="items-center">
              <Text className="block text-2xl font-bold text-emerald-300">
                {statistics?.orderDistribution?.completed || 0}
              </Text>
              <Text className="block text-blue-200 text-xs mt-1">已成交</Text>
            </View>
            <View className="items-center">
              <Text className="block text-xl font-bold text-amber-300">
                ¥{(statistics?.totalEstimatedAmount || 0).toFixed(0)}万
              </Text>
              <Text className="block text-blue-200 text-xs mt-1">预计金额</Text>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <View className="flex gap-3 mb-4">
          <View
            className="flex-1 bg-slate-800 rounded-xl p-3 flex items-center gap-3"
            onClick={goToSalesTarget}
          >
            <View className="w-10 h-10 bg-slate-9000/20 rounded-full flex items-center justify-center">
              <Text>🎯</Text>
            </View>
            <View>
              <Text className="block text-white text-sm font-medium">业绩目标</Text>
              <Text className="block text-slate-400 text-xs">设置与追踪</Text>
            </View>
          </View>
          <View
            className="flex-1 bg-slate-800 rounded-xl p-3 flex items-center gap-3"
            onClick={goToSalesDashboard}
          >
            <View className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Text>📊</Text>
            </View>
            <View>
              <Text className="block text-white text-sm font-medium">业绩看板</Text>
              <Text className="block text-slate-400 text-xs">个人与团队</Text>
            </View>
          </View>
        </View>
        <View className="flex gap-2 mb-4">
          {Object.entries(statusMap).map(([key, config]) => (
            <View
              key={key}
              className={`flex-1 ${config.bg} rounded-xl p-3 ${statusFilter === key ? 'ring-2 ring-white' : ''}`}
              onClick={() => {
                setStatusFilter(statusFilter === key ? '' : key);
                handleSearch();
              }}
            >
              <config.icon size={16} className={config.color} />
              <Text className={`block text-lg font-bold mt-1 ${config.color}`}>
                {statistics?.statusDistribution?.[key === 'at_risk' ? 'atRisk' : key] || 0}
              </Text>
              <Text className="block text-slate-400 text-xs">{config.label}</Text>
            </View>
          ))}
        </View>

        {/* 搜索栏 */}
        <View className="flex gap-2 mb-4">
          <View className="flex-1 bg-slate-800 rounded-xl px-3 py-2 flex items-center">
            <Text>🔍</Text>
            <Input
              className="flex-1 text-white text-sm bg-transparent"
              placeholder="搜索客户姓名/电话"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              onConfirm={handleSearch}
            />
          </View>
          <View
            className="bg-blue-600 rounded-xl px-4 py-2 flex items-center justify-center"
            onClick={handleSearch}
          >
            <Text className="block text-white text-sm font-medium">搜索</Text>
          </View>
        </View>
      </View>

      {/* 客户列表 */}
      <ScrollView
        className="px-4 pb-20"
        scrollY
        onScrollToLower={handleLoadMore}
        style={{ height: 'calc(100vh - 280px)' }}
      >
        {customers.map((customer) => {
          const statusConfig = statusMap[customer.status];
          const orderConfig = orderStatusMap[customer.order_status];
          return (
            <View
              key={customer.id}
              className="bg-slate-800 rounded-xl p-4 mb-3"
              onClick={() => goToDetail(customer.id)}
            >
              <View className="flex justify-between items-start mb-2">
                <View className="flex items-center">
                  <Text className="block text-white text-base font-semibold mr-2">{customer.name}</Text>
                  <View className={`${statusConfig.bg} px-2 py-0.5 rounded-full`}>
                    <Text className={`block text-xs ${statusConfig.color}`}>{statusConfig.label}</Text>
                  </View>
                </View>
                <Text>{">"}</Text>
              </View>

              <View className="flex flex-wrap gap-y-2 mb-3">
                {customer.phone && (
                  <View className="flex items-center mr-4">
                    <Text>📞</Text>
                    <Text className="block text-slate-300 text-sm">{customer.phone}</Text>
                  </View>
                )}
                {customer.city && (
                  <View className="flex items-center mr-4">
                    <Text>📍</Text>
                    <Text className="block text-slate-300 text-sm">{customer.city}</Text>
                  </View>
                )}
                <View className="flex items-center">
                  <Text className={`block text-sm ${orderConfig.color}`}>{orderConfig.label}</Text>
                </View>
              </View>

              <View className="flex justify-between items-center pt-2 border-t border-slate-700">
                <Text className="block text-slate-400 text-xs">{customer.customer_type || '未分类'}</Text>
                <Text className="block text-emerald-400 text-sm font-medium">
                  ¥{(customer.estimated_amount || 0).toFixed(0)}万
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <View className="py-4 items-center">
            <Text className="block text-slate-400 text-sm">加载中...</Text>
          </View>
        )}

        {!hasMore && customers.length > 0 && (
          <View className="py-4 items-center">
            <Text className="block text-slate-400 text-sm">没有更多数据了</Text>
          </View>
        )}

        {customers.length === 0 && !loading && (
          <View className="py-12 items-center">
            <Text className="block text-slate-400 text-sm mb-2">暂无客户数据</Text>
            <Text className="block text-slate-400 text-xs">点击右下角添加新客户</Text>
          </View>
        )}
      </ScrollView>

      {/* 添加按钮 */}
      <View
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-600/30"
        style={{ zIndex: 100 }}
        onClick={goToCreate}
      >
        <Text>👤</Text>
      </View>
    </View>
  );
}
