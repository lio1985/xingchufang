import { useState } from 'react'
import Taro, { useLoad, showToast } from '@tarojs/taro'
import { View, Text, Checkbox, CheckboxGroup, Textarea } from '@tarojs/components'
import { Network } from '@/network'
import { ArrowLeft, Sparkles, Copy, RefreshCw, BookOpen, Check, Wand, Building2, User, Package } from 'lucide-react-taro'

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

interface Lexicon {
  id: string
  title: string
  content: string
  category: string
  tags: any
}

interface LexiconWithCategory extends Lexicon {
  type: 'enterprise' | 'personal' | 'product'
}

type ContentStyle = 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq'

interface Scheme {
  title: string
  content: string
  tags: string[]
}

export default function ViralRemixPage() {
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null)
  const [lexicons, setLexicons] = useState<LexiconWithCategory[]>([])
  const [selectedLexicons, setSelectedLexicons] = useState<string[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string>('all')
  const [remixIdea, setRemixIdea] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSchemes, setGeneratedSchemes] = useState<Scheme[]>([])

  // 风格选项配置
  const styleOptions: Array<{ value: ContentStyle; label: string; color: string; bg: string; titleLimit: string; titleTips: string }> = [
    { 
      value: 'douyin', 
      label: '抖音风格', 
      color: 'text-white', 
      bg: 'bg-gradient-to-r from-pink-500 to-red-500',
      titleLimit: '15-25字（最多50）',
      titleTips: '简洁有力，使用悬念、数字、疑问句吸引点击'
    },
    { 
      value: 'xiaohongshu', 
      label: '小红书风格', 
      color: 'text-white', 
      bg: 'bg-gradient-to-r from-red-400 to-pink-500',
      titleLimit: '15-30字',
      titleTips: '突出关键词，使用emoji，展示干货或价值'
    },
    { 
      value: 'shipinhao', 
      label: '视频号风格', 
      color: 'text-white', 
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      titleLimit: '10-30字',
      titleTips: '简洁明了，直接传达核心信息，适合中老年群体'
    },
    { 
      value: 'gongzhonghao', 
      label: '公众号文章', 
      color: 'text-white', 
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      titleLimit: '20-30字（最多64）',
      titleTips: '专业有价值，避免标题党，体现文章核心观点'
    },
    { 
      value: 'pyq', 
      label: '微信朋友圈', 
      color: 'text-white', 
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      titleLimit: '20-30字',
      titleTips: '开头吸引眼球，用一两句话作为"标题"'
    }
  ]

  useLoad((options) => {
    // 解析完整分析数据
    if (options.analysis) {
      try {
        const analysisData = JSON.parse(decodeURIComponent(options.analysis))
        setAnalysis(analysisData)
        console.log('📝 接收到的完整分析数据:', analysisData)
      } catch (error) {
        console.error('解析分析数据失败:', error)
        showToast({ title: '数据解析失败', icon: 'none' })
      }
    } else {
      showToast({ title: '缺少分析数据', icon: 'none' })
      Taro.navigateBack()
    }

    // 加载所有类型的语料库列表
    loadAllLexicons()
  })

  // 加载所有类型的语料库
  const loadAllLexicons = async () => {
    try {
      const [enterpriseRes, personalRes, productRes] = await Promise.all([
        Network.request({ url: '/api/lexicon', method: 'GET', data: { type: 'enterprise' } }),
        Network.request({ url: '/api/lexicon', method: 'GET', data: { type: 'personal' } }),
        Network.request({ url: '/api/lexicon', method: 'GET', data: { type: 'product' } })
      ])

      const allData: LexiconWithCategory[] = [
        ...(enterpriseRes.data?.data?.items || []).map((item: Lexicon) => ({ ...item, type: 'enterprise' })),
        ...(personalRes.data?.data?.items || []).map((item: Lexicon) => ({ ...item, type: 'personal' })),
        ...(productRes.data?.data?.items || []).map((item: Lexicon) => ({ ...item, type: 'product' }))
      ]

      setLexicons(allData)
    } catch (error) {
      console.error('加载语料库失败:', error)
    }
  }

  // 选择语料库
  const handleLexiconChange = (e: any) => {
    setSelectedLexicons(e.detail.value)
  }

  // 切换类别展开/折叠
  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? '' : category)
  }

  // 切换全部展开/折叠
  const toggleAll = () => {
    if (expandedCategory === 'all') {
      setExpandedCategory('')
    } else {
      setExpandedCategory('all')
    }
  }

  // 优化表述
  const handleOptimizeIdea = async () => {
    if (!remixIdea.trim()) {
      showToast({ title: '请输入改写想法', icon: 'none' })
      return
    }

    setIsOptimizing(true)

    try {
      console.log('🪄 开始优化改写想法:', { remixIdea, style: selectedStyle })

      const response = await Network.request({
        url: '/api/viral/optimize-idea',
        method: 'POST',
        data: {
          idea: remixIdea,
          transcript: analysis?.transcript,
          style: selectedStyle
        }
      })

      console.log('🪄 优化结果:', response.data)

      if (response.data?.code === 200) {
        setRemixIdea(response.data.data.optimizedIdea)
        showToast({ title: '优化成功', icon: 'success' })
      } else {
        showToast({ title: '优化失败', icon: 'none' })
      }
    } catch (error) {
      console.error('优化失败:', error)
      showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setIsOptimizing(false)
    }
  }

  // 生成二创内容
  const handleGenerate = async () => {
    if (!analysis) {
      showToast({ title: '缺少分析数据', icon: 'none' })
      return
    }

    if (!remixIdea.trim()) {
      showToast({ title: '请输入改写想法', icon: 'none' })
      return
    }

    setIsGenerating(true)
    setGeneratedSchemes([])

    try {
      console.log('🚀 开始生成二创内容:', {
        transcriptLength: analysis.transcript.length,
        ideaLength: remixIdea.length,
        selectedLexiconsCount: selectedLexicons.length,
        selectedStyle: selectedStyle
      })

      // 获取选中的语料库内容
      const selectedLexiconData = lexicons.filter(l => selectedLexicons.includes(l.id))
      const lexiconContents = selectedLexiconData.map(l => l.content).join('\n\n')

      const response = await Network.request({
        url: '/api/viral/remix',
        method: 'POST',
        data: {
          transcript: analysis.transcript,
          structure: analysis.structure,
          framework: analysis.framework,
          remixIdea,
          lexiconContents,
          style: selectedStyle
        }
      })

      console.log('🚀 二创内容响应:', response.data)

      if (response.data?.code === 200) {
        setGeneratedSchemes(response.data.data.schemes || [])
        showToast({ title: '生成成功', icon: 'success' })
      } else {
        showToast({ title: response.data?.msg || '生成失败', icon: 'none' })
      }
    } catch (error) {
      console.error('生成二创内容失败:', error)
      showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setIsGenerating(false)
    }
  }

  // 复制内容
  const handleCopy = (scheme: Scheme) => {
    const copyText = `${scheme.title}\n\n${scheme.content}\n\n标签：${scheme.tags.join('、')}`
    Taro.setClipboardData({
      data: copyText,
      success: () => {
        showToast({ title: '复制成功', icon: 'success' })
      }
    })
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
            <ArrowLeft size={22} color="#94a3b8" />
          </View>
          <View className="flex items-center gap-2">
            <Sparkles size={24} color="#60a5fa" />
            <Text className="block text-xl font-bold text-white">二创改写</Text>
          </View>
        </View>
      </View>

      <View className="px-4 mt-6 flex flex-col gap-6">
        {/* 提取的文案 */}
        {analysis && (
          <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
            <View className="flex items-center gap-2 mb-4">
              <BookOpen size={18} color="#34d399" strokeWidth={2.5} />
              <Text className="block text-lg font-bold text-white">提取的文案</Text>
            </View>
            <View className="bg-slate-800/60 rounded-xl p-4 max-h-48 overflow-y-auto">
              <Text className="block text-sm text-slate-200 leading-relaxed">
                {analysis.transcript}
              </Text>
            </View>
          </View>
        )}

        {/* 爆款框架（只读） */}
        {analysis && (
          <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
            <View className="flex items-center gap-2 mb-4">
              <BookOpen size={18} color="#a855f7" strokeWidth={2.5} />
              <Text className="block text-lg font-bold text-white">爆款框架参考</Text>
            </View>
            <View className="bg-emerald-500/20 rounded-xl p-3">
              <Text className="block text-sm font-semibold text-emerald-400 mb-1">
                {analysis.framework.type}
              </Text>
              <Text className="block text-xs text-slate-300">
                {analysis.framework.description}
              </Text>
            </View>
          </View>
        )}

        {/* 语料库选择 - 按类别显示 */}
        <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
          <View className="flex items-center justify-between mb-4">
            <View className="flex items-center gap-2">
              <BookOpen size={18} color="#34d399" strokeWidth={2.5} />
              <Text className="block text-lg font-bold text-white">选择语料库</Text>
            </View>
            <View className="flex items-center gap-2">
              <Text className="block text-sm text-slate-400">
                已选 {selectedLexicons.length} 个
              </Text>
              <View
                className="px-3 py-1.5 bg-slate-800 rounded-lg active:scale-95 transition-all"
                onClick={toggleAll}
              >
                <Text className="text-xs text-white">
                  {expandedCategory === 'all' ? '全部折叠' : '全部展开'}
                </Text>
              </View>
            </View>
          </View>

          {lexicons.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-10">
              <Text className="block text-sm text-slate-400">暂无语料库</Text>
            </View>
          ) : (
            <CheckboxGroup onChange={handleLexiconChange}>
              <View className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                {/* 企业语料库 */}
                {(() => {
                  const enterpriseLexicons = lexicons.filter(l => l.type === 'enterprise')
                  return enterpriseLexicons.length > 0 && (
                    <View className="bg-slate-800/40 rounded-xl overflow-hidden">
                      <View
                        className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 active:bg-emerald-500/20 transition-all"
                        onClick={() => toggleCategory('enterprise')}
                      >
                        <View className="flex items-center gap-2">
                          <Building2 size={16} color="#34d399" strokeWidth={2.5} />
                          <Text className="text-sm font-bold text-white">企业语料库</Text>
                          <View className="px-2 py-0.5 bg-emerald-500/20 rounded">
                            <Text className="text-xs text-emerald-400">{enterpriseLexicons.length}</Text>
                          </View>
                        </View>
                        <Check size={14} color="#34d399" className={`transition-transform ${expandedCategory === 'all' || expandedCategory === 'enterprise' ? 'rotate-90' : ''}`} />
                      </View>
                      {(expandedCategory === 'all' || expandedCategory === 'enterprise') && (
                        <View className="p-3 flex flex-col gap-2">
                          {enterpriseLexicons.map((lexicon) => (
                            <View
                              key={lexicon.id}
                              className="bg-slate-800/60 rounded-lg p-3 active:bg-slate-800/80 transition-all"
                            >
                              <View className="flex items-start gap-3">
                                <Checkbox
                                  value={lexicon.id}
                                  checked={selectedLexicons.includes(lexicon.id)}
                                  color="#34d399"
                                />
                                <View className="flex-1">
                                  <Text className="block text-sm font-semibold text-white mb-1">
                                    {lexicon.title}
                                  </Text>
                                  {lexicon.category && (
                                    <Text className="block text-xs text-slate-400 mb-1">
                                      {lexicon.category}
                                    </Text>
                                  )}
                                  <Text className="block text-xs text-slate-300 line-clamp-2">
                                    {lexicon.content}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )
                })()}

                {/* 个人IP语料库 */}
                {(() => {
                  const personalLexicons = lexicons.filter(l => l.type === 'personal')
                  return personalLexicons.length > 0 && (
                    <View className="bg-slate-800/40 rounded-xl overflow-hidden">
                      <View
                        className="flex items-center justify-between px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 active:bg-slate-9000/20 transition-all"
                        onClick={() => toggleCategory('personal')}
                      >
                        <View className="flex items-center gap-2">
                          <User size={16} color="#60a5fa" strokeWidth={2.5} />
                          <Text className="text-sm font-bold text-white">个人IP语料库</Text>
                          <View className="px-2 py-0.5 bg-slate-9000/20 rounded">
                            <Text className="text-xs text-blue-400">{personalLexicons.length}</Text>
                          </View>
                        </View>
                        <Check size={14} color="#60a5fa" className={`transition-transform ${expandedCategory === 'all' || expandedCategory === 'personal' ? 'rotate-90' : ''}`} />
                      </View>
                      {(expandedCategory === 'all' || expandedCategory === 'personal') && (
                        <View className="p-3 flex flex-col gap-2">
                          {personalLexicons.map((lexicon) => (
                            <View
                              key={lexicon.id}
                              className="bg-slate-800/60 rounded-lg p-3 active:bg-slate-800/80 transition-all"
                            >
                              <View className="flex items-start gap-3">
                                <Checkbox
                                  value={lexicon.id}
                                  checked={selectedLexicons.includes(lexicon.id)}
                                  color="#60a5fa"
                                />
                                <View className="flex-1">
                                  <Text className="block text-sm font-semibold text-white mb-1">
                                    {lexicon.title}
                                  </Text>
                                  {lexicon.category && (
                                    <Text className="block text-xs text-slate-400 mb-1">
                                      {lexicon.category}
                                    </Text>
                                  )}
                                  <Text className="block text-xs text-slate-300 line-clamp-2">
                                    {lexicon.content}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )
                })()}

                {/* 产品知识库 */}
                {(() => {
                  const productLexicons = lexicons.filter(l => l.type === 'product')
                  return productLexicons.length > 0 && (
                    <View className="bg-slate-800/40 rounded-xl overflow-hidden">
                      <View
                        className="flex items-center justify-between px-4 py-3 bg-purple-500/10 border-b border-purple-500/20 active:bg-purple-500/20 transition-all"
                        onClick={() => toggleCategory('product')}
                      >
                        <View className="flex items-center gap-2">
                          <Package size={16} color="#a855f7" strokeWidth={2.5} />
                          <Text className="text-sm font-bold text-white">产品知识库</Text>
                          <View className="px-2 py-0.5 bg-purple-500/20 rounded">
                            <Text className="text-xs text-purple-400">{productLexicons.length}</Text>
                          </View>
                        </View>
                        <Check size={14} color="#a855f7" className={`transition-transform ${expandedCategory === 'all' || expandedCategory === 'product' ? 'rotate-90' : ''}`} />
                      </View>
                      {(expandedCategory === 'all' || expandedCategory === 'product') && (
                        <View className="p-3 flex flex-col gap-2">
                          {productLexicons.map((lexicon) => (
                            <View
                              key={lexicon.id}
                              className="bg-slate-800/60 rounded-lg p-3 active:bg-slate-800/80 transition-all"
                            >
                              <View className="flex items-start gap-3">
                                <Checkbox
                                  value={lexicon.id}
                                  checked={selectedLexicons.includes(lexicon.id)}
                                  color="#a855f7"
                                />
                                <View className="flex-1">
                                  <Text className="block text-sm font-semibold text-white mb-1">
                                    {lexicon.title}
                                  </Text>
                                  {lexicon.category && (
                                    <Text className="block text-xs text-slate-400 mb-1">
                                      {lexicon.category}
                                    </Text>
                                  )}
                                  <Text className="block text-xs text-slate-300 line-clamp-2">
                                    {lexicon.content}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )
                })()}
              </View>
            </CheckboxGroup>
          )}
        </View>

        {/* 改写想法 */}
        <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
          <View className="flex items-center justify-between mb-4">
            <View className="flex items-center gap-2">
              <Wand size={18} color="#f59e0b" strokeWidth={2.5} />
              <Text className="block text-lg font-bold text-white">改写想法</Text>
            </View>
            {remixIdea.trim() && (
              <View
                className={`px-3 py-1.5 rounded-lg active:scale-95 transition-all ${
                  isOptimizing
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-purple-500 text-white'
                }`}
                onClick={!isOptimizing ? handleOptimizeIdea : undefined}
              >
                <View className="flex items-center gap-1">
                  {isOptimizing ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <Text className="text-xs">
                    {isOptimizing ? '优化中...' : '优化表述'}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View className="bg-slate-800/60 rounded-xl p-4">
            <Textarea
              className="w-full bg-transparent text-slate-200 text-base leading-relaxed"
              placeholder="请输入你的改写想法，例如：重点突出产品优势，增加购买引导..."
              value={remixIdea}
              onInput={(e) => setRemixIdea(e.detail.value)}
              maxlength={500}
              style={{ minHeight: '120px' }}
            />
          </View>

          {/* 风格选择 */}
          <View className="mt-4">
            <Text className="block text-sm font-semibold text-white mb-3">选择文案风格</Text>
            <View className="flex flex-wrap gap-2">
              {styleOptions.map((option) => (
                <View
                  key={option.value}
                  className={`px-4 py-2 rounded-xl border-2 transition-all ${
                    selectedStyle === option.value
                      ? `${option.bg} border-transparent text-white`
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  onClick={() => setSelectedStyle(option.value)}
                >
                  <Text className="text-xs font-medium">{option.label}</Text>
                </View>
              ))}
            </View>

            {/* 标题限制提示 */}
            {selectedStyle && (() => {
              const selectedOption = styleOptions.find(opt => opt.value === selectedStyle)
              return selectedOption && (
                <View className="mt-3 px-4 py-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <View className="flex items-start gap-2">
                    <Text className="text-lg">💡</Text>
                    <View className="flex-1">
                      <Text className="block text-sm text-blue-400 mb-1">
                        {selectedOption.label}标题限制：{selectedOption.titleLimit}
                      </Text>
                      <Text className="block text-xs text-slate-400">
                        {selectedOption.titleTips}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })()}
          </View>
        </View>

        {/* 生成按钮 */}
        <View
          className={`py-4 rounded-xl text-center transition-all ${
            isGenerating || !remixIdea.trim()
              ? 'bg-slate-800 text-slate-400'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white active:scale-[0.98]'
          }`}
          onClick={!isGenerating && remixIdea.trim() ? handleGenerate : undefined}
        >
          {isGenerating ? (
            <View className="flex items-center justify-center gap-2">
              <RefreshCw size={18} className="animate-spin" />
              <Text>生成2个方案中...</Text>
            </View>
          ) : (
            <View className="flex items-center justify-center gap-2">
              <Sparkles size={18} />
              <Text>生成二创方案</Text>
            </View>
          )}
        </View>

        {/* 生成结果 - 2个方案 */}
        {generatedSchemes.length > 0 && (
          <View className="flex flex-col gap-6">
            <Text className="block text-lg font-bold text-white text-center">
              生成结果
            </Text>
            
            {generatedSchemes.map((scheme, idx) => (
              <View
                key={idx}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5"
              >
                <View className="flex items-center justify-between mb-4">
                  <View className="flex items-center gap-2">
                    <Check size={18} color="#34d399" strokeWidth={2.5} />
                    <Text className="block text-lg font-bold text-white">
                      方案 {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1.5 bg-slate-9000/20 rounded-lg active:scale-95 transition-all"
                    onClick={() => handleCopy(scheme)}
                  >
                    <View className="flex items-center gap-1">
                      <Copy size={14} color="#60a5fa" />
                      <Text className="text-xs text-blue-400">复制</Text>
                    </View>
                  </View>
                </View>

                {/* 标题 */}
                <View className="mb-4">
                  <View className="flex items-center justify-between mb-2">
                    <Text className="block text-xs text-slate-400">标题</Text>
                    <Text className={`text-xs ${scheme.title.length > 50 ? 'text-red-400' : scheme.title.length >= 30 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {scheme.title.length}字
                    </Text>
                  </View>
                  <View className="bg-slate-800/60 rounded-xl p-4">
                    <Text className="block text-base font-semibold text-white">
                      {scheme.title}
                    </Text>
                  </View>
                </View>

                {/* 内容 */}
                <View className="mb-4">
                  <Text className="block text-xs text-slate-400 mb-2">内容</Text>
                  <View className="bg-slate-800/60 rounded-xl p-4">
                    <Text className="block text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {scheme.content}
                    </Text>
                  </View>
                </View>

                {/* 标签 */}
                {scheme.tags && scheme.tags.length > 0 && (
                  <View>
                    <Text className="block text-xs text-slate-400 mb-2">标签</Text>
                    <View className="flex flex-wrap gap-2">
                      {scheme.tags.map((tag, tagIdx) => (
                        <View key={tagIdx} className="px-3 py-1.5 bg-slate-9000/20 rounded-lg">
                          <Text className="text-xs text-blue-400">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}

            {/* 重新生成 */}
            <View
              className={`py-3 rounded-xl text-center transition-all ${
                isGenerating
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-800 text-slate-300 active:scale-[0.98]'
              }`}
              onClick={!isGenerating ? handleGenerate : undefined}
            >
              <View className="flex items-center justify-center gap-2">
                <RefreshCw size={16} color="#94a3b8" />
                <Text className="text-sm">重新生成</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
