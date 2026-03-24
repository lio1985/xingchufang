import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { House, ChartBarBig, User } from 'lucide-react-taro';

interface TabBarProps {
  currentTab: number;
  onTabChange: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 0, title: '首页', icon: House, url: '/pages/index/index' },
    { id: 1, title: '数据', icon: ChartBarBig, url: '/pages/live-data/dashboard/index' },
    { id: 2, title: '我的', icon: User, url: '/pages/profile/index' },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (currentTab === tab.id) return;
    
    onTabChange(tab.id);
    
    // 使用 switchTab 跳转 TabBar 页面
    Taro.switchTab({ url: tab.url }).catch(() => {
      // 如果 switchTab 失败，使用 navigateTo
      Taro.navigateTo({ url: tab.url });
    });
  };

  return (
    <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pb-safe">
      <View className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <View
              key={tab.id}
              className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-transform"
              onClick={() => handleTabClick(tab)}
            >
              <IconComponent
                size={22}
                color={isActive ? '#3B82F6' : '#94A3B8'}
              />
              <Text
                className={`block text-xs mt-1 ${
                  isActive ? 'text-blue-500 font-medium' : 'text-slate-400'
                }`}
              >
                {tab.title}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;
