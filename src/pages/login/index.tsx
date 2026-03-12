import { useState } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { Network } from '@/network'
import { User } from 'lucide-react-taro'
import logoImage from '../../static/logo-xinchufang-new.png'

const LoginPage = () => {
  const [isLogging, setIsLogging] = useState(false)

  /**
   * 检查或创建用户
   * 调用后端 /api/user/check-user 接口
   */
  const checkOrCreateUser = async (openid: string, nickname: string) => {
    console.log('调用 check-user 接口:', { openid, nickname })

    const response = await Network.request({
      url: '/api/user/check-user',
      method: 'POST',
      data: {
        openid,
        nickname
      }
    })

    console.log('check-user 响应:', response.data)

    if (response.data?.success && response.data?.data) {
      return response.data.data
    } else {
      throw new Error(response.data?.msg || '检查/创建用户失败')
    }
  }

  const handleWechatLogin = async () => {
    if (isLogging) return

    setIsLogging(true)

    try {
      let code: string
      let openid = ''
      let nickname: string

      // 判断环境：小程序环境使用 Taro.login()，H5 环境使用模拟登录
      if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
        // 小程序环境：调用微信登录获取 code
        const loginRes = await Taro.login()
        console.log('微信登录 code:', loginRes.code)

        if (!loginRes.code) {
          showToast({ title: '获取微信登录码失败', icon: 'none' })
          setIsLogging(false)
          return
        }

        code = loginRes.code

        // 获取用户信息（微信头像和昵称）
        try {
          const userProfile = await Taro.getUserProfile({
            desc: '用于完善用户资料'
          })
          nickname = userProfile.userInfo?.nickName || '微信用户'
          console.log('获取到用户信息:', { nickname })
        } catch (e) {
          console.log('用户拒绝授权用户信息，使用默认昵称')
          nickname = '微信用户'
        }
      } else {
        // H5 环境：使用模拟登录
        code = 'mock_code_' + Date.now()
        openid = `mock_openid_${code}`
        nickname = '管理员'
        console.log('H5 环境模拟登录:', { openid, nickname })
        showToast({ title: 'H5 环境模拟登录', icon: 'none' })
      }

      // 小程序环境：需要调用微信 API 获取 openid
      // H5 环境：已直接使用 mock openid
      if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
        // 调用后端登录接口获取 openid（复用现有的 wechatLogin）
        const loginResponse = await Network.request({
          url: '/api/user/login',
          method: 'POST',
          data: { code }
        })

        if (loginResponse.data?.code === 200 && loginResponse.data?.data?.user) {
          openid = loginResponse.data.data.user.openid
        } else {
          throw new Error('获取 openid 失败')
        }
      }

      // 调用 check-user 接口检查/创建用户
      const checkResult = await checkOrCreateUser(openid, nickname)
      const { user, token, type } = checkResult

      console.log(`用户${type === 'existing' ? '已存在' : '新创建'}:`, user)

      // 根据用户状态显示不同提示
      if (user.status === 'pending') {
        // 存储用户信息
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        showToast({
          title: '等待管理员审核',
          icon: 'none',
          duration: 3000
        })

        // 显示等待审核的提示
        Taro.showModal({
          title: '等待审核',
          content: '您的账号已提交，请等待管理员审核。审核通过后即可使用。',
          showCancel: false,
          success: () => {
            // 跳转到首页（但功能受限）
            setTimeout(() => {
              Taro.reLaunch({ url: '/pages/index/index' })
            }, 500)
          }
        })
      } else if (user.status === 'disabled' || user.status === 'deleted') {
        showToast({
          title: '账号已被禁用',
          icon: 'none'
        })
        Taro.showModal({
          title: '账号状态异常',
          content: '您的账号已被禁用，请联系管理员。',
          showCancel: false
        })
      } else if (user.status === 'active') {
        // 正常登录，存储 token 和用户信息
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)

        showToast({ title: '登录成功', icon: 'success' })

        // 跳转到首页
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/index/index' })
        }, 1500)
      }
    } catch (error) {
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
          <View className="w-40 h-40 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl shadow-white/5 border border-white/10">
            <Image
              src={logoImage}
              className="w-28 h-28 object-contain"
              mode="aspectFit"
            />
          </View>
        </View>

        {/* 标题 */}
        <Text className="block text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 via-pink-400 to-red-400 mb-3 tracking-tight">
          星厨房创作助手
        </Text>
        <Text className="block text-sm text-slate-400 tracking-widest font-semibold uppercase mb-20">
          CONTENT CREATION ASSISTANT
        </Text>

        {/* 微信登录按钮 */}
        <View className="w-full">
          <View
            className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl py-5 flex items-center justify-center mb-6 transition-all active:scale-[0.97] shadow-2xl shadow-purple-500/40 ${isLogging ? 'opacity-60' : ''}`}
            onClick={handleWechatLogin}
          >
            <View className="flex items-center gap-4">
              <View className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <User size={28} color="white" strokeWidth={2.5} />
              </View>
              <Text className="block text-white font-bold text-xl tracking-wide">
                {isLogging ? '登录中...' : '微信一键登录'}
              </Text>
            </View>
          </View>

          {/* 提示信息 */}
          <Text className="block text-sm text-slate-500 text-center leading-relaxed">
            点击登录即表示同意《用户协议》和《隐私政策》
          </Text>
        </View>
      </View>
    </View>
  )
}

export default LoginPage
