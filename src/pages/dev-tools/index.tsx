import { useState, useEffect } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { Network } from '@/network'
import { Store, User, Database, Sparkles, TrendingUp, ClipboardList, BookOpen, Shield } from 'lucide-react-taro'

const DevToolsPage = () => {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    loadUserProfile()
    loadToken()
  }, [])

  const loadUserProfile = async () => {
    try {
      const storedUser = Taro.getStorageSync('user')
      setUser(storedUser)
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }

  const loadToken = () => {
    try {
      const storedToken = Taro.getStorageSync('token')
      setToken(storedToken || '')
    } catch (error) {
      console.error('加载token失败:', error)
    }
  }

  const handleBecomeAdmin = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      // 获取token
      const currentToken = Taro.getStorageSync('token')
      console.log('当前token:', currentToken)

      const response = await Network.request({
        url: '/api/user/become-admin',
        method: 'POST',
      })

      console.log('提升为管理员响应:', response.data)

      if (response.data?.code === 200 && response.data?.data) {
        // 更新本地存储
        const updatedUser = { ...user, role: 'admin' }
        Taro.setStorageSync('user', updatedUser)
        setUser(updatedUser)

        showToast({ title: '已提升为管理员', icon: 'success' })

        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        showToast({ title: response.data?.msg || '操作失败', icon: 'none' })
      }
    } catch (error) {
      console.error('提升为管理员失败:', error)
      showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setIsLoading(false)
    }
  }

  // H5环境测试登录
  const handleTestLogin = async () => {
    try {
      showToast({ title: '正在测试登录...', icon: 'loading', duration: 2000 })

      const response = await Network.request({
        url: '/api/user/login',
        method: 'POST',
        data: { code: 'test_login_code_h5' }
      })

      console.log('测试登录响应:', response.data)

      if (response.data?.code === 200 && response.data?.data) {
        const { token: loginToken, user: loginUser } = response.data.data

        Taro.setStorageSync('token', loginToken)
        Taro.setStorageSync('user', loginUser)

        showToast({ title: '测试登录成功', icon: 'success' })

        // 刷新页面
        loadUserProfile()
        loadToken()
      } else {
        showToast({ title: response.data?.msg || '登录失败', icon: 'none' })
      }
    } catch (error) {
      console.error('测试登录失败:', error)
      showToast({ title: '网络错误', icon: 'none' })
    }
  }

  return (
    <View className="min-h-screen bg-slate-900 px-6 py-8">
      {/* 标题 */}
      <Text className="block text-2xl font-bold text-white mb-6">
        开发者工具
      </Text>

      {/* 当前用户信息 */}
      <View className="bg-slate-800 rounded-2xl p-6 mb-6">
        <View className="flex items-center gap-3 mb-4">
          <User size={24} color="#94a3b8" />
          <Text className="block text-lg font-semibold text-white">
            当前用户
          </Text>
        </View>

        {user ? (
          <View className="space-y-3">
            <View>
              <Text className="block text-xs text-slate-400 mb-1">用户 ID</Text>
              <Text className="block text-xs text-slate-300 break-all">{user.id}</Text>
            </View>

            <View>
              <Text className="block text-xs text-slate-400 mb-1">OpenID</Text>
              <View className="flex items-center gap-2">
                <Text className="block text-sm text-slate-200 break-all flex-1">
                  {user.openid || '未设置'}
                </Text>
                {user.openid && (
                  <View
                    className="bg-slate-700 px-3 py-1 rounded-lg active:bg-slate-600"
                    onClick={() => {
                      Taro.setClipboardData({
                        data: user.openid,
                        success: () => {
                          showToast({ title: '已复制', icon: 'success' })
                        }
                      })
                    }}
                  >
                    <ClipboardList size={14} color="#94a3b8" />
                  </View>
                )}
              </View>
              {user.openid && (
                <Text className="block text-xs text-slate-500 mt-1">
                  💡 复制此 OpenID 可配置为超级管理员
                </Text>
              )}
            </View>

            <View>
              <Text className="block text-xs text-slate-400 mb-1">昵称</Text>
              <Text className="block text-sm text-slate-200">{user.nickname || '未设置'}</Text>
            </View>

            <View>
              <Text className="block text-xs text-slate-400 mb-1">角色</Text>
              <View className="flex items-center gap-2">
                <Text
                  className={`block text-sm font-semibold ${
                    user.role === 'admin' ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {user.role === 'admin' ? '管理员' : '普通用户'}
                </Text>
                {user.role === 'admin' && (
                  <Shield size={16} color="#10b981" />
                )}
              </View>
            </View>

            <View>
              <Text className="block text-xs text-slate-400 mb-1">状态</Text>
              <Text className="block text-sm text-slate-200">{user.status || 'active'}</Text>
            </View>

            <View>
              <Text className="block text-xs text-slate-400 mb-1">Token</Text>
              <Text className="block text-xs text-slate-300 break-all">
                {token ? token.substring(0, 50) + '...' : '不存在'}
              </Text>
              {!token && (
                <Text className="block text-xs text-red-400 mt-1">
                  ⚠️ 未检测到Token，请先登录
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Text className="block text-sm text-slate-400">未登录</Text>
        )}
      </View>

      {/* 未登录 */}
      {!user && (
        <View className="bg-red-600/20 rounded-2xl p-6 border border-red-500/30 mb-6">
          <Text className="block text-sm text-red-400 text-center mb-4">
            检测到未登录，请先登录后再提升为管理员
          </Text>
          <Button
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold"
            onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
          >
            去登录
          </Button>
          <Button
            className="w-full bg-slate-700 text-white rounded-xl py-3 font-semibold mt-3"
            onClick={handleTestLogin}
          >
            测试登录（H5环境）
          </Button>
        </View>
      )}

      {/* 已登录但token不存在 */}
      {user && !token && (
        <View className="bg-yellow-600/20 rounded-2xl p-6 border border-yellow-500/30 mb-6">
          <Text className="block text-sm text-yellow-400 text-center mb-4">
            检测到用户信息存在但Token缺失，请重新登录
          </Text>
          <Button
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold"
            onClick={() => Taro.reLaunch({ url: '/pages/login/index' })}
          >
            重新登录
          </Button>
        </View>
      )}

      {/* 管理员权限 */}
      {user && token && user.role !== 'admin' && (
        <View className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
          <View className="flex items-center gap-3 mb-4">
            <Shield size={24} color="#60a5fa" />
            <Text className="block text-lg font-semibold text-blue-400">
              管理员权限
            </Text>
          </View>

          <Text className="block text-sm text-slate-300 mb-6">
            一键将当前账号提升为管理员，可以访问用户管理、数据监控、审计日志等功能。
          </Text>

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold"
            onClick={handleBecomeAdmin}
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : '成为管理员'}
          </Button>

          <Text className="block text-xs text-slate-500 mt-3 text-center">
            ⚠️ 此功能仅用于开发环境
          </Text>
        </View>
      )}

      {/* 已是管理员 */}
      {user?.role === 'admin' && (
        <>
          <View className="bg-emerald-600/20 rounded-2xl p-6 border border-emerald-500/30 mb-6">
            <View className="flex items-center justify-center gap-3 mb-4">
              <Shield size={24} color="#10b981" />
              <Text className="block text-lg font-semibold text-emerald-400">
                已是管理员
              </Text>
            </View>

            <Text className="block text-sm text-slate-300 text-center mb-4">
              您当前已拥有管理员权限，可以访问以下管理功能
            </Text>
          </View>

          {/* 管理员功能入口 */}
          <View className="space-y-3 mb-6">
            <Text className="block text-sm font-semibold text-white mb-3">
              管理员功能
            </Text>

            {/* 用户管理 */}
            <View
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700 active:bg-slate-700"
              onClick={() => Taro.navigateTo({ url: '/pages/admin/users/index' })}
            >
              <View className="flex items-center gap-3">
                <User size={20} color="#60a5fa" />
                <Text className="block text-white font-medium">用户管理</Text>
              </View>
              <Text className="block text-xs text-slate-400">管理用户、角色、状态</Text>
            </View>

            {/* 语料库管理 */}
            <View
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700 active:bg-slate-700"
              onClick={() => Taro.navigateTo({ url: '/pages/admin/lexicon-manage/index' })}
            >
              <View className="flex items-center gap-3">
                <Database size={20} color="#60a5fa" />
                <Text className="block text-white font-medium">语料库管理</Text>
              </View>
              <Text className="block text-xs text-slate-400">企业语料、个人IP、产品知识</Text>
            </View>

            {/* 灵感速记管理 */}
            <View
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700 active:bg-slate-700"
              onClick={() => Taro.navigateTo({ url: '/pages/admin/quick-note-manage/index' })}
            >
              <View className="flex items-center gap-3">
                <Sparkles size={20} color="#fbbf24" />
                <Text className="block text-white font-medium">灵感速记管理</Text>
              </View>
              <Text className="block text-xs text-slate-400">查看所有用户的灵感记录</Text>
            </View>

            {/* 知识分享管理 */}
            <View
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700 active:bg-slate-700"
              onClick={() => Taro.navigateTo({ url: '/pages/admin-knowledge-share/index' })}
            >
              <View className="flex items-center gap-3">
                <BookOpen size={20} color="#60a5fa" />
                <Text className="block text-white font-medium">知识分享管理</Text>
              </View>
              <Text className="block text-xs text-slate-400">审核、导出、统计分析</Text>
            </View>

            {/* 回收门店管理 */}
            <View
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700 active:bg-slate-700"
              onClick={() => Taro.navigateTo({ url: '/pages/admin/recycle-management/index' })}
            >
              <View className="flex items-center gap-3">
                <Store size={20} color="#06b6d4" />
                <Text className="block text-white font-medium">回收门店管理</Text>
              </View>
              <Text className="block text-xs text-slate-400">全局统计、回收排行、风险预警</Text>
            </View>

            {/* 数据监控 */}
            <View
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700 active:bg-slate-700"
              onClick={() => Taro.navigateTo({ url: '/pages/admin/dashboard/index' })}
            >
              <View className="flex items-center gap-3">
                <TrendingUp size={20} color="#10b981" />
                <Text className="block text-white font-medium">数据监控</Text>
              </View>
              <Text className="block text-xs text-slate-400">全局统计、用户排行</Text>
            </View>

            {/* 审计日志 */}
            <View
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700 active:bg-slate-700"
              onClick={() => Taro.navigateTo({ url: '/pages/admin/audit/index' })}
            >
              <View className="flex items-center gap-3">
                <ClipboardList size={20} color="#f472b6" />
                <Text className="block text-white font-medium">审计日志</Text>
              </View>
              <Text className="block text-xs text-slate-400">操作记录、日志查询</Text>
            </View>
          </View>
        </>
      )}

      {/* 提示信息 */}
      <View className="mt-8">
        <Text className="block text-xs text-slate-500 text-center leading-relaxed">
          访问管理员页面：{'\n'}
          • 用户管理：/pages/admin/users/index{'\n'}
          • 数据监控：/pages/admin/dashboard/index{'\n'}
          • 审计日志：/pages/admin/audit/index{'\n'}
          • 知识分享管理：/pages/admin-knowledge-share/index{'\n'}
          • 回收门店管理：/pages/recycle/index
        </Text>
      </View>
    </View>
  )
}

export default DevToolsPage
