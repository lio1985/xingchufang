'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, User, Eye, EyeOff, Shield, Eye as EyeIcon } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated) {
          router.push(redirect);
        }
      } catch (err) {
        // 忽略错误
      }
    };
    checkAuth();
  }, [router, redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        // 使用硬导航确保cookie生效
        window.location.href = redirect;
      } else {
        setError(data.error || '登录失败');
        setLoading(false);
      }
    } catch (err) {
      setError('登录失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <span className="text-3xl md:text-4xl">⭐</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">星厨房商品库</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1 md:mt-2">内部管理系统 · 需要登录访问</p>
        </div>

        {/* 登录卡片 */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl text-center">账号登录</CardTitle>
            <CardDescription className="text-center text-sm">
              请输入您的账号和密码
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="username" className="text-sm">账号</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入账号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-10 md:h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="password" className="text-sm">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 md:h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs md:text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-10 md:h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    登录中...
                  </span>
                ) : '登录'}
              </Button>
            </form>

            {/* 账号提示 */}
            <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
              {/* 管理员账号 */}
              <div className="p-2.5 md:p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                  <span className="text-xs md:text-sm font-medium text-blue-800">管理员（采购负责人）</span>
                </div>
                <p className="text-xs md:text-sm text-blue-700">
                  账号：<code className="px-1 md:px-1.5 py-0.5 bg-blue-100 rounded text-blue-800 text-xs">admin</code>
                  {' / '}
                  密码：<code className="px-1 md:px-1.5 py-0.5 bg-blue-100 rounded text-blue-800 text-xs">admin123</code>
                </p>
                <p className="text-[10px] md:text-xs text-blue-500 mt-1">可编辑、删除、更新、添加商品</p>
              </div>

              {/* 销售账号 */}
              <div className="p-2.5 md:p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <EyeIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
                  <span className="text-xs md:text-sm font-medium text-green-800">销售</span>
                </div>
                <p className="text-xs md:text-sm text-green-700">
                  账号：<code className="px-1 md:px-1.5 py-0.5 bg-green-100 rounded text-green-800 text-xs">sales</code>
                  {' / '}
                  密码：<code className="px-1 md:px-1.5 py-0.5 bg-green-100 rounded text-green-800 text-xs">sales123</code>
                </p>
                <p className="text-[10px] md:text-xs text-green-500 mt-1">仅可浏览商品，无法修改</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部信息 */}
        <p className="text-center text-xs md:text-sm text-gray-400 mt-4 md:mt-6">
          © 2024 星厨房商品库管理系统
        </p>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <p className="text-gray-500">加载中...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
