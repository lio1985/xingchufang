import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

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
    chartData: []
  });

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = () => {
    setLoading(true);
    setTimeout(() => {
      // 模拟数据
      const mockData = generateMockData(period);
      setStats(mockData);
      setLoading(false);
    }, 500);
  };

  const generateMockData = (period: string) => {
    const baseRevenue = period === 'today' ? 1280 : period === 'week' ? 8960 : 38400;
    const baseOrders = period === 'today' ? 12 : period === 'week' ? 84 : 360;
    const baseCustomers = period === 'today' ? 8 : period === 'week' ? 56 : 240;

    return {
      totalRevenue: baseRevenue + Math.floor(Math.random() * 2000),
      totalOrders: baseOrders + Math.floor(Math.random() * 20),
      totalCustomers: baseCustomers + Math.floor(Math.random() * 15),
      contentCount: Math.floor(Math.random() * 30) + 10,
      trends: [
        { label: '营收', value: baseRevenue, change: 12.5, trend: 'up' },
        { label: '订单', value: baseOrders, change: 8.3, trend: 'up' },
        { label: '客户', value: baseCustomers, change: -2.1, trend: 'down' },
        { label: '内容', value: Math.floor(Math.random() * 30) + 10, change: 0, trend: 'stable' }
      ],
      chartData: Array.from({ length: period === 'today' ? 24 : 7 }, (_, i) => ({
        date: period === 'today' ? `${i}:00` : `周${['一', '二', '三', '四', '五', '六', '日'][i % 7]}`,
        revenue: Math.floor(Math.random() * 2000) + 500,
        orders: Math.floor(Math.random() * 15) + 5,
        customers: Math.floor(Math.random() * 10) + 3,
        contentPublished: Math.floor(Math.random() * 5) + 1
      }))
    };
  };

  const formatMoney = (amount: number) => {
    if (amount >= 10000) {
      return (amount / 10000).toFixed(1) + '万';
    }
    return amount.toLocaleString();
  };

  const getMaxRevenue = () => {
    return Math.max(...stats.chartData.map(d => d.revenue), 1);
  };

  const getBarHeight = (value: number) => {
    return (value / getMaxRevenue()) * 120;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '32px' }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <View style={{ padding: '8px' }} onClick={() => Taro.navigateBack()}>
            <Text style={{ fontSize: '32px', color: '#fafafa' }}>←</Text>
          </View>
          <Text style={{ fontSize: '36px', fontWeight: '700', color: '#fafafa' }}>数据统计</Text>
        </View>

        {/* 时间筛选 */}
        <View style={{ display: 'flex', gap: '12px' }}>
          {[
            { key: 'today', label: '今日' },
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' }
          ].map((item) => (
            <View
              key={item.key}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: period === item.key ? '#f59e0b' : '#141416',
                borderRadius: '12px',
                textAlign: 'center',
                border: period === item.key ? 'none' : '1px solid #27272a'
              }}
              onClick={() => setPeriod(item.key as typeof period)}
            >
              <Text style={{ 
                fontSize: '26px', 
                fontWeight: '500',
                color: period === item.key ? '#000' : '#a1a1aa'
              }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ textAlign: 'center', paddingTop: '200px' }}>
          <Text style={{ fontSize: '64px' }}>⏳</Text>
          <Text style={{ fontSize: '28px', color: '#71717a', marginTop: '24px' }}>加载中...</Text>
        </View>
      ) : (
        <ScrollView scrollY style={{ paddingTop: '32px' }}>
          {/* 核心指标卡片 */}
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View style={{ 
              backgroundColor: '#141416',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #27272a'
            }}>
              <Text style={{ fontSize: '24px', color: '#71717a', marginBottom: '24px', display: 'block' }}>
                📊 核心指标
              </Text>
              
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {/* 营收 */}
                <View style={{
                  width: 'calc(50% - 8px)',
                  padding: '24px',
                  backgroundColor: '#1a1a1d',
                  borderRadius: '16px',
                  marginBottom: '16px'
                }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Text style={{ fontSize: '24px' }}>💰</Text>
                    <Text style={{ fontSize: '24px', color: '#71717a' }}>营收</Text>
                  </View>
                  <Text style={{ fontSize: '40px', fontWeight: '700', color: '#f59e0b', display: 'block' }}>
                    ¥{formatMoney(stats.totalRevenue)}
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <Text style={{ fontSize: '20px', color: '#22c55e' }}>
                      {stats.trends[0].change > 0 ? '↑' : '↓'} {Math.abs(stats.trends[0].change)}%
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>较上期</Text>
                  </View>
                </View>

                {/* 订单 */}
                <View style={{
                  width: 'calc(50% - 8px)',
                  padding: '24px',
                  backgroundColor: '#1a1a1d',
                  borderRadius: '16px',
                  marginBottom: '16px'
                }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Text style={{ fontSize: '24px' }}>📦</Text>
                    <Text style={{ fontSize: '24px', color: '#71717a' }}>订单</Text>
                  </View>
                  <Text style={{ fontSize: '40px', fontWeight: '700', color: '#fafafa', display: 'block' }}>
                    {stats.totalOrders}
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <Text style={{ fontSize: '20px', color: '#22c55e' }}>
                      {stats.trends[1].change > 0 ? '↑' : '↓'} {Math.abs(stats.trends[1].change)}%
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>较上期</Text>
                  </View>
                </View>

                {/* 客户 */}
                <View style={{
                  width: 'calc(50% - 8px)',
                  padding: '24px',
                  backgroundColor: '#1a1a1d',
                  borderRadius: '16px'
                }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Text style={{ fontSize: '24px' }}>👥</Text>
                    <Text style={{ fontSize: '24px', color: '#71717a' }}>客户</Text>
                  </View>
                  <Text style={{ fontSize: '40px', fontWeight: '700', color: '#fafafa', display: 'block' }}>
                    {stats.totalCustomers}
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <Text style={{ fontSize: '20px', color: stats.trends[2].change > 0 ? '#22c55e' : '#ef4444' }}>
                      {stats.trends[2].change > 0 ? '↑' : '↓'} {Math.abs(stats.trends[2].change)}%
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>较上期</Text>
                  </View>
                </View>

                {/* 内容 */}
                <View style={{
                  width: 'calc(50% - 8px)',
                  padding: '24px',
                  backgroundColor: '#1a1a1d',
                  borderRadius: '16px'
                }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Text style={{ fontSize: '24px' }}>📝</Text>
                    <Text style={{ fontSize: '24px', color: '#71717a' }}>内容</Text>
                  </View>
                  <Text style={{ fontSize: '40px', fontWeight: '700', color: '#fafafa', display: 'block' }}>
                    {stats.contentCount}
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>已发布</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 营收趋势图 */}
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View style={{ 
              backgroundColor: '#141416',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #27272a'
            }}>
              <Text style={{ fontSize: '24px', color: '#71717a', marginBottom: '24px', display: 'block' }}>
                📈 营收趋势
              </Text>
              
              {/* 简化柱状图 */}
              <View style={{ 
                display: 'flex', 
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                height: '160px',
                paddingTop: '20px'
              }}>
                {stats.chartData.map((item, index) => (
                  <View key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <View 
                      style={{
                        width: '32px',
                        height: `${getBarHeight(item.revenue)}px`,
                        backgroundColor: index === stats.chartData.length - 1 
                          ? '#f59e0b' 
                          : 'rgba(245, 158, 11, 0.3)',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}
                    />
                    <Text style={{ fontSize: '18px', color: '#52525b' }}>{item.date}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 数据明细 */}
          <View style={{ padding: '0 32px', marginBottom: '32px' }}>
            <View style={{ 
              backgroundColor: '#141416',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #27272a'
            }}>
              <Text style={{ fontSize: '24px', color: '#71717a', marginBottom: '24px', display: 'block' }}>
                📋 数据明细
              </Text>
              
              {stats.chartData.map((item, index) => (
                <View 
                  key={index}
                  style={{
                    padding: '20px 0',
                    borderBottom: index < stats.chartData.length - 1 ? '1px solid #27272a' : 'none'
                  }}
                >
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: '26px', color: '#fafafa' }}>{item.date}</Text>
                    <Text style={{ fontSize: '24px', color: '#f59e0b', fontWeight: '600' }}>¥{item.revenue}</Text>
                  </View>
                  <View style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>📦 {item.orders}单</Text>
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>👥 {item.customers}人</Text>
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>📝 {item.contentPublished}篇</Text>
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
