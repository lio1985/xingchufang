import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Lightbulb, PenTool, Sparkles, TrendingUp, ArrowRight, Settings, Check, Trash2, StickyNote, BookOpen } from 'lucide-react-taro';
import { Network } from '@/network';

const SystemsPage = () => {
  const router = useRouter();
  const [activeType, setActiveType] = useState('topic');
  const [topicQuestions, setTopicQuestions] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [inputSources, setInputSources] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查登录状态
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showModal({
        title: '请先登录',
        content: '使用创作系统功能需要登录账号，是否立即登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.reLaunch({ url: '/pages/login/index' });
          } else {
            Taro.navigateBack();
          }
        }
      });
      return;
    }

    const type = router.params.type || 'topic';
    setActiveType(type);

    if (type === 'topic') {
      loadInputSources();

      // 检查是否有策划的选题
      if (router.params.hasGenerated) {
        try {
          const generatedTopics = Taro.getStorageSync('generatedTopics');
          if (generatedTopics && generatedTopics.length > 0) {
            setTopicQuestions(generatedTopics);
          } else {
            loadTopicQuestions();
          }
        } catch (error) {
          console.error('读取策划的选题失败', error);
          loadTopicQuestions();
        }
      } else {
        loadTopicQuestions();
      }
    }
  }, [router.params]);

  const loadInputSources = async () => {
    try {
      setLoading(true);
      const res = await Network.request({
        url: '/api/input-sources',
        method: 'GET'
      });
      if (res.data.code === 200) {
        setInputSources(res.data.data);
      }
    } catch (error) {
      console.error('加载输入来源失败', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicSelection = (question: string) => {
    setSelectedTopics(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const handleGenerateContent = () => {
    if (selectedTopics.length === 0) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }
    // 保存选择的选题
    Taro.setStorageSync('selectedTopics', selectedTopics);
    Taro.navigateTo({
      url: '/pages/content-system/index'
    });
  };

  const handleDeleteTopic = (question: string, index: number) => {
    // 删除选题
    setTopicQuestions(prev => prev.filter((_, i) => i !== index));

    // 如果该选题已选中，也从选中列表中移除
    if (selectedTopics.includes(question)) {
      setSelectedTopics(prev => prev.filter(q => q !== question));
    }

    Taro.showToast({ title: '已删除', icon: 'success' });
  };

  const handleClearTopics = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有策划的选题吗？',
      success: (res) => {
        if (res.confirm) {
          setTopicQuestions([]);
          setSelectedTopics([]);
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  };

  const loadTopicQuestions = async () => {
    try {
      // 先获取输入来源配置
      const sourcesRes = await Network.request({
        url: '/api/input-sources',
        method: 'GET'
      });

      const params: any = {};

      // 如果有平台配置，添加到查询参数
      if (sourcesRes.data.code === 200 && sourcesRes.data.data?.platforms?.length > 0) {
        params.platforms = sourcesRes.data.data.platforms.join(',');
      }

      const res = await Network.request({
        url: '/api/topic-questions',
        method: 'GET',
        data: params
      });

      if (res.data.code === 200) {
        setTopicQuestions(res.data.data || []);
      }
    } catch (error) {
      console.error('加载选题问题失败', error);
    }
  };

  const renderTopicSystem = () => (
    <View className="flex flex-col gap-4">
      {/* 选择你的创作素材来源 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <View className="flex items-center justify-between mb-3">
          <View className="flex items-center gap-2">
            <Text className="block text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb size={20} color="#fbbf24" />
              选择创作素材来源
            </Text>
            {loading ? (
              <Text className="block text-xs text-slate-400">加载中...</Text>
            ) : inputSources && inputSources.platforms && inputSources.platforms.length > 0 ? (
              <Text className="block text-xs text-emerald-400">已配置</Text>
            ) : null}
          </View>
          <View
            className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all"
            onClick={() => Taro.navigateTo({ url: '/pages/input-sources/index' })}
          >
            <Settings size={14} color="#60a5fa" />
            <Text className="block text-xs text-blue-300">筛选</Text>
          </View>
        </View>

        {/* 平台选择 */}
        {inputSources?.platforms && inputSources.platforms.length > 0 && (
          <View className="mb-4">
            <Text className="block text-sm text-slate-400 mb-2">已选平台</Text>
            <View className="flex flex-wrap gap-2">
              {inputSources.platforms.map((platform: string) => (
                <View
                  key={platform}
                  className="bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg"
                >
                  <Text className="block text-xs text-blue-400">
                    {platform === 'douyin' ? '抖音' : platform === 'xiaohongshu' ? '小红书' : '视频号'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 自定义问题 */}
        {inputSources?.customQuestions && (
          <View className="mb-4">
            <Text className="block text-sm text-slate-400 mb-2">自定义问题</Text>
            <View className="flex flex-col gap-2">
              {/* 直播问题 */}
              {inputSources.customQuestions.liveQuestions && inputSources.customQuestions.liveQuestions.length > 0 && (
                <View className="bg-slate-700/50 rounded-lg p-3">
                  <Text className="block text-xs text-slate-500 mb-2">直播高频问题 ({inputSources.customQuestions.liveQuestions.length})</Text>
                  {inputSources.customQuestions.liveQuestions.slice(0, 3).map((q: string, idx: number) => (
                    <Text key={idx} className="block text-xs text-slate-300 mb-1 truncate">{idx + 1}. {q}</Text>
                  ))}
                  {inputSources.customQuestions.liveQuestions.length > 3 && (
                    <Text className="block text-xs text-blue-400">还有 {inputSources.customQuestions.liveQuestions.length - 3} 个问题...</Text>
                  )}
                </View>
              )}
              {/* 销售问题 */}
              {inputSources.customQuestions.salesQuestions && inputSources.customQuestions.salesQuestions.length > 0 && (
                <View className="bg-slate-700/50 rounded-lg p-3">
                  <Text className="block text-xs text-slate-500 mb-2">销售高频问题 ({inputSources.customQuestions.salesQuestions.length})</Text>
                  {inputSources.customQuestions.salesQuestions.slice(0, 3).map((q: string, idx: number) => (
                    <Text key={idx} className="block text-xs text-slate-300 mb-1 truncate">{idx + 1}. {q}</Text>
                  ))}
                  {inputSources.customQuestions.salesQuestions.length > 3 && (
                    <Text className="block text-xs text-blue-400">还有 {inputSources.customQuestions.salesQuestions.length - 3} 个问题...</Text>
                  )}
                </View>
              )}
              {/* 评论问题 */}
              {inputSources.customQuestions.commentQuestions && inputSources.customQuestions.commentQuestions.length > 0 && (
                <View className="bg-slate-700/50 rounded-lg p-3">
                  <Text className="block text-xs text-slate-500 mb-2">私信评论问题 ({inputSources.customQuestions.commentQuestions.length})</Text>
                  {inputSources.customQuestions.commentQuestions.slice(0, 3).map((q: string, idx: number) => (
                    <Text key={idx} className="block text-xs text-slate-300 mb-1 truncate">{idx + 1}. {q}</Text>
                  ))}
                  {inputSources.customQuestions.commentQuestions.length > 3 && (
                    <Text className="block text-xs text-blue-400">还有 {inputSources.customQuestions.commentQuestions.length - 3} 个问题...</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* 热点来源 */}
        {inputSources?.hotTopicSources && inputSources.hotTopicSources.length > 0 && (
          <View>
            <Text className="block text-sm text-slate-400 mb-2">热点来源</Text>
            <View className="flex flex-wrap gap-2">
              {inputSources.hotTopicSources.map((source: string) => (
                <View
                  key={source}
                  className="bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg"
                >
                  <Text className="block text-xs text-amber-400">
                    {source === 'douyin' ? '抖音' : source === 'baidu' ? '百度' : source === 'toutiao' ? '头条' : '微博'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 未配置提示 */}
        {!inputSources || (
          (!inputSources.platforms || inputSources.platforms.length === 0) &&
          (!inputSources.customQuestions ||
            (!inputSources.customQuestions.liveQuestions?.length &&
             !inputSources.customQuestions.salesQuestions?.length &&
             !inputSources.customQuestions.commentQuestions?.length))
        ) && (
          <View className="bg-slate-700/30 rounded-lg p-4 text-center">
            <Text className="block text-sm text-slate-400 mb-2">尚未配置输入来源</Text>
            <View
              className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg active:scale-95 transition-all"
              onClick={() => Taro.navigateTo({ url: '/pages/input-sources/index' })}
            >
              <Text className="block text-xs text-blue-300">去筛选</Text>
            </View>
          </View>
        )}
      </View>

      {/* 策划的选题列表 */}
      {topicQuestions.length > 0 && (
        <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-lg font-semibold text-white">策划的选题</Text>
            <View className="flex items-center gap-3">
              <Text
                className="block text-xs text-blue-400"
                onClick={() => setSelectedTopics(topicQuestions.map(t => t.question))}
              >
                全选
              </Text>
              <View className="w-px h-4 bg-slate-600"></View>
              <Text
                className="block text-xs text-red-400"
                onClick={handleClearTopics}
              >
                清空
              </Text>
              <View className="w-px h-4 bg-slate-600"></View>
              <View className="flex items-center gap-1 text-blue-400">
                <Sparkles size={16} />
                <Text className="block text-xs">{topicQuestions.length} 个选题</Text>
              </View>
            </View>
          </View>
          <View className="flex flex-col gap-2">
            {topicQuestions.map((item, index) => (
              <View
                key={index}
                className={`flex items-start gap-3 py-3 px-3 rounded-lg border-2 transition-all ${
                  selectedTopics.includes(item.question)
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-700/30'
                }`}
                onClick={() => toggleTopicSelection(item.question)}
              >
                <View
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedTopics.includes(item.question)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopicSelection(item.question);
                  }}
                >
                  {selectedTopics.includes(item.question) && <Check size={12} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="block text-sm text-white leading-relaxed">{item.question}</Text>
                </View>
                <View
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 active:scale-95 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTopic(item.question, index);
                  }}
                >
                  <Trash2 size={14} color="#ef4444" />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 确认按钮 */}
      {topicQuestions.length > 0 && selectedTopics.length > 0 && (
        <View className="px-4">
          <View
            className="bg-blue-500 text-white text-center py-3 rounded-xl font-medium active:opacity-80 flex items-center justify-center gap-2"
            onClick={handleGenerateContent}
          >
            <Sparkles size={18} />
            <Text className="block">已选择 {selectedTopics.length} 个选题，创作内容</Text>
          </View>
        </View>
      )}

      {/* 空状态提示 */}
      {topicQuestions.length === 0 && !loading && (
        <View className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
          <Lightbulb size={48} color="#475569" />
          <Text className="block text-slate-500 text-base mt-4 mb-2">
            暂无策划的选题
          </Text>
          <Text className="block text-slate-600 text-sm mb-4">
            请在上方选择创作素材来源并创建本次选题库
          </Text>
        </View>
      )}
    </View>
  );

  const renderContentSystem = () => (
    <View className="flex flex-col gap-4">
      {/* 脚本初稿制作 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <PenTool size={20} color="#60a5fa" />
          脚本初稿制作
        </Text>
        <View className="flex items-center gap-2 py-3 bg-slate-700/50 rounded-lg px-3">
          <Text className="block text-sm text-slate-400">结构化提示词输入</Text>
          <ArrowRight size={16} color="#94a3b8" />
          <Text className="block text-sm text-blue-400 font-medium">五段式脚本输出</Text>
        </View>
      </View>

      {/* 多版本拆分 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3">多版本拆分</Text>
        <View className="grid grid-cols-2 gap-2">
          <View className="bg-slate-700/50 rounded-lg p-3 text-center">
            <Text className="block text-sm text-white mb-1">快答版</Text>
            <Text className="block text-xs text-slate-400">30秒快速解答</Text>
          </View>
          <View className="bg-slate-700/50 rounded-lg p-3 text-center">
            <Text className="block text-sm text-white mb-1">清单版</Text>
            <Text className="block text-xs text-slate-400">要点清单列举</Text>
          </View>
          <View className="bg-slate-700/50 rounded-lg p-3 text-center">
            <Text className="block text-sm text-white mb-1">预算对比版</Text>
            <Text className="block text-xs text-slate-400">价格方案对比</Text>
          </View>
          <View className="bg-slate-700/50 rounded-lg p-3 text-center">
            <Text className="block text-sm text-white mb-1">避坑版</Text>
            <Text className="block text-xs text-slate-400">常见误区提醒</Text>
          </View>
          <View className="bg-slate-700/50 rounded-lg p-3 text-center col-span-2">
            <Text className="block text-sm text-white mb-1">案例延伸版</Text>
            <Text className="block text-xs text-slate-400">实际案例拓展</Text>
          </View>
        </View>
      </View>

      {/* 平台适配改写 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3">平台适配改写</Text>
        <View className="flex flex-col gap-2">
          <View className="flex items-center gap-3 py-2 bg-slate-700/50 rounded-lg px-3">
            <Text className="block text-sm text-white">抖音</Text>
            <Text className="block text-xs text-slate-400">视频平台</Text>
          </View>
          <View className="flex items-center gap-3 py-2 bg-slate-700/50 rounded-lg px-3">
            <Text className="block text-sm text-white">小红书</Text>
            <Text className="block text-xs text-slate-400">图文平台</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderLexiconSystem = () => (
    <View className="flex flex-col gap-4">
      {/* 企业语料库 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles size={20} color="#34d399" />
          企业语料库
        </Text>
        <View className="flex flex-col gap-2">
          <View className="flex items-start gap-2 py-2 border-b border-slate-700">
            <Text className="block text-emerald-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">沉淀标准术语</Text>
          </View>
          <View className="flex items-start gap-2 py-2 border-b border-slate-700">
            <Text className="block text-emerald-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">行业表达</Text>
          </View>
          <View className="flex items-start gap-2 py-2">
            <Text className="block text-emerald-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">成本逻辑与判断模型</Text>
          </View>
        </View>
      </View>

      {/* 个人IP语料库 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3">个人IP语料库</Text>
        <View className="flex flex-col gap-2">
          <View className="flex items-start gap-2 py-2 border-b border-slate-700">
            <Text className="block text-blue-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">主播真实表达</Text>
          </View>
          <View className="flex items-start gap-2 py-2 border-b border-slate-700">
            <Text className="block text-blue-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">常用判断话术</Text>
          </View>
          <View className="flex items-start gap-2 py-2">
            <Text className="block text-blue-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">成交表达风格</Text>
          </View>
        </View>
      </View>

      {/* 执行机制 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3">执行机制</Text>
        <Text className="block text-sm text-slate-300 leading-relaxed">
          输出脚本必须经过语料替换与人工优化
        </Text>
      </View>
    </View>
  );

  const renderViralSystem = () => (
    <View className="flex flex-col gap-4">
      {/* 核心目标 */}
      <View className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/30 p-4">
        <Text className="block text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <TrendingUp size={20} color="#f87171" />
          核心目标
        </Text>
        <Text className="block text-sm text-slate-300 leading-relaxed">
          分析热门内容，提取成功要素并高效复刻
        </Text>
      </View>

      {/* 执行方式 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3">执行方式</Text>
        <View className="flex flex-col gap-2">
          <View className="flex items-start gap-2 py-2 border-b border-slate-700">
            <Text className="block text-red-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">热门内容采集</Text>
          </View>
          <View className="flex items-start gap-2 py-2 border-b border-slate-700">
            <Text className="block text-red-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">成功要素提取</Text>
          </View>
          <View className="flex items-start gap-2 py-2 border-b border-slate-700">
            <Text className="block text-red-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">模板制作</Text>
          </View>
          <View className="flex items-start gap-2 py-2">
            <Text className="block text-red-400 mt-1">•</Text>
            <Text className="block text-sm text-slate-300">复刻推荐算法</Text>
          </View>
        </View>
      </View>

      {/* 爆款模板 */}
      <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <Text className="block text-lg font-semibold text-white mb-3">爆款模板库</Text>
        <View className="flex flex-col gap-2">
          <View className="flex items-center gap-2 py-2 bg-slate-700/50 rounded-lg px-3">
            <Text className="block text-sm text-white">知识分享型</Text>
            <Text className="block text-xs text-red-400 px-2 py-0.5 bg-red-500/20 rounded">热门</Text>
          </View>
          <View className="flex items-center gap-2 py-2 bg-slate-700/50 rounded-lg px-3">
            <Text className="block text-sm text-white">观点输出型</Text>
            <Text className="block text-xs text-red-400 px-2 py-0.5 bg-red-500/20 rounded">推荐</Text>
          </View>
          <View className="flex items-center gap-2 py-2 bg-slate-700/50 rounded-lg px-3">
            <Text className="block text-sm text-white">情感共鸣型</Text>
            <Text className="block text-xs text-red-400 px-2 py-0.5 bg-red-500/20 rounded">推荐</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部导航 */}
      <View className="bg-slate-800 px-4 py-3 flex items-center gap-2 flex-wrap">
        <View
          className="flex items-center text-slate-400 px-3 py-1.5 rounded-lg"
          onClick={() => Taro.navigateTo({ url: '/pages/quick-note/index' })}
        >
          <StickyNote size={16} color="#94a3b8" style={{ marginRight: '4px' }} />
          <Text className="block text-sm">灵感速记</Text>
        </View>
        <View
          className={`flex items-center px-3 py-1.5 rounded-lg ${activeType === 'topic' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'}`}
          onClick={() => {
            setActiveType('topic');
            loadTopicQuestions();
          }}
        >
          <Lightbulb size={16} color={activeType === 'topic' ? '#60a5fa' : '#94a3b8'} style={{ marginRight: '4px' }} />
          <Text className="block text-sm">选题策划</Text>
        </View>
        <View
          className="flex items-center text-slate-400 px-3 py-1.5 rounded-lg"
          onClick={() => Taro.navigateTo({ url: '/pages/content-system/index' })}
        >
          <PenTool size={16} color="#94a3b8" style={{ marginRight: '4px' }} />
          <Text className="block text-sm">内容创作</Text>
        </View>
        <View
          className="flex items-center text-slate-400 px-3 py-1.5 rounded-lg"
          onClick={() => Taro.navigateTo({ url: '/pages/lexicon-system/index' })}
        >
          <Sparkles size={16} color="#94a3b8" style={{ marginRight: '4px' }} />
          <Text className="block text-sm">语料优化</Text>
        </View>
        <View
          className="flex items-center text-slate-400 px-3 py-1.5 rounded-lg"
          onClick={() => Taro.navigateTo({ url: '/pages/viral-system/index' })}
        >
          <TrendingUp size={16} color="#94a3b8" style={{ marginRight: '4px' }} />
          <Text className="block text-sm">爆款复刻</Text>
        </View>
        <View
          className="flex items-center text-slate-400 px-3 py-1.5 rounded-lg"
          onClick={() => Taro.navigateTo({ url: '/pages/knowledge-share/index' })}
        >
          <BookOpen size={16} color="#94a3b8" style={{ marginRight: '4px' }} />
          <Text className="block text-sm">知识分享</Text>
        </View>
      </View>

      {/* 内容区 */}
      <View className="p-4">
        {activeType === 'topic' && renderTopicSystem()}
        {activeType === 'content' && renderContentSystem()}
        {activeType === 'lexicon' && renderLexiconSystem()}
        {activeType === 'viral' && renderViralSystem()}
      </View>
    </View>
  );
};

export default SystemsPage;
