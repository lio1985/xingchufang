import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Phone,
  MapPin,
  User,
  MessageCircle,
  Pencil,
  Clock,
} from 'lucide-react-taro';

interface Customer {
  id: string;
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
  first_follow_up_at?: string;
  updated_at: string;
  users?: { name: string };
}

interface FollowUp {
  id: string;
  follow_up_time: string;
  content: string;
  follow_up_method?: string;
  next_follow_up_plan?: string;
}

const statusConfig = {
  normal: { label: '正常', color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
  at_risk: { label: '有风险', color: '#38bdf8', bgColor: 'rgba(245, 158, 11, 0.2)' },
  lost: { label: '已流失', color: '#f87171', bgColor: 'rgba(239, 68, 68, 0.2)' }
};

const orderStatusConfig = {
  in_progress: { label: '进行中', color: '#60a5fa' },
  completed: { label: '已成交', color: '#4ade80' }
};

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.params;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return;
      try {
        const res = await Network.request({ url: `/api/customers/${id}` });
        if (res.data.code === 200) {
          setCustomer(res.data.data);
        }
      } catch (err) {
        console.error('加载客户详情失败:', err);
        Taro.showToast({ title: '加载失败', icon: 'none' });
      }
    };

    const loadFollowUps = async () => {
      if (!id) return;
      try {
        const res = await Network.request({ url: `/api/customers/${id}/follow-ups` });
        if (res.data.code === 200) {
          setFollowUps(res.data.data || []);
        }
      } catch (err) {
        console.error('加载跟进记录失败:', err);
      }
    };

    loadCustomer();
    loadFollowUps();
  }, [id]);

  const goBack = () => {
    Taro.navigateBack();
  };

  const goToEdit = () => {
    Taro.navigateTo({ url: `/pages/customer/edit?id=${id}` });
  };

  const handleCall = () => {
    if (customer?.phone) {
      Taro.makePhoneCall({ phoneNumber: customer.phone });
    } else {
      Taro.showToast({ title: '暂无电话号码', icon: 'none' });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
  };

  if (!customer) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>加载中...</Text>
      </View>
    );
  }

  const status = statusConfig[customer.status];
  const orderStatus = orderStatusConfig[customer.order_status];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ display: 'flex', alignItems: 'center' }} onClick={goBack}>
          <ArrowLeft size={20} color="#ffffff" />
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginLeft: '12px' }}>客户详情</Text>
        </View>
        <View
          style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center' }}
          onClick={goToEdit}
        >
          <Pencil size={16} color="#38bdf8" />
          <Text style={{ fontSize: '14px', color: '#38bdf8', marginLeft: '4px' }}>编辑</Text>
        </View>
      </View>

      <ScrollView style={{ padding: '16px 20px' }} scrollY>
        {/* 客户卡片 */}
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          {/* 顶部：头像 + 姓名 + 状态 */}
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <View style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="#38bdf8" />
            </View>
            <View style={{ flex: 1, marginLeft: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <Text style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>{customer.name}</Text>
                <View style={{ padding: '4px 8px', backgroundColor: status.bgColor, borderRadius: '4px', marginLeft: '12px' }}>
                  <Text style={{ fontSize: '12px', color: status.color }}>{status.label}</Text>
                </View>
              </View>
              <Text style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>{customer.customer_type || '未分类'}</Text>
            </View>
          </View>

          {/* 金额信息 */}
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1e3a5f' }}>
            <View>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>预计金额</Text>
              <Text style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80', marginTop: '4px' }}>¥{(customer.estimated_amount || 0).toFixed(0)}万</Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>订单状态</Text>
              <Text style={{ fontSize: '16px', fontWeight: '500', color: orderStatus.color, marginTop: '4px' }}>{orderStatus.label}</Text>
            </View>
          </View>
        </View>

        {/* 联系方式 */}
        <View style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px' }}>联系方式</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            {/* 电话 */}
            {customer.phone && (
              <View style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e3a5f' }} onClick={handleCall}>
                <Phone size={18} color="#4ade80" />
                <Text style={{ flex: 1, fontSize: '15px', color: '#ffffff', marginLeft: '12px' }}>{customer.phone}</Text>
                <Text style={{ fontSize: '13px', color: '#4ade80' }}>拨打</Text>
              </View>
            )}
            {/* 微信 */}
            {customer.wechat && (
              <View style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e3a5f' }}>
                <MessageCircle size={18} color="#64748b" />
                <Text style={{ fontSize: '13px', color: '#71717a', marginLeft: '12px' }}>微信：</Text>
                <Text style={{ fontSize: '15px', color: '#ffffff' }}>{customer.wechat}</Text>
              </View>
            )}
            {/* 小红书 */}
            {customer.xiaohongshu && (
              <View style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e3a5f' }}>
                <User size={18} color="#64748b" />
                <Text style={{ fontSize: '13px', color: '#71717a', marginLeft: '12px' }}>小红书：</Text>
                <Text style={{ fontSize: '15px', color: '#ffffff' }}>{customer.xiaohongshu}</Text>
              </View>
            )}
            {/* 抖音 */}
            {customer.douyin && (
              <View style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                <User size={18} color="#64748b" />
                <Text style={{ fontSize: '13px', color: '#71717a', marginLeft: '12px' }}>抖音：</Text>
                <Text style={{ fontSize: '15px', color: '#ffffff' }}>{customer.douyin}</Text>
              </View>
            )}
            {/* 无联系方式 */}
            {!customer.phone && !customer.wechat && !customer.xiaohongshu && !customer.douyin && (
              <View style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: '14px', color: '#64748b' }}>暂无联系方式</Text>
              </View>
            )}
          </View>
        </View>

        {/* 业务信息 */}
        <View style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px' }}>业务信息</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <View style={{ display: 'flex', marginBottom: '12px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', width: '80px' }}>餐饮类别</Text>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>{customer.category || '-'}</Text>
            </View>
            <View style={{ display: 'flex', marginBottom: '12px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', width: '80px' }}>客户来源</Text>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>{customer.source || '-'}</Text>
            </View>
            <View style={{ display: 'flex', marginBottom: '12px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', width: '80px' }}>订单归属</Text>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>{customer.order_belonging || '-'}</Text>
            </View>
            <View style={{ display: 'flex', marginBottom: '12px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', width: '80px' }}>所在城市</Text>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <MapPin size={14} color="#64748b" />
                <Text style={{ fontSize: '14px', color: '#ffffff', marginLeft: '4px' }}>{customer.city || '-'}</Text>
              </View>
            </View>
            <View style={{ display: 'flex' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', width: '80px' }}>负责人</Text>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>{customer.users?.name || '-'}</Text>
            </View>
          </View>
        </View>

        {/* 客户需求 */}
        {customer.requirements && (
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px' }}>客户需求</Text>
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '22px' }}>{customer.requirements}</Text>
            </View>
          </View>
        )}

        {/* 跟进记录 */}
        <View style={{ marginBottom: '32px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px' }}>跟进记录</Text>
          {followUps.length > 0 ? (
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
              {followUps.map((item, index) => (
                <View key={item.id} style={{ padding: '16px', borderBottom: index < followUps.length - 1 ? '1px solid #1e3a5f' : 'none' }}>
                  <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Clock size={14} color="#64748b" />
                    <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>{formatDate(item.follow_up_time)}</Text>
                    {item.follow_up_method && (
                      <View style={{ padding: '2px 6px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px', marginLeft: '8px' }}>
                        <Text style={{ fontSize: '11px', color: '#60a5fa' }}>{item.follow_up_method}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: '14px', color: '#ffffff', lineHeight: '22px' }}>{item.content}</Text>
                  {item.next_follow_up_plan && (
                    <View style={{ marginTop: '8px', padding: '8px', backgroundColor: '#0a0f1a', borderRadius: '6px' }}>
                      <Text style={{ fontSize: '12px', color: '#38bdf8' }}>下次跟进：{item.next_follow_up_plan}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: '14px', color: '#64748b' }}>暂无跟进记录</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
