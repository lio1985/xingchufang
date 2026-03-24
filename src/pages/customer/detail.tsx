import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import { Network } from '@/network';


interface Customer {
  id: string;
  name: string;
  wechat?: string;
  xiaohongshu?: string;
  douyin?: string;
  phone?: string;
  category?: string;
  city?: string;
  location?: { latitude: number; longitude: number; address: string };
  source?: string;
  customer_type?: string;
  requirements?: string;
  estimated_amount?: number;
  status: 'normal' | 'at_risk' | 'lost';
  order_belonging?: string;
  order_status: 'in_progress' | 'completed';
  first_follow_up_at?: string;
  updated_at: string;
  users?: { name: string };
}

interface FollowUp {
  id: string;
  follow_up_time: string;
  content: string;
  follow_up_method?: string;
  next_follow_up_plan?: string;
}

const statusMap = {
  normal: { label: '正常', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: 'C' },
  at_risk: { label: '有风险', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: 'T' },
  lost: { label: '已流失', color: 'text-red-400', bg: 'bg-red-500/20', icon: 'T' }
};

const orderStatusMap = {
  in_progress: { label: '进行中', color: 'text-blue-400' },
  completed: { label: '已成交', color: 'text-emerald-400' }
};

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.params;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpContent, setFollowUpContent] = useState('');
  const [followUpMethod, setFollowUpMethod] = useState('电话');

  const loadData = async () => {
    if (!id) return;
    try {
      const [customerRes, followUpsRes] = await Promise.all([
        Network.request({ url: `/api/customers/${id}/follow-ups` })
      ]);

      console.log('[CustomerDetail] Load data:', { customer: customerRes.data, followUps: followUpsRes.data });

      if (customerRes.data.code === 200) {
        setCustomer(customerRes.data.data);
      }
      if (followUpsRes.data.code === 200) {
        setFollowUps(followUpsRes.data.data || []);
      }
    } catch (err) {
      console.error('[CustomerDetail] Load data error:', err);
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
        url: `/api/customers/${id}/follow-ups`,
        method: 'POST',
        data: {
          followUpTime: new Date().toISOString(),
          content: followUpContent,
          followUpMethod: followUpMethod
        }
      });

      console.log('[CustomerDetail] Add follow-up:', res.data);

      if (res.data.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setFollowUpContent('');
        setShowAddFollowUp(false);
        loadData();
      }
    } catch (err) {
      console.error('[CustomerDetail] Add follow-up error:', err);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await Network.request({
              url: `/api/customers/${id}`,
              method: 'DELETE'
            });
            console.log('[CustomerDetail] Delete result:', result.data);

            if (result.data.code === 200) {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              setTimeout(() => Taro.navigateBack(), 1500);
            }
          } catch (err) {
            console.error('[CustomerDetail] Delete error:', err);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const goEdit = () => {
    Taro.navigateTo({ url: `/pages/customer/edit?id=${id}` });
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  const openLocation = () => {
    if (customer?.location) {
      Taro.openLocation({
        latitude: customer.location.latitude,
        longitude: customer.location.longitude,
        name: customer.name,
        address: customer.location.address
      });
    }
  };

  const makePhoneCall = () => {
    if (customer?.phone) {
      Taro.makePhoneCall({ phoneNumber: customer.phone });
    }
  };

  if (!customer) {
    return (
      <View className="min-h-screen bg-slate-900 items-center justify-center">
        <Text className="block text-slate-400">加载中...</Text>
      </View>
    );
  }

  const statusConfig = statusMap[customer.status];
  const orderConfig = orderStatusMap[customer.order_status];

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
            <Text className="block text-white text-2xl font-bold mr-3">{customer.name}</Text>
            <View className={`${statusConfig.bg} px-2 py-1 rounded-full flex items-center`}>
              <statusConfig.icon size={14} className={statusConfig.color} />
              <Text className={`block text-xs ml-1 ${statusConfig.color}`}>{statusConfig.label}</Text>
            </View>
          </View>
          <Text className={`block text-sm ${orderConfig.color}`}>{orderConfig.label}</Text>
        </View>
      </View>

      <ScrollView className="px-4 pb-24" scrollY style={{ height: 'calc(100vh - 160px)' }}>
        {/* 关键信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <View className="flex justify-between mb-4">
            <View className="items-center">
              <Text className="block text-2xl font-bold text-emerald-400">
                ¥{(customer.estimated_amount || 0).toFixed(0)}万
              </Text>
              <Text className="block text-slate-400 text-xs mt-1">预计金额</Text>
            </View>
            <View className="items-center">
              <Text className="block text-lg font-semibold text-white">
                {customer.order_belonging || '未分配'}
              </Text>
              <Text className="block text-slate-400 text-xs mt-1">订单归属</Text>
            </View>
          </View>

          <View className="border-t border-slate-700 pt-4">
            <View className="flex items-center mb-3" onClick={makePhoneCall}>
              <Text>📞</Text>
              <Text className="block text-white text-sm">{customer.phone || '未填写'}</Text>
            </View>
            <View className="flex items-center mb-3">
              <Text>💬</Text>
              <Text className="block text-white text-sm">{customer.wechat || '未填写'}</Text>
            </View>
            <View className="flex items-center mb-3">
              <Text>👤</Text>
              <Text className="block text-white text-sm">{customer.xiaohongshu || '未填写'}</Text>
            </View>
            <View className="flex items-center mb-3">
              <Text>👤</Text>
              <Text className="block text-white text-sm">{customer.douyin || '未填写'}</Text>
            </View>
            <View className="flex items-center" onClick={openLocation}>
              <Text>📍</Text>
              <Text className="block text-white text-sm flex-1">
                {customer.city || ''} {customer.location?.address || '未填写位置'}
              </Text>
              {customer.location && <Text>🧭</Text>}
            </View>
          </View>
        </View>

        {/* 业务信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">业务信息</Text>
          <View className="grid grid-cols-2 gap-4">
            <View>
              <Text className="block text-slate-400 text-xs mb-1">客户来源</Text>
              <Text className="block text-white text-sm">{customer.source || '未填写'}</Text>
            </View>
            <View>
              <Text className="block text-slate-400 text-xs mb-1">客户类别</Text>
              <Text className="block text-white text-sm">{customer.customer_type || '未填写'}</Text>
            </View>
            <View>
              <Text className="block text-slate-400 text-xs mb-1">餐饮类别</Text>
              <Text className="block text-white text-sm">{customer.category || '未填写'}</Text>
            </View>
            <View>
              <Text className="block text-slate-400 text-xs mb-1">负责人</Text>
              <Text className="block text-white text-sm">{customer.users?.name || '未分配'}</Text>
            </View>
          </View>
        </View>

        {/* 客户需求 */}
        {customer.requirements && (
          <View className="bg-slate-800 rounded-xl p-4 mb-4">
            <Text className="block text-white text-base font-semibold mb-2">客户需求</Text>
            <Text className="block text-slate-300 text-sm leading-relaxed">{customer.requirements}</Text>
          </View>
        )}

        {/* 跟进记录 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <View className="flex justify-between items-center mb-4">
            <Text className="block text-white text-base font-semibold">跟进记录</Text>
            <View
              className="bg-blue-600 px-3 py-1.5 rounded-full flex items-center"
              onClick={() => setShowAddFollowUp(true)}
            >
              <Text>➕</Text>
              <Text className="block text-white text-xs ml-1">添加</Text>
            </View>
          </View>

          {followUps.length === 0 ? (
            <View className="py-6 items-center">
              <Text className="block text-slate-400 text-sm">暂无跟进记录</Text>
            </View>
          ) : (
            <View>
              {followUps.map((followUp, index) => (
                <View key={followUp.id} className="relative pl-6 pb-6 last:pb-0">
                  {/* 时间线 */}
                  {index < followUps.length - 1 && (
                    <View className="absolute left-2 top-3 bottom-0 w-0.5 bg-slate-800" />
                  )}
                  <View className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-800" />

                  <View className="bg-slate-800 rounded-lg p-3">
                    <View className="flex justify-between items-start mb-2">
                      <Text className="block text-slate-400 text-xs">
                        {new Date(followUp.follow_up_time).toLocaleString('zh-CN')}
                      </Text>
                      {followUp.follow_up_method && (
                        <View className="bg-slate-700 px-2 py-0.5 rounded">
                          <Text className="block text-slate-300 text-xs">{followUp.follow_up_method}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="block text-white text-sm">{followUp.content}</Text>
                    {followUp.next_follow_up_plan && (
                      <View className="mt-2 pt-2 border-t border-slate-700">
                        <Text className="block text-blue-400 text-xs">下次计划：{followUp.next_follow_up_plan}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 最后更新时间 */}
        <View className="items-center py-4">
          <Text className="block text-slate-400 text-xs">
            最后更新：{new Date(customer.updated_at).toLocaleString('zh-CN')}
          </Text>
        </View>
      </ScrollView>

      {/* 添加跟进弹窗 */}
      {showAddFollowUp && (
        <View
          className="fixed inset-0 bg-black/70 items-center justify-center px-6"
          style={{ zIndex: 200 }}
        >
          <View className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm">
            <Text className="block text-white text-lg font-semibold mb-4">添加跟进记录</Text>

            <View className="mb-4">
              <Text className="block text-slate-400 text-sm mb-2">跟进方式</Text>
              <View className="flex gap-2">
                {['电话', '微信', '面谈', '其他'].map((method) => (
                  <View
                    key={method}
                    className={`px-3 py-1.5 rounded-full ${followUpMethod === method ? 'bg-blue-600' : 'bg-slate-800'}`}
                    onClick={() => setFollowUpMethod(method)}
                  >
                    <Text className="block text-white text-xs">{method}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="block text-slate-400 text-sm mb-2">跟进内容</Text>
              <View className="bg-slate-800 rounded-lg p-3">
                <Textarea
                  className="w-full h-24 text-white text-sm bg-transparent"
                  placeholder="请输入跟进内容..."
                  value={followUpContent}
                  onInput={(e) => setFollowUpContent(e.detail.value)}
                  maxlength={500}
                />
              </View>
            </View>

            <View className="flex gap-3">
              <View
                className="flex-1 bg-slate-800 py-3 rounded-xl items-center"
                onClick={() => setShowAddFollowUp(false)}
              >
                <Text className="block text-white text-sm">取消</Text>
              </View>
              <View
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
                onClick={handleAddFollowUp}
              >
                <Text className="block text-white text-sm font-medium">保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
