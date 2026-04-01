import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import {
  UserPlus,
  Store,
  User,
  Clock,
  RefreshCw,
} from 'lucide-react-taro';
import { Network } from '@/network';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import CustomTabBar from '@/custom-tab-bar';

interface CustomerStats {
  todayNew: number;
  pendingFollowUp: number;
}

interface RecentCustomer {
  id: string;
  name: string;
  status: string;
  order_status: string;
  updated_at: string;
}

const TabCustomerPage = () => {
  const { isLoggedIn } = useAuthGuard({ requireLogin: false });
  const [stats, setStats] = useState<CustomerStats>({
    todayNew: 0,
    pendingFollowUp: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // 页面显示时刷新 TabBar
  useDidShow(() => {
    Taro.eventCenter.trigger('tabBarRefresh');
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 并行获取统计数据和最近客户
      const [statsRes, customersRes] = await Promise.all([
        Network.request({
          url: '/api/customers/statistics/overview',
          method: 'GET',
        }).catch(() => null),
        Network.request({
          url: '/api/customers',
          method: 'GET',
          data: { page: 1, pageSize: 5 },
        }).catch(() => null),
      ]);

      // 处理统计数据
      if (statsRes?.data?.code === 200 && statsRes?.data?.data) {
        setStats({
          todayNew: statsRes.data.data.todayNew || 0,
          pendingFollowUp: statsRes.data.data.pendingFollowUp || 0,
        });
      }

      // 处理最近客户
      if (customersRes?.data?.code === 200 && customersRes?.data?.data?.data) {
        setRecentCustomers(customersRes.data.data.data);
      }
    } catch (error) {
      console.error('[TabCustomer] 获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  // 状态映射
  const getStatusLabel = (status: string, orderStatus: string) => {
    if (orderStatus === 'completed') {
      return { label: '已成交', color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' };
    }
    if (status === 'normal') {
      return { label: '跟进中', color: '#60a5fa', bgColor: 'rgba(59, 130, 246, 0.2)' };
    }
    if (status === 'at_risk') {
      return { label: '待跟进', color: '#38bdf8', bgColor: 'rgba(245, 158, 11, 0.2)' };
    }
    return { label: '已流失', color: '#f87171', bgColor: 'rgba(239, 68, 68, 0.2)' };
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>客资管理</Text>
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>管理客户与回收业务</Text>
          </View>
          {loading && <RefreshCw size={20} color="#38bdf8" className="animate-spin" />}
        </View>
      </View>

      {/* 数据概览 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>{stats.todayNew}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>今日新增</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#38bdf8' }}>{stats.pendingFollowUp}</Text>
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
            onClick={() => handleNav('/package-customer/pages/customer/index')}
          >
            <View style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} color="#4ade80" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '12px' }}>获客登记</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>客户信息录入</Text>
          </View>

          <View
            style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/package-customer/pages/recycle/index')}
          >
            <View style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={24} color="#60a5fa" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '12px' }}>整店回收</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>回收业务管理</Text>
          </View>
        </View>
      </View>

      {/* 最近客户 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>最近客户</Text>
          <Text
            style={{ fontSize: '12px', color: '#38bdf8' }}
            onClick={() => handleNav('/package-customer/pages/customer/index')}
          >
            查看全部
          </Text>
        </View>

        {recentCustomers.length > 0 ? (
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            {recentCustomers.map((customer, index) => {
              const statusInfo = getStatusLabel(customer.status, customer.order_status);
              return (
                <View
                  key={customer.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: index < recentCustomers.length - 1 ? '1px solid #1e3a5f' : 'none'
                  }}
                  onClick={() => handleNav(`/package-customer/pages/customer/detail?id=${customer.id}`)}
                >
                  <View style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} color="#71717a" />
                  </View>
                  <View style={{ flex: 1, marginLeft: '12px' }}>
                    <Text style={{ fontSize: '16px', color: '#ffffff' }}>{customer.name}</Text>
                    <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                      <Clock size={12} color="#64748b" />
                      <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>{formatDate(customer.updated_at)}</Text>
                    </View>
                  </View>
                  <View style={{ padding: '4px 8px', backgroundColor: statusInfo.bgColor, borderRadius: '4px' }}>
                    <Text style={{ fontSize: '12px', color: statusInfo.color }}>{statusInfo.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <User size={48} color="#1e3a5f" />
            <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginTop: '12px' }}>暂无客户数据</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>点击「获客登记」添加您的第一位客户</Text>
          </View>
        )}
      </View>
      <CustomTabBar />
    </View>
  );
};

export default TabCustomerPage;
