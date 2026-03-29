import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  Users,
  TrendingUp,
  Activity,
  Shield,
  Award,
  RefreshCw,
} from 'lucide-react-taro';

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

interface UserGrowth {
  date: string;
  count: number;
}

export default function AdminUserDataPage() {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, rolesRes, growthRes] = await Promise.all([
        Network.request({ url: '/api/admin/user-statistics' }),
        Network.request({ url: '/api/admin/role-distribution' }),
        Network.request({ url: '/api/admin/user-growth' }),
      ]);

      console.log('用户统计响应:', statsRes.data);
      console.log('角色分布响应:', rolesRes.data);
      console.log('用户增长响应:', growthRes.data);

      if (statsRes.statusCode === 200 && statsRes.data?.data) {
        setStatistics(statsRes.data.data);
      }
      if (rolesRes.statusCode === 200 && rolesRes.data?.data) {
        setRoleDistribution(rolesRes.data.data);
      }
      if (growthRes.statusCode === 200 && growthRes.data?.data) {
        setUserGrowth(growthRes.data.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statCards = [
    {
      icon: Users,
      label: '总用户数',
      value: statistics?.totalUsers || 0,
      color: '#38bdf8',
      bg: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
    },
    {
      icon: Activity,
      label: '活跃用户',
      value: statistics?.activeUsers || 0,
      color: '#4ade80',
      bg: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    },
    {
      icon: TrendingUp,
      label: '今日新增',
      value: statistics?.newUsersToday || 0,
      color: '#a855f7',
      bg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    },
    {
      icon: Award,
      label: '本周新增',
      value: statistics?.newUsersThisWeek || 0,
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
  ];

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '管理员',
      team_leader: '团队队长',
      staff: '员工',
      guest: '游客',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      admin: '#f87171',
      team_leader: '#f59e0b',
      staff: '#60a5fa',
      guest: '#94a3b8',
    };
    return colorMap[role] || '#71717a';
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>用户数据</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>用户统计与分析</Text>
          </View>
          <View onClick={loadData} style={{ padding: '8px' }}>
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

          {/* 角色分布 */}
          <View style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            padding: '16px',
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Shield size={18} color="#38bdf8" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>角色分布</Text>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {roleDistribution.map((item, index) => (
                <View key={index}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <View
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '4px',
                          backgroundColor: getRoleColor(item.role),
                        }}
                      />
                      <Text style={{ fontSize: '13px', color: '#71717a' }}>{getRoleLabel(item.role)}</Text>
                    </View>
                    <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{item.count}</Text>
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
                        width: `${item.percentage}%`,
                        height: '100%',
                        backgroundColor: getRoleColor(item.role),
                        borderRadius: '3px',
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 用户增长趋势 */}
          <View style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            padding: '16px',
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp size={18} color="#38bdf8" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>用户增长趋势</Text>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userGrowth.slice(-7).map((item, index) => (
                <View
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                  }}
                >
                  <Text style={{ fontSize: '13px', color: '#64748b', width: '80px' }}>
                    {item.date}
                  </Text>
                  <View style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <View
                      style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: '#1e3a5f',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.min((item.count / 20) * 100, 100)}%`,
                          height: '100%',
                          backgroundColor: '#38bdf8',
                          borderRadius: '2px',
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600', width: '40px', textAlign: 'right' }}>
                      +{item.count}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 月度统计 */}
          {statistics && (
            <View style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '16px',
            }}
            >
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>月度统计</Text>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>本月新增用户</Text>
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                  {statistics.newUsersThisMonth}
                </Text>
              </View>
            </View>
          )}

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
