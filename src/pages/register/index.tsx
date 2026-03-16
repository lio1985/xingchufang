import { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { Network } from '@/network'
import './index.css'

const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
          Taro.navigateBack()
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
    <View className="register-page">
      {/* 背景装饰 */}
      <View className="bg-decoration">
        <View className="bg-circle bg-circle-1" />
        <View className="bg-circle bg-circle-2" />
        <View className="bg-circle bg-circle-3" />
      </View>

      {/* 返回按钮 */}
      <View className="back-button" onClick={() => Taro.navigateBack()}>
        <Text className="back-button-text">← 返回</Text>
      </View>

      {/* 内容区域 */}
      <View className="register-container">
        {/* 标题 */}
        <Text className="title-text">注册账号</Text>
        <Text className="subtitle-text">注册后需等待管理员审核通过</Text>

        {/* 注册表单 */}
        <View className="form-content">
          {/* 账号输入 */}
          <View className="input-wrapper">
            <Input
              className="register-input"
              type="text"
              placeholder="请输入账号（至少3位）"
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>

          {/* 昵称输入 */}
          <View className="input-wrapper">
            <Input
              className="register-input"
              type="text"
              placeholder="请输入昵称（可选）"
              value={nickname}
              onInput={(e) => setNickname(e.detail.value)}
            />
          </View>

          {/* 密码输入 */}
          <View className="input-wrapper">
            {showPassword ? (
              <Input
                className="register-input"
                type={'text' as any}
                placeholder="请输入密码（至少6位）"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            ) : (
              <Input
                className="register-input"
                type={'password' as any}
                placeholder="请输入密码（至少6位）"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            )}
          </View>

          {/* 确认密码输入 */}
          <View className="input-wrapper">
            <Input
              className="register-input"
              type={showPassword ? ('text' as any) : ('password' as any)}
              placeholder="请再次输入密码"
              value={confirmPassword}
              onInput={(e) => setConfirmPassword(e.detail.value)}
            />
          </View>

          {/* 显示密码选项 */}
          <View className="show-password-wrapper" onClick={() => setShowPassword(!showPassword)}>
            <Text className="show-password-text">
              {showPassword ? '隐藏密码' : '显示密码'}
            </Text>
          </View>

          {/* 注册按钮 */}
          <View
            className={`register-button ${isRegistering ? 'loading' : ''}`}
            onClick={isRegistering ? undefined : handleRegister}
          >
            <Text className="register-button-text">
              {isRegistering ? '注册中...' : '注册'}
            </Text>
          </View>

          {/* 已有账号入口 */}
          <View className="footer-links">
            <Text className="footer-links-text">已有账号？</Text>
            <View onClick={() => Taro.navigateBack()}>
              <Text className="footer-links-action">立即登录</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default RegisterPage
