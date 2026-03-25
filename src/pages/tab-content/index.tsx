import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Lightbulb,
  Target,
  PenTool,
  Sparkles,
  ChevronRight,
} from 'lucide-react-taro';

const TabContentPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b] pb-20">
      {/* 页面头部 */}
      <View className="px-5 pt-14 pb-8 bg-[#141416]">
        <Text className="block text-2xl font-bold text-white">内容创作</Text>
        <Text className="block text-zinc-500 text-sm mt-2">释放你的创作潜能</Text>
      </View>

      {/* 星小帮 - AI助手入口 */}
      <View className="px-5 -mt-4">
        <View
          className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center active:opacity-80"
          onClick={() => handleNav('/pages/ai-assistant/index')}
        >
          <View className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center">
            <Sparkles size={24} color="#ffffff" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="block text-base font-semibold text-amber-400">星小帮</Text>
            <Text className="block text-xs text-amber-400/60 mt-1">AI智能创作助手</Text>
          </View>
          <ChevronRight size={20} color="#f59e0b" />
        </View>
      </View>

      {/* 创作数据统计 */}
      <View className="px-5 mt-5">
        <View className="flex gap-3">
          <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <Text className="block text-2xl font-bold text-white">15</Text>
            <Text className="block text-xs text-zinc-500 mt-1">本周创作</Text>
          </View>
          <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <Text className="block text-2xl font-bold text-amber-400">42</Text>
            <Text className="block text-xs text-zinc-500 mt-1">灵感数量</Text>
          </View>
        </View>
      </View>

      {/* 创作工具 */}
      <View className="px-5 mt-6">
        <Text className="block text-xs text-zinc-600 mb-3 font-medium">创作工具</Text>
        
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* 灵感速记 */}
          <View
            className="flex items-center px-4 py-4 border-b border-zinc-800 active:bg-zinc-800"
            onClick={() => handleNav('/pages/quick-note/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-amber-500/20 items-center justify-center">
              <Lightbulb size={20} color="#f59e0b" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white font-medium">灵感速记</Text>
              <Text className="text-xs text-zinc-500 mt-1">快速捕捉灵感</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>

          {/* 选题策划 */}
          <View
            className="flex items-center px-4 py-4 border-b border-zinc-800 active:bg-zinc-800"
            onClick={() => handleNav('/pages/topic-planning/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-cyan-500/20 items-center justify-center">
              <Target size={20} color="#06b6d4" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white font-medium">选题策划</Text>
              <Text className="text-xs text-zinc-500 mt-1">热门选题方向</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>

          {/* 内容写作 */}
          <View
            className="flex items-center px-4 py-4 active:bg-zinc-800"
            onClick={() => handleNav('/pages/content-creation/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-violet-500/20 items-center justify-center">
              <PenTool size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white font-medium">内容写作</Text>
              <Text className="text-xs text-zinc-500 mt-1">高效产出优质内容</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabContentPage;
