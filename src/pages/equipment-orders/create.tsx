import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { ShoppingCart, Package, ChevronRight, ChevronLeft } from 'lucide-react-taro';
import { Network } from '@/network';

const CreateOrderPage = () => {
  const [orderType, setOrderType] = useState<'purchase' | 'transfer'>('purchase');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWechat, setCustomerWechat] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [submitting, setSubmitting] = useState(false);

  // 设备分类选项
  const categoryOptions = [
    '制冷设备',
    '厨房设备',
    '清洁设备',
    '食品加工设备',
    '烘焙设备',
    '饮品设备',
    '其他',
  ];

  const conditionOptions = ['全新', '9成新', '8成新', '7成新', '旧设备'];

  const priorityOptions = [
    { value: 'low', label: '低', color: '#71717a' },
    { value: 'normal', label: '普通', color: '#3b82f6' },
    { value: 'high', label: '高', color: '#f59e0b' },
    { value: 'urgent', label: '紧急', color: '#ef4444' },
  ];

  const handleSubmit = async () => {
    // 验证必填字段
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!customerPhone.trim()) {
      Taro.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await Network.request({
        url: '/api/equipment-orders',
        method: 'POST',
        data: {
          order_type: orderType,
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          brand: brand.trim(),
          model: model.trim(),
          condition: condition.trim(),
          expected_price: expectedPrice ? parseFloat(expectedPrice) : undefined,
          customer_phone: customerPhone.trim(),
          customer_wechat: customerWechat.trim(),
          customer_address: customerAddress.trim(),
          priority,
        },
      });

      if (res.data?.success) {
        Taro.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({ title: res.data?.message || '发布失败', icon: 'none' });
      }
    } catch (error) {
      console.error('发布订单失败:', error);
      Taro.showToast({ title: '发布失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectCategory = () => {
    Taro.showActionSheet({
      itemList: categoryOptions,
      success: (res) => {
        setCategory(categoryOptions[res.tapIndex]);
      },
    });
  };

  const handleSelectCondition = () => {
    Taro.showActionSheet({
      itemList: conditionOptions,
      success: (res) => {
        setCondition(conditionOptions[res.tapIndex]);
      },
    });
  };

  return (
    <ScrollView scrollY style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* 页面头部 */}
      <View style={{ backgroundColor: '#111827', padding: '48px 20px 20px', borderBottom: '1px solid #1e3a5f' }}>
        {/* 返回按钮 */}
        <View style={{ marginBottom: '16px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={24} color="#f59e0b" />
            <Text style={{ fontSize: '14px', color: '#f59e0b' }}>返回</Text>
          </View>
        </View>
      </View>

      {/* 订单类型选择 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>订单类型</Text>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: orderType === 'purchase' ? 'rgba(59, 130, 246, 0.2)' : '#111827',
              border: orderType === 'purchase' ? '2px solid #3b82f6' : '2px solid transparent',
            }}
            onClick={() => setOrderType('purchase')}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShoppingCart size={20} color={orderType === 'purchase' ? '#3b82f6' : '#71717a'} />
              <Text style={{ fontSize: '15px', fontWeight: '600', color: orderType === 'purchase' ? '#3b82f6' : '#ffffff' }}>客户求购</Text>
            </View>
            <Text style={{ fontSize: '12px', color: '#71717a' }}>客户发布的求购需求</Text>
          </View>

          <View
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: orderType === 'transfer' ? 'rgba(34, 197, 94, 0.2)' : '#111827',
              border: orderType === 'transfer' ? '2px solid #22c55e' : '2px solid transparent',
            }}
            onClick={() => setOrderType('transfer')}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Package size={20} color={orderType === 'transfer' ? '#22c55e' : '#71717a'} />
              <Text style={{ fontSize: '15px', fontWeight: '600', color: orderType === 'transfer' ? '#22c55e' : '#ffffff' }}>设备转让</Text>
            </View>
            <Text style={{ fontSize: '12px', color: '#71717a' }}>客户发布转让信息</Text>
          </View>
        </View>
      </View>

      {/* 基本信息 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>基本信息</Text>
        <View style={{ gap: '16px' }}>
          <View>
            <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>标题 *</Text>
            <View style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
              <Textarea
                style={{ width: '100%', minHeight: '60px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
                placeholder="请输入订单标题，如：求购二手四门冰柜"
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
                maxlength={100}
              />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>详细描述</Text>
            <View style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
              <Textarea
                style={{ width: '100%', minHeight: '100px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
                placeholder="请输入详细需求描述..."
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
                maxlength={500}
              />
            </View>
          </View>
        </View>
      </View>

      {/* 设备信息 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>设备信息</Text>
        <View style={{ gap: '12px' }}>
          {/* 分类选择 */}
          <View
            style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onClick={handleSelectCategory}
          >
            <View>
              <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>设备分类</Text>
              <Text style={{ fontSize: '14px', color: category ? '#ffffff' : '#71717a' }}>{category || '请选择分类'}</Text>
            </View>
            <ChevronRight size={16} color="#52525b" />
          </View>

          {/* 品牌型号 */}
          <View style={{ display: 'flex', gap: '12px' }}>
            <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
              <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>品牌</Text>
              <Textarea
                style={{ width: '100%', minHeight: '24px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
                placeholder="如：海尔"
                value={brand}
                onInput={(e) => setBrand(e.detail.value)}
              />
            </View>
            <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
              <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>型号</Text>
              <Textarea
                style={{ width: '100%', minHeight: '24px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
                placeholder="如：BCD-470"
                value={model}
                onInput={(e) => setModel(e.detail.value)}
              />
            </View>
          </View>

          {/* 设备状况和价格 */}
          <View style={{ display: 'flex', gap: '12px' }}>
            <View
              style={{ flex: 1, backgroundColor: '#111827', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={handleSelectCondition}
            >
              <View>
                <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>设备状况</Text>
                <Text style={{ fontSize: '14px', color: condition ? '#ffffff' : '#71717a' }}>{condition || '请选择'}</Text>
              </View>
              <ChevronRight size={16} color="#52525b" />
            </View>
            <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
              <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>期望价格</Text>
              <Textarea
                style={{ width: '100%', minHeight: '24px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
                placeholder="如：5000"
                value={expectedPrice}
                onInput={(e) => setExpectedPrice(e.detail.value)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* 客户信息 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>客户信息</Text>
        <View style={{ gap: '12px' }}>
          <View style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
            <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>联系电话 *</Text>
            <Textarea
              style={{ width: '100%', minHeight: '24px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
              placeholder="请输入客户联系电话"
              value={customerPhone}
              onInput={(e) => setCustomerPhone(e.detail.value)}
            />
          </View>
          <View style={{ display: 'flex', gap: '12px' }}>
            <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
              <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>微信号</Text>
              <Textarea
                style={{ width: '100%', minHeight: '24px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
                placeholder="选填"
                value={customerWechat}
                onInput={(e) => setCustomerWechat(e.detail.value)}
              />
            </View>
          </View>
          <View style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
            <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>地址</Text>
            <Textarea
              style={{ width: '100%', minHeight: '24px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
              placeholder="选填"
              value={customerAddress}
              onInput={(e) => setCustomerAddress(e.detail.value)}
            />
          </View>
        </View>
      </View>

      {/* 优先级 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>优先级</Text>
        <View style={{ display: 'flex', gap: '8px' }}>
          {priorityOptions.map((option) => (
            <View
              key={option.value}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: priority === option.value ? option.color + '20' : '#111827',
                border: priority === option.value ? `1px solid ${option.color}` : '1px solid transparent',
                textAlign: 'center',
              }}
              onClick={() => setPriority(option.value as any)}
            >
              <Text style={{ fontSize: '13px', color: priority === option.value ? option.color : '#71717a', fontWeight: '500' }}>{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 提交按钮 */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#111827',
          borderTop: '1px solid #1e3a5f',
          padding: '16px 20px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        }}
      >
        <View
          style={{
            padding: '14px',
            borderRadius: '12px',
            backgroundColor: submitting ? '#52525b' : '#f59e0b',
            textAlign: 'center',
          }}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0a0f1a' }}>{submitting ? '发布中...' : '发布订单'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateOrderPage;
