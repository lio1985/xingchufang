import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Sparkles,
  Settings,
  Copy,
  RefreshCw,
  FileText,
  Loader,
  BookOpen,
  Upload,
  ChevronDown,
  ChevronUp,
  Wand,
  Lightbulb,
  Pencil,
  X,
  Check,
  ArrowRight,
} from 'lucide-react-taro';
import { Network } from '@/network';
import KnowledgeSelector from '@/components/KnowledgeSelector';
import '@/styles/pages.css';
import './index.css';

interface TopicInfo {
  id: string;
  title: string;
  description?: string;
  category?: string;
  platform: string;
  content_type: string;
  target_audience?: string;
  key_points?: string;
  ai_analysis?: Record<string, any>;
}

interface KnowledgeItem {
  id: string;
  title: string;
  content?: string;
  type: string;
}

// AI辅助功能类型
type AIAssistantMode = 'outline' | 'expand' | 'polish' | 'inspiration' | null;

const ContentCreationPage = () => {
  // 选题信息
  const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);

  // 内容参数
  const [contentType, setContentType] = useState<string>('短视频脚本');
  const [tone, setTone] = useState<string>('专业亲切');
  const [targetAudience, setTargetAudience] = useState<string>('25-40岁都市女性');
  const [duration, setDuration] = useState<string>('60秒');
  const [style, setStyle] = useState<string>('自然真实');

  // 生成的内容
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedOutline, setGeneratedOutline] = useState<Record<string, any> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // AI辅助状态
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMode, setAiMode] = useState<AIAssistantMode>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, any> | null>(null);

  // 知识库相关状态
  const [showKnowledgeSelector, setShowKnowledgeSelector] = useState(false);
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>([]);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([]);
  const [knowledgeContent, setKnowledgeContent] = useState<KnowledgeItem[]>([]);

  // 文件上传状态
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // 编辑器内容
  const [editorContent, setEditorContent] = useState<string>('');
  const [selectedSection] = useState<string>('');

  // 润色类型
  const [polishType, setPolishType] = useState<'concise' | 'emotional' | 'professional' | 'engaging'>('engaging');

  const contentTypes = ['短视频脚本', '图文文案', '直播话术', '产品介绍'];
  const tones = ['专业亲切', '活泼俏皮', '沉稳大气', '幽默风趣', '温暖治愈'];
  const audiences = ['18-25岁年轻女性', '25-40岁都市女性', '30-50岁成熟女性', '全年龄女性', '18-25岁年轻男性', '25-40岁都市男性', '30-50岁成熟男性', '全年龄男性', '全年龄段用户'];
  const durations = ['30秒', '60秒', '90秒', '120秒', '180秒'];
  const styles = ['自然真实', '精致高级', '生活化', '故事化', '干货满满'];

  const polishOptions = [
    { value: 'concise', label: '精简表达', desc: '删除冗余，突出核心' },
    { value: 'emotional', label: '情感共鸣', desc: '增强感染力和共情' },
    { value: 'professional', label: '专业权威', desc: '提升专业度和可信度' },
    { value: 'engaging', label: '增强互动', desc: '提高吸引力和参与度' },
  ];

  useEffect(() => {
    // 从存储中获取选题信息
    const topicData = Taro.getStorageSync('selectedTopicForCreation');
    if (topicData) {
      setTopicInfo(topicData);
      // 设置默认值
      if (topicData.platform) {
        // 根据平台设置内容类型
        const platformContentType: Record<string, string> = {
          '抖音': '短视频脚本',
          '小红书': '图文文案',
          '视频号': '短视频脚本',
          '公众号': '图文文案',
          'B站': '短视频脚本',
          '微博': '图文文案',
        };
        setContentType(platformContentType[topicData.platform] || '短视频脚本');
      }
      if (topicData.target_audience) {
        setTargetAudience(topicData.target_audience);
      }
      // 清除存储
      Taro.removeStorageSync('selectedTopicForCreation');
    }

    // 获取知识库选择
    const knowledgeIds = Taro.getStorageSync('selectedKnowledgeIds') || [];
    const knowledgeSources = Taro.getStorageSync('selectedKnowledgeSources') || [];
    if (knowledgeIds.length > 0) {
      setSelectedKnowledgeIds(knowledgeIds);
      setSelectedKnowledgeSources(knowledgeSources);
      loadKnowledgeContent(knowledgeIds, knowledgeSources);
    }
  }, []);

  const loadKnowledgeContent = async (ids: string[], sources: string[]) => {
    if (ids.length === 0) return;

    try {
      const response = await Network.request({
        url: '/api/knowledge/batch',
        method: 'GET',
        data: { ids: ids.join(','), types: sources.join(',') },
      });

      if (response.data?.code === 200 && response.data?.data) {
        setKnowledgeContent(response.data.data);
      }
    } catch (error) {
      console.error('[ContentCreation] 加载知识库内容失败:', error);
    }
  };

  const handleKnowledgeChange = (ids: string[], sources: string[]) => {
    setSelectedKnowledgeIds(ids);
    setSelectedKnowledgeSources(sources);
  };

  const handleFileUpload = useCallback(async () => {
    try {
      const result = await Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['.doc', '.docx', '.pdf', '.txt'],
      });

      if (result.tempFiles && result.tempFiles.length > 0) {
        const file = result.tempFiles[0];
        setUploadedFileName(file.name);
        setIsUploading(true);

        const uploadResult = await Network.uploadFile({
          url: '/api/file-parser/parse',
          filePath: file.path,
          name: 'file',
        });

        if (uploadResult.data) {
          const parsedData = typeof uploadResult.data === 'string'
            ? JSON.parse(uploadResult.data)
            : uploadResult.data;

          if (parsedData.code === 200 && parsedData.data?.content) {
            setUploadedContent(parsedData.data.content);
            Taro.showToast({ title: '文件解析成功', icon: 'success' });
          } else {
            Taro.showToast({ title: parsedData.msg || '解析失败', icon: 'none' });
          }
        }
      }
    } catch (error) {
      console.error('[ContentCreation] 文件上传失败:', error);
      Taro.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      setIsUploading(false);
    }
  }, []);

  // 生成完整内容
  const handleGenerate = async () => {
    if (!topicInfo) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedOutline(null);

    try {
      const steps = [
        '正在分析选题方向...',
        '正在构思内容框架...',
        '正在生成创意文案...',
        '正在优化表达方式...',
      ];

      for (let i = 0; i < steps.length; i++) {
        setLoadingStep(steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 构建上下文
      const knowledgeContext = knowledgeContent
        .map((k) => `【${k.title}】\n${k.content || ''}`)
        .join('\n\n');

      const fileContext = uploadedContent
        ? `\n\n【参考文件内容】\n${uploadedContent.substring(0, 2000)}`
        : '';

      const referenceContent = knowledgeContext + fileContext;

      const res = await Network.request({
        url: '/api/content-writing/generate',
        method: 'POST',
        data: {
          title: topicInfo.title,
          description: topicInfo.description,
          platform: topicInfo.platform,
          contentType: contentType,
          targetAudience: targetAudience,
          keyPoints: topicInfo.key_points,
          tone: tone,
          duration: duration,
          style: style,
          aiAnalysis: topicInfo.ai_analysis,
          referenceContent: referenceContent || undefined,
        },
      });

      console.log('[ContentCreation] 生成结果:', res);

      if (res.data?.code === 200 && res.data?.data) {
        const result = res.data.data;
        setGeneratedOutline(result);
        
        // 格式化内容显示
        const formattedContent = formatContentResult(result);
        setGeneratedContent(formattedContent);
        setEditorContent(result.content || formattedContent);

        Taro.showToast({ title: '生成成功', icon: 'success' });
      } else {
        Taro.showToast({ title: res.data?.msg || '生成失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[ContentCreation] 生成失败:', error);
      Taro.showToast({ title: '生成失败', icon: 'none' });
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  // 格式化内容结果
  const formatContentResult = (result: Record<string, any>): string => {
    let content = `【${result.title || '内容标题'}】\n\n`;

    if (result.hook) {
      content += `🎯 开场白：\n${result.hook}\n\n`;
    }

    if (result.content) {
      content += `📝 正文内容：\n${result.content}\n\n`;
    }

    if (result.mainPoints && result.mainPoints.length > 0) {
      content += `📌 核心要点：\n`;
      result.mainPoints.forEach((point: string, idx: number) => {
        content += `${idx + 1}. ${point}\n`;
      });
      content += '\n';
    }

    if (result.cta) {
      content += `📣 结尾号召：\n${result.cta}\n\n`;
    }

    if (result.keywords && result.keywords.length > 0) {
      content += `🔑 关键词：${result.keywords.join('、')}\n\n`;
    }

    if (result.hashtags && result.hashtags.length > 0) {
      content += `#️⃣ 标签：${result.hashtags.join(' ')}\n\n`;
    }

    if (result.duration) {
      content += `⏱ 预计时长：${result.duration}\n`;
    }

    if (result.coverSuggestion) {
      content += `🖼 封面建议：${result.coverSuggestion}\n`;
    }

    if (result.musicSuggestion) {
      content += `🎵 配乐建议：${result.musicSuggestion}\n`;
    }

    return content;
  };

  // AI辅助功能
  const handleAIAssistant = async (mode: AIAssistantMode) => {
    if (!topicInfo && mode !== 'polish') {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    setAiMode(mode);
    setAiLoading(true);
    setAiResult(null);
    setShowAIAssistant(true);

    try {
      let res;

      switch (mode) {
        case 'outline':
          res = await Network.request({
            url: '/api/content-writing/outline',
            method: 'POST',
            data: {
              title: topicInfo!.title,
              description: topicInfo!.description,
              platform: topicInfo!.platform,
              contentType: contentType,
              targetAudience: targetAudience,
              keyPoints: topicInfo!.key_points,
              tone: tone,
              duration: duration,
              style: style,
            },
          });
          break;

        case 'expand':
          if (!editorContent && !generatedOutline) {
            Taro.showToast({ title: '请先生成大纲或输入内容', icon: 'none' });
            setAiLoading(false);
            return;
          }
          res = await Network.request({
            url: '/api/content-writing/expand',
            method: 'POST',
            data: {
              outline: generatedOutline ? JSON.stringify(generatedOutline) : editorContent,
              section: selectedSection || '主体内容',
              title: topicInfo!.title,
              platform: topicInfo!.platform,
              tone: tone,
              targetAudience: targetAudience,
            },
          });
          break;

        case 'polish':
          if (!editorContent) {
            Taro.showToast({ title: '请先输入需要润色的内容', icon: 'none' });
            setAiLoading(false);
            return;
          }
          res = await Network.request({
            url: '/api/content-writing/polish',
            method: 'POST',
            data: {
              content: editorContent,
              platform: topicInfo?.platform || '公众号',
              tone: tone,
              polishType: polishType,
            },
          });
          break;

        case 'inspiration':
          res = await Network.request({
            url: '/api/content-writing/inspiration',
            method: 'POST',
            data: {
              title: topicInfo!.title,
              category: topicInfo!.category,
              platform: topicInfo!.platform,
            },
          });
          break;
      }

      console.log(`[ContentCreation] AI ${mode} 结果:`, res);

      if (res?.data?.code === 200 && res?.data?.data) {
        setAiResult(res.data.data);
      } else {
        Taro.showToast({ title: res?.data?.msg || 'AI处理失败', icon: 'none' });
      }
    } catch (error) {
      console.error(`[ContentCreation] AI ${mode} 失败:`, error);
      Taro.showToast({ title: 'AI处理失败', icon: 'none' });
    } finally {
      setAiLoading(false);
    }
  };

  // 应用AI结果
  const applyAIResult = () => {
    if (!aiResult) return;

    if (aiMode === 'polish' && aiResult.polishedContent) {
      setEditorContent(aiResult.polishedContent);
      setGeneratedContent(prev => prev + '\n\n【润色后内容】\n' + aiResult.polishedContent);
    } else if (aiResult.content) {
      setEditorContent(aiResult.content);
      setGeneratedContent(prev => prev + '\n\n' + formatContentResult(aiResult));
    }

    setShowAIAssistant(false);
    Taro.showToast({ title: '已应用', icon: 'success' });
  };

  const handleSave = () => {
    const contentToSave = editorContent || generatedContent;
    if (!contentToSave) {
      Taro.showToast({ title: '请先生成内容', icon: 'none' });
      return;
    }

    Taro.setClipboardData({
      data: contentToSave,
      success: () => {
        Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
      },
    });
  };

  const handleReset = () => {
    Taro.showModal({
      title: '确认重置',
      content: '确定要清空当前内容吗？',
      success: (res) => {
        if (res.confirm) {
          setGeneratedContent('');
          setGeneratedOutline(null);
          setEditorContent('');
          setContentType('短视频脚本');
          setTone('专业亲切');
          setTargetAudience('25-40岁都市女性');
          setDuration('60秒');
          setStyle('自然真实');
          setUploadedFileName('');
          setUploadedContent('');
          Taro.showToast({ title: '已重置', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className="content-creation-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top" style={{ marginBottom: '16px' }}>
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#f1f5f9" />
            </View>
            <Text className="header-title">内容创作</Text>
          </View>
        </View>

        {/* 流程进度条 */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.navigateTo({ url: '/pages/quick-note/index' })}
          >
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#71717a' }} />
            <Text style={{ fontSize: '12px', color: '#71717a' }}>灵感速记</Text>
          </View>
          <ArrowRight size={14} color="#71717a" />
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.navigateTo({ url: '/pages/topic-planning/index' })}
          >
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
            <Text style={{ fontSize: '12px', color: '#4ade80' }}>选题策划</Text>
          </View>
          <ArrowRight size={14} color="#71717a" />
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <Text style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>内容创作</Text>
          </View>
        </View>

        {/* 选题信息 */}
        {topicInfo ? (
          <View
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#71717a',
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  当前选题
                </Text>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#38bdf8', display: 'block' }}>
                  {topicInfo.title}
                </Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <View style={{ padding: '4px 10px', backgroundColor: 'rgba(56, 189, 248, 0.2)', borderRadius: '6px' }}>
                  <Text style={{ fontSize: '12px', color: '#38bdf8' }}>{topicInfo.platform}</Text>
                </View>
                <View style={{ padding: '4px 10px', backgroundColor: 'rgba(74, 222, 128, 0.2)', borderRadius: '6px' }}>
                  <Text style={{ fontSize: '12px', color: '#4ade80' }}>{topicInfo.content_type}</Text>
                </View>
              </View>
            </View>
            {topicInfo.description && (
              <Text style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px', display: 'block' }}>
                {topicInfo.description}
              </Text>
            )}
          </View>
        ) : (
          <View
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '12px',
            }}
          >
            <Text style={{ fontSize: '14px', color: '#f59e0b' }}>
              💡 提示：您可以从「选题策划」页面选择选题后跳转过来
            </Text>
          </View>
        )}
      </View>

      <ScrollView scrollY style={{ paddingTop: '32px', paddingBottom: '100px' }}>
        {/* AI 辅助工具栏 */}
        <View style={{ padding: '0 32px', marginBottom: '24px' }}>
          <View
            style={{
              backgroundColor: '#111827',
              borderRadius: '12px',
              border: '1px solid #1e3a5f',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => setShowAIAssistant(!showAIAssistant)}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <View
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Wand size={18} color="#fbbf24" />
                </View>
                <View>
                  <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>
                    AI 辅助写作
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>
                    大纲生成 · 内容扩写 · 润色优化 · 创意灵感
                  </Text>
                </View>
              </View>
              {showAIAssistant ? (
                <ChevronUp size={20} color="#71717a" />
              ) : (
                <ChevronDown size={20} color="#71717a" />
              )}
            </View>

            {showAIAssistant && (
              <View style={{ padding: '0 16px 16px' }}>
                <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      padding: '12px',
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                    }}
                    onClick={() => handleAIAssistant('outline')}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FileText size={16} color="#38bdf8" />
                      <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>生成大纲</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>快速构建内容框架</Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      padding: '12px',
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                    }}
                    onClick={() => handleAIAssistant('expand')}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Pencil size={16} color="#4ade80" />
                      <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>内容扩写</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>丰富细节与案例</Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      padding: '12px',
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                    }}
                    onClick={() => handleAIAssistant('polish')}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Sparkles size={16} color="#a855f7" />
                      <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>润色优化</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>提升表达质量</Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      minWidth: '45%',
                      padding: '12px',
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                    }}
                    onClick={() => handleAIAssistant('inspiration')}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Lightbulb size={16} color="#fbbf24" />
                      <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>创意灵感</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>获取创作方向</Text>
                  </View>
                </View>

                {/* 润色类型选择 */}
                {aiMode === 'polish' && (
                  <View style={{ marginTop: '12px' }}>
                    <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
                      选择润色方向
                    </Text>
                    <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {polishOptions.map((opt) => (
                        <View
                          key={opt.value}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: polishType === opt.value ? '#38bdf8' : '#1e293b',
                            borderRadius: '6px',
                          }}
                          onClick={() => setPolishType(opt.value as typeof polishType)}
                        >
                          <Text
                            style={{
                              fontSize: '13px',
                              color: polishType === opt.value ? '#000' : '#94a3b8',
                            }}
                          >
                            {opt.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* 知识库选择 */}
        <View style={{ padding: '0 32px', marginBottom: '24px' }}>
          <View
            style={{
              backgroundColor: '#111827',
              borderRadius: '12px',
              border: '1px solid #1e3a5f',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => setShowKnowledgeSelector(!showKnowledgeSelector)}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <View
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={18} color="#38bdf8" />
                </View>
                <View>
                  <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>
                    知识库参考
                  </Text>
                  {selectedKnowledgeIds.length > 0 ? (
                    <Text
                      style={{
                        fontSize: '12px',
                        color: '#38bdf8',
                        display: 'block',
                        marginTop: '2px',
                      }}
                    >
                      已选 {selectedKnowledgeIds.length} 条
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: '12px',
                        color: '#71717a',
                        display: 'block',
                        marginTop: '2px',
                      }}
                    >
                      选择知识库内容辅助创作
                    </Text>
                  )}
                </View>
              </View>
              {showKnowledgeSelector ? (
                <ChevronUp size={20} color="#71717a" />
              ) : (
                <ChevronDown size={20} color="#71717a" />
              )}
            </View>

            {showKnowledgeSelector && (
              <View style={{ padding: '0 16px 16px' }}>
                <KnowledgeSelector
                  selectedIds={selectedKnowledgeIds}
                  selectedSources={selectedKnowledgeSources}
                  onChange={handleKnowledgeChange}
                />
              </View>
            )}
          </View>
        </View>

        {/* 文件上传 */}
        <View style={{ padding: '0 32px', marginBottom: '24px' }}>
          <View
            style={{
              backgroundColor: '#111827',
              borderRadius: '12px',
              border: '1px solid #1e3a5f',
              padding: '16px',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <View
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={18} color="#10b981" />
              </View>
              <View>
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>
                  文件导入
                </Text>
                <Text
                  style={{
                    fontSize: '12px',
                    color: '#71717a',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  支持 Word/PDF 文件内容提取
                </Text>
              </View>
            </View>

            <View
              style={{
                padding: '12px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onClick={isUploading ? undefined : handleFileUpload}
            >
              {isUploading ? (
                <>
                  <Loader size={16} color="#71717a" />
                  <Text style={{ fontSize: '14px', color: '#71717a' }}>解析中...</Text>
                </>
              ) : (
                <>
                  <Upload size={16} color="#38bdf8" />
                  <Text style={{ fontSize: '14px', color: '#38bdf8' }}>选择文件</Text>
                </>
              )}
            </View>

            {uploadedFileName && (
              <View
                style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={14} color="#10b981" />
                  <Text style={{ fontSize: '13px', color: '#ffffff' }}>{uploadedFileName}</Text>
                </View>
                <Text style={{ fontSize: '12px', color: '#71717a' }}>已解析</Text>
              </View>
            )}
          </View>
        </View>

        {/* 参数配置 */}
        <View style={{ padding: '0 32px', marginBottom: '24px' }}>
          <View className="config-section">
            <View className="config-title">
              <Settings size={24} color="#71717a" />
              <Text>创作参数</Text>
            </View>

            {/* 内容类型 */}
            <View style={{ marginBottom: '24px' }}>
              <Text className="form-label">内容类型</Text>
              <ScrollView scrollX>
                <View className="config-grid">
                  {contentTypes.map((type) => (
                    <View
                      key={type}
                      className={`config-item ${contentType === type ? 'config-item-active' : ''}`}
                      onClick={() => setContentType(type)}
                    >
                      {type}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 语调风格 */}
            <View style={{ marginBottom: '24px' }}>
              <Text className="form-label">语调风格</Text>
              <ScrollView scrollX>
                <View className="config-grid">
                  {tones.map((t) => (
                    <View
                      key={t}
                      className={`config-item ${tone === t ? 'config-item-active' : ''}`}
                      onClick={() => setTone(t)}
                    >
                      {t}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 目标受众 */}
            <View style={{ marginBottom: '24px' }}>
              <Text className="form-label">目标受众</Text>
              <ScrollView scrollX>
                <View className="config-grid">
                  {audiences.map((aud) => (
                    <View
                      key={aud}
                      className={`config-item ${targetAudience === aud ? 'config-item-active' : ''}`}
                      onClick={() => setTargetAudience(aud)}
                    >
                      {aud}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 时长 */}
            <View style={{ marginBottom: '24px' }}>
              <Text className="form-label">时长</Text>
              <ScrollView scrollX>
                <View className="config-grid">
                  {durations.map((d) => (
                    <View
                      key={d}
                      className={`config-item ${duration === d ? 'config-item-active' : ''}`}
                      onClick={() => setDuration(d)}
                    >
                      {d}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 画面风格 */}
            <View>
              <Text className="form-label">画面风格</Text>
              <ScrollView scrollX>
                <View className="config-grid">
                  {styles.map((s) => (
                    <View
                      key={s}
                      className={`config-item ${style === s ? 'config-item-active' : ''}`}
                      onClick={() => setStyle(s)}
                    >
                      {s}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>

        {/* 生成按钮 */}
        <View style={{ padding: '0 32px', marginBottom: '24px' }}>
          <View className="action-btn-primary" onClick={handleGenerate}>
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <Sparkles size={28} color="#000" />
              <Text className="action-btn-primary-text">
                {isGenerating ? '生成中...' : '开始生成'}
              </Text>
            </View>
          </View>
        </View>

        {/* 生成结果 */}
        {isGenerating ? (
          <View style={{ padding: '0 32px', marginBottom: '24px' }}>
            <View className="result-section">
              <View className="generating-state">
                <Loader size={64} color="#38bdf8" />
                <Text className="generating-step">{loadingStep}</Text>
              </View>
            </View>
          </View>
        ) : generatedContent ? (
          <View style={{ padding: '0 32px', marginBottom: '24px' }}>
            <View className="result-section">
              <View className="result-title">
                <FileText size={24} color="#71717a" />
                <Text>生成结果</Text>
              </View>

              {/* 可编辑区域 */}
              <View
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <Textarea
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    fontSize: '14px',
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    lineHeight: '24px',
                  }}
                  placeholder="生成的内容会显示在这里，您可以编辑修改..."
                  placeholderStyle="color: #71717a"
                  value={editorContent}
                  onInput={(e) => setEditorContent(e.detail.value)}
                />
              </View>

              <Text className="result-content">{generatedContent}</Text>

              <View className="action-buttons">
                <View className="action-button" onClick={handleReset}>
                  <View
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <RefreshCw size={20} color="#94a3b8" />
                    <Text className="action-button-text">重新生成</Text>
                  </View>
                </View>
                <View className="action-button action-button-primary" onClick={handleSave}>
                  <View
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Copy size={20} color="#000" />
                    <Text className="action-button-text">复制内容</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* AI辅助弹窗 */}
      {showAIAssistant && aiMode && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <View
            style={{
              width: '100%',
              maxHeight: '80vh',
              backgroundColor: '#111827',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px',
            }}
          >
            {/* 弹窗头部 */}
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand size={20} color="#fbbf24" />
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  {aiMode === 'outline' && '生成大纲'}
                  {aiMode === 'expand' && '内容扩写'}
                  {aiMode === 'polish' && '润色优化'}
                  {aiMode === 'inspiration' && '创意灵感'}
                </Text>
              </View>
              <View onClick={() => setShowAIAssistant(false)}>
                <X size={24} color="#71717a" />
              </View>
            </View>

            <ScrollView scrollY style={{ maxHeight: '55vh' }}>
              {aiLoading ? (
                <View style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader size={32} color="#38bdf8" />
                  <Text
                    style={{
                      fontSize: '14px',
                      color: '#71717a',
                      marginTop: '12px',
                      display: 'block',
                    }}
                  >
                    AI 正在处理中...
                  </Text>
                </View>
              ) : aiResult ? (
                <View>
                  {/* 大纲结果 */}
                  {aiMode === 'outline' && aiResult.sections && (
                    <View>
                      <Text
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#ffffff',
                          marginBottom: '12px',
                          display: 'block',
                        }}
                      >
                        {aiResult.title}
                      </Text>
                      {aiResult.hook && (
                        <View
                          style={{
                            padding: '12px',
                            backgroundColor: '#1e293b',
                            borderRadius: '12px',
                            marginBottom: '12px',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: '13px',
                              color: '#38bdf8',
                              marginBottom: '4px',
                              display: 'block',
                            }}
                          >
                            🎯 开场白
                          </Text>
                          <Text style={{ fontSize: '14px', color: '#ffffff' }}>{aiResult.hook}</Text>
                        </View>
                      )}
                      {aiResult.sections.map((section: any, idx: number) => (
                        <View
                          key={idx}
                          style={{
                            padding: '12px',
                            backgroundColor: '#1e293b',
                            borderRadius: '12px',
                            marginBottom: '8px',
                          }}
                        >
                          <View
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px',
                            }}
                          >
                            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#38bdf8' }}>
                              {section.name}
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#71717a' }}>{section.duration}秒</Text>
                          </View>
                          {section.keyPoints && (
                            <View>
                              {section.keyPoints.map((point: string, i: number) => (
                                <Text
                                  key={i}
                                  style={{
                                    fontSize: '13px',
                                    color: '#94a3b8',
                                    display: 'block',
                                    marginBottom: '4px',
                                  }}
                                >
                                  • {point}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                      {aiResult.cta && (
                        <View
                          style={{
                            padding: '12px',
                            backgroundColor: 'rgba(74, 222, 128, 0.1)',
                            borderRadius: '12px',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: '13px',
                              color: '#4ade80',
                              marginBottom: '4px',
                              display: 'block',
                            }}
                          >
                            📣 结尾号召
                          </Text>
                          <Text style={{ fontSize: '14px', color: '#ffffff' }}>{aiResult.cta}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 扩写结果 */}
                  {aiMode === 'expand' && aiResult.content && (
                    <View>
                      <Text
                        style={{
                          fontSize: '14px',
                          color: '#38bdf8',
                          marginBottom: '8px',
                          display: 'block',
                        }}
                      >
                        {aiResult.sectionName}
                      </Text>
                      <View
                        style={{
                          padding: '12px',
                          backgroundColor: '#1e293b',
                          borderRadius: '12px',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            color: '#ffffff',
                            lineHeight: '24px',
                            display: 'block',
                          }}
                        >
                          {aiResult.content}
                        </Text>
                      </View>
                      {aiResult.tips && (
                        <View style={{ marginTop: '12px' }}>
                          <Text
                            style={{
                              fontSize: '13px',
                              color: '#fbbf24',
                              marginBottom: '8px',
                              display: 'block',
                            }}
                          >
                            💡 表达技巧
                          </Text>
                          {aiResult.tips.map((tip: string, idx: number) => (
                            <Text
                              key={idx}
                              style={{
                                fontSize: '13px',
                                color: '#94a3b8',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              • {tip}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* 润色结果 */}
                  {aiMode === 'polish' && aiResult.polishedContent && (
                    <View>
                      <View
                        style={{
                          padding: '12px',
                          backgroundColor: '#1e293b',
                          borderRadius: '12px',
                          marginBottom: '12px',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '13px',
                            color: '#a855f7',
                            marginBottom: '8px',
                            display: 'block',
                          }}
                        >
                          ✨ 润色后内容
                        </Text>
                        <Text
                          style={{
                            fontSize: '14px',
                            color: '#ffffff',
                            lineHeight: '24px',
                            display: 'block',
                          }}
                        >
                          {aiResult.polishedContent}
                        </Text>
                      </View>
                      {aiResult.improvements && (
                        <View>
                          <Text
                            style={{
                              fontSize: '13px',
                              color: '#4ade80',
                              marginBottom: '8px',
                              display: 'block',
                            }}
                          >
                            📈 改进点
                          </Text>
                          {aiResult.improvements.map((imp: string, idx: number) => (
                            <Text
                              key={idx}
                              style={{
                                fontSize: '13px',
                                color: '#94a3b8',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              • {imp}
                            </Text>
                          ))}
                        </View>
                      )}
                      {aiResult.score && (
                        <View
                          style={{
                            marginTop: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                          }}
                        >
                          <View style={{ textAlign: 'center' }}>
                            <Text style={{ fontSize: '20px', fontWeight: '600', color: '#71717a' }}>
                              {aiResult.score.original}
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#71717a' }}>原评分</Text>
                          </View>
                          <ArrowRight size={16} color="#38bdf8" />
                          <View style={{ textAlign: 'center' }}>
                            <Text style={{ fontSize: '20px', fontWeight: '600', color: '#38bdf8' }}>
                              {aiResult.score.polished}
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#38bdf8' }}>新评分</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 灵感结果 */}
                  {aiMode === 'inspiration' && (
                    <View>
                      {aiResult.creativeDirections && (
                        <View style={{ marginBottom: '20px' }}>
                          <Text
                            style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              color: '#ffffff',
                              marginBottom: '12px',
                              display: 'block',
                            }}
                          >
                            💡 创意方向
                          </Text>
                          {aiResult.creativeDirections.map((dir: any, idx: number) => (
                            <View
                              key={idx}
                              style={{
                                padding: '12px',
                                backgroundColor: '#1e293b',
                                borderRadius: '12px',
                                marginBottom: '8px',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  color: '#38bdf8',
                                  display: 'block',
                                }}
                              >
                                {dir.angle}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '13px',
                                  color: '#94a3b8',
                                  marginTop: '4px',
                                  display: 'block',
                                }}
                              >
                                {dir.description}
                              </Text>
                              {dir.example && (
                                <Text
                                  style={{
                                    fontSize: '12px',
                                    color: '#71717a',
                                    marginTop: '4px',
                                    display: 'block',
                                  }}
                                >
                                  示例：{dir.example}
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                      {aiResult.emotionTriggers && (
                        <View style={{ marginBottom: '20px' }}>
                          <Text
                            style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              color: '#ffffff',
                              marginBottom: '12px',
                              display: 'block',
                            }}
                          >
                            ❤️ 情感触发点
                          </Text>
                          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {aiResult.emotionTriggers.map((trigger: string, idx: number) => (
                              <View
                                key={idx}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(248, 113, 113, 0.2)',
                                  borderRadius: '8px',
                                }}
                              >
                                <Text style={{ fontSize: '13px', color: '#f87171' }}>{trigger}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                      {aiResult.interactiveIdeas && (
                        <View>
                          <Text
                            style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              color: '#ffffff',
                              marginBottom: '12px',
                              display: 'block',
                            }}
                          >
                            🎮 互动创意
                          </Text>
                          {aiResult.interactiveIdeas.map((idea: string, idx: number) => (
                            <Text
                              key={idx}
                              style={{
                                fontSize: '13px',
                                color: '#94a3b8',
                                display: 'block',
                                marginBottom: '8px',
                              }}
                            >
                              {idx + 1}. {idea}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* 原始内容 */}
                  {aiResult.rawContent && (
                    <View
                      style={{
                        padding: '12px',
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: '14px',
                          color: '#94a3b8',
                          lineHeight: '24px',
                          display: 'block',
                        }}
                      >
                        {aiResult.rawContent}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text style={{ fontSize: '14px', color: '#71717a' }}>暂无结果</Text>
                </View>
              )}
            </ScrollView>

            {/* 底部操作 */}
            <View style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <View
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
                onClick={() => setShowAIAssistant(false)}
              >
                <Text style={{ fontSize: '15px', color: '#94a3b8' }}>关闭</Text>
              </View>
              {aiResult && !aiResult.rawContent && (
                <View
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#38bdf8',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                  onClick={applyAIResult}
                >
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Check size={16} color="#000" />
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>应用到内容</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ContentCreationPage;
