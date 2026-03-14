import { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { Network } from '@/network'

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
    <View className="min-h-screen bg-slate-900 flex flex-col px-6 py-12 relative overflow-hidden">
      {/* 背景装饰 */}
      <View className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <View className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <View className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-red-500/15 rounded-full blur-3xl" />
        <View className="absolute bottom-10 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-blue-500/15 rounded-full blur-3xl" />
      </View>

      {/* 返回按钮 */}
      <View 
        className="absolute top-4 left-4 z-20 px-4 py-2"
        onClick={() => Taro.navigateBack()}
      >
        <Text className="text-white/70 text-sm">← 返回</Text>
      </View>

      {/* 内容区域 */}
      <View className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md">
        {/* 标题 */}
        <Text className="block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
          注册账号
        </Text>
        <Text className="block text-white/50 text-sm mb-12">
          注册后需等待管理员审核通过
        </Text>

        {/* 注册表单 */}
        <View className="w-full space-y-4">
          {/* 账号输入 */}
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <Input
              className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
              type="text"
              placeholder="请输入账号（至少3位）"
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>

          {/* 昵称输入 */}
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <Input
              className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
              type="text"
              placeholder="请输入昵称（可选）"
              value={nickname}
              onInput={(e) => setNickname(e.detail.value)}
            />
          </View>

          {/* 密码输入 */}
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {showPassword ? (
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type={'text' as any}
                placeholder="请输入密码（至少6位）"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            ) : (
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type={'password' as any}
                placeholder="请输入密码（至少6位）"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            )}
          </View>

          {/* 确认密码输入 */}
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <Input
              className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
              type={showPassword ? ('text' as any) : ('password' as any)}
              placeholder="请再次输入密码"
              value={confirmPassword}
              onInput={(e) => setConfirmPassword(e.detail.value)}
            />
          </View>

          {/* 显示密码选项 */}
          <View 
            className="flex items-center justify-end"
            onClick={() => setShowPassword(!showPassword)}
          >
            <Text className="text-white/60 text-sm">
              {showPassword ? '隐藏密码' : '显示密码'}
            </Text>
          </View>

          {/* 注册按钮 */}
          <View
            className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl py-4 flex items-center justify-center shadow-2xl shadow-purple-500/40 mt-6 ${isRegistering ? 'opacity-70' : 'active:scale-[0.98]'}`}
            onClick={isRegistering ? undefined : handleRegister}
          >
            <Text className="text-white text-lg font-semibold">
              {isRegistering ? '注册中...' : '注册'}
            </Text>
          </View>

          {/* 已有账号入口 */}
          <View className="flex items-center justify-center mt-6">
            <Text className="text-white/50 text-sm">已有账号？</Text>
            <View onClick={() => Taro.navigateBack()}>
              <Text className="text-blue-400 text-sm ml-1">立即登录</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default RegisterPage
