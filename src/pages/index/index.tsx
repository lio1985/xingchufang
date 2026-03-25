import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  Lightbulb,
  Target,
  Sparkles,
  Activity,
  Users,
  Recycle,
  BookOpen,
  Settings,
  ChevronRight,
  Shield,
} from 'lucide-react-taro';
import './index.css';

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
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
    bgColor: 'rgba(245, 158, 11, 0.1)',
    path: '/pages/quick-note/index',
  },
  {
    id: 'customer',
    title: '客资管理',
    desc: '客户资料高效管理',
    icon: Users,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    path: '/pages/customer-management/index',
  },
  {
    id: 'recycle',
    title: '厨具回收',
    desc: '回收业务全流程',
    icon: Recycle,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    path: '/pages/recycling-order/index',
  },
  {
    id: 'topic',
    title: '选题策划',
    desc: '发现热门选题',
    icon: Target,
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    path: '/pages/topic-planning/index',
  },
  {
    id: 'content',
    title: '内容创作',
    desc: '高效产出优质内容',
    icon: Sparkles,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    path: '/pages/content-creation/index',
  },
  {
    id: 'stats',
    title: '数据统计',
    desc: '数据分析洞察',
    icon: Activity,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    path: '/pages/data-stats/index',
  },
  {
    id: 'knowledge',
    title: '知识分享',
    desc: '团队经验沉淀',
    icon: BookOpen,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    path: '/pages/knowledge-share/index',
  },
  {
    id: 'settings',
    title: '系统设置',
    desc: '个性化配置',
    icon: Settings,
    color: '#71717a',
    bgColor: 'rgba(113, 113, 122, 0.1)',
    path: '/pages/settings/index',
  },
];

const QUICK_ACCESS = [
  { label: '灵感速记', icon: Lightbulb, path: '/pages/quick-note/index' },
  { label: '选题策划', icon: Target, path: '/pages/topic-planning/index' },
  { label: '内容创作', icon: Sparkles, path: '/pages/content-creation/index' },
  { label: '数据统计', icon: Activity, path: '/pages/data-stats/index' },
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
    <View className="page-container">
      {/* Header */}
      <View className="page-header">
        <View className="header-top">
          {/* Logo 和标题 */}
          <View className="logo-container">
            <View className="logo-icon">
              <Lightbulb size={24} color="#000" />
            </View>
            <Text className="page-title">星厨房</Text>
          </View>
          <View className="greeting-section">
            <Text className="greeting-text">{greeting}，创作者</Text>
            <View className="action-buttons">
              {isAdmin && (
                <View className="action-btn action-btn-primary" onClick={handleAdmin}>
                  <Shield size={20} color="#f59e0b" />
                </View>
              )}
              <View className="action-btn" onClick={handleLogin}>
                <Text style={{ fontSize: '24px', color: isLoggedIn ? '#22c55e' : '#fafafa' }}>
                  {isLoggedIn ? '已登录' : '登录'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <ScrollView scrollX className="quick-access" showHorizontalScrollIndicator={false}>
          <View className="quick-access-scroll">
            {QUICK_ACCESS.map((item, index) => {
              const Icon = item.icon;
              return (
                <View
                  key={index}
                  className="quick-access-item"
                  onClick={() => handleNav(item.path)}
                >
                  <Icon size={28} color="#f59e0b" />
                  <Text className="quick-access-text">{item.label}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 功能列表 */}
      <View className="feature-section">
        <Text className="section-title">全部功能</Text>

        <View className="feature-list">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <View
                key={item.id}
                className="feature-card"
                onClick={() => handleNav(item.path)}
              >
                <View className="feature-icon-wrapper" style={{ backgroundColor: item.bgColor }}>
                  <Icon size={44} color={item.color} />
                </View>
                <View className="feature-content">
                  <Text className="feature-title">{item.title}</Text>
                  <Text className="feature-desc">{item.desc}</Text>
                </View>
                <ChevronRight size={28} color="#3f3f46" />
              </View>
            );
          })}
        </View>
      </View>

      {/* 底部提示 */}
      <View className="footer-tip">
        <Text className="footer-text">星厨房 · 让创作更高效</Text>
      </View>
    </View>
  );
};

export default Index;
