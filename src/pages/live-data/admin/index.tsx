import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading } from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import { Search, Users, Calendar, TrendingUp } from 'lucide-react-taro';
import './index.less';

interface LiveStreamAdmin {
  id: string;
  title: string;
  startTime: string;
  userId: string;
  totalViews: number;
  gmv: number;
  ordersCount: number;
}

const LiveDataAdminPage = () => {
  const [liveList, setLiveList] = useState<LiveStreamAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [stats, setStats] = useState({
    totalStreams: 0,
    totalUsers: 0,
    totalGMV: 0,
    totalOrders: 0,
  });

  const fetchAllData = async () => {
    if (loading) return;
    setLoading(true);
    showLoading({ title: '加载中...' });

    try {
      const response = await Network.request({
        url: '/api/live-data/admin/all-list',
        method: 'GET',
      });

      if (response.data?.success) {
        const data = response.data.data || [];
        setLiveList(data);
        
        // 计算统计数据
        const uniqueUsers = new Set(data.map((item: any) => item.userId));
        setStats({
          totalStreams: data.length,
          totalUsers: uniqueUsers.size,
          totalGMV: data.reduce((sum: number, item: any) => sum + (item.gmv || 0), 0),
          totalOrders: data.reduce((sum: number, item: any) => sum + (item.ordersCount || 0), 0),
        });
      }
    } catch (error) {
      showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredList = liveList.filter(item =>
    item.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <View className="live-admin-page">
      <View className="header">
        <Text className="title">数据管理后台</Text>
      </View>

      {/* 统计卡片 */}
      <View className="stats-row">
        <View className="stat-card">
          <Calendar size={24} />
          <Text className="value">{stats.totalStreams}</Text>
          <Text className="label">直播场次</Text>
        </View>
        <View className="stat-card">
          <Users size={24} />
          <Text className="value">{stats.totalUsers}</Text>
          <Text className="label">用户数</Text>
        </View>
        <View className="stat-card">
          <TrendingUp size={24} />
          <Text className="value">¥{(stats.totalGMV / 10000).toFixed(2)}万</Text>
          <Text className="label">总GMV</Text>
        </View>
      </View>

      {/* 搜索 */}
      <View className="search-section">
        <View className="search-input-wrapper">
          <Search size={18} />
          <Input
            className="search-input"
            placeholder="搜索直播标题..."
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>
      </View>

      {/* 数据列表 */}
      <ScrollView className="list-container" scrollY>
        {filteredList.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-text">暂无数据</Text>
          </View>
        ) : (
          <>
            {filteredList.map((item) => (
              <View key={item.id} className="data-card">
                <View className="card-header">
                  <Text className="title">{item.title}</Text>
                  <Text className="date">{formatDate(item.startTime)}</Text>
                </View>
                <View className="card-body">
                  <View className="info-item">
                    <Text className="label">用户ID</Text>
                    <Text className="value">{item.userId.substring(0, 8)}...</Text>
                  </View>
                  <View className="info-row">
                    <View className="info-item">
                      <Text className="label">观看</Text>
                      <Text className="value">{item.totalViews.toLocaleString()}</Text>
                    </View>
                    <View className="info-item">
                      <Text className="label">订单</Text>
                      <Text className="value">{item.ordersCount}</Text>
                    </View>
                    <View className="info-item">
                      <Text className="label">GMV</Text>
                      <Text className="value highlight">¥{item.gmv.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default LiveDataAdminPage;
