import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Flame, Search, SlidersHorizontal, ChevronDown, X, RefreshCw, Heart, Star, TrendingUp, TrendingDown, Minus, Copy, Share2, Flame as FlameIcon } from 'lucide-react-taro';
import { Network } from '@/network';

interface HotKeyword {
  id: string;
  keyword: string;
  hotness: number;
  platform: string;
  url?: string;
  summary?: string;
  publishTime?: string;
  category?: string;
  siteName?: string;
  trend?: 'up' | 'down' | 'stable';
  trendChange?: number;
  isBursting?: boolean;
  keywords?: string[];
}

type SortType = 'hotness' | 'time';

const SORT_OPTIONS = [
  { value: 'hotness', label: '热度排序' },
  { value: 'time', label: '时间排序' }
];

// 平台选项
const PLATFORM_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: '抖音', label: '抖音' },
  { value: '微博', label: '微博' },
  { value: '知乎', label: '知乎' },
  { value: 'B站', label: 'B站' },
  { value: '百度', label: '百度' },
  { value: '头条', label: '头条' },
  { value: 'GitHub', label: 'GitHub' },
  { value: '掘金', label: '掘金' },
];

// 分类选项
const CATEGORY_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: '科技', label: '科技' },
  { value: '娱乐', label: '娱乐' },
  { value: '体育', label: '体育' },
  { value: '财经', label: '财经' },
  { value: '社会', label: '社会' },
  { value: '国际', label: '国际' },
  { value: '生活', label: '生活' },
];

// 时间范围选项
const TIME_RANGE_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
];

const HotspotPage = () => {
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
  const [allKeywords, setAllKeywords] = useState<HotKeyword[]>([]);
  const [locationMode, setLocationMode] = useState<'national' | 'local'>('national');
  const [userCity, setUserCity] = useState('');
  const [loadingHotTopics, setLoadingHotTopics] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('hotness');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // 筛选器状态
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['all']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  // 收藏相关
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // 搜索相关
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false); // 标记是否在搜索模式

  // 更新时间
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  // 格式化热度值
  const formatHotness = (hotness: number): string => {
    if (hotness >= 10000) {
      return (hotness / 10000).toFixed(1) + 'w';
    }
    if (hotness >= 1000) {
      return (hotness / 1000).toFixed(1) + 'k';
    }
    return hotness.toString();
  };

  // 加载热力图数据
  const loadHotKeywords = useCallback(async () => {
    setLoadingHotTopics(true);
    try {
      // 构建 URL 查询参数
      let url = `/api/hot-topics?locationMode=${locationMode}`;
      if (locationMode === 'local' && userCity) {
        url += `&city=${encodeURIComponent(userCity)}`;
      }

      console.log('=== 加载热点数据 ===');
      console.log('请求URL:', url);

      const response = await Network.request({
        url,
        method: 'GET'
      });

      console.log('热点数据响应:', response.statusCode, response.data);

      if (response.statusCode === 200 && response.data && response.data.data && response.data.data.topics) {
        const results = Array.isArray(response.data.data.topics) ? response.data.data.topics : [];
        const keywords: HotKeyword[] = results.map((item: any, index: number) => ({
          id: `${item.id || Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          keyword: item.title || '',
          hotness: item.hotness || 0,
          platform: item.siteName || item.source || 'TopHub',
          url: item.url,
          summary: item.summary,
          publishTime: item.publishTime,
          category: item.category,
          siteName: item.siteName,
          trend: item.trend,
          trendChange: item.trendChange,
          isBursting: item.isBursting,
          keywords: item.keywords
        }));
        setAllKeywords(keywords);
        setHotKeywords(keywords);
        setLastUpdateTime(new Date().toISOString());
      } else {
        console.warn('热点数据响应格式不正确:', response.data);
      }
    } catch (error: any) {
      console.error('加载热力图数据失败:', error);
      let errorMsg = '热点数据加载失败';
      if (error.errMsg?.includes('request:fail') || error.message?.includes('Network')) {
        errorMsg = '网络连接失败';
      } else if (error.statusCode === 404) {
        errorMsg = '服务接口不存在';
      }
      // 只在首次加载失败时显示提示
      if (allKeywords.length === 0) {
        Taro.showToast({ title: errorMsg, icon: 'none', duration: 2000 });
      }
    } finally {
      setLoadingHotTopics(false);
    }
  }, [locationMode, userCity, allKeywords.length]);

  // 刷新热力图数据
  const refreshHotKeywords = async () => {
    setRefreshing(true);
    try {
      // 先清空显示数据，给用户明确的刷新反馈
      setHotKeywords([]);
      setAllKeywords([]);

      // 构建查询参数
      const params: any = {
        locationMode,
        _t: Date.now() // 添加时间戳避免缓存
      };
      if (locationMode === 'local' && userCity) {
        params.city = userCity;
      }

      console.log('=== 开始刷新 ===');
      console.log('请求参数:', params);

      const response = await Network.request({
        url: `/api/hot-topics/refresh`,
        method: 'POST',
        data: params
      });

      console.log('=== 热力图刷新响应 ===');
      console.log('响应状态码:', response.statusCode);
      console.log('响应数据:', response.data);

      if (response.statusCode === 200 && response.data && response.data.data && response.data.data.topics) {
        const results = Array.isArray(response.data.data.topics) ? response.data.data.topics : [];
        console.log('解析后的话题数量:', results.length);
        console.log('第一个话题:', results[0]);

        // 处理空数据情况
        if (results.length === 0) {
          Taro.showToast({
            title: '暂无热点数据',
            icon: 'none',
            duration: 2000
          });
          return;
        }

        const keywords: HotKeyword[] = results.map((item: any, index: number) => ({
          id: `${item.id || Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          keyword: item.title || '',
          hotness: item.hotness || 0,
          platform: item.siteName || item.source || 'TopHub',
          url: item.url,
          summary: item.summary,
          publishTime: item.publishTime,
          category: item.category,
          siteName: item.siteName,
          trend: item.trend,
          trendChange: item.trendChange,
          isBursting: item.isBursting,
          keywords: item.keywords
        }));

        console.log('生成的热点关键词:', keywords.map(k => ({ id: k.id, keyword: k.keyword, hotness: k.hotness })));

        // 先设置数据
        setAllKeywords(keywords);
        // 按热度排序
        const sortedKeywords = [...keywords].sort((a, b) => b.hotness - a.hotness);
        setHotKeywords(sortedKeywords);
        setLastUpdateTime(new Date().toISOString());

        Taro.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      } else {
        throw new Error('响应数据格式错误');
      }
    } catch (error: any) {
      console.error('刷新热力图数据失败:', error);
      // 更详细的错误提示
      let errorMsg = '刷新失败，请重试';
      if (error.errMsg?.includes('request:fail') || error.message?.includes('Network')) {
        errorMsg = '网络连接失败，请检查网络';
      } else if (error.statusCode === 404) {
        errorMsg = '服务接口不存在';
      } else if (error.statusCode === 500) {
        errorMsg = '服务器内部错误';
      }
      Taro.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 3000
      });
    } finally {
      setRefreshing(false);
    }
  };

  // 初始化时加载热力图数据
  useEffect(() => {
    loadHotKeywords();
  }, [locationMode, userCity, loadHotKeywords]);

  // 加载收藏列表
  const loadFavoriteIds = async () => {
    const token = Taro.getStorageSync('token');
    if (!token) return;

    try {
      const response = await Network.request({
        url: '/api/hot-topic-favorites/ids',
        method: 'GET'
      });

      if (response.statusCode === 200 && response.data && response.data.data) {
        setFavoriteIds(new Set(response.data.data as string[]));
      }
    } catch (error) {
      console.error('加载收藏列表失败:', error);
    }
  };

  // 切换收藏状态
  const toggleFavorite = async (item: HotKeyword) => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showModal({
        title: '请先登录',
        content: '收藏功能需要登录账号，是否立即登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }

    const isFav = favoriteIds.has(item.id);
    const newFavoriteIds = new Set(favoriteIds);

    try {
      if (isFav) {
        // 取消收藏
        await Network.request({
          url: '/api/hot-topic-favorites',
          method: 'DELETE',
          data: { topic_id: item.id }
        });
        newFavoriteIds.delete(item.id);
        Taro.showToast({ title: '已取消收藏', icon: 'success' });
      } else {
        // 添加收藏
        await Network.request({
          url: '/api/hot-topic-favorites',
          method: 'POST',
          data: {
            topic_id: item.id,
            title: item.keyword,
            url: item.url,
            platform: item.platform,
            hotness: item.hotness,
            category: item.category,
            site_name: item.siteName,
            publish_time: item.publishTime
          }
        });
        newFavoriteIds.add(item.id);
        Taro.showToast({ title: '收藏成功', icon: 'success' });
      }
      setFavoriteIds(newFavoriteIds);
    } catch (error) {
      console.error('收藏操作失败:', error);
      Taro.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  };

  // 切换平台筛选
  const togglePlatform = (platform: string) => {
    if (platform === 'all') {
      setSelectedPlatforms(['all']);
    } else {
      const newSelected = selectedPlatforms.includes(platform)
        ? selectedPlatforms.filter(p => p !== platform)
        : [...selectedPlatforms.filter(p => p !== 'all'), platform];

      if (newSelected.length === 0) {
        setSelectedPlatforms(['all']);
      } else {
        setSelectedPlatforms(newSelected);
      }
    }
  };

  // 切换只看收藏
  const toggleShowOnlyFavorites = () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showModal({
        title: '请先登录',
        content: '收藏功能需要登录账号，是否立即登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }
    setShowOnlyFavorites(!showOnlyFavorites);
    if (!showOnlyFavorites) {
      loadFavoriteIds();
    }
  };

  // 快捷操作：复制标题
  const handleCopyTitle = (item: HotKeyword, e: any) => {
    e.stopPropagation();
    Taro.setClipboardData({
      data: item.keyword,
      success: () => {
        Taro.showToast({
          title: '标题已复制',
          icon: 'success'
        });
      }
    });
  };

  // 快捷操作：分享热点
  const handleShareTopic = (item: HotKeyword, e: any) => {
    e.stopPropagation();
    const shareText = `${item.keyword}\n\n热度：${formatHotness(item.hotness)}\n平台：${item.platform}\n\n来源：星厨房内容创作助手`;
    Taro.setClipboardData({
      data: shareText,
      success: () => {
        Taro.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  };

  // 搜索和筛选逻辑
  useEffect(() => {
    // 如果在搜索模式，直接使用后端返回的搜索结果，不进行前端筛选
    if (searchMode) {
      return;
    }

    let filtered = [...allKeywords];

    // 只看收藏
    if (showOnlyFavorites) {
      filtered = filtered.filter(item => favoriteIds.has(item.id));
    }

    // 平台筛选
    if (!selectedPlatforms.includes('all') && selectedPlatforms.length > 0) {
      filtered = filtered.filter(item =>
        selectedPlatforms.includes(item.platform) ||
        selectedPlatforms.includes(item.siteName || '')
      );
    }

    // 分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item =>
        item.category === selectedCategory ||
        (item.siteName && item.siteName.includes(selectedCategory))
      );
    }

    // 时间范围筛选
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(item => {
        if (!item.publishTime) return false;

        const publishTime = new Date(item.publishTime);

        switch (selectedTimeRange) {
          case 'today':
            return publishTime >= todayStart;
          case 'week':
            return publishTime >= weekStart;
          case 'month':
            return publishTime >= monthStart;
          default:
            return true;
        }
      });
    }

    // 搜索过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.keyword.toLowerCase().includes(keyword) ||
        (item.category && item.category.toLowerCase().includes(keyword)) ||
        (item.summary && item.summary.toLowerCase().includes(keyword))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      if (sortBy === 'hotness') {
        return b.hotness - a.hotness; // 降序
      } else {
        // 时间排序（假设 publishTime 是可比较的字符串）
        const timeA = a.publishTime || '';
        const timeB = b.publishTime || '';
        return timeB.localeCompare(timeA);
      }
    });

    setHotKeywords(filtered);
  }, [searchKeyword, sortBy, allKeywords, selectedPlatforms, selectedCategory, selectedTimeRange, showOnlyFavorites, favoriteIds, searchMode]);

  // 获取用户地理位置
  const handleGetLocation = () => {
    Taro.getLocation({
      type: 'wgs84',
      success: (res) => {
        const { latitude, longitude } = res;
        console.log('获取到位置:', { latitude, longitude });

        // 使用腾讯地图逆地址解析（简化处理，实际应该调用地图API）
        // 这里临时使用一些常见城市作为示例
        // 实际应该调用腾讯地图或高德地图的逆地址解析API
        const cityMap: Record<number, string> = {
          29: '重庆',  // 重庆的纬度约29度
          30: '重庆',
          31: '重庆',
        };

        // 根据纬度大致判断城市（简化版）
        const lat = Math.floor(latitude);
        const detectedCity = cityMap[lat] || '重庆'; // 默认重庆

        setUserCity(detectedCity);
        Taro.showToast({ title: `已定位到${detectedCity}`, icon: 'success' });
      },
      fail: (err) => {
        console.error('定位失败:', err);
        Taro.showToast({ title: '定位失败，请检查权限', icon: 'none' });
        setLocationMode('national');
        setUserCity('');
      }
    });
  };

  // 切换位置模式
  const handleToggleLocationMode = (mode: 'national' | 'local') => {
    setLocationMode(mode);
    if (mode === 'local') {
      handleGetLocation();
    } else {
      setUserCity('');
    }
  };

  // 切换排序方式
  const handleSortBy = (value: SortType) => {
    setSortBy(value);
    setShowFilterPanel(false);
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchMode(false);
    // 清空搜索时恢复显示所有数据
    loadHotKeywords();
  };

  // 执行搜索
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      Taro.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    setSearching(true);
    setSearchMode(true); // 进入搜索模式
    try {
      const response = await Network.request({
        url: `/api/hot-topics/search`,
        method: 'POST',
        data: { keyword: searchKeyword.trim() }
      });

      console.log('=== 搜索响应 ===');
      console.log('关键词:', searchKeyword);
      console.log('响应数据:', response.data);

      if (response.statusCode === 200 && response.data && response.data.data && response.data.data.topics) {
        const results = Array.isArray(response.data.data.topics) ? response.data.data.topics : [];
        console.log('搜索结果数量:', results.length);

        const keywords: HotKeyword[] = results.map((item: any, index: number) => ({
          id: `${item.id || Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          keyword: item.title || '',
          hotness: item.hotness || 0,
          platform: item.siteName || item.source || '全网',
          url: item.url,
          summary: item.summary,
          publishTime: item.publishTime,
          category: item.category,
          siteName: item.siteName,
          trend: item.trend,
          trendChange: item.trendChange,
          isBursting: item.isBursting,
          keywords: item.keywords
        }));

        // 按热度排序
        keywords.sort((a, b) => b.hotness - a.hotness);

        setAllKeywords(keywords);
        setHotKeywords(keywords);
        setLastUpdateTime(new Date().toISOString());

        if (results.length === 0) {
          Taro.showToast({
            title: '未找到相关结果',
            icon: 'none'
          });
        } else {
          Taro.showToast({
            title: `找到 ${results.length} 条结果`,
            icon: 'success'
          });
        }
      }
    } catch (error) {
      console.error('搜索失败:', error);
      Taro.showToast({
        title: '搜索失败，请重试',
        icon: 'none'
      });
    } finally {
      setSearching(false);
    }
  };

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

      {/* 搜索和筛选区域 */}
      <View className="px-4 mt-4">
        <View className="space-y-3">
          {/* 搜索框 */}
          <View className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/80 p-3">
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <Search size={18} color="#94a3b8" strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Input
                  className="w-full text-sm text-white"
                  placeholder="搜索热点关键词、分类..."
                  value={searchKeyword}
                  onInput={(e) => setSearchKeyword(e.detail.value)}
                  onConfirm={handleSearch}
                  placeholderClass="text-slate-400"
                  confirmType="search"
                />
              </View>
              {searchKeyword && (
                <Button
                  size="mini"
                  className="bg-transparent text-slate-400 border-none px-2"
                  onClick={handleClearSearch}
                >
                  清空
                </Button>
              )}
              <Button
                size="mini"
                type="primary"
                className="bg-blue-500 text-white border-none"
                onClick={handleSearch}
                loading={searching}
              >
                {searching ? '搜索中' : '搜索'}
              </Button>
            </View>
          </View>

          {/* 筛选按钮 */}
          <View className="flex items-center justify-between">
            <Text className="block text-sm text-slate-400">
              找到 {hotKeywords.length} 个热点
            </Text>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              {/* 只看收藏快捷按钮 */}
              <Button
                size="mini"
                className={showOnlyFavorites
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/80'
                }
                onClick={() => {
                  if (!showOnlyFavorites) {
                    toggleShowOnlyFavorites();
                  } else {
                    setShowOnlyFavorites(false);
                  }
                }}
              >
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} color={showOnlyFavorites ? '#f87171' : '#94a3b8'} strokeWidth={2} />
                  <Text>收藏</Text>
                </View>
              </Button>

              {/* 筛选按钮 */}
              <Button
                size="mini"
                className={(selectedPlatforms.length > 1 || selectedCategory !== 'all' || selectedTimeRange !== 'all')
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/80'
                }
                onClick={() => setShowFilterPanel(!showFilterPanel)}
              >
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                  <SlidersHorizontal size={14} color={(selectedPlatforms.length > 1 || selectedCategory !== 'all' || selectedTimeRange !== 'all') ? '#60a5fa' : '#94a3b8'} strokeWidth={2} />
                  <Text className="block">筛选</Text>
                  {showFilterPanel ? (
                    <ChevronDown size={14} color="#94a3b8" strokeWidth={2} />
                  ) : null}
                </View>
              </Button>
            </View>
          </View>

          {/* 筛选面板 */}
          {showFilterPanel && (
            <View className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/80 p-4 space-y-4">
              {/* 平台筛选 */}
              <View>
                <Text className="block text-sm text-white mb-3 font-medium">平台筛选</Text>
                <View className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="mini"
                      className={
                        selectedPlatforms.includes(option.value)
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-transparent text-slate-400 border border-slate-700'
                      }
                      onClick={() => togglePlatform(option.value)}
                    >
                      <Text className="block">{option.label}</Text>
                    </Button>
                  ))}
                </View>
              </View>

              {/* 分类筛选 */}
              <View>
                <Text className="block text-sm text-white mb-3 font-medium">分类筛选</Text>
                <View className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="mini"
                      className={
                        selectedCategory === option.value
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-transparent text-slate-400 border border-slate-700'
                      }
                      onClick={() => setSelectedCategory(option.value)}
                    >
                      <Text className="block">{option.label}</Text>
                    </Button>
                  ))}
                </View>
              </View>

              {/* 时间范围筛选 */}
              <View>
                <Text className="block text-sm text-white mb-3 font-medium">时间范围</Text>
                <View className="flex flex-wrap gap-2">
                  {TIME_RANGE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="mini"
                      className={
                        selectedTimeRange === option.value
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          : 'bg-transparent text-slate-400 border border-slate-700'
                      }
                      onClick={() => setSelectedTimeRange(option.value)}
                    >
                      <Text className="block">{option.label}</Text>
                    </Button>
                  ))}
                </View>
              </View>

              {/* 只看收藏 */}
              <View className="flex items-center justify-between">
                <Text className="block text-sm text-white font-medium">只看收藏</Text>
                <Button
                  size="mini"
                  className={
                    showOnlyFavorites
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-transparent text-slate-400 border border-slate-700'
                  }
                  onClick={toggleShowOnlyFavorites}
                >
                  <Text className="block">{showOnlyFavorites ? '✓ 已开启' : '开启'}</Text>
                </Button>
              </View>

              {/* 排序方式 */}
              <View>
                <Text className="block text-sm text-white mb-3 font-medium">排序方式</Text>
                <View className="flex gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      size="mini"
                      className={
                        sortBy === option.value
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-transparent text-slate-400 border border-slate-700'
                      }
                      onClick={() => handleSortBy(option.value as SortType)}
                    >
                      <Text className="block">{option.label}</Text>
                    </Button>
                  ))}
                </View>
              </View>

              {/* 清空筛选 */}
              <View>
                <Button
                  size="mini"
                  className="w-full bg-slate-700 text-slate-300 border border-slate-600"
                  onClick={() => {
                    setSelectedPlatforms(['all']);
                    setSelectedCategory('all');
                    setSelectedTimeRange('all');
                    setShowOnlyFavorites(false);
                    setSearchKeyword('');
                  }}
                >
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                    <X size={14} color="#94a3b8" />
                    <Text className="block">清空筛选</Text>
                  </View>
                </Button>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 热力图区域 */}
      <View className="px-4 mt-4">
        <View className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/80 p-5 shadow-xl shadow-black/20">
          {/* 平台切换 */}
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

          {/* 全国/同城切换 */}
          <View className="flex items-center gap-2 mb-4">
            <Text className="block text-xs text-slate-400">范围:</Text>
            <View className="flex gap-2">
              <Button
                size="mini"
                className={locationMode === 'national' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-transparent text-slate-400 border border-slate-700'}
                onClick={() => handleToggleLocationMode('national')}
              >
                <Text className="block">全国</Text>
              </Button>
              <Button
                size="mini"
                className={locationMode === 'local' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-transparent text-slate-400 border border-slate-700'}
                onClick={() => handleToggleLocationMode('local')}
              >
                <Text className="block">{userCity || '同城'}</Text>
              </Button>
            </View>
          </View>

          {/* 加载中 */}
          {loadingHotTopics ? (
            <View className="flex items-center justify-center py-8">
              <Text className="block text-sm text-slate-400">加载热点数据中...</Text>
            </View>
          ) : (
            /* 热点关键词列表 */
            <View className="space-y-3">
              {hotKeywords.length === 0 ? (
                <View className="flex items-center justify-center py-8">
                  <Text className="block text-sm text-slate-400">
                    {searchKeyword ? '未找到相关热点' : '暂无热点数据'}
                  </Text>
                </View>
              ) : (
                hotKeywords.map((item, index) => (
                  <View
                    key={item.id}
                    className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/80 active:scale-[0.98] transition-transform"
                  >
                    <View className="flex items-start gap-3">
                      {/* 排名 */}
                      <View className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-orange-500' :
                        index === 2 ? 'bg-yellow-500' :
                        'bg-slate-600'
                      }`}
                      >
                        {index + 1}
                      </View>

                      {/* 内容区 */}
                      <View className="flex-1 min-w-0">
                        {/* 标题行 */}
                        <View className="flex items-start justify-between gap-2 mb-1">
                          <View className="flex-1 min-w-0" onClick={() => {
                            Taro.navigateTo({
                              url: `/pages/hotspot-detail/index?id=${item.id}&keyword=${encodeURIComponent(item.keyword)}&platform=${encodeURIComponent(item.platform)}&url=${encodeURIComponent(item.url || '')}&hotness=${item.hotness}&summary=${encodeURIComponent(item.summary || '')}&publishTime=${encodeURIComponent(item.publishTime || '')}&category=${encodeURIComponent(item.category || '')}&trendChange=${item.trendChange || 0}&isBursting=${item.isBursting || false}&keywords=${encodeURIComponent(JSON.stringify(item.keywords || []))}`
                            });
                          }}
                          >
                            {/* 爆款标签 */}
                            {item.isBursting && (
                              <View className="inline-flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded mb-1">
                                <FlameIcon size={10} color="#ef4444" strokeWidth={2} />
                                <Text className="text-xs text-red-400 font-medium">爆发中</Text>
                              </View>
                            )}

                            {/* 标题 */}
                            <Text className="block text-sm text-white font-medium leading-tight">{item.keyword}</Text>
                          </View>

                          {/* 热度 + 趋势 */}
                          <View className="flex-shrink-0 flex flex-col items-end gap-1">
                            <View className="flex items-center gap-1">
                              <Flame size={14} color="#fbbf24" strokeWidth={2} />
                              <Text className="text-xs text-amber-400 font-medium">
                                {formatHotness(item.hotness)}
                              </Text>
                            </View>

                            {/* 趋势图标 + 百分比 */}
                            {item.trend && (
                              <View className="flex items-center gap-1">
                                {item.trend === 'up' && (
                                  <TrendingUp size={12} color="#22c55e" strokeWidth={2} />
                                )}
                                {item.trend === 'down' && (
                                  <TrendingDown size={12} color="#ef4444" strokeWidth={2} />
                                )}
                                {item.trend === 'stable' && (
                                  <Minus size={12} color="#94a3b8" strokeWidth={2} />
                                )}
                                <Text className={`text-xs font-medium ${
                                  item.trend === 'up' ? 'text-green-400' :
                                  item.trend === 'down' ? 'text-red-400' :
                                  'text-slate-400'
                                  }
                                  `}
                                >
                                  {item.trend === 'up' ? '+' : ''}{item.trendChange || 0}%
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* 平台、分类、时间 */}
                        <View className="flex items-center gap-2 flex-wrap mb-2">
                          <Text className="text-xs text-slate-400">{item.platform}</Text>
                          {item.category && (
                            <Text className="text-xs text-blue-300">{item.category}</Text>
                          )}
                        </View>

                        {/* 摘要预览 */}
                        {item.summary && (
                          <View className="bg-slate-700/30 rounded-lg px-2 py-1.5 mb-2">
                            <Text className="text-xs text-slate-400 line-clamp-2">{item.summary}</Text>
                          </View>
                        )}

                        {/* 关键词标签 */}
                        {item.keywords && item.keywords.length > 0 && (
                          <View className="flex items-center gap-1.5 flex-wrap mb-2">
                            {item.keywords.slice(0, 3).map((keyword, kIndex) => (
                              <View
                                key={kIndex}
                                className="bg-blue-500/10 px-2 py-0.5 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchKeyword(keyword);
                                }}
                              >
                                <Text className="text-xs text-blue-300">#{keyword}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* 快捷操作栏 */}
                        <View className="flex items-center gap-2">
                          <Button
                            size="mini"
                            className="bg-slate-700/50 text-slate-300 border border-slate-600 px-2"
                            onClick={(e) => handleCopyTitle(item, e)}
                          >
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                              <Copy size={12} color="#94a3b8" strokeWidth={2} />
                              <Text className="block">复制</Text>
                            </View>
                          </Button>

                          <Button
                            size="mini"
                            className="bg-slate-700/50 text-slate-300 border border-slate-600 px-2"
                            onClick={(e) => handleShareTopic(item, e)}
                          >
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                              <Share2 size={12} color="#94a3b8" strokeWidth={2} />
                              <Text>分享</Text>
                            </View>
                          </Button>

                          <View
                            className="active:scale-90 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item);
                            }}
                          >
                            {favoriteIds.has(item.id) ? (
                              <Heart size={16} color="#ef4444" strokeWidth={2} />
                            ) : (
                              <Heart size={16} color="#94a3b8" strokeWidth={2} />
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default HotspotPage;
