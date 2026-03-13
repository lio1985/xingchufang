import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateTo } from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import { Calendar, TrendingUp, Eye, Users, Heart, TrendingDown, Plus, List, Star, Zap } from 'lucide-react-taro';
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
  prevPeriod: {
    gmv: number;
    ordersCount: number;
    totalViews: number;
    newFollowers: number;
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

  // 获取默认日期范围
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
        console.warn('API returned no success:', response.data);
        setStats({
          totalViews: 0, peakOnline: 0, avgOnline: 0, newFollowers: 0,
          totalComments: 0, totalLikes: 0, ordersCount: 0, gmv: 0,
          avgWatchDuration: 0, conversionRate: 0, interactionRate: 0,
          followerConversionRate: 0, streamCount: 0,
          prevPeriod: { gmv: 0, ordersCount: 0, totalViews: 0, newFollowers: 0 },
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
        prevPeriod: { gmv: 0, ordersCount: 0, totalViews: 0, newFollowers: 0 },
      });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    // 初始化默认日期范围
    setCustomDateRange(getDefaultDateRange());
  }, []);

  useEffect(() => {
    // 非自定义模式下直接获取数据
    if (timeRange !== 'custom') {
      fetchStats();
    }
    // 自定义模式下需要手动确认日期后才获取数据
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // 自定义日期变化时单独处理
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

        {/* 自定义日期选择器 */}
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
          <View className="section-header">
            <View className="icon-wrapper">
              <Zap size={18} color="#fff" />
            </View>
            <Text className="header-title">快捷功能</Text>
          </View>
          <View className="actions-grid">
            <View className="action-item" onClick={() => navigateTo({ url: '/pages/live-data/import/index' })}>
              <View className="action-icon">
                <Plus size={24} color="#fff" />
              </View>
              <Text className="action-label">导入数据</Text>
              <Text className="action-desc">添加直播</Text>
            </View>
            <View className="action-item secondary" onClick={() => navigateTo({ url: '/pages/live-data/list/index' })}>
              <View className="action-icon secondary">
                <List size={24} color="#667eea" />
              </View>
              <Text className="action-label secondary">直播记录</Text>
              <Text className="action-desc secondary">查看历史</Text>
            </View>
            <View className="action-item secondary" onClick={() => navigateTo({ url: '/pages/live-data/analysis/index' })}>
              <View className="action-icon secondary">
                <Star size={24} color="#667eea" />
              </View>
              <Text className="action-label secondary">复盘</Text>
              <Text className="action-desc secondary">智能分析</Text>
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

        {/* 核心指标 */}
        <View className="section-card">
          <Text className="section-title">核心指标</Text>
          <View className="metrics-grid">
            <View className="metric-card highlight">
              <Text className="label">成交金额</Text>
              <Text className="value">¥{(stats.gmv || 0).toFixed(2)}</Text>
              <View className={`change ${gmvChange >= 0 ? 'up' : 'down'}`}>
                {gmvChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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

        {/* 直播场次 */}
        <View className="section-card">
          <View className="stream-count">
            <Calendar size={24} />
            <View>
              <Text className="count">{stats.streamCount || 0}</Text>
              <Text className="label">直播场次</Text>
            </View>
          </View>
        </View>

        {/* 流量数据 */}
        <View className="section-card">
          <Text className="section-title">流量数据</Text>
          <View className="data-grid">
            <View className="data-item">
              <Eye size={18} />
              <View>
                <Text className="value">{(stats.totalViews || 0).toLocaleString()}</Text>
                <Text className="label">观看人数</Text>
              </View>
            </View>
            <View className="data-item">
              <Users size={18} />
              <View>
                <Text className="value">{(stats.peakOnline || 0).toLocaleString()}</Text>
                <Text className="label">最高在线</Text>
              </View>
            </View>
            <View className="data-item">
              <Users size={18} />
              <View>
                <Text className="value">{(stats.avgOnline || 0).toLocaleString()}</Text>
                <Text className="label">平均在线</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 互动数据 */}
        <View className="section-card">
          <Text className="section-title">互动数据</Text>
          <View className="data-grid">
            <View className="data-item">
              <Heart size={18} />
              <View>
                <Text className="value">{(stats.totalLikes || 0).toLocaleString()}</Text>
                <Text className="label">点赞数</Text>
              </View>
            </View>
            <View className="data-item">
              <TrendingUp size={18} />
              <View>
                <Text className="value">{(stats.totalComments || 0).toLocaleString()}</Text>
                <Text className="label">评论数</Text>
              </View>
            </View>
            <View className="data-item">
              <Users size={18} />
              <View>
                <Text className="value">{(stats.newFollowers || 0).toLocaleString()}</Text>
                <Text className="label">新增粉丝</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 转化数据 */}
        <View className="section-card">
          <Text className="section-title">转化数据</Text>
          <View className="conversion-list">
            <View className="conversion-item">
              <Text className="label">观看转化率</Text>
              <View className="progress-bar">
                <View className="progress" style={{ width: `${Math.min((stats.conversionRate || 0) * 10, 100)}%` }} />
              </View>
              <Text className="value">{(stats.conversionRate || 0).toFixed(2)}%</Text>
            </View>
            <View className="conversion-item">
              <Text className="label">互动率</Text>
              <View className="progress-bar">
                <View className="progress" style={{ width: `${Math.min((stats.interactionRate || 0) * 10, 100)}%` }} />
              </View>
              <Text className="value">{(stats.interactionRate || 0).toFixed(2)}%</Text>
            </View>
            <View className="conversion-item">
              <Text className="label">粉丝转化率</Text>
              <View className="progress-bar">
                <View className="progress" style={{ width: `${Math.min((stats.followerConversionRate || 0) * 100, 100)}%` }} />
              </View>
              <Text className="value">{(stats.followerConversionRate || 0).toFixed(2)}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveDashboardPage;
