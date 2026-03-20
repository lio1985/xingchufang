import { useState, useEffect, useCallback, useRef } from 'react'
import Taro, { showToast, showModal } from '@tarojs/taro'
import { View, Text, Textarea, Input, Button } from '@tarojs/components'
import { Network } from '@/network'
import { Database, Plus, Pencil, Trash2, Building2, User, Search, X, Save, Mic, FileText, Brain, Sparkles, Package, Video, TrendingUp, Circle, Check, Share2, Users } from 'lucide-react-taro'

interface Lexicon {
  id: string
  title: string
  content: string
  category: string
  type: 'enterprise' | 'personal' | 'product'
  product_id?: string  // 关联的产品ID
  created_at: string
  is_shared?: boolean
  share_scope?: 'custom' | 'all' | 'department'
  shared_with_users?: string[]
  shared_at?: string
}

interface Product {
  id: string
  name: string
  category: string
  description: string
  created_at: string
}

interface LiveScript {
  id: string
  title: string
  date: string
  content: string
  duration?: number  // 直播时长（分钟）
  viewer_count?: number  // 观看人数
  analysis?: LiveAnalysis
  created_at: string
}

interface LiveAnalysis {
  banned_words: string[]  // 违禁词
  sensitive_words: string[]  // 敏感词
  suggestions: string[]  // 优化建议
  score: number  // 综合评分
  summary: string  // 直播总结
  highlights: string[]  // 直播亮点
}

interface AIProfile {
  profile: {
    position: string
    characteristics: string[]
    values: string[]
  }
  style: {
    writingStyle: string
    languageFeatures: string
    structure: string
  }
  commonPhrases: string[]
  tone: {
    mainTone: string
    emotionalTone: string
    variety: string[]
  }
  semantics: {
    coreThemes: string[]
    keywords: string[]
    semanticFields: string[]
  }
}

type KnowledgeBaseType = 'enterprise' | 'personal' | 'product'

export default function LexiconManagePage() {
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentType, setCurrentType] = useState<KnowledgeBaseType>('enterprise')
  const [lexicons, setLexicons] = useState<Lexicon[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLexicon, setEditingLexicon] = useState<Lexicon | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '', category: '' })

  // 文件上传相关
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')

  // 录音相关
  const [recorderManager, setRecorderManager] = useState<Taro.RecorderManager | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioPath, setAudioPath] = useState('')

  // 产品相关
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [productFormData, setProductFormData] = useState({ name: '', category: '', description: '' })

  // 直播话术相关
  const [liveScripts, setLiveScripts] = useState<LiveScript[]>([])
  const [showLiveScriptModal, setShowLiveScriptModal] = useState(false)
  const [showLiveScriptDetailModal, setShowLiveScriptDetailModal] = useState(false)
  const [editingLiveScript, setEditingLiveScript] = useState<LiveScript | null>(null)
  const [analyzingScriptId, setAnalyzingScriptId] = useState<string | null>(null)
  const [liveScriptFormData, setLiveScriptFormData] = useState({
    title: '',
    date: '',
    content: '',
    duration: '',
    viewer_count: ''
  })

  // 系统 分析相关
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 共享相关
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingLexicon, setSharingLexicon] = useState<Lexicon | null>(null)
  const [shareScope, setShareScope] = useState<'custom' | 'all' | 'department'>('custom')
  const [sharedUsers, setSharedUsers] = useState<string[]>([])
  const [allUsers, setAllUsers] = useState<Array<{ id: string; nickname: string }>>([])
  const [loadingShareUsers, setLoadingShareUsers] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'style' | 'phrases' | 'tone' | 'semantics'>('profile')

  // 错别字校正相关
  const [showCorrectModal, setShowCorrectModal] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [correctedText, setCorrectedText] = useState('')
  const [isCorrecting, setIsCorrecting] = useState(false)
  const [hasErrors, setHasErrors] = useState(false)
  const [errorCount, setErrorCount] = useState(0)

  // 选择模式相关（用于二创改写选择语料库）
  const [selectMode, setSelectMode] = useState(false)
  const [selectedLexicons, setSelectedLexicons] = useState<string[]>([])
  const [allLexicons, setAllLexicons] = useState<Lexicon[]>([]) // 选择模式下显示所有语料

  // 加载语料列表
  const loadLexicons = useCallback(async () => {
    try {
      // 选择模式下，加载所有类型的语料库
      if (selectMode) {
        const [enterpriseRes, personalRes, productRes] = await Promise.all([
          Network.request({ url: '/api/lexicon', method: 'GET', data: { type: 'enterprise' } }),
          Network.request({ url: '/api/lexicon', method: 'GET', data: { type: 'personal' } }),
          Network.request({ url: '/api/lexicon', method: 'GET', data: { type: 'product' } })
        ])

        const allData = [
          ...(enterpriseRes.data?.data?.items || []).map((item: Lexicon) => ({ ...item })),
          ...(personalRes.data?.data?.items || []).map((item: Lexicon) => ({ ...item })),
          ...(productRes.data?.data?.items || []).map((item: Lexicon) => ({ ...item }))
        ]
        setAllLexicons(allData)
        console.log('📝 选择模式加载所有语料:', allData.length)
      } else {
        // 普通模式，按类型加载
        const params: any = { type: currentType }
        if (currentType === 'product' && selectedProduct) {
          params.product_id = selectedProduct.id
        }

        const response = await Network.request({
          url: '/api/lexicon',
          method: 'GET',
          data: params
        })

        console.log('语料列表响应:', response.data)

        if (response.statusCode === 200 && response.data?.data) {
          // 后端返回的数据结构是 { items, total, page, pageSize }
          const lexiconData = Array.isArray(response.data.data.items) ? response.data.data.items : []
          setLexicons(lexiconData)
        } else {
          setLexicons([])
        }
      }
    } catch (error) {
      console.error('加载语料列表失败:', error)
      if (selectMode) {
        setAllLexicons([])
      } else {
        setLexicons([])
      }
    }
  }, [currentType, selectedProduct, selectMode])

  // 加载产品列表
  const loadProducts = useCallback(async () => {
    try {
      const response = await Network.request({
        url: '/api/products',
        method: 'GET'
      })

      console.log('产品列表响应:', response.data)

      if (response.statusCode === 200 && response.data?.data) {
        setProducts(response.data.data || [])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('加载产品列表失败:', error)
      setProducts([])
    }
  }, [])

  // 初始化：游客模式也允许浏览
  useEffect(() => {
    // 游客模式不需要强制登录
  }, [])

  useEffect(() => {
    loadLexicons()
  }, [currentType, loadLexicons])

  // 初始化录音管理器
  useEffect(() => {
    if (isWeapp) {
      const manager = Taro.getRecorderManager()

      manager.onStart(() => {
        console.log('录音开始')
        setIsRecording(true)
        setRecordingDuration(0)
        const timer = setInterval(() => {
          setRecordingDuration(prev => prev + 1)
        }, 1000)
        return () => clearInterval(timer)
      })

      manager.onStop((res) => {
        console.log('录音结束', res.tempFilePath)
        setAudioPath(res.tempFilePath)
        setIsRecording(false)
      })

      manager.onError((err) => {
        console.error('录音错误', err)
        showToast({ title: '录音失败', icon: 'none' })
        setIsRecording(false)
      })

      setRecorderManager(manager)
    }
  }, [isWeapp])

  // 检测是否进入选择模式
  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage && currentPage.options) {
      const mode = currentPage.options.mode
      if (mode === 'select') {
        setSelectMode(true)
        console.log('📝 进入选择模式')
      }
    }
  }, [])

  // 切换语料库类型
  // 切换语料库类型
  const handleSwitchType = (type: KnowledgeBaseType) => {
    setCurrentType(type)
    setSearchKeyword('')
    setSelectedProduct(null)

    // 如果选择产品知识库，显示产品选择弹窗
    if (type === 'product') {
      loadProducts()
      setShowProductModal(true)
    }
  }

  // 选择模式：切换语料库选中状态
  const handleToggleLexiconSelection = (lexiconId: string) => {
    setSelectedLexicons(prev => {
      if (prev.includes(lexiconId)) {
        return prev.filter(id => id !== lexiconId)
      } else {
        return [...prev, lexiconId]
      }
    })
  }

  // 选择模式：全选
  const handleSelectAll = () => {
    const allIds = allLexicons.map(l => l.id)
    setSelectedLexicons(allIds)
    showToast({ title: '已全选', icon: 'success' })
  }

  // 选择模式：取消全选
  const handleDeselectAll = () => {
    setSelectedLexicons([])
  }

  // 选择模式：完成选择并返回
  const handleCompleteSelection = () => {
    const pages = Taro.getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      prevPage.onSelectedLexicons?.(selectedLexicons)
    }
    Taro.navigateBack()
  }

  // 选择产品
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(false)
    loadLexicons()
  }

  // 添加产品
  const handleAddProduct = async () => {
    if (!productFormData.name.trim()) {
      showToast({ title: '请填写产品名称', icon: 'none' })
      return
    }

    try {
      await Network.request({
        url: '/api/products',
        method: 'POST',
        data: productFormData
      })

      showToast({ title: '添加成功', icon: 'success' })
      setShowAddProductModal(false)
      setProductFormData({ name: '', category: '', description: '' })
      await loadProducts()
    } catch (error) {
      console.error('添加产品失败:', error)
      showToast({ title: '添加失败', icon: 'none' })
    }
  }

  // 删除产品
  const handleDeleteProduct = async (product: Product) => {
    showModal({
      title: '确认删除',
      content: `确定要删除"${product.name}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/products/${product.id}`,
              method: 'DELETE'
            })
            showToast({ title: '删除成功', icon: 'success' })
            await loadProducts()
          } catch (error) {
            console.error('删除产品失败:', error)
            showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 打开添加弹窗
  const handleOpenAddModal = () => {
    setEditingLexicon(null)
    setFormData({ title: '', content: '', category: '' })
    setUploadedFileUrl('')
    setAudioPath('')
    setShowAddModal(true)
  }

  // 打开编辑弹窗
  const handleOpenEditModal = (lexicon: Lexicon) => {
    setEditingLexicon(lexicon)
    setFormData({
      title: lexicon.title,
      content: lexicon.content,
      category: lexicon.category
    })
    setShowAddModal(true)
  }

  // 删除语料
  const handleDelete = async (lexicon: Lexicon) => {
    showModal({
      title: '确认删除',
      content: `确定要删除"${lexicon.title}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/lexicon/${lexicon.id}`,
              method: 'DELETE'
            })
            showToast({ title: '删除成功', icon: 'success' })
            await loadLexicons()
          } catch (error) {
            console.error('删除失败:', error)
            showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 打开共享设置弹窗
  const handleOpenShareModal = async (lexicon: Lexicon) => {
    setSharingLexicon(lexicon)
    setShareScope(lexicon.share_scope || 'custom')
    setSharedUsers(lexicon.shared_with_users || [])
    setShowShareModal(true)

    // 加载用户列表
    try {
      setLoadingShareUsers(true)
      const response = await Network.request({
        url: '/api/users',
        method: 'GET'
      })
      if (response.statusCode === 200 && response.data?.data) {
        setAllUsers(response.data.data.users || [])
      }
    } catch (error) {
      console.error('加载用户列表失败:', error)
    } finally {
      setLoadingShareUsers(false)
    }
  }

  // 保存共享设置
  const handleSaveShare = async () => {
    if (!sharingLexicon) return

    try {
      await Network.request({
        url: `/api/lexicon/${sharingLexicon.id}/share`,
        method: 'POST',
        data: {
          shareScope,
          sharedWithUsers: shareScope === 'custom' ? sharedUsers : undefined
        }
      })

      showToast({ title: '共享成功', icon: 'success' })
      setShowShareModal(false)
      await loadLexicons()
    } catch (error) {
      console.error('共享失败:', error)
      showToast({ title: '共享失败', icon: 'none' })
    }
  }

  // 取消共享
  const handleUnshare = async () => {
    if (!sharingLexicon) return

    try {
      await Network.request({
        url: `/api/lexicon/${sharingLexicon.id}/share`,
        method: 'DELETE'
      })

      showToast({ title: '取消共享成功', icon: 'success' })
      setShowShareModal(false)
      await loadLexicons()
    } catch (error) {
      console.error('取消共享失败:', error)
      showToast({ title: '取消共享失败', icon: 'none' })
    }
  }

  // 切换用户选择
  const handleToggleUser = (userId: string) => {
    if (sharedUsers.includes(userId)) {
      setSharedUsers(sharedUsers.filter(id => id !== userId))
    } else {
      setSharedUsers([...sharedUsers, userId])
    }
  }

  // 加载直播话术列表
  const loadLiveScripts = useCallback(async () => {
    try {
      const response = await Network.request({
        url: '/api/live-scripts',
        method: 'GET'
      })

      console.log('直播话术列表响应:', response.data)

      if (response.statusCode === 200 && response.data?.data) {
        setLiveScripts(response.data.data || [])
      } else {
        setLiveScripts([])
      }
    } catch (error) {
      console.error('加载直播话术列表失败:', error)
      setLiveScripts([])
    }
  }, [])

  // 打开直播话术弹窗
  const handleOpenLiveScriptModal = () => {
    setEditingLiveScript(null)
    setLiveScriptFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      duration: '',
      viewer_count: ''
    })
    setShowLiveScriptModal(true)
  }

  // 打开直播话术编辑弹窗
  const handleOpenLiveScriptEditModal = (script: LiveScript) => {
    setEditingLiveScript(script)
    setLiveScriptFormData({
      title: script.title,
      date: script.date,
      content: script.content,
      duration: script.duration?.toString() || '',
      viewer_count: script.viewer_count?.toString() || ''
    })
    setShowLiveScriptModal(true)
  }

  // 保存直播话术
  const handleSaveLiveScript = async () => {
    if (!liveScriptFormData.title.trim() || !liveScriptFormData.content.trim()) {
      showToast({ title: '请填写标题和内容', icon: 'none' })
      return
    }

    try {
      const saveData = {
        title: liveScriptFormData.title.trim(),
        date: liveScriptFormData.date,
        content: liveScriptFormData.content,
        duration: liveScriptFormData.duration ? parseInt(liveScriptFormData.duration) : null,
        viewer_count: liveScriptFormData.viewer_count ? parseInt(liveScriptFormData.viewer_count) : null
      }

      if (editingLiveScript) {
        await Network.request({
          url: `/api/live-scripts/${editingLiveScript.id}`,
          method: 'PUT',
          data: saveData
        })
        showToast({ title: '修改成功', icon: 'success' })
      } else {
        await Network.request({
          url: '/api/live-scripts',
          method: 'POST',
          data: saveData
        })
        showToast({ title: '添加成功', icon: 'success' })
      }

      setShowLiveScriptModal(false)
      await loadLiveScripts()
    } catch (error) {
      console.error('保存直播话术失败:', error)
      showToast({ title: '保存失败', icon: 'none' })
    }
  }

  // 删除直播话术
  const handleDeleteLiveScript = async (script: LiveScript) => {
    showModal({
      title: '确认删除',
      content: `确定要删除"${script.title}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/live-scripts/${script.id}`,
              method: 'DELETE'
            })
            showToast({ title: '删除成功', icon: 'success' })
            await loadLiveScripts()
          } catch (error) {
            console.error('删除失败:', error)
            showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 系统分析直播话术
  const handleAnalyzeLiveScript = async (script: LiveScript) => {
    try {
      setAnalyzingScriptId(script.id)
      const response = await Network.request({
        url: `/api/live-scripts/${script.id}/analyze`,
        method: 'POST'
      })

      if (response.statusCode === 200 && response.data?.data) {
        setEditingLiveScript({
          ...script,
          analysis: response.data.data
        })
        setShowLiveScriptDetailModal(true)
        showToast({ title: '分析完成', icon: 'success' })
      }
      setAnalyzingScriptId(null)
    } catch (error) {
      console.error('分析失败:', error)
      setAnalyzingScriptId(null)
      showToast({ title: '分析失败', icon: 'none' })
    }
  }

  // 查看直播话术详情
  const handleViewLiveScriptDetail = (script: LiveScript) => {
    setEditingLiveScript(script)
    setShowLiveScriptDetailModal(true)
  }

  // 保存语料
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast({ title: '请填写标题和内容', icon: 'none' })
      return
    }

    // 产品知识库必须选择产品
    if (currentType === 'product' && !selectedProduct) {
      showToast({ title: '请先选择产品', icon: 'none' })
      return
    }

    try {
      const saveData: any = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        type: currentType
      }

      // 如果是产品知识库，添加产品ID
      if (currentType === 'product' && selectedProduct) {
        saveData.product_id = selectedProduct.id
      }

      if (editingLexicon) {
        await Network.request({
          url: `/api/lexicon/${editingLexicon.id}`,
          method: 'PUT',
          data: saveData
        })
        showToast({ title: '修改成功', icon: 'success' })
      } else {
        await Network.request({
          url: '/api/lexicon',
          method: 'POST',
          data: saveData
        })
        showToast({ title: '添加成功', icon: 'success' })
      }

      setShowAddModal(false)
      setUploadedFileUrl('')
      setAudioPath('')
      await loadLexicons()
    } catch (error) {
      console.error('保存失败:', error)
      showToast({ title: '保存失败', icon: 'none' })
    }
  }

  // 文件上传
  const handleFileUpload = () => {
    if (isWeapp) {
      // 小程序端使用 Taro.chooseMessageFile
      Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['doc', 'docx', 'pdf', 'mp3', 'wav', 'mp4']
      }).then(async (res) => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          await uploadFile(res.tempFiles[0].path)
        }
      }).catch((error) => {
        console.error('文件选择失败:', error)
        showToast({ title: '文件选择失败', icon: 'none' })
      })
    } else {
      // H5 端使用原生 input
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }
  }

  // 处理 H5 文件选择
  const handleH5FileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile(file)
    }
    // 重置 input 以便重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 统一的文件上传逻辑
  const uploadFile = async (fileOrPath: File | string) => {
    try {
      setIsUploading(true)

      let uploadRes: any

      if (typeof fileOrPath === 'string') {
        // 小程序端：传入文件路径
        uploadRes = await Network.uploadFile({
          url: '/api/lexicon/upload-file',
          filePath: fileOrPath,
          name: 'file'
        })
      } else {
        // H5 端：传入 File 对象
        uploadRes = await Network.uploadFile({
          url: '/api/lexicon/upload-file',
          filePath: fileOrPath as any,
          name: 'file'
        })
      }

      console.log('文件上传响应:', uploadRes.data)

      if (uploadRes.statusCode === 200 && uploadRes.data) {
        const data = JSON.parse(uploadRes.data)
        if (data.code === 200 && data.data) {
          setUploadedFileUrl(data.data.fileUrl)
          showToast({ title: '上传成功', icon: 'success' })

          // 如果是音频文件，自动转文字
          if (data.data.fileType === 'audio') {
            await handleSpeechToText(data.data.fileUrl)
          }
        }
      }

      setIsUploading(false)
    } catch (error) {
      console.error('文件上传失败:', error)
      setIsUploading(false)
      showToast({ title: '文件上传失败', icon: 'none' })
    }
  }

  // 语音转文字
  const handleSpeechToText = async (audioUrl: string) => {
    try {
      showToast({ title: '正在转文字...', icon: 'loading' })
      const response = await Network.request({
        url: '/api/lexicon/speech-to-text',
        method: 'POST',
        data: { audioUrl }
      })

      if (response.statusCode === 200 && response.data?.data) {
        const text = response.data.data.text
        setFormData(prev => ({ ...prev, content: text }))
        showToast({ title: '转文字成功', icon: 'success' })
      }
    } catch (error) {
      console.error('语音转文字失败:', error)
      showToast({ title: '转文字失败', icon: 'none' })
    }
  }

  // 开始录音
  const handleStartRecord = () => {
    if (!isWeapp) {
      showToast({ title: '录音仅在小程序可用', icon: 'none' })
      return
    }

    recorderManager?.start({
      format: 'mp3',
      sampleRate: 16000
    })
  }

  // 停止录音
  const handleStopRecord = () => {
    recorderManager?.stop()
  }

  // 上传录音并转文字
  const handleUploadRecording = async () => {
    if (!audioPath) return

    try {
      showToast({ title: '正在上传...', icon: 'loading' })

      const uploadRes = await Network.uploadFile({
        url: '/api/lexicon/upload-file',
        filePath: audioPath,
        name: 'file'
      })

      if (uploadRes.statusCode === 200 && uploadRes.data) {
        const data = JSON.parse(uploadRes.data)
        if (data.code === 200 && data.data) {
          await handleSpeechToText(data.data.fileUrl)
          setAudioPath('')
        }
      }
    } catch (error) {
      console.error('上传录音失败:', error)
      showToast({ title: '上传失败', icon: 'none' })
    }
  }

  // 错别字校正
  const handleCorrectText = async (text: string) => {
    try {
      setIsCorrecting(true)
      const response = await Network.request({
        url: '/api/lexicon/correct-text',
        method: 'POST',
        data: { text }
      })

      if (response.statusCode === 200 && response.data?.data) {
        setOriginalText(text)
        setCorrectedText(response.data.data.correctedText)
        
        // 计算是否有变化
        const hasChanges = text !== response.data.data.correctedText
        setHasErrors(hasChanges)
        
        // 计算差异字符数（简单估算）
        const diffCount = Math.abs(text.length - response.data.data.correctedText.length)
        setErrorCount(diffCount > 0 ? diffCount : 1)
        
        setShowCorrectModal(true)
      }
      setIsCorrecting(false)
    } catch (error) {
      console.error('错别字校正失败:', error)
      setIsCorrecting(false)
      showToast({ title: '校正失败', icon: 'none' })
    }
  }

  // 应用校正结果
  const handleApplyCorrection = () => {
    setFormData(prev => ({ ...prev, content: correctedText }))
    setShowCorrectModal(false)
    setHasErrors(false)
    setErrorCount(0)
    showToast({ title: '已应用校正', icon: 'success' })
  }

  // 创建 IP 画像
  const handleGenerateProfile = async () => {
    try {
      setIsAnalyzing(true)
      const response = await Network.request({
        url: '/api/lexicon/generate-profile',
        method: 'POST',
        data: { type: currentType }
      })

      if (response.statusCode === 200 && response.data?.data) {
        setAiProfile(response.data.data)
        setShowProfileModal(true)
      }
      setIsAnalyzing(false)
    } catch (error) {
      console.error('创建 IP 画像失败:', error)
      setIsAnalyzing(false)
      showToast({ title: '创建失败', icon: 'none' })
    }
  }

  // 过滤语料
  const filteredLexicons = (lexicons || []).filter(item =>
    item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    item.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchKeyword.toLowerCase()))
  )

  // 选择模式下过滤所有语料
  const filteredAllLexicons = (allLexicons || []).filter(item =>
    item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    item.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchKeyword.toLowerCase()))
  )

  return (
    <View className="min-h-screen bg-slate-900 pb-8">
      {/* H5 端隐藏的文件输入 */}
      {!isWeapp && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".doc,.docx,.pdf,.mp3,.wav,.mp4"
          onChange={handleH5FileChange}
          style={{ display: 'none' }}
        />
      )}

      {/* 头部导航 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-5">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center">
              <Database size={24} color="#34d399" strokeWidth={2.5} />
            </View>
            <Text className="block text-xl font-bold text-white">语料库管理</Text>
          </View>
          {selectMode && (
            <View
              className="px-4 py-2 bg-blue-500 rounded-xl active:scale-95 transition-all"
              onClick={handleCompleteSelection}
            >
              <Text className="text-sm text-white font-bold">完成 ({selectedLexicons.length})</Text>
            </View>
          )}
        </View>
      </View>

      <View className="px-4 mt-6 flex flex-col gap-6">
        {/* 选择模式：显示全选/取消全选按钮 */}
        {selectMode ? (
          <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-4">
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-2">
                <Text className="block text-lg font-bold text-white">选择语料库</Text>
                <Text className="block text-sm text-slate-400">
                  已选 {selectedLexicons.length} / {allLexicons.length} 条
                </Text>
              </View>
              <View className="flex gap-2">
                {selectedLexicons.length === allLexicons.length && allLexicons.length > 0 ? (
                  <View
                    className="px-4 py-2 bg-slate-800 rounded-lg active:scale-95 transition-all"
                    onClick={handleDeselectAll}
                  >
                    <Text className="text-sm text-white">取消全选</Text>
                  </View>
                ) : (
                  <View
                    className="px-4 py-2 bg-blue-500 rounded-lg active:scale-95 transition-all"
                    onClick={handleSelectAll}
                  >
                    <Text className="text-sm text-white">全选</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          /* 语料库类型选择 */
          <View className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-5">
            <Text className="block text-lg font-bold text-white mb-4 tracking-wide">选择语料库</Text>
            <View className="grid grid-cols-3 gap-3">
              <View
                className={`py-4 rounded-2xl border-2 transition-all ${
                  currentType === 'enterprise'
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
                onClick={() => handleSwitchType('enterprise')}
              >
                <View className="flex flex-col items-center gap-2">
                  <Building2 size={20} strokeWidth={2.5} color={currentType === 'enterprise' ? '#34d399' : '#94a3b8'} />
                  <Text className={`block text-xs font-bold ${
                    currentType === 'enterprise' ? 'text-white' : 'text-slate-400'
                  }`}
                  >
                    企业语料库
                  </Text>
                </View>
              </View>
              <View
                className={`flex-1 py-4 rounded-2xl border-2 transition-all ${
                  currentType === 'personal'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-blue-500/5'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
                onClick={() => handleSwitchType('personal')}
              >
                <View className="flex flex-col items-center gap-2">
                  <User size={20} strokeWidth={2.5} color={currentType === 'personal' ? '#60a5fa' : '#94a3b8'} />
                  <Text className={`block text-xs font-bold ${
                    currentType === 'personal' ? 'text-white' : 'text-slate-400'
                  }`}
                  >
                    个人IP语料库
                  </Text>
                </View>
              </View>
              <View
                className={`flex-1 py-4 rounded-2xl border-2 transition-all ${
                  currentType === 'product'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-purple-500/5'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
                onClick={() => handleSwitchType('product')}
              >
                <View className="flex flex-col items-center gap-2">
                  <Package size={20} strokeWidth={2.5} color={currentType === 'product' ? '#a855f7' : '#94a3b8'} />
                  <Text className={`block text-xs font-bold ${
                    currentType === 'product' ? 'text-white' : 'text-slate-400'
                  }`}
                  >
                    产品知识库
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 已选产品显示（普通模式） */}
        {!selectMode && currentType === 'product' && selectedProduct && (
          <View className="bg-purple-500/10 rounded-2xl border border-purple-500/30 p-4">
            <View className="flex items-center justify-between">
              <View className="flex items-center gap-3">
                <View className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Package size={18} color="#a855f7" strokeWidth={2.5} />
                </View>
                <View>
                  <View className="flex items-center gap-2">
                    <Text className="block text-sm font-bold text-white">
                      {selectedProduct.name}
                    </Text>
                    {selectedProduct.category && (
                      <View className="px-2 py-0.5 bg-purple-500/20 rounded">
                        <Text className="block text-xs text-purple-400">
                          {selectedProduct.category}
                        </Text>
                      </View>
                    )}
                  </View>
                  {selectedProduct.description && (
                    <Text className="block text-xs text-slate-400 mt-1 line-clamp-1">
                      {selectedProduct.description}
                    </Text>
                  )}
                </View>
              </View>
              <Button
                className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs"
                onClick={() => setShowProductModal(true)}
              >
                <Text className="block">切换产品</Text>
              </Button>
            </View>
          </View>
        )}

        {/* 搜索和操作栏 */}
        <View className="flex items-center gap-3">
          <View className="flex-1 bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-2">
            <Search size={18} color="#94a3b8" />
            <Input
              className="flex-1 bg-transparent text-white text-sm"
              placeholder="搜索语料..."
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
            {searchKeyword && (
              <X size={16} color="#94a3b8" onClick={() => setSearchKeyword('')} />
            )}
          </View>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-xl flex items-center gap-2"
            onClick={handleOpenAddModal}
          >
            <Plus size={18} />
            <Text className="block">添加</Text>
          </Button>
        </View>

        {/* 创建画像按钮 */}
        {currentType !== 'product' && (
          <Button
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
            onClick={handleGenerateProfile}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '分析中...' : (
              <>
                <Brain size={18} />
                <Text className="block">{currentType === 'enterprise' ? '创建企业画像' : '创建 IP 画像'}</Text>
              </>
            )}
          </Button>
        )}

        {/* 语料统计 */}
        <View className="flex items-center justify-between">
          <Text className="block text-sm text-slate-400">
            共 {filteredLexicons.length} 条语料
          </Text>
        </View>

        {/* 语料列表 */}
        {(selectMode ? filteredAllLexicons : filteredLexicons).length === 0 ? (
          <View className="flex flex-col items-center justify-center py-12">
            <Database size={48} color="#334155" strokeWidth={1.5} />
            <Text className="block text-sm text-slate-400 mt-3">
              {searchKeyword ? '未找到相关语料' : '暂无语料，点击上方按钮添加'}
            </Text>
          </View>
        ) : (
          <View className="flex flex-col gap-3">
            {(selectMode ? filteredAllLexicons : filteredLexicons).map((lexicon) => {
              const isSelected = selectedLexicons.includes(lexicon.id)
              // 获取类型标签信息
              const typeInfo = {
                enterprise: { label: '企业', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                personal: { label: '个人IP', color: 'text-blue-400', bg: 'bg-slate-9000/20' },
                product: { label: '产品', color: 'text-purple-400', bg: 'bg-purple-500/20' }
              }[lexicon.type]

              return (
                <View
                  key={lexicon.id}
                  className={`bg-slate-800/60 rounded-xl p-4 border-2 transition-all ${
                    selectMode
                      ? isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700'
                      : 'border-slate-700'
                  } ${selectMode ? 'active:scale-[0.98]' : ''}`}
                  onClick={selectMode ? () => handleToggleLexiconSelection(lexicon.id) : undefined}
                >
                  <View className="flex justify-between items-start mb-3">
                    <View className="flex-1 flex items-center gap-3">
                      {selectMode && (
                        <View className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                          {isSelected && <Check size={14} color="#60a5fa" strokeWidth={3} />}
                        </View>
                      )}
                      <View>
                        <View className="flex items-center gap-2 mb-2">
                          {selectMode && typeInfo && (
                            <View className={`px-2 py-0.5 ${typeInfo.bg} rounded`}>
                              <Text className={`block text-xs ${typeInfo.color} font-bold`}>
                                {typeInfo.label}
                              </Text>
                            </View>
                          )}
                          <Text className="block text-base font-bold text-white">
                            {lexicon.title}
                          </Text>
                          {lexicon.is_shared && (
                            <View className="px-2 py-0.5 bg-slate-9000/20 rounded flex items-center gap-1">
                              <Share2 size={12} color="#60a5fa" strokeWidth={2} />
                              <Text className="block text-xs text-blue-400">已共享</Text>
                            </View>
                          )}
                        </View>
                        {lexicon.category && (
                          <View className="inline-block px-2 py-1 bg-slate-800 rounded-lg">
                            <Text className="block text-xs text-slate-400">
                              {lexicon.category}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {!selectMode && (
                      <View className="flex gap-2 ml-3">
                        <View
                          className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                          onClick={() => handleOpenEditModal(lexicon)}
                        >
                          <Pencil size={16} color="#94a3b8" strokeWidth={2} />
                        </View>
                        <View
                          className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                          onClick={() => handleDelete(lexicon)}
                        >
                          <Trash2 size={16} color="#94a3b8" strokeWidth={2} />
                        </View>
                        <View
                          className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-all ${
                            lexicon.is_shared ? 'bg-blue-500/30' : 'bg-slate-700'
                          }`}
                          onClick={() => handleOpenShareModal(lexicon)}
                        >
                          <Share2 size={16} color={lexicon.is_shared ? '#60a5fa' : '#94a3b8'} strokeWidth={2} />
                        </View>
                      </View>
                    )}
                  </View>
                  <Text className="block text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {lexicon.content}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* 直播话术栏目（仅个人IP语料库显示） */}
        {currentType === 'personal' && (
          <View className="mt-8">
            <View className="flex items-center justify-between mb-4">
              <View className="flex items-center gap-2">
                <Video size={20} color="#60a5fa" strokeWidth={2.5} />
                <Text className="block text-lg font-bold text-white">直播话术</Text>
              </View>
              <Button
                className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                onClick={() => {
                  loadLiveScripts()
                  handleOpenLiveScriptModal()
                }}
              >
                <Plus size={14} />
                <Text className="block">添加</Text>
              </Button>
            </View>

            {liveScripts.length === 0 ? (
              <View className="flex flex-col items-center justify-center py-8 bg-slate-800/30 rounded-xl">
                <Video size={48} color="#334155" strokeWidth={1.5} />
                <Text className="block text-sm text-slate-400 mt-3">
                  暂无直播话术，点击上方按钮添加
                </Text>
              </View>
            ) : (
              <View className="flex flex-col gap-3">
                {liveScripts.map((script) => (
                  <View key={script.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                    <View className="flex justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="block text-base font-bold text-white mb-2">
                          {script.title}
                        </Text>
                        <View className="flex items-center gap-2">
                          {script.date && (
                            <View className="px-2 py-0.5 bg-slate-9000/20 rounded">
                              <Text className="block text-xs text-blue-400">
                                {script.date}
                              </Text>
                            </View>
                          )}
                          {script.duration && (
                            <View className="px-2 py-0.5 bg-emerald-500/20 rounded">
                              <Text className="block text-xs text-emerald-400">
                                {script.duration}分钟
                              </Text>
                            </View>
                          )}
                          {script.viewer_count && (
                            <View className="px-2 py-0.5 bg-purple-500/20 rounded">
                              <Text className="block text-xs text-purple-400">
                                {script.viewer_count}人观看
                              </Text>
                            </View>
                          )}
                          {script.analysis && (
                            <View className="px-2 py-0.5 bg-orange-500/20 rounded">
                              <Text className="block text-xs text-orange-400">
                                已分析
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View className="flex gap-2 ml-3">
                        <View
                          className="w-8 h-8 bg-blue-500/50 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                          onClick={() => handleViewLiveScriptDetail(script)}
                        >
                          <FileText size={16} color="#94a3b8" strokeWidth={2} />
                        </View>
                        <View
                          className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-all ${analyzingScriptId === script.id ? 'bg-emerald-500/30' : 'bg-emerald-500/50'}`}
                          onClick={() => handleAnalyzeLiveScript(script)}
                        >
                          {analyzingScriptId === script.id ? (
                            <Text className="block text-xs text-emerald-400">...</Text>
                          ) : (
                            <Brain size={16} color="#94a3b8" strokeWidth={2} />
                          )}
                        </View>
                        <View
                          className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                          onClick={() => handleOpenLiveScriptEditModal(script)}
                        >
                          <Pencil size={16} color="#94a3b8" strokeWidth={2} />
                        </View>
                        <View
                          className="w-8 h-8 bg-red-500/50 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                          onClick={() => handleDeleteLiveScript(script)}
                        >
                          <Trash2 size={16} color="#94a3b8" strokeWidth={2} />
                        </View>
                      </View>
                    </View>
                    <Text className="block text-sm text-slate-300 leading-relaxed line-clamp-2">
                      {script.content}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-lg bg-slate-800 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <Text className="block text-xl font-bold text-white">
                {editingLexicon ? '编辑语料' : '添加语料'}
              </Text>
              <X
                size={24}
                color="#94a3b8"
                onClick={() => setShowAddModal(false)}
              />
            </View>

            {/* 文件上传和录音 */}
            <View className="flex gap-2 mb-4">
              <Button
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                onClick={handleFileUpload}
                disabled={isUploading}
              >
                {isUploading ? '上传中...' : (
                  <>
                    <FileText size={18} />
                    <Text className="block">上传文件</Text>
                  </>
                )}
              </Button>
              {isWeapp && (
                <>
                  <Button
                    className="flex-1 bg-slate-800 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                    onClick={isRecording ? handleStopRecord : handleStartRecord}
                  >
                    <Mic size={18} color={isRecording ? '#ef4444' : '#94a3b8'} />
                    <Text className="block">{isRecording ? `${recordingDuration}s` : '录音'}</Text>
                  </Button>
                  {audioPath && (
                    <Button
                      className="bg-emerald-500 text-white py-3 px-4 rounded-xl"
                      onClick={handleUploadRecording}
                    >
                      <Text className="block">上传</Text>
                    </Button>
                  )}
                </>
              )}
            </View>

            {uploadedFileUrl && (
              <View className="mb-4 px-3 py-2 bg-slate-800 rounded-lg">
                <Text className="block text-xs text-emerald-400">
                  ✓ 文件已上传
                </Text>
              </View>
            )}

            {/* 表单 */}
            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <Input
                className="w-full bg-transparent text-white text-sm"
                placeholder="标题"
                value={formData.title}
                onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
              />
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <Input
                className="w-full bg-transparent text-white text-sm"
                placeholder="分类"
                value={formData.category}
                onInput={(e) => setFormData({ ...formData, category: e.detail.value })}
              />
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <Textarea
                className="w-full bg-transparent text-white text-sm min-h-[120px]"
                placeholder="内容"
                value={formData.content}
                onInput={(e) => setFormData({ ...formData, content: e.detail.value })}
                maxlength={2000}
              />
            </View>

            {/* 检查提示 */}
            {formData.content && formData.content.length > 10 && (
              <View className="mb-4 px-4 py-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-2">
                    <Sparkles size={16} color="#60a5fa" />
                    <Text className="text-sm text-blue-400">
                      内容检查
                    </Text>
                  </View>
                  <Button
                    className="px-4 py-2 bg-blue-500 text-white text-xs rounded-lg"
                    onClick={() => handleCorrectText(formData.content)}
                    disabled={isCorrecting}
                  >
                    {isCorrecting ? '检查中...' : '开始检查'}
                  </Button>
                </View>
                <Text className="block text-xs text-slate-400 mt-2">
                  点击&ldquo;开始检查&rdquo;，帮你发现并修正内容中的错别字、语法错误等
                </Text>
              </View>
            )}

            {/* 校正结果提示 */}
            {hasErrors && (
              <View className="mb-4 px-4 py-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <View className="flex items-center gap-2 mb-2">
                  <Text className="text-lg">⚠️</Text>
                  <Text className="text-sm text-yellow-400 font-semibold">
                    发现 {errorCount} 处可优化内容
                  </Text>
                </View>
                <Text className="block text-xs text-slate-400">
                  建议修正错别字和语法问题，点击下方按钮查看详细对比
                </Text>
              </View>
            )}

            {/* 校正按钮（备用） */}
            {formData.content && false && (
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 mb-4"
                onClick={() => handleCorrectText(formData.content)}
                disabled={isCorrecting}
              >
                {isCorrecting ? '校正中...' : (
                  <>
                    <Sparkles size={18} />
                    <Text className="block">校正错别字</Text>
                  </>
                )}
              </Button>
            )}

            <View className="flex gap-3">
              <Button
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl"
                onClick={() => setShowAddModal(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                onClick={handleSave}
              >
                <Save size={18} />
                <Text className="block">保存</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 共享设置弹窗 */}
      {showShareModal && sharingLexicon && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-lg bg-slate-800 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <View className="flex items-center gap-2">
                <Share2 size={24} color="#60a5fa" strokeWidth={2.5} />
                <Text className="block text-xl font-bold text-white">
                  共享设置
                </Text>
              </View>
              <X size={24} color="#94a3b8" onClick={() => setShowShareModal(false)} />
            </View>

            {/* 语料信息 */}
            <View className="mb-4 px-4 py-3 bg-slate-800 rounded-xl">
              <Text className="block text-sm text-slate-400 mb-1">语料名称</Text>
              <Text className="block text-base font-semibold text-white">
                {sharingLexicon.title}
              </Text>
            </View>

            {/* 共享范围选择 */}
            <View className="mb-6">
              <Text className="block text-sm font-semibold text-white mb-3">共享范围</Text>
              <View className="flex flex-col gap-2">
                <View
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    shareScope === 'custom'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                  onClick={() => setShareScope('custom')}
                >
                  <Text className={`block text-sm ${
                    shareScope === 'custom' ? 'text-white' : 'text-slate-400'
                  }`}
                  >
                    指定用户
                  </Text>
                </View>
                <View
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    shareScope === 'all'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                  onClick={() => setShareScope('all')}
                >
                  <Text className={`block text-sm ${
                    shareScope === 'all' ? 'text-white' : 'text-slate-400'
                  }`}
                  >
                    所有人
                  </Text>
                </View>
                <View
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${
                    shareScope === 'department'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                  onClick={() => setShareScope('department')}
                >
                  <Text className={`block text-sm ${
                    shareScope === 'department' ? 'text-white' : 'text-slate-400'
                  }`}
                  >
                    同部门
                  </Text>
                </View>
              </View>
            </View>

            {/* 用户选择（仅在自定义共享时显示） */}
            {shareScope === 'custom' && (
              <View className="mb-6">
                <View className="flex items-center justify-between mb-3">
                  <Text className="block text-sm font-semibold text-white">选择用户</Text>
                  <Text className="block text-xs text-slate-400">
                    已选 {sharedUsers.length} 人
                  </Text>
                </View>
                {loadingShareUsers ? (
                  <View className="text-center py-4">
                    <Text className="block text-sm text-slate-400">加载中...</Text>
                  </View>
                ) : allUsers.length === 0 ? (
                  <View className="text-center py-4">
                    <Text className="block text-sm text-slate-400">暂无用户</Text>
                  </View>
                ) : (
                  <View className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {allUsers.map(user => (
                      <View
                        key={user.id}
                        className="px-4 py-3 bg-slate-800 rounded-xl flex items-center justify-between"
                        onClick={() => handleToggleUser(user.id)}
                      >
                        <View className="flex items-center gap-2">
                          <Users size={18} color="#94a3b8" />
                          <Text className="block text-sm text-white">
                            {user.nickname || '未命名'}
                          </Text>
                        </View>
                        <View className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                          {sharedUsers.includes(user.id) && (
                            <Check size={14} color="#60a5fa" strokeWidth={3} />
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* 操作按钮 */}
            <View className="flex gap-3">
              {sharingLexicon.is_shared ? (
                <>
                  <View className="flex-1">
                    <Button
                      className="w-full bg-slate-800 text-white py-3 rounded-xl"
                      onClick={() => setShowShareModal(false)}
                    >
                      取消
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button
                      className="w-full bg-red-500/20 text-red-400 py-3 rounded-xl border border-red-500/50"
                      onClick={handleUnshare}
                    >
                      取消共享
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                      onClick={handleSaveShare}
                    >
                      <Save size={18} />
                      <Text className="block">更新</Text>
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <View className="flex-1">
                    <Button
                      className="w-full bg-slate-800 text-white py-3 rounded-xl"
                      onClick={() => setShowShareModal(false)}
                    >
                      取消
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                      onClick={handleSaveShare}
                    >
                      <Share2 size={18} />
                      <Text className="block">共享</Text>
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      )}

      {/* 错别字校正结果弹窗 */}
      {showCorrectModal && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-lg bg-slate-800 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <View className="flex items-center gap-2">
                <Sparkles size={24} color="#34d399" strokeWidth={2.5} />
                <Text className="block text-xl font-bold text-white">
                  校正结果
                </Text>
              </View>
              <X size={24} color="#94a3b8" onClick={() => setShowCorrectModal(false)} />
            </View>

            {/* 校正提示 */}
            {hasErrors && (
              <View className="mb-4 px-4 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <View className="flex items-center gap-2">
                  <Check size={16} color="#34d399" />
                  <Text className="text-sm text-emerald-400">
                    已发现并修正 {errorCount} 处内容
                  </Text>
                </View>
              </View>
            )}

            <View className="mb-4">
              <View className="flex items-center justify-between mb-2">
                <Text className="block text-sm text-slate-400">原文：</Text>
                <Text className="text-xs text-slate-400">{originalText.length} 字</Text>
              </View>
              <View className="bg-slate-800 rounded-xl p-4">
                <Text className="block text-sm text-slate-300 leading-relaxed">{originalText}</Text>
              </View>
            </View>

            <View className="mb-4">
              <View className="flex items-center justify-between mb-2">
                <Text className="block text-sm text-slate-400">校正后：</Text>
                <Text className="text-xs text-emerald-400">{correctedText.length} 字</Text>
              </View>
              <View className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                <Text className="block text-sm text-emerald-400 leading-relaxed">{correctedText}</Text>
              </View>
            </View>

            {/* 差异说明 */}
            {hasErrors && (
              <View className="mb-4 px-4 py-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <View className="flex items-center gap-2 mb-2">
                  <Text className="text-lg">💡</Text>
                  <Text className="text-sm text-blue-400 font-semibold">
                    优化说明
                  </Text>
                </View>
                <Text className="block text-xs text-slate-400">
                  已修正错别字、语法错误，优化了标点符号和表达方式，使内容更加专业准确
                </Text>
              </View>
            )}

            <View className="flex gap-3">
              <Button
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl"
                onClick={() => setShowCorrectModal(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl"
                onClick={handleApplyCorrection}
              >
                应用校正
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* IP 画像分析结果弹窗 */}
      {showProfileModal && aiProfile && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-2xl bg-slate-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <View className="flex items-center gap-2">
                <Brain size={24} color="#60a5fa" strokeWidth={2.5} />
                <Text className="block text-xl font-bold text-white">
                  {currentType === 'enterprise' ? '企业' : currentType === 'personal' ? '个人IP' : '产品'}画像分析
                </Text>
              </View>
              <X size={24} color="#94a3b8" onClick={() => setShowProfileModal(false)} />
            </View>

            {/* 标签页切换 */}
            <View className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { key: 'profile', label: 'IP 画像' },
                { key: 'style', label: '语料风格' },
                { key: 'phrases', label: '常用语' },
                { key: 'tone', label: '语气分析' },
                { key: 'semantics', label: '语义分析' },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeTab === tab.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  {tab.label}
                </Button>
              ))}
            </View>

            {/* IP 画像 */}
            {activeTab === 'profile' && (
              <View className="space-y-4">
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">定位</Text>
                  <Text className="block text-sm text-slate-300">{aiProfile.profile.position}</Text>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">特点</Text>
                  <View className="flex flex-wrap gap-2">
                    {aiProfile.profile.characteristics.map((item, index) => (
                      <View key={index} className="px-3 py-1 bg-slate-9000/20 rounded-lg">
                        <Text className="block text-xs text-blue-400">{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">价值观</Text>
                  <View className="flex flex-wrap gap-2">
                    {aiProfile.profile.values.map((item, index) => (
                      <View key={index} className="px-3 py-1 bg-emerald-500/20 rounded-lg">
                        <Text className="block text-xs text-emerald-400">{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 语料风格 */}
            {activeTab === 'style' && (
              <View className="space-y-4">
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">写作风格</Text>
                  <Text className="block text-sm text-slate-300">{aiProfile.style.writingStyle}</Text>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">语言特点</Text>
                  <Text className="block text-sm text-slate-300">{aiProfile.style.languageFeatures}</Text>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">结构特点</Text>
                  <Text className="block text-sm text-slate-300">{aiProfile.style.structure}</Text>
                </View>
              </View>
            )}

            {/* 常用语 */}
            {activeTab === 'phrases' && (
              <View>
                <View className="flex flex-wrap gap-2">
                  {aiProfile.commonPhrases.map((phrase, index) => (
                    <View key={index} className="px-4 py-2 bg-slate-800 rounded-lg">
                      <Text className="block text-sm text-slate-300">{phrase}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 语气分析 */}
            {activeTab === 'tone' && (
              <View className="space-y-4">
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">主要语气</Text>
                  <Text className="block text-sm text-slate-300">{aiProfile.tone.mainTone}</Text>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">情感基调</Text>
                  <Text className="block text-sm text-slate-300">{aiProfile.tone.emotionalTone}</Text>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">语气变体</Text>
                  <View className="flex flex-wrap gap-2">
                    {aiProfile.tone.variety.map((item, index) => (
                      <View key={index} className="px-3 py-1 bg-purple-500/20 rounded-lg">
                        <Text className="block text-xs text-purple-400">{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 语义分析 */}
            {activeTab === 'semantics' && (
              <View className="space-y-4">
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">核心主题</Text>
                  <View className="flex flex-wrap gap-2">
                    {aiProfile.semantics.coreThemes.map((item, index) => (
                      <View key={index} className="px-3 py-1 bg-orange-500/20 rounded-lg">
                        <Text className="block text-xs text-orange-400">{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">关键词</Text>
                  <View className="flex flex-wrap gap-2">
                    {aiProfile.semantics.keywords.map((item, index) => (
                      <View key={index} className="px-3 py-1 bg-cyan-500/20 rounded-lg">
                        <Text className="block text-xs text-cyan-400">{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View>
                  <Text className="block text-lg font-bold text-white mb-2">语义领域</Text>
                  <View className="flex flex-wrap gap-2">
                    {aiProfile.semantics.semanticFields.map((item, index) => (
                      <View key={index} className="px-3 py-1 bg-pink-500/20 rounded-lg">
                        <Text className="block text-xs text-pink-400">{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <Button
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl"
              onClick={() => setShowProfileModal(false)}
            >
              关闭
            </Button>
          </View>
        </View>
      )}

      {/* 产品选择弹窗 */}
      {showProductModal && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-lg bg-slate-800 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <View className="flex items-center gap-2">
                <Package size={24} color="#a855f7" strokeWidth={2.5} />
                <Text className="block text-xl font-bold text-white">选择产品</Text>
              </View>
              <X size={24} color="#94a3b8" onClick={() => setShowProductModal(false)} />
            </View>

            <View className="flex items-center justify-between mb-4">
              <Text className="block text-sm text-slate-400">
                共 {products.length} 个产品
              </Text>
              <Button
                className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm"
                onClick={() => {
                  setShowAddProductModal(true)
                }}
              >
                <Text className="block">添加产品</Text>
              </Button>
            </View>

            <View className="flex flex-col gap-3">
              {products.length === 0 ? (
                <View className="flex flex-col items-center justify-center py-8">
                  <Package size={48} color="#334155" strokeWidth={1.5} />
                  <Text className="block text-sm text-slate-400 mt-3">
                    暂无产品，点击上方按钮添加
                  </Text>
                </View>
              ) : (
                products.map((product) => (
                  <View
                    key={product.id}
                    className="bg-slate-800 rounded-xl p-4 border-2 border-transparent hover:border-purple-500 transition-all"
                  >
                    <View className="flex items-start justify-between">
                      <View className="flex-1">
                        <View className="flex items-center gap-2 mb-2">
                          <Text className="block text-base font-bold text-white">
                            {product.name}
                          </Text>
                          {product.category && (
                            <View className="px-2 py-0.5 bg-purple-500/20 rounded">
                              <Text className="block text-xs text-purple-400">
                                {product.category}
                              </Text>
                            </View>
                          )}
                        </View>
                        {product.description && (
                          <Text className="block text-sm text-slate-300 line-clamp-2">
                            {product.description}
                          </Text>
                        )}
                      </View>
                      <View className="flex gap-2 ml-2">
                        <Button
                          className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs"
                          onClick={() => handleSelectProduct(product)}
                        >
                          <Text className="block">选择</Text>
                        </Button>
                        <Button
                          className="bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Button
              className="w-full mt-6 bg-slate-800 text-white py-3 rounded-xl"
              onClick={() => setShowProductModal(false)}
            >
              取消
            </Button>
          </View>
        </View>
      )}

      {/* 产品添加弹窗 */}
      {showAddProductModal && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-lg bg-slate-800 rounded-2xl p-6">
            <View className="flex items-center justify-between mb-6">
              <View className="flex items-center gap-2">
                <Package size={24} color="#a855f7" strokeWidth={2.5} />
                <Text className="block text-xl font-bold text-white">添加产品</Text>
              </View>
              <X size={24} color="#94a3b8" onClick={() => setShowAddProductModal(false)} />
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <Input
                className="w-full bg-transparent text-white text-sm"
                placeholder="产品名称"
                value={productFormData.name}
                onInput={(e) => setProductFormData({ ...productFormData, name: e.detail.value })}
              />
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <Input
                className="w-full bg-transparent text-white text-sm"
                placeholder="产品类别（可选）"
                value={productFormData.category}
                onInput={(e) => setProductFormData({ ...productFormData, category: e.detail.value })}
              />
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-4">
              <Textarea
                className="w-full bg-transparent text-white text-sm min-h-[80px]"
                placeholder="产品描述（可选）"
                value={productFormData.description}
                onInput={(e) => setProductFormData({ ...productFormData, description: e.detail.value })}
                maxlength={500}
              />
            </View>

            <View className="flex gap-3">
              <Button
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl"
                onClick={() => setShowAddProductModal(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl"
                onClick={handleAddProduct}
              >
                <Text className="block">添加</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 直播话术添加/编辑弹窗 */}
      {showLiveScriptModal && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-lg bg-slate-800 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <View className="flex items-center gap-2">
                <Video size={24} color="#60a5fa" strokeWidth={2.5} />
                <Text className="block text-xl font-bold text-white">
                  {editingLiveScript ? '编辑' : '添加'}直播话术
                </Text>
              </View>
              <X size={24} color="#94a3b8" onClick={() => setShowLiveScriptModal(false)} />
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <Input
                className="w-full bg-transparent text-white text-sm"
                placeholder="直播标题"
                value={liveScriptFormData.title}
                onInput={(e) => setLiveScriptFormData({ ...liveScriptFormData, title: e.detail.value })}
              />
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-3">
              <Input
                className="w-full bg-transparent text-white text-sm"
                placeholder="直播日期 (如: 2024-01-15)"
                value={liveScriptFormData.date}
                onInput={(e) => setLiveScriptFormData({ ...liveScriptFormData, date: e.detail.value })}
              />
            </View>

            <View className="flex gap-3 mb-3">
              <View className="flex-1 bg-slate-800 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-white text-sm"
                  placeholder="时长（分钟）"
                  type="number"
                  value={liveScriptFormData.duration}
                  onInput={(e) => setLiveScriptFormData({ ...liveScriptFormData, duration: e.detail.value })}
                />
              </View>
              <View className="flex-1 bg-slate-800 rounded-xl px-4 py-3">
                <Input
                  className="w-full bg-transparent text-white text-sm"
                  placeholder="观看人数"
                  type="number"
                  value={liveScriptFormData.viewer_count}
                  onInput={(e) => setLiveScriptFormData({ ...liveScriptFormData, viewer_count: e.detail.value })}
                />
              </View>
            </View>

            <View className="bg-slate-800 rounded-xl px-4 py-3 mb-4">
              <Textarea
                className="w-full bg-transparent text-white text-sm min-h-[200px]"
                placeholder="直播话术内容"
                value={liveScriptFormData.content}
                onInput={(e) => setLiveScriptFormData({ ...liveScriptFormData, content: e.detail.value })}
                maxlength={5000}
              />
            </View>

            <View className="flex gap-3">
              <Button
                className="flex-1 bg-slate-800 text-white py-3 rounded-xl"
                onClick={() => setShowLiveScriptModal(false)}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl"
                onClick={handleSaveLiveScript}
              >
                <Text className="block">保存</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 直播话术详情弹窗 */}
      {showLiveScriptDetailModal && editingLiveScript && (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <View className="w-full max-w-3xl bg-slate-800 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <View className="flex items-center justify-between mb-6">
              <View className="flex items-center gap-2">
                <Video size={24} color="#60a5fa" strokeWidth={2.5} />
                <Text className="block text-xl font-bold text-white">直播话术详情</Text>
              </View>
              <X size={24} color="#94a3b8" onClick={() => setShowLiveScriptDetailModal(false)} />
            </View>

            {/* 基本信息 */}
            <View className="mb-6">
              <Text className="block text-lg font-bold text-white mb-3">{editingLiveScript.title}</Text>
              <View className="flex items-center gap-2 mb-4">
                {editingLiveScript.date && (
                  <View className="px-2 py-0.5 bg-slate-9000/20 rounded">
                    <Text className="block text-xs text-blue-400">
                      {editingLiveScript.date}
                    </Text>
                  </View>
                )}
                {editingLiveScript.duration && (
                  <View className="px-2 py-0.5 bg-emerald-500/20 rounded">
                    <Text className="block text-xs text-emerald-400">
                      {editingLiveScript.duration}分钟
                    </Text>
                  </View>
                )}
                {editingLiveScript.viewer_count && (
                  <View className="px-2 py-0.5 bg-purple-500/20 rounded">
                    <Text className="block text-xs text-purple-400">
                      {editingLiveScript.viewer_count}人观看
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 分析结果 */}
            {editingLiveScript.analysis && (
              <View className="mb-6 space-y-4">
                <View className="flex items-center gap-2 mb-4">
                  <Brain size={20} color="#34d399" strokeWidth={2.5} />
                  <Text className="block text-base font-bold text-white">分析报告</Text>
                  <View className="flex-1" />
                  <View className="px-3 py-1 bg-emerald-500/20 rounded-lg">
                    <Text className="block text-sm text-emerald-400 font-bold">
                      评分: {editingLiveScript.analysis.score}/100
                    </Text>
                  </View>
                </View>

                {/* 违禁词 */}
                {editingLiveScript.analysis.banned_words.length > 0 && (
                  <View className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                    <View className="flex items-center gap-2 mb-2">
                      <Circle size={18} color="#ef4444" strokeWidth={2} />
                      <Text className="block text-base font-bold text-red-400">违禁词检测</Text>
                    </View>
                    <View className="flex flex-wrap gap-2">
                      {editingLiveScript.analysis.banned_words.map((word, index) => (
                        <View key={index} className="px-2 py-1 bg-red-500/20 rounded">
                          <Text className="block text-xs text-red-400">{word}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 敏感词 */}
                {editingLiveScript.analysis.sensitive_words.length > 0 && (
                  <View className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                    <View className="flex items-center gap-2 mb-2">
                      <Circle size={18} color="#f97316" strokeWidth={2} />
                      <Text className="block text-base font-bold text-orange-400">敏感词检测</Text>
                    </View>
                    <View className="flex flex-wrap gap-2">
                      {editingLiveScript.analysis.sensitive_words.map((word, index) => (
                        <View key={index} className="px-2 py-1 bg-orange-500/20 rounded">
                          <Text className="block text-xs text-orange-400">{word}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 优化建议 */}
                <View className="bg-blue-500/10 rounded-xl p-4 border border-sky-500/30">
                  <View className="flex items-center gap-2 mb-2">
                    <Check size={18} color="#60a5fa" strokeWidth={2} />
                    <Text className="block text-base font-bold text-blue-400">优化建议</Text>
                  </View>
                  <View className="space-y-2">
                    {editingLiveScript.analysis.suggestions.map((suggestion, index) => (
                      <View key={index} className="flex gap-2">
                        <Text className="block text-xs text-blue-400">•</Text>
                        <Text className="block text-xs text-blue-300 flex-1">{suggestion}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 直播总结 */}
                <View className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                  <View className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} color="#a855f7" strokeWidth={2} />
                    <Text className="block text-base font-bold text-purple-400">直播总结</Text>
                  </View>
                  <Text className="block text-sm text-purple-300 leading-relaxed">
                    {editingLiveScript.analysis.summary}
                  </Text>
                </View>

                {/* 直播亮点 */}
                <View className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                  <View className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} color="#34d399" strokeWidth={2} />
                    <Text className="block text-base font-bold text-emerald-400">直播亮点</Text>
                  </View>
                  <View className="flex flex-wrap gap-2">
                    {editingLiveScript.analysis.highlights.map((highlight, index) => (
                      <View key={index} className="px-2 py-1 bg-emerald-500/20 rounded">
                        <Text className="block text-xs text-emerald-400">{highlight}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 话术内容 */}
            <View className="bg-slate-800 rounded-xl p-4">
              <Text className="block text-sm text-slate-400 mb-2">话术内容</Text>
              <Text className="block text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {editingLiveScript.content}
              </Text>
            </View>

            <Button
              className="w-full mt-6 bg-slate-800 text-white py-3 rounded-xl"
              onClick={() => setShowLiveScriptDetailModal(false)}
            >
              关闭
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}
