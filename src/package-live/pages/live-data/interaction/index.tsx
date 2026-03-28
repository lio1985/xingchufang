import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateBack, getCurrentInstance } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import './index.less';

interface InteractionStats {
  interactionCount: number;
  privateMessageCount: number;
  totalLikes: number;
  totalComments: number;
  newFollowers: number;
  interactionRate: number;
  prevPeriod: {
    interactionCount: number;
    totalLikes: number;
    totalComments: number;
    newFollowers: number;
  };
}

const InteractionPage = () => {
  const [stats, setStats] = useState<InteractionStats | null>(null);
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
          interactionCount: data.interactionCount || 0,
          privateMessageCount: data.privateMessageCount || 0,
          totalLikes: data.totalLikes || 0,
          totalComments: data.totalComments || 0,
          newFollowers: data.newFollowers || 0,
          interactionRate: data.interactionRate || 0,
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
      <View className="interaction-page">
        <View className="header">
          <View className="back-btn" onClick={() => navigateBack()}>
            <Text>←</Text>
          </View>
          <Text className="title">互动数据</Text>
          <View className="placeholder" />
        </View>
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    );
  }

  const likesChange = calculateChange(stats.totalLikes, stats.prevPeriod?.totalLikes || 0);
  const commentsChange = calculateChange(stats.totalComments, stats.prevPeriod?.totalComments || 0);
  const followersChange = calculateChange(stats.newFollowers, stats.prevPeriod?.newFollowers || 0);

  return (
    <View className="interaction-page">
      <View className="header">
        <View className="back-btn" onClick={() => navigateBack()}>
          <Text>←</Text>
        </View>
        <View className="header-center">
          <Text className="title">互动数据</Text>
          <Text className="subtitle">{getRangeLabel()}</Text>
        </View>
        <View className="placeholder" />
      </View>

      <ScrollView className="content" scrollY>
        {/* 互动率概览 */}
        <View className="section-card rate-card">
          <View className="rate-header">
            <View className="rate-icon">
              <Text>✨</Text>
            </View>
            <View className="rate-info">
              <Text className="rate-label">互动率</Text>
              <Text className="rate-value">{stats.interactionRate.toFixed(2)}%</Text>
            </View>
          </View>
          <View className="rate-hint">
            <Text className="hint-text">
              {stats.interactionRate > 5 ? '互动率表现优秀，继续保持！' : '互动率有提升空间，可以多引导观众互动'}
            </Text>
          </View>
        </View>

        {/* 主要互动指标 */}
        <View className="section-card">
          <Text className="section-title">互动概览</Text>
          <View className="interaction-grid">
            <View className="interaction-item main">
              <View className="interaction-icon orange">
                <Text>👤</Text>
              </View>
              <View className="interaction-info">
                <Text className="interaction-value">{stats.interactionCount.toLocaleString()}</Text>
                <Text className="interaction-label">互动人数</Text>
              </View>
            </View>

            <View className="interaction-item">
              <View className="interaction-icon pink">
                <Text>💬</Text>
              </View>
              <View className="interaction-info">
                <Text className="interaction-value">{stats.privateMessageCount.toLocaleString()}</Text>
                <Text className="interaction-label">私信人数</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 详细互动数据 */}
        <View className="section-card">
          <Text className="section-title">详细数据</Text>
          <View className="detail-list">
            <View className="detail-item">
              <View className="detail-left">
                <View className="detail-icon red">
                  <Text>❤️</Text>
                </View>
                <View className="detail-info">
                  <Text className="detail-label">点赞数</Text>
                  <View className={`detail-change ${likesChange >= 0 ? 'up' : 'down'}`}>
                    <Text>{formatChange(likesChange)}</Text>
                  </View>
                </View>
              </View>
              <Text className="detail-value">{stats.totalLikes.toLocaleString()}</Text>
            </View>

            <View className="detail-item">
              <View className="detail-left">
                <View className="detail-icon blue">
                  <Text>💬</Text>
                </View>
                <View className="detail-info">
                  <Text className="detail-label">评论数</Text>
                  <View className={`detail-change ${commentsChange >= 0 ? 'up' : 'down'}`}>
                    <Text>{formatChange(commentsChange)}</Text>
                  </View>
                </View>
              </View>
              <Text className="detail-value">{stats.totalComments.toLocaleString()}</Text>
            </View>

            <View className="detail-item">
              <View className="detail-left">
                <View className="detail-icon purple">
                  <Text>👤</Text>
                </View>
                <View className="detail-info">
                  <Text className="detail-label">新增粉丝</Text>
                  <View className={`detail-change ${followersChange >= 0 ? 'up' : 'down'}`}>
                    <Text>{formatChange(followersChange)}</Text>
                  </View>
                </View>
              </View>
              <Text className="detail-value">{stats.newFollowers.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* 提升建议 */}
        <View className="section-card tips-card">
          <Text className="tips-title">互动提升建议</Text>
          <View className="tips-list">
            <View className="tip-item">
              <View className="tip-number">1</View>
              <Text className="tip-text">主动提问，引导观众在评论区参与讨论</Text>
            </View>
            <View className="tip-item">
              <View className="tip-number">2</View>
              <Text className="tip-text">设置点赞目标，达到一定数量进行抽奖</Text>
            </View>
            <View className="tip-item">
              <View className="tip-number">3</View>
              <Text className="tip-text">及时回复评论，让观众感受到被重视</Text>
            </View>
            <View className="tip-item">
              <View className="tip-number">4</View>
              <Text className="tip-text">引导关注，告知关注后可获得专属福利</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InteractionPage;
