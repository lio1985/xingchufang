import { useEffect, useState, useCallback } from 'react';
import Taro from '@tarojs/taro';

/**
 * 用户角色类型
 */
type UserRole = 'user' | 'admin';

/**
 * 权限守卫配置
 */
interface AuthGuardOptions {
  /** 是否需要登录 */
  requireLogin?: boolean;
  /** 需要的角色 */
  requiredRole?: UserRole;
  /** 未登录时的跳转路径 */
  loginPath?: string;
  /** 无权限时的跳转路径 */
  forbiddenPath?: string;
  /** 无权限时的提示信息 */
  forbiddenMessage?: string;
}

/**
 * 权限守卫返回值
 */
interface AuthGuardResult {
  /** 是否有权限访问 */
  canAccess: boolean;
  /** 是否正在加载 */
  loading: boolean;
  /** 用户信息 */
  user: {
    id?: string;
    username?: string;
    nickname?: string;
    avatar?: string;
    role?: string;
    status?: string;
  } | null;
  /** 是否是管理员 */
  isAdmin: boolean;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 跳转到登录页 */
  goToLogin: () => void;
  /** 退出登录 */
  logout: () => void;
}

/**
 * 权限守卫 Hook
 * 用于页面级别的权限控制
 * 
 * @example
 * ```tsx
 * // 需要登录的页面
 * const { canAccess, loading } = useAuthGuard({ requireLogin: true });
 * 
 * // 需要管理员权限的页面
 * const { canAccess, loading } = useAuthGuard({ requiredRole: 'admin' });
 * ```
 */
export const useAuthGuard = (options: AuthGuardOptions = {}): AuthGuardResult => {
  const {
    requireLogin = true,
    requiredRole,
    loginPath = '/pages/login/index',
    forbiddenPath = '/pages/tab-home/index',
    forbiddenMessage = '无权访问此页面',
  } = options;

  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthGuardResult['user']>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查权限
  const checkAuth = useCallback(async () => {
    try {
      const storedUser = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');

      // 检查登录状态
      if (!storedUser || !token) {
        if (requireLogin) {
          Taro.showToast({ title: '请先登录', icon: 'none' });
          setTimeout(() => {
            Taro.redirectTo({ url: loginPath });
          }, 500);
        }
        setLoading(false);
        return;
      }

      setUser(storedUser);
      setIsLoggedIn(true);
      const userIsAdmin = storedUser.role === 'admin';
      setIsAdmin(userIsAdmin);

      // 检查角色权限
      if (requiredRole === 'admin' && !userIsAdmin) {
        Taro.showToast({ title: forbiddenMessage, icon: 'none' });
        setTimeout(() => {
          Taro.switchTab({ url: forbiddenPath });
        }, 500);
        setLoading(false);
        return;
      }

      setCanAccess(true);
    } catch (error) {
      console.error('权限检查失败:', error);
      if (requireLogin) {
        Taro.showToast({ title: '权限检查失败', icon: 'none' });
        setTimeout(() => {
          Taro.redirectTo({ url: loginPath });
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  }, [requireLogin, requiredRole, loginPath, forbiddenPath, forbiddenMessage]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 跳转到登录页
  const goToLogin = useCallback(() => {
    Taro.navigateTo({ url: loginPath });
  }, [loginPath]);

  // 退出登录
  const logout = useCallback(() => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('user');
          Taro.removeStorageSync('token');
          setUser(null);
          setIsLoggedIn(false);
          setIsAdmin(false);
          setCanAccess(false);
          Taro.showToast({ title: '已退出登录', icon: 'success' });
          setTimeout(() => {
            Taro.redirectTo({ url: loginPath });
          }, 500);
        }
      },
    });
  }, [loginPath]);

  return {
    canAccess,
    loading,
    user,
    isAdmin,
    isLoggedIn,
    goToLogin,
    logout,
  };
};

/**
 * 管理员页面权限守卫 Hook
 * 简化的 Hook，专门用于管理员页面
 */
export const useAdminGuard = (): AuthGuardResult => {
  return useAuthGuard({
    requireLogin: true,
    requiredRole: 'admin',
    forbiddenMessage: '此功能仅管理员可用',
  });
};

/**
 * 登录页面权限守卫 Hook
 * 已登录用户自动跳转
 */
export const useLoginGuard = (): { loading: boolean; isLoggedIn: boolean } => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');

      if (user && token) {
        setIsLoggedIn(true);
        // 已登录用户跳转到首页
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/tab-home/index' });
        }, 100);
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  return { loading, isLoggedIn };
};

export default useAuthGuard;
