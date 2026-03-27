import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
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
} from 'lucide-react-taro';
import { Network } from '@/network';
import KnowledgeSelector from '@/components/KnowledgeSelector';
import '@/styles/pages.css';
import './index.css';

interface KnowledgeItem {
  id: string;
  title: string;
  content?: string;
  type: string;
}

const ContentCreationPage = () => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string>('短视频脚本');
  const [tone, setTone] = useState<string>('专业亲切');
  const [targetAudience, setTargetAudience] = useState<string>('25-40岁都市女性');
  const [duration, setDuration] = useState<string>('60秒');
  const [style, setStyle] = useState<string>('自然真实');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // 知识库相关状态
  const [showKnowledgeSelector, setShowKnowledgeSelector] = useState(false);
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>([]);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([]);
  const [knowledgeContent, setKnowledgeContent] = useState<KnowledgeItem[]>([]);

  // 文件上传状态
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const contentTypes = ['短视频脚本', '图文文案', '直播话术', '产品介绍'];
  const tones = ['专业亲切', '活泼俏皮', '沉稳大气', '幽默风趣', '温暖治愈'];
  const audiences = ['18-25岁年轻女性', '25-40岁都市女性', '30-50岁成熟女性', '全年龄女性'];
  const durations = ['30秒', '60秒', '90秒', '120秒', '180秒'];
  const styles = ['自然真实', '精致高级', '生活化', '故事化', '干货满满'];

  useEffect(() => {
    // 从存储中获取选中的选题和知识库
    const topics = Taro.getStorageSync('selectedTopics') || [];
    const knowledgeIds = Taro.getStorageSync('selectedKnowledgeIds') || [];
    const knowledgeSources = Taro.getStorageSync('selectedKnowledgeSources') || [];

    if (topics.length > 0) {
      setSelectedTopics(topics);
    }
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

      console.log('[ContentCreation] 知识库内容:', response);

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

        // 上传文件并解析内容
        const uploadResult = await Network.uploadFile({
          url: '/api/file-parser/parse',
          filePath: file.path,
          name: 'file',
        });

        console.log('[ContentCreation] 文件解析结果:', uploadResult);

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

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const steps = [
        '正在分析选题方向...',
        '正在匹配目标受众...',
        '正在构思内容框架...',
        '正在生成创意文案...',
        '正在优化表达方式...',
      ];

      for (let i = 0; i < steps.length; i++) {
        setLoadingStep(steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // 构建上下文
      const knowledgeContext = knowledgeContent
        .map((k) => `【${k.title}】\n${k.content || ''}`)
        .join('\n\n');

      const fileContext = uploadedContent 
        ? `\n\n【参考文件内容】\n${uploadedContent.substring(0, 2000)}`
        : '';

      const mockContent = generateMockContent(knowledgeContext + fileContext);
      setGeneratedContent(mockContent);
      Taro.showToast({ title: '生成成功', icon: 'success' });
    } catch (error) {
      console.error('[ContentCreation] 生成失败:', error);
      Taro.showToast({ title: '生成失败', icon: 'error' });
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const generateMockContent = (context: string = '') => {
    const topic = selectedTopics[0] || '美食推荐';
    const contextHint = context ? '\n\n📚 已参考知识库内容进行创作' : '';
    
    return `【${contentType}】

🎯 主题：${topic}

📝 内容框架：

开场（0-5秒）：
"姐妹们好！今天我要分享一个超级实用的${topic}技巧，保证你看完就学会了！"

核心内容（5-50秒）：
1️⃣ 第一步：${topic}的基本认知
   "首先，我们要了解${topic}的核心要点..."

2️⃣ 第二步：实操演示
   "接下来，我给大家演示一下具体怎么做..."

3️⃣ 第三步：注意事项
   "最后，有几点需要特别注意..."

结尾（50-60秒）：
"好了，今天的分享就到这里。如果你觉得有用，记得点赞收藏哦！我们下期见~"

📌 关键词标签：
#${topic} #女性成长 #实用技巧 #生活好物

🎨 建议配乐：轻快节奏感的背景音乐
📹 画面风格：${style}
${contextHint}
${uploadedFileName ? `\n📎 已参考文件: ${uploadedFileName}` : ''}
${selectedKnowledgeIds.length > 0 ? `\n📖 已参考知识库: ${selectedKnowledgeIds.length} 条` : ''}
`;
  };

  const handleSave = () => {
    if (!generatedContent) {
      Taro.showToast({ title: '请先生成内容', icon: 'none' });
      return;
    }

    Taro.setClipboardData({
      data: generatedContent,
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
        <View className="header-top" style={{ marginBottom: '24px' }}>
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#f1f5f9" />
            </View>
            <Text className="header-title">内容创作</Text>
          </View>
        </View>

        {/* 已选选题 */}
        {selectedTopics.length > 0 && (
          <View
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '12px',
            }}
          >
            <Text
              style={{
                fontSize: '22px',
                color: '#71717a',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              已选选题 ({selectedTopics.length})
            </Text>
            <Text style={{ fontSize: '26px', color: '#38bdf8' }}>
              {selectedTopics.slice(0, 2).join(' | ')}
              {selectedTopics.length > 2 && ` +${selectedTopics.length - 2}更多`}
            </Text>
          </View>
        )}
      </View>

      <ScrollView scrollY style={{ paddingTop: '32px', paddingBottom: '100px' }}>
        {/* 知识库选择 */}
        <View style={{ padding: '0 32px', marginBottom: '24px' }}>
          <View
            style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', overflow: 'hidden' }}
          >
            <View
              style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setShowKnowledgeSelector(!showKnowledgeSelector)}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={18} color="#38bdf8" />
                </View>
                <View>
                  <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>知识库参考</Text>
                  {selectedKnowledgeIds.length > 0 ? (
                    <Text style={{ fontSize: '12px', color: '#38bdf8', display: 'block', marginTop: '2px' }}>已选 {selectedKnowledgeIds.length} 条</Text>
                  ) : (
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>选择知识库内容辅助创作</Text>
                  )}
                </View>
              </View>
              {showKnowledgeSelector ? <ChevronUp size={20} color="#71717a" /> : <ChevronDown size={20} color="#71717a" />}
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
          <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color="#10b981" />
              </View>
              <View>
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>文件导入</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>支持 Word/PDF 文件内容提取</Text>
              </View>
            </View>

            <View
              style={{ padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
              <View style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
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
              
              <Text className="result-content">{generatedContent}</Text>

              <View className="action-buttons">
                <View className="action-button" onClick={handleReset}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <RefreshCw size={20} color="#94a3b8" />
                    <Text className="action-button-text">重新生成</Text>
                  </View>
                </View>
                <View className="action-button action-button-primary" onClick={handleSave}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Copy size={20} color="#000" />
                    <Text className="action-button-text">复制内容</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default ContentCreationPage;
