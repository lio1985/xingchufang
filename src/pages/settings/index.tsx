import { useState } from 'react';
import { View, Text, Switch, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface SettingItem {
  icon: string;
  label: string;
  value?: string;
  type: 'navigate' | 'switch' | 'input';
  onClick?: () => void;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: true,
    soundEffect: false
  });

  const [userInfo, setUserInfo] = useState({
    name: '星厨房主理人',
    phone: '138****8888',
    avatar: ''
  });

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorageSync();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      }
    });
  };

  const handleClearCache = () => {
    Taro.showModal({
      title: '确认清理',
      content: '确定要清理本地缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '清理中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '清理完成', icon: 'success' });
          }, 1000);
        }
      }
    });
  };

  const menuItems = [
    {
      title: '账号设置',
      items: [
        { icon: '👤', label: '个人信息', value: userInfo.name, type: 'navigate' as const },
        { icon: '🔐', label: '修改密码', type: 'navigate' as const },
        { icon: '📱', label: '绑定手机', value: userInfo.phone, type: 'navigate' as const },
      ]
    },
    {
      title: '偏好设置',
      items: [
        { icon: '🔔', label: '消息通知', type: 'switch' as const, key: 'notifications' },
        { icon: '💾', label: '自动保存', type: 'switch' as const, key: 'autoSave' },
        { icon: '🌙', label: '深色模式', type: 'switch' as const, key: 'darkMode' },
        { icon: '🔊', label: '音效反馈', type: 'switch' as const, key: 'soundEffect' },
      ]
    },
    {
      title: '数据管理',
      items: [
        { icon: '📤', label: '导出数据', type: 'navigate' as const },
        { icon: '📥', label: '导入数据', type: 'navigate' as const },
        { icon: '🗑️', label: '清理缓存', type: 'navigate' as const, onClick: handleClearCache },
      ]
    },
    {
      title: '其他',
      items: [
        { icon: '⭐', label: '给我们评分', type: 'navigate' as const },
        { icon: '💬', label: '意见反馈', type: 'navigate' as const },
        { icon: '📖', label: '使用帮助', type: 'navigate' as const },
        { icon: '📋', label: '用户协议', type: 'navigate' as const },
        { icon: '🔒', label: '隐私政策', type: 'navigate' as const },
      ]
    }
  ];

  const renderSettingItem = (item: any, index: number) => {
    if (item.type === 'switch') {
      return (
        <View 
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 0',
            borderBottom: '1px solid #27272a'
          }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text style={{ fontSize: '32px' }}>{item.icon}</Text>
            <Text style={{ fontSize: '28px', color: '#fafafa' }}>{item.label}</Text>
          </View>
          <Switch
            checked={settings[item.key as keyof typeof settings]}
            onChange={(e) => setSettings({
              ...settings,
              [item.key]: e.detail.value
            })}
            color="#f59e0b"
            style={{ transform: 'scale(0.8)' }}
          />
        </View>
      );
    }

    return (
      <View 
        key={index}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0',
          borderBottom: '1px solid #27272a'
        }}
        onClick={item.onClick || (() => Taro.showToast({ title: `${item.label}功能开发中`, icon: 'none' }))}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Text style={{ fontSize: '32px' }}>{item.icon}</Text>
          <Text style={{ fontSize: '28px', color: '#fafafa' }}>{item.label}</Text>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {item.value && (
            <Text style={{ fontSize: '24px', color: '#71717a' }}>{item.value}</Text>
          )}
          <Text style={{ fontSize: '24px', color: '#52525b' }}>›</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '120px' }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <Text style={{ fontSize: '36px', fontWeight: '700', color: '#fafafa' }}>
          设置
        </Text>
      </View>

      {/* 用户信息卡片 */}
      <View style={{ padding: '32px' }}>
        <View style={{ 
          backgroundColor: '#141416',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <View style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px'
          }}>
            👩‍🍳
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '32px', fontWeight: '600', color: '#fafafa', display: 'block', marginBottom: '8px' }}>
              {userInfo.name}
            </Text>
            <Text style={{ fontSize: '24px', color: '#71717a' }}>
              {userInfo.phone}
            </Text>
            <View style={{ 
              display: 'inline-flex',
              padding: '6px 12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '8px',
              marginTop: '12px'
            }}>
              <Text style={{ fontSize: '20px', color: '#f59e0b' }}>⭐ 高级会员</Text>
            </View>
          </View>
          <Text style={{ fontSize: '28px', color: '#71717a' }}>›</Text>
        </View>
      </View>

      {/* 设置菜单 */}
      {menuItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={{ padding: '0 32px', marginBottom: '32px' }}>
          <View style={{ 
            backgroundColor: '#141416',
            borderRadius: '24px',
            padding: '8px 28px',
            border: '1px solid #27272a'
          }}>
            <Text style={{ 
              fontSize: '22px', 
              color: '#71717a',
              paddingTop: '20px',
              paddingBottom: '12px',
              display: 'block'
            }}>
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
          </View>
        </View>
      ))}

      {/* 版本信息 */}
      <View style={{ padding: '0 32px', marginBottom: '32px', textAlign: 'center' }}>
        <Text style={{ fontSize: '22px', color: '#52525b' }}>
          星厨房 v1.0.0
        </Text>
      </View>

      {/* 退出登录 */}
      <View style={{ padding: '0 32px' }}>
        <View 
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
          onClick={handleLogout}
        >
          <Text style={{ fontSize: '28px', color: '#ef4444' }}>退出登录</Text>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
