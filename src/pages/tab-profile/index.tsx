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
    <View className="min-h-screen bg-[#0a0a0b] pb-20">
      {/* 页面头部 */}
      <View className="px-5 pt-14 pb-8 bg-[#141416]">
        <Text className="block text-2xl font-bold text-white">我</Text>
        <Text className="block text-zinc-500 text-sm mt-2">个人中心与设置</Text>
      </View>

      {/* 用户信息区 */}
      <View className="px-5 -mt-4">
        {isLoggedIn ? (
          <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <View className="flex items-center">
              {userInfo?.avatar ? (
                <Image
                  src={userInfo.avatar}
                  className="w-14 h-14 rounded-full border-2 border-amber-500/30"
                  mode="aspectFill"
                />
              ) : (
                <View className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 items-center justify-center">
                  <User size={24} color="#f59e0b" />
                </View>
              )}
              <View className="flex-1 ml-4">
                <Text className="text-lg font-semibold text-white">
                  {userInfo?.nickname || userInfo?.username || '用户'}
                </Text>
                <Text className="text-xs text-zinc-500 mt-1">
                  ID: {userInfo?.id || '-'} · {isAdmin ? '管理员' : '普通用户'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="flex gap-3">
            <View
              className="flex-1 bg-amber-500/20 border border-amber-500/30 rounded-xl py-4 items-center justify-center active:bg-amber-500/30"
              onClick={handleLogin}
            >
              <User size={20} color="#f59e0b" />
              <Text className="text-sm text-amber-400 font-medium mt-1">登录账号</Text>
            </View>
            <View
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-4 items-center justify-center active:bg-zinc-800"
              onClick={handleRegister}
            >
              <UserPlus size={20} color="#71717a" />
              <Text className="text-sm text-zinc-300 mt-1">注册账号</Text>
            </View>
          </View>
        )}
      </View>

      {/* 数据管理 */}
      <View className="px-5 mt-6">
        <Text className="block text-xs text-zinc-600 mb-3 font-medium">数据管理</Text>
        
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* 数据看板 */}
          <View
            className="flex items-center px-4 py-4 border-b border-zinc-800 active:bg-zinc-800"
            onClick={() => handleNav('/pages/data-stats/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-blue-500/20 items-center justify-center">
              <ChartBarBig size={20} color="#3b82f6" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white font-medium">数据看板</Text>
              <Text className="text-xs text-zinc-500 mt-1">查看运营数据统计</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>

          {/* 数据导出 */}
          <View
            className="flex items-center px-4 py-4 active:bg-zinc-800"
            onClick={handleExportData}
          >
            <View className="w-10 h-10 rounded-lg bg-green-500/20 items-center justify-center">
              <Download size={20} color="#22c55e" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white font-medium">数据导出</Text>
              <Text className="text-xs text-zinc-500 mt-1">导出您的所有数据</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 系统 */}
      <View className="px-5 mt-6">
        <Text className="block text-xs text-zinc-600 mb-3 font-medium">系统</Text>
        
        <View className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* 设置 */}
          <View
            className="flex items-center px-4 py-4 active:bg-zinc-800"
            onClick={() => handleNav('/pages/settings/index')}
          >
            <View className="w-10 h-10 rounded-lg bg-zinc-700/50 items-center justify-center">
              <Settings size={20} color="#a1a1aa" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-white font-medium">设置</Text>
              <Text className="text-xs text-zinc-500 mt-1">账号与系统设置</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View className="px-5 mt-6">
          <View
            className="bg-zinc-900 border border-zinc-800 rounded-xl py-4 items-center justify-center active:bg-zinc-800"
            onClick={handleLogout}
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="text-sm text-red-400 ml-2">退出登录</Text>
          </View>
        </View>
      )}

      {/* 版本信息 */}
      <View className="items-center py-8">
        <Text className="text-xs text-zinc-700">星厨房内容创作助手 v1.0.0</Text>
      </View>
    </View>
  );
};

export default TabProfilePage;
