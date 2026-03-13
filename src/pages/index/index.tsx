import { View, Text, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Lightbulb, PenTool, Sparkles, TrendingUp, LogOut, Settings, Shield, User, BookOpen, Users, ShieldAlert, UsersRound, Bell, Video } from 'lucide-react-taro';
import { Network } from '@/network';

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
  const [churnWarningCount, setChurnWarningCount] = useState(0);
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

      // 加载客户流失预警数量
      const loadChurnWarningCount = async () => {
        try {
          const response = await Network.request({
            url: '/api/customers/churn-warning/statistics',
            method: 'GET',
          });
          if (response.statusCode === 200 && response.data?.data) {
            const stats = response.data.data;
            setChurnWarningCount((stats.red || 0) + (stats.orange || 0));
          }
        } catch (error) {
          console.error('加载客户流失预警数量失败:', error);
        }
      };

      loadPendingUsersCount();
      loadChurnWarningCount();
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
                  <Bell size={22} color="white" strokeWidth={2} />
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
                    <Shield size={22} color="white" strokeWidth={2} />
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
                  <Settings size={22} color="white" strokeWidth={2} />
                </View>
              )}
              {/* 退出登录 */}
              <View
                className="bg-slate-700/80 hover:bg-slate-600/80 rounded-2xl p-3 transition-all active:scale-95"
                onClick={handleLogout}
              >
                <LogOut size={22} color="#94a3b8" strokeWidth={2} />
              </View>
            </>
          ) : (
            /* 未登录状态 */
            <View
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
              onClick={handleLogin}
            >
              <User size={22} color="white" strokeWidth={2} />
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
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Lightbulb size={32} color="white" strokeWidth={2.5} />
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
        {/* 选题生成系统 */}
        <View
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-blue-500/20"
          onClick={() => handleNavigateTo('/pages/systems/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles size={32} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">选题生成</Text>
              <Text className="block text-sm text-white/80">快速发现优质选题</Text>
            </View>
          </View>
        </View>

        {/* 内容生成系统 */}
        <View
          className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-purple-500/20"
          onClick={() => handleNavigateTo('/pages/systems/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <PenTool size={32} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">内容生成</Text>
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
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp size={32} color="white" strokeWidth={2.5} />
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
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles size={32} color="white" strokeWidth={2.5} />
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
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen size={32} color="white" strokeWidth={2.5} />
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
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Video size={32} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">直播数据统计</Text>
              <Text className="block text-sm text-white/80">抖音直播数据分析与复盘</Text>
            </View>
          </View>
        </View>

        {/* 客资管理 */}
        <View
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-indigo-500/20"
          onClick={() => handleNavigateTo('/pages/customer/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <Users size={32} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">客资管理</Text>
              <Text className="block text-sm text-white/80">跟进客户进度，统计销售数据</Text>
            </View>
          </View>
        </View>

        {/* 回收管理 */}
        <View
          className="bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-cyan-500/20"
          onClick={() => handleNavigateTo('/pages/recycle/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen size={32} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">回收管理</Text>
              <Text className="block text-sm text-white/80">管理回收门店，追踪设备回收进度</Text>
            </View>
          </View>
        </View>

        {/* 我的团队 */}
        <View
          className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-emerald-500/20"
          onClick={() => handleNavigateTo('/pages/team/index', true)}
        >
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <UsersRound size={32} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-bold text-white mb-1">我的团队</Text>
              <Text className="block text-sm text-white/80">查看团队业绩和成员信息</Text>
            </View>
          </View>
        </View>

        {/* 客户流失预警 */}
        {isLoggedIn && churnWarningCount > 0 && (
          <View
            className="bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 rounded-3xl p-5 mb-4 active:scale-[0.98] transition-transform cursor-pointer shadow-xl shadow-red-500/20 relative overflow-hidden"
            onClick={() => handleNavigateTo('/pages/customer/churn-warning', true)}
          >
            {/* 红点徽标 */}
            <View className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Text className="block text-red-500 text-sm font-bold">{churnWarningCount > 99 ? '99+' : churnWarningCount}</Text>
            </View>
            <View className="flex items-center gap-4">
              <View className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldAlert size={32} color="white" strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="block text-xl font-bold text-white mb-1">客户流失预警</Text>
                <Text className="block text-sm text-white/80">
                  {churnWarningCount}个客户需立即跟进，避免流失
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 更多功能提示 */}
        {!isLoggedIn && (
          <View className="mt-6 text-center pb-4">
            <Text className="block text-sm text-slate-500">
              登录后解锁更多功能
            </Text>
          </View>
        )}
      </View>
      </ScrollView>
    </View>
  );
};

export default IndexPage;
