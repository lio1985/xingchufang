import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Shield,
  ChartBarBig,
  ChevronRight,
  LogOut,
} from 'lucide-react-taro';

const TabProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

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

  return (
    <View className="min-h-screen bg-[#0a0a0b]">
      {/* 用户信息区 */}
      <View className="px-8 pt-12 pb-8 bg-gradient-to-b from-[#141416] to-[#0a0a0b]">
        {isLoggedIn ? (
          <View className="flex items-center">
            <View className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mr-4 border border-amber-500/30">
              <User size={32} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="block text-xl font-semibold text-white mb-1">
                {userInfo?.username || '用户'}
              </Text>
              <Text className="block text-sm text-zinc-500">
                {isAdmin ? '管理员' : '普通用户'}
              </Text>
            </View>
          </View>
        ) : (
          <View
            className="flex items-center justify-center py-6 bg-zinc-800/40 rounded-2xl border border-zinc-700/50 active:bg-zinc-700/50"
            onClick={handleLogin}
          >
            <User size={24} color="#f59e0b" />
            <Text className="ml-2 text-lg text-amber-400">点击登录</Text>
          </View>
        )}
      </View>

      {/* 功能列表 */}
      <View className="p-6">
        <View className="flex flex-col gap-3">
          {isAdmin && (
            <View
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60"
              onClick={() => handleNav('/pages/admin/dashboard/index')}
            >
              <View className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-amber-500/15">
                <Shield size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="block text-lg font-medium text-white">管理后台</Text>
              </View>
              <ChevronRight size={20} color="#52525b" />
            </View>
          )}

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/data-stats/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-blue-500/15">
              <ChartBarBig size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-medium text-white">数据统计</Text>
            </View>
            <ChevronRight size={20} color="#52525b" />
          </View>

          <View
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60"
            onClick={() => handleNav('/pages/settings/index')}
          >
            <View className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-zinc-600/30">
              <Settings size={24} color="#71717a" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-medium text-white">系统设置</Text>
            </View>
            <ChevronRight size={20} color="#52525b" />
          </View>

          {isLoggedIn && (
            <View
              className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center active:bg-zinc-800/60 mt-4"
              onClick={handleLogout}
            >
              <View className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-red-500/15">
                <LogOut size={24} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="block text-lg font-medium text-red-400">退出登录</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default TabProfilePage;
