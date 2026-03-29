import { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { Network } from '@/network'
import { Lightbulb, User, Lock, Eye, EyeOff} from 'lucide-react-taro'

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  /**
   * 用户注册
   */
  const handleRegister = async () => {
    if (!username.trim()) {
      showToast({ title: '请输入账号', icon: 'none' })
      return
    }
    if (username.trim().length < 3) {
      showToast({ title: '账号至少3位', icon: 'none' })
      return
    }
    if (!password.trim()) {
      showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    if (password.trim().length < 6) {
      showToast({ title: '密码至少6位', icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      showToast({ title: '两次密码输入不一致', icon: 'none' })
      return
    }

    setIsRegistering(true)

    try {
      console.log('用户注册:', { username })

      const response = await Network.request({
        url: '/api/user/register',
        method: 'POST',
        data: {
          username: username.trim(),
          password: password.trim(),
          nickname: nickname.trim() || username.trim()
        }
      })

      console.log('注册响应:', response.data)

      if (response.data?.success) {
        showToast({ title: '注册成功', icon: 'success' })
        // 跳转到登录页
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/login/index' })
        }, 1500)
      } else {
        throw new Error(response.data?.msg || '注册失败')
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      showToast({ title: error.message || '注册失败，请重试', icon: 'none' })
    } finally {
      setIsRegistering(false)
    }
  }

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
        <View style={{ paddingTop: '100px', marginBottom: '32px' }}>
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
              <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.02em' }}>注册账号</Text>
              <Text style={{ fontSize: '12px', color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Create Account</Text>
            </View>
          </View>
          <Text style={{ fontSize: '14px', color: '#94a3b8', marginTop: '16px' }}>注册后需等待管理员审核通过</Text>
        </View>

        {/* 注册表单 */}
        <View style={{ flex: 1 }}>
          {/* 账号输入 */}
          <View style={{ marginBottom: '16px' }}>
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
                placeholder="请输入账号（至少3位）"
                placeholderStyle="color: #64748b"
                value={username}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>
          </View>

          {/* 昵称输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block', fontWeight: '500' }}>昵称</Text>
            <View style={{ 
              backgroundColor: '#111827', 
              borderRadius: '12px', 
              border: focusedField === 'nickname' ? '2px solid #38bdf8' : '1px solid #1e3a5f', 
              padding: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            >
              <User size={20} color={focusedField === 'nickname' ? '#38bdf8' : '#64748b'} style={{ flexShrink: 0 }} />
              <Input
                style={{ flex: 1, fontSize: '16px', color: '#f1f5f9', backgroundColor: 'transparent' }}
                placeholder="请输入昵称（可选）"
                placeholderStyle="color: #64748b"
                value={nickname}
                onFocus={() => setFocusedField('nickname')}
                onBlur={() => setFocusedField(null)}
                onInput={(e) => setNickname(e.detail.value)}
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
                placeholder="请输入密码（至少6位）"
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

          {/* 确认密码输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block', fontWeight: '500' }}>确认密码</Text>
            <View style={{ 
              backgroundColor: '#111827', 
              borderRadius: '12px', 
              border: focusedField === 'confirmPassword' ? '2px solid #38bdf8' : '1px solid #1e3a5f', 
              padding: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            >
              <Lock size={20} color={focusedField === 'confirmPassword' ? '#38bdf8' : '#64748b'} style={{ flexShrink: 0 }} />
              <Input
                style={{ flex: 1, fontSize: '16px', color: '#f1f5f9', backgroundColor: 'transparent' }}
                password={!showPassword}
                placeholder="请再次输入密码"
                placeholderStyle="color: #64748b"
                value={confirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                onInput={(e) => setConfirmPassword(e.detail.value)}
              />
            </View>
          </View>

          {/* 注册按钮 */}
          <View
            style={{ 
              backgroundColor: isRegistering ? '#1e3a5f' : '#38bdf8', 
              borderRadius: '12px', 
              padding: '16px', 
              textAlign: 'center', 
              marginTop: '24px',
              marginBottom: '24px',
              boxShadow: isRegistering ? 'none' : '0 4px 16px rgba(56, 189, 248, 0.3)'
            }}
            onClick={isRegistering ? undefined : handleRegister}
          >
            <Text style={{ fontSize: '16px', fontWeight: '600', color: isRegistering ? '#64748b' : '#0c4a6e' }}>
              {isRegistering ? '注册中...' : '注册'}
            </Text>
          </View>

          {/* 已有账号入口 */}
          <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '14px', color: '#64748b' }}>已有账号？</Text>
            <Text style={{ fontSize: '14px', color: '#38bdf8', fontWeight: '500' }} onClick={() => Taro.redirectTo({ url: '/pages/login/index' })}>
              立即登录
            </Text>
          </View>
        </View>

        {/* 底部版权 */}
        <View style={{ padding: '32px 0', textAlign: 'center' }}>
          <Text style={{ fontSize: '12px', color: '#334155' }}>星厨房 · 让创作更高效</Text>
        </View>
      </View>
    </View>
  )
}

export default RegisterPage
