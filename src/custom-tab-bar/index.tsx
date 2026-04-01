import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState, useCallback } from 'react';

// TabBar 配置
const TAB_LIST = [
  {
    pagePath: '/pages/tab-home/index',
    text: '工作台',
    iconPath: './assets/tabbar/layout-dashboard.png',
    selectedIconPath: './assets/tabbar/layout-dashboard-active.png',
  },
  {
    pagePath: '/pages/tab-customer/index',
    text: '客资管理',
    iconPath: './assets/tabbar/users.png',
    selectedIconPath: './assets/tabbar/users-active.png',
  },
  {
    pagePath: '/pages/tab-knowledge/index',
    text: '知识库',
    iconPath: './assets/tabbar/book-open.png',
    selectedIconPath: './assets/tabbar/book-open-active.png',
  },
  {
    pagePath: '/pages/tab-content/index',
    text: '内容创作',
    iconPath: './assets/tabbar/pen-tool.png',
    selectedIconPath: './assets/tabbar/pen-tool-active.png',
    requireLogin: true, // 需要登录才显示
  },
  {
    pagePath: '/pages/tab-profile/index',
    text: '我',
    iconPath: './assets/tabbar/user.png',
    selectedIconPath: './assets/tabbar/user-active.png',
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
              src={isSelected ? tab.selectedIconPath : tab.iconPath}
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
