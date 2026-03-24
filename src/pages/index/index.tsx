import { View, Text, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';
import {
  Bell,
  Shield,
  Settings,
  LogOut,
  User,
  Lightbulb,
  Sparkles,
  PenTool,
  TrendingUp,
  BookOpen,
  Video,
  Users,
  Recycle
} from 'lucide-react-taro';

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

  const handleNavigateTo = (url: string, requireLogin: boolean = false) => {
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

    if (requireLogin && !isLoggedIn) {
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

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const handleTitleClick = () => {
    const newCount = titleClickCount + 1;
    setTitleClickCount(newCount);

    if (newCount >= 3) {
      setDevModeEnabled(true);
      setTitleClickCount(0);
      Taro.showToast({
        title: '开发者工具已启用',
        icon: 'none'
      });
    }
  };

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
      } catch (error: any) {
        if (error.statusCode === 404) {
          console.log('欢迎接口暂不可用');
        } else {
          console.error('加载欢迎数据失败:', error);
        }
      }
    };

    loadWelcomeMessages();
  }, []);

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

  return (
    <View className="min-h-screen bg-slate-50 flex flex-col">
      {/* 标题区 */}
      <View className="bg-white px-4 pt-12 pb-6 flex justify-between items-center border-b border-slate-200">
        <View className="flex flex-col justify-center gap-1">
          <View onClick={handleTitleClick}>
            <Text className="block text-3xl font-bold text-slate-800 tracking-tight">星厨房</Text>
          </View>
          <Text className="block text-sm text-blue-600 font-medium tracking-widest">STAR KITCHEN</Text>
        </View>
        <View className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <View
                className="relative"
                onClick={() => handleNavigateTo('/pages/notification/index')}
              >
                <View className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
                  <Bell size={22} color="#F97316" />
                </View>
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <Text className="block text-white text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              {isAdmin && (
                <View
                  className="relative"
                  onClick={() => handleNavigateTo('/pages/admin/dashboard/index')}
                >
                  <View className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
                    <Shield size={22} color="#10B981" />
                  </View>
                  {pendingUsersCount > 0 && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <Text className="block text-white text-xs font-bold">
                        {pendingUsersCount > 99 ? '99+' : pendingUsersCount}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {devModeEnabled && (
                <View
                  className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  onClick={() => handleNavigateTo('/pages/dev-tools/index')}
                >
                  <Settings size={22} color="#9333EA" />
                </View>
              )}
              <View
                className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                onClick={handleLogout}
              >
                <LogOut size={22} color="#64748B" />
              </View>
            </>
          ) : (
            <View
              className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
              onClick={handleLogin}
            >
              <User size={22} color="#FFFFFF" />
            </View>
          )}
        </View>
      </View>

      {/* 可滚动内容区 */}
      <ScrollView
        className="flex-1"
        scrollY
        style={{ height: 'calc(100vh - 100px)' }}
        scrollWithAnimation
        enableBackToTop
      >
        {/* 欢迎数据轮播 */}
        {welcomeMessages.length > 0 && (
          <View className="px-4 mt-4">
            <Swiper
              className="h-36 rounded-2xl overflow-hidden"
              indicatorDots
              autoplay
              interval={5000}
              circular
              indicatorColor="rgba(148, 163, 184, 0.3)"
              indicatorActiveColor="#2563EB"
            >
              {welcomeMessages.map((msg) => (
                <SwiperItem key={msg.id}>
                  <View className="w-full h-full bg-blue-50 rounded-2xl p-5 border border-blue-200 flex flex-col justify-center">
                    {msg.image_url && (
                      <Image
                        src={msg.image_url}
                        className="w-14 h-14 rounded-xl mb-3 object-cover"
                        mode="aspectFill"
                      />
                    )}
                    <Text className="block text-lg font-bold text-slate-800 mb-2">{msg.title}</Text>
                    <Text className="block text-sm text-slate-600 leading-relaxed">{msg.content}</Text>
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
          </View>
        )}

        {/* 灵感速记快捷入口 */}
        <View className="px-4 mt-6 mb-4">
          <View
            className="bg-orange-500 rounded-2xl p-5 active:scale-[0.98] transition-transform"
            onClick={() => handleNavigateTo('/pages/quick-note/index', false)}
          >
            <View className="flex items-center gap-4">
              <View className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Lightbulb size={28} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="block text-xl font-bold text-white mb-1">灵感速记</Text>
                <Text className="block text-sm text-white/90">快速记录创作灵感</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 功能网格 */}
        <View className="px-4 pb-8">
          <Text className="block text-lg font-semibold text-slate-800 mb-4">功能中心</Text>
          
          <View className="grid grid-cols-2 gap-3">
            {/* 客资管理 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/customer/index', false)}
            >
              <View className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <Users size={24} color="#2563EB" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">客资管理</Text>
              <Text className="block text-xs text-slate-500">客户资料管理</Text>
            </View>

            {/* 厨具回收 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/recycle/index', false)}
            >
              <View className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                <Recycle size={24} color="#10B981" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">厨具回收</Text>
              <Text className="block text-xs text-slate-500">设备回收管理</Text>
            </View>

            {/* 知识分享 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/knowledge-share/index', false)}
            >
              <View className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                <BookOpen size={24} color="#9333EA" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">知识分享</Text>
              <Text className="block text-xs text-slate-500">经验技巧分享</Text>
            </View>

            {/* 选题策划 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/topic-planning/index', false)}
            >
              <View className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <Sparkles size={24} color="#3B82F6" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">选题策划</Text>
              <Text className="block text-xs text-slate-500">发现优质选题</Text>
            </View>

            {/* 内容创作 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/content-system/index', false)}
            >
              <View className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                <PenTool size={24} color="#6366F1" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">内容创作</Text>
              <Text className="block text-xs text-slate-500">高效内容生成</Text>
            </View>

            {/* 语料优化 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/lexicon-manage/index', false)}
            >
              <View className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp size={24} color="#14B8A6" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">语料优化</Text>
              <Text className="block text-xs text-slate-500">语料库管理</Text>
            </View>

            {/* 爆款复刻 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/viral-system/index', false)}
            >
              <View className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-3">
                <Sparkles size={24} color="#F43F5E" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">爆款复刻</Text>
              <Text className="block text-xs text-slate-500">爆款内容解析</Text>
            </View>

            {/* 直播数据 */}
            <View
              className="bg-white rounded-2xl border border-slate-200 p-4 active:scale-[0.98] transition-transform"
              onClick={() => handleNavigateTo('/pages/live-data/dashboard/index', false)}
            >
              <View className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-3">
                <Video size={24} color="#EC4899" />
              </View>
              <Text className="block text-base font-semibold text-slate-800 mb-1">直播数据</Text>
              <Text className="block text-xs text-slate-500">数据分析复盘</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default IndexPage;
