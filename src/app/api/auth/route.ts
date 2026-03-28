import { NextRequest, NextResponse } from 'next/server';

// 角色类型
export type UserRole = 'admin' | 'sales';

// 用户信息接口
export interface UserInfo {
  username: string;
  role: UserRole;
}

// 登录验证
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '请输入账号和密码' },
        { status: 400 }
      );
    }
    
    // 从环境变量获取用户配置
    const userCredentials = process.env.USER_CREDENTIALS || 'admin:admin123:admin,sales:sales123:sales';
    
    // 解析用户列表
    const users = new Map<string, { password: string; role: UserRole }>();
    
    userCredentials.split(',').forEach(cred => {
      const parts = cred.trim().split(':');
      if (parts.length >= 2) {
        const [user, pass, role] = parts;
        if (user && pass) {
          users.set(user, {
            password: pass,
            role: (role as UserRole) || 'sales',
          });
        }
      }
    });
    
    // 验证账号密码
    const userConfig = users.get(username);
    
    if (userConfig && userConfig.password === password) {
      const userInfo: UserInfo = {
        username,
        role: userConfig.role,
      };
      
      // 创建响应
      const response = NextResponse.json({ 
        success: true,
        user: userInfo,
      });
      
      // 设置 cookie
      // 检查原始请求是否通过HTTPS（代理环境）
      const forwardedProto = request.headers.get('x-forwarded-proto');
      const isSecureRequest = forwardedProto === 'https' || 
                              request.nextUrl.protocol === 'https:' ||
                              process.env.COZE_PROJECT_ENV === 'PROD';
      
      const cookieOptions = {
        httpOnly: true,
        secure: isSecureRequest, // HTTPS请求使用secure
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7天
      };
      
      response.cookies.set('admin_token', 'authenticated', cookieOptions);
      response.cookies.set('admin_user', JSON.stringify(userInfo), cookieOptions);
      
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
      { success: false, error: '登录失败，请重试' },
      { status: 500 }
    );
  }
}

// 检查登录状态
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token');
  const userCookie = request.cookies.get('admin_user');
  
  if (token?.value === 'authenticated' && userCookie?.value) {
    try {
      const user = JSON.parse(userCookie.value) as UserInfo;
      return NextResponse.json({
        authenticated: true,
        user,
      });
    } catch {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }
  }
  
  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}

// 登出
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  const cookieOptions = {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  };
  
  response.cookies.set('admin_token', '', cookieOptions);
  response.cookies.set('admin_user', '', cookieOptions);
  
  return response;
}
