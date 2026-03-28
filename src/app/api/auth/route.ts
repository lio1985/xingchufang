import { NextRequest, NextResponse } from 'next/server';

// 登录验证
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // 从环境变量获取管理员账号密码
    // 支持多个账号，格式: username1:password1,username2:password2
    const adminCredentials = process.env.ADMIN_CREDENTIALS || 'admin:admin123';
    const adminPassword = process.env.ADMIN_PASSWORD; // 兼容旧配置
    
    // 解析账号密码列表
    const credentials = new Map<string, string>();
    
    // 解析新格式 ADMIN_CREDENTIALS
    adminCredentials.split(',').forEach(cred => {
      const [user, pass] = cred.trim().split(':');
      if (user && pass) {
        credentials.set(user, pass);
      }
    });
    
    // 验证账号密码
    let isValid = false;
    
    if (username && password) {
      // 账号密码模式
      const expectedPassword = credentials.get(username);
      isValid = expectedPassword === password;
    } else if (password && !username) {
      // 兼容旧模式：仅密码验证（使用第一个账号的密码或ADMIN_PASSWORD）
      const firstPassword = credentials.values().next().value;
      isValid = password === firstPassword || password === adminPassword;
    }
    
    if (isValid) {
      // 创建响应并设置 cookie
      const response = NextResponse.json({ 
        success: true,
        user: username || 'admin'
      });
      response.cookies.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7天
      });
      response.cookies.set('admin_user', username || 'admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7天
      });
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: '账号或密码错误' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 检查登录状态
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token');
  const user = request.cookies.get('admin_user');
  return NextResponse.json({
    authenticated: token?.value === 'authenticated',
    user: user?.value || null,
  });
}

// 登出
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  response.cookies.delete('admin_user');
  return response;
}
