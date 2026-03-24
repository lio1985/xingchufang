import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';
import './index.css';

// 功能列表数据
const FEATURES = [
  { id: 'quick-note', title: '灵感速记', desc: '快速记录创作灵感', icon: '💡', color: 'blue', path: '/pages/quick-note/index' },
  { id: 'customer', title: '客资管理', desc: '客户资料管理与跟进', icon: '👥', color: 'green', path: '/pages/customer/index' },
  { id: 'recycle', title: '厨具回收', desc: '厨具设备回收管理', icon: '♻️', color: 'green', path: '/pages/recycle/index' },
  { id: 'knowledge', title: '知识分享', desc: '分享创作经验和技巧', icon: '📚', color: 'purple', path: '/pages/knowledge-share/index' },
  { id: 'topic', title: '选题策划', desc: '快速发现优质选题', icon: '✨', color: 'cyan', path: '/pages/topic-planning/index' },
  { id: 'content', title: '内容创作', desc: '高效创作优质内容', icon: '✏️', color: 'indigo', path: '/pages/content-system/index' },
  { id: 'lexicon', title: '语料优化', desc: '管理优化语料库', icon: '📈', color: 'teal', path: '/pages/lexicon-manage/index' },
  { id: 'viral', title: '爆款复刻', desc: '解析爆款内容', icon: '🔥', color: 'pink', path: '/pages/viral-system/index' },
  { id: 'live', title: '直播数据统计', desc: '抖音直播数据分析', icon: '📊', color: 'rose', path: '/pages/live-data/dashboard/index' },
];

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
                <Text className="icon-emoji">🔔</Text>
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
              <Text className="icon-emoji">👤</Text>
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
        {/* 功能列表 */}
        <View className="section">
          <Text className="section-title">功能列表</Text>
          
          <View className="feature-list">
            {FEATURES.map((item) => (
              <View 
                key={item.id} 
                className="feature-item" 
                onClick={() => handleNavigateTo(item.path, false)}
              >
                <View className={`feature-icon ${item.color}`}>
                  <Text className="feature-emoji">{item.icon}</Text>
                </View>
                <View className="feature-content">
                  <Text className="feature-title">{item.title}</Text>
                  <Text className="feature-desc">{item.desc}</Text>
                </View>
                <Text className="arrow-text">›</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 底部安全区 */}
        <View className="safe-bottom" />
      </ScrollView>
    </View>
  );
};

export default IndexPage;
