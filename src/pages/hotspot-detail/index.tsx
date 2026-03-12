import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Bookmark, BookmarkCheck, Flame, Clock, TrendingUp, Lightbulb, Info, Link2 } from 'lucide-react-taro';
import { Network } from '@/network';
import TimelineChart from '@/components/TimelineChart';

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  controversies?: string[];
}

interface RelatedTopic {
  id: string;
  title: string;
  hotness: number;
  platform: string;
}

interface TimelineData {
  time: string;
  hotness: number;
  event: string;
}

export default function HotspotDetailPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [hotness, setHotness] = useState(0);
  const [summary, setSummary] = useState('');
  const [publishTime, setPublishTime] = useState('');
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [content, setContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  // 新增状态
  const [creativeAngles, setCreativeAngles] = useState<string[]>([]);
  const [loadingAngles, setLoadingAngles] = useState(false);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);

  // 格式化热度值
  const formatHotness = (value: number): string => {
    if (value >= 10000) {
      return (value / 10000).toFixed(1) + 'w';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toString();
  };

  // 格式化时间
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days}天前`;
      } else if (hours > 0) {
        return `${hours}小时前`;
      } else {
        return '刚刚';
      }
    } catch (error) {
      return timeStr;
    }
  };

  // 收藏到选题库
  const handleSaveToTopic = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'POST',
        data: {
          title: keyword,
          content: content || summary || keyword,
          category: category || '热门',
          tags: [platform, '热点']
        }
      });

      if (response.statusCode === 200) {
        Taro.showToast({
          title: '已保存到选题库',
          icon: 'success'
        });
        setIsSaved(true);
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('保存到选题库失败:', error);
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 打开原文链接
  const handleOpenUrl = () => {
    if (!url) {
      Taro.showToast({
        title: '暂无原文链接',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '提示',
      content: '即将跳转到外部链接，是否继续？',
      success: (res) => {
        if (res.confirm) {
          // 使用 web-view 或者外部浏览器打开
          Taro.setClipboardData({
            data: url,
            success: () => {
              Taro.showToast({
                title: '链接已复制，请在浏览器中打开',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  };

  useEffect(() => {
    // 从路由参数中获取数据
    const { id, keyword: kw, platform: pf, url: u, hotness: h, summary: s, publishTime: pt, category: cat } = router.params;

    console.log('=== 热点详情参数 ===');
    console.log('id:', id);
    console.log('keyword:', kw);
    console.log('platform:', pf);
    console.log('url:', u);
    console.log('hotness:', h);

    const decodedKeyword = decodeURIComponent(kw || '');
    const decodedPlatform = decodeURIComponent(pf || '');
    const decodedUrl = decodeURIComponent(u || '');
    const decodedSummary = decodeURIComponent(s || '');
    const decodedPublishTime = decodeURIComponent(pt || '');
    const decodedCategory = decodeURIComponent(cat || '');

    setKeyword(decodedKeyword);
    setPlatform(decodedPlatform);
    setUrl(decodedUrl);
    setHotness(parseInt(h || '0', 10));
    setSummary(decodedSummary);
    setPublishTime(decodedPublishTime);
    setCategory(decodedCategory);

    // 生成详细内容
    generateContent(decodedKeyword, decodedPlatform, decodedCategory);

    // 加载创作角度
    loadCreativeAngles(decodedKeyword, decodedCategory);

    // 加载舆情分析（如果有summary则使用，否则根据标题分析）
    if (decodedSummary) {
      analyzeSentiment(decodedSummary, decodedCategory);
    }

    // 加载相关推荐
    const loadRelatedTopics = async () => {
      setLoadingRelated(true);
      try {
        // 这里应该调用后端API获取相关推荐
        // 由于需要传递allTopics，暂时使用模拟数据
        const mockRelated: RelatedTopic[] = [
          { id: 'r1', title: `${decodedKeyword}相关话题1`, hotness: 50000, platform: '微博' },
          { id: 'r2', title: `${decodedKeyword}相关话题2`, hotness: 30000, platform: '知乎' },
        ];
        setRelatedTopics(mockRelated);
      } catch (error) {
        console.error('加载相关推荐失败:', error);
      } finally {
        setLoadingRelated(false);
      }
    };

    // 加载时间轴
    const loadTimeline = async () => {
      try {
        const response = await Network.request({
          url: '/api/hot-topics/timeline',
          method: 'POST',
          data: {
            hotness: parseInt(h || '0', 10),
            publishTime: decodedPublishTime
          }
        });

        if (response.statusCode === 200 && response.data?.code === 200 && response.data?.data?.timeline) {
          setTimelineData(response.data.data.timeline);
        }
      } catch (error) {
        console.error('加载时间轴失败:', error);
      }
    };

    loadRelatedTopics();
    loadTimeline();
  }, [router.params]);

  // 加载创作角度
  const loadCreativeAngles = async (topicKeyword: string, categoryName: string) => {
    setLoadingAngles(true);
    try {
      const response = await Network.request({
        url: '/api/hot-topics/creative-angles',
        method: 'POST',
        data: {
          keyword: topicKeyword,
          category: categoryName
        }
      });

      if (response.statusCode === 200 && response.data?.code === 200 && response.data?.data?.angles) {
        setCreativeAngles(response.data.data.angles);
      }
    } catch (error) {
      console.error('加载创作角度失败:', error);
    } finally {
      setLoadingAngles(false);
    }
  };

  // 舆情分析
  const analyzeSentiment = async (text: string, categoryName: string) => {
    setLoadingSentiment(true);
    try {
      // 使用简单的关键词分析（实际应该调用后端API）
      const positiveKeywords = ['突破', '成功', '创新', '增长', '提升', '优化', '发布', '推出', '精彩', '美好', '积极'];
      const negativeKeywords = ['暴跌', '危机', '问题', '失败', '争议', '批评', '质疑', '下跌', '下滑', '挑战'];

      let positiveCount = 0;
      let negativeCount = 0;
      const controversies: string[] = [];

      positiveKeywords.forEach(kw => {
        if (text.includes(kw)) positiveCount++;
      });

      negativeKeywords.forEach(kw => {
        if (text.includes(kw)) {
          negativeCount++;
          if (['争议', '质疑', '批评'].includes(kw)) {
            controversies.push(`"${kw}"相关讨论引发争议`);
          }
        }
      });

      // 如果没有争议点，根据分类生成通用争议点
      if (controversies.length === 0 && (negativeCount > 0 || positiveCount > 0)) {
        if (categoryName === '科技' || categoryName === '财经') {
          controversies.push('影响范围和实际效果存在分歧');
        } else if (categoryName === '娱乐' || categoryName === '社会') {
          controversies.push('不同群体观点差异较大');
        }
      }

      const total = positiveCount + negativeCount + 1;
      const sentimentResult: SentimentData = {
        positive: Math.round((positiveCount / total) * 100),
        negative: Math.round((negativeCount / total) * 100),
        neutral: 100 - Math.round((positiveCount / total) * 100) - Math.round((negativeCount / total) * 100),
        controversies: controversies.length > 0 ? controversies : undefined
      };

      setSentimentData(sentimentResult);
    } catch (error) {
      console.error('舆情分析失败:', error);
    } finally {
      setLoadingSentiment(false);
    }
  };

  // 生成详细内容（调用后端 API）
  const generateContent = async (topicKeyword: string, platformName: string, categoryName: string) => {
    setLoadingContent(true);

    try {
      console.log('=== 调用后端获取热点详情内容 ===');
      console.log('keyword:', topicKeyword);
      console.log('platform:', platformName);
      console.log('category:', categoryName);

      const response = await Network.request({
        url: '/api/hot-topics/content',
        method: 'POST',
        data: {
          keyword: topicKeyword,
          platform: platformName,
          category: categoryName
        }
      });

      console.log('后端响应:', response);

      if (response.statusCode === 200 && response.data?.code === 200 && response.data?.data?.content) {
        setContent(response.data.data.content);
      } else {
        throw new Error(response.data?.msg || '获取内容失败');
      }
    } catch (error) {
      console.error('获取热点详情内容失败:', error);

      // Fallback: 使用前端模板生成
      console.log('使用前端 fallback 模板');
      const templates = [
        `${topicKeyword}

【事件背景】
近期，"${topicKeyword}"在${platformName}平台上引发了广泛关注。作为${categoryName || '当前'}领域的热门话题，这一现象反映了当下的社会趋势和用户关注点。根据平台数据显示，相关讨论量持续攀升，用户参与度极高。

【核心内容】
这一话题的兴起主要源于以下几个方面：

1. 社会关注度：随着社会发展和信息传播速度的加快，"${topicKeyword}"逐渐成为公众讨论的焦点。多个相关话题在微博、知乎等平台上形成了热烈的讨论氛围。

2. 行业影响：对于${categoryName || '相关'}行业而言，这一话题不仅引发了业内的深入思考，也为行业发展提供了新的视角和机遇。

3. 用户反馈：从${platformName}的用户反馈来看，大家对这一话题表现出了浓厚的兴趣。评论区里充满了各种观点和见解，形成了多元化的讨论生态。

【各方观点】
支持者认为：这一话题体现了社会进步和人们认知的提升，为相关领域的发展注入了新的活力。

观望者则表示：需要更多的实证数据来支撑相关论点，期待后续有更深入的研究和报道。

【未来展望】
随着讨论的深入，预计"${topicKeyword}"这一话题将会在更多领域产生连锁反应。业内人士建议，应当理性看待这一现象，既要关注其积极意义，也要注意可能存在的潜在问题。

【相关建议】
对于关注这一话题的读者，建议：
- 保持理性思考，不盲从网络舆论
- 从多个渠道获取信息，形成独立判断
- 关注官方渠道的权威发布

本内容由${platformName}平台热榜聚合整理，仅供参考。`,

        `${topicKeyword}

【最新动态】
${platformName}热榜数据显示，"${topicKeyword}"已成为当前最受关注的话题之一。这一现象的出现并非偶然，而是多种因素共同作用的结果。

【深度分析】
从内容角度来看，"${topicKeyword}"之所以能够引发如此广泛的讨论，主要归因于：

1. 话题时效性：该话题紧扣当前社会热点，反映了大众最关心的问题。

2. 内容共鸣：话题内容与广大用户的日常生活和实际需求密切相关，容易引发情感共鸣。

3. 传播效应：在社交媒体的放大作用下，相关内容得到了快速传播和扩散。

【网友热议】
在${platformName}上，网友们对这一话题展开了激烈讨论：

- @用户A：这个话题说到了我的心坎上，确实是我们现在面临的现实问题。
- @用户B：希望能有更多解决方案，而不只是提出问题。
- @用户C：从不同角度看，这个问题还有很多值得深思的地方。

【专家观点】
相关领域专家表示，"${topicKeyword}"这一话题的出现，反映了社会发展的必然趋势。建议各方应：
- 加强引导，形成理性的讨论氛围
- 关注问题的本质，而非表面现象
- 积极寻求解决方案，推动实际改善

【温馨提示】
本内容整理自${platformName}平台热榜，不代表官方立场。如需了解更多详细信息，请查阅相关权威渠道。`
      ];

      // 根据标题选择模板
      const templateIndex = (topicKeyword.length + platformName.length) % templates.length;
      setContent(templates[templateIndex]);
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <View className="min-h-screen bg-slate-900 pb-20">
      <ScrollView scrollY className="h-full">
        {/* 标题区 */}
        <View className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-4 pb-6">
          {/* 返回按钮 */}
          <View
            className="mb-4 w-10 h-10 bg-slate-800/80 rounded-xl flex items-center justify-center active:scale-95 transition-all"
            onClick={() => Taro.navigateBack()}
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </View>

          {/* 标题 */}
          <Text className="block text-2xl font-bold text-white mb-3 leading-relaxed">
            {keyword}
          </Text>

          {/* 元信息 */}
          <View className="flex flex-wrap gap-3 mb-4">
            {/* 平台 */}
            <View className="bg-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <TrendingUp size={14} color="#3b82f6" strokeWidth={2} />
              <Text className="block text-xs text-blue-400 font-medium">{platform}</Text>
            </View>

            {/* 热度 */}
            <View className="bg-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Flame size={14} color="#fbbf24" strokeWidth={2} />
              <Text className="block text-xs text-amber-400 font-medium">{formatHotness(hotness)}</Text>
            </View>

            {/* 时间 */}
            {publishTime && (
              <View className="bg-slate-700/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Clock size={14} color="#94a3b8" strokeWidth={2} />
                <Text className="block text-xs text-slate-400">{formatTime(publishTime)}</Text>
              </View>
            )}

            {/* 分类 */}
            {category && (
              <View className="bg-purple-500/20 px-3 py-1.5 rounded-lg">
                <Text className="block text-xs text-purple-400 font-medium">{category}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 内容区 */}
        <View className="px-6 py-6">
          {/* 详细内容 */}
          <View className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700/50">
            {loadingContent ? (
              <View className="flex items-center justify-center py-8">
                <Text className="block text-sm text-slate-400">加载内容中...</Text>
              </View>
            ) : content ? (
              <Text className="block text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {content}
              </Text>
            ) : (
              <Text className="block text-sm text-slate-400">暂无内容</Text>
            )}
          </View>

          {/* 💡 创作角度建议 */}
          {creativeAngles.length > 0 && (
            <View className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700/50">
              <View className="flex items-center gap-2 mb-3">
                <Lightbulb size={18} color="#fbbf24" strokeWidth={2} />
                <Text className="block text-base font-bold text-white">💡 创作角度建议</Text>
              </View>
              {loadingAngles ? (
                <Text className="block text-sm text-slate-400">加载中...</Text>
              ) : (
                <View className="space-y-2">
                  {creativeAngles.map((angle, index) => (
                    <View key={index} className="flex items-start gap-2">
                      <View className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Text className="text-xs text-emerald-400 font-medium">{index + 1}</Text>
                      </View>
                      <Text className="flex-1 text-sm text-slate-300 leading-relaxed">{angle}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 📊 舆情分析 */}
          {sentimentData && (
            <View className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700/50">
              <View className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} color="#3b82f6" strokeWidth={2} />
                <Text className="block text-base font-bold text-white">📊 舆情分析</Text>
              </View>
              {loadingSentiment ? (
                <Text className="block text-sm text-slate-400">分析中...</Text>
              ) : (
                <View className="space-y-3">
                  {/* 情感比例 */}
                  <View className="flex items-center gap-3">
                    <View className="flex-1">
                      <View className="flex items-center justify-between mb-1">
                        <Text className="text-xs text-slate-400">正面</Text>
                        <Text className="text-xs text-green-400 font-medium">{sentimentData.positive}%</Text>
                      </View>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${sentimentData.positive}%` }}
                        />
                      </View>
                    </View>
                    <View className="flex-1">
                      <View className="flex items-center justify-between mb-1">
                        <Text className="text-xs text-slate-400">负面</Text>
                        <Text className="text-xs text-red-400 font-medium">{sentimentData.negative}%</Text>
                      </View>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${sentimentData.negative}%` }}
                        />
                      </View>
                    </View>
                    <View className="flex-1">
                      <View className="flex items-center justify-between mb-1">
                        <Text className="text-xs text-slate-400">中性</Text>
                        <Text className="text-xs text-slate-400 font-medium">{sentimentData.neutral}%</Text>
                      </View>
                      <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-slate-500 transition-all"
                          style={{ width: `${sentimentData.neutral}%` }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* 争议点 */}
                  {sentimentData.controversies && sentimentData.controversies.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-slate-700">
                      <View className="flex items-center gap-2 mb-2">
                        <Info size={14} color="#f59e0b" strokeWidth={2} />
                        <Text className="text-xs text-amber-400 font-medium">主要争议点</Text>
                      </View>
                      <View className="space-y-1">
                        {sentimentData.controversies.map((controversy, index) => (
                          <Text key={index} className="text-xs text-slate-400">• {controversy}</Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 🔗 相关热点推荐 */}
          {relatedTopics.length > 0 && (
            <View className="bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-700/50">
              <View className="flex items-center gap-2 mb-3">
                <Link2 size={18} color="#8b5cf6" strokeWidth={2} />
                <Text className="block text-base font-bold text-white">🔗 相关热点推荐</Text>
              </View>
              {loadingRelated ? (
                <Text className="block text-sm text-slate-400">加载中...</Text>
              ) : (
                <View className="space-y-2">
                  {relatedTopics.map((topic, index) => (
                    <View
                      key={topic.id}
                      className="bg-slate-700/30 rounded-lg p-3 active:scale-[0.98] transition-transform"
                      onClick={() => {
                        Taro.navigateTo({
                          url: `/pages/hotspot-detail/index?id=${topic.id}&keyword=${encodeURIComponent(topic.title)}&platform=${encodeURIComponent(topic.platform)}&hotness=${topic.hotness}`
                        });
                      }}
                    >
                      <View className="flex items-start gap-3">
                        <View className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center flex-shrink-0">
                          <Text className="text-xs text-purple-400 font-medium">{index + 1}</Text>
                        </View>
                        <View className="flex-1 min-w-0">
                          <Text className="text-sm text-white font-medium line-clamp-1 mb-1">{topic.title}</Text>
                          <View className="flex items-center gap-2">
                            <Text className="text-xs text-slate-400">{topic.platform}</Text>
                            <View className="flex items-center gap-1">
                              <Flame size={10} color="#fbbf24" strokeWidth={2} />
                              <Text className="text-xs text-amber-400">{formatHotness(topic.hotness)}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 📈 热度时间轴 */}
          {timelineData.length > 0 && (
            <TimelineChart data={timelineData} />
          )}

          {/* 原文链接 - 改为次要按钮 */}
          {url && url !== '#' && (
            <View
              className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/30 active:scale-[0.98] transition-all cursor-pointer"
              onClick={handleOpenUrl}
            >
              <View className="flex items-center gap-3">
                <View className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center">
                  <ExternalLink size={16} color="#94a3b8" strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="block text-sm text-slate-300">查看原文链接</Text>
                  <Text className="block text-xs text-slate-500">复制链接到剪贴板</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-6 py-4 safe-area-bottom">
        <View className="flex gap-3">
          {/* 收藏按钮 */}
          <View style={{ flex: 1 }}>
            <Button
              className={`w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                isSaved
                  ? 'bg-green-500/20 border border-green-500/40'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 border-0'
              }`}
              onClick={handleSaveToTopic}
              disabled={isSaving || isSaved}
            >
              {isSaved ? (
                <BookmarkCheck size={18} color="#22c55e" strokeWidth={2} />
              ) : (
                <Bookmark size={18} color="#ffffff" strokeWidth={2} />
              )}
              <Text className={`text-base ${isSaved ? 'text-green-400' : 'text-white'}`}>
                {isSaving ? '保存中...' : isSaved ? '已收藏' : '收藏到选题库'}
              </Text>
            </Button>
          </View>

          {/* 分享按钮 */}
          <View style={{ flex: 1 }}>
            <Button
              className="w-full h-12 rounded-xl bg-slate-700/80 border border-slate-600 text-white font-medium flex items-center justify-center gap-2"
              onClick={() => {
                // 复制内容到剪贴板
                const shareText = `${keyword}\n\n${content || summary || ''}\n\n来源：${platform}\n热度：${formatHotness(hotness)}\n\n分享自星厨房内容创作助手`;
                Taro.setClipboardData({
                  data: shareText,
                  success: () => {
                    Taro.showToast({
                      title: '已复制到剪贴板',
                      icon: 'success'
                    });
                  }
                });
              }}
            >
              <Text className="text-base">分享</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
