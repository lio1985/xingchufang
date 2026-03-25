import { useState, useEffect } from 'react';
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
} from 'lucide-react-taro';
import '@/styles/pages.css';
import './index.css';

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

  const contentTypes = ['短视频脚本', '图文文案', '直播话术', '产品介绍'];
  const tones = ['专业亲切', '活泼俏皮', '沉稳大气', '幽默风趣', '温暖治愈'];
  const audiences = ['18-25岁年轻女性', '25-40岁都市女性', '30-50岁成熟女性', '全年龄女性'];
  const durations = ['30秒', '60秒', '90秒', '120秒', '180秒'];
  const styles = ['自然真实', '精致高级', '生活化', '故事化', '干货满满'];

  useEffect(() => {
    const topics = Taro.getStorageSync('selectedTopics') || [];
    if (topics.length > 0) {
      setSelectedTopics(topics);
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

      const mockContent = generateMockContent();
      setGeneratedContent(mockContent);
      Taro.showToast({ title: '生成成功', icon: 'success' });
    } catch (error) {
      console.error('生成失败', error);
      Taro.showToast({ title: '生成失败', icon: 'error' });
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const generateMockContent = () => {
    const topic = selectedTopics[0] || '美食推荐';
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
              <ChevronLeft size={32} color="#fafafa" />
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
            <Text style={{ fontSize: '26px', color: '#f59e0b' }}>
              {selectedTopics.slice(0, 2).join(' | ')}
              {selectedTopics.length > 2 && ` +${selectedTopics.length - 2}更多`}
            </Text>
          </View>
        )}
      </View>

      <ScrollView scrollY style={{ paddingTop: '32px' }}>
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
                <Loader size={64} color="#f59e0b" />
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
                    <RefreshCw size={20} color="#a1a1aa" />
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
