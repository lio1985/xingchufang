import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  RefreshCw,
  FileText,
  Link2,
  Globe,
  Activity,
  TrendingUp,
  Users,
  Building2,
  ChevronRight,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface ShareStats {
  totalLexicons: number;
  sharedLexicons: number;
  globalShared: number;
  recentShareActions: number;
  shareScopeStats: {
    custom?: number;
    all?: number;
    department?: number;
  };
}

export default function AdminShareStatsPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ShareStats | null>(null);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/admin/share/stats',
      });

      console.log('共享统计响应:', res.data);

      if (res.statusCode === 200 && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getShareRate = () => {
    if (!stats || stats.totalLexicons === 0) return 0;
    return Math.round((stats.sharedLexicons / stats.totalLexicons) * 100);
  };

  const statCards = [
    {
      icon: FileText,
      label: '总语料库',
      value: stats?.totalLexicons || 0,
      color: '#60a5fa',
      bg: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
    },
    {
      icon: Link2,
      label: '已共享',
      value: stats?.sharedLexicons || 0,
      color: '#4ade80',
      bg: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
    },
    {
      icon: Globe,
      label: '全局共享',
      value: stats?.globalShared || 0,
      color: '#a855f7',
      bg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    },
    {
      icon: Activity,
      label: '近7天操作',
      value: stats?.recentShareActions || 0,
      color: '#38bdf8',
      bg: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
    },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>共享统计</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>语料库共享分析</Text>
          </View>
          <View onClick={loadStats} style={{ padding: '8px' }}>
            <RefreshCw size={20} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 120px)' }}>
        <View style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 核心统计卡片 */}
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {statCards.map((card, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <View style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={20} color={card.color} />
                  </View>
                </View>
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', textAlign: 'center' }}>{card.value}</Text>
                <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', textAlign: 'center', marginTop: '4px' }}>{card.label}</Text>
              </View>
            ))}
          </View>

          {/* 共享率概览 */}
          <View style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            padding: '16px',
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={18} color="#38bdf8" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>共享率概览</Text>
            </View>

            <View style={{ padding: '16px 0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>语料库共享率</Text>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>{getShareRate()}%</Text>
              </View>
              <View
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#1e3a5f',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${getShareRate()}%`,
                    height: '100%',
                    backgroundColor: '#38bdf8',
                    borderRadius: '4px',
                  }}
                />
              </View>
            </View>
          </View>

          {/* 共享范围分布 */}
          {stats?.shareScopeStats && (
            <View style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '16px',
            }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Users size={18} color="#38bdf8" />
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>共享范围分布</Text>
              </View>

              <View style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { key: 'custom', label: '指定用户', icon: Users, color: '#60a5fa' },
                  { key: 'all', label: '所有人', icon: Globe, color: '#4ade80' },
                  { key: 'department', label: '同部门', icon: Building2, color: '#a855f7' },
                ].map((item) => {
                  const count = stats.shareScopeStats[item.key as keyof typeof stats.shareScopeStats] || 0;
                  const percentage = stats.sharedLexicons > 0 ? Math.round((count / stats.sharedLexicons) * 100) : 0;

                  return (
                    <View key={item.key}>
                      <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <item.icon size={16} color={item.color} />
                          <Text style={{ fontSize: '13px', color: '#71717a' }}>{item.label}</Text>
                        </View>
                        <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{count}</Text>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: '#1e3a5f',
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: item.color,
                            borderRadius: '3px',
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 快速操作 */}
          <View style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            padding: '16px',
          }}
          >
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>快速操作</Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                }}
                onClick={() => {
                  Taro.navigateTo({ url: '/package-admin/pages/admin/lexicon/index' });
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <Link2 size={20} color="#60a5fa" />
                  <Text style={{ fontSize: '14px', color: '#f1f5f9' }}>管理共享权限</Text>
                </View>
                <ChevronRight size={18} color="#64748b" />
              </View>

              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                }}
                onClick={() => {
                  Taro.navigateTo({ url: '/package-admin/pages/admin/lexicon/index' });
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <FileText size={20} color="#4ade80" />
                  <Text style={{ fontSize: '14px', color: '#f1f5f9' }}>查看语料库</Text>
                </View>
                <ChevronRight size={18} color="#64748b" />
              </View>
            </View>
          </View>

          {/* 更新时间 */}
          <View style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text style={{ fontSize: '13px', color: '#64748b' }}>
              最后更新: {new Date().toLocaleString('zh-CN')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
