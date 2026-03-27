import { useEffect, useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

/**
 * 用户角色类型
 */
export type UserRole = 'guest' | 'employee' | 'team_leader' | 'admin';

/**
 * 用户状态类型
 */
export type UserStatus = 'active' | 'inactive' | 'suspended';

/**
 * 权限守卫配置
 */
interface AuthGuardOptions {
  /** 是否需要登录 */
  requireLogin?: boolean;
  /** 需要的最低角色 */
  requiredRole?: UserRole;
  /** 允许的角色列表（优先于 requiredRole） */
  allowedRoles?: UserRole[];
  /** 未登录时的跳转路径 */
  loginPath?: string;
  /** 无权限时的跳转路径 */
  forbiddenPath?: string;
  /** 无权限时的提示信息 */
  forbiddenMessage?: string;
}

/**
 * 用户信息
 */
interface UserInfo {
  id: string;
  username?: string;
  nickname?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  teamId?: string;
  isTeamLeader?: boolean;
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
  user: UserInfo | null;
  /** 是否是管理员 */
  isAdmin: boolean;
  /** 是否是团队队长 */
  isTeamLeader: boolean;
  /** 是否是员工 */
  isEmployee: boolean;
  /** 是否是游客 */
  isGuest: boolean;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 用户角色 */
  role: UserRole | null;
  /** 跳转到登录页 */
  goToLogin: () => void;
  /** 退出登录 */
  logout: () => void;
  /** 刷新用户信息 */
  refreshUser: () => Promise<void>;
}

/**
 * 角色权限等级
 */
const ROLE_LEVEL: Record<UserRole, number> = {
  guest: 0,
  employee: 1,
  team_leader: 2,
  admin: 3,
};

/**
 * 检查角色权限
 */
const checkRolePermission = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
};

/**
 * 获取用户信息
 */
const fetchUserInfo = async (userId: string): Promise<UserInfo | null> => {
  try {
    const res = await Network.request({
      url: `/api/users/${userId}`,
      method: 'GET',
    });

    console.log('[权限守卫] 获取用户信息响应:', res.data);

    if (res.data?.code === 200 && res.data?.data) {
      return {
        id: res.data.data.id,
        username: res.data.data.username,
        nickname: res.data.data.nickname,
        avatar: res.data.data.avatar_url,
        role: res.data.data.role || 'guest',
        status: res.data.data.status || 'inactive',
        teamId: res.data.data.team_id,
        isTeamLeader: res.data.data.is_team_leader,
      };
    }
    return null;
  } catch (error) {
    console.error('[权限守卫] 获取用户信息失败:', error);
    return null;
  }
};

/**
 * 权限守卫 Hook
 * 用于页面级别的权限控制
 * 
 * @example
 * ```tsx
 * // 需要登录的页面
 * const { canAccess, loading } = useAuthGuard({ requireLogin: true });
 * 
 * // 需要员工及以上权限
 * const { canAccess, loading } = useAuthGuard({ requiredRole: 'employee' });
 * 
 * // 需要管理员权限
 * const { canAccess, loading } = useAuthGuard({ requiredRole: 'admin' });
 * 
 * // 只允许特定角色
 * const { canAccess, loading } = useAuthGuard({ allowedRoles: ['team_leader', 'admin'] });
 * ```
 */
export const useAuthGuard = (options: AuthGuardOptions = {}): AuthGuardResult => {
  const {
    requireLogin = true,
    requiredRole,
    allowedRoles,
    loginPath = '/pages/login/index',
    forbiddenPath = '/pages/tab-home/index',
    forbiddenMessage = '无权访问此页面',
  } = options;

  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  // 派生状态
  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isTeamLeader = role === 'team_leader' || user?.isTeamLeader === true;
  const isEmployee = role === 'employee';
  const isGuest = role === 'guest';
  const isLoggedIn = !!user && user.status === 'active';

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

      // 从服务器获取最新用户信息
      const userInfo = await fetchUserInfo(storedUser.id);
      
      if (!userInfo) {
        console.error('[权限守卫] 无法获取用户信息');
        if (requireLogin) {
          Taro.showToast({ title: '获取用户信息失败', icon: 'none' });
          setTimeout(() => {
            Taro.redirectTo({ url: loginPath });
          }, 500);
        }
        setLoading(false);
        return;
      }

      // 更新本地存储
      Taro.setStorageSync('user', {
        ...storedUser,
        ...userInfo,
      });

      setUser(userInfo);

      // 检查用户状态
      if (userInfo.status === 'suspended') {
        Taro.showToast({ title: '账号已被停用', icon: 'none' });
        setTimeout(() => {
          Taro.redirectTo({ url: loginPath });
        }, 500);
        setLoading(false);
        return;
      }

      if (userInfo.status === 'inactive') {
        Taro.showToast({ title: '账号未激活', icon: 'none' });
        setLoading(false);
        return;
      }

      // 检查角色权限
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(userInfo.role)) {
          Taro.showToast({ title: forbiddenMessage, icon: 'none' });
          setTimeout(() => {
            Taro.switchTab({ url: forbiddenPath });
          }, 500);
          setLoading(false);
          return;
        }
      } else if (requiredRole) {
        if (!checkRolePermission(userInfo.role, requiredRole)) {
          Taro.showToast({ title: forbiddenMessage, icon: 'none' });
          setTimeout(() => {
            Taro.switchTab({ url: forbiddenPath });
          }, 500);
          setLoading(false);
          return;
        }
      }

      setCanAccess(true);
    } catch (error) {
      console.error('[权限守卫] 权限检查失败:', error);
      if (requireLogin) {
        Taro.showToast({ title: '权限检查失败', icon: 'none' });
        setTimeout(() => {
          Taro.redirectTo({ url: loginPath });
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  }, [requireLogin, requiredRole, allowedRoles, loginPath, forbiddenPath, forbiddenMessage]);

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
          setCanAccess(false);
          Taro.showToast({ title: '已退出登录', icon: 'success' });
          setTimeout(() => {
            Taro.redirectTo({ url: loginPath });
          }, 500);
        }
      },
    });
  }, [loginPath]);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    const storedUser = Taro.getStorageSync('user');
    if (storedUser?.id) {
      const userInfo = await fetchUserInfo(storedUser.id);
      if (userInfo) {
        Taro.setStorageSync('user', { ...storedUser, ...userInfo });
        setUser(userInfo);
      }
    }
  }, []);

  return {
    canAccess,
    loading,
    user,
    isAdmin,
    isTeamLeader,
    isEmployee,
    isGuest,
    isLoggedIn,
    role,
    goToLogin,
    logout,
    refreshUser,
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
 * 团队队长及以上权限守卫 Hook
 */
export const useTeamLeaderGuard = (): AuthGuardResult => {
  return useAuthGuard({
    requireLogin: true,
    requiredRole: 'team_leader',
    forbiddenMessage: '此功能仅团队队长及以上权限可用',
  });
};

/**
 * 员工及以上权限守卫 Hook
 */
export const useEmployeeGuard = (): AuthGuardResult => {
  return useAuthGuard({
    requireLogin: true,
    requiredRole: 'employee',
    forbiddenMessage: '请先登录',
  });
};

/**
 * 登录页面权限守卫 Hook
 * 已登录用户自动跳转
 */
export const useLoginGuard = (): { loading: boolean; isLoggedIn: boolean; user: UserInfo | null } => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const storedUser = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');

      if (storedUser && token) {
        // 获取最新用户信息
        const userInfo = await fetchUserInfo(storedUser.id);
        if (userInfo && userInfo.status === 'active') {
          setUser(userInfo);
          setIsLoggedIn(true);
          // 已登录用户跳转到首页
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/tab-home/index' });
          }, 100);
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  return { loading, isLoggedIn, user };
};

/**
 * 检查是否有指定权限
 * 工具函数，可在组件内使用
 */
export const hasPermission = (
  userRole: UserRole | null,
  requiredRole: UserRole
): boolean => {
  if (!userRole) return false;
  return checkRolePermission(userRole, requiredRole);
};

/**
 * 检查是否是管理员或队长
 */
export const isAdminOrLeader = (userRole: UserRole | null): boolean => {
  return userRole === 'admin' || userRole === 'team_leader';
};

export default useAuthGuard;
