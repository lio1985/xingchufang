import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import { Network } from '@/network';
import {
  Users,
  Crown,
  Medal,
  Award,
  ChevronRight,
  TrendingUp,
  Megaphone,
  ClipboardList,
  Target,
  ChartBarBig,
  MessageCircle,
  Phone,
  UserPlus,
  UserMinus,
  Search,
  X,
  Check,
} from 'lucide-react-taro';

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

interface AvailableUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  phone?: string;
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

interface QuickAction {
  id: string;
  icon: typeof Users;
  label: string;
  color: string;
  bgColor: string;
  path?: string;
  onClick?: () => void;
}

export default function MyTeam() {
  const [team, setTeam] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 添加成员相关状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);

  // 移除成员相关状态
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [removingMember, setRemovingMember] = useState(false);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  Taro.useDidShow(() => {
    fetchMyTeam();
  });

  const fetchMyTeam = async () => {
    setLoading(true);
    try {
      const teamRes = await Network.request({
        url: '/api/teams/my/team',
        method: 'GET',
      });
      console.log('[MyTeam] Team response:', teamRes);

      if (teamRes.data?.code === 200 && teamRes.data?.data) {
        setTeam(teamRes.data.data);

        const membersRes = await Network.request({
          url: '/api/teams/my/members',
          method: 'GET',
        });
        console.log('[MyTeam] Members response:', membersRes);
        if (membersRes.data?.code === 200) {
          setMembers(membersRes.data.data || []);
        }

        const statsRes = await Network.request({
          url: '/api/teams/my/statistics',
          method: 'GET',
        });
        console.log('[MyTeam] Stats response:', statsRes);
        if (statsRes.data?.code === 200 && statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
      }
    } catch (error) {
      console.error('[MyTeam] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (search?: string) => {
    try {
      const res = await Network.request({
        url: '/api/teams/available-users',
        method: 'GET',
        data: search ? { search } : {},
      });
      console.log('[MyTeam] Available users response:', res);
      if (res.data?.code === 200) {
        setAvailableUsers(res.data.data || []);
      }
    } catch (error) {
      console.error('[MyTeam] Fetch available users error:', error);
      Taro.showToast({ title: '获取用户列表失败', icon: 'none' });
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setSearchKeyword('');
    setSelectedUserId(null);
    fetchAvailableUsers();
  };

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    if (value.length >= 2 || value.length === 0) {
      fetchAvailableUsers(value);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !team) return;

    setAddingMember(true);
    try {
      const res = await Network.request({
        url: `/api/teams/${team.id}/members`,
        method: 'POST',
        data: { memberId: selectedUserId },
      });
      console.log('[MyTeam] Add member response:', res);

      if (res.data?.success || res.data?.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setShowAddModal(false);
        // 刷新成员列表
        fetchMyTeam();
      } else {
        Taro.showToast({ title: res.data?.message || '添加失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[MyTeam] Add member error:', error);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    } finally {
      setAddingMember(false);
    }
  };

  const handleOpenRemoveConfirm = (member: TeamMember) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !team) return;

    setRemovingMember(true);
    try {
      const res = await Network.request({
        url: `/api/teams/${team.id}/members/${memberToRemove.user_id}`,
        method: 'DELETE',
      });
      console.log('[MyTeam] Remove member response:', res);

      if (res.data?.success || res.data?.code === 200) {
        Taro.showToast({ title: '已移除', icon: 'success' });
        setShowRemoveConfirm(false);
        setMemberToRemove(null);
        fetchMyTeam();
      } else {
        Taro.showToast({ title: res.data?.message || '移除失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[MyTeam] Remove member error:', error);
      Taro.showToast({ title: '移除失败', icon: 'none' });
    } finally {
      setRemovingMember(false);
    }
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleCallAdmin = () => {
    Taro.showModal({
      title: '联系管理员',
      content: '请联系管理员将您添加到相应的销售团队',
      confirmText: '知道了',
      showCancel: false,
    });
  };

  const myInfo = members.find(m => m.user_id === Taro.getStorageSync('user')?.id);
  const isLeader = myInfo?.role === 'leader';

  const quickActions: QuickAction[] = [
    {
      id: 'announcement',
      icon: Megaphone,
      label: '团队公告',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      id: 'tasks',
      icon: ClipboardList,
      label: '任务分配',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
      onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    },
    {
      id: 'target',
      icon: Target,
      label: '业绩目标',
      color: '#4ade80',
      bgColor: 'rgba(74, 222, 128, 0.15)',
      path: '/pages/customer/sales-target',
    },
    {
      id: 'members',
      icon: Users,
      label: '成员管理',
      color: '#a78bfa',
      bgColor: 'rgba(167, 139, 250, 0.15)',
      onClick: isLeader ? handleOpenAddModal : () => Taro.showToast({ title: '仅队长可管理', icon: 'none' }),
    },
    {
      id: 'report',
      icon: ChartBarBig,
      label: '数据报告',
      color: '#f43f5e',
      bgColor: 'rgba(244, 63, 94, 0.15)',
      path: '/pages/data-stats/index',
    },
    {
      id: 'chat',
      icon: MessageCircle,
      label: '团队聊天',
      color: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      onClick: () => Taro.showToast({ title: '功能开发中', icon: 'none' }),
    },
  ];

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>加载中...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', padding: '20px' }}>
        <View style={{ padding: '48px 0 24px' }}>
          <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>我的团队</Text>
          <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginTop: '4px' }}>团队协作，高效获客</Text>
        </View>

        <View
          style={{
            backgroundColor: '#111827',
            borderRadius: '16px',
            border: '1px solid #1e3a5f',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '40px',
          }}
        >
          <View
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <Users size={40} color="#38bdf8" />
          </View>
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '8px', display: 'block' }}>尚未加入团队</Text>
          <Text style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', display: 'block', marginBottom: '24px' }}>
            您还没有加入任何团队{'\n'}请联系管理员添加您到相应的销售团队
          </Text>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              borderRadius: '24px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
            onClick={handleCallAdmin}
          >
            <Phone size={18} color="#38bdf8" />
            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#38bdf8' }}>联系管理员</Text>
          </View>
        </View>

        <View style={{ marginTop: '32px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '16px', display: 'block' }}>团队功能</Text>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { icon: Users, label: '成员管理', desc: '管理团队成员' },
              { icon: Target, label: '业绩目标', desc: '设定团队目标' },
              { icon: ChartBarBig, label: '数据分析', desc: '团队数据报表' },
              { icon: MessageCircle, label: '团队沟通', desc: '高效协作沟通' },
            ].map((item, index) => {
              const IconComp = item.icon;
              return (
                <View
                  key={index}
                  style={{
                    width: 'calc(50% - 6px)',
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    border: '1px solid #1e3a5f',
                    padding: '16px',
                  }}
                >
                  <View style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <IconComp size={18} color="#38bdf8" />
                  </View>
                  <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', display: 'block', marginBottom: '4px' }}>{item.label}</Text>
                  <Text style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{item.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

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

      <ScrollView scrollY style={{ flex: 1 }}>
        {/* 团队数据概览 */}
        {stats && (
          <View style={{ padding: '20px 20px 16px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>团队业绩概览</Text>
            <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px 8px', border: '1px solid #1e3a5f', textAlign: 'center' }}>
                <Text style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.memberCount}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>团队成员</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px 8px', border: '1px solid #1e3a5f', textAlign: 'center' }}>
                <Text style={{ fontSize: '22px', fontWeight: '700', color: '#10b981', display: 'block' }}>{stats.totalCustomers}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>客户总数</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px 8px', border: '1px solid #1e3a5f', textAlign: 'center' }}>
                <Text style={{ fontSize: '22px', fontWeight: '700', color: '#a855f7', display: 'block' }}>{stats.totalRecycleStores}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>回收门店</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px 8px', border: '1px solid #1e3a5f', textAlign: 'center' }}>
                <Text style={{ fontSize: '18px', fontWeight: '700', color: '#fbbf24', display: 'block' }}>{(stats.totalDealValue / 10000).toFixed(1)}万</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>成交总额</Text>
              </View>
            </View>
          </View>
        )}

        {/* 快捷功能入口 */}
        <View style={{ padding: '16px 20px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>快捷功能</Text>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px' }}>
            {quickActions.map((action) => {
              const IconComp = action.icon;
              return (
                <View
                  key={action.id}
                  style={{
                    width: 'calc(33.33% - 7px)',
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    border: '1px solid #1e3a5f',
                    padding: '14px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                  onClick={() => {
                    if (action.path) {
                      handleNav(action.path);
                    } else if (action.onClick) {
                      action.onClick();
                    }
                  }}
                >
                  <View
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: action.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <IconComp size={18} color={action.color} />
                  </View>
                  <Text style={{ fontSize: '12px', fontWeight: '500', color: '#ffffff', display: 'block', textAlign: 'center' }}>{action.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 成员排行榜 */}
        <View style={{ padding: '16px 20px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'block' }}>成员排行榜</Text>
            {isLeader && (
              <View
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: 'rgba(56, 189, 248, 0.15)', borderRadius: '16px' }}
                onClick={handleOpenAddModal}
              >
                <UserPlus size={14} color="#38bdf8" />
                <Text style={{ fontSize: '12px', color: '#38bdf8' }}>添加成员</Text>
              </View>
            )}
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

                      <View style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {member.user?.avatarUrl ? (
                          <Image src={member.user.avatarUrl} style={{ width: '40px', height: '40px', borderRadius: '50%' }} mode="aspectFill" />
                        ) : (
                          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                            {(member.user?.nickname || 'U').charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>

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

                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {memberStats && (
                        <View style={{ textAlign: 'right' }}>
                          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '2px', display: 'block' }}>
                            {memberStats.customerCount} 客户
                          </Text>
                          <Text style={{ fontSize: '12px', color: '#10b981', display: 'block' }}>
                            ¥{memberStats.recycleDealValue.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      
                      {/* 移除按钮：仅队长可见，且不能移除自己 */}
                      {isLeader && member.role !== 'leader' && (
                        <View
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(244, 63, 94, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onClick={() => handleOpenRemoveConfirm(member)}
                        >
                          <UserMinus size={16} color="#f43f5e" />
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* 团队动态 */}
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

      {/* 添加成员弹窗 */}
      {showAddModal && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#111827',
              borderRadius: '20px 20px 0 0',
              maxHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View style={{ padding: '20px', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>添加成员</Text>
              <View style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>
                <X size={18} color="#94a3b8" />
              </View>
            </View>

            {/* 搜索框 */}
            <View style={{ padding: '16px 20px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0a0f1a', borderRadius: '12px', padding: '12px 16px', border: '1px solid #1e3a5f' }}>
                <Search size={18} color="#64748b" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#ffffff' }}
                  placeholder="搜索用户名或手机号"
                  placeholderStyle="color: #64748b"
                  value={searchKeyword}
                  onInput={(e) => handleSearch(e.detail.value)}
                />
              </View>
            </View>

            {/* 用户列表 */}
            <ScrollView scrollY style={{ flex: 1, padding: '0 20px 20px' }}>
              {availableUsers.length === 0 ? (
                <View style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Text style={{ fontSize: '14px', color: '#64748b', display: 'block' }}>
                    {searchKeyword ? '未找到匹配的用户' : '暂无可添加的用户'}
                  </Text>
                </View>
              ) : (
                availableUsers.map((user) => (
                  <View
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      backgroundColor: selectedUserId === user.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      border: selectedUserId === user.id ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    }}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <View style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} style={{ width: '44px', height: '44px', borderRadius: '50%' }} mode="aspectFill" />
                      ) : (
                        <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                          {(user.nickname || 'U').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>{user.nickname}</Text>
                      {user.phone && <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>{user.phone}</Text>}
                    </View>
                    {selectedUserId === user.id && (
                      <View style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} color="#ffffff" />
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            {/* 底部按钮 */}
            <View style={{ padding: '16px 20px', borderTop: '1px solid #1e3a5f', display: 'flex', gap: '12px' }}>
              <View
                style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: '#1e3a5f', textAlign: 'center' }}
                onClick={() => setShowAddModal(false)}
              >
                <Text style={{ fontSize: '15px', color: '#94a3b8' }}>取消</Text>
              </View>
              <View
                style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: selectedUserId ? '#38bdf8' : '#1e3a5f', textAlign: 'center' }}
                onClick={handleAddMember}
              >
                <Text style={{ fontSize: '15px', color: selectedUserId ? '#ffffff' : '#64748b' }}>
                  {addingMember ? '添加中...' : '确认添加'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 移除成员确认弹窗 */}
      {showRemoveConfirm && memberToRemove && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowRemoveConfirm(false)}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#111827',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #1e3a5f',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '12px' }}>移除成员确认</Text>
            <Text style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              确定要将「{memberToRemove.user?.nickname || '该用户'}」移出团队吗？
            </Text>
            <Text style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '24px' }}>
              移除后该用户将无法访问团队数据
            </Text>
            <View style={{ display: 'flex', gap: '12px' }}>
              <View
                style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#1e3a5f', textAlign: 'center' }}
                onClick={() => setShowRemoveConfirm(false)}
              >
                <Text style={{ fontSize: '14px', color: '#94a3b8' }}>取消</Text>
              </View>
              <View
                style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#f43f5e', textAlign: 'center' }}
                onClick={handleRemoveMember}
              >
                <Text style={{ fontSize: '14px', color: '#ffffff' }}>
                  {removingMember ? '移除中...' : '确认移除'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
