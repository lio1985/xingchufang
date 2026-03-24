import Taro from '@tarojs/taro';

/**
 * 统一错误处理工具
 * 提供友好的错误提示和错误码映射
 */

export enum ErrorCode {
  // 网络错误 (1000-1099)
  NETWORK_ERROR = 1000,
  NETWORK_TIMEOUT = 1001,
  SERVER_ERROR = 1002,

  // 认证错误 (2000-2099)
  UNAUTHORIZED = 2000,
  TOKEN_EXPIRED = 2001,
  LOGIN_REQUIRED = 2002,

  // 用户错误 (3000-3099)
  USER_NOT_FOUND = 3000,
  USER_DISABLED = 3001,
  USER_PENDING = 3002,

  // 权限错误 (4000-4099)
  PERMISSION_DENIED = 4000,
  ADMIN_REQUIRED = 4001,

  // 业务错误 (5000-5999)
  INVALID_PARAM = 5000,
  RESOURCE_NOT_FOUND = 5001,
  OPERATION_FAILED = 5002,

  // 未知错误 (9999)
  UNKNOWN = 9999,
}

/**
 * 错误信息映射
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 网络错误
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络后重试',
  [ErrorCode.NETWORK_TIMEOUT]: '请求超时，请稍后重试',
  [ErrorCode.SERVER_ERROR]: '服务器异常，请稍后重试',

  // 认证错误
  [ErrorCode.UNAUTHORIZED]: '未授权，请重新登录',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ErrorCode.LOGIN_REQUIRED]: '请先登录',

  // 用户错误
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_DISABLED]: '账号已被禁用，请联系管理员',
  [ErrorCode.USER_PENDING]: '账号正在等待审核，请耐心等待',

  // 权限错误
  [ErrorCode.PERMISSION_DENIED]: '权限不足，无法执行此操作',
  [ErrorCode.ADMIN_REQUIRED]: '此功能仅管理员可用',

  // 业务错误
  [ErrorCode.INVALID_PARAM]: '参数错误，请检查输入',
  [ErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [ErrorCode.OPERATION_FAILED]: '操作失败，请重试',

  // 未知错误
  [ErrorCode.UNKNOWN]: '发生未知错误，请稍后重试',
};

/**
 * HTTP 状态码映射到错误码
 */
const STATUS_CODE_MAP: Record<number, ErrorCode> = {
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.PERMISSION_DENIED,
  404: ErrorCode.RESOURCE_NOT_FOUND,
  500: ErrorCode.SERVER_ERROR,
  502: ErrorCode.SERVER_ERROR,
  503: ErrorCode.SERVER_ERROR,
  504: ErrorCode.NETWORK_TIMEOUT,
};

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  showToaster?: boolean; // 是否显示 Toast
  showErrorModal?: boolean; // 是否显示错误模态框
  redirectToLogin?: boolean; // 是否跳转到登录页
  logError?: boolean; // 是否记录错误日志
  customMessage?: string; // 自定义错误消息
}

/**
 * 默认错误处理选项
 */
const DEFAULT_OPTIONS: ErrorHandlerOptions = {
  showToaster: true,
  showErrorModal: false,
  redirectToLogin: false,
  logError: true,
  customMessage: undefined,
};

/**
 * 统一错误处理函数
 */
export function handleError(
  error: any,
  options: ErrorHandlerOptions = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 获取错误信息
  let errorCode = ErrorCode.UNKNOWN;
  let errorMessage = '';

  // 从 HTTP 响应中提取错误
  if (error.statusCode) {
    errorCode = STATUS_CODE_MAP[error.statusCode] || ErrorCode.SERVER_ERROR;
    errorMessage = error.data?.msg || ERROR_MESSAGES[errorCode];
  }
  // 从网络错误中提取
  else if (error.errMsg && error.errMsg.includes('request:fail')) {
    errorCode = ErrorCode.NETWORK_ERROR;
    errorMessage = ERROR_MESSAGES[errorCode];
  }
  // 从 API 响应中提取
  else if (error.data && error.data.code) {
    // 尝试将后端错误码映射到前端错误码
    errorCode = mapApiCodeToErrorCode(error.data.code);
    errorMessage = error.data.msg || ERROR_MESSAGES[errorCode];
  }
  // 其他错误
  else {
    errorMessage = error.message || error.msg || ERROR_MESSAGES[errorCode];
  }

  // 使用自定义消息
  if (opts.customMessage) {
    errorMessage = opts.customMessage;
  }

  // 记录错误日志
  if (opts.logError) {
    console.error('[ErrorHandler]', {
      errorCode,
      errorMessage,
      originalError: error,
    });
  }

  // 显示 Toast
  if (opts.showToaster) {
    Taro.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000,
    });
  }

  // 显示错误模态框
  if (opts.showErrorModal) {
    Taro.showModal({
      title: '提示',
      content: errorMessage,
      showCancel: false,
    });
  }

  // 跳转到登录页
  if (opts.redirectToLogin && (errorCode === ErrorCode.UNAUTHORIZED || errorCode === ErrorCode.TOKEN_EXPIRED)) {
    // 清除本地存储
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('user');

    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/login/index' });
    }, 1500);
  }
}

/**
 * 将后端 API 错误码映射到前端错误码
 */
function mapApiCodeToErrorCode(apiCode: number): ErrorCode {
  // 根据后端返回的 code 映射
  if (apiCode === 401) return ErrorCode.UNAUTHORIZED;
  if (apiCode === 403) return ErrorCode.PERMISSION_DENIED;
  if (apiCode === 404) return ErrorCode.RESOURCE_NOT_FOUND;
  if (apiCode === 500) return ErrorCode.SERVER_ERROR;
  return ErrorCode.OPERATION_FAILED;
}

/**
 * 网络请求错误处理器
 */
export function handleNetworkError(error: any): void {
  handleError(error, {
    showToaster: true,
    redirectToLogin: false,
  });
}

/**
 * 认证错误处理器
 */
export function handleAuthError(error: any): void {
  handleError(error, {
    showToaster: true,
    redirectToLogin: true,
  });
}

/**
 * 业务错误处理器
 */
export function handleBusinessError(error: any, customMessage?: string): void {
  handleError(error, {
    showToaster: true,
    showErrorModal: false,
    customMessage,
  });
}

/**
 * 获取友好的错误消息
 */
export function getErrorMessage(error: any): string {
  if (error.data?.msg) return error.data.msg;
  if (error.message) return error.message;
  if (error.errMsg) return error.errMsg;
  return ERROR_MESSAGES[ErrorCode.UNKNOWN];
}
