import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { Network } from '@/network';
import { Lightbulb, User, Lock, Eye, EyeOff } from 'lucide-react-taro';
import './index.css';

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
        console.log('[登录] 执行跳转到首页');
        Taro.switchTab({ url: '/pages/index/index' });
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
    <View className="login-container">
      {/* 背景装饰 */}
      <View className="login-bg-decoration" />

      {/* Logo 区域 */}
      <View className="login-header">
        <View className="logo-row">
          <View className="logo-icon">
            <Lightbulb size={40} color="#000" />
          </View>
          <View className="logo-text-group">
            <Text className="logo-title">星厨房</Text>
            <Text className="logo-subtitle">STAR KITCHEN</Text>
          </View>
        </View>
        <Text className="login-welcome">欢迎回来，创作者</Text>
      </View>

      {/* 登录表单 */}
      <View className="login-form">
        {/* 账号输入 */}
        <View className="form-group">
          <Text className="form-label">账号</Text>
          <View className={`input-wrapper ${focusedField === 'username' ? 'input-wrapper-focused' : ''}`}>
            <User size={24} color="#71717a" className="input-icon" />
            <Input
              className="input-field"
              placeholder="请输入账号"
              placeholderStyle="color: #52525b"
              value={username}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>
        </View>

        {/* 密码输入 */}
        <View className="form-group">
          <Text className="form-label">密码</Text>
          <View className={`input-wrapper ${focusedField === 'password' ? 'input-wrapper-focused' : ''}`}>
            <Lock size={24} color="#71717a" className="input-icon" />
            <Input
              className="input-field"
              password={!showPassword}
              placeholder="请输入密码"
              placeholderStyle="color: #52525b"
              value={password}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onInput={(e) => setPassword(e.detail.value)}
            />
            <View
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={24} color="#f59e0b" />
              ) : (
                <Eye size={24} color="#f59e0b" />
              )}
            </View>
          </View>
        </View>

        {/* 忘记密码 */}
        <View className="forgot-password">
          <Text className="forgot-password-link" onClick={handleChangePassword}>
            忘记密码？
          </Text>
        </View>

        {/* 登录按钮 */}
        <View
          className={`login-btn ${loading ? 'login-btn-disabled' : ''}`}
          onClick={loading ? undefined : handleLogin}
        >
          <Text className={`login-btn-text ${loading ? 'login-btn-text-disabled' : ''}`}>
            {loading ? '登录中...' : '登录'}
          </Text>
        </View>

        {/* 注册入口 */}
        <View className="register-section">
          <Text className="register-text">还没有账号？</Text>
          <Text className="register-link" onClick={handleRegister}>
            立即注册
          </Text>
        </View>
      </View>

      {/* 底部版权 */}
      <View className="login-footer">
        <Text className="footer-text">星厨房 · 让创作更高效</Text>
      </View>
    </View>
  );
};

export default LoginPage;
