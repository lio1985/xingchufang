import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Save,
  Phone,
  MapPin,
  User,
  MessageCircle,
} from 'lucide-react-taro';

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
  { value: 'completed', label: '已成交' }
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
        if (res.data.code === 200) {
          const data = res.data.data;
          setForm(data);
          setSourceIndex(customerSources.indexOf(data.source) || 0);
          setTypeIndex(customerTypes.indexOf(data.customer_type) || 0);
          setBelongingIndex(orderBelongings.indexOf(data.order_belonging) || 0);
          setStatusIndex(statuses.findIndex(s => s.value === data.status) || 0);
          setOrderStatusIndex(orderStatuses.findIndex(s => s.value === data.order_status) || 0);
        }
      } catch (err) {
        console.error('加载客户信息失败:', err);
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

      const res = await Network.request({
        url,
        method,
        data: form
      });

      if (res.data.code === 200) {
        Taro.showToast({ title: isEdit ? '更新成功' : '创建成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
      }
    } catch (err) {
      console.error('保存客户失败:', err);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ display: 'flex', alignItems: 'center' }} onClick={goBack}>
          <ArrowLeft size={20} color="#ffffff" />
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginLeft: '12px' }}>
            {isEdit ? '编辑客户' : '新增客户'}
          </Text>
        </View>
        <View
          style={{ backgroundColor: '#f59e0b', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center' }}
          onClick={handleSubmit}
        >
          <Save size={16} color="#000000" />
          <Text style={{ fontSize: '14px', color: '#000000', fontWeight: '500', marginLeft: '4px' }}>保存</Text>
        </View>
      </View>

      <ScrollView style={{ padding: '16px 20px', height: 'calc(100vh - 100px)' }} scrollY>
        {/* 基本信息 */}
        <View style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#52525b', fontWeight: '500', marginBottom: '12px' }}>基本信息</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            {/* 客户称呼 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>客户称呼 <Text style={{ color: '#ef4444' }}>*</Text></Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ fontSize: '14px', color: '#ffffff' }}
                  placeholder="请输入客户姓名"
                  placeholderStyle="color: #52525b"
                  value={form.name}
                  onInput={(e) => handleInput('name', e.detail.value)}
                />
              </View>
            </View>

            {/* 手机号码 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>手机号码</Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <Phone size={16} color="#52525b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', marginLeft: '8px' }}
                  placeholder="请输入手机号码"
                  placeholderStyle="color: #52525b"
                  type="number"
                  value={form.phone}
                  onInput={(e) => handleInput('phone', e.detail.value)}
                />
              </View>
            </View>

            {/* 微信号 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>微信号</Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <MessageCircle size={16} color="#52525b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', marginLeft: '8px' }}
                  placeholder="请输入微信号"
                  placeholderStyle="color: #52525b"
                  value={form.wechat}
                  onInput={(e) => handleInput('wechat', e.detail.value)}
                />
              </View>
            </View>

            {/* 小红书号 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>小红书号</Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="#52525b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', marginLeft: '8px' }}
                  placeholder="请输入小红书号"
                  placeholderStyle="color: #52525b"
                  value={form.xiaohongshu}
                  onInput={(e) => handleInput('xiaohongshu', e.detail.value)}
                />
              </View>
            </View>

            {/* 抖音号 */}
            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>抖音号</Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="#52525b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', marginLeft: '8px' }}
                  placeholder="请输入抖音号"
                  placeholderStyle="color: #52525b"
                  value={form.douyin}
                  onInput={(e) => handleInput('douyin', e.detail.value)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 业务信息 */}
        <View style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#52525b', fontWeight: '500', marginBottom: '12px' }}>业务信息</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            {/* 餐饮类别 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>餐饮类别</Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                <Input
                  style={{ fontSize: '14px', color: '#ffffff' }}
                  placeholder="如：火锅、烧烤、中餐等"
                  placeholderStyle="color: #52525b"
                  value={form.category}
                  onInput={(e) => handleInput('category', e.detail.value)}
                />
              </View>
            </View>

            {/* 客户来源 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>客户来源</Text>
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
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                  <Text style={{ fontSize: '14px', color: form.source ? '#ffffff' : '#52525b' }}>{form.source || '请选择客户来源'}</Text>
                </View>
              </Picker>
            </View>

            {/* 客户类别 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>客户类别</Text>
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
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                  <Text style={{ fontSize: '14px', color: form.customer_type ? '#ffffff' : '#52525b' }}>{form.customer_type || '请选择客户类别'}</Text>
                </View>
              </Picker>
            </View>

            {/* 预计销售金额 */}
            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>预计销售金额（万元）</Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <Text style={{ fontSize: '14px', color: '#22c55e' }}>¥</Text>
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', marginLeft: '4px' }}
                  placeholder="请输入预计金额"
                  placeholderStyle="color: #52525b"
                  type="digit"
                  value={form.estimated_amount?.toString()}
                  onInput={(e) => handleInput('estimated_amount', parseFloat(e.detail.value) || 0)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 位置信息 */}
        <View style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#52525b', fontWeight: '500', marginBottom: '12px' }}>位置信息</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            {/* 所在城市 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>所在城市</Text>
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                <MapPin size={16} color="#52525b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff', marginLeft: '8px' }}
                  placeholder="请输入城市"
                  placeholderStyle="color: #52525b"
                  value={form.city}
                  onInput={(e) => handleInput('city', e.detail.value)}
                />
              </View>
            </View>

            {/* 项目详细位置 */}
            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>项目详细位置</Text>
              <View
                style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center' }}
                onClick={handleLocation}
              >
                <MapPin size={16} color="#f59e0b" />
                <Text style={{ flex: 1, fontSize: '14px', color: form.location?.address ? '#ffffff' : '#52525b', marginLeft: '8px' }}>
                  {form.location?.address || '点击选择位置'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 订单信息 */}
        <View style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#52525b', fontWeight: '500', marginBottom: '12px' }}>订单信息</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            {/* 订单归属 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>订单归属</Text>
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
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                  <Text style={{ fontSize: '14px', color: form.order_belonging ? '#ffffff' : '#52525b' }}>{form.order_belonging || '请选择订单归属'}</Text>
                </View>
              </Picker>
            </View>

            {/* 客户状态 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>客户状态</Text>
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
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                  <Text style={{ fontSize: '14px', color: '#ffffff' }}>{statuses[statusIndex].label}</Text>
                </View>
              </Picker>
            </View>

            {/* 订单状态 */}
            <View>
              <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px' }}>订单状态</Text>
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
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                  <Text style={{ fontSize: '14px', color: '#ffffff' }}>{orderStatuses[orderStatusIndex].label}</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>

        {/* 客户需求 */}
        <View style={{ marginBottom: '32px' }}>
          <Text style={{ fontSize: '12px', color: '#52525b', fontWeight: '500', marginBottom: '12px' }}>客户需求</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
              <Textarea
                style={{ width: '100%', height: '100px', fontSize: '14px', color: '#ffffff' }}
                placeholder="请输入客户的具体需求..."
                placeholderStyle="color: #52525b"
                value={form.requirements}
                onInput={(e) => handleInput('requirements', e.detail.value)}
                maxlength={500}
              />
            </View>
            <Text style={{ fontSize: '12px', color: '#52525b', textAlign: 'right', marginTop: '8px' }}>
              {(form.requirements?.length || 0)}/500
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
