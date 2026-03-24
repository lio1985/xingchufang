import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';
import './index.css';

// 图标路径配置
const iconPath = '/static/icons';

// 图标组件封装 - 使用本地 PNG
const IconLightbulb = () => (
  <Image src={`${iconPath}/lightbulb.png`} className="icon" mode="aspectFit" />
);
const IconUsers = () => (
  <Image src={`${iconPath}/users.png`} className="icon" mode="aspectFit" />
);
const IconRecycle = () => (
  <Image src={`${iconPath}/recycle.png`} className="icon" mode="aspectFit" />
);
const IconBookOpen = () => (
  <Image src={`${iconPath}/book.png`} className="icon" mode="aspectFit" />
);
const IconSparkles = () => (
  <Image src={`${iconPath}/sparkles.png`} className="icon" mode="aspectFit" />
);
const IconPenTool = () => (
  <Image src={`${iconPath}/pentool.png`} className="icon" mode="aspectFit" />
);
const IconTrendingUp = () => (
  <Image src={`${iconPath}/trending.png`} className="icon" mode="aspectFit" />
);
const IconVideo = () => (
  <Image src={`${iconPath}/video.png`} className="icon" mode="aspectFit" />
);
const IconBell = () => (
  <Image src={`${iconPath}/bell.png`} className="icon-sm" mode="aspectFit" />
);
const IconUser = () => (
  <Image src={`${iconPath}/user.png`} className="icon-sm" mode="aspectFit" />
);


const IndexPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStatus, setUserStatus] = useState<'active' | 'pending' | 'disabled' | 'deleted'>('active');
  const [unreadCount, setUnreadCount] = useState(0);

  // 处理导航
  const handleNavigateTo = (url: string, requireLogin: boolean = false) => {
    console.log('跳转到:', url);

    // 公开页面（游客可访问）
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
        console.log('通知接口暂未部署');
      }
    };

    fetchUnreadCount();
  }, [isLoggedIn]);

  return (
    <View className="page-container">
      {/* 顶部区域 */}
      <View className="header">
        <View className="header-left">
          <Text className="header-title">星厨房</Text>
          <Text className="header-subtitle">内容创作助手</Text>
        </View>
        <View className="header-right">
          {isLoggedIn ? (
            <>
              <View className="header-btn" onClick={() => handleNavigateTo('/pages/notification/index')}>
                <IconBell />
                {unreadCount > 0 && (
                  <View className="badge">
                    <Text className="badge-text">{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
              </View>
              {isAdmin && (
                <View className="header-btn admin" onClick={() => handleNavigateTo('/pages/admin/dashboard/index')}>
                  <Text className="btn-text">管理</Text>
                </View>
              )}
            </>
          ) : (
            <View className="header-btn login" onClick={() => handleNavigateTo('/pages/login/index')}>
              <IconUser />
              <Text className="btn-text">登录</Text>
            </View>
          )}
        </View>
      </View>

      {/* 可滚动内容区 */}
      <ScrollView
        className="content"
        scrollY
        scrollWithAnimation
        enableBackToTop
      >
        {/* 快捷入口区域 */}
        <View className="section">
          <Text className="section-title">快捷入口</Text>
          <View className="quick-entry" onClick={() => handleNavigateTo('/pages/quick-note/index', false)}>
            <View className="quick-icon">
              <IconLightbulb />
            </View>
            <View className="quick-content">
              <Text className="quick-title">灵感速记</Text>
              <Text className="quick-desc">快速记录创作灵感</Text>
            </View>
            <Text className="arrow-text">›</Text>
          </View>
        </View>

        {/* 核心功能区域 */}
        <View className="section">
          <Text className="section-title">核心功能</Text>
          
          <View className="feature-list">
            {/* 客资管理 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/customer/index', false)}>
              <View className="feature-icon blue">
                <IconUsers />
              </View>
              <View className="feature-content">
                <Text className="feature-title">客资管理</Text>
                <Text className="feature-desc">客户资料管理与跟进</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>

            {/* 厨具回收 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/recycle/index', false)}>
              <View className="feature-icon green">
                <IconRecycle />
              </View>
              <View className="feature-content">
                <Text className="feature-title">厨具回收</Text>
                <Text className="feature-desc">厨具设备回收管理</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>

            {/* 知识分享 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/knowledge-share/index', false)}>
              <View className="feature-icon purple">
                <IconBookOpen />
              </View>
              <View className="feature-content">
                <Text className="feature-title">知识分享</Text>
                <Text className="feature-desc">分享创作经验和技巧</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>

            {/* 选题策划 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/topic-planning/index', false)}>
              <View className="feature-icon cyan">
                <IconSparkles />
              </View>
              <View className="feature-content">
                <Text className="feature-title">选题策划</Text>
                <Text className="feature-desc">快速发现优质选题</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>

            {/* 内容创作 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/content-system/index', false)}>
              <View className="feature-icon indigo">
                <IconPenTool />
              </View>
              <View className="feature-content">
                <Text className="feature-title">内容创作</Text>
                <Text className="feature-desc">高效创作优质内容</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>

            {/* 语料优化 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/lexicon-manage/index', false)}>
              <View className="feature-icon teal">
                <IconTrendingUp />
              </View>
              <View className="feature-content">
                <Text className="feature-title">语料优化</Text>
                <Text className="feature-desc">管理优化语料库</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>

            {/* 爆款复刻 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/viral-system/index', false)}>
              <View className="feature-icon pink">
                <IconSparkles />
              </View>
              <View className="feature-content">
                <Text className="feature-title">爆款复刻</Text>
                <Text className="feature-desc">解析爆款内容</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>

            {/* 直播数据 */}
            <View className="feature-item" onClick={() => handleNavigateTo('/pages/live-data/dashboard/index', false)}>
              <View className="feature-icon rose">
                <IconVideo />
              </View>
              <View className="feature-content">
                <Text className="feature-title">直播数据统计</Text>
                <Text className="feature-desc">抖音直播数据分析</Text>
              </View>
              <Text className="arrow-text">›</Text>
            </View>
          </View>
        </View>

        {/* 底部安全区 */}
        <View className="safe-bottom" />
      </ScrollView>
    </View>
  );
};

export default IndexPage;
