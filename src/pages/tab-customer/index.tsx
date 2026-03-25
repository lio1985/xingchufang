import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  UserPlus,
  Store,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react-taro';

const TabCustomerPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  // 模拟数据
  const stats = {
    todayNew: 12,
    pendingFollow: 8,
  };

  const recentCustomers = [
    { id: 1, name: '张三', date: '2024-01-15', status: '待跟进', avatar: '' },
    { id: 2, name: '李四', date: '2024-01-14', status: '已成交', avatar: '' },
    { id: 3, name: '王五', date: '2024-01-13', status: '跟进中', avatar: '' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '待跟进':
        return 'text-amber-400';
      case '已成交':
        return 'text-green-400';
      case '跟进中':
        return 'text-blue-400';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-6 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b]">
        <Text className="block text-3xl font-bold text-white mb-2">客资管理</Text>
        <Text className="block text-zinc-500 text-base">管理客户与回收业务</Text>
      </View>

      {/* 数据概览 */}
      <View className="px-6 pb-4">
        <View className="grid grid-cols-2 gap-3">
          <View className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <Text className="block text-3xl font-bold text-white mb-1">{stats.todayNew}</Text>
            <Text className="block text-sm text-zinc-500">今日新增</Text>
          </View>
          <View className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <Text className="block text-3xl font-bold text-amber-400 mb-1">{stats.pendingFollow}</Text>
            <Text className="block text-sm text-zinc-500">待跟进</Text>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View className="px-6 py-4">
        <Text className="block text-sm text-zinc-600 mb-3 px-1">功能入口</Text>
        <View className="grid grid-cols-2 gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/customer/index')}
          >
            <View className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-emerald-500/15">
              <UserPlus size={28} color="#22c55e" />
            </View>
            <Text className="block text-base font-medium text-white">获客登记</Text>
            <Text className="block text-xs text-zinc-500 mt-1">客户信息录入</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/recycle/index')}
          >
            <View className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 bg-blue-500/15">
              <Store size={28} color="#3b82f6" />
            </View>
            <Text className="block text-base font-medium text-white">整店回收</Text>
            <Text className="block text-xs text-zinc-500 mt-1">回收业务管理</Text>
          </View>
        </View>
      </View>

      {/* 最近客户 */}
      <View className="px-6 py-4">
        <View className="flex items-center justify-between mb-3 px-1">
          <Text className="text-sm text-zinc-600">最近客户</Text>
          <Text 
            className="text-sm text-amber-400"
            onClick={() => handleNav('/pages/customer/index')}
          >
            查看全部
          </Text>
        </View>
        <View className="flex flex-col gap-2">
          {recentCustomers.map((customer) => (
            <View
              key={customer.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center active:bg-zinc-800/60"
              onClick={() => handleNav(`/pages/customer/detail?id=${customer.id}`)}
            >
              <View className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mr-3">
                <User size={20} color="#71717a" />
              </View>
              <View className="flex-1">
                <Text className="block text-base font-medium text-white">{customer.name}</Text>
                <View className="flex items-center mt-1">
                  <Clock size={12} color="#52525b" />
                  <Text className="text-xs text-zinc-500 ml-1">{customer.date}</Text>
                </View>
              </View>
              <Text className={`text-sm font-medium ${getStatusColor(customer.status)}`}>
                {customer.status}
              </Text>
              <ChevronRight size={16} color="#52525b" className="ml-2" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TabCustomerPage;
