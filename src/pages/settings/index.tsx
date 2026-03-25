import { useState, useEffect } from 'react';
import { View, Text, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  User,
  Lock,
  Smartphone,
  Bell,
  Save,
  Moon,
  Volume2,
  Download,
  Upload,
  Trash2,
  Star,
  MessageCircle,
  CircleQuestionMark,
  FileText,
  Shield,
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
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorageSync();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
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
      },
    });
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleToast = (title: string) => {
    Taro.showToast({ title: `${title}功能开发中`, icon: 'none' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '100px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#141416', borderBottom: '1px solid #27272a', position: 'relative' }}>
        <View style={{ position: 'absolute', left: '16px', top: '48px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <ChevronLeft size={24} color="#f59e0b" />
            <Text style={{ fontSize: '14px', color: '#f59e0b' }}>返回</Text>
          </View>
        </View>
        <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', textAlign: 'center' }}>设置</Text>
        <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px', textAlign: 'center' }}>账号与系统设置</Text>
      </View>

      {/* 用户信息卡片 */}
      <View style={{ padding: '16px 20px' }}>
        <View
          style={{
            backgroundColor: '#18181b',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          onClick={() => handleToast('个人信息')}
        >
          <View
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={24} color="#0a0a0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '2px' }}>
              {userInfo?.nickname || userInfo?.username || '星厨房主理人'}
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>
              {userInfo?.phone ? `${userInfo.phone.slice(0, 3)}****${userInfo.phone.slice(-4)}` : '未绑定手机'}
            </Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {userInfo?.role === 'admin' && (
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                <Crown size={12} color="#f59e0b" />
                <Text style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '500' }}>管理员</Text>
              </View>
            )}
            <ChevronRight size={16} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 账号设置 */}
      <View style={{ padding: '12px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '8px', fontWeight: '500' }}>账号设置</Text>
        <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleNav('/pages/change-password/index')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} color="#ef4444" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>修改密码</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}
            onClick={() => handleToast('绑定手机')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={18} color="#22c55e" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>绑定手机</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', marginRight: '4px' }}>
              {userInfo?.phone ? `${userInfo.phone.slice(0, 3)}****${userInfo.phone.slice(-4)}` : '未绑定'}
            </Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 偏好设置 */}
      <View style={{ padding: '16px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '8px', fontWeight: '500' }}>偏好设置</Text>
        <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
          <View style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}>
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="#3b82f6" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>消息通知</Text>
            <Switch
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.detail.value })}
              color="#f59e0b"
            />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}>
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Save size={18} color="#f59e0b" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>自动保存</Text>
            <Switch
              checked={settings.autoSave}
              onChange={(e) => setSettings({ ...settings, autoSave: e.detail.value })}
              color="#f59e0b"
            />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}>
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={18} color="#a855f7" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>深色模式</Text>
            <Switch
              checked={settings.darkMode}
              onChange={(e) => setSettings({ ...settings, darkMode: e.detail.value })}
              color="#f59e0b"
            />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Volume2 size={18} color="#06b6d4" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>音效反馈</Text>
            <Switch
              checked={settings.soundEffect}
              onChange={(e) => setSettings({ ...settings, soundEffect: e.detail.value })}
              color="#f59e0b"
            />
          </View>
        </View>
      </View>

      {/* 数据管理 */}
      <View style={{ padding: '16px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '8px', fontWeight: '500' }}>数据管理</Text>
        <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleToast('导出数据')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={18} color="#22c55e" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>导出数据</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleToast('导入数据')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={18} color="#3b82f6" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>导入数据</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}
            onClick={handleClearCache}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="#ef4444" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>清理缓存</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 其他 */}
      <View style={{ padding: '16px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '8px', fontWeight: '500' }}>其他</Text>
        <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleToast('给我们评分')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={18} color="#f59e0b" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>给我们评分</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleToast('意见反馈')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={18} color="#06b6d4" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>意见反馈</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleToast('使用帮助')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircleQuestionMark size={18} color="#22c55e" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>使用帮助</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #27272a' }}
            onClick={() => handleToast('用户协议')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#3b82f6" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>用户协议</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}
            onClick={() => handleToast('隐私政策')}
          >
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#a855f7" />
            </View>
            <Text style={{ flex: 1, marginLeft: '12px', fontSize: '14px', color: '#ffffff' }}>隐私政策</Text>
            <ChevronRight size={16} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 版本信息 */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0 16px' }}>
        <Text style={{ fontSize: '12px', color: '#3f3f46' }}>星厨房内容创作助手 v1.0.0</Text>
      </View>

      {/* 退出登录 */}
      <View style={{ padding: '0 20px' }}>
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
          <LogOut size={16} color="#ef4444" />
          <Text style={{ fontSize: '14px', color: '#ef4444', marginLeft: '8px', fontWeight: '500' }}>退出登录</Text>
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
