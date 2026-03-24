import { useState, useEffect } from 'react';
import { getCurrentInstance, showToast, showLoading, hideLoading } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import './index.less';

interface LiveDetail {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  totalViews: number;
  peakOnline: number;
  avgOnline: number;
  newFollowers: number;
  totalComments: number;
  totalLikes: number;
  ordersCount: number;
  gmv: number;
  products: any[];
  analysis?: {
    id: string;
    overallScore: number;
    highlights: string[];
    issues: string[];
    suggestions: string[];
    generatedAt: string;
  };
}

const LiveDataDetailPage = () => {
  const [detail, setDetail] = useState<LiveDetail | null>(null);

  useEffect(() => {
    const { id } = getCurrentInstance().router?.params || {};
    if (id) {
      fetchDetail(id);
    }
  }, []);

  const fetchDetail = async (liveId: string) => {
    showLoading({ title: '加载中...' });
    try {
      const response = await Network.request({
        url: `/api/live-data/detail/${liveId}`,
        method: 'GET',
      });

      if (response.data?.success) {
        setDetail(response.data.data);
      }
    } catch (error) {
      showToast({ title: '加载失败', icon: 'none' });
    } finally {
      hideLoading();
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (!detail) return null;

  return (
    <View className="live-detail-page">
      <ScrollView className="detail-container" scrollY>
        {/* 头部信息 */}
        <View className="header-card">
          <Text className="title">{detail.title}</Text>
          <View className="time-row">
            <Text>D</Text>
            <Text>{formatDate(detail.startTime)} - {formatDate(detail.endTime)}</Text>
          </View>
          <View className="duration-badge">
            <Text>🕐</Text>
            <Text>{formatDuration(detail.durationSeconds)}</Text>
          </View>
        </View>

        {/* 核心数据 */}
        <View className="stats-grid">
          <View className="stat-card primary">
            <Text>👁️</Text>
            <Text className="value">{detail.totalViews.toLocaleString()}</Text>
            <Text className="label">观看人数</Text>
          </View>
          <View className="stat-card">
            <Text>👤</Text>
            <Text className="value">{detail.peakOnline.toLocaleString()}</Text>
            <Text className="label">最高在线</Text>
          </View>
          <View className="stat-card">
            <Text>^</Text>
            <Text className="value">¥{detail.gmv.toFixed(2)}</Text>
            <Text className="label">成交金额</Text>
          </View>
          <View className="stat-card">
            <Text>❤️</Text>
            <Text className="value">{detail.totalLikes.toLocaleString()}</Text>
            <Text className="label">点赞数</Text>
          </View>
        </View>

        {/* 互动数据 */}
        <View className="section-card">
          <Text className="section-title">互动数据</Text>
          <View className="interaction-stats">
            <View className="interaction-item">
              <Text>💬</Text>
              <Text className="value">{detail.totalComments.toLocaleString()}</Text>
              <Text className="label">评论数</Text>
            </View>
            <View className="interaction-item">
              <Text>👤</Text>
              <Text className="value">{detail.newFollowers.toLocaleString()}</Text>
              <Text className="label">新增粉丝</Text>
            </View>
            <View className="interaction-item">
              <Text>^</Text>
              <Text className="value">{detail.ordersCount}</Text>
              <Text className="label">订单数</Text>
            </View>
          </View>
        </View>

        {/* 商品数据 */}
        {detail.products && detail.products.length > 0 && (
          <View className="section-card">
            <Text className="section-title">商品数据 ({detail.products.length}款)</Text>
            {detail.products.map((product, index) => (
              <View key={index} className="product-row">
                <View className="product-info">
                  <Text className="name">{product.productName}</Text>
                  <Text className="price">¥{product.productPrice.toFixed(2)}</Text>
                </View>
                <View className="product-stats">
                  <Text>曝光 {product.exposures}</Text>
                  <Text>点击 {product.clicks}</Text>
                  <Text>订单 {product.orders}</Text>
                  <Text className="gmv">成交 ¥{product.gmv.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 复盘分析 */}
        {detail.analysis && (
          <View className="analysis-card">
            <View className="analysis-header">
              <Text>*</Text>
              <Text className="title">直播复盘</Text>
              <View className="score-badge">
                <Text>{detail.analysis.overallScore}分</Text>
              </View>
            </View>

            <View className="analysis-section">
              <Text className="subtitle success">
                <Text>*</Text> 直播亮点
              </Text>
              {detail.analysis.highlights.map((item, idx) => (
                <Text key={idx} className="analysis-item">• {item}</Text>
              ))}
            </View>

            <View className="analysis-section">
              <Text className="subtitle warning">
                <Text>ℹ️</Text> 待改进点
              </Text>
              {detail.analysis.issues.map((item, idx) => (
                <Text key={idx} className="analysis-item">• {item}</Text>
              ))}
            </View>

            <View className="analysis-section">
              <Text className="subtitle info">
                <Text>I</Text> 优化建议
              </Text>
              {detail.analysis.suggestions.map((item, idx) => (
                <Text key={idx} className="analysis-item">• {item}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LiveDataDetailPage;
