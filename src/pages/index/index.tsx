import { View, Text, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';
import './icons.css';

interface WelcomeMessage {
  id: string;
  title: string;
  content: string;
  image_url: string;
  order: string;
}

const IndexPage = () => {
  const [welcomeMessages, setWelcomeMessages] = useState<WelcomeMessage[]>([]);
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStatus, setUserStatus] = useState<'active' | 'pending' | 'disabled' | 'deleted'>('active');
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showDevBadge, setShowDevBadge] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Taro.getStorageSync('token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const res = await Network.request({
            url: '/api/user/info',
            method: 'GET'
          });
          console.log('[首页] 获取用户信息响应:', res.data);

          if (res.data && res.data.success && res.data.data) {
            const userData = res.data.data;
            setUserInfo(userData);
            setIsAdmin(userData.role === 'admin');
            setUserStatus(userData.status);
            setShowDevBadge(userData.role === 'admin');

            // 如果用户状态不是 active，跳转到等待审核页
            if (userData.status === 'pending') {
              Taro.redirectTo({
                url: '/pages/pending/index'
              });
            } else if (userData.status === 'disabled' || userData.status === 'deleted') {
              Taro.showModal({
                title: '账号异常',
                content: '您的账号已被禁用或删除，请联系管理员',
                showCancel: false,
                success: () => {
                  Taro.clearStorageSync();
                  Taro.redirectTo({ url: '/pages/login/index' });
                }
              });
            }
          }
        } catch (error) {
          console.error('[首页] 获取用户信息失败:', error);
        }
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };

    fetchUserInfo();
  }, []);

  // 获取欢迎消息
  useEffect(() => {
    const fetchWelcomeMessages = async () => {
      try {
        const res = await Network.request({
          url: '/api/welcome/list',
          method: 'GET'
        });
        console.log('[首页] 获取欢迎消息响应:', res.data);

        if (res.data && res.data.success && res.data.data) {
          setWelcomeMessages(res.data.data);
        }
      } catch (error) {
        console.error('[首页] 获取欢迎消息失败:', error);
      }
    };

    fetchWelcomeMessages();
  }, []);

  // 获取待审核用户数量（管理员）
  useEffect(() => {
    const fetchPendingUsers = async () => {
      const token = Taro.getStorageSync('token');
      if (!token || !isAdmin) return;

      try {
        const res = await Network.request({
          url: '/api/user/pending',
          method: 'GET'
        });
        console.log('[首页] 获取待审核用户响应:', res.data);

        if (res.data && res.data.success && res.data.data) {
          setPendingUsersCount(res.data.data.length);
        }
      } catch (error) {
        console.error('[首页] 获取待审核用户失败:', error);
      }
    };

    fetchPendingUsers();
  }, [isAdmin]);

  // 开发模式开关
  useEffect(() => {
    const enableDevMode = () => {
      setDevModeEnabled(true);
      setShowDevBadge(true);
      Taro.showToast({
        title: '开发模式已开启',
        icon: 'success'
      });
    };

    Taro.eventCenter.on('enableDevMode', enableDevMode);

    return () => {
      Taro.eventCenter.off('enableDevMode', enableDevMode);
    };
  }, []);

  // 标题点击处理
  const handleTitleClick = () => {
    const newCount = titleClickCount + 1;
    setTitleClickCount(newCount);

    if (newCount >= 5) {
      setDevModeEnabled(!devModeEnabled);
      setShowDevBadge(!showDevBadge);
      Taro.showToast({
        title: devModeEnabled ? '开发模式已关闭' : '开发模式已开启',
        icon: 'success'
      });
      setTitleClickCount(0);
    }
  };

  // 通知点击
  const handleNotificationClick = () => {
    if (devModeEnabled) {
      Taro.showModal({
        title: '系统通知',
        content: '暂无新通知',
        showCancel: false
      });
    } else {
      Taro.showToast({
        title: '通知功能开发中',
        icon: 'none'
      });
    }
  };

  // 管理员点击
  const handleAdminClick = () => {
    if (!isAdmin) return;

    Taro.navigateTo({
      url: '/pages/admin/index'
    });
  };

  // 设置点击
  const handleSettingsClick = () => {
    if (!isLoggedIn) {
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }

    Taro.navigateTo({
      url: '/pages/settings/index'
    });
  };

  // 退出登录
  const handleLogoutClick = async () => {
    if (!isLoggedIn) {
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }

    const confirmed = await Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
    });

    if (confirmed.confirm) {
      Taro.clearStorageSync();
      setUserInfo(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setShowDevBadge(false);
      Taro.reLaunch({
        url: '/pages/login/index'
      });
    }
  };

  // 菜单项点击
  const handleMenuClick = (path: string) => {
    if (!isLoggedIn) {
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }

    if (userStatus !== 'active') {
      Taro.showToast({
        title: '账号状态异常',
        icon: 'none'
      });
      return;
    }

    Taro.navigateTo({
      url: path
    });
  };

  // 渲染轮播图
  const renderSwiper = () => {
    if (welcomeMessages.length === 0) return null;

    return (
      <View className="relative w-full h-[280px] mt-[88px]">
        <Swiper
          className="w-full h-full"
          indicatorDots
          autoplay
          circular
          interval={3000}
          indicatorColor="rgba(255,255,255,0.3)"
          indicatorActiveColor="#ffffff"
        >
          {welcomeMessages.map((msg) => (
            <SwiperItem key={msg.id}>
              <View
                className="w-full h-full relative"
                style={{
                  backgroundImage: msg.image_url ? `url(${msg.image_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <View className="absolute inset-0 bg-black bg-opacity-20" />
                <View className="relative z-10 p-6 flex flex-col justify-center h-full">
                  <Text className="block text-white text-2xl font-bold mb-2">{msg.title}</Text>
                  <Text className="block text-white text-sm opacity-90">{msg.content}</Text>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>
    );
  };

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部渐变背景 */}
      <View
        className="fixed top-0 left-0 right-0 h-[380px] z-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />

      {/* 顶部导航栏 */}
      <View className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-2">
            <Text
              className="block text-white text-xl font-bold"
              onClick={handleTitleClick}
            >
              星厨房
              {showDevBadge && (
                <Text className="text-xs ml-1 bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                  {devModeEnabled ? 'DEV' : 'ADMIN'}
                </Text>
              )}
            </Text>
          </View>
          <View className="flex items-center gap-4">
            <View onClick={handleNotificationClick}>
              <View className="nav-icon-box">
                <Image src="/static/icons/bell.png" className="nav-icon" mode="aspectFit" />
              </View>
            </View>
            {isAdmin && (
              <View onClick={handleAdminClick}>
                <View className="nav-icon-box">
                  <Image src="/static/icons/shield.png" className="nav-icon" mode="aspectFit" />
                </View>
              </View>
            )}
            <View onClick={handleSettingsClick}>
              <View className="nav-icon-box">
                <Image src="/static/icons/settings.png" className="nav-icon" mode="aspectFit" />
              </View>
            </View>
            <View onClick={handleLogoutClick}>
              <View className="nav-icon-box">
                <Image src="/static/icons/logout.png" className="nav-icon" mode="aspectFit" />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 轮播图 */}
      {renderSwiper()}

      {/* 主要内容区域 */}
      <ScrollView
        className="relative z-10 px-4 pb-24"
        scrollY
        style={{ marginTop: welcomeMessages.length > 0 ? '-20px' : '100px' }}
      >
        {/* 用户信息卡片 */}
        {isLoggedIn && userInfo && (
          <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <View className="flex items-center gap-3">
              <View className="nav-icon-box bg-purple-100">
                <Image src="/static/icons/user.png" className="nav-icon" mode="aspectFit" />
              </View>
              <View className="flex-1">
                <Text className="block text-lg font-semibold">{userInfo.username}</Text>
                <Text className="block text-xs text-gray-500">
                  {userInfo.role === 'admin' ? '管理员' : '创作者'}
                  {isAdmin && pendingUsersCount > 0 && (
                    <Text className="text-red-500 ml-2">
                      ({pendingUsersCount} 人待审核)
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 功能菜单 */}
        <View className="grid grid-cols-2 gap-3">
          {/* 灵感速记 */}
          <View
            className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            }}
            onClick={() => handleMenuClick('/pages/inspiration/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/lightbulb.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">灵感速记</Text>
              <Text className="block text-white text-xs opacity-80">快速记录创作想法</Text>
            </View>
          </View>

          {/* 选题策划 */}
          <View
            className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            }}
            onClick={() => handleMenuClick('/pages/idea-planning/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/sparkles.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">选题策划</Text>
              <Text className="block text-white text-xs opacity-80">管理选题与内容</Text>
            </View>
          </View>

          {/* 内容创作 */}
          <View
            className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            }}
            onClick={() => handleMenuClick('/pages/content-creation/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/pentool.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">内容创作</Text>
              <Text className="block text-white text-xs opacity-80">脚本撰写与生成</Text>
            </View>
          </View>

          {/* 语料优化 */}
          <View
            className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            }}
            onClick={() => handleMenuClick('/pages/material-optimization/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/trending.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">语料优化</Text>
              <Text className="block text-white text-xs opacity-80">语料库智能优化</Text>
            </View>
          </View>

          {/* 知识分享 */}
          <View
            className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            }}
            onClick={() => handleMenuClick('/pages/knowledge-sharing/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/book.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">知识分享</Text>
              <Text className="block text-white text-xs opacity-80">分享创作经验</Text>
            </View>
          </View>

          {/* 直播数据 */}
          <View
            className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
            }}
            onClick={() => handleMenuClick('/pages/live-data/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/video.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">直播数据</Text>
              <Text className="block text-white text-xs opacity-80">直播数据统计</Text>
            </View>
          </View>

          {/* 客资管理 */}
          <View
            className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
            onClick={() => handleMenuClick('/pages/customer-management/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/users.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">客资管理</Text>
              <Text className="block text-white text-xs opacity-80">管理客户资源</Text>
            </View>
          </View>

          {/* 厨具回收 */}
          <View
            className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl shadow-md p-4"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            }}
            onClick={() => handleMenuClick('/pages/kitchen-recycle/index')}
          >
            <View className="flex flex-col items-center gap-2">
              <View className="menu-icon-lg-box">
                <Image src="/static/icons/recycle.png" className="menu-icon-lg" mode="aspectFit" />
              </View>
              <Text className="block text-white font-semibold">厨具回收</Text>
              <Text className="block text-white text-xs opacity-80">厨具回收管理</Text>
            </View>
          </View>
        </View>

        {/* 底部提示 */}
        <View className="mt-6 text-center">
          <Text className="block text-xs text-gray-400">
            星厨房创作助手 v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default IndexPage;
