import { useState, useEffect, useRef, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

// 标记后端是否支持 online-status 接口
let onlineStatusSupported = true;

/**
 * 在线状态管理 Hook
 * 自动检测用户前台/后台状态，并同步到服务器
 * @returns 当前在线状态
 */
export function useOnlineStatus(): { isOnline: boolean; lastSeenAt: string | null } {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<{ isOnline: boolean; lastSeenAt: string | null }>({
    isOnline: false,
    lastSeenAt: null,
  });

  // 更新在线状态
  const updateStatus = useCallback(async (isOnline: boolean) => {
    // 如果后端不支持，直接更新本地状态
    if (!onlineStatusSupported) {
      setStatus(prev => ({
        ...prev,
        isOnline,
        lastSeenAt: isOnline ? new Date().toISOString() : prev.lastSeenAt,
      }));
      return;
    }

    try {
      const token = Taro.getStorageSync('token');
      if (!token) return;

      const res = await Network.request({
        url: '/api/user/online-status',
        method: 'POST',
        data: { isOnline },
      });

      // 如果返回 404，标记接口不支持
      if (res.statusCode === 404 || res.data?.code === 404) {
        onlineStatusSupported = false;
        console.log('[OnlineStatus] 后端暂不支持此功能，已禁用');
        setStatus(prev => ({
          ...prev,
          isOnline,
          lastSeenAt: isOnline ? new Date().toISOString() : prev.lastSeenAt,
        }));
        return;
      }

      const now = new Date().toISOString();
      setStatus({
        isOnline,
        lastSeenAt: isOnline ? now : status.lastSeenAt,
      });
      console.log(`[OnlineStatus] 状态已更新: ${isOnline ? '在线' : '离线'}`);
    } catch (error) {
      // 静默处理错误，标记接口不支持
      onlineStatusSupported = false;
      setStatus(prev => ({
        ...prev,
        isOnline,
        lastSeenAt: isOnline ? new Date().toISOString() : prev.lastSeenAt,
      }));
    }
  }, [status.lastSeenAt]);

  // 启动心跳
  const startHeartbeat = useCallback(() => {
    // 如果后端不支持，不启动心跳
    if (!onlineStatusSupported) return;

    // 每 30 秒发送一次心跳
    heartbeatIntervalRef.current = setInterval(() => {
      if (status.isOnline && onlineStatusSupported) {
        updateStatus(true);
      }
    }, 30000);
  }, [status.isOnline, updateStatus]);

  // 停止心跳
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // 页面显示时设置为在线
  useEffect(() => {
    const handleShow = () => {
      if (onlineStatusSupported) {
        updateStatus(true);
        startHeartbeat();
      }
    };

    Taro.eventCenter.on('onShow', handleShow);

    return () => {
      Taro.eventCenter.off('onShow', handleShow);
    };
  }, [updateStatus, startHeartbeat]);

  // 页面隐藏时设置为离线
  useEffect(() => {
    const handleHide = () => {
      stopHeartbeat();
      if (onlineStatusSupported) {
        updateStatus(false);
      }
    };

    Taro.eventCenter.on('onHide', handleHide);

    return () => {
      Taro.eventCenter.off('onHide', handleHide);
    };
  }, [updateStatus, stopHeartbeat]);

  // 组件挂载时设置为在线
  useEffect(() => {
    const userToken = Taro.getStorageSync('token');
    if (userToken) {
      updateStatus(true);
      startHeartbeat();
    }

    return () => {
      stopHeartbeat();
    };
  }, [updateStatus, startHeartbeat, stopHeartbeat]);

  return status;
}

/**
 * 获取用户在线状态
 */
export async function getUserOnlineStatus(userId: string): Promise<{
  isOnline: boolean;
  lastSeenAt: string | null;
}> {
  // 如果后端不支持，返回默认值
  if (!onlineStatusSupported) {
    return { isOnline: false, lastSeenAt: null };
  }

  try {
    const res = await Network.request({
      url: `/api/user/online-status?userId=${userId}`,
      method: 'GET',
    });

    // 如果返回 404，标记接口不支持
    if (res.statusCode === 404 || res.data?.code === 404) {
      onlineStatusSupported = false;
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
  if (!onlineStatusSupported) {
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
      onlineStatusSupported = false;
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
