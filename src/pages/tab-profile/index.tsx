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
  IdCard,
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
          // TODO: 调用后端导出接口
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '导出成功', icon: 'success' });
          }, 1500);
        }
      }
    });
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 用户信息区 */}
      <View className="px-6 pt-12 pb-6 bg-gradient-to-b from-[#141416] to-[#0a0a0b]">
        {isLoggedIn ? (
          <View className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
            <View className="flex items-center mb-4">
              {userInfo?.avatar ? (
                <Image
                  src={userInfo.avatar}
                  className="w-16 h-16 rounded-full mr-4 border-2 border-amber-500/30"
                  mode="aspectFill"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mr-4 border border-amber-500/30">
                  <User size={32} color="#f59e0b" />
                </View>
              )}
              <View className="flex-1">
                <Text className="block text-xl font-semibold text-white mb-1">
                  {userInfo?.nickname || userInfo?.username || '用户'}
                </Text>
                <Text className="block text-sm text-zinc-500">
                  {isAdmin ? '管理员' : '普通用户'}
                </Text>
              </View>
            </View>
            
            {/* ID 显示 */}
            <View className="flex items-center pt-3 border-t border-zinc-800">
              <IdCard size={16} color="#71717a" />
              <Text className="ml-2 text-sm text-zinc-500">用户ID：</Text>
              <Text className="text-sm text-zinc-400 font-mono">
                {userInfo?.id || '-'}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex flex-col gap-3">
            {/* 登录按钮 */}
            <View
              className="flex items-center justify-center py-4 bg-amber-500/20 border border-amber-500/30 rounded-2xl active:bg-amber-500/30"
              onClick={handleLogin}
            >
              <User size={22} color="#f59e0b" />
              <Text className="ml-2 text-lg text-amber-400 font-medium">登录账号</Text>
            </View>
            {/* 注册按钮 */}
            <View
              className="flex items-center justify-center py-4 bg-zinc-800/40 border border-zinc-700/50 rounded-2xl active:bg-zinc-700/50"
              onClick={handleRegister}
            >
              <UserPlus size={22} color="#a1a1aa" />
              <Text className="ml-2 text-lg text-zinc-300">注册新账号</Text>
            </View>
          </View>
        )}
      </View>

      {/* 功能列表 */}
      <View className="px-6 py-4">
        <Text className="block text-sm text-zinc-600 mb-3 px-1">数据管理</Text>
        <View className="flex flex-col gap-3">
          {/* 数据看板 */}
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/data-stats/index')}
          >
            <View className="w-11 h-11 rounded-xl flex items-center justify-center mr-4 bg-blue-500/15">
              <ChartBarBig size={22} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-white">数据看板</Text>
              <Text className="block text-sm text-zinc-500 mt-0.5">查看运营数据统计</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>

          {/* 数据导出 */}
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60"
            onClick={handleExportData}
          >
            <View className="w-11 h-11 rounded-xl flex items-center justify-center mr-4 bg-green-500/15">
              <Download size={22} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-white">数据导出</Text>
              <Text className="block text-sm text-zinc-500 mt-0.5">导出您的所有数据</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 设置区域 */}
      <View className="px-6 py-4">
        <Text className="block text-sm text-zinc-600 mb-3 px-1">系统</Text>
        <View className="flex flex-col gap-3">
          {/* 系统设置 */}
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/settings/index')}
          >
            <View className="w-11 h-11 rounded-xl flex items-center justify-center mr-4 bg-zinc-600/30">
              <Settings size={22} color="#71717a" />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-white">设置</Text>
              <Text className="block text-sm text-zinc-500 mt-0.5">账号与系统设置</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </View>
        </View>
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View className="px-6 py-4">
          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60"
            onClick={handleLogout}
          >
            <View className="w-11 h-11 rounded-xl flex items-center justify-center mr-4 bg-red-500/15">
              <LogOut size={22} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-medium text-red-400">退出登录</Text>
            </View>
          </View>
        </View>
      )}

      {/* 版本信息 */}
      <View className="flex justify-center py-8">
        <Text className="text-xs text-zinc-700">星厨房内容创作助手 v1.0.0</Text>
      </View>
    </View>
  );
};

export default TabProfilePage;
