import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Lightbulb,
  Target,
  PenTool,
  Sparkles,
  ChevronRight,
} from 'lucide-react-taro';
import { Network } from '@/network';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ContentStats {
  weeklyCreations: number;
  inspirationCount: number;
}

const TabContentPage = () => {
  const { isLoggedIn } = useAuthGuard({ requireLogin: false });
  const [stats, setStats] = useState<ContentStats>({
    weeklyCreations: 0,
    inspirationCount: 0,
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchStats();
    }
  }, [isLoggedIn]);

  const fetchStats = async () => {
    try {
      const [topicsRes, inspirationsRes] = await Promise.all([
        Network.request({
          url: '/api/topics/statistics',
          method: 'GET',
        }).catch(() => null),
        Network.request({
          url: '/api/inspirations',
          method: 'GET',
        }).catch(() => null),
      ]);

      let weeklyCreations = 0;
      let inspirationCount = 0;

      if (topicsRes?.data?.code === 200 && topicsRes?.data?.data) {
        const topicStats = topicsRes.data.data;
        if (topicStats.statusCounts) {
          weeklyCreations = Object.values(topicStats.statusCounts as Record<string, number>)
            .reduce((sum, count) => sum + (count || 0), 0);
        }
      }

      if (inspirationsRes?.data?.code === 200 && inspirationsRes?.data?.data) {
        inspirationCount = Array.isArray(inspirationsRes.data.data)
          ? inspirationsRes.data.data.length
          : 0;
      }

      setStats({ weeklyCreations, inspirationCount });
    } catch (error) {
      console.error('[TabContent] 获取统计数据失败:', error);
    }
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  // 未登录时不渲染任何内容
  if (!isLoggedIn) {
    return null;
  }

  // 已登录状态显示完整功能
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>内容创作</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>释放你的写作潜能</Text>
      </View>

      {/* 星小帮 - 写作助手入口 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center' }}
          onClick={() => handleNav('/package-content/pages/ai-assistant/index')}
        >
          <View style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1, marginLeft: '16px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#38bdf8', display: 'block' }}>星小帮</Text>
            <Text style={{ fontSize: '12px', color: 'rgba(245, 158, 11, 0.6)', display: 'block', marginTop: '4px' }}>写作助手</Text>
          </View>
          <ChevronRight size={20} color="#38bdf8" />
        </View>
      </View>

      {/* 创作数据统计 */}
      <View style={{ padding: '20px 20px 0' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>{stats.weeklyCreations}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>本周创作</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#38bdf8' }}>{stats.inspirationCount}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>灵感数量</Text>
          </View>
        </View>
      </View>

      {/* 创作工具 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>创作工具</Text>
        
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 灵感速记 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/package-content/pages/quick-note/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={20} color="#38bdf8" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>灵感速记</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>快速捕捉灵感</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>

          {/* 选题策划 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/package-content/pages/topic-planning/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color="#06b6d4" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>选题策划</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>热门选题方向</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>

          {/* 内容写作 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '16px' }}
            onClick={() => handleNav('/package-content/pages/content-creation/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PenTool size={20} color="#8b5cf6" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>内容写作</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>高效产出优质内容</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabContentPage;
