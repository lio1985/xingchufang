import { View, Text, Button, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { FileText, Copy, Loader, Sparkles, Hash, MessageCircle, Video } from 'lucide-react-taro';
import { Network } from '@/network';

interface GeneratedScript {
  id: string;
  fifteenSecond: string;
  thirtySecond: string;
  sixtySecond: string;
  douyinTitles: string[];
  commentGuidance: string[];
  liveTopics: string[];
  suggestedHashtags: string[];
}

export default function HotScriptGenerationPage() {
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [contentAngle, setContentAngle] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [activeTab, setActiveTab] = useState<'15s' | '30s' | '60s'>('30s');

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {};
    console.log('URL参数:', params);

    if (params.topicId) {
      setTopicId(decodeURIComponent(params.topicId));
    }
    if (params.title) {
      setTitle(decodeURIComponent(params.title));
    }
    if (params.contentAngle) {
      setContentAngle(decodeURIComponent(params.contentAngle));
    }
  }, []);

  const handleGenerateScript = async () => {
    if (!title.trim()) {
      Taro.showToast({
        title: '选题信息不完整',
        icon: 'none'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/hot/generate-script',
        method: 'POST',
        data: {
          topicId,
          title,
          contentAngle
        }
      });

      console.log('脚本生成响应:', response);

      if (response.statusCode === 200 && response.data && response.data.data) {
        setScript(response.data.data);
        Taro.showToast({
          title: '脚本生成成功',
          icon: 'success'
        });
      } else {
        throw new Error('生成失败');
      }
    } catch (error: any) {
      console.error('生成脚本失败:', error);
      Taro.showToast({
        title: error.message || '生成失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: `${label}已复制`,
          icon: 'success'
        });
      }
    });
  };

  const handleCopyAll = () => {
    if (!script) return;

    const allText = `选题标题：${title}\n内容角度：${contentAngle}\n\n15秒脚本：\n${script.fifteenSecond}\n\n30秒脚本：\n${script.thirtySecond}\n\n60秒脚本：\n${script.sixtySecond}\n\n抖音标题：\n${script.douyinTitles.join('\n')}\n\n评论区引导：\n${script.commentGuidance.join('\n')}\n\n直播间话题：\n${script.liveTopics.join('\n')}\n\n推荐话题标签：\n${script.suggestedHashtags.join(' ')}`;

    handleCopy(allText, '完整脚本');
  };

  const renderScriptContent = () => {
    if (!script) return null;

    let content = '';
    switch (activeTab) {
      case '15s':
        content = script.fifteenSecond;
        break;
      case '30s':
        content = script.thirtySecond;
        break;
      case '60s':
        content = script.sixtySecond;
        break;
    }

    return (
      <View className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4">
        <View className="flex items-center justify-between mb-3">
          <View className="flex items-center gap-2">
            <Video size={18} color="#a855f7" strokeWidth={2} />
            <Text className="block text-base font-bold text-white">
              {activeTab === '15s' ? '15秒快节奏' : activeTab === '30s' ? '30秒标准口播' : '60秒深度讲解'}
            </Text>
          </View>
          <Button
            size="mini"
            className="bg-slate-700/50 text-slate-400 border border-slate-600"
            onClick={() => handleCopy(content, '脚本')}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <Copy size={14} />
              <Text>复制</Text>
            </View>
          </Button>
        </View>

        <Textarea
          style={{ width: '100%', minHeight: '300px', backgroundColor: 'transparent', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.8' }}
          value={content}
          disabled
        />
      </View>
    );
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 标题区 */}
      <View className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-8 pb-6 border-b border-slate-800">
        <View className="flex items-center gap-3">
          <View className="w-12 h-12 bg-gradient-to-br from-pink-500/30 to-red-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <FileText size={24} color="#ec4899" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="block text-2xl font-bold text-white mb-1 tracking-tight">AI 脚本</Text>
            <Text className="block text-xs text-pink-400 font-medium tracking-wider">AI SCRIPT GENERATION</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" scrollY>
        {/* 选题信息 */}
        {title && (
          <View className="px-4 mt-4">
            <View className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/80 p-4">
              <Text className="block text-xs text-slate-400 mb-1">选题标题</Text>
              <Text className="block text-base text-white font-medium leading-tight">
                {title}
              </Text>
              {contentAngle && (
                <View className="mt-2">
                  <Text className="block text-xs text-slate-400 mb-1">内容角度</Text>
                  <Text className="block text-sm text-slate-200 leading-relaxed">
                    {contentAngle}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 生成按钮 */}
        <View className="px-4 mt-4">
          <Button
            className={`w-full bg-pink-500 text-white border-none ${loading ? 'opacity-50' : ''}`}
            onClick={handleGenerateScript}
            disabled={loading || script !== null}
          >
            {loading ? (
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <Loader size={16} color="white" className="animate-spin" />
                <Text>生成中...</Text>
              </View>
            ) : script !== null ? (
              <Text>已生成脚本</Text>
            ) : (
              <Text>生成脚本</Text>
            )}
          </Button>
        </View>

        {/* 脚本内容 */}
        {script && (
          <View className="px-4 mt-6">
            <View className="flex items-center gap-2 mb-4">
              <Sparkles size={20} color="#ec4899" strokeWidth={2} />
              <Text className="block text-lg font-bold text-white">AI 生成的脚本</Text>
            </View>

            {/* Tab切换 */}
            <View className="flex items-center gap-2 mb-4">
              <Button
                size="mini"
                className={`flex-1 ${activeTab === '15s' ? 'bg-pink-500/30 text-pink-400 border-pink-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700/80'}`}
                onClick={() => setActiveTab('15s')}
              >
                <Text>15秒</Text>
              </Button>
              <Button
                size="mini"
                className={`flex-1 ${activeTab === '30s' ? 'bg-pink-500/30 text-pink-400 border-pink-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700/80'}`}
                onClick={() => setActiveTab('30s')}
              >
                <Text>30秒</Text>
              </Button>
              <Button
                size="mini"
                className={`flex-1 ${activeTab === '60s' ? 'bg-pink-500/30 text-pink-400 border-pink-500/40' : 'bg-slate-800/80 text-slate-400 border-slate-700/80'}`}
                onClick={() => setActiveTab('60s')}
              >
                <Text>60秒</Text>
              </Button>
            </View>

            {/* 脚本内容 */}
            {renderScriptContent()}

            {/* 抖音标题 */}
            {script.douyinTitles && script.douyinTitles.length > 0 && (
              <View className="mt-4">
                <View className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4">
                  <View className="flex items-center gap-2 mb-3">
                    <FileText size={18} color="#f472b6" strokeWidth={2} />
                    <Text className="block text-base font-bold text-white">抖音标题</Text>
                  </View>
                  <View className="space-y-2">
                    {script.douyinTitles.map((t, index) => (
                      <View key={index} className="flex items-start gap-2">
                        <Text className="block text-xs text-pink-400 mt-0.5">{index + 1}.</Text>
                        <Text className="block text-sm text-slate-200 flex-1">{t}</Text>
                        <Button
                          size="mini"
                          className="bg-slate-700/50 text-slate-400 border border-slate-600"
                          onClick={() => handleCopy(t, '标题')}
                        >
                          <Copy size={14} />
                        </Button>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 评论区引导 */}
            {script.commentGuidance && script.commentGuidance.length > 0 && (
              <View className="mt-4">
                <View className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4">
                  <View className="flex items-center gap-2 mb-3">
                    <MessageCircle size={18} color="#34d399" strokeWidth={2} />
                    <Text className="block text-base font-bold text-white">评论区引导</Text>
                  </View>
                  <View className="space-y-2">
                    {script.commentGuidance.map((c, index) => (
                      <View key={index} className="flex items-start gap-2">
                        <Text className="block text-xs text-green-400 mt-0.5">{index + 1}.</Text>
                        <Text className="block text-sm text-slate-200 flex-1">{c}</Text>
                        <Button
                          size="mini"
                          className="bg-slate-700/50 text-slate-400 border border-slate-600"
                          onClick={() => handleCopy(c, '引导语')}
                        >
                          <Copy size={14} />
                        </Button>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 直播间话题 */}
            {script.liveTopics && script.liveTopics.length > 0 && (
              <View className="mt-4">
                <View className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4">
                  <View className="flex items-center gap-2 mb-3">
                    <Video size={18} color="#fbbf24" strokeWidth={2} />
                    <Text className="block text-base font-bold text-white">直播间话题</Text>
                  </View>
                  <View className="space-y-2">
                    {script.liveTopics.map((l, index) => (
                      <View key={index} className="flex items-start gap-2">
                        <Text className="block text-xs text-yellow-400 mt-0.5">{index + 1}.</Text>
                        <Text className="block text-sm text-slate-200 flex-1">{l}</Text>
                        <Button
                          size="mini"
                          className="bg-slate-700/50 text-slate-400 border border-slate-600"
                          onClick={() => handleCopy(l, '话题')}
                        >
                          <Copy size={14} />
                        </Button>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 推荐话题标签 */}
            {script.suggestedHashtags && script.suggestedHashtags.length > 0 && (
              <View className="mt-4">
                <View className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4">
                  <View className="flex items-center gap-2 mb-3">
                    <Hash size={18} color="#60a5fa" strokeWidth={2} />
                    <Text className="block text-base font-bold text-white">推荐话题标签</Text>
                  </View>
                  <View className="flex flex-wrap gap-2">
                    {script.suggestedHashtags.map((h, index) => (
                      <Text
                        key={index}
                        className="block text-sm text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full"
                      >
                        {h}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 复制全部按钮 */}
            <View className="mt-6">
              <Button
                className="w-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-white border border-pink-500/40"
                onClick={handleCopyAll}
              >
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <Copy size={18} />
                  <Text>复制全部内容</Text>
                </View>
              </Button>
            </View>
          </View>
        )}

        {/* 底部留白 */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
