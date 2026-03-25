import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  UserPlus,
  Store,
} from 'lucide-react-taro';

const TabCustomerPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-8 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b] border-b border-zinc-800">
        <Text className="block text-4xl font-bold text-white mb-2">客资管理</Text>
        <Text className="block text-zinc-500 text-lg">管理客户与回收业务</Text>
      </View>

      {/* 功能网格 */}
      <View className="p-6">
        <View className="grid grid-cols-2 gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/customer/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500/15">
              <UserPlus size={32} color="#22c55e" />
            </View>
            <Text className="block text-lg font-medium text-white">获客登记</Text>
            <Text className="block text-xs text-zinc-500 mt-1">客户信息录入</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/recycle/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-blue-500/15">
              <Store size={32} color="#3b82f6" />
            </View>
            <Text className="block text-lg font-medium text-white">整店回收</Text>
            <Text className="block text-xs text-zinc-500 mt-1">回收业务管理</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabCustomerPage;
