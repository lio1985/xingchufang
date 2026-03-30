import { NextRequest, NextResponse } from 'next/server';

// 角色类型
export type UserRole = 'admin' | 'sales';

// 用户信息接口
export interface UserInfo {
  id?: number;
  username: string;
  role: UserRole;
}

// URL安全的Base64编码（去掉=填充，避免Cookie解析问题）
const safeBase64Encode = (str: string): string => {
  return Buffer.from(str).toString('base64').replace(/=/g, '');
};

// URL安全的Base64解码（自动补充=填充）
const safeBase64Decode = (str: string): string => {
  // 补充=填充
  const padding = str.length % 4;
  const paddedStr = padding ? str + '='.repeat(4 - padding) : str;
  return Buffer.from(paddedStr, 'base64').toString('utf-8');
};

// Cookie设置选项
const getCookieOptions = (request: NextRequest) => {
  // 检查原始请求是否通过HTTPS
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = request.headers.get('host') || '';
  
  // 判断是否HTTPS/生产环境：
  // 1. x-forwarded-proto 为 https
  // 2. 域名包含 .coze.site（生产环境）
  // 3. forwarded-host 包含 .coze.site
  // 4. 环境变量 COZE_PROJECT_ENV 为 PROD
  const isProduction = process.env.COZE_PROJECT_ENV === 'PROD';
  const isHttps = forwardedProto === 'https' 
    || host.includes('.coze.site') 
    || (forwardedHost?.includes('.coze.site') ?? false)
    || isProduction;
  
  console.log('[Auth] Cookie settings - forwardedProto:', forwardedProto, 'forwardedHost:', forwardedHost, 'host:', host, 'isProduction:', isProduction, 'isHttps:', isHttps);
  
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
    
    // 尝试从数据库验证
    try {
      const { getSupabaseClient } = await import('@/storage/database/supabase-client');
      const client = getSupabaseClient();
      
      const { data: dbUser, error: dbError } = await client
        .from('admin_users')
        .select('id, username, password_hash, role, status')
        .eq('username', username)
        .single();
      
      if (!dbError && dbUser && dbUser.password_hash === password) {
        // 检查用户状态
        if (dbUser.status === 'disabled') {
          return NextResponse.json(
            { success: false, error: '该账号已被禁用，请联系管理员' },
            { status: 403 }
          );
        }
        
        const userInfo: UserInfo = {
          id: dbUser.id,
          username: dbUser.username,
          role: dbUser.role as UserRole,
        };
        
        // 更新最后登录时间
        await client
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', dbUser.id);
        
        return createAuthResponse(request, userInfo);
      }
    } catch (dbErr) {
      console.log('[Auth] Database auth failed, falling back to env vars:', dbErr);
    }
    
    // 回退到环境变量验证
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
      
      return createAuthResponse(request, userInfo);
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

// 创建认证响应
function createAuthResponse(request: NextRequest, userInfo: UserInfo) {
  // 用户信息使用URL安全的Base64编码（去掉=填充）
  // 格式: userId|username|role
  const userValue = safeBase64Encode(`${userInfo.id || 0}|${userInfo.username}|${userInfo.role}`);
  
  // 获取Cookie选项
  const cookieOptions = getCookieOptions(request);
  
  console.log('[Auth] Cookie settings:', JSON.stringify(cookieOptions));
  console.log('[Auth] User value:', userValue);
  
  // 创建响应
  const response = NextResponse.json({ 
    success: true,
    user: userInfo,
  });
  
  // 设置Cookie - 将用户信息也编码到token中，确保不会丢失
  // 格式: authenticated|userId|username|role (Base64编码)
  const tokenValue = safeBase64Encode(`authenticated|${userInfo.id || 0}|${userInfo.username}|${userInfo.role}`);
  
  response.cookies.set('admin_session', tokenValue, cookieOptions);
  // 同时设置兼容的旧Cookie
  response.cookies.set('admin_token', 'authenticated', cookieOptions);
  response.cookies.set('admin_user', userValue, cookieOptions);
  
  // 验证Cookie是否设置成功
  const setCookies = response.headers.getSetCookie();
  console.log('[Auth] Set-Cookie headers:', setCookies);
  
  return response;
}

// 检查登录状态
export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin_session');
  const token = request.cookies.get('admin_token');
  const userCookie = request.cookies.get('admin_user');
  
  console.log('[Auth GET] Cookies - session:', sessionCookie?.value ? 'exists' : 'none', 'token:', token?.value, 'userCookie:', userCookie?.value ? 'exists' : 'none');
  
  let user: UserInfo | null = null;
  
  // 优先使用新的session cookie
  if (sessionCookie?.value) {
    try {
      const decodedValue = safeBase64Decode(sessionCookie.value);
      const parts = decodedValue.split('|');
      // 支持新格式: authenticated|userId|username|role
      if (parts.length >= 4 && parts[0] === 'authenticated') {
        user = { id: parseInt(parts[1]) || undefined, username: parts[2], role: parts[3] as UserRole };
        console.log('[Auth GET] Session cookie authenticated:', user.username, 'id:', user.id, 'role:', user.role);
      }
      // 兼容旧格式: authenticated|username|role
      else if (parts.length >= 3 && parts[0] === 'authenticated') {
        user = { username: parts[1], role: parts[2] as UserRole };
        console.log('[Auth GET] Session cookie authenticated (legacy):', user.username, 'role:', user.role);
      }
    } catch (e) {
      console.error('[Auth GET] Failed to parse session cookie:', e);
    }
  }
  
  // 回退到旧的cookie格式
  if (!user && token?.value === 'authenticated' && userCookie?.value) {
    try {
      // 解析URL安全的Base64编码的用户信息
      const decodedValue = safeBase64Decode(userCookie.value);
      console.log('[Auth GET] Decoded user value:', decodedValue);
      
      const parts = decodedValue.split('|');
      // 支持格式: userId|username|role 或 username|role
      if (parts.length >= 3) {
        const potentialId = parseInt(parts[0]);
        if (!isNaN(potentialId)) {
          user = { id: potentialId, username: parts[1], role: parts[2] as UserRole };
        } else {
          user = { username: parts[0], role: parts[1] as UserRole };
        }
      } else if (parts.length === 2) {
        user = { username: parts[0], role: parts[1] as UserRole };
      }
      
      if (user) {
        console.log('[Auth GET] Authenticated user from old cookie:', user.username, 'role:', user.role);
      }
    } catch (e) {
      console.error('[Auth GET] Failed to parse user cookie:', e);
    }
  }
  
  // 如果用户已认证但没有 id，从数据库查询
  if (user && !user.id) {
    try {
      const { getSupabaseClient } = await import('@/storage/database/supabase-client');
      const client = getSupabaseClient();
      
      const { data: dbUser, error } = await client
        .from('admin_users')
        .select('id, status')
        .eq('username', user.username)
        .single();
      
      if (!error && dbUser) {
        // 检查用户状态
        if (dbUser.status === 'disabled') {
          console.log('[Auth GET] User is disabled:', user.username);
          return NextResponse.json({
            authenticated: false,
            user: null,
          });
        }
        user.id = dbUser.id;
        console.log('[Auth GET] Fetched user id from database:', user.id, 'for user:', user.username);
      } else {
        console.log('[Auth GET] Failed to fetch user id from database:', error);
      }
    } catch (e) {
      console.error('[Auth GET] Database query error:', e);
    }
  }
  
  if (user) {
    return NextResponse.json({
      authenticated: true,
      user,
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
  
  // 清除所有Cookie
  response.cookies.set('admin_session', '', cookieOptions);
  response.cookies.set('admin_token', '', cookieOptions);
  response.cookies.set('admin_user', '', cookieOptions);
  
  return response;
}
