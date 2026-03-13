import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading, navigateTo } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { Sparkles, Star, Info, Lightbulb, ChevronRight } from 'lucide-react-taro';
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
    showLoading({ title: 'AI分析中...' });

    try {
      // 调用后端生成分析接口
      const response = await Network.request({
        url: '/api/live-data/generate-analysis',
        method: 'POST',
        data: { liveStreamId: liveId },
      });

      if (response.data?.success) {
        showToast({ title: '生成成功', icon: 'success' });
        // 跳转到详情页查看分析结果
        navigateTo({ url: `/pages/live-data/detail/index?id=${liveId}` });
      } else {
        throw new Error(response.data?.message || '生成失败');
      }
    } catch (error: any) {
      showToast({ title: error.message || '生成失败', icon: 'none' });
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
        <Sparkles size={32} color="#FFB800" />
        <Text className="title">AI 直播复盘</Text>
        <Text className="subtitle">智能分析直播数据，生成专业复盘报告</Text>
      </View>

      <ScrollView className="list-container" scrollY>
        {liveList.length === 0 && !loading ? (
          <View className="empty-state">
            <Text className="empty-text">暂无直播记录</Text>
            <Text className="empty-tips">导入数据后可生成复盘分析</Text>
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
                      <Star size={12} />
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
                      <ChevronRight size={16} />
                    </View>
                  ) : (
                    <View
                      className={`action-btn ${generating === item.id ? 'loading' : ''}`}
                      onClick={() => generateAnalysis(item.id)}
                    >
                      <Sparkles size={16} />
                      <Text>{generating === item.id ? '分析中...' : '生成复盘'}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* AI 能力说明 */}
      <View className="features-section">
        <Text className="features-title">AI 复盘能力</Text>
        <View className="feature-list">
          <View className="feature-item">
            <Star size={20} color="#52c41a" />
            <View>
              <Text className="name">直播亮点识别</Text>
              <Text className="desc">自动识别直播中的优秀表现</Text>
            </View>
          </View>
          <View className="feature-item">
            <Info size={20} color="#faad14" />
            <View>
              <Text className="name">问题诊断分析</Text>
              <Text className="desc">发现直播中的不足之处</Text>
            </View>
          </View>
          <View className="feature-item">
            <Lightbulb size={20} color="#1890ff" />
            <View>
              <Text className="name">优化建议生成</Text>
              <Text className="desc">提供针对性的改进方案</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LiveAnalysisPage;
