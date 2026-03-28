import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要登录验证的路径
const publicPaths = ['/login', '/api/auth'];

// 静态资源路径前缀
const staticPrefixes = ['/_next', '/favicon.ico', '/images', '/icons'];

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

  // API路径允许通过（内部验证）
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 检查登录状态
  const token = request.cookies.get('admin_token');
  const userCookie = request.cookies.get('admin_user');
  const allCookies = request.cookies.getAll();
  
  // 调试日志 - 显示所有cookie
  console.log(`[Middleware] ${pathname} - token: ${token?.value || 'none'}, userCookie: ${userCookie?.value?.substring(0, 20) || 'none'}, all cookies: [${allCookies.map(c => c.name).join(', ')}]`);

  if (!token || token.value !== 'authenticated') {
    // 未登录，重定向到登录页
    console.log(`[Middleware] Redirecting to login - no valid token`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log(`[Middleware] Access granted to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
