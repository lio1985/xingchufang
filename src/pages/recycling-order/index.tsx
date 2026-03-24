import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  category: string;
  brand: string;
  weight: number;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  pickupTime?: string;
  remark?: string;
}

const statusMap = {
  pending: { label: '待处理', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  processing: { label: '处理中', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  completed: { label: '已完成', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  cancelled: { label: '已取消', color: '#71717a', bg: 'rgba(113, 113, 122, 0.1)' }
};

const categories = ['全部', '废旧衣物', '电子产品', '金属', '塑料', '纸张', '玻璃', '其他'];

const RecyclingOrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('全部');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    category: '废旧衣物',
    brand: '',
    weight: '',
    price: '',
    remark: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, selectedCategory, searchKeyword]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/recycling-orders',
        method: 'GET'
      });

      if (res.data.code === 200) {
        setOrders(res.data.data || []);
      }
    } catch (error) {
      console.error('加载订单失败', error);
      const localData = Taro.getStorageSync('recyclingOrders') || [];
      setOrders(localData);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (selectedStatus !== '全部') {
      filtered = filtered.filter(o => o.status === selectedStatus);
    }

    if (selectedCategory !== '全部') {
      filtered = filtered.filter(o => o.category === selectedCategory);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNo.toLowerCase().includes(keyword) ||
        o.customerName.toLowerCase().includes(keyword) ||
        o.customerPhone.includes(keyword)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleAddOrder = () => {
    if (!newOrder.customerName.trim()) {
      Taro.showToast({ title: '请输入客户姓名', icon: 'none' });
      return;
    }
    if (!newOrder.customerPhone.trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }

    const order: Order = {
      id: Date.now().toString(),
      orderNo: `RC${Date.now()}`,
      customerName: newOrder.customerName.trim(),
      customerPhone: newOrder.customerPhone.trim(),
      category: newOrder.category,
      brand: newOrder.brand.trim(),
      weight: parseFloat(newOrder.weight) || 0,
      price: parseFloat(newOrder.price) || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      remark: newOrder.remark.trim()
    };

    const updated = [order, ...orders];
    setOrders(updated);
    Taro.setStorageSync('recyclingOrders', updated);
    Taro.showToast({ title: '添加成功', icon: 'success' });

    setNewOrder({ customerName: '', customerPhone: '', category: '废旧衣物', brand: '', weight: '', price: '', remark: '' });
    setShowAddDialog(false);
  };

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    Taro.setStorageSync('recyclingOrders', updated);
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  };

  const getStatusCounts = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length
    };
  };

  const stats = getStatusCounts();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '120px' }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <View style={{ padding: '8px' }} onClick={() => Taro.navigateBack()}>
            <Text style={{ fontSize: '32px', color: '#fafafa' }}>←</Text>
          </View>
          <Text style={{ fontSize: '36px', fontWeight: '700', color: '#fafafa' }}>回收订单</Text>
        </View>

        {/* 搜索框 */}
        <View style={{
          backgroundColor: '#1a1a1d',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <Text style={{ fontSize: '28px', color: '#71717a' }}>🔍</Text>
          <Input
            style={{ flex: 1, fontSize: '28px', color: '#fafafa' }}
            placeholder="搜索订单/客户..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 状态统计 */}
        <View style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[
            { key: '全部', count: stats.total, color: '#fafafa' },
            { key: 'pending', count: stats.pending, color: '#f59e0b' },
            { key: 'processing', count: stats.processing, color: '#3b82f6' },
            { key: 'completed', count: stats.completed, color: '#22c55e' }
          ].map((item) => (
            <View
              key={item.key}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: selectedStatus === item.key ? item.color : '#141416',
                borderRadius: '12px',
                textAlign: 'center',
                border: selectedStatus === item.key ? 'none' : '1px solid #27272a'
              }}
              onClick={() => setSelectedStatus(item.key)}
            >
              <Text style={{ fontSize: '28px', fontWeight: '600', color: selectedStatus === item.key ? '#000' : item.color, display: 'block' }}>
                {item.count}
              </Text>
              <Text style={{ fontSize: '20px', color: selectedStatus === item.key ? '#000' : '#71717a', marginTop: '4px' }}>
                {item.key === '全部' ? '全部' : statusMap[item.key as keyof typeof statusMap].label}
              </Text>
            </View>
          ))}
        </View>

        {/* 分类筛选 */}
        <ScrollView scrollX showHorizontalScrollIndicator={false}>
          <View style={{ display: 'flex', gap: '12px', paddingRight: '32px' }}>
            {categories.map((cat) => (
              <View
                key={cat}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  backgroundColor: selectedCategory === cat ? '#f59e0b' : '#141416',
                  color: selectedCategory === cat ? '#000' : '#a1a1aa',
                  borderRadius: '10px',
                  fontSize: '22px'
                }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 订单列表 */}
      <View style={{ padding: '32px' }}>
        {loading ? (
          <View style={{ textAlign: 'center', paddingTop: '120px' }}>
            <Text style={{ fontSize: '64px' }}>⏳</Text>
            <Text style={{ fontSize: '28px', color: '#71717a', marginTop: '24px' }}>加载中...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={{ textAlign: 'center', paddingTop: '120px' }}>
            <Text style={{ fontSize: '80px' }}>♻️</Text>
            <Text style={{ fontSize: '28px', color: '#71717a', marginTop: '24px' }}>暂无订单</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View
              key={order.id}
              style={{
                backgroundColor: '#141416',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '16px',
                border: '1px solid #27272a'
              }}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <View>
                  <Text style={{ fontSize: '24px', color: '#71717a' }}>订单号</Text>
                  <Text style={{ fontSize: '26px', color: '#fafafa', marginTop: '4px' }}>{order.orderNo}</Text>
                </View>
                <View style={{
                  padding: '8px 16px',
                  backgroundColor: statusMap[order.status].bg,
                  borderRadius: '8px'
                }}>
                  <Text style={{ fontSize: '22px', color: statusMap[order.status].color }}>
                    {statusMap[order.status].label}
                  </Text>
                </View>
              </View>

              <View style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <View style={{ padding: '8px 12px', backgroundColor: '#1a1a1d', borderRadius: '8px' }}>
                  <Text style={{ fontSize: '22px', color: '#a1a1aa' }}>📦 {order.category}</Text>
                </View>
                <View style={{ padding: '8px 12px', backgroundColor: '#1a1a1d', borderRadius: '8px' }}>
                  <Text style={{ fontSize: '22px', color: '#a1a1aa' }}>⚖️ {order.weight}kg</Text>
                </View>
                <View style={{ padding: '8px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                  <Text style={{ fontSize: '22px', color: '#f59e0b' }}>💰 ¥{order.price}</Text>
                </View>
              </View>

              <View style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: '#1a1a1d',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <View>
                  <Text style={{ fontSize: '28px', color: '#fafafa' }}>{order.customerName}</Text>
                  <Text style={{ fontSize: '24px', color: '#71717a', marginTop: '4px' }}>{order.customerPhone}</Text>
                </View>
                <View style={{ display: 'flex', gap: '12px' }}>
                  <Text style={{ fontSize: '28px' }} onClick={() => Taro.makePhoneCall({ phoneNumber: order.customerPhone })}>📞</Text>
                  <Text style={{ fontSize: '28px' }} onClick={() => Taro.setClipboardData({ data: order.customerPhone })}>📋</Text>
                </View>
              </View>

              {order.remark && (
                <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '16px' }}>
                  💡 {order.remark}
                </Text>
              )}

              <Text style={{ fontSize: '20px', color: '#52525b', marginBottom: '16px' }}>
                📅 {formatDate(order.createdAt)}
              </Text>

              {/* 操作按钮 */}
              {order.status === 'pending' && (
                <View style={{ display: 'flex', gap: '12px' }}>
                  <View 
                    style={{ flex: 1, padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', textAlign: 'center' }}
                    onClick={() => handleUpdateStatus(order.id, 'processing')}
                  >
                    <Text style={{ fontSize: '26px', color: '#f59e0b' }}>开始处理</Text>
                  </View>
                  <View 
                    style={{ flex: 1, padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', textAlign: 'center' }}
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                  >
                    <Text style={{ fontSize: '26px', color: '#ef4444' }}>取消订单</Text>
                  </View>
                </View>
              )}
              {order.status === 'processing' && (
                <View style={{ display: 'flex', gap: '12px' }}>
                  <View 
                    style={{ flex: 1, padding: '16px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', textAlign: 'center' }}
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                  >
                    <Text style={{ fontSize: '26px', color: '#22c55e' }}>✅ 完成回收</Text>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* 悬浮添加按钮 */}
      <View 
        style={{
          position: 'fixed',
          right: '32px',
          bottom: '140px',
          width: '112px',
          height: '112px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
          borderRadius: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
          zIndex: 100
        }}
        onClick={() => setShowAddDialog(true)}
      >
        +
      </View>

      {/* 新增订单弹窗 */}
      {showAddDialog && (
        <View style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}
          onClick={() => setShowAddDialog(false)}
        >
          <View 
            style={{
              width: '100%',
              backgroundColor: '#141416',
              borderRadius: '32px 32px 0 0',
              padding: '32px',
              maxHeight: '85vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <Text style={{ fontSize: '32px', fontWeight: '600', color: '#fafafa' }}>新建回收订单</Text>
              <Text style={{ fontSize: '28px', color: '#71717a' }} onClick={() => setShowAddDialog(false)}>✕</Text>
            </View>

            <ScrollView scrollY style={{ maxHeight: 'calc(85vh - 200px)' }}>
              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>客户姓名 *</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                  placeholder="请输入姓名"
                  placeholderStyle="color: #52525b"
                  value={newOrder.customerName}
                  onInput={(e) => setNewOrder({ ...newOrder, customerName: e.detail.value })}
                />
              </View>

              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>手机号 *</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                  placeholder="请输入手机号"
                  placeholderStyle="color: #52525b"
                  type="number"
                  value={newOrder.customerPhone}
                  onInput={(e) => setNewOrder({ ...newOrder, customerPhone: e.detail.value })}
                />
              </View>

              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>回收类别</Text>
                <ScrollView scrollX showHorizontalScrollIndicator={false}>
                  <View style={{ display: 'flex', gap: '12px' }}>
                    {categories.slice(1).map((cat) => (
                      <View
                        key={cat}
                        style={{
                          flexShrink: 0,
                          padding: '12px 20px',
                          backgroundColor: newOrder.category === cat ? '#f59e0b' : '#1a1a1d',
                          color: newOrder.category === cat ? '#000' : '#a1a1aa',
                          borderRadius: '12px',
                          fontSize: '24px'
                        }}
                        onClick={() => setNewOrder({ ...newOrder, category: cat })}
                      >
                        {cat}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>重量(kg)</Text>
                  <Input
                    style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                    placeholder="0"
                    placeholderStyle="color: #52525b"
                    type="digit"
                    value={newOrder.weight}
                    onInput={(e) => setNewOrder({ ...newOrder, weight: e.detail.value })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>预估金额(¥)</Text>
                  <Input
                    style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                    placeholder="0"
                    placeholderStyle="color: #52525b"
                    type="digit"
                    value={newOrder.price}
                    onInput={(e) => setNewOrder({ ...newOrder, price: e.detail.value })}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '32px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>备注</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                  placeholder="添加备注信息..."
                  placeholderStyle="color: #52525b"
                  value={newOrder.remark}
                  onInput={(e) => setNewOrder({ ...newOrder, remark: e.detail.value })}
                />
              </View>

              <View
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                  borderRadius: '16px',
                  padding: '28px',
                  textAlign: 'center'
                }}
                onClick={handleAddOrder}
              >
                <Text style={{ fontSize: '32px', fontWeight: '600', color: '#000' }}>创建订单</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecyclingOrderPage;
