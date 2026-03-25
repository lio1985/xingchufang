import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Users,
  Recycle,
  ChartBarBig,
  BookOpen,
  ChevronRight,
} from 'lucide-react-taro';
import './index.css';

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: typeof Users;
  color: string;
  bgColor: string;
  path: string;
}

const FEATURES: Feature[] = [
  {
    id: 'customer',
    title: '客资管理',
    desc: '客户资料高效管理',
    icon: Users,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    path: '/pages/customer/index',
  },
  {
    id: 'recycle',
    title: '厨具回收',
    desc: '回收业务全流程',
    icon: Recycle,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    path: '/pages/recycle/index',
  },
  {
    id: 'stats',
    title: '数据统计',
    desc: '数据分析洞察',
    icon: ChartBarBig,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    path: '/pages/data-stats/index',
  },
  {
    id: 'knowledge',
    title: '知识分享',
    desc: '团队经验沉淀',
    icon: BookOpen,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    path: '/pages/knowledge-share/index',
  },
];

const Index = () => {
  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View className="page-container">
      {/* 页面头部 */}
      <View className="page-header">
        <Text className="page-title">管理</Text>
        <Text className="page-subtitle">选择功能模块开始工作</Text>
      </View>

      {/* 功能列表 */}
      <View className="feature-section">
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
                  <Icon size={40} color={item.color} />
                </View>
                <View className="feature-content">
                  <Text className="feature-title">{item.title}</Text>
                  <Text className="feature-desc">{item.desc}</Text>
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

export default Index;
