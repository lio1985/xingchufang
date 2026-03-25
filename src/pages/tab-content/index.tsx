import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Lightbulb,
  Target,
  Sparkles,
  ChevronRight,
} from 'lucide-react-taro';

const TabContentPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-8 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b] border-b border-zinc-800">
        <Text className="block text-4xl font-bold text-white mb-2">内容创作</Text>
        <Text className="block text-zinc-500 text-lg">释放你的创作潜能</Text>
      </View>

      {/* 功能列表 */}
      <View className="p-6">
        <View className="flex flex-col gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/quick-note/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-amber-500/15">
              <Lightbulb size={32} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">灵感速记</Text>
              <Text className="block text-sm text-zinc-500">快速捕捉创作灵感</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/topic-planning/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-cyan-500/15">
              <Target size={32} color="#06b6d4" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">选题策划</Text>
              <Text className="block text-sm text-zinc-500">发现热门选题方向</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/content-creation/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-violet-500/15">
              <Sparkles size={32} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">内容创作</Text>
              <Text className="block text-sm text-zinc-500">高效产出优质内容</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabContentPage;
