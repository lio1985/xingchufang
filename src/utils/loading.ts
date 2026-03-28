/**
 * 加载状态工具函数
 * 统一管理加载状态和提示
 */

import Taro from '@tarojs/taro';

/**
 * 显示加载提示
 * @param title 提示文字
 */
export const showLoading = (title: string = '加载中...'): void => {
  Taro.showLoading({
    title,
    mask: true,
  });
};

/**
 * 隐藏加载提示
 */
export const hideLoading = (): void => {
  Taro.hideLoading();
};

/**
 * 显示成功提示
 * @param title 提示文字
 * @param duration 持续时间（毫秒）
 */
export const showSuccess = (title: string, duration: number = 1500): void => {
  Taro.showToast({
    title,
    icon: 'success',
    duration,
  });
};

/**
 * 显示错误提示
 * @param title 提示文字
 * @param duration 持续时间（毫秒）
 */
export const showError = (title: string, duration: number = 2000): void => {
  Taro.showToast({
    title,
    icon: 'error',
    duration,
  });
};

/**
 * 显示普通提示
 * @param title 提示文字
 * @param duration 持续时间（毫秒）
 */
export const showInfo = (title: string, duration: number = 2000): void => {
  Taro.showToast({
    title,
    icon: 'none',
    duration,
  });
};

/**
 * 显示确认对话框
 * @param title 标题
 * @param content 内容
 * @returns Promise<boolean>
 */
export const showConfirm = (title: string, content: string): Promise<boolean> => {
  return new Promise((resolve) => {
    Taro.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      },
    });
  });
};

/**
 * 显示操作菜单
 * @param itemList 选项列表
 * @returns Promise<number> 选中项索引
 */
export const showActionSheet = (itemList: string[]): Promise<number> => {
  return new Promise((resolve, reject) => {
    Taro.showActionSheet({
      itemList,
      success: (res) => {
        resolve(res.tapIndex);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * 下拉刷新
 * @param callback 刷新回调
 */
export const startPullDownRefresh = async (callback: () => Promise<void>): Promise<void> => {
  try {
    Taro.startPullDownRefresh();
    await callback();
  } finally {
    Taro.stopPullDownRefresh();
  }
};

/**
 * 网络请求错误处理
 * @param error 错误对象
 * @returns 错误提示文字
 */
export const handleNetworkError = (error: any): string => {
  const errMsg = error?.errMsg || error?.message || '网络请求失败';
  
  if (errMsg.includes('timeout')) {
    return '请求超时，请检查网络连接';
  }
  if (errMsg.includes('fail')) {
    return '网络连接失败，请稍后重试';
  }
  if (errMsg.includes('401')) {
    return '登录已过期，请重新登录';
  }
  if (errMsg.includes('403')) {
    return '权限不足，无法访问';
  }
  if (errMsg.includes('404')) {
    return '请求的资源不存在';
  }
  if (errMsg.includes('500')) {
    return '服务器繁忙，请稍后重试';
  }
  if (errMsg.includes('502') || errMsg.includes('503')) {
    return '服务暂不可用，请稍后重试';
  }
  
  return errMsg;
};

/**
 * 防抖函数
 * @param fn 目标函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

/**
 * 节流函数
 * @param fn 目标函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

/**
 * 带加载状态的异步操作
 * @param fn 异步函数
 * @param loadingText 加载提示文字
 * @returns 包装后的函数
 */
export const withLoading = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  loadingText: string = '加载中...'
): T => {
  return (async (...args: Parameters<T>) => {
    showLoading(loadingText);
    try {
      const result = await fn(...args);
      return result;
    } finally {
      hideLoading();
    }
  }) as T;
};
