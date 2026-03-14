import { useState, useCallback } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { Network } from '@/network'
import logoImage from '../../static/logo-xinchufang-new.png'

const LoginPage = () => {
  const [isLogging, setIsLogging] = useState(false)

  /**
   * 检查或创建用户
   */
  const checkOrCreateUser = useCallback(async (openid: string, nickname: string) => {
    console.log('调用 check-user 接口:', { openid, nickname })

    const response = await Network.request({
      url: '/api/user/check-user',
      method: 'POST',
      data: { openid, nickname }
    })

    console.log('check-user 响应:', response.data)

    if (response.data?.success && response.data?.data) {
      return response.data.data
    } else {
      throw new Error(response.data?.msg || '检查/创建用户失败')
    }
  }, [])

  /**
   * 处理微信登录
   * 获取用户信息后调用
   */
  const handleWechatLogin = useCallback(async (userProfile?: any) => {
    if (isLogging) return
    setIsLogging(true)

    try {
      // 获取微信登录 code
      const loginRes = await Taro.login()
      console.log('微信登录 code:', loginRes.code)

      if (!loginRes.code) {
        showToast({ title: '获取微信登录码失败', icon: 'none' })
        setIsLogging(false)
        return
      }

      // 调用后端登录接口获取 openid
      const loginResponse = await Network.request({
        url: '/api/user/login',
        method: 'POST',
        data: { code: loginRes.code }
      })

      if (loginResponse.data?.code !== 200 || !loginResponse.data?.data?.user) {
        throw new Error('获取 openid 失败')
      }

      const openid = loginResponse.data.data.user.openid
      // 使用微信用户信息或默认昵称
      const nickname = userProfile?.nickName || userProfile?.nickname || '微信用户'

      console.log('登录信息:', { openid, nickname })

      // 调用 check-user 接口
      const checkResult = await checkOrCreateUser(openid, nickname)
      const { user, token } = checkResult

      // 处理用户状态
      if (user.status === 'pending') {
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        Taro.showModal({
          title: '等待审核',
          content: '您的账号已提交，请等待管理员审核。审核通过后即可使用。',
          showCancel: false,
          success: () => {
            Taro.reLaunch({ url: '/pages/index/index' })
          }
        })
      } else if (user.status === 'disabled' || user.status === 'deleted') {
        Taro.showModal({
          title: '账号状态异常',
          content: '您的账号已被禁用，请联系管理员。',
          showCancel: false
        })
      } else if (user.status === 'active') {
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/index/index' })
        }, 1000)
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      showToast({ title: error.message || '登录失败，请重试', icon: 'none' })
    } finally {
      setIsLogging(false)
    }
  }, [isLogging, checkOrCreateUser])

  /**
   * 获取用户信息并登录
   * 需要通过按钮触发
   */
  const getUserProfileAndLogin = useCallback(async () => {
    try {
      // 获取用户信息
      const res = await Taro.getUserProfile({
        desc: '用于完善用户资料'
      })
      console.log('获取用户信息成功:', res.userInfo)
      // 获取信息后执行登录
      await handleWechatLogin(res.userInfo)
    } catch (e) {
      console.log('用户拒绝授权或获取失败:', e)
      // 用户拒绝授权，使用默认昵称继续登录
      await handleWechatLogin({ nickname: '微信用户' })
    }
  }, [handleWechatLogin])

  return (
    <View className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* 背景装饰 */}
      <View className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <View className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <View className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-red-500/15 rounded-full blur-3xl" />
        <View className="absolute bottom-10 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-blue-500/15 rounded-full blur-3xl" />
      </View>

      {/* 内容区域 */}
      <View className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12">
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
        <Text className="block text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
          星厨房
        </Text>
        <Text className="block text-base text-slate-400 mb-16">
          创作工具平台
        </Text>

        {/* 登录按钮区域 */}
        <View className="w-full max-w-sm space-y-4">
          {/* 微信授权登录按钮 */}
          <Button
            className="w-full !bg-green-500 !text-white !rounded-full !py-4 !flex !items-center !justify-center !gap-3 !shadow-lg"
            onClick={getUserProfileAndLogin}
            disabled={isLogging}
          >
            {isLogging ? (
              <Text className="text-white font-semibold">登录中...</Text>
            ) : (
              <>
                <Text className="text-xl mr-2">微信</Text>
                <Text className="text-white font-semibold">微信一键登录</Text>
              </>
            )}
          </Button>

          {/* 说明文字 */}
          <View className="text-center mt-6">
            <Text className="text-xs text-slate-500">
              登录即表示您同意《用户协议》和《隐私政策》
            </Text>
          </View>
        </View>
      </View>

      {/* 底部信息 */}
      <View className="relative z-10 pb-8 text-center">
        <Text className="text-xs text-slate-600">
          星厨房创作工作室
        </Text>
      </View>
    </View>
  )
}

export default LoginPage
