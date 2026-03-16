import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { Flame, RefreshCw, TrendingUp, TrendingDown, Minus, Flame as FlameIcon, Heart, Copy, Sparkles } from 'lucide-react-taro';
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

// 平台图标映射
const PLATFORM_ICONS: { [key: string]: { icon: string; color: string; emoji: string } } = {
  '微博': { icon: 'w', color: '#e6162d', emoji: '🔴' },
  '知乎': { icon: 'z', color: '#0084ff', emoji: '💬' },
  '抖音': { icon: 'd', color: '#000000', emoji: '🎵' },
  '哔哩哔哩': { icon: 'b', color: '#fb7299', emoji: '📺' },
  '百度': { icon: 'b', color: '#2932e1', emoji: '🔍' },
  '今日头条': { icon: 't', color: '#f85959', emoji: '📰' },
  '腾讯新闻': { icon: 'q', color: '#0052d9', emoji: '📊' },
  '凤凰网': { icon: 'f', color: '#d81e06', emoji: '🔥' },
  '36氪': { icon: '3', color: '#0a9dd9', emoji: '💡' },
  '少数派': { icon: 's', color: '#f04e98', emoji: '💻' },
  '豆瓣': { icon: 'd', color: '#00b51d', emoji: '🎬' },
  '小红书': { icon: 'x', color: '#ff2442', emoji: '📸' },
  '快手': { icon: 'k', color: '#ff5000', emoji: '🎥' },
  '视频号': { icon: 'v', color: '#07c160', emoji: '🎬' },
  'GitHub': { icon: 'g', color: '#24292e', emoji: '💻' },
  '掘金': { icon: 'j', color: '#1e80ff', emoji: '⚡' },
  '综合': { icon: 'a', color: '#64748b', emoji: '🌐' },
  '其他': { icon: 'o', color: '#64748b', emoji: '📰' }
};

const HotspotPage = () => {
  const [allHotKeywords, setAllHotKeywords] = useState<HotKeyword[]>([]);
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

        // 合并所有平台的热点到一个列表
        const mergedKeywords: HotKeyword[] = [];
        platforms.forEach((platform: any) => {
          if (platform.list && Array.isArray(platform.list)) {
            platform.list.forEach((item: HotKeyword) => {
              mergedKeywords.push({
                ...item,
                platform: platform.platform
              });
            });
          }
        });

        // 按热度排序（尝试解析热度值）
        mergedKeywords.sort((a, b) => {
          const parseHotValue = (hot: string): number => {
            // 尝试提取数字
            const match = hot.match(/[\d.]+/);
            if (match) {
              const num = parseFloat(match[0]);
              // 处理单位
              if (hot.includes('万')) {
                return num * 10000;
              } else if (hot.includes('亿')) {
                return num * 100000000;
              }
              return num;
            }
            return 0;
          };

          const hotA = parseHotValue(a.hot);
          const hotB = parseHotValue(b.hot);
          return hotB - hotA; // 降序排列
        });

        // 确保至少显示20条（如果不足20条，显示所有）
        const displayKeywords = mergedKeywords.slice(0, Math.max(20, mergedKeywords.length));

        console.log('解析后的平台数量:', platforms.length);
        console.log('合并后的热点数量:', mergedKeywords.length);
        console.log('显示的热点数量:', displayKeywords.length);

        setAllHotKeywords(displayKeywords);
        setLastUpdateTime(new Date().toISOString());

        // 更新状态
        if (displayKeywords.length === 0) {
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
    }
  }, [refreshing, lastUpdateTime, allHotKeywords.length, CACHE_TTL]);

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

        // 合并所有平台的热点到一个列表
        const mergedKeywords: HotKeyword[] = [];
        platforms.forEach((platform: any) => {
          if (platform.list && Array.isArray(platform.list)) {
            platform.list.forEach((item: HotKeyword) => {
              mergedKeywords.push({
                ...item,
                platform: platform.platform
              });
            });
          }
        });

        // 按热度排序
        mergedKeywords.sort((a, b) => {
          const parseHotValue = (hot: string): number => {
            const match = hot.match(/[\d.]+/);
            if (match) {
              const num = parseFloat(match[0]);
              if (hot.includes('万')) {
                return num * 10000;
              } else if (hot.includes('亿')) {
                return num * 100000000;
              }
              return num;
            }
            return 0;
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

  // 收藏热点
  const handleFavorite = async (item: HotKeyword) => {
    try {
      const res = await Network.request({
        url: '/api/hot/favorite',
        method: 'POST',
        data: {
          hotTitle: item.title,
          platform: item.platform || '',
          hot: item.hot,
          topicTitle: '',
          scriptSummary: '',
          account: '',
          responsible: '',
          status: '待拍'
        }
      });

      console.log('[Hotspot] 收藏热点响应:', res.data);

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '已添加到待拍清单',
          icon: 'success'
        });
      } else {
        Taro.showToast({
          title: res.data?.msg || '收藏失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[Hotspot] 收藏热点失败:', error);
      Taro.showToast({
        title: '收藏失败',
        icon: 'none'
      });
    }
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
      <View className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 px-4 pt-8 pb-5 border-b border-slate-700/50">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-3">
            <View className="w-14 h-14 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30 border border-orange-500/30">
              <Flame size={28} color="#fbbf24" strokeWidth={2.5} />
            </View>
            <View>
              <Text className="block text-2xl font-bold text-white mb-0.5 tracking-tight">全网热点</Text>
              <Text className="block text-xs text-amber-400 font-medium tracking-widest opacity-90">REAL-TIME TRENDS</Text>
            </View>
          </View>
          <Button
            size="mini"
            className="bg-pink-500/20 text-pink-300 border border-pink-500/40 backdrop-blur-sm"
            onTap={() => Taro.navigateTo({ url: '/pages/favorite-list/index' })}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <Heart size={14} color="#f9a8d4" />
              <Text className="block text-xs">待拍清单</Text>
            </View>
          </Button>
        </View>

        {/* 数据来源和操作栏 */}
        <View className="flex items-center justify-between gap-3">
          <View className="flex-1 bg-slate-800/60 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-slate-700/50">
            <Text className="block text-xs text-slate-300">
              <Text className="text-amber-400">数据来源：</Text>TopHub 聚合 30+ 平台实时热点
            </Text>
            {lastUpdateTime && (
              <Text className="block text-xs text-slate-500 mt-0.5">
                共 <Text className="text-white font-semibold">{allHotKeywords.length}</Text> 条热点 · 更新于 {new Date(lastUpdateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <Button
            size="mini"
            className={`bg-blue-500/20 text-blue-300 border border-blue-500/40 backdrop-blur-sm ${refreshing ? 'opacity-50' : ''}`}
            onTap={refreshHotKeywords}
            disabled={refreshing}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={14} color="#93c5fd" strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
              <Text className="block">{refreshing ? '刷新中...' : '刷新'}</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* 热点列表 */}
      <View className="px-4 py-4 space-y-3">
        {allHotKeywords.map((item, index) => {
          const platformInfo = PLATFORM_ICONS[item.platform || ''] || { icon: '', color: '#64748b', emoji: '📊' };

          return (
            <View
              key={index}
              className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg shadow-black/20 px-4 py-3.5"
              onTap={() => handleKeywordClick(item)}
            >
              <View className="flex items-start gap-3">
                {/* 排名 */}
                <View className="flex-shrink-0">
                  <Text
                    className={`block text-sm font-bold w-7 text-center ${
                      index === 0 ? 'text-red-500' :
                      index === 1 ? 'text-orange-500' :
                      index === 2 ? 'text-yellow-500' :
                      'text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </Text>
                </View>

                {/* 内容 */}
                <View className="flex-1 min-w-0">
                  {/* 标题和平台 */}
                  <View className="flex items-start gap-2 mb-1.5">
                    <View className="flex items-center gap-1.5 flex-shrink-0 bg-slate-700/50 px-2 py-0.5 rounded-full border border-slate-600/40">
                      <Text className="block text-xs">{platformInfo.emoji}</Text>
                      <Text className="block text-xs text-slate-400">{item.platform || '未知平台'}</Text>
                    </View>
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
                        <Text className={`block text-xs ${item.trendChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.abs(item.trendChange)}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* 摘要 */}
                  {item.summary && (
                    <Text className="block text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </Text>
                  )}

                  {/* 分类标签 */}
                  {item.category && (
                    <View className="mt-2">
                      <Text className="block text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded inline-block border border-amber-500/20">
                        {item.category}
                      </Text>
                    </View>
                  )}

                  {/* 操作按钮 */}
                  <View className="flex items-center gap-2 mt-3 flex-wrap">
                    <Button
                      size="mini"
                      className="bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      onTap={(e) => {
                        e.stopPropagation();
                        handleGenerateTopic(item);
                      }}
                    >
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3px' }}>
                        <Sparkles size={12} color="#93c5fd" />
                        <Text className="block text-xs">选题</Text>
                      </View>
                    </Button>
                    <Button
                      size="mini"
                      className="bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      onTap={(e) => {
                        e.stopPropagation();
                        handleGenerateScript(item);
                      }}
                    >
                      <Text className="block text-xs">脚本</Text>
                    </Button>
                    <Button
                      size="mini"
                      className="bg-pink-500/20 text-pink-300 border border-pink-500/40"
                      onTap={(e) => {
                        e.stopPropagation();
                        handleFavorite(item);
                      }}
                    >
                      <Heart size={12} color="#f9a8d4" />
                    </Button>
                    <Button
                      size="mini"
                      className="bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      onTap={(e) => {
                        e.stopPropagation();
                        handleCopyTitle(item.title);
                      }}
                    >
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '3px' }}>
                        <Copy size={12} color="#fcd34d" />
                        <Text className="block text-xs">复制</Text>
                      </View>
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* 底部留白 */}
      <View className="h-24" />
    </View>
  );
};

export default HotspotPage;
