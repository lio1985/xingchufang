import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  UserPlus,
  Store,
  User,
  Clock,
  ShoppingCart,
  Phone,
  TrendingUp,
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
  expected_price?: number;
  customer_phone: string;
  status: string;
  priority: string;
  created_at: string;
}

const TabCustomerPage = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  // 页面显示时刷新数据
  Taro.useDidShow(() => {
    fetchRecentOrders();
  });

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await Network.request({
        url: '/api/equipment-orders?limit=5',
        method: 'GET',
      });

      if (res.data?.success) {
        setRecentOrders(res.data.data.list || []);
      }
    } catch (error) {
      console.error('获取最近客资失败:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  // 状态映射
  const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
    published: { text: '待接单', color: '#38bdf8', bgColor: 'rgba(245, 158, 11, 0.2)' },
    taken: { text: '已接单', color: '#60a5fa', bgColor: 'rgba(59, 130, 246, 0.2)' },
    completed: { text: '已完成', color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
    closed: { text: '已关闭', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)' },
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>客资管理</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>管理客户与回收业务</Text>
      </View>

      {/* 数据概览 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>12</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>今日新增</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#38bdf8' }}>8</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>待跟进</Text>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>功能入口</Text>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View
            style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/customer/index')}
          >
            <View style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} color="#4ade80" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '12px' }}>获客登记</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>客户信息录入</Text>
          </View>

          <View
            style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/recycle/index')}
          >
            <View style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={24} color="#60a5fa" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '12px' }}>整店回收</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>回收业务管理</Text>
          </View>
        </View>
      </View>

      {/* 获取客资入口 */}
      <View style={{ padding: '12px 20px 0' }}>
        <View
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          onClick={() => handleNav('/pages/equipment-orders/index')}
        >
          <View style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={28} color="#38bdf8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '17px', fontWeight: '600', color: '#ffffff', display: 'block' }}>获取客资</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>求购 / 转让信息接单获取客资</Text>
          </View>
          <View style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.2)', flexShrink: 0 }}>
            <Text style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '500' }}>去接单</Text>
          </View>
        </View>
      </View>

      {/* 最近客资接单 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>最近客资接单</Text>
          <Text
            style={{ fontSize: '12px', color: '#38bdf8' }}
            onClick={() => handleNav('/pages/equipment-orders/index')}
          >
            查看全部
          </Text>
        </View>

        {ordersLoading ? (
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#71717a' }}>加载中...</Text>
          </View>
        ) : recentOrders.length === 0 ? (
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#71717a' }}>暂无客资信息</Text>
          </View>
        ) : (
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            {recentOrders.map((order, index) => {
              const statusInfo = statusMap[order.status] || statusMap.published;
              return (
                <View
                  key={order.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: index < recentOrders.length - 1 ? '1px solid #1e3a5f' : 'none',
                  }}
                  onClick={() => handleNav(`/pages/equipment-orders/detail?id=${order.id}`)}
                >
                  <View
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: order.order_type === 'purchase' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {order.order_type === 'purchase' ? (
                      <ShoppingCart size={18} color="#4ade80" />
                    ) : (
                      <TrendingUp size={18} color="#60a5fa" />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.title}
                      </Text>
                      {order.expected_price && (
                        <Text style={{ fontSize: '13px', color: '#4ade80', fontWeight: '600', flexShrink: 0 }}>
                          ¥{order.expected_price}
                        </Text>
                      )}
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px', gap: '8px' }}>
                      {order.brand && (
                        <Text style={{ fontSize: '12px', color: '#64748b' }}>{order.brand}</Text>
                      )}
                      <View style={{ display: 'flex', alignItems: 'center' }}>
                        <Phone size={12} color="#64748b" />
                        <Text style={{ fontSize: '12px', color: '#64748b', marginLeft: '4px' }}>{order.customer_phone}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ padding: '4px 8px', backgroundColor: statusInfo.bgColor, borderRadius: '4px', flexShrink: 0 }}>
                    <Text style={{ fontSize: '12px', color: statusInfo.color }}>{statusInfo.text}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* 最近客户 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>最近客户</Text>
          <Text
            style={{ fontSize: '12px', color: '#38bdf8' }}
            onClick={() => handleNav('/pages/customer/index')}
          >
            查看全部
          </Text>
        </View>

        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 客户项1 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/pages/customer/detail?id=1')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#71717a" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff' }}>张三</Text>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <Clock size={12} color="#64748b" />
                <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>2024-01-15</Text>
              </View>
            </View>
            <View style={{ padding: '4px 8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#38bdf8' }}>待跟进</Text>
            </View>
          </View>

          {/* 客户项2 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/pages/customer/detail?id=2')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#71717a" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff' }}>李四</Text>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <Clock size={12} color="#64748b" />
                <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>2024-01-14</Text>
              </View>
            </View>
            <View style={{ padding: '4px 8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#4ade80' }}>已成交</Text>
            </View>
          </View>

          {/* 客户项3 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}
            onClick={() => handleNav('/pages/customer/detail?id=3')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#71717a" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff' }}>王五</Text>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <Clock size={12} color="#64748b" />
                <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>2024-01-13</Text>
              </View>
            </View>
            <View style={{ padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#60a5fa' }}>跟进中</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabCustomerPage;
