import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-taro';

const TabKnowledgePage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-8 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b] border-b border-zinc-800">
        <Text className="block text-4xl font-bold text-white mb-2">知识库</Text>
        <Text className="block text-zinc-500 text-lg">企业知识沉淀与复用</Text>
      </View>

      {/* 功能列表 */}
      <View className="p-6">
        <View className="flex flex-col gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/knowledge-share/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-purple-500/15">
              <BookOpen size={32} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">知识分享</Text>
              <Text className="block text-sm text-zinc-500">团队经验沉淀共享</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/lexicon-system/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-amber-500/15">
              <Sparkles size={32} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">语料优化</Text>
              <Text className="block text-sm text-zinc-500">企业语料与IP表达</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/viral-system/index')}
          >
            <View className="w-16 h-16 rounded-xl flex items-center justify-center mr-5 bg-red-500/15">
              <TrendingUp size={32} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">爆款复刻</Text>
              <Text className="block text-sm text-zinc-500">热门内容分析与复刻</Text>
            </View>
            <ChevronRight size={24} color="#52525b" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabKnowledgePage;
