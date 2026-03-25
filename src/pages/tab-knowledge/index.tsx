import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Heart,
  Building2,
  MessageSquareText,
  GraduationCap,
  Search,
  Play,
} from 'lucide-react-taro';

const TabKnowledgePage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b] pb-20">
      {/* 页面头部 */}
      <View className="px-5 pt-14 pb-8 bg-[#141416]">
        <Text className="block text-2xl font-bold text-white">知识库</Text>
        <Text className="block text-zinc-500 text-sm mt-2">企业知识沉淀与复用</Text>
      </View>

      {/* 搜索栏 */}
      <View className="px-5 -mt-4">
        <View 
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center"
          onClick={() => Taro.showToast({ title: '搜索功能开发中', icon: 'none' })}
        >
          <Search size={18} color="#71717a" />
          <Text className="ml-2 text-sm text-zinc-500">搜索知识库内容...</Text>
        </View>
      </View>

      {/* 知识分类 */}
      <View className="px-5 mt-6">
        <Text className="block text-xs text-zinc-600 mb-3 font-medium">知识分类</Text>
        <View className="flex flex-wrap gap-3">
          <View
            className="w-[calc(50%-6px)] bg-zinc-900 border border-zinc-800 rounded-xl p-4 items-center active:bg-zinc-800"
            onClick={() => handleNav('/pages/favorite-list/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-red-500/20 items-center justify-center">
              <Heart size={20} color="#ef4444" />
            </View>
            <Text className="block text-base font-medium text-white mt-2">个人收藏</Text>
            <Text className="block text-xs text-zinc-500 mt-1">我的收藏内容</Text>
          </View>

          <View
            className="w-[calc(50%-6px)] bg-zinc-900 border border-zinc-800 rounded-xl p-4 items-center active:bg-zinc-800"
            onClick={() => handleNav('/pages/knowledge-share/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-purple-500/20 items-center justify-center">
              <Building2 size={20} color="#a855f7" />
            </View>
            <Text className="block text-base font-medium text-white mt-2">公司资料</Text>
            <Text className="block text-xs text-zinc-500 mt-1">企业知识库</Text>
          </View>

          <View
            className="w-[calc(50%-6px)] bg-zinc-900 border border-zinc-800 rounded-xl p-4 items-center active:bg-zinc-800"
            onClick={() => handleNav('/pages/lexicon-system/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-amber-500/20 items-center justify-center">
              <MessageSquareText size={20} color="#f59e0b" />
            </View>
            <Text className="block text-base font-medium text-white mt-2">个人语料</Text>
            <Text className="block text-xs text-zinc-500 mt-1">个人表达风格</Text>
          </View>

          <View
            className="w-[calc(50%-6px)] bg-zinc-900 border border-zinc-800 rounded-xl p-4 items-center active:bg-zinc-800"
            onClick={() => handleNav('/pages/news/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-cyan-500/20 items-center justify-center">
              <GraduationCap size={20} color="#06b6d4" />
            </View>
            <Text className="block text-base font-medium text-white mt-2">课程培训</Text>
            <Text className="block text-xs text-zinc-500 mt-1">学习与培训</Text>
          </View>
        </View>
      </View>

      {/* 最近学习 */}
      <View className="px-5 mt-6">
        <View className="flex items-center justify-between mb-3">
          <Text className="text-xs text-zinc-600 font-medium">最近学习</Text>
          <Text 
            className="text-xs text-amber-400"
            onClick={() => handleNav('/pages/news/index')}
          >
            查看全部
          </Text>
        </View>
        
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* 课程项1 */}
          <View
            className="px-4 py-4 border-b border-zinc-800 active:bg-zinc-800"
            onClick={() => handleNav('/pages/news/index')}
          >
            <View className="flex items-center justify-between">
              <Text className="text-base text-white font-medium">内容创作入门指南</Text>
              <View className="flex items-center">
                <Play size={14} color="#f59e0b" />
                <Text className="text-xs text-amber-400 ml-1">继续</Text>
              </View>
            </View>
            <View className="h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <View className="h-full w-[60%] bg-amber-500 rounded-full" />
            </View>
            <Text className="text-xs text-zinc-500 mt-2">已完成 7/12 课时 · 60%</Text>
          </View>

          {/* 课程项2 */}
          <View
            className="px-4 py-4 active:bg-zinc-800"
            onClick={() => handleNav('/pages/news/index')}
          >
            <View className="flex items-center justify-between">
              <Text className="text-base text-white font-medium">客户沟通技巧</Text>
              <View className="flex items-center">
                <Play size={14} color="#f59e0b" />
                <Text className="text-xs text-amber-400 ml-1">继续</Text>
              </View>
            </View>
            <View className="h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <View className="h-full w-[30%] bg-amber-500 rounded-full" />
            </View>
            <Text className="text-xs text-zinc-500 mt-2">已完成 2/8 课时 · 30%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabKnowledgePage;
