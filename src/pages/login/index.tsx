import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { Network } from '@/network';
import './index.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }

    setLoading(true);

    const formData = {
      username: username.trim(),
      password: password.trim()
    };

    const loginUrl = '/api/user/login-with-password';

    console.log('登录表单数据=', formData);
    console.log('最终登录接口地址=', loginUrl);

    try {
      console.log('[登录] 发送请求到:', loginUrl);
      const res = await Network.request({
        url: loginUrl,
        method: 'POST',
        data: formData
      });

      console.log('登录接口返回=', res);

      // 检查响应状态码
      if (res.statusCode !== 200) {
        throw new Error(`请求失败，状态码: ${res.statusCode}`);
      }

      // 检查响应体
      const responseData = res.data;
      if (!responseData) {
        throw new Error('服务器未返回响应数据');
      }

      console.log('[登录] 响应数据:', responseData);

      // 统一成功判断：检查 success 和 code 字段
      if (!responseData.success || responseData.code !== 200) {
        throw new Error(responseData.msg || responseData.message || '登录失败');
      }

      // 检查 data 字段
      if (!responseData.data) {
        throw new Error('登录成功但未返回数据');
      }

      const { user, token } = responseData.data;
      console.log('接口返回token=', token);

      if (!token) {
        throw new Error('登录成功但未返回 token');
      }

      // 2）取出 token
      console.log('[登录] 开始存储 token 到缓存');

      // 3）写入本地缓存（统一使用 Taro.setStorageSync）
      Taro.setStorageSync('token', token);
      console.log('[登录] Token 已存储到缓存');

      // 验证 token 是否成功存储
      const savedToken = Taro.getStorageSync('token');
      console.log('本地缓存token=', savedToken);

      if (!savedToken) {
        throw new Error('Token 存储失败');
      }

      // 存储用户信息
      console.log('[登录] 存储用户信息到缓存');
      Taro.setStorageSync('user', user);
      console.log('[登录] 用户信息已存储');

      // 打印所有缓存
      const allStorage = Taro.getStorageInfoSync();
      console.log('[登录] 当前所有缓存键:', allStorage.keys);

      // 显示成功提示
      console.log('[登录] 登录成功，准备跳转');
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      });

      // 4）延迟跳转，确保缓存写入完成
      setTimeout(() => {
        console.log('[登录] 执行跳转到首页');
        // 5）再执行页面跳转
        Taro.switchTab({ url: '/pages/index/index' });
      }, 500);

    } catch (error: any) {
      console.error('登录接口异常=', error);
      console.error('[登录] 错误类型:', typeof error);
      console.error('[登录] 错误信息:', error.message);
      console.error('[登录] 错误堆栈:', error.stack);

      // 检查当前缓存
      const currentToken = Taro.getStorageSync('token');
      console.log('失败时的当前 token:', currentToken);

      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 3000
      });
    } finally {
      console.log('[登录] 设置 loading = false');
      setLoading(false);
    }
  };

  return (
    <View className="login-page">
      <View className="login-container">
        {/* Logo 区域 */}
        <View className="logo-section">
          <View className="logo-box">
            <View className="logo-content">
              <View className="logo-icon">👨‍🍳</View>
              <View className="logo-text-wrapper">
                <Text className="block logo-title">星厨房</Text>
                <Text className="block logo-subtitle">Star Kitchen</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 登录表单 */}
        <View className="form-section">
          <View className="input-group">
            <Input
              className="input"
              placeholder="请输入账号"
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
              placeholderClass="input-placeholder"
            />
          </View>

          <View className="input-group password-group">
            <Input
              className="input"
              password={!showPassword}
              placeholder="请输入密码"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
              placeholderClass="input-placeholder"
            />
            <Text
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '隐藏密码' : '显示密码'}
            </Text>
          </View>

          <Button
            className={`login-button ${loading ? 'loading' : ''}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <View className="footer-links">
            <Text
              className="block footer-link"
              onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}
            >
              注册账号
            </Text>
            <Text className="block footer-divider">|</Text>
            <Text
              className="block footer-link"
              onClick={() => Taro.navigateTo({ url: '/pages/change-password/index' })}
            >
              修改密码
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginPage;
