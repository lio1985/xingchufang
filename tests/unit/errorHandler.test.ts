/**
 * 单元测试 - 错误处理工具
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ErrorCode,
  handleError,
  handleNetworkError,
  handleAuthError,
  handleBusinessError,
  getErrorMessage,
  mapApiCodeToErrorCode,
} from '../src/utils/errorHandler';

// Mock Taro
const mockTaro = {
  showToast: jest.fn(),
  showModal: jest.fn(),
  removeStorageSync: jest.fn(),
  reLaunch: jest.fn(),
};

global.Taro = mockTaro as any;

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ErrorCode', () => {
    it('should have correct error codes', () => {
      expect(ErrorCode.NETWORK_ERROR).toBe(1000);
      expect(ErrorCode.UNAUTHORIZED).toBe(2000);
      expect(ErrorCode.USER_DISABLED).toBe(3001);
      expect(ErrorCode.PERMISSION_DENIED).toBe(4000);
      expect(ErrorCode.INVALID_PARAM).toBe(5000);
    });
  });

  describe('handleError', () => {
    it('should handle network error with status code 401', () => {
      const error = {
        statusCode: 401,
        data: { msg: 'Unauthorized' },
      };

      handleError(error);

      expect(mockTaro.showToast).toHaveBeenCalledWith({
        title: '未授权，请重新登录',
        icon: 'none',
        duration: 2000,
      });
    });

    it('should handle network error with status code 404', () => {
      const error = {
        statusCode: 404,
        data: { msg: 'Not Found' },
      };

      handleError(error);

      expect(mockTaro.showToast).toHaveBeenCalledWith({
        title: '资源不存在',
        icon: 'none',
        duration: 2000,
      });
    });

    it('should handle network error with custom message', () => {
      const error = {
        statusCode: 500,
      };

      handleError(error, { customMessage: '自定义错误消息' });

      expect(mockTaro.showToast).toHaveBeenCalledWith({
        title: '自定义错误消息',
        icon: 'none',
        duration: 2000,
      });
    });

    it('should redirect to login page for auth errors', () => {
      const error = {
        statusCode: 401,
        data: { msg: 'Token expired' },
      };

      handleError(error, { redirectToLogin: true });

      expect(mockTaro.removeStorageSync).toHaveBeenCalledWith('token');
      expect(mockTaro.removeStorageSync).toHaveBeenCalledWith('user');
      expect(mockTaro.reLaunch).toHaveBeenCalled();
    });
  });

  describe('handleNetworkError', () => {
    it('should handle network failure error', () => {
      const error = {
        errMsg: 'request:fail timeout',
      };

      handleNetworkError(error);

      expect(mockTaro.showToast).toHaveBeenCalledWith({
        title: '网络连接失败，请检查网络后重试',
        icon: 'none',
        duration: 2000,
      });
    });
  });

  describe('handleAuthError', () => {
    it('should handle auth error and redirect to login', () => {
      const error = {
        statusCode: 401,
        data: { msg: 'Token expired' },
      };

      handleAuthError(error);

      expect(mockTaro.showToast).toHaveBeenCalled();
      expect(mockTaro.removeStorageSync).toHaveBeenCalledWith('token');
      expect(mockTaro.reLaunch).toHaveBeenCalled();
    });
  });

  describe('handleBusinessError', () => {
    it('should handle business error with custom message', () => {
      const error = {
        data: { code: 5000, msg: 'Invalid parameter' },
      };

      handleBusinessError(error, '参数错误');

      expect(mockTaro.showToast).toHaveBeenCalledWith({
        title: '参数错误',
        icon: 'none',
        duration: 2000,
      });
    });
  });

  describe('getErrorMessage', () => {
    it('should return error message from error.data.msg', () => {
      const error = {
        data: { msg: 'Test error message' },
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Test error message');
    });

    it('should return error message from error.message', () => {
      const error = {
        message: 'Test message',
      };

      const message = getErrorMessage(error);
      expect(message).toBe('Test message');
    });

    it('should return default error message', () => {
      const error = {};

      const message = getErrorMessage(error);
      expect(message).toBe('发生未知错误，请稍后重试');
    });
  });

  describe('mapApiCodeToErrorCode', () => {
    it('should map API code 401 to UNAUTHORIZED', () => {
      const errorCode = mapApiCodeToErrorCode(401);
      expect(errorCode).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('should map API code 403 to PERMISSION_DENIED', () => {
      const errorCode = mapApiCodeToErrorCode(403);
      expect(errorCode).toBe(ErrorCode.PERMISSION_DENIED);
    });

    it('should map unknown API code to OPERATION_FAILED', () => {
      const errorCode = mapApiCodeToErrorCode(999);
      expect(errorCode).toBe(ErrorCode.OPERATION_FAILED);
    });
  });
});
