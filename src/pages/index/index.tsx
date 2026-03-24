import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';

interface Feature {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  bgColor: string;
}

const FEATURES: Feature[] = [
  { id: 'quick-note', title: '灵感速记', desc: '快速捕捉创作灵感', icon: '💡', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { id: 'customer', title: '客资管理', desc: '客户资料高效管理', icon: '👥', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  { id: 'recycle', title: '厨具回收', desc: '回收业务全流程', icon: '🔄', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { id: 'knowledge', title: '知识分享', desc: '团队经验沉淀', icon: '📚', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' },
  { id: 'topic', title: '选题策划', desc: '发现热门选题', icon: '🎯', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' },
  { id: 'content', title: '内容创作', desc: '高效产出优质内容', icon: '✨', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
  { id: 'lexicon', title: '语料优化', desc: '打造内容武器库', icon: '🛠', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.1)' },
  { id: 'viral', title: '爆款复刻', desc: '拆解爆款逻辑', icon: '🔥', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
  { id: 'live', title: '直播数据', desc: '数据分析洞察', icon: '📊', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
];

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // 检查登录状态
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setIsLoggedIn(true);
        setIsAdmin(user.role === 'admin');
      }
    } catch (e) {
      console.log('storage error');
    }

    // 设置问候语
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('早上好');
    } else if (hour < 18) {
      setGreeting('下午好');
    } else {
      setGreeting('晚上好');
    }
  }, []);

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const handleAdmin = () => {
    Taro.switchTab({ url: '/pages/index/index' });
    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/admin/dashboard/index' });
    }, 100);
  };

  return (
    <View style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0b',
      paddingBottom: '120px'
    }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <View style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '32px'
        }}>
          <View>
            {/* Logo 区域 */}
            <View style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <View style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ⭐
              </View>
              <Text style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                color: '#fafafa',
                letterSpacing: '-0.02em'
              }}>
                星厨房
              </Text>
            </View>
            <Text style={{ 
              fontSize: '24px', 
              color: '#a1a1aa',
              marginTop: '4px'
            }}>
              {greeting}，创作者
            </Text>
          </View>
          
          {/* 右侧操作 */}
          <View style={{ display: 'flex', gap: '12px' }}>
            {isAdmin && (
              <View 
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
                onClick={handleAdmin}
              >
                <Text style={{ 
                  fontSize: '24px', 
                  color: '#f59e0b',
                  fontWeight: '500'
                }}>
                  管理后台
                </Text>
              </View>
            )}
            <View 
              style={{
                padding: '12px 20px',
                backgroundColor: '#141416',
                borderRadius: '12px',
                border: '1px solid #27272a'
              }}
              onClick={handleLogin}
            >
              <Text style={{ 
                fontSize: '24px', 
                color: isLoggedIn ? '#22c55e' : '#fafafa',
                fontWeight: '500'
              }}>
                {isLoggedIn ? '已登录' : '登录'}
              </Text>
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <ScrollView 
          scrollX 
          style={{ width: '100%' }}
          showHorizontalScrollIndicator={false}
        >
          <View style={{ 
            display: 'flex', 
            gap: '16px',
            paddingRight: '32px'
          }}>
            {[
              { label: '灵感速记', icon: '💡', color: '#f59e0b' },
              { label: '选题策划', icon: '🎯', color: '#06b6d4' },
              { label: '内容创作', icon: '✨', color: '#8b5cf6' },
              { label: '直播数据', icon: '📊', color: '#ec4899' },
            ].map((item, index) => (
              <View
                key={index}
                style={{
                  flexShrink: 0,
                  padding: '16px 24px',
                  backgroundColor: '#141416',
                  borderRadius: '16px',
                  border: '1px solid #27272a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onClick={() => handleNav(`/pages/${item.label === '灵感速记' ? 'quick-note' : item.label === '选题策划' ? 'topic-planning' : item.label === '内容创作' ? 'content-system' : 'live-data/dashboard'}/index`)}
              >
                <Text style={{ fontSize: '28px' }}>{item.icon}</Text>
                <Text style={{ 
                  fontSize: '24px', 
                  color: '#fafafa',
                  fontWeight: '500'
                }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 功能列表 */}
      <View style={{ padding: '32px' }}>
        <View className="section-title" style={{ marginBottom: '24px' }}>
          <Text style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: '#fafafa'
          }}>
            全部功能
          </Text>
        </View>

        {FEATURES.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: '#141416',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #27272a',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleNav(`/pages/${item.id}/index`)}
          >
            <View style={{
              width: '96px',
              height: '96px',
              borderRadius: '20px',
              backgroundColor: item.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
              fontSize: '48px'
            }}>
              {item.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: '32px', 
                fontWeight: '600', 
                color: '#fafafa',
                marginBottom: '8px'
              }}>
                {item.title}
              </Text>
              <Text style={{ 
                fontSize: '24px', 
                color: '#71717a'
              }}>
                {item.desc}
              </Text>
            </View>
            <Text style={{ 
              fontSize: '28px', 
              color: '#3f3f46',
              fontWeight: '300'
            }}>
              →
            </Text>
          </View>
        ))}
      </View>

      {/* 底部提示 */}
      <View style={{ 
        padding: '32px',
        textAlign: 'center'
      }}>
        <Text style={{ 
          fontSize: '20px', 
          color: '#52525b'
        }}>
          星厨房 · 让创作更高效
        </Text>
      </View>
    </View>
  );
};

export default Index;
