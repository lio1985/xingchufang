import { useState } from 'react'
import Taro, { useLoad, showToast } from '@tarojs/taro'
import { View, Text, CheckboxGroup, Textarea } from '@tarojs/components'
import { Network } from '@/network'
import {
  ChevronLeft,
  Sparkles,
  BookOpen,
  Building2,
  User,
  Package,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronRight,
  Lightbulb,
} from 'lucide-react-taro'

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
  const styleOptions: Array<{ value: ContentStyle; label: string; color: string }> = [
    { value: 'douyin', label: '抖音风格', color: '#ec4899' },
    { value: 'xiaohongshu', label: '小红书风格', color: '#f43f5e' },
    { value: 'shipinhao', label: '视频号风格', color: '#3b82f6' },
    { value: 'gongzhonghao', label: '公众号文章', color: '#10b981' },
    { value: 'pyq', label: '微信朋友圈', color: '#22c55e' }
  ]

  useLoad((options) => {
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
    loadAllLexicons()
  })

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

  const handleLexiconChange = (e: any) => {
    setSelectedLexicons(e.detail.value)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? '' : category)
  }

  const toggleAll = () => {
    setExpandedCategory(prev => prev === 'all' ? '' : 'all')
  }

  const handleOptimizeIdea = async () => {
    if (!remixIdea.trim()) {
      showToast({ title: '请输入改写想法', icon: 'none' })
      return
    }
    setIsOptimizing(true)
    try {
      const response = await Network.request({
        url: '/api/viral/optimize-idea',
        method: 'POST',
        data: { idea: remixIdea, transcript: analysis?.transcript, style: selectedStyle }
      })
      if (response.data?.code === 200) {
        setRemixIdea(response.data.data.optimizedIdea)
        showToast({ title: '优化成功', icon: 'success' })
      } else {
        showToast({ title: '优化失败', icon: 'none' })
      }
    } catch (error) {
      showToast({ title: '网络错误', icon: 'none' })
    } finally {
      setIsOptimizing(false)
    }
  }

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
      if (response.data?.code === 200) {
        setGeneratedSchemes(response.data.data.schemes || [])
        showToast({ title: '创建成功', icon: 'success' })
      } else {
        showToast({ title: response.data?.msg || '创建失败', icon: 'none' })
      }
    } catch (error) {
      showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (scheme: Scheme) => {
    const copyText = `${scheme.title}\n\n${scheme.content}\n\n标签：${scheme.tags.join('、')}`
    Taro.setClipboardData({
      data: copyText,
      success: () => showToast({ title: '复制成功', icon: 'success' })
    })
  }

  // 按类型分组语料库
  const enterpriseLexicons = lexicons.filter(l => l.type === 'enterprise')
  const personalLexicons = lexicons.filter(l => l.type === 'personal')
  const productLexicons = lexicons.filter(l => l.type === 'product')

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* 头部导航 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={24} color="#fafafa" />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} color="#f59e0b" />
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>二创改写</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 提取的文案 */}
        {analysis && (
          <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BookOpen size={18} color="#f59e0b" />
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>提取的文案</Text>
            </View>
            <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', maxHeight: '120px', overflow: 'hidden' }}>
              <Text style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '20px' }}>{analysis.transcript}</Text>
            </View>
          </View>
        )}

        {/* 爆款框架 */}
        {analysis && (
          <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Lightbulb size={18} color="#22c55e" />
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>爆款框架参考</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e', marginBottom: '4px', display: 'block' }}>{analysis.framework.type}</Text>
              <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>{analysis.framework.description}</Text>
            </View>
          </View>
        )}

        {/* 语料库选择 */}
        <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#3b82f6" />
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>选择语料库</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>已选 {selectedLexicons.length} 个</Text>
              <View
                style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#1e3a5f' }}
                onClick={toggleAll}
              >
                <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>{expandedCategory === 'all' ? '全部折叠' : '全部展开'}</Text>
              </View>
            </View>
          </View>

          {lexicons.length === 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
              <Text style={{ fontSize: '14px', color: '#71717a' }}>暂无语料库</Text>
            </View>
          ) : (
            <CheckboxGroup onChange={handleLexiconChange}>
              <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 企业语料库 */}
                {enterpriseLexicons.length > 0 && (
                  <View style={{ backgroundColor: '#0a0f1a', borderRadius: '10px', overflow: 'hidden' }}>
                    <View
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderBottom: expandedCategory === 'all' || expandedCategory === 'enterprise' ? '1px solid #1e3a5f' : 'none' }}
                      onClick={() => toggleCategory('enterprise')}
                    >
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#22c55e" />
                        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>企业语料库</Text>
                        <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                          <Text style={{ fontSize: '11px', color: '#22c55e' }}>{enterpriseLexicons.length}</Text>
                        </View>
                      </View>
                      {expandedCategory === 'all' || expandedCategory === 'enterprise' ? <ChevronDown size={16} color="#71717a" /> : <ChevronRight size={16} color="#71717a" />}
                    </View>
                    {(expandedCategory === 'all' || expandedCategory === 'enterprise') && (
                      <View style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {enterpriseLexicons.map((lexicon) => (
                          <View key={lexicon.id} style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
                            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block' }}>{lexicon.title}</Text>
                            {lexicon.category && <Text style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px', display: 'block' }}>{lexicon.category}</Text>}
                            <Text style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lexicon.content}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* 个人IP语料库 */}
                {personalLexicons.length > 0 && (
                  <View style={{ backgroundColor: '#0a0f1a', borderRadius: '10px', overflow: 'hidden' }}>
                    <View
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderBottom: expandedCategory === 'all' || expandedCategory === 'personal' ? '1px solid #1e3a5f' : 'none' }}
                      onClick={() => toggleCategory('personal')}
                    >
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="#3b82f6" />
                        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>个人IP语料库</Text>
                        <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                          <Text style={{ fontSize: '11px', color: '#3b82f6' }}>{personalLexicons.length}</Text>
                        </View>
                      </View>
                      {expandedCategory === 'all' || expandedCategory === 'personal' ? <ChevronDown size={16} color="#71717a" /> : <ChevronRight size={16} color="#71717a" />}
                    </View>
                    {(expandedCategory === 'all' || expandedCategory === 'personal') && (
                      <View style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {personalLexicons.map((lexicon) => (
                          <View key={lexicon.id} style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
                            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block' }}>{lexicon.title}</Text>
                            {lexicon.category && <Text style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px', display: 'block' }}>{lexicon.category}</Text>}
                            <Text style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lexicon.content}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* 产品知识库 */}
                {productLexicons.length > 0 && (
                  <View style={{ backgroundColor: '#0a0f1a', borderRadius: '10px', overflow: 'hidden' }}>
                    <View
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderBottom: expandedCategory === 'all' || expandedCategory === 'product' ? '1px solid #1e3a5f' : 'none' }}
                      onClick={() => toggleCategory('product')}
                    >
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} color="#a855f7" />
                        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>产品知识库</Text>
                        <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                          <Text style={{ fontSize: '11px', color: '#a855f7' }}>{productLexicons.length}</Text>
                        </View>
                      </View>
                      {expandedCategory === 'all' || expandedCategory === 'product' ? <ChevronDown size={16} color="#71717a" /> : <ChevronRight size={16} color="#71717a" />}
                    </View>
                    {(expandedCategory === 'all' || expandedCategory === 'product') && (
                      <View style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {productLexicons.map((lexicon) => (
                          <View key={lexicon.id} style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
                            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block' }}>{lexicon.title}</Text>
                            {lexicon.category && <Text style={{ fontSize: '11px', color: '#71717a', marginBottom: '4px', display: 'block' }}>{lexicon.category}</Text>}
                            <Text style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lexicon.content}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </CheckboxGroup>
          )}
        </View>

        {/* 改写想法 */}
        <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#a855f7" />
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>改写想法</Text>
            </View>
            {remixIdea.trim() && (
              <View
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', backgroundColor: isOptimizing ? '#1e3a5f' : 'rgba(168, 85, 247, 0.2)' }}
                onClick={!isOptimizing ? handleOptimizeIdea : undefined}
              >
                {isOptimizing ? <RefreshCw size={12} color="#71717a" /> : <Sparkles size={12} color="#a855f7" />}
                <Text style={{ fontSize: '12px', color: isOptimizing ? '#71717a' : '#a855f7' }}>{isOptimizing ? '优化中...' : '优化表述'}</Text>
              </View>
            )}
          </View>
          <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
            <Textarea
              style={{ width: '100%', minHeight: '100px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
              placeholder="请输入你的改写想法，例如：重点突出产品优势，增加购买引导..."
              placeholderStyle="color: #52525b"
              value={remixIdea}
              onInput={(e) => setRemixIdea(e.detail.value)}
              maxlength={500}
            />
          </View>

          {/* 风格选择 */}
          <View style={{ marginTop: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '12px', display: 'block' }}>选择文案风格</Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {styleOptions.map((option) => (
                <View
                  key={option.value}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    backgroundColor: selectedStyle === option.value ? option.color : '#1e3a5f',
                    border: selectedStyle === option.value ? 'none' : '1px solid #334155'
                  }}
                  onClick={() => setSelectedStyle(option.value)}
                >
                  <Text style={{ fontSize: '13px', color: selectedStyle === option.value ? '#ffffff' : '#a1a1aa' }}>{option.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 创建按钮 */}
        <View
          style={{ 
            padding: '14px', 
            borderRadius: '12px', 
            backgroundColor: isGenerating || !remixIdea.trim() ? '#1e3a5f' : '#f59e0b', 
            textAlign: 'center' 
          }}
          onClick={!isGenerating && remixIdea.trim() ? handleGenerate : undefined}
        >
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isGenerating ? <RefreshCw size={18} color="#71717a" /> : <Sparkles size={18} color={remixIdea.trim() ? '#0a0f1a' : '#71717a'} />}
            <Text style={{ fontSize: '15px', fontWeight: '600', color: isGenerating || !remixIdea.trim() ? '#71717a' : '#0a0f1a' }}>
              {isGenerating ? '创建2个方案中...' : '创建二创方案'}
            </Text>
          </View>
        </View>

        {/* 创建结果 */}
        {generatedSchemes.length > 0 && (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', textAlign: 'center' }}>创建结果</Text>
            
            {generatedSchemes.map((scheme, idx) => (
              <View key={idx} style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '16px' }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>方案 {String.fromCharCode(65 + idx)}</Text>
                  <View
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#1e3a5f' }}
                    onClick={() => handleCopy(scheme)}
                  >
                    <Copy size={14} color="#3b82f6" />
                    <Text style={{ fontSize: '12px', color: '#3b82f6' }}>复制</Text>
                  </View>
                </View>

                {/* 标题 */}
                <View style={{ marginBottom: '12px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>标题</Text>
                    <Text style={{ fontSize: '11px', color: scheme.title.length > 50 ? '#ef4444' : scheme.title.length >= 30 ? '#f59e0b' : '#22c55e' }}>{scheme.title.length}字</Text>
                  </View>
                  <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff' }}>{scheme.title}</Text>
                  </View>
                </View>

                {/* 内容 */}
                <View style={{ marginBottom: '12px' }}>
                  <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px', display: 'block' }}>内容</Text>
                  <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
                    <Text style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '22px', whiteSpace: 'pre-wrap' }}>{scheme.content}</Text>
                  </View>
                </View>

                {/* 标签 */}
                {scheme.tags && scheme.tags.length > 0 && (
                  <View>
                    <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px', display: 'block' }}>标签</Text>
                    <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {scheme.tags.map((tag, tagIdx) => (
                        <View key={tagIdx} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                          <Text style={{ fontSize: '12px', color: '#3b82f6' }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}

            {/* 重新创建 */}
            <View
              style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#111827', textAlign: 'center', border: '1px solid #1e3a5f' }}
              onClick={!isGenerating ? handleGenerate : undefined}
            >
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <RefreshCw size={14} color="#a1a1aa" />
                <Text style={{ fontSize: '14px', color: '#a1a1aa' }}>重新创建</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
