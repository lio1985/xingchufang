import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import { Network } from '@/network';
import { Users, UserCheck, Store, DollarSign, Crown, Medal, Award, ChevronRight, TrendingUp } from 'lucide-react-taro';

interface TeamMember {
  id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
  user?: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };
}

interface TeamStats {
  teamId: string;
  teamName: string;
  memberCount: number;
  totalCustomers: number;
  activeCustomers: number;
  totalRecycleStores: number;
  totalDealValue: number;
  memberRanking: {
    userId: string;
    name: string;
    role: string;
    customerCount: number;
    recycleDealValue: number;
    contributionRate: number;
  }[];
}

export default function MyTeam() {
  const [team, setTeam] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  const fetchMyTeam = async () => {
    setLoading(true);
    try {
      // 获取我的团队
      const teamRes = await Network.request({
        url: '/api/teams/my/team',
        method: 'GET',
      });
      console.log('[MyTeam] Team response:', teamRes);

      if (teamRes.data.code === 200 && teamRes.data.data) {
        setTeam(teamRes.data.data);

        // 获取团队成员
        const membersRes = await Network.request({
          url: '/api/teams/my/members',
          method: 'GET',
        });
        console.log('[MyTeam] Members response:', membersRes);
        if (membersRes.data.code === 200) {
          setMembers(membersRes.data.data || []);
        }

        // 获取团队统计
        const statsRes = await Network.request({
          url: '/api/teams/my/statistics',
          method: 'GET',
        });
        console.log('[MyTeam] Stats response:', statsRes);
        if (statsRes.data.code === 200 && statsRes.data.data) {
          setStats(statsRes.data.data);
        }
      }
    } catch (error) {
      console.error('[MyTeam] Fetch error:', error);
      Taro.showToast({ title: '获取团队信息失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>加载中...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <View style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid #1e3a5f' }}>
          <Users size={40} color="#38bdf8" />
        </View>
        <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', display: 'block' }}>尚未加入团队</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', display: 'block', marginBottom: '24px' }}>
          您还没有加入任何团队{'\n'}请联系管理员添加您到相应的销售团队
        </Text>
      </View>
    );
  }

  const myInfo = members.find(m => m.user_id === Taro.getStorageSync('userInfo')?.id);
  const isLeader = myInfo?.role === 'leader';

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 24px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0a0f1a 100%)' }}>
        <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '13px', color: '#60a5fa', marginBottom: '4px', display: 'block' }}>我的团队</Text>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '6px', display: 'block' }}>{team.name}</Text>
            {team.description && (
              <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block' }}>{team.description}</Text>
            )}
          </View>
          {isLeader && (
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: 'rgba(251, 191, 36, 0.15)', borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <Crown size={14} color="#fbbf24" />
              <Text style={{ fontSize: '12px', fontWeight: '500', color: '#fbbf24' }}>负责人</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 200px)' }}>
        {/* Stats Cards */}
        {stats && (
          <View style={{ padding: '20px 20px 16px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>团队业绩概览</Text>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <View style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '16px', border: '1px solid #1e3a5f' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} color="#60a5fa" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>团队成员</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.memberCount}</Text>
              </View>

              <View style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '16px', border: '1px solid #1e3a5f' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={16} color="#10b981" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>客户总数</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.totalCustomers}</Text>
              </View>

              <View style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '16px', border: '1px solid #1e3a5f' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={16} color="#a855f7" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>回收门店</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.totalRecycleStores}</Text>
              </View>

              <View style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '16px', border: '1px solid #1e3a5f' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(251, 191, 36, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={16} color="#fbbf24" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>成交总额</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>¥{(stats.totalDealValue / 10000).toFixed(1)}万</Text>
              </View>
            </View>
          </View>
        )}

        {/* Member Ranking */}
        <View style={{ padding: '16px 20px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'block' }}>成员排行榜</Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} color="#38bdf8" />
              <Text style={{ fontSize: '12px', color: '#38bdf8' }}>本月</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', overflow: 'hidden' }}>
            {members.length === 0 ? (
              <View style={{ padding: '40px 20px', textAlign: 'center' }}>
                <View style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Users size={28} color="#64748b" />
                </View>
                <Text style={{ fontSize: '14px', color: '#71717a', display: 'block' }}>暂无成员</Text>
              </View>
            ) : (
              members.map((member, index) => {
                const memberStats = stats?.memberRanking.find(r => r.userId === member.user_id);
                const isTopThree = index < 3;
                
                return (
                  <View
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderBottom: index < members.length - 1 ? '1px solid #1e3a5f' : 'none',
                      backgroundColor: isTopThree && memberStats ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {/* Rank Badge */}
                      <View style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {index === 0 ? (
                          <View style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Medal size={16} color="#0a0f1a" />
                          </View>
                        ) : index === 1 ? (
                          <View style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={16} color="#0a0f1a" />
                          </View>
                        ) : index === 2 ? (
                          <View style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#cd7c32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={16} color="#0a0f1a" />
                          </View>
                        ) : (
                          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{index + 1}</Text>
                        )}
                      </View>

                      {/* Avatar */}
                      <View style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {member.user?.avatarUrl ? (
                          <Image src={member.user.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '50%' }} mode="aspectFill" />
                        ) : (
                          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                            {(member.user?.nickname || 'U').charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>

                      {/* Info */}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '2px', display: 'block' }}>
                          {member.user?.nickname || '未知用户'}
                        </Text>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {member.role === 'leader' ? (
                            <View style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', backgroundColor: 'rgba(251, 191, 36, 0.15)', borderRadius: '4px' }}>
                              <Crown size={10} color="#fbbf24" />
                              <Text style={{ fontSize: '11px', fontWeight: '500', color: '#fbbf24' }}>负责人</Text>
                            </View>
                          ) : (
                            <Text style={{ fontSize: '12px', color: '#64748b' }}>团队成员</Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Stats */}
                    {memberStats && (
                      <View style={{ textAlign: 'right', marginLeft: '12px' }}>
                        <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '2px', display: 'block' }}>
                          {memberStats.customerCount} 客户
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#10b981', display: 'block' }}>
                          ¥{memberStats.recycleDealValue.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Team Activity */}
        <View style={{ padding: '16px 20px 24px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>团队动态</Text>
          
          <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', padding: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #1e3a5f' }}>
              <View style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={16} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block' }}>本月业绩提升</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>团队总成交额较上月增长 23%</Text>
              </View>
              <ChevronRight size={16} color="#64748b" />
            </View>

            <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <View style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={16} color="#60a5fa" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '4px', display: 'block' }}>新成员加入</Text>
                <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>欢迎新成员加入团队</Text>
              </View>
              <ChevronRight size={16} color="#64748b" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
