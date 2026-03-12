import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft, Save, Phone, MessageCircle, User,
  DollarSign, Store, Navigation
} from 'lucide-react-taro';

interface RecycleStore {
  id?: string;
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
}

const businessTypes = ['火锅', '烧烤', '中餐', '西餐', '快餐', '饮品店', '其他'];
const statuses = [
  { value: 'pending', label: '待接触' },
  { value: 'contacted', label: '已接触' },
  { value: 'assessing', label: '评估中' },
  { value: 'negotiating', label: '谈判中' },
  { value: 'deal', label: '已签约' },
  { value: 'recycling', label: '回收中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
];
const deviceStatuses = ['全部回收', '部分回收'];

export default function RecycleStoreEdit() {
  const router = useRouter();
  const { id } = router.params;
  const isEdit = !!id;

  const [form, setForm] = useState<RecycleStore>({
    store_name: '',
    recycle_status: 'pending'
  });
  const [businessTypeIndex, setBusinessTypeIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [deviceStatusIndex, setDeviceStatusIndex] = useState(0);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const res = await Network.request({ url: `/api/recycle/stores/${id}` });
        console.log('[RecycleEdit] Load store:', res.data);
        if (res.data.code === 200) {
          const data = res.data.data;
          setForm(data);
          setBusinessTypeIndex(businessTypes.indexOf(data.business_type) || 0);
          setStatusIndex(statuses.findIndex(s => s.value === data.recycle_status) || 0);
          setDeviceStatusIndex(deviceStatuses.indexOf(data.device_status) || 0);
        }
      } catch (err) {
        console.error('[RecycleEdit] Load store error:', err);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      }
    };

    if (isEdit && id) {
      loadStore();
    }
  }, [id, isEdit]);

  const handleInput = (field: keyof RecycleStore, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLocation = () => {
    Taro.chooseLocation({
      success: (res) => {
        setForm(prev => ({
          ...prev,
          city: res.address?.split('市')[0] + '市' || '',
          address: res.address + res.name,
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
    if (!form.store_name.trim()) {
      Taro.showToast({ title: '请输入门店名称', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '保存中...' });

    try {
      const url = isEdit ? `/api/recycle/stores/${id}` : '/api/recycle/stores';
      const method = isEdit ? 'PUT' : 'POST';

      console.log('[RecycleEdit] Submit:', { url, method, form });

      const res = await Network.request({
        url,
        method,
        data: form
      });

      console.log('[RecycleEdit] Submit result:', res.data);

      if (res.data.code === 200) {
        Taro.showToast({ title: isEdit ? '更新成功' : '创建成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
      }
    } catch (err) {
      console.error('[RecycleEdit] Submit error:', err);
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
            <ArrowLeft size={24} color="#ffffff" />
            <Text className="block text-white text-lg font-semibold ml-2">
              {isEdit ? '编辑门店' : '新增门店'}
            </Text>
          </View>
          <View
            className="bg-cyan-600 px-4 py-2 rounded-full flex items-center"
            onClick={handleSubmit}
          >
            <Save size={16} color="#ffffff" />
            <Text className="block text-white text-sm ml-1">保存</Text>
          </View>
        </View>
      </View>

      <ScrollView className="px-4 pb-8" scrollY style={{ height: 'calc(100vh - 100px)' }}>
        {/* 基本信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">基本信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">门店名称 <Text className="text-red-400">*</Text></Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <Store size={16} className="text-slate-400 mr-2" />
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入门店名称"
                value={form.store_name}
                onInput={(e) => handleInput('store_name', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">手机号码</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <Phone size={16} className="text-slate-400 mr-2" />
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
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <MessageCircle size={16} className="text-slate-400 mr-2" />
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
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <User size={16} className="text-slate-400 mr-2" />
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
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <User size={16} className="text-slate-400 mr-2" />
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入抖音号"
                value={form.douyin}
                onInput={(e) => handleInput('douyin', e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 位置信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">位置信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">所在城市</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2">
              <Input
                className="text-white text-sm bg-transparent"
                placeholder="请输入城市"
                value={form.city}
                onInput={(e) => handleInput('city', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">详细地址</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center justify-between">
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请选择或输入地址"
                value={form.address}
                onInput={(e) => handleInput('address', e.detail.value)}
              />
              <View className="ml-2" onClick={handleLocation}>
                <Navigation size={20} color="#06b6d4" />
              </View>
            </View>
          </View>
        </View>

        {/* 业务信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">业务信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">餐饮类别</Text>
            <Picker
              mode="selector"
              range={businessTypes}
              value={businessTypeIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setBusinessTypeIndex(index);
                handleInput('business_type', businessTypes[index]);
              }}
            >
              <View className="bg-slate-700 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{form.business_type || '请选择餐饮类别'}</Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">面积（㎡）</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2">
              <Input
                className="text-white text-sm bg-transparent"
                placeholder="请输入面积"
                type="digit"
                value={form.area_size?.toString()}
                onInput={(e) => handleInput('area_size', parseFloat(e.detail.value) || 0)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">开业时间</Text>
            <Picker
              mode="date"
              value={form.open_date || ''}
              onChange={(e) => handleInput('open_date', e.detail.value)}
            >
              <View className="bg-slate-700 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{form.open_date || '请选择开业时间'}</Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">关店原因</Text>
            <Textarea
              className="bg-slate-700 rounded-lg px-3 py-2 text-white text-sm min-h-[80px]"
              placeholder="请输入关店原因"
              value={form.close_reason}
              onInput={(e) => handleInput('close_reason', e.detail.value)}
            />
          </View>
        </View>

        {/* 回收信息 */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="block text-white text-base font-semibold mb-4">回收信息</Text>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">回收状态</Text>
            <Picker
              mode="selector"
              range={statuses.map(s => s.label)}
              value={statusIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setStatusIndex(index);
                handleInput('recycle_status', statuses[index].value);
              }}
            >
              <View className="bg-slate-700 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">
                  {statuses[statusIndex].label}
                </Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">预估设备清单</Text>
            <Textarea
              className="bg-slate-700 rounded-lg px-3 py-2 text-white text-sm min-h-[80px]"
              placeholder="请输入预估设备清单（如：冷柜2台、烤箱1台等）"
              value={form.estimated_devices}
              onInput={(e) => handleInput('estimated_devices', e.detail.value)}
            />
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">预估价值（元）</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <DollarSign size={16} className="text-slate-400 mr-2" />
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入预估价值"
                type="digit"
                value={form.estimated_value?.toString()}
                onInput={(e) => handleInput('estimated_value', parseFloat(e.detail.value) || 0)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">收购价格（元）</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <DollarSign size={16} className="text-emerald-400 mr-2" />
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入收购价格"
                type="digit"
                value={form.purchase_price?.toString()}
                onInput={(e) => handleInput('purchase_price', parseFloat(e.detail.value) || 0)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">运输成本（元）</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <DollarSign size={16} className="text-slate-400 mr-2" />
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入运输成本"
                type="digit"
                value={form.transport_cost?.toString()}
                onInput={(e) => handleInput('transport_cost', parseFloat(e.detail.value) || 0)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">人工成本（元）</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2 flex items-center">
              <DollarSign size={16} className="text-slate-400 mr-2" />
              <Input
                className="flex-1 text-white text-sm bg-transparent"
                placeholder="请输入人工成本"
                type="digit"
                value={form.labor_cost?.toString()}
                onInput={(e) => handleInput('labor_cost', parseFloat(e.detail.value) || 0)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">回收日期</Text>
            <Picker
              mode="date"
              value={form.recycle_date || ''}
              onChange={(e) => handleInput('recycle_date', e.detail.value)}
            >
              <View className="bg-slate-700 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{form.recycle_date || '请选择回收日期'}</Text>
              </View>
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">设备数量</Text>
            <View className="bg-slate-700 rounded-lg px-3 py-2">
              <Input
                className="text-white text-sm bg-transparent"
                placeholder="请输入设备数量"
                type="number"
                value={form.device_count?.toString()}
                onInput={(e) => handleInput('device_count', parseInt(e.detail.value) || 0)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="block text-slate-400 text-sm mb-2">设备状态</Text>
            <Picker
              mode="selector"
              range={deviceStatuses}
              value={deviceStatusIndex}
              onChange={(e) => {
                const index = parseInt(e.detail.value as string);
                setDeviceStatusIndex(index);
                handleInput('device_status', deviceStatuses[index]);
              }}
            >
              <View className="bg-slate-700 rounded-lg px-3 py-2">
                <Text className="block text-white text-sm">{form.device_status || '请选择设备状态'}</Text>
              </View>
            </Picker>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
