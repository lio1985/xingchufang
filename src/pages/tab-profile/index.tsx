import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  User,
  Settings,
  ChartBarBig,
  ChevronRight,
  LogOut,
  Download,
  UserPlus,
  Crown,
  Bell,
} from 'lucide-react-taro';
import { useOnlineStatus, getUserOnlineStatus } from '@/hooks/useOnlineStatus';

const TabProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    id?: string;
    username?: string;
    nickname?: string;
    avatar?: string;
    role?: string;
  } | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<{ isOnline: boolean; lastSeenAt: string | null }>({
    isOnline: false,
    lastSeenAt: null,
  });

  // 使用在线状态 Hook
  useOnlineStatus();

  useEffect(() => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setIsLoggedIn(true);
        setUserInfo(user);
        setIsAdmin(user.role === 'admin');
        // 获取在线状态
        if (user.id) {
          getUserOnlineStatus(user.id).then(status => {
            setOnlineStatus(status);
          });
        }
      }
    } catch (e) {
      console.log('获取用户信息失败');
    }
  }, []);

  // 监听页面显示，刷新用户信息
  Taro.useDidShow(() => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      console.log('useDidShow - user:', user, 'token:', token);
      if (user && token) {
        setIsLoggedIn(true);
        setUserInfo(user);
        setIsAdmin(user.role === 'admin');
        // 刷新在线状态
        if (user.id) {
          getUserOnlineStatus(user.id).then(status => {
            setOnlineStatus(status);
          });
        }
      } else {
        // 如果没有用户信息或 token，重置状态
        setIsLoggedIn(false);
        setUserInfo(null);
        setIsAdmin(false);
      }
    } catch (e) {
      console.log('刷新用户信息失败');
    }
  });

  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const handleRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('user');
          Taro.removeStorageSync('token');
          setIsLoggedIn(false);
          setUserInfo(null);
          setIsAdmin(false);
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleEditAvatar = () => {
    Taro.navigateTo({ url: '/pages/avatar-editor/index' });
  };

  const handleExportData = () => {
    Taro.showModal({
      title: '数据导出',
      content: '确定要导出您的所有数据吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '导出中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '导出成功', icon: 'success' });
          }, 1500);
        }
      }
    });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 用户信息区 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        {isLoggedIn ? (
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View
              onClick={handleEditAvatar}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(56, 189, 248, 0.3)',
                flexShrink: 0,
              }}
            >
              {userInfo?.avatar ? (
                <Image
                  src={userInfo.avatar}
                  style={{ width: '100%', height: '100%' }}
                  mode="aspectFill"
                />
              ) : (
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={28} color="#38bdf8" />
                </View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: '16px' }}>
              <Text style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', display: 'block' }}>
                {userInfo?.nickname || userInfo?.username || '用户'}
              </Text>
              <View style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <View
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: onlineStatus.isOnline ? '#22c55e' : '#64748b',
                    marginRight: '6px',
                  }}
                />
                <Text style={{ fontSize: '12px', color: onlineStatus.isOnline ? '#22c55e' : '#64748b' }}>
                  {onlineStatus.isOnline ? '在线' : '离线'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ display: 'flex', gap: '12px' }}>
            <View
              style={{ flex: 1, backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onClick={handleLogin}
            >
              <User size={20} color="#38bdf8" />
              <Text style={{ fontSize: '14px', color: '#38bdf8', fontWeight: '500', marginTop: '4px' }}>登录账号</Text>
            </View>
            <View
              style={{ flex: 1, backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onClick={handleRegister}
            >
              <UserPlus size={20} color="#71717a" />
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>注册账号</Text>
            </View>
          </View>
        )}
      </View>

      {/* 管理员后台入口 - 仅管理员可见 */}
      {isLoggedIn && isAdmin && (
        <View style={{ padding: '0 20px', marginTop: '16px' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
            {/* 管理后台 */}
            <View
              style={{ display: 'flex', alignItems: 'center', padding: '16px' }}
              onClick={() => handleNav('/pages/admin/dashboard/index')}
            >
              <View style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              >
                <Crown size={20} color="#ffffff" />
              </View>
              <View style={{ flex: 1, marginLeft: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>管理后台</Text>
                  <View style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '4px',
                  }}
                  >
                    <Text style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '500' }}>管理员</Text>
                  </View>
                </View>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>全局数据监控与系统管理</Text>
              </View>
              <ChevronRight size={18} color="#64748b" />
            </View>
          </View>
        </View>
      )}

      {/* 数据管理 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>数据管理</Text>
        
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 数据看板 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/pages/data-stats/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChartBarBig size={20} color="#60a5fa" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>数据看板</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>查看运营数据统计</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>

          {/* 数据导出 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '16px' }}
            onClick={handleExportData}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={20} color="#4ade80" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>数据导出</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>导出您的所有数据</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>
        </View>
      </View>

      {/* 系统 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>系统</Text>
        
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 消息订阅 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e3a5f' }}
            onClick={() => handleNav('/pages/subscribe-message/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(249, 115, 22, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color="#f97316" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>消息订阅</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>管理通知订阅</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>

          {/* 设置 */}
          <View
            style={{ display: 'flex', alignItems: 'center', padding: '16px' }}
            onClick={() => handleNav('/pages/settings/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(63, 63, 70, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={20} color="#94a3b8" />
            </View>
            <View style={{ flex: 1, marginLeft: '12px' }}>
              <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>设置</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>账号与系统设置</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </View>
        </View>
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View style={{ padding: '24px 20px 0' }}>
          <View
            style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleLogout}
          >
            <LogOut size={18} color="#f87171" />
            <Text style={{ fontSize: '14px', color: '#f87171', marginLeft: '8px' }}>退出登录</Text>
          </View>
        </View>
      )}

      {/* 版本信息 */}
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
        <Text style={{ fontSize: '12px', color: '#334155' }}>星厨房内容创作助手 v1.0.0</Text>
      </View>
    </View>
  );
};

export default TabProfilePage;
