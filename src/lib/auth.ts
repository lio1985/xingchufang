import { NextRequest, NextResponse } from 'next/server';

// 验证管理员权限
export function verifyAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token');
  return token?.value === 'authenticated';
}

// 权限错误响应
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: '未授权访问，请先登录' },
    { status: 401 }
  );
}
