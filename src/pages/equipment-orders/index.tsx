import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  Eye,
  ChevronRight,
  ChevronLeft,
  Plus,
  Clock,
  Phone,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Order {
  id: string;
  order_no: string;
  order_type: 'purchase' | 'transfer';
  title: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  condition?: string;
  expected_price?: number;
  customer_phone: string;
  customer_wechat?: string;
  customer_address?: string;
  status: string;
  priority: string;
  taken_by?: string;
  taken_at?: string;
  created_at: string;
  canViewDetail: boolean;
  canTake: boolean;
  canTransfer: boolean;
}

// 状态映射
const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
  published: { text: '待接单', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
  taken: { text: '已接单', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)' },
  completed: { text: '已完成', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)' },
  closed: { text: '已关闭', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)' },
};

// 优先级映射
const priorityMap: Record<string, { text: string; color: string }> = {
  low: { text: '低', color: '#71717a' },
  normal: { text: '普通', color: '#3b82f6' },
  high: { text: '高', color: '#f59e0b' },
  urgent: { text: '紧急', color: '#ef4444' },
};

const EquipmentOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'purchase' | 'transfer'>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('orderType', activeTab);
      }
      if (activeStatus !== 'all') {
        params.append('status', activeStatus);
      }

      const res = await Network.request({
        url: `/api/equipment-orders?${params.toString()}`,
        method: 'GET',
      });

      if (res.data?.success) {
        setOrders(res.data.data.list || []);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      Taro.showToast({ title: '获取列表失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeStatus]);

  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/equipment-orders/detail?id=${orderId}` });
  };

  const handleCreateOrder = () => {
    Taro.navigateTo({ url: '/pages/equipment-orders/create' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '100px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#141416', borderBottom: '1px solid #27272a' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => Taro.switchTab({ url: '/pages/tab-customer/index' })}
            >
              <ChevronLeft size={24} color="#fafafa" />
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={24} color="#f59e0b" />
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>设备接单系统</Text>
            </View>
          </View>
          <View
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={handleCreateOrder}
          >
            <Plus size={16} color="#0a0a0b" />
            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0b' }}>发布</Text>
          </View>
        </View>
        <Text style={{ fontSize: '13px', color: '#71717a', marginLeft: '52px' }}>客户求购 / 设备转让信息接单</Text>
      </View>

      {/* 类型筛选 */}
      <View style={{ backgroundColor: '#141416', padding: '12px 20px', borderBottom: '1px solid #27272a' }}>
        <View style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: '全部' },
            { key: 'purchase', label: '求购' },
            { key: 'transfer', label: '转让' },
          ].map((tab) => (
            <View
              key={tab.key}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: activeTab === tab.key ? '#f59e0b' : '#27272a',
                flexShrink: 0
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text style={{ fontSize: '13px', color: activeTab === tab.key ? '#0a0a0b' : '#a1a1aa', fontWeight: '500' }}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 状态筛选 */}
      <ScrollView scrollX style={{ backgroundColor: '#141416', padding: '12px 20px', whiteSpace: 'nowrap' }}>
        <View style={{ display: 'inline-flex', gap: '8px' }}>
          {[
            { key: 'all', label: '全部状态' },
            { key: 'published', label: '待接单' },
            { key: 'taken', label: '已接单' },
            { key: 'completed', label: '已完成' },
            { key: 'closed', label: '已关闭' },
          ].map((status) => (
            <View
              key={status.key}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                backgroundColor: activeStatus === status.key ? 'rgba(245, 158, 11, 0.2)' : '#0a0a0b',
                border: activeStatus === status.key ? '1px solid #f59e0b' : '1px solid #27272a',
                flexShrink: 0
              }}
              onClick={() => setActiveStatus(status.key)}
            >
              <Text style={{ fontSize: '12px', color: activeStatus === status.key ? '#f59e0b' : '#71717a' }}>
                {status.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 订单列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 220px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {loading ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text style={{ color: '#71717a' }}>加载中...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text style={{ color: '#71717a' }}>暂无订单数据</Text>
            </View>
          ) : (
            orders.map((order) => {
              const statusInfo = statusMap[order.status] || statusMap.published;
              const priorityInfo = priorityMap[order.priority] || priorityMap.normal;

              return (
                <View
                  key={order.id}
                  style={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                  onClick={() => handleOrderClick(order.id)}
                >
                  {/* 头部 */}
                  <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {order.order_type === 'purchase' ? (
                          <ShoppingCart size={16} color="#3b82f6" />
                        ) : (
                          <Package size={16} color="#22c55e" />
                        )}
                        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{order.title}</Text>
                      </View>
                      <Text style={{ fontSize: '12px', color: '#52525b' }}>{order.order_no}</Text>
                    </View>
                    <View style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: statusInfo.bgColor }}>
                      <Text style={{ fontSize: '12px', color: statusInfo.color, fontWeight: '500' }}>{statusInfo.text}</Text>
                    </View>
                  </View>

                  {/* 信息 */}
                  <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {order.category && (
                      <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#27272a' }}>
                        <Text style={{ fontSize: '11px', color: '#a1a1aa' }}>{order.category}</Text>
                      </View>
                    )}
                    {order.brand && (
                      <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#27272a' }}>
                        <Text style={{ fontSize: '11px', color: '#a1a1aa' }}>{order.brand}</Text>
                      </View>
                    )}
                    {order.expected_price && (
                      <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                        <Text style={{ fontSize: '11px', color: '#22c55e' }}>¥{order.expected_price}</Text>
                      </View>
                    )}
                    <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: priorityInfo.color + '20' }}>
                      <Text style={{ fontSize: '11px', color: priorityInfo.color }}>{priorityInfo.text}优先</Text>
                    </View>
                  </View>

                  {/* 联系方式（脱敏） */}
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} color="#71717a" />
                      <Text style={{ fontSize: '12px', color: '#71717a' }}>{order.customer_phone}</Text>
                    </View>
                    {order.customer_address && (
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Text style={{ fontSize: '12px', color: '#71717a' }}>{order.customer_address}</Text>
                      </View>
                    )}
                  </View>

                  {/* 底部 */}
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #27272a', paddingTop: '12px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} color="#52525b" />
                      <Text style={{ fontSize: '12px', color: '#52525b' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {order.canTake && (
                        <View style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#f59e0b' }}>
                          <Text style={{ fontSize: '12px', color: '#0a0a0b', fontWeight: '500' }}>立即接单</Text>
                        </View>
                      )}
                      {order.canViewDetail && (
                        <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} color="#f59e0b" />
                          <Text style={{ fontSize: '12px', color: '#f59e0b' }}>查看详情</Text>
                        </View>
                      )}
                      <ChevronRight size={16} color="#52525b" />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default EquipmentOrdersPage;
