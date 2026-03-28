import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  ChevronLeft,
  Radio,
  Upload,
  ChartBar,
  ChartArea,
  TrendingUp,
  Eye,
  Heart,
  ShoppingCart,
  Clock,
  RefreshCw,
  FileUp,
  ImagePlus,
  ClipboardList,
} from 'lucide-react-taro';

interface LiveStats {
  totalStreams: number;
  totalGMV: number;
  totalOrders: number;
  totalViews: number;
  avgOnline: number;
  newFollowers: number;
  interactionRate: number;
  conversionRate: number;
}

interface RecentStream {
  id: string;
  title: string;
  startTime: string;
  totalViews: number;
  gmv: number;
  ordersCount: number;
  durationSeconds: number;
}

export default function LiveDataPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'stats' | 'analysis'>('stats');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [recentStreams, setRecentStreams] = useState<RecentStream[]>([]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/live-data/dashboard',
        method: 'GET',
      });

      if (res.data?.success && res.data.data) {
        setStats(res.data.data.stats);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentStreams = async () => {
    try {
      const res = await Network.request({
        url: '/api/live-data/list',
        method: 'GET',
        data: { page: 1, limit: 5 },
      });

      if (res.data?.success && res.data.data) {
        setRecentStreams(res.data.data.list || []);
      }
    } catch (error) {
      console.error('加载直播列表失败:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadRecentStreams();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([loadStats(), loadRecentStreams()]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}小时${minutes}分` : `${minutes}分钟`;
  };

  const renderUploadTab = () => (
    <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>上传数据</Text>

      {/* 上传方式卡片 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #1e3a5f',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={() => Taro.navigateTo({ url: '/pages/live-data/import' })}
      >
        <View
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileUp size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>手动填写</Text>
          <Text style={{ fontSize: '22px', color: '#64748b', marginTop: '4px' }}>逐条输入直播数据</Text>
        </View>
        <Text style={{ fontSize: '24px' }}>→</Text>
      </View>

      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #1e3a5f',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={() => Taro.navigateTo({ url: '/pages/live-data/import?method=excel' })}
      >
        <View
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Upload size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>Excel导入</Text>
          <Text style={{ fontSize: '22px', color: '#64748b', marginTop: '4px' }}>批量上传数据表格</Text>
        </View>
        <Text style={{ fontSize: '24px' }}>→</Text>
      </View>

      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #1e3a5f',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={() => Taro.navigateTo({ url: '/pages/live-data/import?method=screenshot' })}
      >
        <View
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImagePlus size={28} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>截图识别</Text>
          <Text style={{ fontSize: '22px', color: '#64748b', marginTop: '4px' }}>识别复盘截图信息</Text>
        </View>
        <Text style={{ fontSize: '24px' }}>→</Text>
      </View>

      {/* 数据模板下载 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ClipboardList size={20} color="#38bdf8" />
          <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>数据模板</Text>
        </View>
        <Text style={{ fontSize: '22px', color: '#64748b' }}>
          下载Excel模板，按格式填写后上传
        </Text>
      </View>
    </View>
  );

  const renderStatsTab = () => (
    <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 核心指标 */}
      <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { icon: Radio, label: '直播场次', value: stats?.totalStreams || 0, color: '#f43f5e' },
          { icon: ShoppingCart, label: '总GMV', value: `¥${((stats?.totalGMV || 0) / 10000).toFixed(1)}万`, color: '#4ade80' },
          { icon: Eye, label: '总观看', value: stats?.totalViews || 0, color: '#60a5fa' },
          { icon: Heart, label: '新增粉丝', value: stats?.newFollowers || 0, color: '#f87171' },
        ].map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: 'rgba(30, 58, 95, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #1e3a5f',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <item.icon size={16} color={item.color} />
              <Text style={{ fontSize: '22px', color: '#94a3b8' }}>{item.label}</Text>
            </View>
            <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* 转化指标 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
      >
        <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>转化指标</Text>

        <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <View>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ fontSize: '22px', color: '#94a3b8' }}>互动率</Text>
              <Text style={{ fontSize: '22px', color: '#f1f5f9' }}>{(stats?.interactionRate || 0).toFixed(1)}%</Text>
            </View>
            <View style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#1e3a5f', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(stats?.interactionRate || 0, 100)}%`, height: '100%', backgroundColor: '#f43f5e', borderRadius: '3px' }} />
            </View>
          </View>

          <View>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ fontSize: '22px', color: '#94a3b8' }}>转化率</Text>
              <Text style={{ fontSize: '22px', color: '#f1f5f9' }}>{(stats?.conversionRate || 0).toFixed(1)}%</Text>
            </View>
            <View style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#1e3a5f', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(stats?.conversionRate || 0, 100)}%`, height: '100%', backgroundColor: '#4ade80', borderRadius: '3px' }} />
            </View>
          </View>
        </View>
      </View>

      {/* 最近直播 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>最近直播</Text>
          <Text
            style={{ fontSize: '22px', color: '#f43f5e' }}
            onClick={() => Taro.navigateTo({ url: '/pages/live-data/list' })}
          >
            查看全部
          </Text>
        </View>

        {recentStreams.length > 0 ? (
          recentStreams.map((stream) => (
            <View
              key={stream.id}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '8px',
              }}
              onClick={() => Taro.navigateTo({ url: `/pages/live-data/detail?id=${stream.id}` })}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9' }}>{stream.title}</Text>
                <Text style={{ fontSize: '20px', color: '#64748b' }}>{formatDate(stream.startTime)}</Text>
              </View>
              <View style={{ display: 'flex', gap: '16px' }}>
                <Text style={{ fontSize: '20px', color: '#94a3b8' }}>观看: {stream.totalViews}</Text>
                <Text style={{ fontSize: '20px', color: '#4ade80' }}>GMV: ¥{(stream.gmv / 100).toFixed(0)}</Text>
                <Text style={{ fontSize: '20px', color: '#64748b' }}>{formatDuration(stream.durationSeconds)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: '20px 0', textAlign: 'center' }}>
            <Text style={{ fontSize: '22px', color: '#64748b' }}>暂无直播数据</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderAnalysisTab = () => (
    <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>数据分析</Text>

      {/* AI 分析功能 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #1e3a5f',
        }}
        onClick={() => Taro.navigateTo({ url: '/pages/live-data/analysis' })}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <View
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChartArea size={28} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>AI 复盘分析</Text>
            <Text style={{ fontSize: '22px', color: '#64748b', marginTop: '4px' }}>深度分析直播数据，输出专业报告</Text>
          </View>
        </View>
      </View>

      {/* 数据对比 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ChartBar size={20} color="#38bdf8" />
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>数据对比</Text>
        </View>

        <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: '24px', color: '#f1f5f9' }}>本场 vs 上场</Text>
            <Text style={{ fontSize: '20px', color: '#f43f5e' }}>进入对比</Text>
          </View>

          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: '24px', color: '#f1f5f9' }}>本周 vs 上周</Text>
            <Text style={{ fontSize: '20px', color: '#f43f5e' }}>进入对比</Text>
          </View>
        </View>
      </View>

      {/* 趋势分析 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <TrendingUp size={20} color="#38bdf8" />
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>趋势分析</Text>
        </View>

        <Text style={{ fontSize: '22px', color: '#64748b' }}>
          查看GMV、观看人数、转化率等关键指标的历史趋势
        </Text>
      </View>

      {/* 时段分析 */}
      <View
        style={{
          backgroundColor: 'rgba(30, 58, 95, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #1e3a5f',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock size={20} color="#38bdf8" />
          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>时段分析</Text>
        </View>

        <Text style={{ fontSize: '22px', color: '#64748b' }}>
          分析不同时段的直播表现，找到最佳开播时间
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '130px',
          background: 'linear-gradient(180deg, #0f1a2e 0%, #0a1628 100%)',
          borderBottom: '1px solid #1e3a5f',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: '12px',
          zIndex: 100,
        }}
      >
        <View style={{ padding: '0 16px 12px' }}>
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
                onClick={() => Taro.navigateBack()}
              >
                <ChevronLeft size={22} color="#38bdf8" />
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <View
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Radio size={18} color="#f43f5e" />
                </View>
                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>直播数据</Text>
              </View>
            </View>
            <View onClick={handleRefresh}>
              <RefreshCw size={22} color={loading ? '#64748b' : '#38bdf8'} />
            </View>
          </View>

          {/* Tab 切换 */}
          <View style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'upload', label: '上传数据', icon: Upload },
              { key: 'stats', label: '数据统计', icon: ChartBar },
              { key: 'analysis', label: '数据分析', icon: ChartArea },
            ].map((tab) => (
              <View
                key={tab.key}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === tab.key ? '#f43f5e' : '#1e293b',
                  border: activeTab === tab.key ? 'none' : '1px solid #1e3a5f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                <tab.icon size={16} color={activeTab === tab.key ? '#fff' : '#71717a'} />
                <Text style={{ fontSize: '22px', fontWeight: '600', color: activeTab === tab.key ? '#fff' : '#64748b' }}>{tab.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 130px)', marginTop: '130px' }}>
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        <View style={{ height: '20px' }} />
      </ScrollView>
    </View>
  );
}
