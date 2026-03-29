import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { Network } from '@/network';
import { Lightbulb, User, Lock, Eye, EyeOff } from 'lucide-react-taro';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({
        title: '请输入账号和密码',
        icon: 'none',
      });
      return;
    }

    setLoading(true);

    const formData = {
      username: username.trim(),
      password: password.trim(),
    };

    const loginUrl = '/api/user/login-with-password';

    console.log('登录表单数据=', formData);
    console.log('最终登录接口地址=', loginUrl);

    try {
      console.log('[登录] 发送请求到:', loginUrl);
      const res = await Network.request({
        url: loginUrl,
        method: 'POST',
        data: formData,
      });

      console.log('登录接口返回=', res);

      if (res.statusCode !== 200) {
        throw new Error(`请求失败，状态码: ${res.statusCode}`);
      }

      const responseData = res.data;
      if (!responseData) {
        throw new Error('服务器未返回响应数据');
      }

      console.log('[登录] 响应数据:', responseData);

      if (responseData.code !== 200) {
        throw new Error(responseData.msg || responseData.message || '登录失败');
      }

      if (!responseData.data) {
        throw new Error('登录成功但未返回数据');
      }

      const { user, token } = responseData.data;
      console.log('接口返回token=', token);

      if (!token) {
        throw new Error('登录成功但未返回 token');
      }

      Taro.setStorageSync('token', token);
      console.log('[登录] Token 已存储到缓存');

      const savedToken = Taro.getStorageSync('token');
      console.log('本地缓存token=', savedToken);

      if (!savedToken) {
        throw new Error('Token 存储失败');
      }

      console.log('[登录] 存储用户信息到缓存');
      Taro.setStorageSync('user', user);
      console.log('[登录] 用户信息已存储');

      console.log('[登录] 登录成功，准备跳转');
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000,
      });

      setTimeout(() => {
        console.log('[登录] 执行跳转到我的页面');
        Taro.switchTab({ url: '/pages/tab-profile/index' });
      }, 500);
    } catch (error: any) {
      console.error('登录接口异常=', error);

      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 3000,
      });
    } finally {
      console.log('[登录] 设置 loading = false');
      setLoading(false);
    }
  };

  const handleRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' });
  };

  const handleChangePassword = () => {
    Taro.navigateTo({ url: '/pages/change-password/index' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 背景装饰 - 顶部光晕 */}
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '500px', 
        background: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none' 
      }}
      />

      {/* 主内容区 */}
      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Logo 区域 */}
        <View style={{ paddingTop: '80px', marginBottom: '48px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <View style={{ 
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(56, 189, 248, 0.3)'
            }}
            >
              <Lightbulb size={32} color="#fff" />
            </View>
            <View style={{ display: 'flex', flexDirection: 'column' }}>
              <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.02em' }}>星厨房</Text>
              <Text style={{ fontSize: '12px', color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Star Kitchen</Text>
            </View>
          </View>
          <Text style={{ fontSize: '16px', color: '#94a3b8', marginTop: '24px' }}>欢迎回来，创作者</Text>
        </View>

        {/* 登录表单 */}
        <View style={{ flex: 1 }}>
          {/* 账号输入 */}
          <View style={{ marginBottom: '20px' }}>
            <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block', fontWeight: '500' }}>账号</Text>
            <View style={{ 
              backgroundColor: '#111827', 
              borderRadius: '12px', 
              border: focusedField === 'username' ? '2px solid #38bdf8' : '1px solid #1e3a5f', 
              padding: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            >
              <User size={20} color={focusedField === 'username' ? '#38bdf8' : '#64748b'} style={{ flexShrink: 0 }} />
              <Input
                style={{ flex: 1, fontSize: '16px', color: '#f1f5f9', backgroundColor: 'transparent' }}
                placeholder="请输入账号"
                placeholderStyle="color: #64748b"
                value={username}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>
          </View>

          {/* 密码输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block', fontWeight: '500' }}>密码</Text>
            <View style={{ 
              backgroundColor: '#111827', 
              borderRadius: '12px', 
              border: focusedField === 'password' ? '2px solid #38bdf8' : '1px solid #1e3a5f', 
              padding: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            >
              <Lock size={20} color={focusedField === 'password' ? '#38bdf8' : '#64748b'} style={{ flexShrink: 0 }} />
              <Input
                style={{ flex: 1, fontSize: '16px', color: '#f1f5f9', backgroundColor: 'transparent' }}
                password={!showPassword}
                placeholder="请输入密码"
                placeholderStyle="color: #64748b"
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onInput={(e) => setPassword(e.detail.value)}
              />
              <View
                style={{ padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#38bdf8" />
                ) : (
                  <Eye size={20} color="#64748b" />
                )}
              </View>
            </View>
          </View>

          {/* 修改密码 */}
          <View style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <Text style={{ fontSize: '14px', color: '#64748b' }} onClick={handleChangePassword}>
              修改密码
            </Text>
          </View>

          {/* 登录按钮 */}
          <View
            style={{ 
              backgroundColor: loading ? '#1e3a5f' : '#38bdf8', 
              borderRadius: '12px', 
              padding: '16px', 
              textAlign: 'center', 
              marginBottom: '24px',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(56, 189, 248, 0.3)'
            }}
            onClick={loading ? undefined : handleLogin}
          >
            <Text style={{ fontSize: '16px', fontWeight: '600', color: loading ? '#64748b' : '#0c4a6e' }}>
              {loading ? '登录中...' : '登录'}
            </Text>
          </View>

          {/* 注册入口 */}
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '14px', color: '#64748b' }}>还没有账号？</Text>
            <Text style={{ fontSize: '14px', color: '#38bdf8', fontWeight: '500' }} onClick={handleRegister}>
              立即注册
            </Text>
          </View>
        </View>

        {/* 底部版权 */}
        <View style={{ padding: '32px 0', textAlign: 'center' }}>
          <Text style={{ fontSize: '12px', color: '#334155' }}>星厨房 · 让创作更高效</Text>
        </View>
      </View>
    </View>
  );
};

export default LoginPage;
