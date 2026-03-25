import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
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
import '@/styles/pages.css';
import '@/styles/admin.css';

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
      color: '#3b82f6',
      bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    },
    {
      icon: Link2,
      label: '已共享',
      value: stats?.sharedLexicons || 0,
      color: '#22c55e',
      bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
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
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  ];

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <Text className="admin-title">共享统计</Text>
          <View
            style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#1a1a1d' }}
            onClick={loadStats}
          >
            <RefreshCw size={24} color={loading ? '#52525b' : '#f59e0b'} />
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {/* 核心统计卡片 */}
          <View className="stats-grid">
            {statCards.map((card, index) => (
              <View
                key={index}
                className="stat-card"
                style={{ background: card.bg, border: 'none' }}
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
          <View className="admin-card">
            <View className="admin-card-header">
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={24} color="#f59e0b" />
                <Text className="admin-card-title">共享率概览</Text>
              </View>
            </View>

            <View style={{ padding: '16px 0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text style={{ fontSize: '22px', color: '#71717a' }}>语料库共享率</Text>
                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#fafafa' }}>{getShareRate()}%</Text>
              </View>
              <View
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#27272a',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${getShareRate()}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)',
                    borderRadius: '4px',
                  }}
                />
              </View>
            </View>
          </View>

          {/* 共享范围分布 */}
          {stats?.shareScopeStats && (
            <View className="admin-card">
              <View className="admin-card-header">
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={24} color="#f59e0b" />
                  <Text className="admin-card-title">共享范围分布</Text>
                </View>
              </View>

              <View style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { key: 'custom', label: '指定用户', icon: Users, color: '#3b82f6' },
                  { key: 'all', label: '所有人', icon: Globe, color: '#22c55e' },
                  { key: 'department', label: '同部门', icon: Building2, color: '#a855f7' },
                ].map((item) => {
                  const count = stats.shareScopeStats[item.key as keyof typeof stats.shareScopeStats] || 0;
                  const percentage = stats.sharedLexicons > 0 ? Math.round((count / stats.sharedLexicons) * 100) : 0;

                  return (
                    <View key={item.key}>
                      <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <item.icon size={18} color={item.color} />
                          <Text style={{ fontSize: '22px', color: '#a1a1aa' }}>{item.label}</Text>
                        </View>
                        <Text style={{ fontSize: '22px', color: '#fafafa' }}>{count}</Text>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: '#27272a',
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
          <View className="admin-card">
            <View className="admin-card-header">
              <Text className="admin-card-title">快速操作</Text>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <View
                className="user-list-item"
                onClick={() => {
                  // 跳转到共享管理
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <Link2 size={24} color="#3b82f6" />
                  <Text style={{ fontSize: '26px', color: '#fafafa' }}>管理共享权限</Text>
                </View>
                <ChevronRight size={24} color="#52525b" />
              </View>

              <View
                className="user-list-item"
                onClick={() => {
                  // 跳转到语料库管理
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <FileText size={24} color="#22c55e" />
                  <Text style={{ fontSize: '26px', color: '#fafafa' }}>查看语料库</Text>
                </View>
                <ChevronRight size={24} color="#52525b" />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
