import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

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
      // 模拟生成过程
      const steps = [
        '正在分析选题方向...',
        '正在匹配目标受众...',
        '正在构思内容框架...',
        '正在生成创意文案...',
        '正在优化表达方式...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setLoadingStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // 模拟生成的内容
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
      }
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
      }
    });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '32px' }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <View style={{ padding: '8px' }} onClick={() => Taro.navigateBack()}>
            <Text style={{ fontSize: '32px', color: '#fafafa' }}>←</Text>
          </View>
          <Text style={{ fontSize: '36px', fontWeight: '700', color: '#fafafa' }}>内容创作</Text>
        </View>

        {/* 已选选题 */}
        {selectedTopics.length > 0 && (
          <View style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
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
        <View style={{ padding: '0 32px', marginBottom: '32px' }}>
          <View style={{ 
            backgroundColor: '#141416',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #27272a'
          }}>
            <Text style={{ fontSize: '24px', color: '#71717a', marginBottom: '24px', display: 'block' }}>
              ⚙️ 创作参数
            </Text>

            {/* 内容类型 */}
            <View style={{ marginBottom: '24px' }}>
              <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>内容类型</Text>
              <ScrollView scrollX showHorizontalScrollIndicator={false}>
                <View style={{ display: 'flex', gap: '12px' }}>
                  {contentTypes.map((type) => (
                    <View
                      key={type}
                      style={{
                        flexShrink: 0,
                        padding: '12px 20px',
                        backgroundColor: contentType === type ? '#f59e0b' : '#1a1a1d',
                        color: contentType === type ? '#000' : '#a1a1aa',
                        borderRadius: '12px',
                        fontSize: '24px'
                      }}
                      onClick={() => setContentType(type)}
                    >
                      {type}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 语气风格 */}
            <View style={{ marginBottom: '24px' }}>
              <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>语气风格</Text>
              <ScrollView scrollX showHorizontalScrollIndicator={false}>
                <View style={{ display: 'flex', gap: '12px' }}>
                  {tones.map((t) => (
                    <View
                      key={t}
                      style={{
                        flexShrink: 0,
                        padding: '12px 20px',
                        backgroundColor: tone === t ? '#f59e0b' : '#1a1a1d',
                        color: tone === t ? '#000' : '#a1a1aa',
                        borderRadius: '12px',
                        fontSize: '24px'
                      }}
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
              <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>目标受众</Text>
              <ScrollView scrollX showHorizontalScrollIndicator={false}>
                <View style={{ display: 'flex', gap: '12px' }}>
                  {audiences.map((aud) => (
                    <View
                      key={aud}
                      style={{
                        flexShrink: 0,
                        padding: '12px 20px',
                        backgroundColor: targetAudience === aud ? '#f59e0b' : '#1a1a1d',
                        color: targetAudience === aud ? '#000' : '#a1a1aa',
                        borderRadius: '12px',
                        fontSize: '24px'
                      }}
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
              <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>视频时长</Text>
              <View style={{ display: 'flex', gap: '12px' }}>
                {durations.map((dur) => (
                  <View
                    key={dur}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: duration === dur ? '#f59e0b' : '#1a1a1d',
                      color: duration === dur ? '#000' : '#a1a1aa',
                      borderRadius: '12px',
                      fontSize: '22px',
                      textAlign: 'center'
                    }}
                    onClick={() => setDuration(dur)}
                  >
                    {dur}
                  </View>
                ))}
              </View>
            </View>

            {/* 画面风格 */}
            <View>
              <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>画面风格</Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {styles.map((s) => (
                  <View
                    key={s}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: style === s ? '#f59e0b' : '#1a1a1d',
                      color: style === s ? '#000' : '#a1a1aa',
                      borderRadius: '12px',
                      fontSize: '24px'
                    }}
                    onClick={() => setStyle(s)}
                  >
                    {s}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 生成按钮 */}
        <View style={{ padding: '0 32px', marginBottom: '32px' }}>
          <View
            style={{
              background: isGenerating 
                ? '#52525b' 
                : 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
              borderRadius: '16px',
              padding: '28px',
              textAlign: 'center'
            }}
            onClick={isGenerating ? undefined : handleGenerate}
          >
            <Text style={{ 
              fontSize: '32px', 
              fontWeight: '600',
              color: isGenerating ? '#a1a1aa' : '#000'
            }}>
              {isGenerating ? '⏳ 生成中...' : '🚀 一键生成内容'}
            </Text>
          </View>
        </View>

        {/* 加载状态 */}
        {isGenerating && loadingStep && (
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View style={{
              padding: '24px',
              backgroundColor: '#141416',
              borderRadius: '16px',
              border: '1px solid #27272a',
              textAlign: 'center'
            }}>
              <Text style={{ fontSize: '28px', color: '#f59e0b' }}>
                {loadingStep}
              </Text>
            </View>
          </View>
        )}

        {/* 生成结果 */}
        {generatedContent && (
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View style={{ 
              backgroundColor: '#141416',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #27272a'
            }}>
              <View style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <Text style={{ fontSize: '28px', fontWeight: '600', color: '#fafafa' }}>
                  ✨ 生成结果
                </Text>
                <View style={{ display: 'flex', gap: '16px' }}>
                  <Text 
                    style={{ fontSize: '26px', color: '#f59e0b' }}
                    onClick={handleReset}
                  >
                    🔄 重置
                  </Text>
                  <Text 
                    style={{ fontSize: '26px', color: '#22c55e' }}
                    onClick={handleSave}
                  >
                    📋 复制
                  </Text>
                </View>
              </View>

              <Text style={{ 
                fontSize: '26px', 
                color: '#a1a1aa',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap'
              }}>
                {generatedContent}
              </Text>
            </View>
          </View>
        )}

        {/* 功能提示 */}
        <View style={{ padding: '0 32px', marginBottom: '32px' }}>
          <View style={{
            padding: '24px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Text style={{ fontSize: '24px', color: '#3b82f6', display: 'block', marginBottom: '12px' }}>
              💡 使用提示
            </Text>
            <Text style={{ fontSize: '22px', color: '#71717a', lineHeight: '1.6' }}>
              1. 在"选题策划"页面选择要创作的内容主题{'\n'}
              2. 根据需求调整创作参数{'\n'}
              3. 点击生成后等待AI创作{'\n'}
              4. 生成完成后可直接复制使用
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContentCreationPage;
