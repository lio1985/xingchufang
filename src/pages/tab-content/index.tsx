import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Lightbulb,
  Target,
  PenTool,
  Sparkles,
} from 'lucide-react-taro';

const TabContentPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  // 模拟创作数据
  const creationStats = {
    weeklyCount: 15,
    inspirationCount: 42,
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-6 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b]">
        <Text className="block text-3xl font-bold text-white mb-2">内容创作</Text>
        <Text className="block text-zinc-500 text-base">释放你的创作潜能</Text>
      </View>

      {/* 星小帮 - AI助手入口 */}
      <View className="px-6 pb-4">
        <View
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-center active:from-amber-500/30 active:to-orange-500/20"
          onClick={() => handleNav('/pages/ai-assistant/index')}
        >
          <View className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 mr-4">
            <Sparkles size={28} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="block text-lg font-semibold text-amber-400">星小帮</Text>
            <Text className="block text-sm text-amber-400/60 mt-1">AI智能创作助手 · 随时为你提供灵感</Text>
          </View>
        </View>
      </View>

      {/* 创作数据统计 */}
      <View className="px-6 pb-4">
        <View className="grid grid-cols-2 gap-3">
          <View className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <Text className="block text-3xl font-bold text-white mb-1">{creationStats.weeklyCount}</Text>
            <Text className="block text-sm text-zinc-500">本周创作</Text>
          </View>
          <View className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-center">
            <Text className="block text-3xl font-bold text-amber-400 mb-1">{creationStats.inspirationCount}</Text>
            <Text className="block text-sm text-zinc-500">灵感数量</Text>
          </View>
        </View>
      </View>

      {/* 创作工具 */}
      <View className="px-6 py-2">
        <Text className="block text-sm text-zinc-600 mb-3 px-1">创作工具</Text>
        <View className="grid grid-cols-2 gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/quick-note/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-amber-500/15">
              <Lightbulb size={24} color="#f59e0b" />
            </View>
            <Text className="block text-base font-medium text-white">灵感速记</Text>
            <Text className="block text-xs text-zinc-500 mt-1">快速捕捉灵感</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/topic-planning/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-cyan-500/15">
              <Target size={24} color="#06b6d4" />
            </View>
            <Text className="block text-base font-medium text-white">选题策划</Text>
            <Text className="block text-xs text-zinc-500 mt-1">热门选题方向</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center active:bg-zinc-800/60 col-span-2"
            onClick={() => handleNav('/pages/content-creation/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-violet-500/15">
              <PenTool size={24} color="#8b5cf6" />
            </View>
            <Text className="block text-base font-medium text-white">内容写作</Text>
            <Text className="block text-xs text-zinc-500 mt-1">高效产出优质内容</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabContentPage;
