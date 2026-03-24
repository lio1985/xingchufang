import { useState } from 'react'
import Taro, { useLoad, showToast } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Network } from '@/network'

interface ViralFavorite {
  id: string
  title: string
  structure: {
    hook: string
    body: string[]
    climax: string
    callToAction: string
  }
  framework: {
    type: string
    description: string
    keyPoints: string[]
  }
  created_at: string
}

export default function ViralFavoritesPage() {
  const [favorites, setFavorites] = useState<ViralFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFavorite, setSelectedFavorite] = useState<ViralFavorite | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useLoad(() => {
    loadFavorites()
  })

  // 加载收藏列表
  const loadFavorites = async () => {
    try {
      setLoading(true)
      const response = await Network.request({
        url: '/api/viral/favorites',
        method: 'GET'
      })

      console.log('📋 收藏列表响应:', response.data)

      if (response.data?.code === 200) {
        setFavorites(response.data.data || [])
      } else {
        showToast({ title: response.data?.msg || '加载失败', icon: 'none' })
      }
    } catch (error) {
      console.error('加载收藏列表失败:', error)
      showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  // 删除收藏
  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation()
    
    try {
      const response = await Network.request({
        url: `/api/viral/favorites/${id}`,
        method: 'DELETE'
      })

      if (response.data?.code === 200) {
        showToast({ title: '删除成功', icon: 'success' })
        loadFavorites()
      } else {
        showToast({ title: response.data?.msg || '删除失败', icon: 'none' })
      }
    } catch (error) {
      console.error('删除收藏失败:', error)
      showToast({ title: '网络错误，请重试', icon: 'none' })
    }
  }

  // 查看详情
  const handleViewDetail = (item: ViralFavorite) => {
    setSelectedFavorite(item)
    setShowDetail(true)
  }

  // 格式化时间
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    }
  }

  return (
    <View className="min-h-screen bg-slate-900 pb-8">
      {/* 头部导航 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-5">
        <View className="flex items-center gap-3">
          <View
            className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            onClick={() => Taro.navigateBack()}
          >
            <Text>←</Text>
          </View>
          <View className="flex items-center gap-2">
            <Text>❤️</Text>
            <Text className="block text-xl font-bold text-white">收藏夹</Text>
          </View>
        </View>
      </View>

      <View className="px-4 mt-6">
        {/* 加载中 */}
        {loading ? (
          <View className="flex flex-col items-center justify-center py-20">
            <Text className="block text-sm text-slate-400">加载中...</Text>
          </View>
        ) : /* 空状态 */
        favorites.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Text>❤️</Text>
            </View>
            <Text className="block text-base text-slate-400 mb-2">还没有收藏</Text>
            <Text className="block text-sm text-slate-400">去爆款复刻系统收藏一些爆款框架吧</Text>
          </View>
        ) : /* 收藏列表 */
        (
          <View className="flex flex-col gap-4">
            {favorites.map((item) => (
              <View
                key={item.id}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5 active:scale-[0.99] transition-all"
                onClick={() => handleViewDetail(item)}
              >
                {/* 标题和时间 */}
                <View className="flex items-start justify-between mb-3">
                  <View className="flex-1 pr-3">
                    <Text className="block text-lg font-bold text-white mb-1">{item.title}</Text>
                    <View className="flex items-center gap-2">
                      <Text>📅</Text>
                      <Text className="block text-xs text-slate-400">{formatDate(item.created_at)}</Text>
                    </View>
                  </View>
                  <View
                    className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    <Text>🗑</Text>
                  </View>
                </View>

                {/* 框架类型标签 */}
                <View className="bg-emerald-500/20 rounded-lg px-3 py-1.5 mb-3 self-start">
                  <Text className="block text-sm font-semibold text-emerald-400">
                    {item.framework.type}
                  </Text>
                </View>

                {/* 框架描述 */}
                <Text className="block text-sm text-slate-300 leading-relaxed mb-3 line-clamp-2">
                  {item.framework.description}
                </Text>

                {/* 关键要点预览 */}
                <View className="flex flex-wrap gap-2">
                  {item.framework.keyPoints.slice(0, 2).map((point, idx) => (
                    <View
                      key={idx}
                      className="bg-slate-800/60 rounded-lg px-3 py-1.5"
                    >
                      <Text className="block text-xs text-slate-300 line-clamp-1">
                        {point}
                      </Text>
                    </View>
                  ))}
                  {item.framework.keyPoints.length > 2 && (
                    <View className="bg-slate-800/60 rounded-lg px-3 py-1.5">
                      <Text className="block text-xs text-slate-400">
                        +{item.framework.keyPoints.length - 2}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 查看详情按钮 */}
                <View className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-center gap-2">
                  <Text>📖</Text>
                  <Text className="block text-sm text-blue-400">查看详情</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 详情弹窗 */}
      {showDetail && selectedFavorite && (
        <View
          className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          onClick={() => setShowDetail(false)}
        >
          <View
            className="w-full max-h-[80vh] bg-slate-800 rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View className="sticky top-0 bg-slate-800 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
              <Text className="block text-lg font-bold text-white">爆款框架详情</Text>
              <View
                className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                onClick={() => setShowDetail(false)}
              >
                <Text className="block text-xl text-slate-400">×</Text>
              </View>
            </View>

            {/* 弹窗内容 */}
            <View className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
              {/* 标题 */}
              <Text className="block text-xl font-bold text-white mb-3">{selectedFavorite.title}</Text>

              {/* 框架类型 */}
              <View className="bg-emerald-500/20 rounded-xl p-4 mb-4">
                <Text className="block text-sm font-bold text-emerald-400 mb-2">框架类型</Text>
                <Text className="block text-base text-white mb-1">{selectedFavorite.framework.type}</Text>
                <Text className="block text-sm text-slate-300">{selectedFavorite.framework.description}</Text>
              </View>

              {/* 结构拆解 */}
              <View className="bg-slate-800/60 rounded-xl p-4 mb-4">
                <Text className="block text-sm font-bold text-blue-400 mb-3">结构拆解</Text>
                <View className="space-y-3">
                  <View>
                    <Text className="block text-xs font-semibold text-slate-300 mb-1">🎣 钩子（Hook）</Text>
                    <Text className="block text-sm text-slate-200">{selectedFavorite.structure.hook}</Text>
                  </View>
                  <View>
                    <Text className="block text-xs font-semibold text-slate-300 mb-1">📝 主体内容</Text>
                    {selectedFavorite.structure.body.map((item, idx) => (
                      <Text key={idx} className="block text-sm text-slate-200 mb-1">
                        {idx + 1}. {item}
                      </Text>
                    ))}
                  </View>
                  <View>
                    <Text className="block text-xs font-semibold text-slate-300 mb-1">🔥 高潮（Climax）</Text>
                    <Text className="block text-sm text-slate-200">{selectedFavorite.structure.climax}</Text>
                  </View>
                  <View>
                    <Text className="block text-xs font-semibold text-slate-300 mb-1">📢 号召（CTA）</Text>
                    <Text className="block text-sm text-slate-200">{selectedFavorite.structure.callToAction}</Text>
                  </View>
                </View>
              </View>

              {/* 关键要点 */}
              <View className="bg-slate-800/60 rounded-xl p-4">
                <Text className="block text-sm font-bold text-orange-400 mb-2">关键要点</Text>
                {selectedFavorite.framework.keyPoints.map((point, idx) => (
                  <View key={idx} className="flex items-start gap-2 mb-2">
                    <View className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                    <Text className="block text-sm text-slate-200">{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
