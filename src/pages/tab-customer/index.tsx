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
    <View className="min-h-screen bg-[#0a0a0b] pb-20">
      {/* 页面头部 */}
      <View className="px-5 pt-14 pb-8 bg-[#141416]">
        <Text className="block text-2xl font-bold text-white">客资管理</Text>
        <Text className="block text-zinc-500 text-sm mt-2">管理客户与回收业务</Text>
      </View>

      {/* 数据概览 */}
      <View className="px-5 -mt-4">
        <View className="flex gap-3">
          <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <Text className="block text-2xl font-bold text-white">12</Text>
            <Text className="block text-xs text-zinc-500 mt-1">今日新增</Text>
          </View>
          <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <Text className="block text-2xl font-bold text-amber-400">8</Text>
            <Text className="block text-xs text-zinc-500 mt-1">待跟进</Text>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View className="px-5 mt-6">
        <Text className="block text-xs text-zinc-600 mb-3 font-medium">功能入口</Text>
        <View className="flex gap-3">
          <View
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 items-center active:bg-zinc-800"
            onClick={() => handleNav('/pages/customer/index')}
          >
            <View className="w-12 h-12 rounded-xl bg-emerald-500/20 items-center justify-center">
              <UserPlus size={24} color="#22c55e" />
            </View>
            <Text className="block text-base font-medium text-white mt-3">获客登记</Text>
            <Text className="block text-xs text-zinc-500 mt-1">客户信息录入</Text>
          </View>

          <View
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-5 items-center active:bg-zinc-800"
            onClick={() => handleNav('/pages/recycle/index')}
          >
            <View className="w-12 h-12 rounded-xl bg-blue-500/20 items-center justify-center">
              <Store size={24} color="#3b82f6" />
            </View>
            <Text className="block text-base font-medium text-white mt-3">整店回收</Text>
            <Text className="block text-xs text-zinc-500 mt-1">回收业务管理</Text>
          </View>
        </View>
      </View>

      {/* 最近客户 */}
      <View className="px-5 mt-6">
        <View className="flex items-center justify-between mb-3">
          <Text className="text-xs text-zinc-600 font-medium">最近客户</Text>
          <Text 
            className="text-xs text-amber-400"
            onClick={() => handleNav('/pages/customer/index')}
          >
            查看全部
          </Text>
        </View>
        
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* 客户项1 */}
          <View
            className="flex items-center px-4 py-3 border-b border-zinc-800 active:bg-zinc-800"
            onClick={() => handleNav('/pages/customer/detail?id=1')}
          >
            <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
              <User size={18} color="#71717a" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white">张三</Text>
              <View className="flex items-center mt-1">
                <Clock size={12} color="#52525b" />
                <Text className="text-xs text-zinc-500 ml-1">2024-01-15</Text>
              </View>
            </View>
            <View className="px-2 py-1 bg-amber-500/20 rounded">
              <Text className="text-xs text-amber-400">待跟进</Text>
            </View>
          </View>

          {/* 客户项2 */}
          <View
            className="flex items-center px-4 py-3 border-b border-zinc-800 active:bg-zinc-800"
            onClick={() => handleNav('/pages/customer/detail?id=2')}
          >
            <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
              <User size={18} color="#71717a" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white">李四</Text>
              <View className="flex items-center mt-1">
                <Clock size={12} color="#52525b" />
                <Text className="text-xs text-zinc-500 ml-1">2024-01-14</Text>
              </View>
            </View>
            <View className="px-2 py-1 bg-green-500/20 rounded">
              <Text className="text-xs text-green-400">已成交</Text>
            </View>
          </View>

          {/* 客户项3 */}
          <View
            className="flex items-center px-4 py-3 active:bg-zinc-800"
            onClick={() => handleNav('/pages/customer/detail?id=3')}
          >
            <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center">
              <User size={18} color="#71717a" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white">王五</Text>
              <View className="flex items-center mt-1">
                <Clock size={12} color="#52525b" />
                <Text className="text-xs text-zinc-500 ml-1">2024-01-13</Text>
              </View>
            </View>
            <View className="px-2 py-1 bg-blue-500/20 rounded">
              <Text className="text-xs text-blue-400">跟进中</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabCustomerPage;
