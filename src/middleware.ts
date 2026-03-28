import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要登录验证的路径
const publicPaths = [
  '/login',
  '/api/auth',
];

// 静态资源路径前缀
const staticPrefixes = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/icons',
];

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

  // 检查是否是API路径（除了需要保护的API）
  if (pathname.startsWith('/api/')) {
    // API路径通过token验证
    return NextResponse.next();
  }

  // 检查登录状态
  const token = request.cookies.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    // 未登录，重定向到登录页
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
