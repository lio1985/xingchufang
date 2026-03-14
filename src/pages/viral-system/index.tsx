import { useState } from 'react'
import Taro, { useLoad, showToast } from '@tarojs/taro'
import { View, Text, Textarea } from '@tarojs/components'
import { Network } from '@/network'
import { TrendingUp, Link2, Copy, RefreshCw, Heart, Plus, Check, FileText, BookOpen, Sparkles, Loader, Type } from 'lucide-react-taro'

type Step = 'input' | 'analyzing' | 'completed'
type InputMode = 'link' | 'text'

interface ViralAnalysis {
  transcript: string
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
}

export default function ViralSystemPage() {
  const [step, setStep] = useState<Step>('input')
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [douyinUrl, setDouyinUrl] = useState('')
  const [directText, setDirectText] = useState('')
  const [currentAnalysis, setCurrentAnalysis] = useState<ViralAnalysis | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [progress, setProgress] = useState(0)

  useLoad((options) => {
    // 检查登录状态
    const token = Taro.getStorageSync('token')
    if (!token) {
      showToast({ title: '请先登录', icon: 'none' })
      Taro.navigateBack()
      return
    }

    // 检查是否有传入的内容（从语料优化系统跳转过来）
    if (options.content) {
      console.log('接收到内容:', options.content)
    }
  })

  // 处理分析（支持链接和直接文本）
  const handleAnalyze = async () => {
    if (inputMode === 'link') {
      // 链接模式
      if (!douyinUrl.trim()) {
        showToast({ title: '请输入抖音链接', icon: 'none' })
        return
      }

      if (!douyinUrl.includes('douyin.com') && !douyinUrl.includes('v.douyin.com')) {
        showToast({ title: '请输入有效的抖音链接（以https://v.douyin.com开头）', icon: 'none' })
        return
      }
    } else {
      // 文案模式
      if (!directText.trim()) {
        showToast({ title: '请输入文案内容', icon: 'none' })
        return
      }

      if (directText.trim().length < 10) {
        showToast({ title: '文案内容太短，至少需要10个字符', icon: 'none' })
        return
      }
    }

    setIsProcessing(true)
    setStep('analyzing')
    setProgress(0)

    try {
      console.log(inputMode === 'link' ? '🎬 开始分析抖音视频:' : '📝 开始分析文案:', 
        inputMode === 'link' ? { url: douyinUrl } : { textLength: directText.length })

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 500)

      let analyzeRes
      if (inputMode === 'link') {
        // 链接模式 - 调用抖音分析接口，发送完整的分享文本
        analyzeRes = await Network.request({
          url: '/api/viral/analyze-douyin',
          method: 'POST',
          data: { shareText: douyinUrl }
        })
      } else {
        // 文案模式 - 直接分析文案内容
        analyzeRes = await Network.request({
          url: '/api/viral/analyze',
          method: 'POST',
          data: { 
            transcript: directText,
            platform: 'douyin'
          }
        })
      }

      clearInterval(progressInterval)
      setProgress(100)

      console.log(inputMode === 'link' ? '🎬 抖音视频分析响应:' : '📝 文案分析响应:', analyzeRes.data)

      if (analyzeRes.data?.code !== 200) {
        throw new Error(analyzeRes.data?.msg || '分析失败')
      }

      const analysis = {
        transcript: analyzeRes.data.data.transcript || directText,
        structure: analyzeRes.data.data.structure,
        framework: analyzeRes.data.data.framework
      }

      setCurrentAnalysis(analysis)
      setStep('completed')
      showToast({ title: '分析完成', icon: 'success' })
    } catch (error) {
      console.error('分析失败:', error)
      showToast({ title: error.message || '分析失败，请重试', icon: 'none' })
      setStep('input')
    } finally {
      setIsProcessing(false)
    }
  }

  // 收藏爆款框架
  const handleFavorite = async () => {
    if (!currentAnalysis) return

    // 如果已收藏，跳过
    if (isFavorited) {
      showToast({ title: '已收藏', icon: 'none' })
      return
    }

    try {
      const response = await Network.request({
        url: '/api/viral/favorite',
        method: 'POST',
        data: {
          title: `爆款框架 - ${currentAnalysis.framework.type}`,
          structure: currentAnalysis.structure,
          framework: currentAnalysis.framework
        }
      })

      console.log('📥 收藏响应:', response.data)

      if (response.data?.code === 200) {
        setIsFavorited(true)
        showToast({ title: '收藏成功', icon: 'success' })
      } else {
        showToast({ title: response.data?.msg || '收藏失败', icon: 'none' })
      }
    } catch (error) {
      console.error('收藏失败:', error)
      showToast({ title: '网络错误，请重试', icon: 'none' })
    }
  }

  // 二创改写
  const handleRemix = () => {
    if (!currentAnalysis) {
      showToast({ title: '没有可二创的内容', icon: 'none' })
      return
    }

    // 跳转到二创改写页面，传递完整分析数据
    const analysisData = encodeURIComponent(JSON.stringify({
      transcript: currentAnalysis.transcript,
      structure: currentAnalysis.structure,
      framework: currentAnalysis.framework
    }))
    
    Taro.navigateTo({
      url: `/pages/viral-remix/index?analysis=${analysisData}`
    })
  }

  // 复制文本
  const handleCopy = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        showToast({ title: '复制成功', icon: 'success' })
      }
    })
  }

  // 重置
  const handleReset = () => {
    setDouyinUrl('')
    setDirectText('')
    setCurrentAnalysis(null)
    setIsFavorited(false)
    setStep('input')
  }

  // 跳转到收藏夹
  const handleGoToFavorites = () => {
    Taro.navigateTo({
      url: '/pages/viral-favorites/index'
    })
  }

  return (
    <View className="min-h-screen bg-slate-900 pb-8">
      {/* 头部导航 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-5">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} color="#f87171" strokeWidth={2.5} />
            </View>
            <Text className="block text-xl font-bold text-white">爆款复刻系统</Text>
          </View>
          <View
            className="px-3 py-2 bg-slate-700/50 rounded-xl active:scale-95 transition-all"
            onClick={handleGoToFavorites}
          >
            <View className="flex items-center gap-1.5">
              <Heart size={18} color="#ef4444" />
              <Text className="text-sm text-slate-200">收藏夹</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 mt-6 flex flex-col gap-6">
        {/* 步骤指示器 */}
        {step !== 'input' && (
          <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
            <View className="flex items-center justify-center gap-8">
              {[
                { key: 'analyzing', label: '正在分析', icon: Sparkles },
                { key: 'completed', label: '完成', icon: Check }
              ].map((item) => {
                const steps = ['analyzing', 'completed']
                const currentIndex = steps.indexOf(step)
                const itemIndex = steps.indexOf(item.key as Step)
                const isActive = currentIndex === itemIndex
                const isPast = currentIndex > itemIndex

                return (
                  <View key={item.key} className="flex-1 flex flex-col items-center gap-2">
                    <View
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-red-500 shadow-lg shadow-red-500/30'
                          : isPast
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      {isPast ? (
                        <Check size={18} color="white" strokeWidth={3} />
                      ) : (
                        <item.icon size={18} color={isActive ? 'white' : '#94a3b8'} strokeWidth={2.5} />
                      )}
                    </View>
                    <Text
                      className={`text-xs font-medium ${
                        isActive ? 'text-white' : isPast ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </View>
                )
              })}
            </View>
            {isProcessing && (
              <View className="mt-6 bg-slate-700/60 rounded-2xl p-5">
                <View className="flex items-center justify-between mb-3">
                  <View className="flex items-center gap-2">
                    <Loader size={18} color="#60a5fa" className="animate-spin" />
                    <Text className="text-sm font-medium text-white">
                      正在分析抖音视频，提取文字内容
                    </Text>
                  </View>
                  <Text className="text-sm text-blue-400 font-bold">
                    {Math.round(progress)}%
                  </Text>
                </View>
                <View className="h-2 bg-slate-600 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </View>
                <View className="mt-3 flex flex-col gap-1.5">
                  <Text className="text-xs text-slate-400 flex items-center gap-1.5">
                    {progress >= 20 && <Check size={12} color="#34d399" />}
                    {progress >= 20 ? '✓ 获取视频信息' : '正在获取视频信息...'}
                  </Text>
                  <Text className="text-xs text-slate-400 flex items-center gap-1.5">
                    {progress >= 50 && <Check size={12} color="#34d399" />}
                    {progress >= 50 ? '✓ 提取视频内容' : '正在提取视频内容...'}
                  </Text>
                  <Text className="text-xs text-slate-400 flex items-center gap-1.5">
                    {progress >= 80 && <Check size={12} color="#34d399" />}
                    {progress >= 80 ? '✓ 输出爆款框架' : '正在输出爆款框架...'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 输入区域 */}
        {step === 'input' && (
          <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
            {/* 模式切换 */}
            <View className="flex items-center gap-2 mb-5 bg-slate-700/50 rounded-xl p-1">
              <View
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'text'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-transparent'
                }`}
                onClick={() => setInputMode('text')}
              >
                <Type size={16} color={inputMode === 'text' ? '#fff' : '#94a3b8'} />
                <Text className={`text-sm font-medium ${inputMode === 'text' ? 'text-white' : 'text-slate-400'}`}>
                  粘贴文案
                </Text>
              </View>
              <View
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'link'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-transparent'
                }`}
                onClick={() => setInputMode('link')}
              >
                <Link2 size={16} color={inputMode === 'link' ? '#fff' : '#94a3b8'} />
                <Text className={`text-sm font-medium ${inputMode === 'link' ? 'text-white' : 'text-slate-400'}`}>
                  抖音链接
                </Text>
              </View>
            </View>

            {/* 标题 */}
            <View className="flex items-center gap-2 mb-4">
              <View className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                {inputMode === 'link' ? (
                  <Link2 size={18} color="#f87171" strokeWidth={2.5} />
                ) : (
                  <Type size={18} color="#f87171" strokeWidth={2.5} />
                )}
              </View>
              <Text className="block text-lg font-bold text-white">
                {inputMode === 'link' ? '输入抖音分享链接' : '粘贴抖音文案'}
              </Text>
            </View>

            {/* 输入框 */}
            <View className="bg-slate-700/60 rounded-2xl p-4 mb-4">
              {inputMode === 'link' ? (
                <Textarea
                  className="w-full bg-transparent text-slate-200 text-base leading-relaxed"
                  placeholder="请输入抖音视频分享链接，如：https://v.douyin.com/xxxxx"
                  value={douyinUrl}
                  onInput={(e) => setDouyinUrl(e.detail.value)}
                  maxlength={500}
                  style={{ minHeight: '100px' }}
                />
              ) : (
                <Textarea
                  className="w-full bg-transparent text-slate-200 text-base leading-relaxed"
                  placeholder="请粘贴抖音视频的文案内容...&#10;例如：8.74 这样的窗帘文案，一定有流量 AI合拍也太好玩了吧 #AI窗帘店的财富祝福"
                  value={directText}
                  onInput={(e) => setDirectText(e.detail.value)}
                  maxlength={2000}
                  style={{ minHeight: '150px' }}
                />
              )}
            </View>

            <Text className="block text-xs text-slate-400 mb-4">
              {inputMode === 'link' 
                ? '💡 系统将自动提取视频文字内容并进行爆款分析（暂仅支持文案模式）'
                : '💡 系统将对您粘贴的文案进行爆款结构分析'}
            </Text>

            <View
              className={`py-4 rounded-xl text-center transition-all ${
                isProcessing || (inputMode === 'link' ? !douyinUrl.trim() : !directText.trim())
                  ? 'bg-slate-700 text-slate-400'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white active:scale-[0.98]'
              }`}
              onClick={!isProcessing ? handleAnalyze : undefined}
            >
              {isProcessing ? (
                <View className="flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="animate-spin" />
                  <Text>分析中...</Text>
                </View>
              ) : (
                <View className="flex items-center justify-center gap-2">
                  <Sparkles size={18} />
                  <Text>开始分析</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 分析结果 */}
        {step === 'completed' && currentAnalysis && (
          <>
            {/* 提取的文字 */}
            <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
              <View className="flex items-center justify-between mb-4">
                <View className="flex items-center gap-2">
                  <View className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText size={18} color="#60a5fa" strokeWidth={2.5} />
                  </View>
                  <Text className="block text-lg font-bold text-white">提取内容</Text>
                </View>
                <View
                  className="px-3 py-1.5 bg-slate-700/50 rounded-lg active:scale-95 transition-all"
                  onClick={() => handleCopy(currentAnalysis.transcript)}
                >
                  <View className="flex items-center gap-1">
                    <Copy size={14} color="#94a3b8" />
                    <Text className="text-xs text-slate-300">复制</Text>
                  </View>
                </View>
              </View>
              <View className="bg-slate-700/60 rounded-2xl p-4">
                <Text className="block text-sm text-slate-200 leading-relaxed">
                  {currentAnalysis.transcript}
                </Text>
              </View>
            </View>

            {/* 爆款框架分析 */}
            <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
              <View className="flex items-center gap-2 mb-4">
                <View className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen size={18} color="#a855f7" strokeWidth={2.5} />
                </View>
                <Text className="block text-lg font-bold text-white">爆款框架</Text>
              </View>

              <View className="space-y-4">
                <View className="bg-slate-700/60 rounded-xl p-4">
                  <Text className="block text-sm font-bold text-emerald-400 mb-2">框架类型</Text>
                  <Text className="block text-base text-white">{currentAnalysis.framework.type}</Text>
                  <Text className="block text-sm text-slate-400 mt-2">{currentAnalysis.framework.description}</Text>
                </View>

                <View className="bg-slate-700/60 rounded-xl p-4">
                  <Text className="block text-sm font-bold text-blue-400 mb-2">结构拆解</Text>
                  <View className="space-y-3">
                    <View>
                      <Text className="block text-xs font-semibold text-slate-300 mb-1">🎣 钩子（Hook）</Text>
                      <Text className="block text-sm text-slate-200">{currentAnalysis.structure.hook}</Text>
                    </View>
                    <View>
                      <Text className="block text-xs font-semibold text-slate-300 mb-1">📝 主体内容</Text>
                      {currentAnalysis.structure.body.map((item, idx) => (
                        <Text key={idx} className="block text-sm text-slate-200 mb-1">
                          {idx + 1}. {item}
                        </Text>
                      ))}
                    </View>
                    <View>
                      <Text className="block text-xs font-semibold text-slate-300 mb-1">🔥 高潮（Climax）</Text>
                      <Text className="block text-sm text-slate-200">{currentAnalysis.structure.climax}</Text>
                    </View>
                    <View>
                      <Text className="block text-xs font-semibold text-slate-300 mb-1">📢 号召（CTA）</Text>
                      <Text className="block text-sm text-slate-200">{currentAnalysis.structure.callToAction}</Text>
                    </View>
                  </View>
                </View>

                <View className="bg-slate-700/60 rounded-xl p-4">
                  <Text className="block text-sm font-bold text-orange-400 mb-2">关键要点</Text>
                  {currentAnalysis.framework.keyPoints.map((point, idx) => (
                    <View key={idx} className="flex items-start gap-2 mb-2">
                      <View className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                      <Text className="block text-sm text-slate-200">{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 操作按钮 */}
            <View className="flex flex-row gap-3">
              <View
                className={`flex-1 py-4 rounded-xl active:scale-[0.98] transition-all ${
                  isFavorited
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
                onClick={handleFavorite}
              >
                <View className="flex items-center justify-center gap-2">
                  <Heart size={18} color="white" />
                  <Text className="text-white font-medium">
                    {isFavorited ? '已收藏' : '收藏爆款框架'}
                  </Text>
                </View>
              </View>
              <View
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 active:scale-[0.98] transition-all"
                onClick={handleRemix}
              >
                <View className="flex items-center justify-center gap-2">
                  <Plus size={18} color="white" />
                  <Text className="text-white font-medium">二创改写</Text>
                </View>
              </View>
            </View>

            {/* 重新分析 */}
            <View
              className="py-3 rounded-xl bg-slate-700/50 active:scale-[0.98] transition-all"
              onClick={handleReset}
            >
              <View className="flex items-center justify-center gap-2">
                <RefreshCw size={16} color="#94a3b8" />
                <Text className="text-sm text-slate-300">重新分析</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  )
}
