import { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Image, Input } from '@tarojs/components'
import { Network } from '@/network'
import logoImage from '../../static/logo-xinchufang-new.png'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  /**
   * 账号密码登录
   */
  const handleLogin = async () => {
    if (!username.trim()) {
      showToast({ title: '请输入账号', icon: 'none' })
      return
    }
    if (!password.trim()) {
      showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    setIsLogging(true)

    try {
      console.log('账号密码登录:', { username })

      const response = await Network.request({
        url: '/api/user/login-with-password',
        method: 'POST',
        data: {
          username: username.trim(),
          password: password.trim()
        }
      })

      console.log('登录响应:', response.data)

      if (response.data?.success && response.data?.data) {
        const { user, token } = response.data.data

        // 存储 token 和用户信息
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        showToast({ title: '登录成功', icon: 'success' })

        // 跳转到首页
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/index/index' })
        }, 1500)
      } else {
        throw new Error(response.data?.msg || '登录失败')
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      showToast({ title: error.message || '登录失败，请重试', icon: 'none' })
    } finally {
      setIsLogging(false)
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

      {/* 内容区域 */}
      <View className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md">
        {/* Logo */}
        <View className="flex items-center justify-center mb-10">
          <View className="w-32 h-32 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl shadow-white/5 border border-white/10">
            <Image
              src={logoImage}
              className="w-24 h-24 object-contain"
              mode="aspectFit"
            />
          </View>
        </View>

        {/* 标题 */}
        <Text className="block text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-12 tracking-tight">
          星厨房
        </Text>

        {/* 登录表单 */}
        <View className="w-full space-y-4">
          {/* 账号输入 */}
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <Input
              className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
              type="text"
              placeholder="请输入账号"
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>

          {/* 密码输入 */}
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {showPassword ? (
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type={'text' as any}
                placeholder="请输入密码"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            ) : (
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type={'password' as any}
                placeholder="请输入密码"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            )}
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

          {/* 登录按钮 */}
          <View
            className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl py-4 flex items-center justify-center shadow-2xl shadow-purple-500/40 mt-6 ${isLogging ? 'opacity-70' : 'active:scale-[0.98]'}`}
            onClick={isLogging ? undefined : handleLogin}
          >
            <Text className="text-white text-lg font-semibold">
              {isLogging ? '登录中...' : '登录'}
            </Text>
          </View>

          {/* 注册入口 */}
          <View className="flex flex-row items-center justify-center mt-6 gap-4">
            <View onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}>
              <Text className="text-blue-400 text-sm">注册账号</Text>
            </View>
            <Text className="text-white/30">|</Text>
            <View onClick={() => Taro.navigateTo({ url: '/pages/change-password/index' })}>
              <Text className="text-blue-400 text-sm">修改密码</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 底部区域 */}
      <View className="relative z-10 pb-6 flex flex-col items-center gap-2">
        {/* 体验账号 */}
        <Text className="text-white/40 text-xs">体验账号：demo / 密码：123456</Text>
        <Text className="text-white/30 text-xs">星厨房创作工作室</Text>
      </View>
    </View>
  )
}

export default LoginPage
