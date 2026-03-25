import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Users,
  Recycle,
  ChevronRight,
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

      {/* 功能列表 */}
      <View className="p-6">
        <View className="flex flex-col gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/customer/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-emerald-500/15">
              <Users size={32} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">客户管理</Text>
              <Text className="block text-sm text-zinc-500">客户资料与跟进记录</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/recycle/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-blue-500/15">
              <Recycle size={32} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">厨具回收</Text>
              <Text className="block text-sm text-zinc-500">回收业务全流程管理</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabCustomerPage;
