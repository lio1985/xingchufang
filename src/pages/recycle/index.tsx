import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { Network } from '@/network';
import { Store, Search, Plus, Phone, MapPin, TrendingUp, Check, Target, Activity } from 'lucide-react-taro';

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
  pending: { label: '待接触', color: 'text-slate-500', bg: 'bg-slate-500/20', icon: Target },
  contacted: { label: '已接触', color: 'text-sky-600', bg: 'bg-sky-500/20', icon: Activity },
  assessing: { label: '评估中', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Activity },
  negotiating: { label: '谈判中', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: TrendingUp },
  deal: { label: '已签约', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Check },
  recycling: { label: '回收中', color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: Store },
  completed: { label: '已完成', color: 'text-green-400', bg: 'bg-green-500/20', icon: Check },
  cancelled: { label: '已取消', color: 'text-red-400', bg: 'bg-red-500/20', icon: TrendingUp }
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


  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/recycle/detail?id=${id}` });
  };

  const goToCreate = () => {
    Taro.navigateTo({ url: '/pages/recycle/edit' });
  };

  const goToDashboard = () => {
    Taro.navigateTo({ url: '/pages/recycle/dashboard' });
  };

  return (
    <View className="min-h-screen bg-sky-50">
      {/* 顶部统计卡片 */}
      <View className="px-4 pt-4 pb-2">
        <View className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-4 mb-4">
          <View className="flex justify-between items-start mb-3">
            <Text className="text-white text-lg font-semibold block">回收总览</Text>
            <View
              className="bg-white/20 px-3 py-1 rounded-full"
              onClick={goToDashboard}
            >
              <Text className="block text-white text-xs">查看详情</Text>
            </View>
          </View>
          <View className="flex justify-between">
            <View className="items-center">
              <Text className="block text-2xl font-bold text-white">{statistics?.total || 0}</Text>
              <Text className="block text-cyan-200 text-xs mt-1">接触门店</Text>
            </View>
            <View className="items-center">
              <Text className="block text-2xl font-bold text-emerald-300">
                {statistics?.statusDistribution?.completed || 0}
              </Text>
              <Text className="block text-cyan-200 text-xs mt-1">已完成</Text>
            </View>
            <View className="items-center">
              <Text className="block text-xl font-bold text-amber-300">
                ¥{(statistics?.totalEstimatedValue || 0).toFixed(0)}万
              </Text>
              <Text className="block text-cyan-200 text-xs mt-1">预估价值</Text>
            </View>
          </View>
        </View>

        {/* 搜索栏 */}
        <View className="bg-white rounded-xl p-3 mb-4 flex items-center gap-3">
          <Search size={16} color="#94a3b8" />
          <Input
            className="flex-1 text-white text-sm bg-transparent"
            placeholder="搜索门店名称、电话、微信"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
          <View
            className="bg-cyan-600 px-3 py-1 rounded-lg"
            onClick={handleSearch}
          >
            <Text className="block text-white text-xs">搜索</Text>
          </View>
        </View>

        {/* 状态筛选 */}
        <View className="flex gap-2 mb-4 overflow-x-auto">
          <View
            className={`px-3 py-1 rounded-full whitespace-nowrap ${!statusFilter ? 'bg-cyan-600' : 'bg-white'}`}
            onClick={() => setStatusFilter('')}
          >
            <Text className={`block text-xs ${!statusFilter ? 'text-white' : 'text-slate-500'}`}>全部</Text>
          </View>
          {Object.entries(statusMap).map(([key, config]) => (
            <View
              key={key}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${statusFilter === key ? 'bg-cyan-600' : 'bg-white'}`}
              onClick={() => {
                setStatusFilter(key);
                setPage(1);
                setHasMore(true);
                loadStores(true, keyword, key);
              }}
            >
              <Text className={`block text-xs ${statusFilter === key ? 'text-white' : 'text-slate-500'}`}>
                {config.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 门店列表 */}
      <View className="px-4 pb-20">
        {stores.length === 0 && !loading ? (
          <View className="flex flex-col items-center justify-center py-20">
            <Store size={48} color="#64748b" />
            <Text className="block text-slate-500 text-sm mt-3">暂无回收门店</Text>
            <View
              className="mt-4 bg-cyan-600 px-6 py-2 rounded-full"
              onClick={goToCreate}
            >
              <Text className="block text-white text-sm">新增门店</Text>
            </View>
          </View>
        ) : (
          <View>
            {stores.map((store) => {
              const statusConfig = statusMap[store.recycle_status];
              return (
                <View
                  key={store.id}
                  className="bg-white rounded-xl p-4 mb-3"
                  onClick={() => goToDetail(store.id)}
                >
                  <View className="flex justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="flex items-center mb-1">
                        <Text className="block text-white text-base font-semibold mr-2">
                          {store.store_name}
                        </Text>
                        <View className={`${statusConfig.bg} px-2 py-0.5 rounded-full flex items-center`}>
                          <statusConfig.icon size={12} className={statusConfig.color} />
                          <Text className={`block text-xs ml-1 ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Text>
                        </View>
                      </View>
                      <Text className="block text-slate-500 text-xs">{store.business_type || '未分类'}</Text>
                    </View>
                  </View>

                  <View className="flex items-center mt-3">
                    <Phone size={14} className="text-slate-500 mr-2" />
                    <Text className="block text-slate-500 text-xs mr-4">
                      {store.phone || '未填写'}
                    </Text>
                    <MapPin size={14} className="text-slate-500 mr-2" />
                    <Text className="block text-slate-500 text-xs">
                      {store.city || '未填写'}
                    </Text>
                  </View>

                  {store.estimated_value && (
                    <View className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                      <Text className="block text-slate-500 text-xs">预估价值</Text>
                      <Text className="block text-cyan-400 text-sm font-semibold">
                        ¥{store.estimated_value.toFixed(0)}元
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {loading && (
          <View className="flex justify-center py-4">
            <Text className="block text-slate-500 text-sm">加载中...</Text>
          </View>
        )}

        {!hasMore && stores.length > 0 && (
          <View className="flex justify-center py-4">
            <Text className="block text-slate-500 text-xs">没有更多了</Text>
          </View>
        )}
      </View>

      {/* 新增按钮 */}
      <View
        className="fixed bottom-24 right-4 w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg"
        onClick={goToCreate}
      >
        <Plus size={24} color="#ffffff" />
      </View>
    </View>
  );
}
