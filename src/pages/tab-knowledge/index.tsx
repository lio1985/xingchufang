import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Heart,
  Building2,
  MessageSquareText,
  GraduationCap,
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

      {/* 功能网格 */}
      <View className="p-6">
        <View className="grid grid-cols-2 gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/favorite-list/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-red-500/15">
              <Heart size={32} color="#ef4444" />
            </View>
            <Text className="block text-lg font-medium text-white">个人收藏</Text>
            <Text className="block text-xs text-zinc-500 mt-1">我的收藏内容</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/knowledge-share/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-purple-500/15">
              <Building2 size={32} color="#a855f7" />
            </View>
            <Text className="block text-lg font-medium text-white">公司资料</Text>
            <Text className="block text-xs text-zinc-500 mt-1">企业知识库</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/lexicon-system/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-amber-500/15">
              <MessageSquareText size={32} color="#f59e0b" />
            </View>
            <Text className="block text-lg font-medium text-white">个人语料</Text>
            <Text className="block text-xs text-zinc-500 mt-1">个人表达风格</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/news/index')}
          >
            <View className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-cyan-500/15">
              <GraduationCap size={32} color="#06b6d4" />
            </View>
            <Text className="block text-lg font-medium text-white">课程培训</Text>
            <Text className="block text-xs text-zinc-500 mt-1">学习与培训</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabKnowledgePage;
