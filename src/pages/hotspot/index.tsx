import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Lightbulb,
  Target,
  Sparkles,
  ChevronRight,
} from 'lucide-react-taro';

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: typeof Lightbulb;
  color: string;
  bgColor: string;
  path: string;
}

const FEATURES: Feature[] = [
  {
    id: 'quick-note',
    title: '灵感速记',
    desc: '快速捕捉创作灵感',
    icon: Lightbulb,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    path: '/pages/quick-note/index',
  },
  {
    id: 'topic',
    title: '选题策划',
    desc: '发现热门选题方向',
    icon: Target,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    path: '/pages/topic-planning/index',
  },
  {
    id: 'content',
    title: '内容创作',
    desc: '高效产出优质内容',
    icon: Sparkles,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    path: '/pages/content-creation/index',
  },
];

const CreationPage = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 页面头部 */}
      <View className="px-8 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b] border-b border-zinc-800">
        <Text className="block text-4xl font-bold text-white mb-2">创作</Text>
        <Text className="block text-zinc-500 text-lg">释放你的创作潜能</Text>
      </View>

      {/* 功能列表 */}
      <View className="p-6">
        <View className="flex flex-col gap-4">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <View
                key={item.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex items-center active:bg-zinc-800/60"
                onClick={() => handleNav(item.path)}
              >
                <View 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mr-5"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <Icon size={32} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="block text-xl font-semibold text-white mb-1">{item.title}</Text>
                  <Text className="block text-sm text-zinc-500">{item.desc}</Text>
                </View>
                <ChevronRight size={24} color="#52525b" />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default CreationPage;
