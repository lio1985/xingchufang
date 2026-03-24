import { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  siteName?: string;
  publishTime?: string;
}

const NewsPage = () => {
  const [keyword, setKeyword] = useState('');
  const [timeRange, setTimeRange] = useState('1d');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }

    setLoading(true);
    setResults([]);
    setAiSummary('');

    try {
      console.log('=== 前端网络请求 ===');
      console.log('URL:', '/api/news/search');
      console.log('Method:', 'POST');
      console.log('Body:', { keyword, timeRange });
      
      const response = await Network.request({
        url: '/api/news/search',
        method: 'POST',
        data: { keyword, timeRange }
      });

      console.log('=== 前端响应数据 ===');
      console.log('Response:', response);

      if (response.statusCode === 200 && response.data) {
        setResults(response.data.results || []);
        setAiSummary(response.data.summary || '');
      } else {
        Taro.showToast({ title: '搜索失败', icon: 'none' });
      }
    } catch (error) {
      console.error('搜索失败:', error);
      Taro.showToast({ title: '搜索失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url: string) => {
    // 小程序端需要使用 web-view 打开外部链接
    // 这里暂时使用复制链接的方式
    Taro.setClipboardData({
      data: url,
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 头部搜索区 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-4">
        <Text className="block text-xl font-bold text-white mb-4">热点资讯</Text>

        {/* 搜索框 */}
        <View className="relative mb-4">
          <Text>?</Text>
          <Input
            className="w-full bg-slate-800 rounded-xl pl-12 pr-4 py-3 text-white text-base"
            placeholder="搜索热点资讯..."
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>

        {/* 时间筛选 */}
        <ScrollView scrollX className="flex gap-2">
          {[
            { value: '1d', label: '今天' },
            { value: '1w', label: '本周' },
            { value: '1m', label: '本月' },
          ].map((item) => (
            <View
              key={item.value}
              className={`px-4 py-2 rounded-xl flex-shrink-0 transition-all ${
                timeRange === item.value
                  ? 'bg-amber-500/20 border border-amber-500/30'
                  : 'bg-slate-800 border border-slate-700'
              }`}
              onClick={() => setTimeRange(item.value)}
            >
              <Text className={`text-sm font-medium ${
                timeRange === item.value ? 'text-amber-300' : 'text-slate-400'
              }`}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* 搜索按钮 */}
        <View
          className={`w-full py-3 rounded-xl flex items-center justify-center mt-4 transition-all ${
            loading || !keyword.trim()
              ? 'bg-slate-800 text-slate-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 active:scale-95'
          }`}
          onClick={() => !loading && handleSearch()}
        >
          <Text className="block text-base font-bold">
            {loading ? '搜索中...' : '开始搜索'}
          </Text>
        </View>
      </View>

      {/* 内容区域 */}
      <ScrollView scrollY className="flex-1 px-4 py-4">
        {/* 摘要 */}
        {aiSummary && (
          <View className="mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-sky-500/30 p-5">
            <View className="flex items-center gap-2 mb-3">
              <Text>✨</Text>
              <Text className="block text-base font-bold text-blue-300">摘要</Text>
            </View>
            <Text className="block text-sm text-slate-300 leading-relaxed">
              {aiSummary}
            </Text>
          </View>
        )}

        {/* 搜索结果 */}
        {results.length === 0 && !loading && keyword === '' && (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Text>?</Text>
            </View>
            <Text className="block text-base text-slate-400 mb-2">搜索热点资讯</Text>
            <Text className="block text-sm text-slate-300">输入关键词，发现最新动态</Text>
          </View>
        )}

        {results.length === 0 && !loading && keyword !== '' && (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Text>🌐</Text>
            </View>
            <Text className="block text-base text-slate-400 mb-2">未找到相关资讯</Text>
            <Text className="block text-sm text-slate-300">试试其他关键词</Text>
          </View>
        )}

        {results.length > 0 && (
          <View className="flex flex-col gap-3">
            <Text className="block text-sm font-medium text-slate-400 mb-2">
              找到 {results.length} 条结果
            </Text>
            {results.map((item, index) => (
              <View
                key={index}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-4 active:scale-[0.99] transition-all"
              >
                {/* 标题 */}
                <Text className="block text-base font-bold text-white mb-2 leading-snug">
                  {item.title}
                </Text>

                {/* 来源和时间 */}
                <View className="flex items-center gap-3 mb-3">
                  {item.siteName && (
                    <View className="flex items-center gap-1">
                      <Text>🌐</Text>
                      <Text className="block text-xs text-blue-300">{item.siteName}</Text>
                    </View>
                  )}
                  {item.publishTime && (
                    <View className="flex items-center gap-1">
                      <Text>🕐</Text>
                      <Text className="block text-xs text-slate-400">{formatTime(item.publishTime)}</Text>
                    </View>
                  )}
                </View>

                {/* 摘要 */}
                <Text className="block text-sm text-slate-400 leading-relaxed mb-3 line-clamp-3">
                  {item.snippet}
                </Text>

                {/* 链接按钮 */}
                <View
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-xl self-start active:scale-95 transition-all"
                  onClick={() => openUrl(item.url)}
                >
                  <Text>🔗</Text>
                  <Text className="block text-xs text-blue-300">查看原文</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NewsPage;
