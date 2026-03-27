import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Save,
  Phone,
  MessageCircle,
  Store,
  Calendar,
  CircleDollarSign,
  Navigation,
  ChevronDown,
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const res = await Network.request({ url: `/api/recycle/stores/${id}` });
        console.log('[RecycleEdit] Load store:', res.data);
        if (res.data.code === 200) {
          const data = res.data.data;
          setForm(data);
          setBusinessTypeIndex(businessTypes.indexOf(data.business_type) >= 0 ? businessTypes.indexOf(data.business_type) : 0);
          setStatusIndex(statuses.findIndex(s => s.value === data.recycle_status) >= 0 ? statuses.findIndex(s => s.value === data.recycle_status) : 0);
          setDeviceStatusIndex(deviceStatuses.indexOf(data.device_status) >= 0 ? deviceStatuses.indexOf(data.device_status) : 0);
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
            longitude: res.longitude
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

    setSaving(true);

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
      setSaving(false);
    }
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center' }} onClick={goBack}>
            <ArrowLeft size={20} color="#ffffff" />
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginLeft: '8px' }}>
              {isEdit ? '编辑门店' : '新增门店'}
            </Text>
          </View>
          <View
            style={{ 
              backgroundColor: saving ? '#1e3a5f' : '#60a5fa', 
              borderRadius: '20px', 
              padding: '8px 16px', 
              display: 'flex', 
              alignItems: 'center' 
            }}
            onClick={saving ? undefined : handleSubmit}
          >
            <Save size={16} color={saving ? '#71717a' : '#ffffff'} />
            <Text style={{ fontSize: '14px', color: saving ? '#71717a' : '#ffffff', marginLeft: '4px' }}>保存</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 100px)' }}>
        {/* 基本信息 */}
        <View style={{ padding: '16px 20px 0' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '16px' }}>基本信息</Text>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>门店名称 <Text style={{ color: '#f87171' }}>*</Text></Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <Store size={16} color="#64748b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
                  placeholder="请输入门店名称"
                  placeholderStyle="color: #64748b"
                  value={form.store_name}
                  onInput={(e) => handleInput('store_name', e.detail.value)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>手机号码</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <Phone size={16} color="#64748b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
                  placeholder="请输入手机号码"
                  placeholderStyle="color: #64748b"
                  type="number"
                  value={form.phone}
                  onInput={(e) => handleInput('phone', e.detail.value)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>微信号</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <MessageCircle size={16} color="#64748b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
                  placeholder="请输入微信号"
                  placeholderStyle="color: #64748b"
                  value={form.wechat}
                  onInput={(e) => handleInput('wechat', e.detail.value)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>小红书号</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ width: '100%', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入小红书号"
                  placeholderStyle="color: #64748b"
                  value={form.xiaohongshu}
                  onInput={(e) => handleInput('xiaohongshu', e.detail.value)}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>抖音号</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ width: '100%', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入抖音号"
                  placeholderStyle="color: #64748b"
                  value={form.douyin}
                  onInput={(e) => handleInput('douyin', e.detail.value)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 位置信息 */}
        <View style={{ padding: '16px 20px 0' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '16px' }}>位置信息</Text>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>所在城市</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ width: '100%', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入城市"
                  placeholderStyle="color: #64748b"
                  value={form.city}
                  onInput={(e) => handleInput('city', e.detail.value)}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>详细地址</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请选择或输入地址"
                  placeholderStyle="color: #64748b"
                  value={form.address}
                  onInput={(e) => handleInput('address', e.detail.value)}
                />
                <View onClick={handleLocation}>
                  <Navigation size={18} color="#60a5fa" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 业务信息 */}
        <View style={{ padding: '16px 20px 0' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '16px' }}>业务信息</Text>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>餐饮类别</Text>
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
                <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: '14px', color: form.business_type ? '#ffffff' : '#64748b' }}>
                    {form.business_type || '请选择餐饮类别'}
                  </Text>
                  <ChevronDown size={16} color="#71717a" />
                </View>
              </Picker>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>面积（㎡）</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ width: '100%', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入面积"
                  placeholderStyle="color: #64748b"
                  type="digit"
                  value={form.area_size?.toString()}
                  onInput={(e) => handleInput('area_size', parseFloat(e.detail.value) || 0)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>开业时间</Text>
              <Picker
                mode="date"
                value={form.open_date || ''}
                onChange={(e) => handleInput('open_date', e.detail.value)}
              >
                <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: '14px', color: form.open_date ? '#ffffff' : '#64748b' }}>
                    {form.open_date || '请选择开业时间'}
                  </Text>
                  <Calendar size={16} color="#71717a" />
                </View>
              </Picker>
            </View>

            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>关店原因</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Textarea
                  style={{ width: '100%', minHeight: '80px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入关店原因"
                  placeholderStyle="color: #64748b"
                  value={form.close_reason}
                  onInput={(e) => handleInput('close_reason', e.detail.value)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 回收信息 */}
        <View style={{ padding: '16px 20px 80px' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '16px' }}>回收信息</Text>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>回收状态</Text>
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
                <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: '14px', color: '#ffffff' }}>
                    {statuses[statusIndex].label}
                  </Text>
                  <ChevronDown size={16} color="#71717a" />
                </View>
              </Picker>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>预估设备清单</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Textarea
                  style={{ width: '100%', minHeight: '80px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入预估设备清单（如：冷柜2台、烤箱1台等）"
                  placeholderStyle="color: #64748b"
                  value={form.estimated_devices}
                  onInput={(e) => handleInput('estimated_devices', e.detail.value)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>预估价值（元）</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <CircleDollarSign size={16} color="#64748b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
                  placeholder="请输入预估价值"
                  placeholderStyle="color: #64748b"
                  type="digit"
                  value={form.estimated_value?.toString()}
                  onInput={(e) => handleInput('estimated_value', parseFloat(e.detail.value) || 0)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>收购价格（元）</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <CircleDollarSign size={16} color="#4ade80" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
                  placeholder="请输入收购价格"
                  placeholderStyle="color: #64748b"
                  type="digit"
                  value={form.purchase_price?.toString()}
                  onInput={(e) => handleInput('purchase_price', parseFloat(e.detail.value) || 0)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>运输成本（元）</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ width: '100%', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入运输成本"
                  placeholderStyle="color: #64748b"
                  type="digit"
                  value={form.transport_cost?.toString()}
                  onInput={(e) => handleInput('transport_cost', parseFloat(e.detail.value) || 0)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>人工成本（元）</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ width: '100%', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入人工成本"
                  placeholderStyle="color: #64748b"
                  type="digit"
                  value={form.labor_cost?.toString()}
                  onInput={(e) => handleInput('labor_cost', parseFloat(e.detail.value) || 0)}
                />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>回收日期</Text>
              <Picker
                mode="date"
                value={form.recycle_date || ''}
                onChange={(e) => handleInput('recycle_date', e.detail.value)}
              >
                <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: '14px', color: form.recycle_date ? '#ffffff' : '#64748b' }}>
                    {form.recycle_date || '请选择回收日期'}
                  </Text>
                  <Calendar size={16} color="#71717a" />
                </View>
              </Picker>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>设备数量</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ width: '100%', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入设备数量"
                  placeholderStyle="color: #64748b"
                  type="number"
                  value={form.device_count?.toString()}
                  onInput={(e) => handleInput('device_count', parseInt(e.detail.value) || 0)}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>设备状态</Text>
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
                <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: '14px', color: form.device_status ? '#ffffff' : '#64748b' }}>
                    {form.device_status || '请选择设备状态'}
                  </Text>
                  <ChevronDown size={16} color="#71717a" />
                </View>
              </Picker>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
