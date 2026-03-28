import { NextRequest, NextResponse } from 'next/server';

// 角色类型
export type UserRole = 'admin' | 'sales';

// 用户信息接口
export interface UserInfo {
  username: string;
  role: UserRole;
}

// 权限检查结果
export interface AuthResult {
  authenticated: boolean;
  user: UserInfo | null;
  isAdmin: boolean;
}

// URL安全的Base64解码
const safeBase64Decode = (str: string): string => {
  try {
    const padding = str.length % 4;
    const paddedStr = padding ? str + '='.repeat(4 - padding) : str;
    return Buffer.from(paddedStr, 'base64').toString('utf-8');
  } catch {
    return '';
  }
};

/**
 * 从请求中获取当前用户信息和权限状态
 */
export function getAuthFromRequest(request: NextRequest): AuthResult {
  const token = request.cookies.get('admin_token');
  const userCookie = request.cookies.get('admin_user');
  
  if (token?.value === 'authenticated' && userCookie?.value) {
    try {
      // 解析URL安全的Base64编码的用户信息
      const decodedValue = safeBase64Decode(userCookie.value);
      const [username, role] = decodedValue.split('|');
      
      if (username && role) {
        const user: UserInfo = { username, role: role as UserRole };
        return {
          authenticated: true,
          user,
          isAdmin: user.role === 'admin',
        };
      }
    } catch {
      // 解析失败
    }
  }
  
  return {
    authenticated: false,
    user: null,
    isAdmin: false,
  };
}

/**
 * 检查用户是否有管理员权限
 */
export function requireAdmin(request: NextRequest): { authorized: boolean; user: UserInfo | null; error?: string } {
  const auth = getAuthFromRequest(request);
  
  if (!auth.authenticated) {
    return { authorized: false, user: null, error: '请先登录' };
  }
  
  if (!auth.isAdmin) {
    return { authorized: false, user: auth.user, error: '权限不足，此操作需要管理员权限' };
  }
  
  return { authorized: true, user: auth.user };
}

/**
 * 检查用户是否已登录（任何角色都可以）
 */
export function requireAuth(request: NextRequest): { authorized: boolean; user: UserInfo | null; error?: string } {
  const auth = getAuthFromRequest(request);
  
  if (!auth.authenticated) {
    return { authorized: false, user: null, error: '请先登录' };
  }
  
  return { authorized: true, user: auth.user };
}

/**
 * 简单验证是否为管理员（用于API快速检查）
 */
export function verifyAdmin(request: NextRequest): boolean {
  const auth = getAuthFromRequest(request);
  return auth.isAdmin;
}

/**
 * 返回未授权响应
 */
export function unauthorizedResponse(message: string = '权限不足，此操作需要管理员权限'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}
