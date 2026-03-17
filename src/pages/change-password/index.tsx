import { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { Network } from '@/network'

const ChangePasswordPage = () => {
  const [step, setStep] = useState<1 | 2>(1)
  const [username, setUsername] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [verifiedUserId, setVerifiedUserId] = useState('')

  /**
   * 第1步：验证原密码
   */
  const handleVerifyOldPassword = async () => {
    if (!username.trim()) {
      showToast({ title: '请输入账号', icon: 'none' })
      return
    }
    if (!oldPassword.trim()) {
      showToast({ title: '请输入原密码', icon: 'none' })
      return
    }

    setIsLoading(true)

    try {
      console.log('验证账号密码:', { username })

      // 调用登录接口验证原密码
      const response = await Network.request({
        url: '/api/user/login-with-password',
        method: 'POST',
        data: {
          username: username.trim(),
          password: oldPassword.trim()
        }
      })

      console.log('验证响应:', response.data)

      if (response.data?.success && response.data?.data?.user) {
        // 验证成功，保存用户ID，进入第2步
        setVerifiedUserId(response.data.data.user.id)
        setStep(2)
        showToast({ title: '验证成功，请设置新密码', icon: 'success' })
      } else {
        throw new Error(response.data?.msg || '账号或原密码错误')
      }
    } catch (error: any) {
      console.error('验证失败:', error)
      showToast({ title: error.message || '账号或原密码错误', icon: 'none' })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 第2步：修改密码
   */
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      showToast({ title: '请输入新密码', icon: 'none' })
      return
    }
    if (newPassword.trim().length < 6) {
      showToast({ title: '新密码至少6位', icon: 'none' })
      return
    }
    if (newPassword !== confirmPassword) {
      showToast({ title: '两次密码输入不一致', icon: 'none' })
      return
    }
    if (oldPassword === newPassword) {
      showToast({ title: '新密码不能与原密码相同', icon: 'none' })
      return
    }

    setIsLoading(true)

    try {
      console.log('修改密码:', { userId: verifiedUserId })

      // 调用重置密码接口（无需登录token）
      const response = await Network.request({
        url: '/api/user/reset-password',
        method: 'POST',
        data: {
          userId: verifiedUserId,
          newPassword: newPassword.trim()
        }
      })

      console.log('修改密码响应:', response.data)

      if (response.data?.success) {
        showToast({ title: '修改成功，请重新登录', icon: 'success' })
        // 跳转到登录页
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/login/index' })
        }, 1500)
      } else {
        throw new Error(response.data?.msg || '修改密码失败')
      }
    } catch (error: any) {
      console.error('修改密码失败:', error)
      showToast({ title: error.message || '修改密码失败，请重试', icon: 'none' })
    } finally {
      setIsLoading(false)
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
        onClick={() => {
          if (step === 2) {
            setStep(1)
          } else {
            Taro.navigateBack()
          }
        }}
      >
        <Text className="text-white/70 text-sm">← 返回</Text>
      </View>

      {/* 内容区域 */}
      <View className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md">
        {/* 标题 */}
        <Text className="block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
          {step === 1 ? '修改密码' : '设置新密码'}
        </Text>
        <Text className="block text-white/50 text-sm mb-12">
          {step === 1 ? '请先验证您的账号和密码' : '请输入您的新密码'}
        </Text>

        {/* 步骤指示器 */}
        <View className="flex items-center gap-4 mb-10">
          <View className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-emerald-500'}`}>
            <Text className="text-white font-bold">1</Text>
          </View>
          <View className={`w-16 h-1 rounded ${step === 1 ? 'bg-slate-800/20' : 'bg-gradient-to-r from-emerald-500 to-blue-500'}`} />
          <View className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-800/20'}`}>
            <Text className="text-white font-bold">2</Text>
          </View>
        </View>

        {/* 第1步：验证身份 */}
        {step === 1 && (
          <View className="w-full space-y-4">
            {/* 账号输入 */}
            <View className="bg-slate-800/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type="text"
                placeholder="请输入账号"
                value={username}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>

            {/* 原密码输入 */}
            <View className="bg-slate-800/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type={showPassword ? ('text' as any) : ('password' as any)}
                placeholder="请输入原密码"
                value={oldPassword}
                onInput={(e) => setOldPassword(e.detail.value)}
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

            {/* 下一步按钮 */}
            <View
              className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl py-4 flex items-center justify-center shadow-2xl shadow-purple-500/40 mt-6 ${isLoading ? 'opacity-70' : 'active:scale-[0.98]'}`}
              onClick={isLoading ? undefined : handleVerifyOldPassword}
            >
              <Text className="text-white text-lg font-semibold">
                {isLoading ? '验证中...' : '下一步'}
              </Text>
            </View>
          </View>
        )}

        {/* 第2步：设置新密码 */}
        {step === 2 && (
          <View className="w-full space-y-4">
            {/* 新密码输入 */}
            <View className="bg-slate-800/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type={showPassword ? ('text' as any) : ('password' as any)}
                placeholder="请输入新密码（至少6位）"
                value={newPassword}
                onInput={(e) => setNewPassword(e.detail.value)}
              />
            </View>

            {/* 确认新密码输入 */}
            <View className="bg-slate-800/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <Input
                className="w-full h-14 px-5 text-white text-base placeholder:text-white/50 bg-transparent"
                type={showPassword ? ('text' as any) : ('password' as any)}
                placeholder="请再次输入新密码"
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

            {/* 确认修改按钮 */}
            <View
              className={`w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl py-4 flex items-center justify-center shadow-2xl shadow-emerald-500/40 mt-6 ${isLoading ? 'opacity-70' : 'active:scale-[0.98]'}`}
              onClick={isLoading ? undefined : handleChangePassword}
            >
              <Text className="text-white text-lg font-semibold">
                {isLoading ? '修改中...' : '确认修改'}
              </Text>
            </View>

            {/* 返回上一步 */}
            <View 
              className="flex items-center justify-center mt-4"
              onClick={() => setStep(1)}
            >
              <Text className="text-white/50 text-sm">返回上一步</Text>
            </View>
          </View>
        )}

        {/* 返回登录入口 */}
        <View className="flex items-center justify-center mt-8">
          <Text className="text-white/50 text-sm">想起密码了？</Text>
          <View onClick={() => Taro.navigateBack()}>
            <Text className="text-blue-400 text-sm ml-1">返回登录</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ChangePasswordPage
