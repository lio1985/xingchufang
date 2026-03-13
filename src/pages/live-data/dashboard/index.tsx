import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateTo } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { Calendar, TrendingUp, Eye, Users, Heart, TrendingDown, Plus, List, Star, Zap } from 'lucide-react-taro';
import './index.less';

type TimeRange = 'day' | 'week' | 'month' | 'year';

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'day', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'year', label: '本年' },
  ];

  const fetchStats = async () => {
    if (loading) return;
    setLoading(true);
    showLoading({ title: '加载中...' });

    try {
      const response = await Network.request({
        url: '/api/live-data/dashboard',
        method: 'GET',
        data: { range: timeRange },
      });

      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      showToast({ title: '加载失败', icon: 'none' });
      // 设置默认空数据，避免页面一直显示加载中
      setStats({
        totalViews: 0,
        peakOnline: 0,
        avgOnline: 0,
        newFollowers: 0,
        totalComments: 0,
        totalLikes: 0,
        ordersCount: 0,
        gmv: 0,
        avgWatchDuration: 0,
        conversionRate: 0,
        interactionRate: 0,
        followerConversionRate: 0,
        streamCount: 0,
        prevPeriod: { gmv: 0, ordersCount: 0, totalViews: 0, newFollowers: 0 },
      });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const calculateChange = (current: number, prev: number) => {
    if (!prev) return 0;
    return ((current - prev) / prev) * 100;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
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
                onClick={() => setTimeRange(option.value)}
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
              onClick={() => setTimeRange(option.value)}
            >
              <Text>{option.label}</Text>
            </View>
          ))}
        </View>
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
              <Text className="value">¥{stats.gmv.toFixed(2)}</Text>
              <View className={`change ${gmvChange >= 0 ? 'up' : 'down'}`}>
                {gmvChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <Text>{formatChange(gmvChange)}</Text>
              </View>
            </View>

            <View className="metric-card">
              <Text className="label">订单数</Text>
              <Text className="value">{stats.ordersCount.toLocaleString()}</Text>
              <View className={`change ${ordersChange >= 0 ? 'up' : 'down'}`}>
                <Text>{formatChange(ordersChange)}</Text>
              </View>
            </View>

            <View className="metric-card">
              <Text className="label">观看人数</Text>
              <Text className="value">{stats.totalViews.toLocaleString()}</Text>
              <View className={`change ${viewsChange >= 0 ? 'up' : 'down'}`}>
                <Text>{formatChange(viewsChange)}</Text>
              </View>
            </View>

            <View className="metric-card">
              <Text className="label">新增粉丝</Text>
              <Text className="value">{stats.newFollowers.toLocaleString()}</Text>
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
              <Text className="count">{stats.streamCount}</Text>
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
                <Text className="value">{stats.totalViews.toLocaleString()}</Text>
                <Text className="label">观看人数</Text>
              </View>
            </View>
            <View className="data-item">
              <Users size={18} />
              <View>
                <Text className="value">{stats.peakOnline.toLocaleString()}</Text>
                <Text className="label">最高在线</Text>
              </View>
            </View>
            <View className="data-item">
              <Users size={18} />
              <View>
                <Text className="value">{stats.avgOnline.toLocaleString()}</Text>
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
                <Text className="value">{stats.totalLikes.toLocaleString()}</Text>
                <Text className="label">点赞数</Text>
              </View>
            </View>
            <View className="data-item">
              <TrendingUp size={18} />
              <View>
                <Text className="value">{stats.totalComments.toLocaleString()}</Text>
                <Text className="label">评论数</Text>
              </View>
            </View>
            <View className="data-item">
              <Users size={18} />
              <View>
                <Text className="value">{stats.newFollowers.toLocaleString()}</Text>
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
                <View className="progress" style={{ width: `${Math.min(stats.conversionRate * 10, 100)}%` }} />
              </View>
              <Text className="value">{stats.conversionRate.toFixed(2)}%</Text>
            </View>
            <View className="conversion-item">
              <Text className="label">互动率</Text>
              <View className="progress-bar">
                <View className="progress" style={{ width: `${Math.min(stats.interactionRate * 10, 100)}%` }} />
              </View>
              <Text className="value">{stats.interactionRate.toFixed(2)}%</Text>
            </View>
            <View className="conversion-item">
              <Text className="label">粉丝转化率</Text>
              <View className="progress-bar">
                <View className="progress" style={{ width: `${Math.min(stats.followerConversionRate * 100, 100)}%` }} />
              </View>
              <Text className="value">{stats.followerConversionRate.toFixed(2)}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LiveDashboardPage;
