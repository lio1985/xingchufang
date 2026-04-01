import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState, useCallback } from 'react';

// 导入图标
import layoutDashboardIcon from '@/assets/tabbar/layout-dashboard.png';
import layoutDashboardActiveIcon from '@/assets/tabbar/layout-dashboard-active.png';
import usersIcon from '@/assets/tabbar/users.png';
import usersActiveIcon from '@/assets/tabbar/users-active.png';
import bookOpenIcon from '@/assets/tabbar/book-open.png';
import bookOpenActiveIcon from '@/assets/tabbar/book-open-active.png';
import penToolIcon from '@/assets/tabbar/pen-tool.png';
import penToolActiveIcon from '@/assets/tabbar/pen-tool-active.png';
import userIcon from '@/assets/tabbar/user.png';
import userActiveIcon from '@/assets/tabbar/user-active.png';

// TabBar 配置
const TAB_LIST = [
  {
    pagePath: '/pages/tab-home/index',
    text: '工作台',
    icon: layoutDashboardIcon,
    activeIcon: layoutDashboardActiveIcon,
  },
  {
    pagePath: '/pages/tab-customer/index',
    text: '客资管理',
    icon: usersIcon,
    activeIcon: usersActiveIcon,
  },
  {
    pagePath: '/pages/tab-knowledge/index',
    text: '知识库',
    icon: bookOpenIcon,
    activeIcon: bookOpenActiveIcon,
  },
  {
    pagePath: '/pages/tab-content/index',
    text: '内容创作',
    icon: penToolIcon,
    activeIcon: penToolActiveIcon,
    requireLogin: true, // 需要登录才显示
  },
  {
    pagePath: '/pages/tab-profile/index',
    text: '我',
    icon: userIcon,
    activeIcon: userActiveIcon,
  },
];

export default function CustomTabBar() {
  const [selected, setSelected] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查登录状态
  const checkLoginStatus = useCallback(() => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      const loggedIn = !!(user && token);
      setIsLoggedIn(loggedIn);
      return loggedIn;
    } catch (e) {
      setIsLoggedIn(false);
      return false;
    }
  }, []);

  // 获取当前页面路径并更新选中状态
  const updateCurrentPage = useCallback(() => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const path = '/' + currentPage.route;
      const index = TAB_LIST.findIndex(tab => tab.pagePath === path);
      if (index !== -1) {
        setSelected(index);
      }
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
    updateCurrentPage();
  }, [checkLoginStatus, updateCurrentPage]);

  // 监听页面显示事件
  useEffect(() => {
    const onTabBarRefresh = () => {
      checkLoginStatus();
      updateCurrentPage();
    };

    Taro.eventCenter.on('tabBarRefresh', onTabBarRefresh);

    return () => {
      Taro.eventCenter.off('tabBarRefresh', onTabBarRefresh);
    };
  }, [checkLoginStatus, updateCurrentPage]);

  const switchTab = (path: string, index: number) => {
    setSelected(index);
    Taro.switchTab({ url: path });
  };

  // 根据登录状态过滤 Tab
  const visibleTabs = TAB_LIST.filter(tab => {
    if (tab.requireLogin && !isLoggedIn) {
      return false;
    }
    return true;
  });

  return (
    <View 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#141416',
        borderTop: '1px solid #27272a',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 9999,
      }}
    >
      {visibleTabs.map((tab) => {
        const actualIndex = TAB_LIST.findIndex(t => t.pagePath === tab.pagePath);
        const isSelected = selected === actualIndex;
        return (
          <View
            key={tab.pagePath}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 0',
            }}
            onClick={() => switchTab(tab.pagePath, actualIndex)}
          >
            <Image
              src={isSelected ? tab.activeIcon : tab.icon}
              style={{ width: '24px', height: '24px' }}
              mode="aspectFit"
            />
            <Text 
              style={{
                fontSize: '10px',
                marginTop: '2px',
                color: isSelected ? '#f59e0b' : '#71717a',
              }}
            >
              {tab.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
