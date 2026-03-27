import { useEffect, useRef, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

/**
 * 在线状态管理 Hook
 * 自动检测用户前台/后台状态，并同步到服务器
 */
export function useOnlineStatus() {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(false);

  // 更新在线状态
  const updateStatus = useCallback(async (isOnline: boolean) => {
    if (isOnlineRef.current === isOnline) return;

    try {
      const token = Taro.getStorageSync('token');
      if (!token) return;

      await Network.request({
        url: '/api/user/online-status',
        method: 'POST',
        data: { isOnline },
      });

      isOnlineRef.current = isOnline;
      console.log(`[OnlineStatus] 状态已更新: ${isOnline ? '在线' : '离线'}`);
    } catch (error) {
      console.error('[OnlineStatus] 更新状态失败:', error);
    }
  }, []);

  // 启动心跳
  const startHeartbeat = useCallback(() => {
    // 每 30 秒发送一次心跳
    heartbeatIntervalRef.current = setInterval(() => {
      if (isOnlineRef.current) {
        updateStatus(true);
      }
    }, 30000);
  }, [updateStatus]);

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
      console.log('[OnlineStatus] 页面显示，设置为在线');
      updateStatus(true);
      startHeartbeat();
    };

    // 使用 Taro 的页面生命周期
    Taro.eventCenter.on('onShow', handleShow);

    return () => {
      Taro.eventCenter.off('onShow', handleShow);
    };
  }, [updateStatus, startHeartbeat]);

  // 页面隐藏时设置为离线
  useEffect(() => {
    const handleHide = () => {
      console.log('[OnlineStatus] 页面隐藏，设置为离线');
      stopHeartbeat();
      updateStatus(false);
    };

    Taro.eventCenter.on('onHide', handleHide);

    return () => {
      Taro.eventCenter.off('onHide', handleHide);
    };
  }, [updateStatus, stopHeartbeat]);

  // 组件挂载时设置为在线
  useEffect(() => {
    // 检查是否已登录
    const userToken = Taro.getStorageSync('token');
    if (userToken) {
      updateStatus(true);
      startHeartbeat();
    }

    // 组件卸载时设置为离线
    return () => {
      stopHeartbeat();
      const cleanupToken = Taro.getStorageSync('token');
      if (cleanupToken) {
        updateStatus(false);
      }
    };
  }, [updateStatus, startHeartbeat, stopHeartbeat]);
}

/**
 * 获取用户在线状态
 */
export async function getUserOnlineStatus(userId: string): Promise<{
  isOnline: boolean;
  lastSeenAt: string | null;
}> {
  try {
    const res = await Network.request({
      url: `/api/user/online-status?userId=${userId}`,
      method: 'GET',
    });

    if (res.data?.code === 200) {
      return res.data.data;
    }

    return { isOnline: false, lastSeenAt: null };
  } catch (error) {
    console.error('[OnlineStatus] 获取状态失败:', error);
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

  try {
    const res = await Network.request({
      url: '/api/user/online-status/batch',
      method: 'POST',
      data: { userIds },
    });

    if (res.data?.code === 200) {
      return res.data.data;
    }

    return {};
  } catch (error) {
    console.error('[OnlineStatus] 批量获取状态失败:', error);
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
