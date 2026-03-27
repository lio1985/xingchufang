import { useState, useEffect } from 'react';
import { View, Text, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  User,
  Lock,
  Bell,
  Save,
  Moon,
  Volume2,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Crown,
} from 'lucide-react-taro';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: true,
    soundEffect: false,
  });

  const [userInfo, setUserInfo] = useState<{
    nickname?: string;
    username?: string;
    phone?: string;
    avatar?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const user = Taro.getStorageSync('user');
      if (user) {
        setUserInfo(user);
      }
    } catch (e) {
      console.log('获取用户信息失败');
    }
  }, []);

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          Taro.clearStorageSync();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* 页面头部 */}
      <View
        style={{
          padding: '48px 20px 20px',
          backgroundColor: '#111827',
          borderBottom: '1px solid #1e3a5f',
          position: 'relative',
        }}
      >
        <View style={{ position: 'absolute', left: '16px', top: '48px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.switchTab({ url: '/pages/tab-profile/index' })}
          >
            <ChevronLeft size={24} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#38bdf8' }}>返回</Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
            display: 'block',
            textAlign: 'center',
          }}
        >
          设置
        </Text>
        <Text
          style={{
            fontSize: '13px',
            color: '#71717a',
            display: 'block',
            marginTop: '4px',
            textAlign: 'center',
          }}
        >
          账号与系统设置
        </Text>
      </View>

      {/* 用户信息卡片 */}
      <View style={{ padding: '16px 20px' }}>
        <View
          style={{
            backgroundColor: '#111827',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #1e3a5f',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <View
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #fb923c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={24} color="#0a0f1a" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                display: 'block',
                marginBottom: '2px',
              }}
            >
              {userInfo?.nickname || userInfo?.username || '星厨房主理人'}
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>
              {userInfo?.phone ? `${userInfo.phone.slice(0, 3)}****${userInfo.phone.slice(-4)}` : '未绑定手机'}
            </Text>
          </View>
          {userInfo?.role === 'admin' && (
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderRadius: '8px',
              }}
            >
              <Crown size={12} color="#f59e0b" />
              <Text style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '500' }}>管理员</Text>
            </View>
          )}
        </View>
      </View>

      {/* 账号设置 */}
      <View style={{ padding: '12px 20px 0' }}>
        <Text
          style={{
            fontSize: '12px',
            color: '#64748b',
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
          }}
        >
          账号设置
        </Text>
        <View
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}
            onClick={() => handleNav('/pages/change-password/index')}
          >
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={18} color="#f87171" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>修改密码</Text>
            <ChevronRight size={16} color="#64748b" />
          </View>
        </View>
      </View>

      {/* 偏好设置 */}
      <View style={{ padding: '16px 20px 0' }}>
        <Text
          style={{
            fontSize: '12px',
            color: '#64748b',
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
          }}
        >
          偏好设置
        </Text>
        <View
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid #1e3a5f',
            }}
          >
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} color="#60a5fa" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>消息通知</Text>
            <Switch
              checked={settings.notifications}
              onChange={e => setSettings({ ...settings, notifications: e.detail.value })}
              color="#38bdf8"
            />
          </View>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid #1e3a5f',
            }}
          >
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Save size={18} color="#f59e0b" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>自动保存</Text>
            <Switch
              checked={settings.autoSave}
              onChange={e => setSettings({ ...settings, autoSave: e.detail.value })}
              color="#38bdf8"
            />
          </View>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid #1e3a5f',
            }}
          >
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Moon size={18} color="#a855f7" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>深色模式</Text>
            <Switch
              checked={settings.darkMode}
              onChange={e => setSettings({ ...settings, darkMode: e.detail.value })}
              color="#38bdf8"
            />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Volume2 size={18} color="#06b6d4" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>音效反馈</Text>
            <Switch
              checked={settings.soundEffect}
              onChange={e => setSettings({ ...settings, soundEffect: e.detail.value })}
              color="#38bdf8"
            />
          </View>
        </View>
      </View>

      {/* 退出登录 */}
      <View style={{ padding: '32px 20px 0' }}>
        <View
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
          onClick={handleLogout}
        >
          <LogOut size={16} color="#f87171" />
          <Text style={{ fontSize: '14px', color: '#f87171', marginLeft: '8px', fontWeight: '500' }}>
            退出登录
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
