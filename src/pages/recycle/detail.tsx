import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import { Network } from '@/network';

interface RecycleStore {
  id: string;
  store_name: string;
  phone?: string;
  wechat?: string;
  xiaohongshu?: string;
  douyin?: string;
  city?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  business_type?: string;
  area_size?: number;
  open_date?: string;
  close_reason?: string;
  recycle_status: 'pending' | 'contacted' | 'assessing' | 'negotiating' | 'deal' | 'recycling' | 'completed' | 'cancelled';
  estimated_devices?: string;
  estimated_value?: number;
  purchase_price?: number;
  transport_cost?: number;
  labor_cost?: number;
  total_cost?: number;
  recycle_date?: string;
  device_count?: number;
  device_status?: string;
  first_follow_up_at?: string;
  updated_at: string;
}

interface FollowUp {
  id: string;
  follow_up_time: string;
  content: string;
  follow_up_method?: string;
  next_follow_up_plan?: string;
  status_change?: string;
}

const statusMap = {
  cancelled: { label: '已取消', color: 'text-red-400', bg: 'bg-red-500/20', icon: TrendingUp }
};

export default function RecycleStoreDetail() {
  const router = useRouter();
  const { id } = router.params;

  const [store, setStore] = useState<RecycleStore | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpContent, setFollowUpContent] = useState('');
  const [followUpMethod, setFollowUpMethod] = useState('电话');

  const loadData = async () => {
    if (!id) return;
    try {
      const [storeRes, followUpsRes] = await Promise.all([
        Network.request({ url: `/api/recycle/stores/${id}/follow-ups` })
      ]);

      console.log('[RecycleDetail] Load data:', { store: storeRes.data, followUps: followUpsRes.data });

      if (storeRes.data.code === 200) {
        setStore(storeRes.data.data);
      }
      if (followUpsRes.data.code === 200) {
        setFollowUps(followUpsRes.data.data || []);
      }
    } catch (err) {
      console.error('[RecycleDetail] Load data error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddFollowUp = async () => {
    if (!followUpContent.trim()) {
      Taro.showToast({ title: '请输入跟进内容', icon: 'none' });
      return;
    }

    try {
      const res = await Network.request({
        url: `/api/recycle/stores/${id}/follow-ups`,
        method: 'POST',
        data: {
          followUpTime: new Date().toISOString(),
          content: followUpContent,
          followUpMethod: followUpMethod
        }
      });

      console.log('[RecycleDetail] Add follow-up:', res.data);

      if (res.data.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setFollowUpContent('');
        setShowAddFollowUp(false);
        loadData();
      } else {
        Taro.showToast({ title: res.data.msg || '添加失败', icon: 'none' });
      }
    } catch (err) {
      console.error('[RecycleDetail] Add follow-up error:', err);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
  };

  const handleDelete = async () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除此回收门店吗？',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          try {
            const res = await Network.request({
              url: `/api/recycle/stores/${id}`,
              method: 'DELETE'
            });

            if (res.data.code === 200) {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              setTimeout(() => {
                Taro.navigateBack();
              }, 1500);
            } else {
              Taro.showToast({ title: res.data.msg || '删除失败', icon: 'none' });
            }
          } catch (err) {
            console.error('[RecycleDetail] Delete error:', err);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  const goEdit = () => {
    Taro.navigateTo({ url: `/pages/recycle/edit?id=${id}` });
  };

  const openLocation = () => {
    if (store?.location) {
      Taro.openLocation({
        latitude: store.location.latitude,
        longitude: store.location.longitude,
        name: store.store_name,
        address: store.address || store.city || ''
      });
    }
  };

  const makePhoneCall = () => {
    if (store?.phone) {
      Taro.makePhoneCall({ phoneNumber: store.phone });
    }
  };

  if (!store) {
    return (
      <View className="min-h-screen bg-slate-900 items-center justify-center">
        <Text className="block text-slate-400">加载中...</Text>
      </View>
    );
  }

  const statusConfig = statusMap[store.recycle_status];

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 头部 */}
      <View className="px-4 pt-12 pb-4 bg-slate-800/50">
        <View className="flex items-center justify-between">
          <View className="flex items-center" onClick={goBack}>
            <Text>←</Text>
          </View>
          <View className="flex items-center gap-3">
            <View onClick={goEdit}>
              <Text>✏️</Text>
            </View>
            <View onClick={handleDelete}>
              <Text>🗑️</Text>
            </View>
          </View>
        </View>

        <View className="mt-4">
          <View className="flex items-center mb-2">
            <Text>🏪</Text>
            <Text className="block text-white text-xl font-bold">{store.store_name}</Text>
          </View>
          <View className={`${statusConfig.bg} px-3 py-1 rounded-full inline-flex items-center w-fit`}>
            <statusConfig.icon size={14} className={statusConfig.color} />
            <Text className={`block text-xs ml-1 ${statusConfig.color}`}>{statusConfig.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="px-4 pb-24" scrollY style={{ height: 'calc(100vh - 160px)' }}>
        {/* 关键信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <View className="flex justify-between mb-4">
            <View className="items-center">
              <Text className="block text-2xl font-bold text-cyan-400">
                ¥{(store.estimated_value || 0).toFixed(0)}
              </Text>
              <Text className="block text-slate-400 text-xs mt-1">预估价值（元）</Text>
            </View>
            {store.total_cost && (
              <View className="items-center">
                <Text className="block text-2xl font-bold text-emerald-400">
                  ¥{store.total_cost.toFixed(0)}
                </Text>
                <Text className="block text-slate-400 text-xs mt-1">总成本（元）</Text>
              </View>
            )}
          </View>

          <View className="border-t border-slate-700 pt-4">
            <View className="flex items-center mb-3" onClick={makePhoneCall}>
              <Text>📞</Text>
              <Text className="block text-white text-sm">{store.phone || '未填写'}</Text>
            </View>
            <View className="flex items-center mb-3">
              <Text>💬</Text>
              <Text className="block text-white text-sm">{store.wechat || '未填写'}</Text>
            </View>
            <View className="flex items-center mb-3">
              <Text>👤</Text>
              <Text className="block text-white text-sm">{store.xiaohongshu || '未填写'}</Text>
            </View>
            <View className="flex items-center mb-3">
              <Text>👤</Text>
              <Text className="block text-white text-sm">{store.douyin || '未填写'}</Text>
            </View>
            <View className="flex items-center" onClick={openLocation}>
              <Text>📍</Text>
              <Text className="block text-white text-sm flex-1">
                {store.city || ''} {store.address || '未填写地址'}
              </Text>
              {store.location && <Text>🧭</Text>}
            </View>
          </View>
        </View>

        {/* 业务信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">业务信息</Text>

          <View className="flex justify-between mb-3">
            <Text className="block text-slate-400 text-sm">餐饮类别</Text>
            <Text className="block text-white text-sm">{store.business_type || '未填写'}</Text>
          </View>
          <View className="flex justify-between mb-3">
            <Text className="block text-slate-400 text-sm">面积</Text>
            <Text className="block text-white text-sm">
              {store.area_size ? `${store.area_size}㎡` : '未填写'}
            </Text>
          </View>
          <View className="flex justify-between mb-3">
            <Text className="block text-slate-400 text-sm">开业时间</Text>
            <Text className="block text-white text-sm">{store.open_date || '未填写'}</Text>
          </View>
          {store.close_reason && (
            <View className="mt-3 pt-3 border-t border-slate-700">
              <Text className="block text-slate-400 text-sm mb-2">关店原因</Text>
              <Text className="block text-white text-sm">{store.close_reason}</Text>
            </View>
          )}
        </View>

        {/* 回收信息 */}
        {(store.estimated_devices || store.purchase_price || store.recycle_date) && (
          <View className="bg-slate-800 rounded-xl p-4 mb-4">
            <Text className="block text-white text-base font-semibold mb-4">回收信息</Text>

            {store.estimated_devices && (
              <View className="mb-3">
                <Text className="block text-slate-400 text-sm mb-2">预估设备清单</Text>
                <Text className="block text-white text-sm">{store.estimated_devices}</Text>
              </View>
            )}
            {store.purchase_price && (
              <View className="flex justify-between mb-3">
                <Text className="block text-slate-400 text-sm">收购价格</Text>
                <Text className="block text-emerald-400 text-sm font-semibold">
                  ¥{store.purchase_price.toFixed(0)}
                </Text>
              </View>
            )}
            {store.recycle_date && (
              <View className="flex justify-between mb-3">
                <Text className="block text-slate-400 text-sm">回收日期</Text>
                <Text className="block text-white text-sm">{store.recycle_date}</Text>
              </View>
            )}
            {store.device_count && (
              <View className="flex justify-between">
                <Text className="block text-slate-400 text-sm">设备数量</Text>
                <Text className="block text-white text-sm">{store.device_count}台</Text>
              </View>
            )}
          </View>
        )}

        {/* 跟进记录 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <View className="flex justify-between items-center mb-4">
            <Text className="block text-white text-base font-semibold">跟进记录</Text>
            <View
              className="bg-cyan-600 px-3 py-1 rounded-full"
              onClick={() => setShowAddFollowUp(true)}
            >
              <Text className="block text-white text-xs flex items-center">
                <Text>➕</Text>新增
              </Text>
            </View>
          </View>

          {followUps.length === 0 ? (
            <View className="text-center py-8">
              <Text className="block text-slate-400 text-sm">暂无跟进记录</Text>
            </View>
          ) : (
            <View>
              {followUps.map((followUp) => (
                <View key={followUp.id} className="border-l-2 border-slate-700 pl-4 mb-4">
                  <View className="flex items-center justify-between mb-2">
                    <Text className="block text-slate-400 text-xs">
                      {new Date(followUp.follow_up_time).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    {followUp.follow_up_method && (
                      <View className="bg-slate-800 px-2 py-0.5 rounded">
                        <Text className="block text-slate-400 text-xs">
                          {followUp.follow_up_method}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="block text-white text-sm mb-2">{followUp.content}</Text>
                  {followUp.next_follow_up_plan && (
                    <View className="mt-2 pt-2 border-t border-slate-700">
                      <Text className="block text-slate-400 text-xs">
                        下次计划：{followUp.next_follow_up_plan}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 新增跟进弹窗 */}
      {showAddFollowUp && (
        <View className="fixed inset-0 bg-black/50 flex items-end z-50">
          <View className="bg-slate-800 w-full rounded-t-2xl p-4">
            <View className="flex justify-between items-center mb-4">
              <Text className="block text-white text-base font-semibold">新增跟进记录</Text>
              <View onClick={() => setShowAddFollowUp(false)}>
                <Text className="block text-slate-400 text-xl">×</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="block text-slate-400 text-sm mb-2">跟进方式</Text>
              <View className="flex gap-2">
                {['电话', '微信', '上门'].map((method) => (
                  <View
                    key={method}
                    className={`px-4 py-2 rounded-lg ${followUpMethod === method ? 'bg-cyan-600' : 'bg-slate-800'}`}
                    onClick={() => setFollowUpMethod(method)}
                  >
                    <Text className={`block text-sm ${followUpMethod === method ? 'text-white' : 'text-slate-400'}`}>
                      {method}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="block text-slate-400 text-sm mb-2">跟进内容</Text>
              <Textarea
                className="bg-slate-800 rounded-lg p-3 text-white text-sm min-h-[100px]"
                placeholder="请输入跟进内容"
                value={followUpContent}
                onInput={(e) => setFollowUpContent(e.detail.value)}
              />
            </View>

            <View
              className="bg-cyan-600 rounded-xl py-3"
              onClick={handleAddFollowUp}
            >
              <Text className="block text-white text-center text-sm font-semibold">确定</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
