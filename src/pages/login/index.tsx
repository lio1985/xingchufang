import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { Network } from '@/network';
import './index.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Taro.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    setLoading(true);

    const formData = {
      username,
      password
    };

    console.log('[登录] 开始登录流程', {
      formData,
      url: '/api/user/login'
    });

    try {
      console.log('[登录] 发送请求到:', '/api/user/login');
      const response = await Network.request({
        url: '/api/user/login',
        method: 'POST',
        data: formData
      });

      console.log('[登录] 收到完整响应对象:', response);
      console.log('[登录] 响应状态码:', response.statusCode);
      console.log('[登录] 响应体 (response.data):', response.data);

      // 检查响应结构
      if (!response.data) {
        throw new Error('服务器未返回响应数据');
      }

      const responseData = response.data;
      console.log('[登录] 解析响应数据:', responseData);

      // 检查 success 字段
      if (!responseData.success) {
        throw new Error(responseData.msg || responseData.message || '登录失败');
      }

      // 检查 data 字段
      if (!responseData.data) {
        throw new Error('登录成功但未返回数据');
      }

      const { user, token } = responseData.data;
      console.log('[登录] 提取到的用户信息:', user);
      console.log('[登录] 提取到的 token:', token);

      if (!token) {
        throw new Error('登录成功但未返回 token');
      }

      // 存储 token
      console.log('[登录] 开始存储 token 到缓存');
      Taro.setStorageSync('token', token);
      console.log('[登录] Token 已存储到缓存');

      // 验证 token 是否成功存储
      const storedToken = Taro.getStorageSync('token');
      console.log('[登录] 验证缓存中的 token:', storedToken);

      if (!storedToken) {
        throw new Error('Token 存储失败');
      }

      // 存储用户信息
      console.log('[登录] 存储用户信息到缓存');
      Taro.setStorageSync('userInfo', user);
      console.log('[登录] 用户信息已存储');

      // 打印所有缓存
      const allStorage = Taro.getStorageInfoSync();
      console.log('[登录] 当前所有缓存键:', allStorage.keys);
      console.log('[登录] 缓存大小:', allStorage.currentSize, 'KB');

      // 显示成功提示
      console.log('[登录] 登录成功，准备跳转');
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      });

      // 延迟跳转，确保缓存写入完成
      setTimeout(() => {
        console.log('[登录] 执行跳转到首页');
        Taro.switchTab({ url: '/pages/index/index' });
      }, 500);

    } catch (error: any) {
      console.error('[登录] 登录失败:', error);
      console.error('[登录] 错误类型:', typeof error);
      console.error('[登录] 错误信息:', error.message);
      console.error('[登录] 错误堆栈:', error.stack);

      // 检查当前缓存
      const currentToken = Taro.getStorageSync('token');
      console.log('[登录] 失败时的当前 token:', currentToken);

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
        {/* Logo */}
        <View className="logo-section">
          <View className="logo-wrapper">
            <Text className="block logo-text">星厨房</Text>
          </View>
          <Text className="block subtitle">创作助手</Text>
        </View>

        {/* 登录表单 */}
        <View className="form-section">
          <View className="input-group">
            <View className="input-wrapper">
              <Input
                className="input"
                placeholder="请输入用户名"
                value={username}
                onInput={(e) => setUsername(e.detail.value)}
                placeholderClass="input-placeholder"
              />
            </View>
          </View>

          <View className="input-group">
            <View className="input-wrapper">
              <Input
                className="input"
                password
                placeholder="请输入密码"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
                placeholderClass="input-placeholder"
              />
            </View>
          </View>

          <Button
            className={`login-button ${loading ? 'loading' : ''}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <View className="footer-links">
            <Text className="block footer-text">
              还没有账号？
              <Text className="link" onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}>
                立即注册
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginPage;
