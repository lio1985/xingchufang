import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateTo } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import './index.less';

interface LiveStream {
  id: string;
  title: string;
  startTime: string;
  gmv: number;
  totalViews: number;
  hasAnalysis: boolean;
}

const LiveAnalysisPage = () => {
  const [liveList, setLiveList] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchLiveList = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await Network.request({
        url: '/api/live-data/list',
        method: 'GET',
        data: { limit: 50 },
      });

      if (response.data?.success) {
        setLiveList(response.data.data || []);
      }
    } catch (error) {
      showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateAnalysis = async (liveId: string) => {
    setGenerating(liveId);
    showLoading({ title: '分析中...' });

    try {
      // 调用后端创建分析接口
      const response = await Network.request({
        url: '/api/live-data/generate-analysis',
        method: 'POST',
        data: { liveStreamId: liveId },
      });

      if (response.data?.success) {
        showToast({ title: '创建成功', icon: 'success' });
        // 跳转到详情页查看分析结果
        navigateTo({ url: `/pages/live-data/detail/index?id=${liveId}` });
      } else {
        throw new Error(response.data?.message || '创建失败');
      }
    } catch (error: any) {
      showToast({ title: error.message || '创建失败', icon: 'none' });
    } finally {
      setGenerating(null);
      hideLoading();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <View className="live-analysis-page">
      <View className="header">
        <Text>✨</Text>
        <Text className="title">直播复盘</Text>
        <Text className="subtitle">深度分析直播数据，输出专业复盘报告</Text>
      </View>

      <ScrollView className="list-container" scrollY>
        {liveList.length === 0 && !loading ? (
          <View className="empty-state">
            <Text className="empty-text">暂无直播记录</Text>
            <Text className="empty-tips">导入数据后可创建复盘分析</Text>
          </View>
        ) : (
          <>
            {liveList.map((item) => (
              <View key={item.id} className="live-card">
                <View className="card-header">
                  <View>
                    <Text className="title">{item.title}</Text>
                    <Text className="date">{formatDate(item.startTime)} · GMV ¥{item.gmv.toFixed(2)}</Text>
                  </View>
                  {item.hasAnalysis ? (
                    <View className="status-badge done">
                      <Text>⭐</Text>
                      <Text>已分析</Text>
                    </View>
                  ) : (
                    <View className="status-badge pending">
                      <Text>待分析</Text>
                    </View>
                  )}
                </View>

                <View className="card-actions">
                  {item.hasAnalysis ? (
                    <View
                      className="action-btn primary"
                      onClick={() => navigateTo({ url: `/pages/live-data/detail/index?id=${item.id}` })}
                    >
                      <Text>查看分析报告</Text>
                      <Text>{">"}</Text>
                    </View>
                  ) : (
                    <View
                      className={`action-btn ${generating === item.id ? 'loading' : ''}`}
                      onClick={() => generateAnalysis(item.id)}
                    >
                      <Text>✨</Text>
                      <Text>{generating === item.id ? '分析中...' : '创建复盘'}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* 复盘能力说明 */}
      <View className="features-section">
        <Text className="features-title">复盘能力</Text>
        <View className="feature-list">
          <View className="feature-item">
            <Text>⭐</Text>
            <View>
              <Text className="name">直播亮点识别</Text>
              <Text className="desc">自动识别直播中的优秀表现</Text>
            </View>
          </View>
          <View className="feature-item">
            <Text>ℹ</Text>
            <View>
              <Text className="name">问题诊断分析</Text>
              <Text className="desc">发现直播中的不足之处</Text>
            </View>
          </View>
          <View className="feature-item">
            <Text>💡</Text>
            <View>
              <Text className="name">优化建议创建</Text>
              <Text className="desc">提供针对性的改进方案</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LiveAnalysisPage;
