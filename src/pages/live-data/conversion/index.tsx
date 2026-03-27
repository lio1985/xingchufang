import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateBack, getCurrentInstance } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import './index.less';

interface ConversionStats {
  enterRoomRate: number;
  conversionRate: number;
  interactionRate: number;
  followerConversionRate: number;
  totalViews: number;
  ordersCount: number;
  newFollowers: number;
  interactionCount: number;
  prevPeriod: {
    conversionRate: number;
    interactionRate: number;
    followerConversionRate: number;
  };
}

const ConversionPage = () => {
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const instance = getCurrentInstance();
    const params = instance.router?.params || {};
    setTimeRange(params.range || 'week');
    fetchStats(params.range || 'week', params.startDate, params.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async (range: string, startDate?: string, endDate?: string) => {
    if (loading) return;
    setLoading(true);
    showLoading({ title: '加载中...' });

    try {
      const params: any = { range };
      if (range === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await Network.request({
        url: '/api/live-data/dashboard',
        method: 'GET',
        data: params,
      });

      if (response.data?.success) {
        const data = response.data.data;
        setStats({
          enterRoomRate: data.enterRoomRate || 0,
          conversionRate: data.conversionRate || 0,
          interactionRate: data.interactionRate || 0,
          followerConversionRate: data.followerConversionRate || 0,
          totalViews: data.totalViews || 0,
          ordersCount: data.ordersCount || 0,
          newFollowers: data.newFollowers || 0,
          interactionCount: data.interactionCount || 0,
          prevPeriod: data.prevPeriod || {},
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      showToast({ title: '数据加载失败', icon: 'none' });
    } finally {
      setLoading(false);
      hideLoading();
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

  const getRangeLabel = () => {
    const labels: Record<string, string> = {
      day: '今日',
      week: '本周',
      month: '本月',
      year: '本年',
      custom: '自定义',
    };
    return labels[timeRange] || '本周';
  };

  const getConversionLevel = (rate: number) => {
    if (rate >= 5) return { label: '优秀', color: '#10b981' };
    if (rate >= 3) return { label: '良好', color: '#60a5fa' };
    if (rate >= 1) return { label: '一般', color: '#38bdf8' };
    return { label: '待提升', color: '#f87171' };
  };

  if (!stats) {
    return (
      <View className="conversion-page">
        <View className="header">
          <View className="back-btn" onClick={() => navigateBack()}>
            <Text>←</Text>
          </View>
          <Text className="title">转化数据</Text>
          <View className="placeholder" />
        </View>
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  const conversionChange = calculateChange(stats.conversionRate, stats.prevPeriod?.conversionRate || 0);
  const followerChange = calculateChange(stats.followerConversionRate, stats.prevPeriod?.followerConversionRate || 0);

  return (
    <View className="conversion-page">
      <View className="header">
        <View className="back-btn" onClick={() => navigateBack()}>
          <Text>←</Text>
        </View>
        <View className="header-center">
          <Text className="title">转化数据</Text>
          <Text className="subtitle">{getRangeLabel()}</Text>
        </View>
        <View className="placeholder" />
      </View>

      <ScrollView className="content" scrollY>
        {/* 转化率漏斗 */}
        <View className="section-card funnel-card">
          <Text className="section-title">转化漏斗</Text>
          <View className="funnel-visual">
            {/* 观看层 */}
            <View className="funnel-level">
              <View className="funnel-bar view">
                <View className="funnel-content">
                  <Text>👤</Text>
                  <Text className="funnel-label">观看人数</Text>
                  <Text className="funnel-value">{stats.totalViews.toLocaleString()}</Text>
                </View>
              </View>
              <View className="funnel-arrow">
                <Text>⬆</Text>
                <Text className="funnel-rate">{stats.conversionRate.toFixed(2)}% 转化</Text>
              </View>
            </View>

            {/* 订单层 */}
            <View className="funnel-level">
              <View className="funnel-bar order">
                <View className="funnel-content">
                  <Text>🛒</Text>
                  <Text className="funnel-label">成交订单</Text>
                  <Text className="funnel-value">{stats.ordersCount.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 核心转化率 */}
        <View className="section-card main-conversion">
          <View className="conversion-header">
            <View className="conversion-icon">
              <Text>🎯</Text>
            </View>
            <View className="conversion-info">
              <Text className="conversion-label">观看转化率</Text>
              <View className="conversion-row">
                <Text className="conversion-value">{stats.conversionRate.toFixed(2)}%</Text>
                <View className={`conversion-change ${conversionChange >= 0 ? 'up' : 'down'}`}>
                  {conversionChange >= 0 ? <Text>📈</Text> : <Text>📉</Text>}
                  <Text>{formatChange(conversionChange)}</Text>
                </View>
              </View>
            </View>
          </View>
          <View className="conversion-level" style={{ backgroundColor: getConversionLevel(stats.conversionRate).color + '20' }}>
            <Text className="level-text" style={{ color: getConversionLevel(stats.conversionRate).color }}>
              {getConversionLevel(stats.conversionRate).label}
            </Text>
          </View>
        </View>

        {/* 其他转化指标 */}
        <View className="section-card">
          <Text className="section-title">其他转化指标</Text>
          <View className="conversion-grid">
            <View className="conversion-item">
              <View className="item-icon blue">
                <Text>❤️</Text>
              </View>
              <View className="item-info">
                <Text className="item-value">{stats.interactionRate.toFixed(2)}%</Text>
                <Text className="item-label">互动率</Text>
              </View>
            </View>

            <View className="conversion-item">
              <View className="item-icon purple">
                <Text>👤</Text>
              </View>
              <View className="item-info">
                <Text className="item-value">{stats.followerConversionRate.toFixed(2)}%</Text>
                <View className="item-change-row">
                  <Text className="item-label">粉丝转化率</Text>
                  <View className={`item-change ${followerChange >= 0 ? 'up' : 'down'}`}>
                    <Text>{formatChange(followerChange)}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="conversion-item">
              <View className="item-icon cyan">
                <Text>📈</Text>
              </View>
              <View className="item-info">
                <Text className="item-value">{stats.enterRoomRate.toFixed(1)}%</Text>
                <Text className="item-label">进房率</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 转化公式 */}
        <View className="section-card formula-card">
          <Text className="section-title">转化公式</Text>
          <View className="formula-list">
            <View className="formula-item">
              <Text className="formula-name">观看转化率</Text>
              <Text className="formula-desc">成交订单数 ÷ 观看人数 × 100%</Text>
            </View>
            <View className="formula-item">
              <Text className="formula-name">粉丝转化率</Text>
              <Text className="formula-desc">新增粉丝数 ÷ 观看人数 × 100%</Text>
            </View>
            <View className="formula-item">
              <Text className="formula-name">互动率</Text>
              <Text className="formula-desc">互动人数 ÷ 观看人数 × 100%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ConversionPage;
