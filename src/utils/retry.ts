import { Network } from '@/network';
import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: any) => {
    // 网络错误或超时重试
    if (error?.errMsg?.includes('timeout') || error?.errMsg?.includes('fail')) {
      return true;
    }
    // 5xx 服务器错误重试
    if (error?.statusCode >= 500) {
      return true;
    }
    return false;
  },
};

/**
 * 带重试机制的请求封装
 */
export async function requestWithRetry(
  options: Parameters<typeof Network.request>[0],
  retryOptions: RetryOptions = {}
): Promise<ReturnType<typeof Network.request>> {
  const { maxRetries, retryDelay, shouldRetry } = { ...defaultOptions, ...retryOptions };
  let lastError: any;

  for (let attempt = 0; attempt < (maxRetries || 1); attempt++) {
    try {
      const result = await Network.request(options);
      
      // 检查 HTTP 状态码
      if (result.statusCode >= 200 && result.statusCode < 300) {
        return result;
      }
      
      // 4xx 错误不重试
      if (result.statusCode >= 400 && result.statusCode < 500) {
        throw result;
      }
      
      // 其他错误可能重试
      throw result;
    } catch (error) {
      lastError = error;
      
      const isLastAttempt = attempt === (maxRetries || 1) - 1;
      
      if (isLastAttempt || !shouldRetry?.(error)) {
        throw error;
      }
      
      logger.warn(`请求失败，${retryDelay}ms 后重试 (${attempt + 1}/${maxRetries})`, error);
      
      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
}

export default requestWithRetry;
