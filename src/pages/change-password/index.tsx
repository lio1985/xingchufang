import { useState } from 'react';
import Taro, { showToast } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  CircleCheck,
} from 'lucide-react-taro';
import { Network } from '@/network';

const ChangePasswordPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState('');

  /**
   * 第1步：验证原密码
   */
  const handleVerifyOldPassword = async () => {
    if (!username.trim()) {
      showToast({ title: '请输入账号', icon: 'none' });
      return;
    }
    if (!oldPassword.trim()) {
      showToast({ title: '请输入原密码', icon: 'none' });
      return;
    }

    setIsLoading(true);

    try {
      console.log('验证账号密码:', { username });

      const response = await Network.request({
        url: '/api/user/login-with-password',
        method: 'POST',
        data: {
          username: username.trim(),
          password: oldPassword.trim(),
        },
      });

      console.log('验证响应:', response.data);

      if (response.data?.success && response.data?.data?.user) {
        setVerifiedUserId(response.data.data.user.id);
        setStep(2);
        showToast({ title: '验证成功', icon: 'success' });
      } else {
        throw new Error(response.data?.msg || '账号或原密码错误');
      }
    } catch (error: any) {
      console.error('验证失败:', error);
      showToast({ title: error.message || '账号或原密码错误', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 第2步：修改密码
   */
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      showToast({ title: '请输入新密码', icon: 'none' });
      return;
    }
    if (newPassword.trim().length < 6) {
      showToast({ title: '新密码至少6位', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ title: '两次密码输入不一致', icon: 'none' });
      return;
    }
    if (oldPassword === newPassword) {
      showToast({ title: '新密码不能与原密码相同', icon: 'none' });
      return;
    }

    setIsLoading(true);

    try {
      console.log('修改密码:', { userId: verifiedUserId });

      const response = await Network.request({
        url: '/api/user/reset-password',
        method: 'POST',
        data: {
          userId: verifiedUserId,
          newPassword: newPassword.trim(),
        },
      });

      console.log('修改密码响应:', response.data);

      if (response.data?.success) {
        showToast({ title: '修改成功，请重新登录', icon: 'success' });
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/login/index' });
        }, 1500);
      } else {
        throw new Error(response.data?.msg || '修改密码失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      showToast({ title: error.message || '修改密码失败，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      Taro.navigateBack();
    }
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View
        style={{
          padding: '48px 20px 20px',
          backgroundColor: '#141416',
          borderBottom: '1px solid #27272a',
          position: 'relative',
        }}
      >
        <View
          style={{ position: 'absolute', left: '16px', top: '48px' }}
          onClick={handleGoBack}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronLeft size={24} color="#f59e0b" />
            <Text style={{ fontSize: '14px', color: '#f59e0b' }}>返回</Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
            display: 'block',
            textAlign: 'center',
          }}
        >
          修改密码
        </Text>
        <Text
          style={{
            fontSize: '13px',
            color: '#71717a',
            display: 'block',
            marginTop: '4px',
            textAlign: 'center',
          }}
        >
          {step === 1 ? '验证身份' : '设置新密码'}
        </Text>
      </View>

      {/* 步骤指示器 */}
      <View style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        {/* 步骤1 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <View
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: step === 1 ? '#f59e0b' : '#22c55e',
            }}
          >
            {step === 2 ? (
              <CircleCheck size={18} color="#ffffff" />
            ) : (
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#000000' }}>1</Text>
            )}
          </View>
          <Text style={{ fontSize: '14px', color: step === 1 ? '#ffffff' : '#71717a', fontWeight: '500' }}>验证身份</Text>
        </View>

        {/* 连接线 */}
        <View
          style={{
            width: '48px',
            height: '2px',
            borderRadius: '1px',
            backgroundColor: step === 2 ? '#f59e0b' : '#27272a',
          }}
        />

        {/* 步骤2 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <View
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: step === 2 ? '#f59e0b' : '#27272a',
            }}
          >
            <Text style={{ fontSize: '14px', fontWeight: '600', color: step === 2 ? '#000000' : '#52525b' }}>2</Text>
          </View>
          <Text style={{ fontSize: '14px', color: step === 2 ? '#ffffff' : '#71717a', fontWeight: '500' }}>设置密码</Text>
        </View>
      </View>

      {/* 第1步：验证身份 */}
      {step === 1 && (
        <View style={{ padding: '0 20px' }}>
          {/* 说明卡片 */}
          <View
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={18} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                安全验证
              </Text>
              <Text style={{ fontSize: '12px', color: '#a1a1aa', display: 'block' }}>
                请输入您的账号和原密码，验证身份后方可设置新密码
              </Text>
            </View>
          </View>

          {/* 账号输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              账号
            </Text>
            <View
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <User size={18} color="#52525b" />
              <Input
                style={{ flex: 1, fontSize: '14px', color: '#ffffff' }}
                type="text"
                placeholder="请输入账号"
                placeholderStyle="color: #52525b"
                value={username}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>
          </View>

          {/* 原密码输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              原密码
            </Text>
            <View
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Lock size={18} color="#52525b" />
              <Input
                style={{ flex: 1, fontSize: '14px', color: '#ffffff' }}
                type={showOldPassword ? ('text' as any) : ('password' as any)}
                placeholder="请输入原密码"
                placeholderStyle="color: #52525b"
                value={oldPassword}
                onInput={(e) => setOldPassword(e.detail.value)}
              />
              <View onClick={() => setShowOldPassword(!showOldPassword)}>
                {showOldPassword ? (
                  <EyeOff size={18} color="#52525b" />
                ) : (
                  <Eye size={18} color="#52525b" />
                )}
              </View>
            </View>
          </View>

          {/* 下一步按钮 */}
          <View
            style={{
              backgroundColor: isLoading ? 'rgba(245, 158, 11, 0.5)' : '#f59e0b',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '32px',
            }}
            onClick={isLoading ? undefined : handleVerifyOldPassword}
          >
            <Text style={{ fontSize: '16px', color: '#000000', fontWeight: '600' }}>
              {isLoading ? '验证中...' : '下一步'}
            </Text>
          </View>
        </View>
      )}

      {/* 第2步：设置新密码 */}
      {step === 2 && (
        <View style={{ padding: '0 20px' }}>
          {/* 说明卡片 */}
          <View
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CircleCheck size={18} color="#22c55e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '14px', color: '#22c55e', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                身份验证成功
              </Text>
              <Text style={{ fontSize: '12px', color: '#a1a1aa', display: 'block' }}>
                请设置您的新密码，密码长度至少6位
              </Text>
            </View>
          </View>

          {/* 新密码输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              新密码
            </Text>
            <View
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Lock size={18} color="#52525b" />
              <Input
                style={{ flex: 1, fontSize: '14px', color: '#ffffff' }}
                type={showNewPassword ? ('text' as any) : ('password' as any)}
                placeholder="请输入新密码（至少6位）"
                placeholderStyle="color: #52525b"
                value={newPassword}
                onInput={(e) => setNewPassword(e.detail.value)}
              />
              <View onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? (
                  <EyeOff size={18} color="#52525b" />
                ) : (
                  <Eye size={18} color="#52525b" />
                )}
              </View>
            </View>
          </View>

          {/* 确认新密码输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              确认新密码
            </Text>
            <View
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Lock size={18} color="#52525b" />
              <Input
                style={{ flex: 1, fontSize: '14px', color: '#ffffff' }}
                type={showConfirmPassword ? ('text' as any) : ('password' as any)}
                placeholder="请再次输入新密码"
                placeholderStyle="color: #52525b"
                value={confirmPassword}
                onInput={(e) => setConfirmPassword(e.detail.value)}
              />
              <View onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={18} color="#52525b" />
                ) : (
                  <Eye size={18} color="#52525b" />
                )}
              </View>
            </View>
          </View>

          {/* 密码强度提示 */}
          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#52525b', display: 'block' }}>
              密码要求：至少6位字符，建议包含字母、数字和特殊符号
            </Text>
          </View>

          {/* 确认修改按钮 */}
          <View
            style={{
              backgroundColor: isLoading ? 'rgba(245, 158, 11, 0.5)' : '#f59e0b',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={isLoading ? undefined : handleChangePassword}
          >
            <Text style={{ fontSize: '16px', color: '#000000', fontWeight: '600' }}>
              {isLoading ? '修改中...' : '确认修改'}
            </Text>
          </View>

          {/* 返回上一步 */}
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '16px',
            }}
            onClick={() => setStep(1)}
          >
            <Text style={{ fontSize: '14px', color: '#71717a' }}>返回上一步</Text>
          </View>
        </View>
      )}

      {/* 底部提示 */}
      <View style={{ position: 'fixed', bottom: '32px', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: '12px', color: '#3f3f46' }}>星厨房内容创作助手 v1.0.0</Text>
      </View>
    </View>
  );
};

export default ChangePasswordPage;
