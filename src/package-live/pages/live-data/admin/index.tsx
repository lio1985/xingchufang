import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  RefreshCw,
  TrendingUp,
  Users,
  Eye,
  Heart,
  ShoppingCart,
  Video,
  Activity,
} from 'lucide-react-taro';

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
  exposureCount: number;
  enterRoomCount: number;
  onlinePeak: number;
  avgOnline: number;
  newFollowers: number;
  interactionCount: number;
  privateMessageCount: number;
  enterRoomRate: number;
}

export default function LiveDataAdminPage() {
  const [loading, setLoading] = useState(false);
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
  const [timeRange, setTimeRange] = useState<string>('30days');

  const fetchStats = async () => {
    try {
      const response = await Network.request({
        url: '/api/live-data/admin/stats',
        method: 'GET',
      });

      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    Taro.showLoading({ title: '加载中...' });
    await fetchStats();
    Taro.hideLoading();
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const statSections = [
    {
      title: '流量数据',
      icon: Eye,
      color: '#38bdf8',
      items: [
        { label: '直播场次', value: stats.totalStreams.toLocaleString() },
        { label: '曝光人数', value: `${(stats.exposureCount / 10000).toFixed(2)}万` },
        { label: '进入直播间', value: `${(stats.enterRoomCount / 10000).toFixed(2)}万` },
        { label: '进房率', value: `${stats.enterRoomRate.toFixed(1)}%` },
        { label: '在线峰值', value: stats.onlinePeak },
        { label: '平均在线', value: stats.avgOnline },
      ],
    },
    {
      title: '互动数据',
      icon: Heart,
      color: '#f87171',
      items: [
        { label: '互动人数', value: stats.interactionCount.toLocaleString() },
        { label: '私信人数', value: stats.privateMessageCount.toLocaleString() },
        { label: '新增粉丝', value: stats.newFollowers.toLocaleString() },
        { label: '互动率', value: `${stats.interactionRate.toFixed(1)}%` },
      ],
    },
    {
      title: '转化数据',
      icon: ShoppingCart,
      color: '#4ade80',
      items: [
        { label: '总GMV', value: `¥${(stats.totalGMV / 10000).toFixed(2)}万` },
        { label: '订单数', value: stats.totalOrders.toLocaleString() },
        { label: '人均观看', value: `${stats.avgWatchDuration}秒` },
        { label: '转化率', value: `${stats.conversionRate.toFixed(1)}%` },
        { label: '主播数', value: stats.totalUsers },
      ],
    },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '100px',
        background: 'linear-gradient(180deg, #0f1a2e 0%, #0a1628 100%)',
        borderBottom: '1px solid #1e3a5f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingBottom: '12px',
        zIndex: 100,
      }}
      >
        <View style={{ padding: '0 16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={22} color="#38bdf8" />
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <View
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(248, 113, 113, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Video size={18} color="#f87171" />
                </View>
                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>直播数据</Text>
              </View>
            </View>
            <View onClick={handleRefresh}>
              <RefreshCw size={22} color={loading ? '#64748b' : '#38bdf8'} />
            </View>
          </View>

          {/* 时间筛选 */}
          <View style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: '7days', label: '近7天' },
              { key: '30days', label: '近30天' },
              { key: '90days', label: '近90天' },
              { key: 'all', label: '全部' },
            ].map((tab) => (
              <View
                key={tab.key}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: timeRange === tab.key ? '#38bdf8' : '#1e293b',
                  border: timeRange === tab.key ? 'none' : '1px solid #1e3a5f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => setTimeRange(tab.key)}
              >
                <Text style={{ fontSize: '22px', fontWeight: '600', color: timeRange === tab.key ? '#000' : '#64748b' }}>{tab.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 100px)', marginTop: '100px' }}>
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 核心指标概览 */}
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <View style={{
              backgroundColor: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(56, 189, 248, 0.1) 100%)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              textAlign: 'center',
            }}
            >
              <TrendingUp size={24} color="#38bdf8" />
              <Text style={{ fontSize: '36px', fontWeight: '700', color: '#f1f5f9', display: 'block', marginTop: '8px' }}>{stats.totalStreams}</Text>
              <Text style={{ fontSize: '20px', color: '#94a3b8', marginTop: '4px' }}>直播场次</Text>
            </View>

            <View style={{
              backgroundColor: 'rgba(74, 222, 128, 0.15)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              textAlign: 'center',
            }}
            >
              <ShoppingCart size={24} color="#4ade80" />
              <Text style={{ fontSize: '36px', fontWeight: '700', color: '#f1f5f9', display: 'block', marginTop: '8px' }}>¥{(stats.totalGMV / 10000).toFixed(1)}万</Text>
              <Text style={{ fontSize: '20px', color: '#94a3b8', marginTop: '4px' }}>总GMV</Text>
            </View>

            <View style={{
              backgroundColor: 'rgba(248, 113, 113, 0.15)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              textAlign: 'center',
            }}
            >
              <Users size={24} color="#f87171" />
              <Text style={{ fontSize: '36px', fontWeight: '700', color: '#f1f5f9', display: 'block', marginTop: '8px' }}>{stats.totalUsers}</Text>
              <Text style={{ fontSize: '20px', color: '#94a3b8', marginTop: '4px' }}>主播数</Text>
            </View>
          </View>

          {/* 数据板块 */}
          {statSections.map((section, sectionIndex) => (
            <View
              key={sectionIndex}
              style={{
                backgroundColor: 'rgba(30, 58, 95, 0.3)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #1e3a5f',
              }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <View style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: `rgba(${section.color === '#38bdf8' ? '56, 189, 248' : section.color === '#f87171' ? '248, 113, 113' : '74, 222, 128'}, 0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <section.icon size={16} color={section.color} />
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>{section.title}</Text>
              </View>

              <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {section.items.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                  >
                    <Text style={{ fontSize: '20px', color: '#64748b' }}>{item.label}</Text>
                    <Text style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginTop: '4px' }}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* 更新时间 */}
          <View style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text style={{ fontSize: '22px', color: '#64748b' }}>
              最后更新: {new Date().toLocaleString('zh-CN')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
