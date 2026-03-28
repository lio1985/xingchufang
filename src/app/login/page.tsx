'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, User, Eye, EyeOff, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // 修改密码相关状态
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    setChecking(true);
    
    const checkAuth = async () => {
      try {
        // 检查Cookie认证
        const res = await fetch('/api/auth', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.authenticated) {
          window.location.href = '/';
          return;
        }
      } catch (e) {
        // 忽略错误
      }
      setChecking(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('请输入账号和密码');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('[Login] Sending login request...');
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        }),
      });

      const data = await res.json();
      console.log('[Login] Response:', data);
      
      if (data.success) {
        // 保存token到localStorage（如果可用）
        if (typeof window !== 'undefined' && data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }
        console.log('[Login] Success! Redirecting to home...');
        // 登录成功，直接跳转到首页
        window.location.href = '/';
      } else {
        console.log('[Login] Failed:', data.error);
        setError(data.error || '登录失败');
        setLoading(false);
      }
    } catch (err) {
      console.error('[Login] Error:', err);
      setError('网络错误，请重试');
      setLoading(false);
    }
  };

  // 打开修改密码对话框
  const openPasswordDialog = () => {
    setPasswordForm({
      username: username || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setPasswordSuccess(false);
    setShowPasswordDialog(true);
  };

  // 修改密码
  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!passwordForm.username.trim()) {
      setPasswordError('请输入用户名');
      return;
    }
    if (!passwordForm.oldPassword.trim()) {
      setPasswordError('请输入原密码');
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      setPasswordError('请输入新密码');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码长度不能少于6位');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setPasswordLoading(true);
    
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: passwordForm.username,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setShowPasswordDialog(false);
          setPasswordSuccess(false);
        }, 1500);
      } else {
        setPasswordError(data.error || '修改失败');
      }
    } catch (err) {
      setPasswordError('网络错误，请重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

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
                    autoComplete="username"
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
                    autoComplete="current-password"
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

              {/* 修改密码入口 */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={openPasswordDialog}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  修改密码
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 修改密码对话框 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          
          {passwordSuccess ? (
            <div className="py-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-medium">密码修改成功！</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pwd-username">用户名</Label>
                <Input
                  id="pwd-username"
                  type="text"
                  placeholder="请输入用户名"
                  value={passwordForm.username}
                  onChange={(e) => setPasswordForm({ ...passwordForm, username: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="old-password">原密码</Label>
                <Input
                  id="old-password"
                  type="password"
                  placeholder="请输入原密码"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="请输入新密码（至少6位）"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="请再次输入新密码"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{passwordError}</p>
                </div>
              )}
            </div>
          )}

          {!passwordSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                取消
              </Button>
              <Button onClick={handleChangePassword} disabled={passwordLoading}>
                {passwordLoading ? '修改中...' : '确认修改'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
