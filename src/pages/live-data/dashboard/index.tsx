import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateTo } from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import { Calendar, TrendingUp, Eye, TrendingDown, Plus, List, Star, ArrowRight, MousePointer, MessageCircle, Activity } from 'lucide-react-taro';
import './index.less';

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'custom';

interface DashboardStats {
  totalViews: number;
  peakOnline: number;
  avgOnline: number;
  newFollowers: number;
  totalComments: number;
  totalLikes: number;
  ordersCount: number;
  gmv: number;
  avgWatchDuration: number;
  conversionRate: number;
  interactionRate: number;
  followerConversionRate: number;
  streamCount: number;
  exposureCount: number;
  enterRoomCount: number;
  onlinePeak: number;
  interactionCount: number;
  privateMessageCount: number;
  enterRoomRate: number;
  prevPeriod: {
    gmv: number;
    ordersCount: number;
    totalViews: number;
    newFollowers: number;
    exposureCount: number;
  };
}

const LiveDashboardPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'day', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'year', label: '本年' },
    { value: 'custom', label: '自定义' },
  ];

  const getDefaultDateRange = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  };

  const fetchStats = async () => {
    if (loading) return;
    setLoading(true);
    showLoading({ title: '加载中...' });

    try {
      console.log('Fetching dashboard data, range:', timeRange);
      
      const params: any = { range: timeRange };
      if (timeRange === 'custom') {
        params.startDate = customDateRange.startDate;
        params.endDate = customDateRange.endDate;
      }
      
      const response = await Network.request({
        url: '/api/live-data/dashboard',
        method: 'GET',
        data: params,
      });

      console.log('Dashboard response:', response);

      if (response.data?.success) {
        setStats(response.data.data);
      } else {
        setStats({
          totalViews: 0, peakOnline: 0, avgOnline: 0, newFollowers: 0,
          totalComments: 0, totalLikes: 0, ordersCount: 0, gmv: 0,
          avgWatchDuration: 0, conversionRate: 0, interactionRate: 0,
          followerConversionRate: 0, streamCount: 0,
          exposureCount: 0, enterRoomCount: 0, onlinePeak: 0,
          interactionCount: 0, privateMessageCount: 0, enterRoomRate: 0,
          prevPeriod: { gmv: 0, ordersCount: 0, totalViews: 0, newFollowers: 0, exposureCount: 0 },
        });
      }
    } catch (error: any) {
      console.error('Fetch stats error:', error);
      showToast({ title: '数据加载失败', icon: 'none' });
      setStats({
        totalViews: 0, peakOnline: 0, avgOnline: 0, newFollowers: 0,
        totalComments: 0, totalLikes: 0, ordersCount: 0, gmv: 0,
        avgWatchDuration: 0, conversionRate: 0, interactionRate: 0,
        followerConversionRate: 0, streamCount: 0,
        exposureCount: 0, enterRoomCount: 0, onlinePeak: 0,
        interactionCount: 0, privateMessageCount: 0, enterRoomRate: 0,
        prevPeriod: { gmv: 0, ordersCount: 0, totalViews: 0, newFollowers: 0, exposureCount: 0 },
      });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    setCustomDateRange(getDefaultDateRange());
  }, []);

  useEffect(() => {
    if (timeRange !== 'custom') {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  useEffect(() => {
    if (timeRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange.startDate, customDateRange.endDate]);

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
    if (value === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const calculateChange = (current: number, prev: number) => {
    if (!prev) return 0;
    return ((current - prev) / prev) * 100;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const formatDateRange = () => {
    if (timeRange !== 'custom') return timeRangeOptions.find(o => o.value === timeRange)?.label;
    return `${customDateRange.startDate} 至 ${customDateRange.endDate}`;
  };

  const navigateToDetail = (type: 'traffic' | 'interaction' | 'conversion') => {
    const urls = {
      traffic: '/pages/live-data/traffic/index',
      interaction: '/pages/live-data/interaction/index',
      conversion: '/pages/live-data/conversion/index',
    };
    navigateTo({ 
      url: `${urls[type]}?range=${timeRange}&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}` 
    });
  };

  if (!stats) {
    return (
      <View className="live-dashboard-page">
        <View className="header">
          <Text className="title">数据看板</Text>
          <View className="time-tabs">
            {timeRangeOptions.map((option) => (
              <View
                key={option.value}
                className={`tab ${timeRange === option.value ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange(option.value)}
              >
                <Text>{option.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  const gmvChange = calculateChange(stats.gmv, stats.prevPeriod?.gmv || 0);
  const ordersChange = calculateChange(stats.ordersCount, stats.prevPeriod?.ordersCount || 0);
  const viewsChange = calculateChange(stats.totalViews, stats.prevPeriod?.totalViews || 0);
  const followersChange = calculateChange(stats.newFollowers, stats.prevPeriod?.newFollowers || 0);

  return (
    <View className="live-dashboard-page">
      <View className="header">
        <Text className="title">数据看板</Text>
        <View className="time-tabs">
          {timeRangeOptions.map((option) => (
            <View
              key={option.value}
              className={`tab ${timeRange === option.value ? 'active' : ''}`}
              onClick={() => handleTimeRangeChange(option.value)}
            >
              <Text>{option.label}</Text>
            </View>
          ))}
        </View>

        {showDatePicker && (
          <View className="date-picker-container">
            <View className="date-picker-row">
              <View className="date-input-wrapper">
                <Text className="date-label">开始日期</Text>
                <Input
                  className="date-input"
                  type={'date' as any}
                  value={customDateRange.startDate}
                  onInput={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.detail.value }))}
                />
              </View>
              <Text className="date-separator">至</Text>
              <View className="date-input-wrapper">
                <Text className="date-label">结束日期</Text>
                <Input
                  className="date-input"
                  type={'date' as any}
                  value={customDateRange.endDate}
                  onInput={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.detail.value }))}
                />
              </View>
            </View>
            <View className="selected-range">
              <Calendar size={14} color="#fff" />
              <Text className="range-text">{formatDateRange()}</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView className="dashboard-container" scrollY>
        {/* 快捷入口 */}
        <View className="quick-actions">
          <View className="actions-row">
            <View className="action-item" onClick={() => navigateTo({ url: '/pages/live-data/import/index' })}>
              <View className="action-icon primary">
                <Plus size={20} color="#fff" />
              </View>
              <Text className="action-label">导入数据</Text>
            </View>
            <View className="action-item" onClick={() => navigateTo({ url: '/pages/live-data/list/index' })}>
              <View className="action-icon secondary">
                <List size={20} color="#667eea" />
              </View>
              <Text className="action-label">直播记录</Text>
            </View>
            <View className="action-item" onClick={() => navigateTo({ url: '/pages/live-data/analysis/index' })}>
              <View className="action-icon secondary">
                <Star size={20} color="#667eea" />
              </View>
              <Text className="action-label">复盘分析</Text>
            </View>
          </View>
        </View>

        {/* 空数据提示 */}
        {stats.streamCount === 0 && (
          <View className="empty-state">
            <Calendar size={48} color="#ccc" />
            <Text className="empty-title">暂无直播数据</Text>
            <Text className="empty-desc">点击上方「导入数据」按钮添加您的第一场直播</Text>
          </View>
        )}

        {/* 核心指标 - 简洁展示 */}
        <View className="section-card core-metrics">
          <Text className="section-title">核心指标</Text>
          <View className="metrics-grid simple">
            <View className="metric-card highlight">
              <Text className="label">成交金额</Text>
              <Text className="value">¥{(stats.gmv || 0).toFixed(0)}</Text>
              <View className={`change ${gmvChange >= 0 ? 'up' : 'down'}`}>
                {gmvChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <Text>{formatChange(gmvChange)}</Text>
              </View>
            </View>

            <View className="metric-card">
              <Text className="label">订单数</Text>
              <Text className="value">{(stats.ordersCount || 0).toLocaleString()}</Text>
              <View className={`change ${ordersChange >= 0 ? 'up' : 'down'}`}>
                <Text>{formatChange(ordersChange)}</Text>
              </View>
            </View>

            <View className="metric-card">
              <Text className="label">观看人数</Text>
              <Text className="value">{(stats.totalViews || 0).toLocaleString()}</Text>
              <View className={`change ${viewsChange >= 0 ? 'up' : 'down'}`}>
                <Text>{formatChange(viewsChange)}</Text>
              </View>
            </View>

            <View className="metric-card">
              <Text className="label">新增粉丝</Text>
              <Text className="value">{(stats.newFollowers || 0).toLocaleString()}</Text>
              <View className={`change ${followersChange >= 0 ? 'up' : 'down'}`}>
                <Text>{formatChange(followersChange)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 直播场次概览 */}
        <View className="section-card stream-overview">
          <View className="overview-content">
            <View className="overview-item">
              <Calendar size={20} color="#667eea" />
              <View className="overview-info">
                <Text className="overview-value">{stats.streamCount || 0}</Text>
                <Text className="overview-label">直播场次</Text>
              </View>
            </View>
            <View className="divider" />
            <View className="overview-item">
              <Eye size={20} color="#10b981" />
              <View className="overview-info">
                <Text className="overview-value">{(stats.avgWatchDuration || 0).toFixed(0)}秒</Text>
                <Text className="overview-label">平均观看时长</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 详细数据入口 */}
        <View className="section-card detail-entries">
          <Text className="section-title">详细数据</Text>
          <View className="entries-list">
            {/* 流量数据入口 */}
            <View className="entry-item" onClick={() => navigateToDetail('traffic')}>
              <View className="entry-left">
                <View className="entry-icon traffic">
                  <MousePointer size={20} color="#fff" />
                </View>
                <View className="entry-info">
                  <Text className="entry-title">流量数据</Text>
                  <Text className="entry-desc">曝光 {stats.exposureCount?.toLocaleString() || 0} · 进房 {(stats.enterRoomRate || 0).toFixed(1)}%</Text>
                </View>
              </View>
              <ArrowRight size={18} color="#999" />
            </View>

            {/* 互动数据入口 */}
            <View className="entry-item" onClick={() => navigateToDetail('interaction')}>
              <View className="entry-left">
                <View className="entry-icon interaction">
                  <MessageCircle size={20} color="#fff" />
                </View>
                <View className="entry-info">
                  <Text className="entry-title">互动数据</Text>
                  <Text className="entry-desc">互动 {stats.interactionCount?.toLocaleString() || 0} · 点赞 {(stats.totalLikes || 0).toLocaleString()}</Text>
                </View>
              </View>
              <ArrowRight size={18} color="#999" />
            </View>

            {/* 转化数据入口 */}
            <View className="entry-item" onClick={() => navigateToDetail('conversion')}>
              <View className="entry-left">
                <View className="entry-icon conversion">
                  <Activity size={20} color="#fff" />
                </View>
                <View className="entry-info">
                  <Text className="entry-title">转化数据</Text>
                  <Text className="entry-desc">观看转化 {(stats.conversionRate || 0).toFixed(2)}% · 互动 {(stats.interactionRate || 0).toFixed(2)}%</Text>
                </View>
              </View>
              <ArrowRight size={18} color="#999" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveDashboardPage;
