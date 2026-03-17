import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import {
  Lightbulb, ArrowLeft, Sparkles, Check, Trash2, Settings,
  TrendingUp, SlidersHorizontal, RefreshCw
} from 'lucide-react-taro';
import { Network } from '@/network';

interface TopicQuestion {
  question: string;
  source: string;
  category: string;
  hotScore: number;
}

const TopicPlanningPage = () => {
  const [topicQuestions, setTopicQuestions] = useState<TopicQuestion[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputSources, setInputSources] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
    loadInputSources();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/topic-questions',
        method: 'GET'
      });

      if (res.data.code === 200) {
        setTopicQuestions(res.data.data || []);
      }
    } catch (error) {
      console.error('加载选题失败', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInputSources = async () => {
    try {
      const res = await Network.request({
        url: '/api/input-sources',
        method: 'GET'
      });
      if (res.data.code === 200) {
        setInputSources(res.data.data);
      }
    } catch (error) {
      console.error('加载输入来源失败', error);
    }
  };

  const toggleTopicSelection = (question: string) => {
    setSelectedTopics(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const handleSelectAll = () => {
    setSelectedTopics(topicQuestions.map(t => t.question));
  };

  const handleClearAll = () => {
    setSelectedTopics([]);
  };

  const handleDeleteTopic = (question: string) => {
    setTopicQuestions(prev => prev.filter(t => t.question !== question));
    if (selectedTopics.includes(question)) {
      setSelectedTopics(prev => prev.filter(q => q !== question));
    }
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    setIsGenerating(true);
    try {
      // 保存选择的选题
      Taro.setStorageSync('selectedTopics', selectedTopics);

      // 跳转到内容创作页面
      Taro.navigateTo({
        url: '/pages/content-system/index'
      });

      Taro.showToast({ title: '已选择选题', icon: 'success' });
    } catch (error) {
      console.error('生成失败', error);
      Taro.showToast({ title: '生成失败', icon: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部导航栏 */}
      <View className="sticky top-0 z-10 bg-slate-800 border-b border-slate-700 px-4 py-4">
        <View className="flex items-center gap-3">
          {/* 返回按钮 */}
          <View
            className="flex items-center justify-center w-10 h-10 bg-slate-800 rounded-xl active:scale-95 transition-all"
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </View>

          {/* 标题 */}
          <Text className="block text-xl font-bold text-white flex-1">选题策划</Text>

          {/* 刷新按钮 */}
          <View
            className="flex items-center justify-center w-10 h-10 bg-slate-800 rounded-xl active:scale-95 transition-all"
            onClick={handleRefresh}
          >
            <RefreshCw size={20} color="#94a3b8" />
          </View>

          {/* 筛选按钮 */}
          <View
            className="flex items-center justify-center w-10 h-10 bg-slate-800 rounded-xl active:scale-95 transition-all"
            onClick={() => Taro.navigateTo({ url: '/pages/input-sources/index' })}
          >
            <SlidersHorizontal size={20} color="#94a3b8" />
          </View>
        </View>

        {/* 操作栏 */}
        <View className="flex items-center justify-between mt-3">
          <View className="flex items-center gap-2">
            <Text className="block text-sm text-slate-400">共 {topicQuestions.length} 个选题</Text>
            {selectedTopics.length > 0 && (
              <Text className="block text-sm text-blue-400">已选 {selectedTopics.length} 个</Text>
            )}
          </View>
          <View className="flex items-center gap-2">
            {selectedTopics.length > 0 && (
              <>
                <Text
                  className="block text-sm text-slate-400"
                  onClick={handleClearAll}
                >
                  清空
                </Text>
                <View className="w-px h-4 bg-slate-700"></View>
                <Text
                  className="block text-sm text-blue-400"
                  onClick={handleSelectAll}
                >
                  全选
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* 内容区 */}
      <ScrollView className="flex-1" scrollY>
        {/* 输入来源信息 */}
        {inputSources && (
          <View className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
            <View className="flex items-center gap-2 text-sm text-slate-400">
              <Settings size={16} color="#60a5fa" />
              <Text>来源配置：</Text>
              {inputSources.platforms?.length > 0 ? (
                <Text className="text-emerald-400">
                  {inputSources.platforms.join(', ')}
                </Text>
              ) : (
                <Text className="text-slate-400">未配置</Text>
              )}
            </View>
          </View>
        )}

        {/* 选题列表 */}
        {loading ? (
          <View className="flex items-center justify-center py-20">
            <Text className="block text-slate-400">加载中...</Text>
          </View>
        ) : topicQuestions.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20 px-4">
            <Lightbulb size={48} color="#475569" />
            <Text className="block text-slate-400 mt-4 text-center">
              暂无选题
            </Text>
            <View
              className="mt-4 px-4 py-2 bg-slate-9000/20 border border-sky-500/30 rounded-lg"
              onClick={handleRefresh}
            >
              <Text className="block text-sm text-blue-300">刷新获取</Text>
            </View>
          </View>
        ) : (
          <View className="p-4 flex flex-col gap-3">
            {topicQuestions.map((topic, index) => (
              <View
                key={index}
                className={`bg-slate-800 rounded-xl border transition-all ${
                  selectedTopics.includes(topic.question)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700'
                }`}
                onClick={() => toggleTopicSelection(topic.question)}
              >
                <View className="p-4">
                  {/* 选题标题 */}
                  <View className="flex items-start gap-3">
                    <View className="flex items-center justify-center w-5 h-5 border-2 border-slate-700 rounded mt-0.5">
                      {selectedTopics.includes(topic.question) && (
                        <Check size={14} color="#60a5fa" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="block text-base text-white leading-relaxed">
                        {topic.question}
                      </Text>
                    </View>
                  </View>

                  {/* 选题信息 */}
                  <View className="flex items-center gap-3 mt-3 ml-8">
                    <View className="flex items-center gap-1">
                      <TrendingUp size={14} color={topic.hotScore > 80 ? '#f87171' : '#94a3b8'} />
                      <Text className={`text-xs ${topic.hotScore > 80 ? 'text-red-400' : 'text-slate-400'}`}>
                        热度 {topic.hotScore}
                      </Text>
                    </View>
                    {topic.category && (
                      <View className="px-2 py-0.5 bg-slate-800 rounded">
                        <Text className="block text-xs text-slate-400">{topic.category}</Text>
                      </View>
                    )}
                    {topic.source && (
                      <Text className="block text-xs text-slate-400">{topic.source}</Text>
                    )}
                  </View>
                </View>

                {/* 删除按钮 */}
                <View
                  className="px-4 py-2 border-t border-slate-700 flex items-center justify-end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTopic(topic.question);
                  }}
                >
                  <Trash2 size={14} color="#94a3b8" />
                  <Text className="block text-xs text-slate-400 ml-1">删除</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-4 py-3 safe-area-bottom">
        <View
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            selectedTopics.length === 0
              ? 'bg-slate-800'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
          }`}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={20} color="white" className="animate-spin" />
              <Text className="block text-base font-medium text-white">生成中...</Text>
            </>
          ) : (
            <>
              <Sparkles size={20} color="white" />
              <Text className="block text-base font-medium text-white">
                {selectedTopics.length === 0 ? '请选择选题' : `生成内容 (${selectedTopics.length})`}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default TopicPlanningPage;
