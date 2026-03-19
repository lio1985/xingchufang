import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { Flame, RefreshCw, TrendingUp, TrendingDown, Minus, Flame as FlameIcon } from 'lucide-react-taro';
import { Network } from '@/network';

interface HotKeyword {
  id: string;
  rank: number;
  title: string;
  hot: string;
  url?: string;
  summary?: string;
  category?: string;
  trend?: 'up' | 'down' | 'stable';
  trendChange?: number;
  isBursting?: boolean;
  platform?: string;
}

const HotspotPage = () => {
  const [allHotKeywords, setAllHotKeywords] = useState<HotKeyword[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  const MAX_ITEMS = 50; // 最多显示50条
  const PAGE_SIZE = 20; // 每页显示20条

  // 加载热力图数据
  const loadHotKeywords = useCallback(async (forceRefresh: boolean = false) => {
    console.log('=== 开始加载热点数据 ===');
    console.log('forceRefresh:', forceRefresh);

    // 检查缓存
    if (!forceRefresh && lastUpdateTime) {
      const now = Date.now();
      const lastUpdate = new Date(lastUpdateTime).getTime();
      if (now - lastUpdate < CACHE_TTL) {
        console.log('使用缓存数据，距离上次更新:', Math.floor((now - lastUpdate) / 1000), '秒');
        return;
      }
    }

    // 防止重复请求
    if (refreshing) {
      console.log('正在刷新中，跳过重复请求');
      return;
    }

    console.log('发送请求...');
    setLoadStatus('loading');
    setErrorMessage('');
    setRefreshing(true);

    try {
      // 调用新的 /api/hot/all 接口
      const url = '/api/hot/all';
      console.log('请求URL:', url);
      console.log('请求方法:', 'GET');

      const response = await Network.request({
        url,
        method: 'GET'
      });

      console.log('=== 热点数据响应 ===');
      console.log('响应状态码:', response.statusCode);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));

      // 适配后端返回格式 {success: true, data: { platforms: [...] }}
      const responseData = response.data;
      console.log('responseData.success:', responseData?.success);
      console.log('responseData.data.platforms:', responseData?.data?.platforms);
      
      if (response.statusCode === 200 && responseData && responseData.success === true && responseData.data && Array.isArray(responseData.data.platforms)) {
        // 合并所有平台的热点数据
        const allPlatforms = responseData.data.platforms;
        console.log('平台数量:', allPlatforms.length);
        
        const mergedList: any[] = [];
        
        allPlatforms.forEach((platform: any, pIndex: number) => {
          console.log(`平台[${pIndex}]:`, platform.platform, '列表数量:', platform.list?.length || 0);
          if (platform.list && Array.isArray(platform.list)) {
            platform.list.forEach((item: any) => {
              mergedList.push({
                ...item,
                platform: platform.platform || item.source || '综合'
              });
            });
          }
        });
        
        console.log('合并后的总数据量:', mergedList.length);

        // 转换为前端需要的格式
        const mergedKeywords: HotKeyword[] = mergedList.map((item: any, index: number) => ({
          id: item.id?.toString() || `hot_${index}`,
          rank: index + 1,
          title: item.title || '',
          hot: item.hot ? item.hot.toString() : (item.heat ? item.heat.toString() : '0'),
          url: item.url || '',
          summary: item.summary || '',
          category: item.category || item.platform || '综合',
          trend: item.trend || 'stable',
          trendChange: item.trendChange || 0,
          isBursting: item.isBursting || false,
          platform: item.platform || '综合'
        }));
        
        console.log('转换后的关键词数量:', mergedKeywords.length);

        // 按热度排序（尝试解析热度值）
        mergedKeywords.sort((a, b) => {
          const parseHotValue = (hot: string): number => {
            const num = parseInt(hot, 10);
            return Number.isNaN(num) ? 0 : num;
          };
          const hotA = parseHotValue(a.hot);
          const hotB = parseHotValue(b.hot);
          return hotB - hotA; // 降序排列
        });

        // 限制最多50条
        const limitedKeywords = mergedKeywords.slice(0, MAX_ITEMS);

        // 分页加载：每次加载20条
        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, limitedKeywords.length);
        const displayKeywords = limitedKeywords.slice(startIdx, endIdx);

        console.log('合并后的热点数量:', mergedKeywords.length);
        console.log('限制后的热点数量:', limitedKeywords.length);
        console.log('当前页:', currentPage);
        console.log('本次显示的热点数量:', displayKeywords.length);

        // 如果是第一页，设置全部数据；否则追加数据
        if (currentPage === 1) {
          setAllHotKeywords(displayKeywords);
        } else {
          setAllHotKeywords(prev => [...prev, ...displayKeywords]);
        }

        setLastUpdateTime(new Date().toISOString());

        // 判断是否还有更多数据
        setHasMore(endIdx < limitedKeywords.length);

        // 更新状态
        if (limitedKeywords.length === 0) {
          setLoadStatus('empty');
          console.log('状态更新为: empty');
        } else {
          setLoadStatus('success');
          console.log('状态更新为: success');
        }
      } else {
        console.warn('热点数据响应格式不正确:', response.data);
        setLoadStatus('error');
        setErrorMessage('数据格式错误');
        console.log('状态更新为: error, 错误信息:', '数据格式错误');
      }
    } catch (error: any) {
      console.error('=== 加载热力图数据失败 ===');
      console.error('错误对象:', error);
      console.error('错误消息:', error.message);
      console.error('错误状态码:', error.statusCode);
      console.error('错误堆栈:', error.stack);

      let errorMsg = '热点数据加载失败';
      if (error.errMsg?.includes('request:fail') || error.message?.includes('Network')) {
        errorMsg = '网络连接失败';
      } else if (error.statusCode === 404) {
        errorMsg = '服务接口不存在';
      } else if (error.statusCode === 500) {
        errorMsg = '服务器内部错误';
      } else if (error.message) {
        errorMsg = error.message;
      }

      setLoadStatus('error');
      setErrorMessage(errorMsg);
      console.log('状态更新为: error, 错误信息:', errorMsg);

      // 只在首次加载失败时显示提示
      if (allHotKeywords.length === 0) {
        Taro.showToast({ title: errorMsg, icon: 'none', duration: 2000 });
      }
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [refreshing, lastUpdateTime, allHotKeywords.length, currentPage, CACHE_TTL]);

  // 刷新热力图数据
  const refreshHotKeywords = async () => {
    setRefreshing(true);
    try {
      // 调用新的 /api/hot/all 接口
      const url = '/api/hot/all';
      console.log('=== 开始刷新 ===');
      console.log('请求URL:', url);

      const response = await Network.request({
        url,
        method: 'GET'
      });

      console.log('=== 刷新响应 ===');
      console.log('响应状态码:', response.statusCode);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));

      const responseData = response.data;
      console.log('responseData.success:', responseData?.success);
      console.log('responseData.data:', responseData?.data);
      console.log('responseData.data.platforms:', responseData?.data?.platforms);
      
      if (response.statusCode === 200 && responseData && responseData.success === true && responseData.data && Array.isArray(responseData.data.platforms)) {
        // 合并所有平台的热点数据
        const allPlatforms = responseData.data.platforms;
        console.log('平台数量:', allPlatforms.length);
        
        const mergedList: any[] = [];
        
        allPlatforms.forEach((platform: any, pIndex: number) => {
          console.log(`平台[${pIndex}]:`, platform.platform, '列表数量:', platform.list?.length || 0);
          if (platform.list && Array.isArray(platform.list)) {
            platform.list.forEach((item: any) => {
              mergedList.push({
                ...item,
                platform: platform.platform || item.source || '综合'
              });
            });
          }
        });
        
        console.log('合并后的总数据量:', mergedList.length);

        // 转换为前端需要的格式
        const mergedKeywords: HotKeyword[] = mergedList.map((item: any, index: number) => ({
          id: item.id?.toString() || `hot_${index}`,
          rank: index + 1,
          title: item.title || '',
          hot: item.hot ? item.hot.toString() : (item.heat ? item.heat.toString() : '0'),
          url: item.url || '',
          summary: item.summary || '',
          category: item.category || item.platform || '综合',
          trend: item.trend || 'stable',
          trendChange: item.trendChange || 0,
          isBursting: item.isBursting || false,
          platform: item.platform || '综合'
        }));
        
        console.log('转换后的关键词数量:', mergedKeywords.length);

        // 按热度排序
        mergedKeywords.sort((a, b) => {
          const parseHotValue = (hot: string): number => {
            const num = parseInt(hot, 10);
            return Number.isNaN(num) ? 0 : num;
          };
          const hotA = parseHotValue(a.hot);
          const hotB = parseHotValue(b.hot);
          return hotB - hotA;
        });

        const displayKeywords = mergedKeywords.slice(0, Math.max(20, mergedKeywords.length));
        setAllHotKeywords(displayKeywords);
        setLastUpdateTime(new Date().toISOString());

        Taro.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      } else {
        throw new Error('响应数据格式错误');
      }
    } catch (error: any) {
      console.error('刷新失败:', error);
      Taro.showToast({
        title: '刷新失败，请重试',
        icon: 'none'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // 加载更多
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setCurrentPage(prev => prev + 1);
  };

  // 初始化时加载热力图数据
  useEffect(() => {
    loadHotKeywords();
  }, [loadHotKeywords]);

  // 点击热点关键词跳转到详情页
  const handleKeywordClick = (item: HotKeyword) => {
    const params = {
      keyword: item.title,
      platform: item.platform || '',
      url: item.url || '',
      hotness: item.hot || '0',
      summary: item.summary || '',
      category: item.category || ''
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    Taro.navigateTo({
      url: `/pages/hotspot-detail/index?${queryString}`
    });
  };

  // 渲染趋势图标
  const renderTrendIcon = (item: HotKeyword) => {
    if (item.trend === 'up' || (item.trendChange && item.trendChange > 0)) {
      return <TrendingUp size={14} color="#10b981" strokeWidth={2} />;
    } else if (item.trend === 'down' || (item.trendChange && item.trendChange < 0)) {
      return <TrendingDown size={14} color="#ef4444" strokeWidth={2} />;
    } else {
      return <Minus size={14} color="#64748b" strokeWidth={2} />;
    }
  };

  // 渲染状态
  if (loadStatus === 'loading') {
    return (
      <View className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <View className="text-center">
          <View className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Text className="block text-slate-300 text-base">加载中...</Text>
        </View>
      </View>
    );
  }

  if (loadStatus === 'error') {
    return (
      <View className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <View className="text-center">
          <Text className="block text-red-400 text-lg mb-3">加载失败</Text>
          <Text className="block text-slate-400 text-sm mb-4">{errorMessage}</Text>
          <Button
            type="primary"
            className="bg-blue-500 text-white border-none"
            onClick={() => loadHotKeywords(true)}
          >
            重新加载
          </Button>
        </View>
      </View>
    );
  }

  if (loadStatus === 'empty') {
    return (
      <View className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <View className="text-center">
          <FlameIcon size={48} color="#64748b" strokeWidth={1} />
          <Text className="block text-slate-400 text-lg mt-4">暂无热点数据</Text>
          <Text className="block text-slate-400 text-sm mt-2">稍后再来看看吧</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 标题区 */}
      <View className="bg-transparent px-4 pt-8 pb-5 border-b border-slate-700">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-3">
            <View className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 border border-orange-500/20">
              <Flame size={28} color="#f59e0b" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="block text-2xl font-bold text-white mb-0.5 tracking-tight">全网热点</Text>
              <Text className="block text-xs text-blue-400 font-medium tracking-widest opacity-90">REAL-TIME TRENDS</Text>
            </View>
          </View>
        </View>

        {/* 数据来源和操作栏 */}
        <View className="flex items-center justify-between gap-3">
          <View className="flex-1 bg-slate-800/60 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-700">
            <Text className="block text-xs text-slate-300">
              <Text className="text-blue-400">数据来源：</Text>TopHub 聚合 30+ 平台实时热点
            </Text>
            {lastUpdateTime && (
              <Text className="block text-xs text-slate-400 mt-0.5">
                共 <Text className="text-blue-400 font-semibold">{allHotKeywords.length}</Text> 条热点 · 更新于 {new Date(lastUpdateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <Button
            size="mini"
            className={`bg-slate-9000/20 text-blue-400 border border-sky-500/40 backdrop-blur-sm ${refreshing ? 'opacity-50' : ''}`}
            onClick={refreshHotKeywords}
            disabled={refreshing}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={14} color="#0EA5E9" strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
              <Text className="block">{refreshing ? '刷新中...' : '刷新'}</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* 热点列表 */}
      <View className="px-4 py-4 space-y-3">
        {allHotKeywords.map((item, index) => {
          return (
            <View
              key={index}
              className="bg-slate-800 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden shadow-sm px-4 py-3.5"
              onClick={() => handleKeywordClick(item)}
            >
              <View className="flex items-start gap-3">
                {/* 排名 */}
                <View className="flex-shrink-0">
                  <Text
                    className={`block text-sm font-bold w-7 text-center ${
                      index === 0 ? 'text-red-500' :
                      index === 1 ? 'text-orange-500' :
                      index === 2 ? 'text-yellow-500' :
                      'text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </Text>
                </View>

                {/* 内容 */}
                <View className="flex-1 min-w-0">
                  {/* 标题 */}
                  <View className="flex items-start gap-2 mb-1.5">
                    <Text className="block text-sm text-white font-medium flex-1 leading-snug">
                      {item.title}
                    </Text>
                    {item.isBursting && (
                      <View className="flex-shrink-0 bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded border border-red-500/30">
                        爆
                      </View>
                    )}
                  </View>

                  {/* 热度和趋势 */}
                  <View className="flex items-center gap-3 mb-2">
                    <Text className="block text-xs text-slate-400">
                      🔥 {item.hot}
                    </Text>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3px' }}>
                      {renderTrendIcon(item)}
                      {item.trendChange !== undefined && item.trendChange !== 0 && (
                        <Text className={`block text-xs ${item.trendChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {Math.abs(item.trendChange)}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* 摘要 */}
                  {item.summary && (
                    <Text className="block text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </Text>
                  )}

                  {/* 分类标签 */}
                  {item.category && (
                    <View className="mt-2">
                      <Text className="block text-xs text-blue-400 bg-slate-9000/10 px-2 py-0.5 rounded inline-block border border-sky-500/20">
                        {item.category}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* 加载更多按钮 */}
      {hasMore && loadStatus === 'success' && (
        <View className="flex justify-center py-4">
          <Button
            size="default"
            className="bg-slate-800 text-slate-300 border border-slate-700/50 px-8"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? '加载中...' : '加载更多'}
          </Button>
        </View>
      )}

      {/* 已全部加载提示 */}
      {!hasMore && allHotKeywords.length > 0 && (
        <View className="flex justify-center py-4">
          <Text className="block text-slate-400 text-sm">
            已加载全部 {allHotKeywords.length} 条热点
          </Text>
        </View>
      )}

      {/* 底部留白 */}
      <View className="h-24" />
    </View>
  );
};

export default HotspotPage;
