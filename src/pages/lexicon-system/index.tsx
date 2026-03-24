import { useState, useEffect } from 'react'
import Taro, { showToast } from '@tarojs/taro'
import { View, Text, Textarea, Checkbox, CheckboxGroup } from '@tarojs/components'
import { Network } from '@/network'

interface Lexicon {
  id: string
  title: string
  content: string
  type: 'enterprise' | 'personal' | 'product'
  category?: string
  created_at: string
}

export default function LexiconSystemPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 语料库相关状态
  const [lexicons, setLexicons] = useState<Lexicon[]>([])
  const [selectedLexicons, setSelectedLexicons] = useState<string[]>([])
  const [expandedCategory, setExpandedCategory] = useState<'all' | 'none' | 'enterprise' | 'personal' | 'product'>('none')

  // 加载语料库列表
  const loadLexicons = async () => {
    try {
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'GET'
      })

      if (response.data?.code === 200 && response.data?.data) {
        // 后端返回的数据结构是 { items, total, page, pageSize }
        const lexiconData = Array.isArray(response.data.data.items) ? response.data.data.items : []
        setLexicons(lexiconData)
      } else {
        setLexicons([])
      }
    } catch (error) {
      console.error('加载语料库失败:', error)
      setLexicons([])
    }
  }

  useEffect(() => {
    loadLexicons()
  }, [])

  // 切换类别折叠/展开
  const toggleCategory = (category: 'enterprise' | 'personal' | 'product') => {
    if (expandedCategory === category) {
      setExpandedCategory('none' as any)
    } else {
      setExpandedCategory(category)
    }
  }

  // 全部折叠/展开
  const toggleAll = () => {
    if (expandedCategory === 'all') {
      setExpandedCategory('none' as any)
    } else {
      setExpandedCategory('all')
    }
  }

  // 处理多选框变化
  const handleLexiconChange = (event: any) => {
    setSelectedLexicons(event.detail.value as string[])
  }

  const handleOptimize = async () => {
    if (!inputText.trim()) {
      showToast({ title: '请输入要优化的文本', icon: 'none' })
      return
    }

    if (selectedLexicons.length === 0) {
      showToast({ title: '请至少选择一个语料库', icon: 'none' })
      return
    }

    setIsProcessing(true)

    try {
      const response = await Network.request({
        url: '/api/lexicon/optimize',
        method: 'POST',
        data: {
          inputText,
          lexiconIds: selectedLexicons
        }
      })

      if (response.data?.code === 200 && response.data?.data) {
        setOutputText(response.data.data.optimizedText)
        showToast({ title: '优化成功', icon: 'success' })
      } else {
        showToast({ title: response.data?.msg || '优化失败', icon: 'none' })
      }
    } catch (error) {
      console.error('语料优化失败:', error)
      showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = () => {
    if (!outputText) {
      showToast({ title: '没有可复制的内容', icon: 'none' })
      return
    }

    Taro.setClipboardData({
      data: outputText,
      success: () => {
        showToast({ title: '复制成功', icon: 'success' })
      }
    })
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
  }

  const handleNavigateToManage = () => {
    Taro.navigateTo({ url: '/pages/lexicon-manage/index' })
  }

  return (
    <View className="min-h-screen bg-slate-900 pb-8">
      {/* 头部导航 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-5">
        <View className="flex items-center gap-3">
          <View className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center">
            <Text>✨</Text>
          </View>
          <Text className="block text-xl font-bold text-white">语料优化系统</Text>
        </View>
      </View>

      <View className="px-4 mt-6 flex flex-col gap-6">
        {/* 知识库选择 */}
        <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden">
          {/* 标题栏 */}
          <View className="bg-gradient-to-r from-slate-800/95 to-slate-900/80 px-5 py-4 border-b border-slate-700/60">
            <View className="flex items-center justify-between mb-3">
              <View className="flex items-center gap-2.5">
                <View className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl flex items-center justify-center">
                  <Text>📖</Text>
                </View>
                <View>
                  <Text className="block text-base font-bold text-white">选择语料库</Text>
                  <Text className="block text-xs text-slate-400 mt-0.5">多选语料以获得更全面的优化效果</Text>
                </View>
              </View>
              <View
                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
                onClick={handleNavigateToManage}
              >
                <Text>⚙</Text>
                <Text className="block text-xs text-emerald-400 font-medium">管理</Text>
              </View>
            </View>
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-2">
                <View className="px-2.5 py-1 bg-blue-500/10 rounded-lg">
                  <Text className="block text-xs text-blue-400 font-medium">已选 {selectedLexicons.length} 个</Text>
                </View>
              </View>
              <View
                className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800/80 rounded-lg active:scale-95 transition-all flex items-center gap-1.5"
                onClick={toggleAll}
              >
                {expandedCategory === 'all' ? (
                  <Text>▼</Text>
                ) : (
                  <Text>{">"}</Text>
                )}
                <Text className="block text-xs text-slate-300">
                  {expandedCategory === 'all' ? '全部折叠' : '全部展开'}
                </Text>
              </View>
            </View>
          </View>

          {/* 语料库列表 */}
          <View className="p-4">
            {lexicons.length === 0 ? (
              <View className="flex flex-col items-center justify-center py-16">
                <View className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <Text>📖</Text>
                </View>
                <Text className="block text-base text-slate-400 font-medium mb-2">暂无语料库</Text>
                <Text className="block text-sm text-slate-400">点击右上角管理按钮添加语料</Text>
              </View>
            ) : (
              <CheckboxGroup onChange={handleLexiconChange}>
                <View className="flex flex-col gap-3 max-h-[28rem] overflow-y-auto pr-1">
                {/* 企业语料库 */}
                {(() => {
                  const enterpriseLexicons = lexicons.filter(l => l.type === 'enterprise')
                  return enterpriseLexicons.length > 0 && (
                    <View className="bg-gradient-to-br from-slate-700/30 to-slate-700/20 rounded-2xl overflow-hidden border border-slate-700">
                      <View
                        className="flex items-center justify-between px-4 py-3.5 bg-emerald-500/5 hover:bg-emerald-500/10 border-b border-emerald-500/15 active:bg-emerald-500/15 transition-all cursor-pointer"
                        onClick={() => toggleCategory('enterprise')}
                      >
                        <View className="flex items-center gap-2.5">
                          <View className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Text>🏢</Text>
                          </View>
                          <Text className="block text-sm font-bold text-white">企业语料库</Text>
                          <View className="px-2 py-0.5 bg-emerald-500/20 rounded-md border border-emerald-500/30">
                            <Text className="block text-xs text-emerald-400 font-semibold">{enterpriseLexicons.length}</Text>
                          </View>
                        </View>
                        {expandedCategory === 'all' || expandedCategory === 'enterprise' ? (
                          <Text>▼</Text>
                        ) : (
                          <Text>{">"}</Text>
                        )}
                      </View>
                      {(expandedCategory === 'all' || expandedCategory === 'enterprise') && (
                        <View className="p-3.5 flex flex-col gap-2.5">
                          {enterpriseLexicons.map((lexicon) => (
                            <View
                              key={lexicon.id}
                              className="bg-slate-800 hover:bg-slate-800/70 rounded-xl p-3.5 border border-slate-700 hover:border-slate-700/50 active:bg-slate-800/80 active:scale-[0.99] transition-all"
                            >
                              <View className="flex items-start gap-3">
                                <View className="pt-0.5">
                                  <Text>✓</Text>
                                </View>
                                <View className="flex-1 min-w-0">
                                  <Text className="block text-sm font-semibold text-white mb-1.5 line-clamp-1">
                                    {lexicon.title}
                                  </Text>
                                  {lexicon.category && (
                                    <View className="mb-2">
                                      <Text className="inline-block text-xs text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md">
                                        {lexicon.category}
                                      </Text>
                                    </View>
                                  )}
                                  <Text className="block text-xs text-slate-300 leading-relaxed line-clamp-2">
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
                    <View className="bg-gradient-to-br from-slate-700/30 to-slate-700/20 rounded-2xl overflow-hidden border border-slate-700">
                      <View
                        className="flex items-center justify-between px-4 py-3.5 bg-blue-500/5 hover:bg-blue-500/10 border-b border-blue-500/15 active:bg-blue-500/15 transition-all cursor-pointer"
                        onClick={() => toggleCategory('personal')}
                      >
                        <View className="flex items-center gap-2.5">
                          <View className="w-8 h-8 bg-slate-9000/20 rounded-lg flex items-center justify-center">
                            <Text>👤</Text>
                          </View>
                          <Text className="block text-sm font-bold text-white">个人IP语料库</Text>
                          <View className="px-2 py-0.5 bg-slate-9000/20 rounded-md border border-sky-500/30">
                            <Text className="block text-xs text-blue-400 font-semibold">{personalLexicons.length}</Text>
                          </View>
                        </View>
                        {expandedCategory === 'all' || expandedCategory === 'personal' ? (
                          <Text>▼</Text>
                        ) : (
                          <Text>{">"}</Text>
                        )}
                      </View>
                      {(expandedCategory === 'all' || expandedCategory === 'personal') && (
                        <View className="p-3.5 flex flex-col gap-2.5">
                          {personalLexicons.map((lexicon) => (
                            <View
                              key={lexicon.id}
                              className="bg-slate-800 hover:bg-slate-800/70 rounded-xl p-3.5 border border-slate-700 hover:border-slate-700/50 active:bg-slate-800/80 active:scale-[0.99] transition-all"
                            >
                              <View className="flex items-start gap-3">
                                <View className="pt-0.5">
                                  <Text>✓</Text>
                                </View>
                                <View className="flex-1 min-w-0">
                                  <Text className="block text-sm font-semibold text-white mb-1.5 line-clamp-1">
                                    {lexicon.title}
                                  </Text>
                                  {lexicon.category && (
                                    <View className="mb-2">
                                      <Text className="inline-block text-xs text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md">
                                        {lexicon.category}
                                      </Text>
                                    </View>
                                  )}
                                  <Text className="block text-xs text-slate-300 leading-relaxed line-clamp-2">
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
                    <View className="bg-gradient-to-br from-slate-700/30 to-slate-700/20 rounded-2xl overflow-hidden border border-slate-700">
                      <View
                        className="flex items-center justify-between px-4 py-3.5 bg-purple-500/5 hover:bg-purple-500/10 border-b border-purple-500/15 active:bg-purple-500/15 transition-all cursor-pointer"
                        onClick={() => toggleCategory('product')}
                      >
                        <View className="flex items-center gap-2.5">
                          <View className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Text>📦</Text>
                          </View>
                          <Text className="block text-sm font-bold text-white">产品知识库</Text>
                          <View className="px-2 py-0.5 bg-purple-500/20 rounded-md border border-purple-500/30">
                            <Text className="block text-xs text-purple-400 font-semibold">{productLexicons.length}</Text>
                          </View>
                        </View>
                        {expandedCategory === 'all' || expandedCategory === 'product' ? (
                          <Text>▼</Text>
                        ) : (
                          <Text>{">"}</Text>
                        )}
                      </View>
                      {(expandedCategory === 'all' || expandedCategory === 'product') && (
                        <View className="p-3.5 flex flex-col gap-2.5">
                          {productLexicons.map((lexicon) => (
                            <View
                              key={lexicon.id}
                              className="bg-slate-800 hover:bg-slate-800/70 rounded-xl p-3.5 border border-slate-700 hover:border-slate-700/50 active:bg-slate-800/80 active:scale-[0.99] transition-all"
                            >
                              <View className="flex items-start gap-3">
                                <View className="pt-0.5">
                                  <Text>✓</Text>
                                </View>
                                <View className="flex-1 min-w-0">
                                  <Text className="block text-sm font-semibold text-white mb-1.5 line-clamp-1">
                                    {lexicon.title}
                                  </Text>
                                  {lexicon.category && (
                                    <View className="mb-2">
                                      <Text className="inline-block text-xs text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md">
                                        {lexicon.category}
                                      </Text>
                                    </View>
                                  )}
                                  <Text className="block text-xs text-slate-300 leading-relaxed line-clamp-2">
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

        {/* 输入区域 */}
        <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
          <View className="flex justify-between items-center mb-4">
            <Text className="block text-lg font-bold text-white tracking-wide">输入文本</Text>
            <Text className="block text-xs text-slate-400 font-medium">{inputText.length}/2000</Text>
          </View>
          <View className="bg-slate-800/60 rounded-2xl p-4 mb-4">
            <Textarea
              className="w-full bg-transparent text-slate-200 text-base leading-relaxed"
              placeholder="请输入需要优化的文本..."
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              maxlength={2000}
              style={{ minHeight: '140px' }}
            />
          </View>
          <View className="flex flex-row gap-3">
            <View
              className={`flex-1 py-4 rounded-xl text-center flex items-center justify-center transition-all ${
                isProcessing || !inputText.trim()
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              }`}
              onClick={handleOptimize}
            >
              {isProcessing ? (
                <Text>🔄</Text>
              ) : (
                <Text className="block text-white font-bold text-base tracking-wide">开始优化</Text>
              )}
            </View>
            <View
              className="w-14 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center active:scale-95 transition-all"
              onClick={handleClear}
            >
              <Text>🔄</Text>
            </View>
          </View>
        </View>

        {/* 输出区域 */}
        {outputText && (
          <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
            <View className="flex justify-between items-center mb-4">
              <Text className="block text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <View className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Text>✓</Text>
                </View>
                优化结果
              </Text>
              <View
                className="px-4 py-2 bg-slate-800/80 rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
                onClick={handleCopy}
              >
                <Text>📋</Text>
                <Text className="block text-white text-xs font-medium">复制</Text>
              </View>
            </View>
            <View className="bg-slate-800/60 rounded-2xl p-4">
              <Text className="block text-slate-200 text-base leading-relaxed">
                {outputText}
              </Text>
            </View>
          </View>
        )}

        {/* 执行机制说明 */}
        <View className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20 p-5">
          <View className="flex items-center gap-2 mb-4">
            <Text>⚡</Text>
            <Text className="block text-base font-bold text-white">执行机制</Text>
          </View>
          <Text className="block text-sm text-slate-300 leading-relaxed mb-3">
            所有输出脚本必须经过语料替换与人工优化，确保自然表达与专业统一。
          </Text>
          <View className="space-y-2">
            <View className="flex items-start gap-2">
              <View className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
              <Text className="block text-sm text-slate-400">使用企业语料库确保专业术语统一</Text>
            </View>
            <View className="flex items-start gap-2">
              <View className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
              <Text className="block text-sm text-slate-400">使用个人IP语料库保持主播风格</Text>
            </View>
            <View className="flex items-start gap-2">
              <View className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
              <Text className="block text-sm text-slate-400">使用产品知识库突出产品卖点</Text>
            </View>
            <View className="flex items-start gap-2">
              <View className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
              <Text className="block text-sm text-slate-400">人工复核确保表达自然流畅</Text>
            </View>
          </View>
        </View>

        {/* 提示信息 */}
        <View className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5">
          <Text className="block text-sm text-slate-400 leading-relaxed">
            💡 提示：选择语料库后，系统会根据选中的语料库对文本进行优化，使表达更自然、更专业。支持多选语料库以获得更全面的优化效果。
          </Text>
        </View>
      </View>
    </View>
  </View>
  )
}
