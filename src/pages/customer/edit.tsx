import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
import { Network } from '@/network';

interface Customer {
  id?: string;
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
}

const customerSources = ['抖音', '小红书', '转介绍', '线下', '其他'];
const customerTypes = ['餐饮小白创业', '餐饮老板', '其他'];
const orderBelongings = ['星厨房总仓', '巴国城店', '五里店董家溪店'];
const statuses = [
  { value: 'normal', label: '正常' },
  { value: 'at_risk', label: '有风险' },
  { value: 'lost', label: '已流失' }
];
const orderStatuses = [
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已结束' }
];

export default function CustomerEdit() {
  const router = useRouter();
  const { id } = router.params;
  const isEdit = !!id;

  const [form, setForm] = useState<Customer>({
    name: '',
    status: 'normal',
    order_status: 'in_progress'
  });
  const [sourceIndex, setSourceIndex] = useState(0);
  const [typeIndex, setTypeIndex] = useState(0);
  const [belongingIndex, setBelongingIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [orderStatusIndex, setOrderStatusIndex] = useState(0);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const res = await Network.request({ url: `/api/customers/${id}` });
        console.log('[CustomerEdit] Load customer:', res.data);
        if (res.data.code === 200) {
          const data = res.data.data;
          setForm(data);
          // 设置picker索引
          setSourceIndex(customerSources.indexOf(data.source) || 0);
          setTypeIndex(customerTypes.indexOf(data.customer_type) || 0);
          setBelongingIndex(orderBelongings.indexOf(data.order_belonging) || 0);
          setStatusIndex(statuses.findIndex(s => s.value === data.status) || 0);
          setOrderStatusIndex(orderStatuses.findIndex(s => s.value === data.order_status) || 0);
        }
      } catch (err) {
        console.error('[CustomerEdit] Load customer error:', err);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      }
    };

    if (isEdit && id) {
      loadCustomer();
    }
  }, [id, isEdit]);

  const handleInput = (field: keyof Customer, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLocation = () => {
    Taro.chooseLocation({
      success: (res) => {
        setForm(prev => ({
          ...prev,
          city: res.address?.split('市')[0] + '市' || '',
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address + res.name
          }
        }));
      },
      fail: () => {
        Taro.showToast({ title: '请选择位置', icon: 'none' });
      }
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入客户称呼', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '保存中...' });

    try {
      const url = isEdit ? `/api/customers/${id}` : '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';

      console.log('[CustomerEdit] Submit:', { url, method, form });

      const res = await Network.request({
        url,
        method,
        data: form
      });

      console.log('[CustomerEdit] Submit result:', res.data);

      if (res.data.code === 200) {
        Taro.showToast({ title: isEdit ? '更新成功' : '创建成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
      }
    } catch (err) {
      console.error('[CustomerEdit] Submit error:', err);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 头部 */}
      <View className="px-4 pt-12 pb-4 bg-slate-800/50">
        <View className="flex items-center justify-between">
          <View className="flex items-center" onClick={goBack}>
            <Text>←</Text>
            <Text className="block text-white text-lg font-semibold ml-2">
              {isEdit ? '编辑客户' : '新增客户'}
            </Text>
          </View>
          <View
            className="bg-blue-600 px-4 py-2 rounded-full flex items-center"
            onClick={handleSubmit}
          >
            <Text>💾</Text>
            <Text className="block text-white text-sm ml-1">保存</Text>
          </View>
        </View>
      </View>

      <ScrollView className="px-4 pb-8" scrollY style={{ height: 'calc(100vh - 100px)' }}>
        {/* 基本信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">基本信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">客户称呼 <Text className="text-red-400">*</Text></Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2">
              <Input
                className="text-white text-sm bg-transparent"
                placeholder="请输入客户姓名"
                value={form.name}
                onInput={(e) => handleInput('name', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">手机号码</Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2 flex items-center">
              <Text>📞</Text>
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入手机号码"
                type="number"
                value={form.phone}
                onInput={(e) => handleInput('phone', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">微信号</Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2 flex items-center">
              <Text>💬</Text>
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入微信号"
                value={form.wechat}
                onInput={(e) => handleInput('wechat', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">小红书号</Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2 flex items-center">
              <Text>👤</Text>
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入小红书号"
                value={form.xiaohongshu}
                onInput={(e) => handleInput('xiaohongshu', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">抖音号</Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2 flex items-center">
              <Text>👤</Text>
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入抖音号"
                value={form.douyin}
                onInput={(e) => handleInput('douyin', e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 业务信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">业务信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">餐饮类别</Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2">
              <Input
                className="text-white text-sm bg-transparent"
                placeholder="如：火锅、烧烤、中餐等"
                value={form.category}
                onInput={(e) => handleInput('category', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">客户来源</Text>
            <Picker
              mode="selector"
              range={customerSources}
              value={sourceIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setSourceIndex(index);
                handleInput('source', customerSources[index]);
              }}
            >
              <View className="bg-slate-800 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{form.source || '请选择客户来源'}</Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">客户类别</Text>
            <Picker
              mode="selector"
              range={customerTypes}
              value={typeIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setTypeIndex(index);
                handleInput('customer_type', customerTypes[index]);
              }}
            >
              <View className="bg-slate-800 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{form.customer_type || '请选择客户类别'}</Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">预计销售金额（万元）</Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2 flex items-center">
              <Text>💰</Text>
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入预计金额"
                type="digit"
                value={form.estimated_amount?.toString()}
                onInput={(e) => handleInput('estimated_amount', parseFloat(e.detail.value) || 0)}
              />
            </View>
          </View>
        </View>

        {/* 位置信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">位置信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">所在城市</Text>
            <View className="bg-slate-800 rounded-lg px-3 py-2 flex items-center">
              <Text>📍</Text>
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入城市"
                value={form.city}
                onInput={(e) => handleInput('city', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">项目详细位置</Text>
            <View
              className="bg-slate-800 rounded-lg px-3 py-3 flex items-center"
              onClick={handleLocation}
            >
              <Text>🧭</Text>
              <Text className="flex-1 text-white text-sm">
                {form.location?.address || '点击选择位置'}
              </Text>
            </View>
          </View>
        </View>

        {/* 订单信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">订单信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">订单归属</Text>
            <Picker
              mode="selector"
              range={orderBelongings}
              value={belongingIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setBelongingIndex(index);
                handleInput('order_belonging', orderBelongings[index]);
              }}
            >
              <View className="bg-slate-800 rounded-lg px-3 py-2 flex items-center">
                <Text>🏠</Text>
                <Text className="flex-1 text-white text-sm">{form.order_belonging || '请选择订单归属'}</Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">客户状态</Text>
            <Picker
              mode="selector"
              range={statuses.map(s => s.label)}
              value={statusIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setStatusIndex(index);
                handleInput('status', statuses[index].value as any);
              }}
            >
              <View className="bg-slate-800 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{statuses[statusIndex].label}</Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">订单状态</Text>
            <Picker
              mode="selector"
              range={orderStatuses.map(s => s.label)}
              value={orderStatusIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setOrderStatusIndex(index);
                handleInput('order_status', orderStatuses[index].value as any);
              }}
            >
              <View className="bg-slate-800 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{orderStatuses[orderStatusIndex].label}</Text>
              </View>
            </Picker>
          </View>
        </View>

        {/* 客户需求 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-8">
          <Text className="block text-white text-base font-semibold mb-4">客户需求</Text>
          <View className="bg-slate-800 rounded-lg p-3">
            <Textarea
              className="w-full h-24 text-white text-sm bg-transparent"
              placeholder="请输入客户的具体需求..."
              value={form.requirements}
              onInput={(e) => handleInput('requirements', e.detail.value)}
              maxlength={500}
            />
            <Text className="block text-slate-400 text-xs text-right mt-1">
              {(form.requirements?.length || 0)}/500
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
