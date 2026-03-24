import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';
import BrandHeader from './components/BrandHeader';
import CoreCard from './components/CoreCard';
import FeatureGrid from './components/FeatureGrid';
import TabBar from './components/TabBar';
import { FEATURES } from './config';

const IndexPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStatus, setUserStatus] = useState<'active' | 'pending' | 'disabled' | 'deleted'>('active');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  // 处理导航
  const handleNavigate = (url: string) => {
    console.log('跳转到:', url);

    const publicPages = [
      '/pages/hotspot/index',
      '/pages/news/index',
      '/pages/index/index',
    ];

    const isPublicPage = publicPages.some(page => url.startsWith(page));
    
    if (isPublicPage) {
      Taro.navigateTo({ url });
      return;
    }

    if (!isLoggedIn) {
      Taro.showModal({
        title: '提示',
        content: '登录后可保存您的数据，是否立即登录？',
        cancelText: '暂不登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }

    if (userStatus === 'pending') {
      Taro.showModal({
        title: '等待审核',
        content: '您的账号正在等待管理员审核，审核通过后即可使用功能。',
        showCancel: false
      });
      return;
    }

    if (userStatus === 'disabled' || userStatus === 'deleted') {
      Taro.showModal({
        title: '账号状态异常',
        content: '您的账号已被禁用，请联系管理员。',
        showCancel: false
      });
      return;
    }

    Taro.navigateTo({ url });
  };

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('token');
          Taro.removeStorageSync('user');
          setIsLoggedIn(false);
          setIsAdmin(false);
          setUserStatus('active');

          Taro.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  };

  // 加载用户信息
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        let storedUser = null;
        let token = null;
        
        try {
          storedUser = Taro.getStorageSync('user');
          token = Taro.getStorageSync('token');
        } catch (storageError) {
          console.error('读取本地存储失败:', storageError);
        }

        if (storedUser && token) {
          const user = storedUser as { role?: string; status?: 'active' | 'pending' | 'disabled' | 'deleted' };
          setIsLoggedIn(true);
          setIsAdmin(user?.role === 'admin');
          setUserStatus(user?.status || 'active');

          try {
            const response = await Network.request({
              url: '/api/user/profile',
              method: 'GET',
            });

            if (response.statusCode === 200 && response.data?.data) {
              const latestUser = response.data.data as { role: string; status: 'active' | 'pending' | 'disabled' | 'deleted' };
              try {
                Taro.setStorageSync('user', latestUser);
              } catch (saveError) {
                console.error('保存用户信息到本地存储失败:', saveError);
              }
              setIsAdmin(latestUser.role === 'admin');
              setUserStatus(latestUser.status || 'active');
            }
          } catch (error: any) {
            if (error.statusCode === 404) {
              console.log('用户资料接口暂未部署');
            } else {
              console.error('获取最新用户信息失败:', error);
            }
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        setIsLoggedIn(false);
      }
    };

    loadUserInfo();
  }, []);

  // 获取未读消息数量
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isLoggedIn) return;
      
      try {
        const response = await Network.request({
          url: '/api/notifications/unread-count',
          method: 'GET',
        });

        if (response.data?.success) {
          setUnreadCount(response.data.data.count);
        }
      } catch (error: any) {
        if (error.statusCode === 404) {
          console.log('通知接口暂未部署');
        } else {
          console.error('获取未读消息失败:', error);
        }
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // 获取待审核用户数量
  useEffect(() => {
    if (isAdmin && isLoggedIn) {
      const loadPendingUsersCount = async () => {
        try {
          const response = await Network.request({
            url: '/api/admin/pending-users/count',
            method: 'GET',
          });

          if (response.statusCode === 200 && response.data?.data) {
            setPendingUsersCount(response.data.data.count || 0);
          }
        } catch (error) {
          console.error('加载待审核用户数量失败:', error);
        }
      };

      loadPendingUsersCount();
    }
  }, [isAdmin, isLoggedIn]);

  return (
    <View className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部品牌区 */}
      <BrandHeader
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        unreadCount={unreadCount}
        pendingUsersCount={pendingUsersCount}
        devModeEnabled={false}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {/* 可滚动内容区 */}
      <ScrollView
        className="flex-1"
        scrollY
        scrollWithAnimation
        enableBackToTop
      >
        {/* 核心业务区 */}
        <View className="px-5 pt-6 pb-4">
          <Text className="block text-lg font-bold text-slate-800 mb-4">核心业务</Text>
          <View className="flex gap-4">
            {FEATURES.core.map((feature) => (
              <CoreCard
                key={feature.id}
                {...feature}
                onNavigate={handleNavigate}
              />
            ))}
          </View>
        </View>

        {/* 次级功能区 */}
        <View className="px-5 pt-4 pb-24">
          <Text className="block text-lg font-bold text-slate-800 mb-4">更多功能</Text>
          <FeatureGrid
            features={FEATURES.secondary}
            onNavigate={handleNavigate}
          />
        </View>
      </ScrollView>

      {/* 底部导航栏 */}
      <TabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </View>
  );
};

export default IndexPage;
