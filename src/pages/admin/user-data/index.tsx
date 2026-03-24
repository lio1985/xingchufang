import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Network } from '@/network'

export default function UserDataPage() {
  const router = useRouter()
  const type = router.params.type || 'conversations'
  const userId = router.params.userId || ''
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])

  const getTypeConfig = () => {
    switch (type) {
      case 'conversations':
        return {
          title: '对话记录',
          icon: <Text>💬</Text>,
          api: `/api/conversation/list?userId=${userId}`,
          emptyText: '暂无对话记录'
        }
      case 'lexicons':
        return {
          title: '语料库',
          icon: <Text>📄</Text>,
          api: `/api/lexicon?userId=${userId}`,
          emptyText: '暂无语料库'
        }
      case 'files':
        return {
          title: '文件上传',
          icon: <Text>📂</Text>,
          api: `/api/multimedia/list?userId=${userId}`,
          emptyText: '暂无文件'
        }
      case 'tasks':
        return {
          title: '任务计划',
          icon: <Text>✓</Text>,
          api: `/api/work-plans?userId=${userId}`,
          emptyText: '暂无任务'
        }
      case 'audit':
        return {
          title: '操作日志',
          icon: <Text>📋</Text>,
          api: `/api/user/operation-logs?userId=${userId}`,
          emptyText: '暂无操作日志'
        }
      default:
        return {
          title: '数据',
          icon: null,
          api: '',
          emptyText: '暂无数据'
        }
    }
  }

  const loadData = async () => {
    if (!userId) {
      Taro.showToast({
        title: '用户ID不存在',
        icon: 'none'
      })
      return
    }

    const config = getTypeConfig()
    setLoading(true)

    try {
      const res = await Network.request({
        url: config.api,
        method: 'GET'
      })

      console.log(`${config.title}响应:`, res.data)

      if (res.data && res.data.code === 200) {
        setData(res.data.data || [])
      } else {
        setData([])
      }
    } catch (error: any) {
      console.error(`加载${config.title}失败:`, error)
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, userId])

  const renderConversationItem = (item: any) => (
    <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <View className="flex justify-between items-start mb-2">
        <Text className="text-white font-semibold block">{item.title || '未命名对话'}</Text>
        <Text className="text-slate-400 text-xs">
          {new Date(item.created_at || item.createdAt).toLocaleDateString('zh-CN')}
        </Text>
      </View>
      <Text className="text-slate-400 text-sm block mb-2">
        模型: {item.model || '未知'}
      </Text>
      <Text className="text-slate-400 text-xs block">
        消息数: {item.message_count || item.messageCount || 0}
      </Text>
    </View>
  )

  const renderLexiconItem = (item: any) => (
    <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <View className="flex justify-between items-start mb-2">
        <Text className="text-white font-semibold block">{item.title || '未命名语料'}</Text>
        <Text className="text-slate-400 text-xs">
          {new Date(item.created_at || item.createdAt).toLocaleDateString('zh-CN')}
        </Text>
      </View>
      <View className="mb-2">
        <Text className="text-blue-400 text-xs block mb-1">{item.category || '未分类'}</Text>
      </View>
      <Text className="text-slate-400 text-sm block line-clamp-2">
        {item.content || '无内容'}
      </Text>
    </View>
  )

  const renderFileItem = (item: any) => (
    <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <View className="flex items-start gap-3 mb-2">
        <Text>📂</Text>
        <View className="flex-1 min-w-0">
          <Text className="text-white font-semibold block truncate">{item.name || item.title || '未命名文件'}</Text>
          <Text className="text-slate-400 text-xs block">
            {item.file_type || item.type || '未知类型'}
          </Text>
        </View>
      </View>
      <Text className="text-slate-400 text-xs block">
        大小: {item.file_size ? (item.file_size / 1024).toFixed(2) + ' KB' : '未知'}
      </Text>
      <Text className="text-slate-400 text-xs block">
        上传时间: {new Date(item.created_at || item.createdAt).toLocaleString('zh-CN')}
      </Text>
    </View>
  )

  const renderTaskItem = (item: any) => (
    <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <View className="flex justify-between items-start mb-2">
        <Text className="text-white font-semibold block">{item.title || '未命名任务'}</Text>
        <Text className="text-slate-400 text-xs">
          {item.status || '未知状态'}
        </Text>
      </View>
      {item.description && (
        <Text className="text-slate-400 text-sm block mb-2 line-clamp-2">
          {item.description}
        </Text>
      )}
      <Text className="text-slate-400 text-xs block">
        创建时间: {new Date(item.created_at || item.createdAt).toLocaleString('zh-CN')}
      </Text>
    </View>
  )

  const renderAuditLogItem = (item: any) => (
    <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <View className="flex justify-between items-start mb-2">
        <Text className="text-white font-semibold block">{item.operation || '未知操作'}</Text>
        <Text className="text-slate-400 text-xs">
          {new Date(item.created_at || item.createdAt).toLocaleString('zh-CN')}
        </Text>
      </View>
      {item.resource_type && (
        <Text className="text-blue-400 text-xs block mb-1">
          资源类型: {item.resource_type}
        </Text>
      )}
      {item.ip_address && (
        <Text className="text-slate-400 text-xs block mb-1">
          IP地址: {item.ip_address}
        </Text>
      )}
      <Text className={`text-xs block ${item.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
        状态: {item.status || '未知'}
      </Text>
    </View>
  )

  const renderItem = (item: any) => {
    switch (type) {
      case 'conversations':
        return renderConversationItem(item)
      case 'lexicons':
        return renderLexiconItem(item)
      case 'files':
        return renderFileItem(item)
      case 'tasks':
        return renderTaskItem(item)
      case 'audit':
        return renderAuditLogItem(item)
      default:
        return null
    }
  }

  const config = getTypeConfig()

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部导航栏 */}
      <View className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <View className="flex items-center gap-3">
          <View onClick={() => Taro.navigateBack()}>
            <Text>←</Text>
          </View>
          <View className="flex items-center gap-2">
            {config.icon}
            <Text className="text-white font-semibold">{config.title}</Text>
          </View>
        </View>
      </View>

      {/* 内容列表 */}
      <ScrollView
        className="flex-1"
        scrollY
      >
        <View className="px-4 py-3 space-y-3">
          {loading && (
            <View className="text-center py-12">
              <Text className="text-slate-400">加载中...</Text>
            </View>
          )}

          {!loading && data.length > 0 && data.map((item, index) => (
            <View key={index}>
              {renderItem(item)}
            </View>
          ))}

          {!loading && data.length === 0 && (
            <View className="text-center py-12">
              <Text className="text-slate-400">{config.emptyText}</Text>
            </View>
          )}

          {/* 底部空间 */}
          <View className="h-20"></View>
        </View>
      </ScrollView>
    </View>
  )
}
