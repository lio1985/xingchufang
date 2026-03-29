import { useState } from 'react';
import Taro, { showToast } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import {
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 背景装饰 - 顶部光晕 */}
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '300px', 
        background: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none' 
      }}
      />

      {/* 页面头部 */}
      <View style={{ padding: '48px 16px 20px', position: 'relative', zIndex: 1 }}>
        <Text style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', display: 'block', textAlign: 'center' }}>
          修改密码
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginTop: '4px', textAlign: 'center' }}>
          {step === 1 ? '验证身份' : '设置新密码'}
        </Text>
      </View>

      {/* 步骤指示器 */}
      <View style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        {/* 步骤1 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <View style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: step === 1 ? '#38bdf8' : '#4ade80',
          }}
          >
            {step === 2 ? (
              <CircleCheck size={16} color="#fff" />
            ) : (
              <Text style={{ fontSize: '14px', fontWeight: '600', color: step === 1 ? '#0c4a6e' : '#fff' }}>1</Text>
            )}
          </View>
          <Text style={{ fontSize: '14px', color: step === 1 ? '#f1f5f9' : '#64748b', fontWeight: '500' }}>验证身份</Text>
        </View>

        {/* 连接线 */}
        <View style={{ width: '40px', height: '2px', borderRadius: '1px', backgroundColor: step === 2 ? '#38bdf8' : '#1e3a5f' }} />

        {/* 步骤2 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <View style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: step === 2 ? '#38bdf8' : '#1e3a5f',
          }}
          >
            <Text style={{ fontSize: '14px', fontWeight: '600', color: step === 2 ? '#0c4a6e' : '#64748b' }}>2</Text>
          </View>
          <Text style={{ fontSize: '14px', color: step === 2 ? '#f1f5f9' : '#64748b', fontWeight: '500' }}>设置密码</Text>
        </View>
      </View>

      {/* 主内容区 */}
      <View style={{ flex: 1, padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* 第1步：验证身份 */}
        {step === 1 && (
          <View>
            {/* 说明卡片 */}
            <View style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
            >
              <View style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              >
                <ShieldCheck size={18} color="#38bdf8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', color: '#38bdf8', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  安全验证
                </Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>
                  请输入您的账号和原密码，验证身份后方可设置新密码
                </Text>
              </View>
            </View>

            {/* 账号输入 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                账号
              </Text>
              <View style={{
                backgroundColor: '#111827',
                border: focusedField === 'username' ? '2px solid #38bdf8' : '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              >
                <User size={20} color={focusedField === 'username' ? '#38bdf8' : '#64748b'} />
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

            {/* 原密码输入 */}
            <View style={{ marginBottom: '24px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                原密码
              </Text>
              <View style={{
                backgroundColor: '#111827',
                border: focusedField === 'oldPassword' ? '2px solid #38bdf8' : '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              >
                <Lock size={20} color={focusedField === 'oldPassword' ? '#38bdf8' : '#64748b'} />
                <Input
                  style={{ flex: 1, fontSize: '16px', color: '#f1f5f9', backgroundColor: 'transparent' }}
                  password={!showOldPassword}
                  placeholder="请输入原密码"
                  placeholderStyle="color: #64748b"
                  value={oldPassword}
                  onFocus={() => setFocusedField('oldPassword')}
                  onBlur={() => setFocusedField(null)}
                  onInput={(e) => setOldPassword(e.detail.value)}
                />
                <View style={{ padding: '4px' }} onClick={() => setShowOldPassword(!showOldPassword)}>
                  {showOldPassword ? (
                    <EyeOff size={20} color="#38bdf8" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </View>
              </View>
            </View>

            {/* 下一步按钮 */}
            <View style={{
              backgroundColor: isLoading ? '#1e3a5f' : '#38bdf8',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isLoading ? 'none' : '0 4px 16px rgba(56, 189, 248, 0.3)'
            }}
              onClick={isLoading ? undefined : handleVerifyOldPassword}
            >
              <Text style={{ fontSize: '16px', color: isLoading ? '#64748b' : '#0c4a6e', fontWeight: '600' }}>
                {isLoading ? '验证中...' : '下一步'}
              </Text>
            </View>
          </View>
        )}

        {/* 第2步：设置新密码 */}
        {step === 2 && (
          <View>
            {/* 说明卡片 */}
            <View style={{
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
            >
              <View style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(74, 222, 128, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              >
                <CircleCheck size={18} color="#4ade80" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', color: '#4ade80', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                  身份验证成功
                </Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>
                  请设置您的新密码，密码长度至少6位
                </Text>
              </View>
            </View>

            {/* 新密码输入 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                新密码
              </Text>
              <View style={{
                backgroundColor: '#111827',
                border: focusedField === 'newPassword' ? '2px solid #38bdf8' : '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              >
                <Lock size={20} color={focusedField === 'newPassword' ? '#38bdf8' : '#64748b'} />
                <Input
                  style={{ flex: 1, fontSize: '16px', color: '#f1f5f9', backgroundColor: 'transparent' }}
                  password={!showNewPassword}
                  placeholder="请输入新密码（至少6位）"
                  placeholderStyle="color: #64748b"
                  value={newPassword}
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                  onInput={(e) => setNewPassword(e.detail.value)}
                />
                <View style={{ padding: '4px' }} onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? (
                    <EyeOff size={20} color="#38bdf8" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </View>
              </View>
            </View>

            {/* 确认新密码输入 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                确认新密码
              </Text>
              <View style={{
                backgroundColor: '#111827',
                border: focusedField === 'confirmPassword' ? '2px solid #38bdf8' : '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
              >
                <Lock size={20} color={focusedField === 'confirmPassword' ? '#38bdf8' : '#64748b'} />
                <Input
                  style={{ flex: 1, fontSize: '16px', color: '#f1f5f9', backgroundColor: 'transparent' }}
                  password={!showConfirmPassword}
                  placeholder="请再次输入新密码"
                  placeholderStyle="color: #64748b"
                  value={confirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  onInput={(e) => setConfirmPassword(e.detail.value)}
                />
                <View style={{ padding: '4px' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#38bdf8" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </View>
              </View>
            </View>

            {/* 密码强度提示 */}
            <View style={{ marginBottom: '24px' }}>
              <Text style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                密码要求：至少6位字符，建议包含字母、数字和特殊符号
              </Text>
            </View>

            {/* 确认修改按钮 */}
            <View style={{
              backgroundColor: isLoading ? '#1e3a5f' : '#38bdf8',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isLoading ? 'none' : '0 4px 16px rgba(56, 189, 248, 0.3)'
            }}
              onClick={isLoading ? undefined : handleChangePassword}
            >
              <Text style={{ fontSize: '16px', color: isLoading ? '#64748b' : '#0c4a6e', fontWeight: '600' }}>
                {isLoading ? '修改中...' : '确认修改'}
              </Text>
            </View>

            {/* 返回上一步 */}
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }} onClick={() => setStep(1)}>
              <Text style={{ fontSize: '14px', color: '#64748b' }}>返回上一步</Text>
            </View>
          </View>
        )}
      </View>

      {/* 底部版权 */}
      <View style={{ padding: '24px', textAlign: 'center' }}>
        <Text style={{ fontSize: '12px', color: '#334155' }}>星厨房 · 让创作更高效</Text>
      </View>
    </View>
  );
};

export default ChangePasswordPage;
