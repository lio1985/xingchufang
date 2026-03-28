import { NextRequest, NextResponse } from 'next/server';

// 角色类型
export type UserRole = 'admin' | 'sales';

// 用户信息接口
export interface UserInfo {
  username: string;
  role: UserRole;
}

// Cookie设置选项
const getCookieOptions = (request: NextRequest) => {
  // 检查原始请求是否通过HTTPS
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host') || '';
  const isHttps = forwardedProto === 'https' || host.includes('.coze.site');
  
  console.log('[Auth] Cookie settings - forwardedProto:', forwardedProto, 'host:', host, 'isHttps:', isHttps);
  
  return {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7天
    httpOnly: true,
    secure: isHttps, // 仅当原始请求是HTTPS时才设置Secure
    sameSite: 'lax' as const,
  };
};

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
      
      // 设置Cookie
      const cookieOptions = getCookieOptions(request);
      response.cookies.set('admin_token', 'authenticated', cookieOptions);
      response.cookies.set('admin_user', JSON.stringify(userInfo), cookieOptions);
      
      // 调试：检查设置后的cookie
      console.log('[Auth POST] Cookies set:', response.cookies.getAll().map(c => ({ name: c.name, value: c.value?.substring(0, 30) })));
      
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
  
  // 调试日志
  console.log('[Auth GET] token:', token?.value, 'userCookie exists:', !!userCookie);
  console.log('[Auth GET] all cookies:', request.cookies.getAll().map(c => c.name));
  
  // 只要token认证通过即可
  if (token?.value === 'authenticated') {
    // 如果有用户信息cookie，使用它
    if (userCookie?.value) {
      try {
        const user = JSON.parse(userCookie.value) as UserInfo;
        return NextResponse.json({
          authenticated: true,
          user,
        });
      } catch {
        // 解析失败，使用默认用户
      }
    }
    
    // 没有用户信息，返回默认管理员用户
    return NextResponse.json({
      authenticated: true,
      user: { username: 'admin', role: 'admin' } as UserInfo,
    });
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
