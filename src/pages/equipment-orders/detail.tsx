import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  Phone,
  MessageCircle,
  MapPin,
  User,
  CircleCheck,
  ArrowRight,
  ChevronLeft,
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
  completed_at?: string;
  notes?: string;
  created_at: string;
  canViewDetail: boolean;
  canTake: boolean;
  canTransfer: boolean;
  canFollowUp: boolean;
  canComplete: boolean;
  canClose: boolean;
}

const OrderDetailPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const orderId = Taro.getCurrentInstance()?.router?.params?.id;

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const res = await Network.request({
        url: `/api/equipment-orders/${orderId}`,
        method: 'GET',
      });

      if (res.data?.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      Taro.showToast({ title: '获取详情失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleTakeOrder = async () => {
    if (!order || actionLoading) return;

    try {
      setActionLoading(true);
      const res = await Network.request({
        url: `/api/equipment-orders/${order.id}/take`,
        method: 'POST',
      });

      if (res.data?.success) {
        Taro.showToast({ title: '接单成功', icon: 'success' });
        fetchOrderDetail();
      } else {
        Taro.showToast({ title: res.data?.message || '接单失败', icon: 'none' });
      }
    } catch (error) {
      console.error('接单失败:', error);
      Taro.showToast({ title: '接单失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order || actionLoading) return;

    try {
      setActionLoading(true);
      const res = await Network.request({
        url: `/api/equipment-orders/${order.id}/complete`,
        method: 'POST',
      });

      if (res.data?.success) {
        Taro.showToast({ title: '订单已完成', icon: 'success' });
        fetchOrderDetail();
      } else {
        Taro.showToast({ title: res.data?.message || '操作失败', icon: 'none' });
      }
    } catch (error) {
      console.error('完成订单失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!order || actionLoading) return;

    const result = await Taro.showModal({
      title: '确认关闭',
      content: '确定要关闭此订单吗？关闭后将无法恢复。',
    });

    if (!result.confirm) return;

    try {
      setActionLoading(true);
      const res = await Network.request({
        url: `/api/equipment-orders/${order.id}/close`,
        method: 'POST',
      });

      if (res.data?.success) {
        Taro.showToast({ title: '订单已关闭', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      } else {
        Taro.showToast({ title: res.data?.message || '操作失败', icon: 'none' });
      }
    } catch (error) {
      console.error('关闭订单失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!order) return;

    // 直接添加跟进记录
    Taro.showModal({
      title: '添加跟进',
      content: '确定添加跟进记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await Network.request({
              url: `/api/equipment-orders/${order.id}/follow-up`,
              method: 'POST',
              data: { notes: '跟进记录' },
            });

            if (response.data?.success) {
              Taro.showToast({ title: '已添加跟进', icon: 'success' });
              fetchOrderDetail();
            }
          } catch (error) {
            Taro.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleTransfer = async () => {
    if (!order) return;

    Taro.showModal({
      title: '转让订单',
      content: '确定要转让此订单吗？转让后其他员工可以接单。',
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await Network.request({
              url: `/api/equipment-orders/${order.id}/transfer`,
              method: 'POST',
              data: { reason: '' },
            });

            if (response.data?.success) {
              Taro.showToast({ title: '已转让订单', icon: 'success' });
              fetchOrderDetail();
            } else {
              Taro.showToast({ title: response.data?.message || '转让失败', icon: 'none' });
            }
          } catch (error) {
            Taro.showToast({ title: '转让失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleCallPhone = () => {
    if (order?.customer_phone) {
      Taro.makePhoneCall({ phoneNumber: order.customer_phone });
    }
  };

  // 状态配置
  const statusConfig: Record<string, { text: string; color: string; bgColor: string }> = {
    published: { text: '待接单', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
    taken: { text: '已接单', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)' },
    completed: { text: '已完成', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)' },
    closed: { text: '已关闭', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)' },
  };

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>加载中...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>订单不存在</Text>
      </View>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.published;

  return (
    <ScrollView scrollY style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '120px' }}>
      {/* 头部状态卡片 */}
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
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {order.order_type === 'purchase' ? (
            <ShoppingCart size={28} color="#3b82f6" />
          ) : (
            <Package size={28} color="#22c55e" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>{order.title}</Text>
            <Text style={{ fontSize: '12px', color: '#52525b' }}>{order.order_no}</Text>
          </View>
          <View style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: statusInfo.bgColor }}>
            <Text style={{ fontSize: '13px', color: statusInfo.color, fontWeight: '500' }}>{statusInfo.text}</Text>
          </View>
        </View>

        {order.description && (
          <View style={{ padding: '12px', backgroundColor: '#111827', borderRadius: '8px', marginTop: '12px' }}>
            <Text style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '20px' }}>{order.description}</Text>
          </View>
        )}
      </View>

      {/* 设备信息 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>设备信息</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { label: '类型', value: order.order_type === 'purchase' ? '求购' : '转让' },
            { label: '分类', value: order.category },
            { label: '品牌', value: order.brand },
            { label: '型号', value: order.model },
            { label: '状况', value: order.condition },
            { label: '期望价格', value: order.expected_price ? `¥${order.expected_price}` : undefined },
          ]
            .filter((item) => item.value)
            .map((item) => (
              <View key={item.label} style={{ padding: '8px 12px', backgroundColor: '#111827', borderRadius: '6px' }}>
                <Text style={{ fontSize: '11px', color: '#52525b', marginBottom: '4px' }}>{item.label}</Text>
                <Text style={{ fontSize: '13px', color: '#ffffff' }}>{item.value}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* 客户信息 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>客户信息</Text>
        <View style={{ gap: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={handleCallPhone}>
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} color="#0a0f1a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '11px', color: '#52525b' }}>联系电话</Text>
              <Text style={{ fontSize: '15px', color: '#ffffff' }}>{order.customer_phone}</Text>
            </View>
            <ArrowRight size={16} color="#52525b" />
          </View>

          {order.customer_wechat && (
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={18} color="#0a0f1a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '11px', color: '#52525b' }}>微信号</Text>
                <Text style={{ fontSize: '15px', color: '#ffffff' }}>{order.customer_wechat}</Text>
              </View>
            </View>
          )}

          {order.customer_address && (
            <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#0a0f1a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '11px', color: '#52525b' }}>地址</Text>
                <Text style={{ fontSize: '15px', color: '#ffffff' }}>{order.customer_address}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 订单进度 */}
      <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>订单进度</Text>
        <View style={{ gap: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircleCheck size={16} color="#0a0f1a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>订单发布</Text>
              <Text style={{ fontSize: '12px', color: '#52525b' }}>{new Date(order.created_at).toLocaleString()}</Text>
            </View>
          </View>

          {order.taken_at && (
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', color: '#ffffff' }}>已接单</Text>
                <Text style={{ fontSize: '12px', color: '#52525b' }}>{new Date(order.taken_at).toLocaleString()}</Text>
              </View>
            </View>
          )}

          {order.completed_at && (
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircleCheck size={16} color="#0a0f1a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', color: '#ffffff' }}>已完成</Text>
                <Text style={{ fontSize: '12px', color: '#52525b' }}>{new Date(order.completed_at).toLocaleString()}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 备注 */}
      {order.notes && (
        <View style={{ backgroundColor: '#111827', padding: '20px', marginBottom: '8px' }}>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>备注</Text>
          <Text style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '20px' }}>{order.notes}</Text>
        </View>
      )}

      {/* 底部操作按钮 */}
      {order.status !== 'completed' && order.status !== 'closed' && (
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
          <View style={{ display: 'flex', gap: '12px' }}>
            {order.canTake && (
              <View
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#f59e0b',
                  textAlign: 'center',
                }}
                onClick={handleTakeOrder}
              >
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0a0f1a' }}>{actionLoading ? '处理中...' : '立即接单'}</Text>
              </View>
            )}

            {order.canFollowUp && (
              <View
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#1e3a5f',
                  textAlign: 'center',
                }}
                onClick={handleFollowUp}
              >
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff' }}>添加跟进</Text>
              </View>
            )}

            {order.canTransfer && (
              <View
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#3b82f6',
                  textAlign: 'center',
                }}
                onClick={handleTransfer}
              >
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff' }}>转让</Text>
              </View>
            )}

            {order.canComplete && (
              <View
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#22c55e',
                  textAlign: 'center',
                }}
                onClick={handleCompleteOrder}
              >
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0a0f1a' }}>{actionLoading ? '处理中...' : '完成订单'}</Text>
              </View>
            )}

            {order.canClose && (
              <View
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#dc2626',
                  textAlign: 'center',
                }}
                onClick={handleCloseOrder}
              >
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff' }}>关闭</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default OrderDetailPage;
