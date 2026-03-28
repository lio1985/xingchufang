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
  ChevronLeft,
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
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(180deg, #0f1a2e 0%, #0a1628 100%)',
        borderBottom: '1px solid #1e3a5f',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '12px',
        zIndex: 100,
      }}
      >
        <View style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 16px',
        }}
        >
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
                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Link2 size={18} color="#4ade80" />
            </View>
            <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>共享统计</Text>
          </View>
          
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
            onClick={loadStats}
          >
            <RefreshCw size={20} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 核心统计卡片 */}
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {statCards.map((card, index) => (
              <View
                key={index}
                style={{
                  borderRadius: '16px',
                  padding: '16px',
                  background: card.bg,
                  border: 'none',
                }}
              >
                <View
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <card.icon size={24} color="#fff" />
                </View>
                <Text style={{ fontSize: '40px', fontWeight: '700', color: '#fff', display: 'block' }}>
                  {card.value}
                </Text>
                <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                  {card.label}
                </Text>
              </View>
            ))}
          </View>

          {/* 共享率概览 */}
          <View style={{
            backgroundColor: 'rgba(30, 58, 95, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #1e3a5f',
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={24} color="#38bdf8" />
              <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>共享率概览</Text>
            </View>

            <View style={{ padding: '16px 0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text style={{ fontSize: '22px', color: '#71717a' }}>语料库共享率</Text>
                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>{getShareRate()}%</Text>
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
                    background: 'linear-gradient(90deg, #60a5fa 0%, #4ade80 100%)',
                    borderRadius: '4px',
                  }}
                />
              </View>
            </View>
          </View>

          {/* 共享范围分布 */}
          {stats?.shareScopeStats && (
            <View style={{
              backgroundColor: 'rgba(30, 58, 95, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #1e3a5f',
            }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Users size={24} color="#38bdf8" />
                <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>共享范围分布</Text>
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
                          <item.icon size={18} color={item.color} />
                          <Text style={{ fontSize: '22px', color: '#94a3b8' }}>{item.label}</Text>
                        </View>
                        <Text style={{ fontSize: '22px', color: '#f1f5f9' }}>{count}</Text>
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
            backgroundColor: 'rgba(30, 58, 95, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #1e3a5f',
          }}
          >
            <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>快速操作</Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                }}
                onClick={() => {
                  Taro.navigateTo({ url: '/pages/admin/lexicon/index' });
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <Link2 size={24} color="#60a5fa" />
                  <Text style={{ fontSize: '26px', color: '#f1f5f9' }}>管理共享权限</Text>
                </View>
                <ChevronRight size={24} color="#64748b" />
              </View>

              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                }}
                onClick={() => {
                  Taro.navigateTo({ url: '/pages/admin/lexicon/index' });
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <FileText size={24} color="#4ade80" />
                  <Text style={{ fontSize: '26px', color: '#f1f5f9' }}>查看语料库</Text>
                </View>
                <ChevronRight size={24} color="#64748b" />
              </View>
            </View>
          </View>

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
