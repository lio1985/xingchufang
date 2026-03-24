import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';

interface Topic {
  id: string;
  title: string;
  contentAngle: string;
  suitableAccount: string;
  format: 'short' | 'live';
  keywords: string[];
  suggestedTime: string;
}

export default function HotTopicGenerationPage() {
  const [hotId, setHotId] = useState('');
  const [platform, setPlatform] = useState('');
  const [hotValue, setHotValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {};
    console.log('URL参数:', params);

    if (params.hotId) {
      setHotId(decodeURIComponent(params.hotId));
    }
    if (params.platform) {
      setPlatform(decodeURIComponent(params.platform));
    }
    if (params.hot) {
      setHotValue(decodeURIComponent(params.hot));
    }
  }, []);

  const handleGenerateTopic = async () => {
    if (!hotId.trim()) {
      Taro.showToast({
        title: '热点信息不完整',
        icon: 'none'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/hot/generate-topic',
        method: 'POST',
        data: {
          title: hotId,
          platform: platform,
          hot: hotValue
        }
      });

      console.log('选题响应:', response);

      if (response.statusCode === 200 && response.data && response.data.data) {
        setTopics(response.data.data.topics || []);
        Taro.showToast({
          title: '选题获取成功',
          icon: 'success'
        });
      } else {
        throw new Error('获取失败');
      }
    } catch (error: any) {
      console.error('获取选题失败:', error);
      Taro.showToast({
        title: error.message || '获取失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (topic: Topic) => {
    // 跳转到脚本创作页面
    Taro.navigateTo({
      url: `/pages/hot-script-generation/index?topicId=${encodeURIComponent(topic.id)}&title=${encodeURIComponent(topic.title)}&contentAngle=${encodeURIComponent(topic.contentAngle)}`
    });
  };

  const handleCopyTopic = (topic: Topic) => {
    const text = `选题标题：${topic.title}\n内容角度：${topic.contentAngle}\n适合账号：${topic.suitableAccount}\n适合形式：${topic.format === 'short' ? '短视频' : '直播'}\n爆点关键词：${topic.keywords.join('、')}`;
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: '选题已复制',
          icon: 'success'
        });
      }
    });
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 标题区 */}
      <View className="bg-gradient-to-br from-sky-50 via-slate-800 to-slate-900 px-6 pt-8 pb-6 border-b border-slate-800">
        <View className="flex items-center gap-3">
          <View className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Text>💡</Text>
          </View>
          <View>
            <Text className="block text-2xl font-bold text-white mb-1 tracking-tight">选题推荐</Text>
            <Text className="block text-xs text-purple-400 font-medium tracking-wider">TOPIC RECOMMENDATION</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" scrollY>
        {/* 热点信息 */}
        {hotId && (
          <View className="px-4 mt-4">
            <View className="bg-slate-800 backdrop-blur-sm rounded-xl border border-slate-700/80 p-4">
              <Text className="block text-xs text-slate-400 mb-1">原始热点</Text>
              <Text className="block text-base text-white font-medium leading-tight">
                {hotId}
              </Text>
              {platform && (
                <View className="mt-2 flex items-center gap-2">
                  <Text className="block text-xs text-slate-400">平台：</Text>
                  <Text className="block text-xs text-blue-400">{platform}</Text>
                </View>
              )}
              {hotValue && (
                <View className="mt-1 flex items-center gap-2">
                  <Text className="block text-xs text-slate-400">热度：</Text>
                  <Text className="block text-xs text-red-400">{hotValue}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 创建按钮 */}
        <View className="px-4 mt-4">
          <Button
            className={`w-full bg-purple-500 text-white border-none ${loading ? 'opacity-50' : ''}`}
            onClick={handleGenerateTopic}
            disabled={loading || topics.length > 0}
          >
            {loading ? (
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <Text>⏳</Text>
                <Text>处理中...</Text>
              </View>
            ) : topics.length > 0 ? (
              <Text>已完成选题</Text>
            ) : (
              <Text>获取选题</Text>
            )}
          </Button>
        </View>

        {/* 选题列表 */}
        {topics.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex items-center gap-2 mb-4">
              <Text>✨</Text>
              <Text className="block text-lg font-bold text-white">推荐选题</Text>
            </View>

            {/* 提示说明 */}
            <View className="mb-4 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
              <Text className="block text-xs text-purple-300 text-center">
                ⚠️ 内容仅供参考，建议结合实际使用
              </Text>
            </View>

            <View className="space-y-4 pb-6">
              {topics.map((topic, index) => (
                <View
                  key={topic.id}
                  className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/80 overflow-hidden"
                >
                  {/* 选题标题 */}
                  <View className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3 border-b border-slate-700/80">
                    <View className="flex items-start gap-2">
                      <View className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Text className="block text-xs font-bold text-purple-400">{index + 1}</Text>
                      </View>
                      <Text className="block text-base text-white font-medium leading-tight flex-1">
                        {topic.title}
                      </Text>
                    </View>
                  </View>

                  {/* 选题详情 */}
                  <View className="p-4 space-y-3">
                    {/* 内容角度 */}
                    <View>
                      <Text className="block text-xs text-slate-400 mb-1">内容角度</Text>
                      <Text className="block text-sm text-slate-200 leading-relaxed">
                        {topic.contentAngle}
                      </Text>
                    </View>

                    {/* 适合账号 */}
                    <View className="flex items-center gap-2">
                      <Text>👤</Text>
                      <Text className="block text-xs text-slate-400">适合账号：</Text>
                      <Text className="block text-xs text-blue-400">{topic.suitableAccount}</Text>
                    </View>

                    {/* 适合形式 */}
                    <View className="flex items-center gap-2">
                      <Text>🕐</Text>
                      <Text className="block text-xs text-slate-400">适合形式：</Text>
                      <Text className={`block text-xs ${topic.format === 'short' ? 'text-green-400' : 'text-orange-400'}`}>
                        {topic.format === 'short' ? '短视频' : '直播'}
                      </Text>
                    </View>

                    {/* 爆点关键词 */}
                    <View className="flex items-start gap-2">
                      <Text>📈</Text>
                      <Text className="block text-xs text-slate-400">爆点关键词：</Text>
                      <View className="flex-1 flex flex-wrap gap-1">
                        {topic.keywords.map((keyword, kIndex) => (
                          <Text
                            key={kIndex}
                            className="block text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded"
                          >
                            {keyword}
                          </Text>
                        ))}
                      </View>
                    </View>

                    {/* 建议发布时间 */}
                    {topic.suggestedTime && (
                      <View className="flex items-center gap-2">
                        <Text>🕐</Text>
                        <Text className="block text-xs text-slate-400">建议发布时间：</Text>
                        <Text className="block text-xs text-pink-400">{topic.suggestedTime}</Text>
                      </View>
                    )}

                    {/* 操作按钮 */}
                    <View className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/60">
                      <Button
                        size="mini"
                        className="flex-1 bg-slate-9000/20 text-blue-400 border border-blue-500/40"
                        onClick={() => handleSelectTopic(topic)}
                      >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                          <Text>创建脚本</Text>
                          <Text>→</Text>
                        </View>
                      </Button>
                      <Button
                        size="mini"
                        className="bg-slate-800 text-slate-400 border border-slate-700"
                        onClick={() => handleCopyTopic(topic)}
                      >
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                          <Text>📋</Text>
                          <Text>复制</Text>
                        </View>
                      </Button>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 底部留白 */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
