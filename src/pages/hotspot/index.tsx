import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Flame, RefreshCw, TrendingUp, TrendingDown, Minus, Flame as FlameIcon } from 'lucide-react-taro';
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

interface PlatformData {
  platform: string;
  icon: string;
  list: HotKeyword[];
}

const HotspotPage = () => {
  const [allPlatforms, setAllPlatforms] = useState<PlatformData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

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

      if (response.statusCode === 200 && response.data && response.data.success && response.data.data && response.data.data.platforms) {
        const platforms = Array.isArray(response.data.data.platforms) ? response.data.data.platforms : [];
        console.log('解析后的平台数量:', platforms.length);
        console.log('第一个平台:', platforms[0]);

        setAllPlatforms(platforms);
        setLastUpdateTime(new Date().toISOString());

        // 更新状态
        if (platforms.length === 0 || platforms.every((p: any) => p.list.length === 0)) {
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
      if (allPlatforms.length === 0) {
        Taro.showToast({ title: errorMsg, icon: 'none', duration: 2000 });
      }
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, lastUpdateTime, allPlatforms.length, CACHE_TTL]);

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

      if (response.statusCode === 200 && response.data && response.data.success && response.data.data && response.data.data.platforms) {
        const platforms = Array.isArray(response.data.data.platforms) ? response.data.data.platforms : [];
        setAllPlatforms(platforms);
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

  // 初始化时加载热力图数据
  useEffect(() => {
    loadHotKeywords();
  }, [loadHotKeywords]);

  // 点击热点关键词
  const handleKeywordClick = (item: HotKeyword) => {
    if (item.url) {
      Taro.setClipboardData({
        data: item.url,
        success: () => {
          Taro.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        }
      });
    } else {
      Taro.showToast({
        title: '暂无链接',
        icon: 'none'
      });
    }
  };

  // 生成选题
  const handleGenerateTopic = (item: HotKeyword) => {
    // 跳转到选题生成页面
    Taro.navigateTo({
      url: `/pages/hot-topic-generation/index?hotId=${encodeURIComponent(item.title)}&platform=${encodeURIComponent(item.platform || '')}&hot=${encodeURIComponent(item.hot)}`
    });
  };

  // 生成脚本
  const handleGenerateScript = (item: HotKeyword) => {
    // 跳转到脚本生成页面
    Taro.navigateTo({
      url: `/pages/hot-script-generation/index?hotId=${encodeURIComponent(item.title)}&platform=${encodeURIComponent(item.platform || '')}&hot=${encodeURIComponent(item.hot)}`
    });
  };

  // 复制标题
  const handleCopyTitle = (title: string) => {
    Taro.setClipboardData({
      data: title,
      success: () => {
        Taro.showToast({
          title: '标题已复制',
          icon: 'success'
        });
      }
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
      <View className="min-h-screen bg-slate-900 flex items-center justify-center">
        <View className="text-center">
          <View className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Text className="block text-white text-base">加载中...</Text>
        </View>
      </View>
    );
  }

  if (loadStatus === 'error') {
    return (
      <View className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
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
      <View className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <View className="text-center">
          <FlameIcon size={48} color="#64748b" strokeWidth={1} />
          <Text className="block text-slate-400 text-lg mt-4">暂无热点数据</Text>
          <Text className="block text-slate-500 text-sm mt-2">稍后再来看看吧</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 标题区 */}
      <View className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-8 pb-6 border-b border-slate-800">
        <View className="flex items-center gap-3">
          <View className="w-12 h-12 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <MapPin size={24} color="#fbbf24" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="block text-2xl font-bold text-white mb-1 tracking-tight">全网热点</Text>
            <Text className="block text-xs text-blue-400 font-medium tracking-wider">ALL HOT TOPICS</Text>
          </View>
        </View>
      </View>

      {/* 热力图区域 */}
      <View className="px-4 mt-4">
        <View className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/80 p-5 shadow-xl shadow-black/20">
          {/* 标题和刷新按钮 */}
          <View className="mb-4">
            <View className="flex items-center justify-between mb-3">
              <View className="flex items-center gap-2">
                <Flame size={20} color="#fbbf24" strokeWidth={2} />
                <Text className="block text-lg font-bold text-white">全网热点</Text>
              </View>
              <Button
                size="mini"
                className={`bg-blue-500/20 text-blue-400 border border-blue-500/40 ${refreshing ? 'opacity-50' : ''}`}
                onClick={refreshHotKeywords}
                disabled={refreshing}
              >
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={14} color="#60a5fa" strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
                  <Text className="block">{refreshing ? '刷新中...' : '刷新'}</Text>
                </View>
              </Button>
            </View>
            <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 flex items-center justify-between">
              <Text className="block text-sm text-blue-300">
                数据来源：TopHub（今日热榜）聚合30+平台
              </Text>
              {lastUpdateTime && (
                <Text className="block text-xs text-blue-400">
                  更新于: {new Date(lastUpdateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              )}
            </View>
          </View>

          {/* 平台分组列表 */}
          <View className="space-y-6">
            {allPlatforms.map((platform, platformIndex) => (
              <View key={platformIndex} className="bg-slate-900/50 rounded-xl border border-slate-700/80 overflow-hidden">
                {/* 平台标题 */}
                <View className="bg-gradient-to-r from-slate-800 to-slate-800/80 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
                  <View className="flex items-center gap-2">
                    <Text className="block text-sm font-semibold text-white">{platform.platform}</Text>
                    <Text className="block text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                      {platform.list.length} 条
                    </Text>
                  </View>
                </View>

                {/* 热点列表 */}
                <View className="divide-y divide-slate-700/60">
                  {platform.list.map((item, index) => (
                    <View
                      key={index}
                      className="px-4 py-3 hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => handleKeywordClick(item)}
                    >
                      <View className="flex items-start gap-3">
                        {/* 排名 */}
                        <View className="flex-shrink-0">
                          <Text
                            className={`block text-sm font-bold w-6 text-center ${
                              index === 0 ? 'text-red-500' :
                              index === 1 ? 'text-orange-500' :
                              index === 2 ? 'text-yellow-500' :
                              'text-slate-500'
                            }`}
                          >
                            {item.rank}
                          </Text>
                        </View>

                        {/* 内容 */}
                        <View className="flex-1 min-w-0">
                          <View className="flex items-start gap-2 mb-1">
                            <Text className="block text-sm text-white font-medium flex-1 leading-tight">
                              {item.title}
                            </Text>
                            {item.isBursting && (
                              <View className="flex-shrink-0 bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded">
                                爆
                              </View>
                            )}
                          </View>

                          <View className="flex items-center gap-2 mb-2">
                            <Text className="block text-xs text-slate-400">
                              热度: {item.hot}
                            </Text>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2px' }}>
                              {renderTrendIcon(item)}
                              {item.trendChange !== undefined && item.trendChange !== 0 && (
                                <Text className={`block text-xs ${item.trendChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {Math.abs(item.trendChange)}
                                </Text>
                              )}
                            </View>
                          </View>

                          {item.summary && (
                            <Text className="block text-xs text-slate-500 mt-1 line-clamp-2">
                              {item.summary}
                            </Text>
                          )}

                          {item.category && (
                            <View className="mt-1">
                              <Text className="block text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded inline-block">
                                {item.category}
                              </Text>
                            </View>
                          )}

                          {/* 操作按钮 */}
                          <View className="flex items-center gap-2 mt-2">
                            <Button
                              size="mini"
                              className="bg-blue-500/20 text-blue-400 border border-blue-500/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateTopic(item);
                              }}
                            >
                              <Text className="block text-xs">生成选题</Text>
                            </Button>
                            <Button
                              size="mini"
                              className="bg-purple-500/20 text-purple-400 border border-purple-500/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateScript(item);
                              }}
                            >
                              <Text className="block text-xs">生成脚本</Text>
                            </Button>
                            <Button
                              size="mini"
                              className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyTitle(item.title);
                              }}
                            >
                              <Text className="block text-xs">复制</Text>
                            </Button>
                          </View>
                        </View>

                        {/* 趋势图标 */}
                        <View className="flex-shrink-0 flex items-center">
                          {renderTrendIcon(item)}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 底部留白 */}
      <View className="h-20" />
    </View>
  );
};

export default HotspotPage;
