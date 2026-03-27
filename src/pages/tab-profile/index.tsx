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
  Users,
  BookOpen,
  Building2,
  ShoppingCart,
  FileChartColumn,
  Bell,
} from 'lucide-react-taro';

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

  useEffect(() => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setIsLoggedIn(true);
        setUserInfo(user);
        setIsAdmin(user.role === 'admin');
      }
    } catch (e) {
      console.log('获取用户信息失败');
    }
  }, []);

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
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>我</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>个人中心与设置</Text>
      </View>

      {/* 用户信息区 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        {isLoggedIn ? (
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              {userInfo?.avatar ? (
                <Image
                  src={userInfo.avatar}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(245, 158, 11, 0.3)' }}
                  mode="aspectFill"
                />
              ) : (
                <View style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color="#38bdf8" />
                </View>
              )}
              <View style={{ flex: 1, marginLeft: '16px' }}>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  {userInfo?.nickname || userInfo?.username || '用户'}
                </Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>
                  ID: {userInfo?.id || '-'} · {isAdmin ? '管理员' : '普通用户'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ display: 'flex', gap: '12px' }}>
            <View
              style={{ flex: 1, backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
          {/* 主入口卡片 */}
          <View
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '16px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 装饰性光效 */}
            <View style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
            />
            
            {/* 标题栏 */}
            <View
              style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}
              onClick={() => handleNav('/pages/admin/dashboard/index')}
            >
              <View style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
              }}
              >
                <Crown size={22} color="#ffffff" />
              </View>
              <View style={{ flex: 1, marginLeft: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>管理后台</Text>
                  <View style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: 'rgba(167, 139, 250, 0.3)',
                    borderRadius: '4px',
                  }}
                  >
                    <Text style={{ fontSize: '10px', color: '#c4b5fd', fontWeight: '500' }}>专属</Text>
                  </View>
                </View>
                <Text style={{ fontSize: '12px', color: '#a78bfa', display: 'block', marginTop: '2px' }}>
                  全局数据监控与系统管理
                </Text>
              </View>
              <ChevronRight size={20} color="#a78bfa" />
            </View>

            {/* 功能快捷入口 */}
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/admin/users/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <Users size={14} color="#60a5fa" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>用户管理</Text>
              </View>

              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/admin/customer-management/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <User size={14} color="#4ade80" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>客户管理</Text>
              </View>

              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/admin/recycle-management/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <Building2 size={14} color="#22d3ee" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>回收门店</Text>
              </View>

              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/equipment-orders/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <ShoppingCart size={14} color="#7dd3fc" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>设备订单</Text>
              </View>

              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/admin/team-management/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(168, 85, 247, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <Users size={14} color="#c084fc" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>团队管理</Text>
              </View>

              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/admin/ai-report/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(236, 72, 153, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <FileChartColumn size={14} color="#f472b6" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>运营报告</Text>
              </View>

              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/admin/lexicon-manage/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <BookOpen size={14} color="#34d399" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>语料库</Text>
              </View>

              <View
                style={{
                  flex: '1 1 45%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => handleNav('/pages/admin/send-notification/index')}
              >
                <View style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(251, 146, 60, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <Bell size={14} color="#fb923c" />
                </View>
                <Text style={{ fontSize: '12px', color: '#e4e4e7', marginLeft: '8px', fontWeight: '500' }}>发送通知</Text>
              </View>
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
