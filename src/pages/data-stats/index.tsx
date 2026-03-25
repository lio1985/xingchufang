import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  FileText,
  Activity,
  RefreshCw,
} from 'lucide-react-taro';
import '@/styles/pages.css';
import './index.css';

interface StatData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  contentPublished: number;
}

interface TrendData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const DataStatsPage = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    contentCount: number;
    trends: TrendData[];
    chartData: StatData[];
  }>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    contentCount: 0,
    trends: [],
    chartData: [],
  });

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const loadStats = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockData(period);
      setStats(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockData = (periodType: string) => {
    const baseRevenue = periodType === 'today' ? 1280 : periodType === 'week' ? 8960 : 38400;
    const baseOrders = period === 'today' ? 12 : period === 'week' ? 84 : 360;
    const baseCustomers = period === 'today' ? 8 : period === 'week' ? 56 : 240;

    return {
      totalRevenue: baseRevenue + Math.floor(Math.random() * 2000),
      totalOrders: baseOrders + Math.floor(Math.random() * 20),
      totalCustomers: baseCustomers + Math.floor(Math.random() * 15),
      contentCount: Math.floor(Math.random() * 30) + 10,
      trends: [
        { label: '营收', value: baseRevenue, change: 12.5, trend: 'up' as const },
        { label: '订单', value: baseOrders, change: 8.3, trend: 'up' as const },
        { label: '客户', value: baseCustomers, change: -2.1, trend: 'down' as const },
        { label: '内容', value: Math.floor(Math.random() * 30) + 10, change: 0, trend: 'stable' as const },
      ],
      chartData: Array.from({ length: periodType === 'today' ? 24 : 7 }, (_, i) => ({
        date:
          periodType === 'today'
            ? `${i}:00`
            : `周${['一', '二', '三', '四', '五', '六', '日'][i % 7]}`,
        revenue: Math.floor(Math.random() * 2000) + 500,
        orders: Math.floor(Math.random() * 15) + 5,
        customers: Math.floor(Math.random() * 10) + 3,
        contentPublished: Math.floor(Math.random() * 5) + 1,
      })),
    };
  };

  const formatMoney = (amount: number) => {
    if (amount >= 10000) {
      return (amount / 10000).toFixed(1) + '万';
    }
    return amount.toLocaleString();
  };

  const getMaxRevenue = () => {
    return Math.max(...stats.chartData.map((d) => d.revenue), 1);
  };

  const getBarHeight = (value: number) => {
    return (value / getMaxRevenue()) * 120;
  };

  return (
    <View className="data-stats-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top" style={{ marginBottom: '24px' }}>
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#fafafa" />
            </View>
            <Text className="header-title">数据统计</Text>
          </View>
        </View>

        {/* 时间筛选 */}
        <View className="period-filter">
          {[
            { key: 'today', label: '今日' },
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
          ].map((item) => (
            <View
              key={item.key}
              className={`period-btn ${period === item.key ? 'period-btn-active' : ''}`}
              onClick={() => setPeriod(item.key as typeof period)}
            >
              <Text className="period-btn-text">{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="loading-state">
          <RefreshCw size={64} color="#f59e0b" />
          <Text className="loading-text">加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY style={{ paddingTop: '32px' }}>
          {/* 核心指标卡片 */}
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View className="stat-card">
              <View className="stat-card-title">
                <Activity size={24} color="#71717a" />
                <Text>核心指标</Text>
              </View>

              <View className="stat-grid">
                {/* 营收 */}
                <View className="stat-item">
                  <View className="stat-item-header">
                    <DollarSign size={24} color="#71717a" />
                    <Text className="stat-item-label">营收</Text>
                  </View>
                  <Text className="stat-item-value stat-item-value-primary">
                    ¥{formatMoney(stats.totalRevenue)}
                  </Text>
                  <View className="stat-item-trend">
                    {stats.trends[0].change > 0 ? (
                      <TrendingUp size={16} color="#22c55e" />
                    ) : (
                      <TrendingDown size={16} color="#ef4444" />
                    )}
                    <Text
                      style={{
                        fontSize: '20px',
                        color: stats.trends[0].change > 0 ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {stats.trends[0].change > 0 ? '+' : ''}
                      {stats.trends[0].change}%
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>较上期</Text>
                  </View>
                </View>

                {/* 订单 */}
                <View className="stat-item">
                  <View className="stat-item-header">
                    <Package size={24} color="#71717a" />
                    <Text className="stat-item-label">订单</Text>
                  </View>
                  <Text className="stat-item-value">{stats.totalOrders}</Text>
                  <View className="stat-item-trend">
                    {stats.trends[1].change > 0 ? (
                      <TrendingUp size={16} color="#22c55e" />
                    ) : (
                      <TrendingDown size={16} color="#ef4444" />
                    )}
                    <Text
                      style={{
                        fontSize: '20px',
                        color: stats.trends[1].change > 0 ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {stats.trends[1].change > 0 ? '+' : ''}
                      {stats.trends[1].change}%
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>较上期</Text>
                  </View>
                </View>

                {/* 客户 */}
                <View className="stat-item">
                  <View className="stat-item-header">
                    <Users size={24} color="#71717a" />
                    <Text className="stat-item-label">客户</Text>
                  </View>
                  <Text className="stat-item-value">{stats.totalCustomers}</Text>
                  <View className="stat-item-trend">
                    {stats.trends[2].change > 0 ? (
                      <TrendingUp size={16} color="#22c55e" />
                    ) : (
                      <TrendingDown size={16} color="#ef4444" />
                    )}
                    <Text
                      style={{
                        fontSize: '20px',
                        color: stats.trends[2].change > 0 ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {stats.trends[2].change > 0 ? '+' : ''}
                      {stats.trends[2].change}%
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>较上期</Text>
                  </View>
                </View>

                {/* 内容 */}
                <View className="stat-item">
                  <View className="stat-item-header">
                    <FileText size={24} color="#71717a" />
                    <Text className="stat-item-label">内容</Text>
                  </View>
                  <Text className="stat-item-value">{stats.contentCount}</Text>
                  <View className="stat-item-trend">
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>已发布</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 营收趋势图 */}
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View className="stat-card">
              <View className="stat-card-title">
                <Activity size={24} color="#71717a" />
                <Text>营收趋势</Text>
              </View>

              <View className="chart-container">
                {stats.chartData.map((item, index) => (
                  <View key={index} className="chart-bar-wrapper">
                    <View
                      className={`chart-bar ${index === stats.chartData.length - 1 ? 'chart-bar-active' : 'chart-bar-inactive'}`}
                      style={{ height: `${getBarHeight(item.revenue)}px` }}
                    />
                    <Text className="chart-label">{item.date}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 数据明细 */}
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View className="stat-card">
              <View className="stat-card-title">
                <FileText size={24} color="#71717a" />
                <Text>数据明细</Text>
              </View>

              {stats.chartData.map((item, index) => (
                <View key={index} className="detail-item">
                  <View className="detail-row">
                    <Text className="detail-date">{item.date}</Text>
                    <Text className="detail-value">¥{item.revenue}</Text>
                  </View>
                  <View className="detail-stats">
                    <Text className="detail-stat">📦 {item.orders}单</Text>
                    <Text className="detail-stat">👥 {item.customers}人</Text>
                    <Text className="detail-stat">📝 {item.contentPublished}篇</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default DataStatsPage;
