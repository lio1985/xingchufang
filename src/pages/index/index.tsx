import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  bgColor: string;
  path: string;
}

const FEATURES: Feature[] = [
  { id: 'quick-note', title: '灵感速记', desc: '快速捕捉创作灵感', icon: '💡', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', path: '/pages/quick-note/index' },
  { id: 'customer', title: '客资管理', desc: '客户资料高效管理', icon: '👥', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)', path: '/pages/customer-management/index' },
  { id: 'recycle', title: '厨具回收', desc: '回收业务全流程', icon: '🔄', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', path: '/pages/recycling-order/index' },
  { id: 'topic', title: '选题策划', desc: '发现热门选题', icon: '🎯', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)', path: '/pages/topic-planning/index' },
  { id: 'content', title: '内容创作', desc: '高效产出优质内容', icon: '✨', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', path: '/pages/content-creation/index' },
  { id: 'stats', title: '数据统计', desc: '数据分析洞察', icon: '📊', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)', path: '/pages/data-stats/index' },
  { id: 'knowledge', title: '知识分享', desc: '团队经验沉淀', icon: '📚', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)', path: '/pages/knowledge-share/index' },
  { id: 'lexicon', title: '语料优化', desc: '打造内容武器库', icon: '🛠', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.1)', path: '/pages/lexicon-system/index' },
  { id: 'viral', title: '爆款复刻', desc: '拆解爆款逻辑', icon: '🔥', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)', path: '/pages/viral-system/index' },
  { id: 'live', title: '直播数据', desc: '数据分析洞察', icon: '📺', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)', path: '/pages/live-data/dashboard/index' },
  { id: 'settings', title: '系统设置', desc: '个性化配置', icon: '⚙️', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.1)', path: '/pages/settings/index' },
];

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setIsLoggedIn(true);
        setIsAdmin(user.role === 'admin');
      }
    } catch (e) {
      console.log('storage error');
    }

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('早上好');
    } else if (hour < 18) {
      setGreeting('下午好');
    } else {
      setGreeting('晚上好');
    }
  }, []);

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleLogin = () => {
    if (isLoggedIn) {
      Taro.navigateTo({ url: '/pages/settings/index' });
    } else {
      Taro.navigateTo({ url: '/pages/login/index' });
    }
  };

  const handleAdmin = () => {
    Taro.navigateTo({ url: '/pages/admin/dashboard/index' });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b] pb-24">
      {/* Header */}
      <View className="bg-gradient-to-b from-[#141416] to-[#0a0a0b] px-8 pt-12 pb-8 border-b border-[#27272a]">
        <View className="flex justify-between items-start mb-8">
          <View>
            {/* Logo */}
            <View className="flex items-center gap-3 mb-2">
              <View className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#fb923c] flex items-center justify-center">
                <Text className="text-2xl">⭐</Text>
              </View>
              <Text className="text-3xl font-bold text-white">星厨房</Text>
            </View>
            <Text className="text-lg text-zinc-400 mt-1">{greeting}，创作者</Text>
          </View>
          
          {/* 右侧操作 */}
          <View className="flex gap-3">
            {isAdmin && (
              <View 
                className="px-5 py-3 bg-amber-500/10 rounded-xl border border-amber-500/30"
                onClick={handleAdmin}
              >
                <Text className="text-base text-amber-500 font-medium">后台</Text>
              </View>
            )}
            <View 
              className="px-5 py-3 bg-[#141416] rounded-xl border border-[#27272a]"
              onClick={handleLogin}
            >
              <Text className="text-base font-medium text-green-500">
                {isLoggedIn ? '已登录' : '登录'}
              </Text>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <ScrollView 
          scrollX 
          className="w-full"
          showHorizontalScrollIndicator={false}
        >
          <View className="flex gap-4 pr-8">
            {[
              { label: '灵感速记', icon: '💡', path: '/pages/quick-note/index' },
              { label: '选题策划', icon: '🎯', path: '/pages/topic-planning/index' },
              { label: '内容创作', icon: '✨', path: '/pages/content-creation/index' },
              { label: '数据统计', icon: '📊', path: '/pages/data-stats/index' },
              { label: '客户管理', icon: '👥', path: '/pages/customer-management/index' },
              { label: '回收订单', icon: '🔄', path: '/pages/recycling-order/index' },
            ].map((item, index) => (
              <View
                key={index}
                className="flex-shrink-0 px-6 py-4 bg-[#141416] rounded-2xl border border-[#27272a] flex items-center gap-3"
                onClick={() => handleNav(item.path)}
              >
                <Text className="text-2xl">{item.icon}</Text>
                <Text className="text-base text-white font-medium">{item.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 功能列表 */}
      <View className="px-8 pt-8">
        <Text className="text-xl font-semibold text-white mb-6">全部功能</Text>

        <View className="space-y-4">
          {FEATURES.map((item) => (
            <View
              key={item.id}
              className="bg-[#141416] rounded-2xl p-6 flex items-center border border-[#27272a]"
              onClick={() => handleNav(item.path)}
            >
              <View 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mr-5"
                style={{ backgroundColor: item.bgColor }}
              >
                <Text className="text-3xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-white mb-1">{item.title}</Text>
                <Text className="text-sm text-zinc-500">{item.desc}</Text>
              </View>
              <Text className="text-2xl text-zinc-700">→</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 底部提示 */}
      <View className="px-8 py-8 text-center">
        <Text className="text-xs text-zinc-600">星厨房 · 让创作更高效</Text>
      </View>
    </View>
  );
};

export default Index;
