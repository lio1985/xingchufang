import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateBack, getCurrentInstance } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { ArrowLeft, Eye, Users, TrendingUp, MousePointer, Activity } from 'lucide-react-taro';
import './index.less';

interface TrafficStats {
  exposureCount: number;
  enterRoomCount: number;
  totalViews: number;
  onlinePeak: number;
  avgOnline: number;
  enterRoomRate: number;
  prevPeriod: {
    exposureCount: number;
    enterRoomCount: number;
    totalViews: number;
  };
}

const TrafficPage = () => {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    // 获取页面参数
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
          exposureCount: data.exposureCount || 0,
          enterRoomCount: data.enterRoomCount || 0,
          totalViews: data.totalViews || 0,
          onlinePeak: data.onlinePeak || 0,
          avgOnline: data.avgOnline || 0,
          enterRoomRate: data.enterRoomRate || 0,
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

  if (!stats) {
    return (
      <View className="traffic-page">
        <View className="header">
          <View className="back-btn" onClick={() => navigateBack()}>
            <ArrowLeft size={20} color="#333" />
          </View>
          <Text className="title">流量数据</Text>
          <View className="placeholder" />
        </View>
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  const exposureChange = calculateChange(stats.exposureCount, stats.prevPeriod?.exposureCount || 0);
  const enterRoomChange = calculateChange(stats.enterRoomCount, stats.prevPeriod?.enterRoomCount || 0);
  const viewsChange = calculateChange(stats.totalViews, stats.prevPeriod?.totalViews || 0);

  return (
    <View className="traffic-page">
      <View className="header">
        <View className="back-btn" onClick={() => navigateBack()}>
          <ArrowLeft size={20} color="#333" />
        </View>
        <View className="header-center">
          <Text className="title">流量数据</Text>
          <Text className="subtitle">{getRangeLabel()}</Text>
        </View>
        <View className="placeholder" />
      </View>

      <ScrollView className="content" scrollY>
        {/* 核心流量指标 */}
        <View className="section-card main-metrics">
          <Text className="section-title">流量概览</Text>
          <View className="metric-cards">
            <View className="metric-card large">
              <View className="metric-icon blue">
                <Eye size={24} color="#fff" />
              </View>
              <View className="metric-info">
                <Text className="metric-value">{stats.exposureCount.toLocaleString()}</Text>
                <Text className="metric-label">曝光人数</Text>
                <View className={`metric-change ${exposureChange >= 0 ? 'up' : 'down'}`}>
                  <Text>{formatChange(exposureChange)}</Text>
                </View>
              </View>
            </View>

            <View className="metric-card large">
              <View className="metric-icon cyan">
                <MousePointer size={24} color="#fff" />
              </View>
              <View className="metric-info">
                <Text className="metric-value">{stats.enterRoomCount.toLocaleString()}</Text>
                <Text className="metric-label">进入直播间</Text>
                <View className={`metric-change ${enterRoomChange >= 0 ? 'up' : 'down'}`}>
                  <Text>{formatChange(enterRoomChange)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 进房率 */}
        <View className="section-card conversion-card">
          <View className="conversion-header">
            <View className="conversion-icon">
              <TrendingUp size={20} color="#fff" />
            </View>
            <View className="conversion-info">
              <Text className="conversion-label">进房率</Text>
              <Text className="conversion-value">{stats.enterRoomRate.toFixed(1)}%</Text>
            </View>
          </View>
          <View className="progress-container">
            <View className="progress-bar">
              <View 
                className="progress-fill" 
                style={{ width: `${Math.min(stats.enterRoomRate, 100)}%` }}
              />
            </View>
            <Text className="progress-hint">
              {stats.enterRoomRate > 10 ? '进房率表现良好' : '进房率有提升空间'}
            </Text>
          </View>
        </View>

        {/* 在线数据 */}
        <View className="section-card">
          <Text className="section-title">在线数据</Text>
          <View className="online-grid">
            <View className="online-item">
              <View className="online-icon purple">
                <Activity size={18} color="#fff" />
              </View>
              <View className="online-info">
                <Text className="online-value">{stats.onlinePeak.toLocaleString()}</Text>
                <Text className="online-label">在线峰值</Text>
              </View>
            </View>

            <View className="online-item">
              <View className="online-icon indigo">
                <Users size={18} color="#fff" />
              </View>
              <View className="online-info">
                <Text className="online-value">{stats.avgOnline.toLocaleString()}</Text>
                <Text className="online-label">平均在线</Text>
              </View>
            </View>

            <View className="online-item">
              <View className="online-icon pink">
                <Activity size={18} color="#fff" />
              </View>
              <View className="online-info">
                <Text className="online-value">{stats.totalViews.toLocaleString()}</Text>
                <Text className="online-label">观看人数</Text>
                <View className={`online-change ${viewsChange >= 0 ? 'up' : 'down'}`}>
                  <Text>{formatChange(viewsChange)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 数据说明 */}
        <View className="section-card tips-card">
          <Text className="tips-title">数据说明</Text>
          <View className="tips-list">
            <View className="tip-item">
              <View className="tip-dot blue" />
              <Text className="tip-text">曝光人数：直播间被展示给用户的总次数</Text>
            </View>
            <View className="tip-item">
              <View className="tip-dot cyan" />
              <Text className="tip-text">进房率：进入直播间人数 ÷ 曝光人数</Text>
            </View>
            <View className="tip-item">
              <View className="tip-dot purple" />
              <Text className="tip-text">平均在线：直播期间同时在线用户的平均值</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TrafficPage;
