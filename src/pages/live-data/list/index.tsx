import { useState, useEffect } from 'react';
import { showToast, navigateTo } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { Calendar, ChevronRight, TrendingUp, Eye, Users } from 'lucide-react-taro';
import './index.less';

interface LiveStream {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  totalViews: number;
  peakOnline: number;
  gmv: number;
  ordersCount: number;
}

const LiveDataListPage = () => {
  const [liveList, setLiveList] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLiveData = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await Network.request({
        url: '/api/live-data/list',
        method: 'GET',
        data: { page: pageNum, limit: 10 },
      });

      if (response.data?.success) {
        const newData = response.data.data || [];
        if (pageNum === 1) {
          setLiveList(newData);
        } else {
          setLiveList(prev => [...prev, ...newData]);
        }
        setHasMore(newData.length === 10);
      }
    } catch (error) {
      showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLiveData(nextPage);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const goToDetail = (id: string) => {
    navigateTo({ url: `/pages/live-data/detail/index?id=${id}` });
  };

  return (
    <View className="live-list-page">
      <View className="header">
        <Text className="title">直播记录</Text>
        <Text className="subtitle">查看历史直播数据</Text>
      </View>

      <ScrollView className="list-container" scrollY onScrollToLower={loadMore}>
        {liveList.length === 0 && !loading ? (
          <View className="empty-state">
            <Calendar size={48} color="#999" />
            <Text className="empty-text">暂无直播记录</Text>
            <Text className="empty-tips">导入数据后即可查看</Text>
          </View>
        ) : (
          <>
            {liveList.map((item) => (
              <View key={item.id} className="live-card" onClick={() => goToDetail(item.id)}>
                <View className="card-header">
                  <Text className="title">{item.title}</Text>
                  <Text className="date">{formatDate(item.startTime)}</Text>
                </View>

                <View className="stats-row">
                  <View className="stat-item">
                    <Eye size={14} color="#666" />
                    <Text className="value">{item.totalViews.toLocaleString()}</Text>
                    <Text className="label">观看</Text>
                  </View>
                  <View className="stat-item">
                    <Users size={14} color="#666" />
                    <Text className="value">{item.peakOnline.toLocaleString()}</Text>
                    <Text className="label">最高在线</Text>
                  </View>
                  <View className="stat-item">
                    <TrendingUp size={14} color="#666" />
                    <Text className="value">¥{item.gmv.toFixed(2)}</Text>
                    <Text className="label">成交</Text>
                  </View>
                </View>

                <View className="card-footer">
                  <Text className="duration">时长: {formatDuration(item.durationSeconds)}</Text>
                  <Text className="orders">订单: {item.ordersCount}</Text>
                  <ChevronRight size={16} color="#999" />
                </View>
              </View>
            ))}

            {loading && <Text className="loading-text">加载中...</Text>}
            {!hasMore && liveList.length > 0 && <Text className="no-more">没有更多数据</Text>}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default LiveDataListPage;
