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
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          window.location.href = redirect;
        }
      })
      .catch(() => {});
  }, [redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('请输入账号和密码');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();
      
      if (data.success) {
        // 直接跳转到首页
        window.location.href = '/';
      } else {
        setError(data.error || '登录失败');
        setLoading(false);
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('网络错误，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-3">
            <span className="text-3xl">⭐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">星厨房商品库</h1>
          <p className="text-gray-500 text-sm mt-1">内部管理系统</p>
        </div>

        {/* 登录卡片 */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg text-center">账号登录</CardTitle>
            <CardDescription className="text-center text-sm">
              请输入您的账号和密码
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">账号</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入账号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-10 bg-gradient-to-r from-blue-500 to-indigo-600" 
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>

            {/* 账号提示 */}
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">管理员（采购负责人）</span>
                </div>
                <p className="text-sm text-blue-700">
                  账号：<code className="px-1 bg-blue-100 rounded text-blue-800">admin</code>
                  {' / '}
                  密码：<code className="px-1 bg-blue-100 rounded text-blue-800">admin123</code>
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <EyeIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">销售</span>
                </div>
                <p className="text-sm text-green-700">
                  账号：<code className="px-1 bg-green-100 rounded text-green-800">sales</code>
                  {' / '}
                  密码：<code className="px-1 bg-green-100 rounded text-green-800">sales123</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2024 星厨房商品库
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
