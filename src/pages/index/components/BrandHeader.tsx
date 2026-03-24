import { View, Text } from '@tarojs/components';
import { User, Bell, Shield, Settings, LogOut } from 'lucide-react-taro';
import { APP_CONFIG } from '../config';

interface BrandHeaderProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  unreadCount: number;
  pendingUsersCount: number;
  devModeEnabled: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (url: string) => void;
}

const BrandHeader: React.FC<BrandHeaderProps> = ({
  isLoggedIn,
  isAdmin,
  unreadCount,
  pendingUsersCount,
  devModeEnabled,
  onLogin,
  onLogout,
  onNavigate,
}) => {
  return (
    <View className="bg-white px-5 pt-12 pb-5 border-b border-slate-200">
      {/* 品牌区 */}
      <View className="flex justify-between items-center">
        <View className="flex-1">
          <Text className="block text-2xl font-bold text-slate-800">星厨房</Text>
          <Text className="block text-xs text-slate-500 mt-1 tracking-wider">STAR KITCHEN</Text>
        </View>

        {/* 用户操作区 */}
        <View className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* 消息 */}
              <View className="relative" onClick={() => onNavigate('/pages/notification/index')}>
                <View className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
                  <Bell size={20} color="#64748B" />
                </View>
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 min-w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center px-1">
                    <Text className="block text-white text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              {/* 管理员入口 */}
              {isAdmin && (
                <View className="relative" onClick={() => onNavigate('/pages/admin/dashboard/index')}>
                  <View className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
                    <Shield size={20} color="#10B981" />
                  </View>
                  {pendingUsersCount > 0 && (
                    <View className="absolute -top-1 -right-1 min-w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center px-1">
                      <Text className="block text-white text-xs font-bold">
                        {pendingUsersCount > 99 ? '99+' : pendingUsersCount}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* 开发者工具 */}
              {devModeEnabled && (
                <View
                  className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  onClick={() => onNavigate('/pages/dev-tools/index')}
                >
                  <Settings size={20} color="#9333EA" />
                </View>
              )}

              {/* 退出 */}
              <View
                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                onClick={onLogout}
              >
                <LogOut size={20} color="#64748B" />
              </View>
            </>
          ) : (
            <View
              className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
              onClick={onLogin}
            >
              <User size={20} color="#FFFFFF" />
            </View>
          )}
        </View>
      </View>

      {/* 版本信息 */}
      <View className="mt-3">
        <Text className="block text-xs text-slate-400">
          v{APP_CONFIG.VERSION} | {APP_CONFIG.BUILD_TIME}
        </Text>
      </View>
    </View>
  );
};

export default BrandHeader;
