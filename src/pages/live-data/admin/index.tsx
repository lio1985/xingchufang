import { useState, useEffect } from 'react';
import { showToast, showLoading, hideLoading } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Picker } from '@tarojs/components';
import { Network } from '@/network';
import {
  Search, Users, Calendar, TrendingUp, Download, SlidersHorizontal,
  Eye, ShoppingCart, Heart, Clock, ChevronDown,
  RefreshCw, FileSpreadsheet
} from 'lucide-react-taro';
import './index.less';

interface LiveStreamAdmin {
  id: string;
  title: string;
  startTime: string;
  userId: string;
  nickname?: string;
  totalViews: number;
  peakOnline: number;
  avgOnline: number;
  newFollowers: number;
  totalComments: number;
  totalLikes: number;
  ordersCount: number;
  gmv: number;
  durationSeconds: number;
  productClicks: number;
  productExposures: number;
}

interface AdminStats {
  totalStreams: number;
  totalUsers: number;
  totalGMV: number;
  totalOrders: number;
  totalViews: number;
  avgGMVPerStream: number;
  avgWatchDuration: number;
  conversionRate: number;
  interactionRate: number;
  // 用户重点关注的新指标
  exposureCount: number;        // 曝光人数
  enterRoomCount: number;       // 进入直播间人数
  onlinePeak: number;           // 在线峰值
  avgOnline: number;            // 平均在线人数
  newFollowers: number;         // 新增粉丝数
  interactionCount: number;     // 互动人数
  privateMessageCount: number;  // 私信人数
  enterRoomRate: number;        // 进房率
}

interface UserOption {
  userId: string;
  nickname: string;
  streamCount: number;
}

type TimeRange = 'all' | '7days' | '30days' | '90days' | 'custom';
type SortField = 'startTime' | 'gmv' | 'totalViews' | 'ordersCount';
type SortOrder = 'desc' | 'asc';

const LiveDataAdminPage = () => {
  const [liveList, setLiveList] = useState<LiveStreamAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [sortField, setSortField] = useState<SortField>('startTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalStreams: 0,
    totalUsers: 0,
    totalGMV: 0,
    totalOrders: 0,
    totalViews: 0,
    avgGMVPerStream: 0,
    avgWatchDuration: 0,
    conversionRate: 0,
    interactionRate: 0,
    exposureCount: 0,
    enterRoomCount: 0,
    onlinePeak: 0,
    avgOnline: 0,
    newFollowers: 0,
    interactionCount: 0,
    privateMessageCount: 0,
    enterRoomRate: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, hasMore: true });

  // 获取默认日期范围
  const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  };

  // 计算日期范围
  const calculateDateRange = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    switch (timeRange) {
      case '7days':
        return {
          startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case '30days':
        return {
          startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case '90days':
        return {
          startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case 'custom':
        return customDateRange;
      default:
        return { startDate: '', endDate: '' };
    }
  };

  const fetchStats = async () => {
    try {
      const dateRange = calculateDateRange();
      const params: any = {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(selectedUser !== 'all' && { userId: selectedUser }),
      };

      const response = await Network.request({
        url: '/api/live-data/admin/stats',
        method: 'GET',
        data: params,
      });

      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchAllData = async (page = 1, isLoadMore = false) => {
    if (loading) return;
    setLoading(true);
    if (page === 1 && !isLoadMore) {
      showLoading({ title: '加载中...' });
    }

    try {
      const dateRange = calculateDateRange();
      const params: any = {
        page,
        limit: pagination.limit,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(selectedUser !== 'all' && { userId: selectedUser }),
      };

      console.log('Fetching admin data with params:', params);

      const response = await Network.request({
        url: '/api/live-data/admin/all-list',
        method: 'GET',
        data: params,
      });

      if (response.data?.success) {
        const data = response.data.data?.list || [];
        const total = response.data.data?.pagination?.total || 0;

        // 处理数据，添加昵称
        const processedData = data.map((item: any) => ({
          ...item,
          nickname: item.users?.nickname || '未知用户',
        }));

        if (isLoadMore) {
          setLiveList(prev => [...prev, ...processedData]);
        } else {
          setLiveList(processedData);
        }

        setPagination({
          page,
          limit: pagination.limit,
          total,
          hasMore: page * pagination.limit < total,
        });

        // 提取用户列表
        if (!isLoadMore) {
          extractUserOptions(data);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
      if (page === 1 && !isLoadMore) {
        hideLoading();
      }
    }
  };

  const extractUserOptions = (data: any[]) => {
    const userMap = new Map<string, UserOption>();
    data.forEach((item: any) => {
      const userId = item.userId || item.user_id;
      const nickname = item.users?.nickname || '未知用户';
      if (userMap.has(userId)) {
        const existing = userMap.get(userId)!;
        existing.streamCount++;
      } else {
        userMap.set(userId, { userId, nickname, streamCount: 1 });
      }
    });
    setUserOptions(Array.from(userMap.values()).sort((a, b) => b.streamCount - a.streamCount));
  };

  useEffect(() => {
    setCustomDateRange(getDefaultDateRange());
  }, []);

  useEffect(() => {
    fetchStats();
    fetchAllData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, selectedUser]);

  const handleRefresh = () => {
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
    fetchStats();
    fetchAllData(1);
  };

  const handleLoadMore = () => {
    if (!pagination.hasMore || loading) return;
    const nextPage = pagination.page + 1;
    setPagination(prev => ({ ...prev, page: nextPage }));
    fetchAllData(nextPage, true);
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    showLoading({ title: '准备导出...' });

    try {
      const dateRange = calculateDateRange();
      const params: any = {
        format,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
        ...(selectedUser !== 'all' && { userId: selectedUser }),
      };

      const response = await Network.request({
        url: '/api/live-data/admin/export',
        method: 'POST',
        data: params,
      });

      if (response.data?.success) {
        const { content, filename, contentType } = response.data.data;

        // 创建下载链接
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast({ title: '导出成功', icon: 'success' });
      } else {
        showToast({ title: response.data?.message || '导出失败', icon: 'none' });
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast({ title: '导出失败', icon: 'none' });
    } finally {
      hideLoading();
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredList = liveList.filter(item =>
    item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (item.nickname && item.nickname.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  const sortedList = [...filteredList].sort((a, b) => {
    const aVal = a[sortField] || 0;
    const bVal = b[sortField] || 0;
    return sortOrder === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}小时${minutes}分` : `${minutes}分钟`;
  };

  const timeRangeOptions = [
    { value: 'all', label: '全部' },
    { value: '7days', label: '近7天' },
    { value: '30days', label: '近30天' },
    { value: '90days', label: '近90天' },
    { value: 'custom', label: '自定义' },
  ];

  return (
    <View className="live-admin-page">
      <View className="header">
        <View className="header-top">
          <Text className="title">数据管理后台</Text>
          <View className="header-actions">
            <View className="icon-btn" onClick={handleRefresh}>
              <RefreshCw size={18} color="#fff" />
            </View>
          </View>
        </View>

        {/* 时间筛选 */}
        <View className="time-filter">
          {timeRangeOptions.map((option) => (
            <View
              key={option.value}
              className={`filter-tab ${timeRange === option.value ? 'active' : ''}`}
              onClick={() => setTimeRange(option.value as TimeRange)}
            >
              <Text>{option.label}</Text>
            </View>
          ))}
        </View>

        {/* 自定义日期选择器 */}
        {timeRange === 'custom' && (
          <View className="custom-date-picker">
            <View className="date-row">
              <Picker mode="date" value={customDateRange.startDate} onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.detail.value }))}>
                <View className="date-input">
                  <Calendar size={14} />
                  <Text>{customDateRange.startDate || '开始日期'}</Text>
                </View>
              </Picker>
              <Text className="date-separator">至</Text>
              <Picker mode="date" value={customDateRange.endDate} onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.detail.value }))}>
                <View className="date-input">
                  <Calendar size={14} />
                  <Text>{customDateRange.endDate || '结束日期'}</Text>
                </View>
              </Picker>
            </View>
            <View className="date-actions">
              <View className="date-confirm-btn" onClick={() => fetchAllData(1)}>
                <Text>确认</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 统计卡片 */}
      <ScrollView className="stats-scroll" scrollX>
        <View className="stats-row">
          {/* 流量数据板块 */}
          <View className="stat-card primary">
            <View className="stat-icon">
              <TrendingUp size={20} color="#fff" />
            </View>
            <Text className="value">{stats.totalStreams.toLocaleString()}</Text>
            <Text className="label">直播场次</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon purple">
              <Eye size={20} color="#722ed1" />
            </View>
            <Text className="value">{(stats.exposureCount / 10000).toFixed(2)}万</Text>
            <Text className="label">曝光人数</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon blue">
              <Users size={20} color="#1890ff" />
            </View>
            <Text className="value">{(stats.enterRoomCount / 10000).toFixed(2)}万</Text>
            <Text className="label">进入直播间</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon cyan">
              <TrendingUp size={20} color="#13c2c2" />
            </View>
            <Text className="value">{stats.enterRoomRate.toFixed(1)}%</Text>
            <Text className="label">进房率</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon orange">
              <TrendingUp size={20} color="#fa8c16" />
            </View>
            <Text className="value">{stats.onlinePeak}</Text>
            <Text className="label">在线峰值</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon pink">
              <Users size={20} color="#eb2f96" />
            </View>
            <Text className="value">{stats.avgOnline}</Text>
            <Text className="label">平均在线</Text>
          </View>

          {/* 互动数据板块 */}
          <View className="stat-card">
            <View className="stat-icon blue">
              <Heart size={20} color="#1890ff" />
            </View>
            <Text className="value">{stats.interactionCount.toLocaleString()}</Text>
            <Text className="label">互动人数</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon cyan">
              <TrendingUp size={20} color="#13c2c2" />
            </View>
            <Text className="value">{stats.privateMessageCount.toLocaleString()}</Text>
            <Text className="label">私信人数</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon red">
              <Heart size={20} color="#f5222d" />
            </View>
            <Text className="value">{stats.newFollowers.toLocaleString()}</Text>
            <Text className="label">新增粉丝</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon pink">
              <Heart size={20} color="#eb2f96" />
            </View>
            <Text className="value">{stats.interactionRate.toFixed(1)}%</Text>
            <Text className="label">互动率</Text>
          </View>

          {/* 转化数据板块 */}
          <View className="stat-card">
            <View className="stat-icon green">
              <TrendingUp size={20} color="#52c41a" />
            </View>
            <Text className="value">¥{(stats.totalGMV / 10000).toFixed(2)}万</Text>
            <Text className="label">总GMV</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon orange">
              <ShoppingCart size={20} color="#fa8c16" />
            </View>
            <Text className="value">{stats.totalOrders.toLocaleString()}</Text>
            <Text className="label">订单数</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon cyan">
              <Clock size={20} color="#13c2c2" />
            </View>
            <Text className="value">{stats.avgWatchDuration}秒</Text>
            <Text className="label">人均观看</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon red">
              <TrendingUp size={20} color="#f5222d" />
            </View>
            <Text className="value">{stats.conversionRate.toFixed(1)}%</Text>
            <Text className="label">转化率</Text>
          </View>
          <View className="stat-card">
            <View className="stat-icon purple">
              <Users size={20} color="#722ed1" />
            </View>
            <Text className="value">{stats.totalUsers}</Text>
            <Text className="label">主播数</Text>
          </View>
        </View>
      </ScrollView>

      {/* 筛选和导出工具栏 */}
      <View className="toolbar">
        <View className="toolbar-left">
          {/* 主播筛选 */}
          <View className="filter-dropdown">
            <Picker
              mode="selector"
              range={['全部主播', ...userOptions.map(u => `${u.nickname} (${u.streamCount}场)`)]}
              onChange={(e) => {
                const index = e.detail.value as number;
                setSelectedUser(index === 0 ? 'all' : userOptions[index - 1].userId);
              }}
            >
              <View className="dropdown-trigger">
                <Text className="dropdown-text">
                  {selectedUser === 'all' ? '全部主播' : userOptions.find(u => u.userId === selectedUser)?.nickname || '选择主播'}
                </Text>
                <ChevronDown size={14} color="#666" />
              </View>
            </Picker>
          </View>

          {/* 展开筛选 */}
          <View className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} />
            <Text>筛选</Text>
          </View>
        </View>

        {/* 导出按钮 */}
        <View className="export-dropdown">
          <Picker mode="selector" range={['导出CSV', '导出JSON']} onChange={(e) => handleExport(e.detail.value === 0 ? 'csv' : 'json')}>
            <View className="export-btn">
              <Download size={16} />
              <Text>导出</Text>
            </View>
          </Picker>
        </View>
      </View>

      {/* 搜索 */}
      <View className="search-section">
        <View className="search-input-wrapper">
          <Search size={18} color="#999" />
          <Input
            className="search-input"
            placeholder="搜索直播标题或主播..."
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>
      </View>

      {/* 排序栏 */}
      <View className="sort-bar">
        <Text className="sort-label">排序:</Text>
        <View className="sort-options">
          <View
            className={`sort-option ${sortField === 'startTime' ? 'active' : ''}`}
            onClick={() => handleSort('startTime')}
          >
            <Text>时间</Text>
            {sortField === 'startTime' && (
              <Text className="sort-icon">{sortOrder === 'desc' ? '↓' : '↑'}</Text>
            )}
          </View>
          <View
            className={`sort-option ${sortField === 'gmv' ? 'active' : ''}`}
            onClick={() => handleSort('gmv')}
          >
            <Text>GMV</Text>
            {sortField === 'gmv' && (
              <Text className="sort-icon">{sortOrder === 'desc' ? '↓' : '↑'}</Text>
            )}
          </View>
          <View
            className={`sort-option ${sortField === 'totalViews' ? 'active' : ''}`}
            onClick={() => handleSort('totalViews')}
          >
            <Text>观看</Text>
            {sortField === 'totalViews' && (
              <Text className="sort-icon">{sortOrder === 'desc' ? '↓' : '↑'}</Text>
            )}
          </View>
          <View
            className={`sort-option ${sortField === 'ordersCount' ? 'active' : ''}`}
            onClick={() => handleSort('ordersCount')}
          >
            <Text>订单</Text>
            {sortField === 'ordersCount' && (
              <Text className="sort-icon">{sortOrder === 'desc' ? '↓' : '↑'}</Text>
            )}
          </View>
        </View>
      </View>

      {/* 数据列表 - 手机端卡片式 */}
      <ScrollView className="list-container" scrollY onScrollToLower={handleLoadMore}>
        {sortedList.length === 0 ? (
          <View className="empty-state">
            <FileSpreadsheet size={48} color="#ddd" />
            <Text className="empty-text">暂无数据</Text>
            <Text className="empty-tips">尝试调整筛选条件</Text>
          </View>
        ) : (
          <>
            {sortedList.map((item) => (
              <View key={item.id} className="data-card">
                {/* 卡片头部：标题和时间 */}
                <View className="card-header">
                  <Text className="live-title">{item.title}</Text>
                  <Text className="live-time">{formatDate(item.startTime)}</Text>
                </View>

                {/* 主播信息 */}
                <View className="card-user">
                  <View className="user-avatar">
                    <Users size={14} color="#10b981" />
                  </View>
                  <Text className="user-name">{item.nickname || '未知主播'}</Text>
                </View>

                {/* 核心数据 - 大数字展示 */}
                <View className="card-metrics">
                  <View className="metric-item primary">
                    <Text className="metric-value">¥{item.gmv >= 10000 ? (item.gmv / 10000).toFixed(2) + '万' : item.gmv.toLocaleString()}</Text>
                    <Text className="metric-label">成交额</Text>
                  </View>
                  <View className="metric-item">
                    <Text className="metric-value">{item.totalViews >= 10000 ? (item.totalViews / 10000).toFixed(2) + '万' : item.totalViews.toLocaleString()}</Text>
                    <Text className="metric-label">观看</Text>
                  </View>
                  <View className="metric-item">
                    <Text className="metric-value">{item.ordersCount}</Text>
                    <Text className="metric-label">订单</Text>
                  </View>
                </View>

                {/* 详细数据网格 */}
                <View className="card-details">
                  <View className="detail-row">
                    <View className="detail-item">
                      <Text className="detail-label">直播时长</Text>
                      <Text className="detail-value">{formatDuration(item.durationSeconds)}</Text>
                    </View>
                    <View className="detail-item">
                      <Text className="detail-label">最高在线</Text>
                      <Text className="detail-value">{item.peakOnline}人</Text>
                    </View>
                  </View>
                  <View className="detail-row">
                    <View className="detail-item">
                      <Text className="detail-label">平均在线</Text>
                      <Text className="detail-value">{item.avgOnline}人</Text>
                    </View>
                    <View className="detail-item">
                      <Text className="detail-label">新增粉丝</Text>
                      <Text className="detail-value">+{item.newFollowers}</Text>
                    </View>
                  </View>
                  <View className="detail-row">
                    <View className="detail-item">
                      <Text className="detail-label">点赞</Text>
                      <Text className="detail-value">{item.totalLikes.toLocaleString()}</Text>
                    </View>
                    <View className="detail-item">
                      <Text className="detail-label">评论</Text>
                      <Text className="detail-value">{item.totalComments.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>

                {/* 转化率标签 */}
                <View className="card-tags">
                  <View className="tag">
                    <Text className="tag-text">转化率 {item.productExposures > 0 ? ((item.productClicks / item.productExposures) * 100).toFixed(1) : 0}%</Text>
                  </View>
                  <View className="tag blue">
                    <Text className="tag-text">互动率 {item.totalViews > 0 ? (((item.totalComments + item.totalLikes) / item.totalViews) * 100).toFixed(1) : 0}%</Text>
                  </View>
                </View>
              </View>
            ))}

            {loading && <View className="loading-more"><Text>加载中...</Text></View>}
            {!pagination.hasMore && sortedList.length > 0 && (
              <View className="no-more"><Text>没有更多数据了</Text></View>
            )}
          </>
        )}
      </ScrollView>

      {/* 底部统计栏 */}
      <View className="bottom-bar">
        <Text className="bottom-text">
          共{pagination.total}条 | 人均¥{stats.totalUsers > 0 ? (stats.totalGMV / stats.totalUsers).toFixed(0) : '0'}
        </Text>
      </View>
    </View>
  );
};

export default LiveDataAdminPage;
