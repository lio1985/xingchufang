import { useState, useEffect, useRef, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

// 全局状态，避免多个组件同时使用时重复请求
let globalOnlineStatusSupported = true;
let lastUpdateTime = 0;
let isUpdating = false; // 防止并发更新
const UPDATE_THROTTLE = 5000; // 5秒节流

// 全局在线状态
let globalIsOnline = false;
let globalLastSeenAt: string | null = null;

/**
 * 在线状态管理 Hook
 * 自动检测用户前台/后台状态，并同步到服务器
 * 注意：此 hook 使用全局状态，多个组件同时使用时只会发送一次请求
 */
export function useOnlineStatus(): { 
  isOnline: boolean; 
  lastSeenAt: string | null;
  setOnline: (online: boolean) => void;
} {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(globalIsOnline);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(globalLastSeenAt);

  // 停止心跳
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // 更新在线状态 - 使用全局变量防止重复请求
  const updateStatus = useCallback(async (online: boolean, force = false) => {
    // 防止并发更新
    if (isUpdating) {
      return;
    }

    // 节流检查（强制更新除外）
    const now = Date.now();
    if (!force && now - lastUpdateTime < UPDATE_THROTTLE) {
      return;
    }

    // 如果状态没有变化，跳过
    if (!force && online === globalIsOnline) {
      return;
    }

    isUpdating = true;
    lastUpdateTime = now;

    // 如果后端不支持，直接更新本地状态
    if (!globalOnlineStatusSupported) {
      globalIsOnline = online;
      if (online) {
        globalLastSeenAt = new Date().toISOString();
      }
      setIsOnline(online);
      if (online) {
        setLastSeenAt(new Date().toISOString());
      }
      isUpdating = false;
      return;
    }

    try {
      const token = Taro.getStorageSync('token');
      if (!token) {
        globalIsOnline = online;
        if (online) {
          globalLastSeenAt = new Date().toISOString();
        }
        setIsOnline(online);
        if (online) {
          setLastSeenAt(new Date().toISOString());
        }
        isUpdating = false;
        return;
      }

      const res = await Network.request({
        url: '/api/user/online-status',
        method: 'POST',
        data: { isOnline: online },
      });

      if (res.statusCode === 404 || res.data?.code === 404) {
        globalOnlineStatusSupported = false;
        globalIsOnline = online;
        if (online) {
          globalLastSeenAt = new Date().toISOString();
        }
        setIsOnline(online);
        if (online) {
          setLastSeenAt(new Date().toISOString());
        }
        isUpdating = false;
        return;
      }

      globalIsOnline = online;
      if (online) {
        globalLastSeenAt = new Date().toISOString();
      }
      setIsOnline(online);
      if (online) {
        setLastSeenAt(new Date().toISOString());
      }
    } catch (error) {
      globalOnlineStatusSupported = false;
      globalIsOnline = online;
      if (online) {
        globalLastSeenAt = new Date().toISOString();
      }
      setIsOnline(online);
      if (online) {
        setLastSeenAt(new Date().toISOString());
      }
    } finally {
      isUpdating = false;
    }
  }, []);

  // 启动心跳
  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    if (!globalOnlineStatusSupported) return;
    
    heartbeatIntervalRef.current = setInterval(() => {
      const token = Taro.getStorageSync('token');
      if (token && globalOnlineStatusSupported) {
        updateStatus(true, true); // 心跳强制更新
      }
    }, 30000);
  }, [updateStatus, stopHeartbeat]);

  // 手动设置在线状态
  const setOnline = useCallback((online: boolean) => {
    updateStatus(online);
    if (online) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  }, [updateStatus, startHeartbeat, stopHeartbeat]);

  // 组件挂载时检查登录状态 - 只执行一次
  useEffect(() => {
    const userToken = Taro.getStorageSync('token');
    if (userToken) {
      updateStatus(true, true);
      startHeartbeat();
    }

    return () => {
      stopHeartbeat();
    };
  }, [updateStatus, startHeartbeat, stopHeartbeat]);

  return {
    isOnline,
    lastSeenAt,
    setOnline,
  };
}

/**
 * 获取用户在线状态
 */
export async function getUserOnlineStatus(userId: string): Promise<{
  isOnline: boolean;
  lastSeenAt: string | null;
}> {
  // 如果后端不支持，返回默认值
  if (!globalOnlineStatusSupported) {
    return { isOnline: false, lastSeenAt: null };
  }

  try {
    const res = await Network.request({
      url: `/api/user/online-status?userId=${userId}`,
      method: 'GET',
    });

    // 如果返回 404，标记接口不支持
    if (res.statusCode === 404 || res.data?.code === 404) {
      globalOnlineStatusSupported = false;
      return { isOnline: false, lastSeenAt: null };
    }

    if (res.data?.code === 200) {
      return res.data.data;
    }

    return { isOnline: false, lastSeenAt: null };
  } catch (error) {
    // 静默返回默认值
    return { isOnline: false, lastSeenAt: null };
  }
}

/**
 * 批量获取用户在线状态
 */
export async function getBatchOnlineStatus(userIds: string[]): Promise<Record<string, {
  isOnline: boolean;
  lastSeenAt: string | null;
}>> {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  // 如果后端不支持，返回空对象
  if (!globalOnlineStatusSupported) {
    return {};
  }

  try {
    const res = await Network.request({
      url: '/api/user/online-status/batch',
      method: 'POST',
      data: { userIds },
    });

    // 如果返回 404，标记接口不支持
    if (res.statusCode === 404 || res.data?.code === 404) {
      globalOnlineStatusSupported = false;
      return {};
    }

    if (res.data?.code === 200) {
      return res.data.data;
    }

    return {};
  } catch (error) {
    // 静默返回空对象
    return {};
  }
}

/**
 * 格式化最后活跃时间
 */
export function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return '离线';

  const date = new Date(lastSeenAt);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 5 分钟内认为在线
  if (diff < 5 * 60 * 1000) {
    return '在线';
  }

  // 1 小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  // 24 小时内
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 7 天内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }

  return '离线';
}
