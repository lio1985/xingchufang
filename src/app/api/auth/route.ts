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
  // 判断是否HTTPS：检查x-forwarded-proto或域名
  const isHttps = forwardedProto === 'https' || host.includes('.coze.site');
  
  console.log('[Auth] Cookie settings - forwardedProto:', forwardedProto, 'host:', host, 'isHttps:', isHttps);
  
  return {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7天
    httpOnly: true,
    secure: isHttps, // 仅当原始请求是HTTPS时才设置Secure
    sameSite: 'lax' as const,
    // 不设置domain，让浏览器自动使用当前域名
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
      
      // 用户信息使用Base64编码，确保特殊字符不会导致问题
      const userValue = Buffer.from(`${userInfo.username}|${userInfo.role}`).toString('base64');
      
      console.log('[Auth] Setting cookies - token: authenticated, user:', userValue, 'options:', JSON.stringify(cookieOptions));
      
      response.cookies.set('admin_token', 'authenticated', cookieOptions);
      response.cookies.set('admin_user', userValue, cookieOptions);
      
      // 验证Cookie是否设置成功
      const setCookies = response.headers.getSetCookie();
      console.log('[Auth] Set-Cookie headers:', setCookies);
      
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
  
  console.log('[Auth GET] Cookies - token:', token?.value, 'userCookie:', userCookie?.value ? 'exists' : 'none');
  
  // 必须同时有token和userCookie才认证通过
  if (token?.value === 'authenticated' && userCookie?.value) {
    try {
      // 解析Base64编码的用户信息
      const decodedValue = Buffer.from(userCookie.value, 'base64').toString('utf-8');
      console.log('[Auth GET] Decoded user value:', decodedValue);
      
      const [username, role] = decodedValue.split('|');
      if (username && role) {
        const user = { username, role } as UserInfo;
        console.log('[Auth GET] Authenticated user:', username, 'role:', role);
        return NextResponse.json({
          authenticated: true,
          user,
        });
      }
    } catch (e) {
      console.error('[Auth GET] Failed to parse user cookie:', e);
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
