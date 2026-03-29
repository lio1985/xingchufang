import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要登录验证的路径
const publicPaths = ['/login', '/api/auth'];

// 仅管理员可访问的路径
const adminOnlyPaths = ['/admin'];

// 静态资源路径前缀
const staticPrefixes = ['/_next', '/favicon.ico', '/images', '/icons'];

// 静态资源文件扩展名
const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot'];

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

// 从Cookie中解析用户信息
const parseAuthFromCookies = (request: NextRequest): { authenticated: boolean; role: string } => {
  // 优先使用session cookie
  const sessionCookie = request.cookies.get('admin_session');
  if (sessionCookie?.value) {
    const decoded = safeBase64Decode(sessionCookie.value);
    const parts = decoded.split('|');
    if (parts.length >= 3 && parts[0] === 'authenticated') {
      return { authenticated: true, role: parts[2] };
    }
  }
  
  // 回退到旧的cookie格式
  const token = request.cookies.get('admin_token');
  const userCookie = request.cookies.get('admin_user');
  
  if (token?.value === 'authenticated' && userCookie?.value) {
    const decodedValue = safeBase64Decode(userCookie.value);
    const parts = decodedValue.split('|');
    if (parts.length >= 2) {
      return { authenticated: true, role: parts[1] };
    }
  }
  
  return { authenticated: false, role: 'unknown' };
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是公开路径
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // 检查是否是静态资源
  if (staticPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 检查是否是静态文件（根据扩展名）
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  // API路径允许通过（内部验证）
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 解析认证信息
  const auth = parseAuthFromCookies(request);
  const allCookies = request.cookies.getAll();
  
  // 调试日志
  console.log(`[Middleware] ${pathname} - authenticated: ${auth.authenticated}, role: ${auth.role}, cookies: [${allCookies.map(c => c.name).join(', ')}]`);

  if (!auth.authenticated) {
    // 未登录，重定向到登录页
    console.log(`[Middleware] Redirecting to login - no valid token`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 检查管理员权限
  const isAdminPath = adminOnlyPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (isAdminPath && auth.role !== 'admin') {
    console.log(`[Middleware] Access denied to ${pathname} - requires admin role`);
    // 非管理员访问管理页面，重定向到首页
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log(`[Middleware] Access granted to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
