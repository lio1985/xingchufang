import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  UserPlus,
  Store,
  User,
  Clock,
  ShoppingCart,
} from 'lucide-react-taro';

const TabCustomerPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#141416' }}>
        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>客资管理</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>管理客户与回收业务</Text>
      </View>

      {/* 数据概览 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>12</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>今日新增</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>8</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>待跟进</Text>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>功能入口</Text>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View
            style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/customer/index')}
          >
            <View style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} color="#22c55e" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '12px' }}>获客登记</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>客户信息录入</Text>
          </View>

          <View
            style={{ flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/pages/recycle/index')}
          >
            <View style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={24} color="#3b82f6" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '12px' }}>整店回收</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>回收业务管理</Text>
          </View>
        </View>
      </View>

      {/* 设备接单入口 */}
      <View style={{ padding: '12px 20px 0' }}>
        <View
          style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          onClick={() => handleNav('/pages/equipment-orders/index')}
        >
          <View style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShoppingCart size={28} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '17px', fontWeight: '600', color: '#ffffff', display: 'block' }}>设备接单系统</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>客户求购 / 设备转让信息接单</Text>
          </View>
          <View style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.2)', flexShrink: 0 }}>
            <Text style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>待接单</Text>
          </View>
        </View>
      </View>

      {/* 最近客户 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '12px', color: '#52525b', fontWeight: '500' }}>最近客户</Text>
          <Text 
            style={{ fontSize: '12px', color: '#f59e0b' }}
            onClick={() => handleNav('/pages/customer/index')}
          >
            查看全部
          </Text>
        </View>
        
        <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 客户项1 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleNav('/pages/customer/detail?id=1')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#71717a" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff' }}>张三</Text>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <Clock size={12} color="#52525b" />
                <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>2024-01-15</Text>
              </View>
            </View>
            <View style={{ padding: '4px 8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#f59e0b' }}>待跟进</Text>
            </View>
          </View>

          {/* 客户项2 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleNav('/pages/customer/detail?id=2')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#71717a" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff' }}>李四</Text>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <Clock size={12} color="#52525b" />
                <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>2024-01-14</Text>
              </View>
            </View>
            <View style={{ padding: '4px 8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#22c55e' }}>已成交</Text>
            </View>
          </View>

          {/* 客户项3 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}
            onClick={() => handleNav('/pages/customer/detail?id=3')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#71717a" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff' }}>王五</Text>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <Clock size={12} color="#52525b" />
                <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: '4px' }}>2024-01-13</Text>
              </View>
            </View>
            <View style={{ padding: '4px 8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px' }}>
              <Text style={{ fontSize: '12px', color: '#3b82f6' }}>跟进中</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabCustomerPage;
