import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Plus,
  Search,
  Package,
  Scale,
  DollarSign,
  CircleCheck,
  CircleX,
  X,
  RefreshCw,
  Inbox,
  ArrowRight,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import './index.css';

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
  cancelled: { label: '已取消', color: '#71717a', bg: 'rgba(113, 113, 122, 0.1)' },
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
    remark: '',
  });

  const filterOrders = useCallback(() => {
    let filtered = orders;

    if (selectedStatus !== '全部') {
      filtered = filtered.filter((o) => o.status === selectedStatus);
    }

    if (selectedCategory !== '全部') {
      filtered = filtered.filter((o) => o.category === selectedCategory);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(keyword) ||
          o.customerName.toLowerCase().includes(keyword) ||
          o.customerPhone.includes(keyword)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, selectedCategory, searchKeyword]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/recycling-orders',
        method: 'GET',
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
      remark: newOrder.remark.trim(),
    };

    const updated = [order, ...orders];
    setOrders(updated);
    Taro.setStorageSync('recyclingOrders', updated);
    Taro.showToast({ title: '添加成功', icon: 'success' });

    setNewOrder({
      customerName: '',
      customerPhone: '',
      category: '废旧衣物',
      brand: '',
      weight: '',
      price: '',
      remark: '',
    });
    setShowAddDialog(false);
  };

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    Taro.setStorageSync('recyclingOrders', updated);
    Taro.showToast({ title: '状态已更新', icon: 'success' });
  };

  const getStatusCounts = () => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  };

  const stats = getStatusCounts();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View className="recycling-order-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top">
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#fafafa" />
            </View>
            <View className="header-title-group">
              <Text className="header-title">回收订单</Text>
              <Text className="header-subtitle">{orders.length} 个订单</Text>
            </View>
          </View>

          <View className="primary-action-btn" onClick={() => setShowAddDialog(true)}>
            <Plus size={40} color="#000" />
          </View>
        </View>

        {/* 搜索框 */}
        <View className="search-box">
          <Search size={28} color="#71717a" />
          <Input
            className="search-input"
            placeholder="搜索订单/客户..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 状态统计 */}
        <ScrollView scrollX className="order-stats">
          {[
            { key: '全部', count: stats.total, activeColor: '#fafafa' },
            { key: 'pending', count: stats.pending, activeColor: '#f59e0b' },
            { key: 'processing', count: stats.processing, activeColor: '#3b82f6' },
            { key: 'completed', count: stats.completed, activeColor: '#22c55e' },
          ].map((item) => (
            <View
              key={item.key}
              className={`stat-card ${selectedStatus === item.key ? 'stat-card-active' : ''}`}
              style={selectedStatus === item.key ? { borderColor: item.activeColor } : {}}
              onClick={() => setSelectedStatus(item.key)}
            >
              <Text className="stat-number" style={selectedStatus === item.key ? { color: item.activeColor } : {}}>
                {item.count}
              </Text>
              <Text className="stat-label">
                {item.key === '全部' ? '全部' : statusMap[item.key as keyof typeof statusMap].label}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 分类筛选 */}
        <ScrollView scrollX>
          <View style={{ display: 'flex', gap: '12px', paddingRight: '32px', marginTop: '16px' }}>
            {categories.map((cat) => (
              <View
                key={cat}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  backgroundColor: selectedCategory === cat ? '#f59e0b' : '#141416',
                  color: selectedCategory === cat ? '#000' : '#a1a1aa',
                  borderRadius: '10px',
                  fontSize: '22px',
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
      <View className="content-area">
        {loading ? (
          <View className="loading-state">
            <RefreshCw size={64} color="#f59e0b" />
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="empty-state">
            <Inbox size={80} color="#71717a" />
            <Text className="empty-title">
              {searchKeyword ? '没有找到相关订单' : '暂无订单'}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} className="order-card">
              <View className="order-header">
                <View style={{ flex: 1 }}>
                  <Text className="order-no">{order.orderNo}</Text>
                  <Text className="order-customer">{order.customerName}</Text>
                </View>
                <View
                  className={`order-status-badge status-${order.status}`}
                >
                  {statusMap[order.status].label}
                </View>
              </View>

              <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '16px 0' }}>
                <View className="info-tag">
                  <Package size={18} color="#a1a1aa" />
                  <Text style={{ fontSize: '22px', color: '#a1a1aa' }}>{order.category}</Text>
                </View>
                <View className="info-tag">
                  <Scale size={18} color="#a1a1aa" />
                  <Text style={{ fontSize: '22px', color: '#a1a1aa' }}>{order.weight}kg</Text>
                </View>
                <View className="info-tag" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <DollarSign size={18} color="#f59e0b" />
                  <Text style={{ fontSize: '22px', color: '#f59e0b' }}>¥{order.price}</Text>
                </View>
              </View>

              <View className="order-info-row">
                <Text className="order-info-label">客户电话</Text>
                <Text className="order-info-value">{order.customerPhone}</Text>
              </View>

              <View className="order-info-row">
                <Text className="order-info-label">创建时间</Text>
                <Text className="order-info-value">{formatDate(order.createdAt)}</Text>
              </View>

              {order.status === 'pending' && (
                <View className="order-actions">
                  <View
                    className="order-action-btn order-action-secondary"
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                  >
                    <CircleX size={20} color="#71717a" />
                    <Text style={{ marginLeft: '8px' }}>取消</Text>
                  </View>
                  <View
                    className="order-action-btn order-action-primary"
                    onClick={() => handleUpdateStatus(order.id, 'processing')}
                  >
                    <ArrowRight size={20} color="#000" />
                    <Text style={{ marginLeft: '8px' }}>开始处理</Text>
                  </View>
                </View>
              )}

              {order.status === 'processing' && (
                <View className="order-actions">
                  <View
                    className="order-action-btn order-action-primary"
                    style={{ width: '100%' }}
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                  >
                    <CircleCheck size={20} color="#000" />
                    <Text style={{ marginLeft: '8px' }}>完成订单</Text>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* 新增订单弹窗 */}
      {showAddDialog && (
        <View className="modal-overlay" onClick={() => setShowAddDialog(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">新建订单</Text>
              <View onClick={() => setShowAddDialog(false)}>
                <X size={28} color="#71717a" />
              </View>
            </View>

            <View className="form-group">
              <Text className="form-label">客户姓名</Text>
              <Input
                className="form-input"
                placeholder="请输入客户姓名"
                placeholderStyle="color: #52525b"
                value={newOrder.customerName}
                onInput={(e) => setNewOrder({ ...newOrder, customerName: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">客户电话</Text>
              <Input
                className="form-input"
                placeholder="请输入客户电话"
                placeholderStyle="color: #52525b"
                value={newOrder.customerPhone}
                onInput={(e) => setNewOrder({ ...newOrder, customerPhone: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">物品类别</Text>
              <ScrollView scrollX>
                <View style={{ display: 'flex', gap: '12px' }}>
                  {categories.slice(1).map((cat) => (
                    <View
                      key={cat}
                      style={{
                        flexShrink: 0,
                        padding: '12px 20px',
                        backgroundColor: newOrder.category === cat ? '#f59e0b' : '#1a1a1d',
                        borderRadius: '12px',
                        fontSize: '24px',
                        color: newOrder.category === cat ? '#000' : '#a1a1aa',
                      }}
                      onClick={() => setNewOrder({ ...newOrder, category: cat })}
                    >
                      {cat}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="form-group">
              <Text className="form-label">重量（kg）</Text>
              <Input
                className="form-input"
                placeholder="请输入重量"
                placeholderStyle="color: #52525b"
                type="number"
                value={newOrder.weight}
                onInput={(e) => setNewOrder({ ...newOrder, weight: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">价格（元）</Text>
              <Input
                className="form-input"
                placeholder="请输入价格"
                placeholderStyle="color: #52525b"
                type="number"
                value={newOrder.price}
                onInput={(e) => setNewOrder({ ...newOrder, price: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">备注</Text>
              <Input
                className="form-input"
                placeholder="请输入备注（选填）"
                placeholderStyle="color: #52525b"
                value={newOrder.remark}
                onInput={(e) => setNewOrder({ ...newOrder, remark: e.detail.value })}
              />
            </View>

            <View className="action-btn-primary" onClick={handleAddOrder}>
              <Text className="action-btn-primary-text">创建订单</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecyclingOrderPage;
