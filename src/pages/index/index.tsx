import { View, Text, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';

// 内联SVG图标组件 - 解决微信小程序线上环境SVG显示问题
const IconBell = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconLogOut = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// 内联SVG图标组件 - 解决微信小程序线上环境SVG显示问题
const IconLightbulb = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  </View>
);

const IconSparkles = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  </View>
);

const IconPenTool = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  </View>
);

const IconTrendingUp = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  </View>
);

const IconBookOpen = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  </View>
);

const IconVideo = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  </View>
);

const IconUsers = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  </View>
);

const IconRecycle = () => (
  <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  </View>
);

// 账号管理图标 - 暂时隐藏
// const IconUserCircle = () => (
//   <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <circle cx="12" cy="12" r="10" />
//       <circle cx="12" cy="10" r="3" />
//       <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
//     </svg>
//   </View>
// );

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
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNavigateTo = (url: string, requireLogin: boolean = true) => {
    console.log('跳转到:', url);

    // 热力图和新闻页面不需要登录
    if (url === '/pages/heatmap/index' || url === '/pages/news/index') {
      Taro.navigateTo({ url });
      return;
    }

    // 如果需要登录但未登录，提示登录
    if (requireLogin && !isLoggedIn) {
      Taro.showModal({
        title: '请先登录',
        content: '使用该功能需要登录账号，是否立即登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }

    // 检查用户状态
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

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
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

  const handleLogin = () => {
    Taro.reLaunch({ url: '/pages/login/index' });
  };

  const handleTitleClick = () => {
    const newCount = titleClickCount + 1;
    setTitleClickCount(newCount);

    // 连续点击 3 次后显示开发者工具入口
    if (newCount >= 3) {
      setDevModeEnabled(true);
      setTitleClickCount(0);
      Taro.showToast({
        title: '开发者工具已启用',
        icon: 'none'
      });
    }
  };

  // 加载欢迎数据
  useEffect(() => {
    const loadWelcomeMessages = async () => {
      try {
        const response = await Network.request({
          url: '/api/welcome',
          method: 'GET',
        });

        if (response.statusCode === 200 && response.data) {
          setWelcomeMessages(response.data);
        }
      } catch (error) {
        console.error('加载欢迎数据失败:', error);
      }
    };

    loadWelcomeMessages();
  }, []);

  // 加载待审核用户数量（仅管理员）
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

  // 加载用户信息
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // 先从本地存储读取
        const storedUser = Taro.getStorageSync('user');
        const token = Taro.getStorageSync('token');

        if (storedUser && token) {
          setIsLoggedIn(true);
          setIsAdmin(storedUser?.role === 'admin');
          setUserStatus(storedUser?.status || 'active');

          // 尝试从服务器获取最新的用户信息
          try {
            const response = await Network.request({
              url: '/api/user/profile',
              method: 'GET',
            });

            if (response.statusCode === 200 && response.data?.data) {
              const latestUser = response.data.data;
              Taro.setStorageSync('user', latestUser);
              setIsAdmin(latestUser.role === 'admin');
              setUserStatus(latestUser.status || 'active');
            }
          } catch (error) {
            console.error('获取最新用户信息失败:', error);
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
      } catch (error) {
        console.error('获取未读消息失败:', error);
      }
    };

    fetchUnreadCount();
    
    // 每30秒刷新一次未读数量
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <View className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* 标题区 */}
      <View className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-12 pb-8 flex justify-between items-center">
        <View className="flex flex-col justify-center gap-2">
          <Text
            className="block text-3xl font-bold text-white tracking-tight leading-tight"
            onClick={handleTitleClick}
          >
            星厨房
          </Text>
          <Text className="block text-sm text-blue-400 font-medium tracking-widest uppercase opacity-90">Star Kitchen</Text>
        </View>
        <View className="flex items-center gap-3 flex-shrink-0">
          {/* 已登录状态 */}
          {isLoggedIn ? (
            <>
              {/* 消息中心入口 */}
              <View
                className="relative"
                onClick={() => handleNavigateTo('/pages/notification/index')}
              >
                <View
                  className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-3 transition-all active:scale-95"
                >
                  <IconBell />
                </View>
                {/* 未读消息徽标 */}
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Text className="block text-white text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              {/* 管理员入口 */}
              {isAdmin && (
                <View
                  className="relative"
                  onClick={() => handleNavigateTo('/pages/admin/dashboard/index')}
                >
                  <View
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 transition-all active:scale-95"
                  >
                    <IconShield />
                  </View>
                  {/* 待审核徽标 */}
                  {pendingUsersCount > 0 && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                      <Text className="block text-white text-xs font-bold">
                        {pendingUsersCount > 99 ? '99+' : pendingUsersCount}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {/* 开发者工具入口 */}
              {devModeEnabled && (
                <View
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-3 transition-all active:scale-95"
                  onClick={() => handleNavigateTo('/pages/dev-tools/index')}
                >
                  <IconSettings />
                </View>
              )}
              {/* 退出登录 */}
              <View
                className="bg-slate-700/80 hover:bg-slate-600/80 rounded-2xl p-3 transition-all active:scale-95"
                onClick={handleLogout}
              >
                <IconLogOut />
              </View>
            </>
          ) : (
            /* 未登录状态 */
            <View
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
              onClick={handleLogin}
            >
              <IconUser />
            </View>
          )}
        </View>
      </View>

      {/* 可滚动内容区 */}
      <ScrollView
        className="flex-1"
        scrollY
        style={{ height: 'calc(100vh - 120px)' }}
        scrollWithAnimation
        enableBackToTop
      >
        {/* 欢迎数据轮播 */}
      {welcomeMessages.length > 0 && (
        <View className="px-4 mt-4">
          <Swiper
            className="h-40 rounded-2xl overflow-hidden"
            indicatorDots
            autoplay
            interval={5000}
            circular
            indicatorColor="rgba(148, 163, 184, 0.3)"
            indicatorActiveColor="#60a5fa"
          >
            {welcomeMessages.map((msg) => (
              <SwiperItem key={msg.id}>
                <View className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-5 border border-blue-500/30 flex flex-col justify-center">
                  {msg.image_url && (
                    <Image
                      src={msg.image_url}
                      className="w-16 h-16 rounded-xl mb-3 object-cover"
                      mode="aspectFill"
                    />
                  )}
                  <Text className="block text-lg font-bold text-white mb-2">{msg.title}</Text>
                  <Text className="block text-sm text-slate-300 leading-relaxed">{msg.content}</Text>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      )}

      {/* 灵感速记快捷入口 */}
      <View className="px-4 mt-6 mb-6">
        <View
          className="bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-3xl p-5 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-orange-500/20"
          onClick={() => handleNavigateTo('/pages/quick-note/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconLightbulb />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">灵感速记</Text>
              <Text className="block text-sm text-white/80">快速记录创作灵感</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 功能介绍区 */}
      <View className="px-4 mb-20">
        {/* 选题策划 */}
        <View
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-blue-500/20"
          onClick={() => handleNavigateTo('/pages/systems/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconSparkles />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">选题策划</Text>
              <Text className="block text-sm text-white/80">快速发现优质选题</Text>
            </View>
          </View>
        </View>

        {/* 内容创作 */}
        <View
          className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-purple-500/20"
          onClick={() => handleNavigateTo('/pages/systems/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconPenTool />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">内容创作</Text>
              <Text className="block text-sm text-white/80">高效创作优质内容</Text>
            </View>
          </View>
        </View>

        {/* 语料优化系统 */}
        <View
          className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-emerald-500/20"
          onClick={() => handleNavigateTo('/pages/lexicon-manage/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconTrendingUp />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">语料优化</Text>
              <Text className="block text-sm text-white/80">管理优化语料库</Text>
            </View>
          </View>
        </View>

        {/* 爆款复刻系统 */}
        <View
          className="bg-gradient-to-br from-pink-500 via-rose-600 to-red-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-pink-500/20"
          onClick={() => handleNavigateTo('/pages/viral-system/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconSparkles />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">爆款复刻</Text>
              <Text className="block text-sm text-white/80">解析爆款内容</Text>
            </View>
          </View>
        </View>

        {/* 知识分享 */}
        <View
          className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-purple-500/20"
          onClick={() => handleNavigateTo('/pages/knowledge-share/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconBookOpen />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">知识分享</Text>
              <Text className="block text-sm text-white/80">分享创作经验和技巧</Text>
            </View>
          </View>
        </View>

        {/* 直播数据统计 */}
        <View
          className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-rose-500/20"
          onClick={() => handleNavigateTo('/pages/live-data/dashboard/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconVideo />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">直播数据统计</Text>
              <Text className="block text-sm text-white/80">抖音直播数据分析与复盘</Text>
            </View>
          </View>
        </View>

        {/* 客资管理 */}
        <View
          className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-cyan-500/20"
          onClick={() => handleNavigateTo('/pages/customer/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconUsers />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">客资管理</Text>
              <Text className="block text-sm text-white/80">客户资料管理与跟进</Text>
            </View>
          </View>
        </View>

        {/* 厨具回收 */}
        <View
          className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-green-500/20"
          onClick={() => handleNavigateTo('/pages/recycle/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconRecycle />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">厨具回收</Text>
              <Text className="block text-sm text-white/80">厨具设备回收管理</Text>
            </View>
          </View>
        </View>

        {/* 账号管理入口 - 暂时隐藏 */}
        {/* <View
          className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-slate-500/20 border border-slate-500/30"
          onClick={() => handleNavigateTo('/pages/admin/users/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <IconUserCircle />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">账号管理</Text>
              <Text className="block text-sm text-slate-300">管理用户账号与权限</Text>
            </View>
          </View>
        </View> */}
      </View>
      </ScrollView>
    </View>
  );
};

export default IndexPage;
