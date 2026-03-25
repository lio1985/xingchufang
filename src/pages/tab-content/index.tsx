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

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-8 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b] border-b border-zinc-800">
        <Text className="block text-4xl font-bold text-white mb-2">内容创作</Text>
        <Text className="block text-zinc-500 text-lg">释放你的创作潜能</Text>
      </View>

      {/* 功能网格 */}
      <View className="p-6">
        <View className="grid grid-cols-2 gap-4">
          {/* 星小帮 - AI助手入口 */}
          <View
            className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center active:from-amber-500/30 active:to-orange-500/20 col-span-2"
            onClick={() => handleNav('/pages/ai-assistant/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles size={32} color="#ffffff" />
            </View>
            <Text className="block text-lg font-semibold text-amber-400">星小帮</Text>
            <Text className="block text-xs text-amber-400/60 mt-1">AI智能创作助手</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/quick-note/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-amber-500/15">
              <Lightbulb size={32} color="#f59e0b" />
            </View>
            <Text className="block text-lg font-medium text-white">灵感速记</Text>
            <Text className="block text-xs text-zinc-500 mt-1">快速捕捉灵感</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/topic-planning/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-cyan-500/15">
              <Target size={32} color="#06b6d4" />
            </View>
            <Text className="block text-lg font-medium text-white">选题策划</Text>
            <Text className="block text-xs text-zinc-500 mt-1">热门选题方向</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60 col-span-2"
            onClick={() => handleNav('/pages/content-creation/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-violet-500/15">
              <PenTool size={32} color="#8b5cf6" />
            </View>
            <Text className="block text-lg font-medium text-white">内容写作</Text>
            <Text className="block text-xs text-zinc-500 mt-1">高效产出优质内容</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabContentPage;
