import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  UserPlus,
  Store,
  User,
  Clock,
} from 'lucide-react-taro';

const TabCustomerPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
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

        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 客户项1 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/package-customer/pages/customer/detail?id=1')}
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
            onClick={() => handleNav('/package-customer/pages/customer/detail?id=2')}
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
            onClick={() => handleNav('/package-customer/pages/customer/detail?id=3')}
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
