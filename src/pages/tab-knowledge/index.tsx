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

  // 模拟最近学习数据
  const recentLearning = [
    { id: 1, title: '内容创作入门指南', progress: 60, lessons: 12, completed: 7 },
    { id: 2, title: '客户沟通技巧', progress: 30, lessons: 8, completed: 2 },
  ];

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-6 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b]">
        <Text className="block text-3xl font-bold text-white mb-2">知识库</Text>
        <Text className="block text-zinc-500 text-base">企业知识沉淀与复用</Text>
      </View>

      {/* 搜索栏 */}
      <View className="px-6 pb-4">
        <View 
          className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 flex items-center"
          onClick={() => Taro.showToast({ title: '搜索功能开发中', icon: 'none' })}
        >
          <Search size={18} color="#71717a" />
          <Text className="ml-2 text-sm text-zinc-500">搜索知识库内容...</Text>
        </View>
      </View>

      {/* 功能入口 */}
      <View className="px-6 py-2">
        <Text className="block text-sm text-zinc-600 mb-3 px-1">知识分类</Text>
        <View className="grid grid-cols-2 gap-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/favorite-list/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-red-500/15">
              <Heart size={24} color="#ef4444" />
            </View>
            <Text className="block text-base font-medium text-white">个人收藏</Text>
            <Text className="block text-xs text-zinc-500 mt-1">我的收藏内容</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/knowledge-share/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-purple-500/15">
              <Building2 size={24} color="#a855f7" />
            </View>
            <Text className="block text-base font-medium text-white">公司资料</Text>
            <Text className="block text-xs text-zinc-500 mt-1">企业知识库</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/lexicon-system/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-amber-500/15">
              <MessageSquareText size={24} color="#f59e0b" />
            </View>
            <Text className="block text-base font-medium text-white">个人语料</Text>
            <Text className="block text-xs text-zinc-500 mt-1">个人表达风格</Text>
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/news/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-cyan-500/15">
              <GraduationCap size={24} color="#06b6d4" />
            </View>
            <Text className="block text-base font-medium text-white">课程培训</Text>
            <Text className="block text-xs text-zinc-500 mt-1">学习与培训</Text>
          </View>
        </View>
      </View>

      {/* 最近学习 */}
      <View className="px-6 py-4">
        <View className="flex items-center justify-between mb-3 px-1">
          <Text className="text-sm text-zinc-600">最近学习</Text>
          <Text 
            className="text-sm text-amber-400"
            onClick={() => handleNav('/pages/news/index')}
          >
            查看全部
          </Text>
        </View>
        <View className="flex flex-col gap-3">
          {recentLearning.map((course) => (
            <View
              key={course.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 active:bg-zinc-800/60"
              onClick={() => handleNav('/pages/news/index')}
            >
              <View className="flex items-center justify-between mb-3">
                <Text className="text-base font-medium text-white">{course.title}</Text>
                <View className="flex items-center">
                  <Play size={14} color="#f59e0b" />
                  <Text className="text-xs text-amber-400 ml-1">继续学习</Text>
                </View>
              </View>
              {/* 进度条 */}
              <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </View>
              <Text className="text-xs text-zinc-500 mt-2">
                已完成 {course.completed}/{course.lessons} 课时 · {course.progress}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TabKnowledgePage;
