import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';

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
      <View className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Text className="block text-slate-400">加载中...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Text>👤</Text>
        <Text className="block text-xl text-white font-semibold mb-2">尚未加入团队</Text>
        <Text className="block text-sm text-slate-400 text-center mb-6">
          您还没有加入任何团队，请联系管理员添加您到相应的销售团队
        </Text>
      </View>
    );
  }

  const myInfo = members.find(m => m.user_id === Taro.getStorageSync('userInfo')?.id);
  const isLeader = myInfo?.role === 'leader';

  return (
    <View className="min-h-screen bg-slate-900">
      {/* Header */}
      <View className="bg-gradient-to-br from-slate-900 to-sky-50 px-4 py-8">
        <View className="flex items-center justify-between mb-4">
          <View>
            <Text className="block text-sm text-blue-400 mb-1">我的团队</Text>
            <Text className="block text-2xl font-bold text-white">{team.name}</Text>
          </View>
          {isLeader && (
            <View className="flex items-center gap-1 px-3 py-1 bg-yellow-500/30 rounded-full">
              <Text>👑</Text>
              <Text className="block text-xs text-yellow-300">负责人</Text>
            </View>
          )}
        </View>
        {team.description && (
          <Text className="block text-sm text-blue-100">{team.description}</Text>
        )}
      </View>

      <ScrollView className="flex-1" scrollY style={{ height: 'calc(100vh - 160px)' }}>
        {/* Stats */}
        {stats && (
          <View className="px-4 py-4">
            <Text className="block text-base font-semibold text-white mb-3">团队业绩</Text>
            <View className="grid grid-cols-2 gap-3">
              <View className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <View className="flex items-center gap-2 mb-2">
                  <Text>👤</Text>
                  <Text className="block text-sm text-slate-400">团队成员</Text>
                </View>
                <Text className="block text-2xl font-bold text-white">{stats.memberCount}</Text>
              </View>
              <View className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <View className="flex items-center gap-2 mb-2">
                  <Text>@</Text>
                  <Text className="block text-sm text-slate-400">客户总数</Text>
                </View>
                <Text className="block text-2xl font-bold text-white">{stats.totalCustomers}</Text>
              </View>
              <View className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <View className="flex items-center gap-2 mb-2">
                  <Text>^</Text>
                  <Text className="block text-sm text-slate-400">回收门店</Text>
                </View>
                <Text className="block text-2xl font-bold text-white">{stats.totalRecycleStores}</Text>
              </View>
              <View className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <View className="flex items-center gap-2 mb-2">
                  <Text>💵</Text>
                  <Text className="block text-sm text-slate-400">成交总额</Text>
                </View>
                <Text className="block text-2xl font-bold text-white">¥{(stats.totalDealValue / 10000).toFixed(1)}万</Text>
              </View>
            </View>
          </View>
        )}

        {/* Members */}
        <View className="px-4 pb-4">
          <Text className="block text-base font-semibold text-white mb-3">团队成员</Text>
          <View className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {members.map((member, index) => (
              <View
                key={member.id}
                className="flex items-center justify-between px-4 py-3 border-b border-slate-800 last:border-b-0"
              >
                <View className="flex items-center gap-3">
                  <View className="relative">
                    <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Text className="block text-white font-semibold">
                        {(member.user?.nickname || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    {index < 3 && stats && (
                      <View
                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-yellow-500 text-yellow-950'
                            : index === 1
                              ? 'bg-gray-400 text-gray-900'
                              : 'bg-orange-600 text-white'
                        }`}
                      >
                        {index + 1}
                      </View>
                    )}
                  </View>
                  <View>
                    <Text className="block text-white font-medium">{member.user?.nickname || '未知用户'}</Text>
                    <View className="flex items-center gap-2 mt-0.5">
                      {member.role === 'leader' ? (
                        <View className="flex items-center gap-1">
                          <Text>👑</Text>
                          <Text className="block text-xs text-yellow-400">负责人</Text>
                        </View>
                      ) : (
                        <Text className="block text-xs text-slate-400">成员</Text>
                      )}
                    </View>
                  </View>
                </View>
                {stats?.memberRanking.find(r => r.userId === member.user_id) && (
                  <View className="text-right">
                    <Text className="block text-sm text-white font-medium">
                      {stats.memberRanking.find(r => r.userId === member.user_id)?.customerCount || 0} 客户
                    </Text>
                    <Text className="block text-xs text-emerald-400">
                      ¥{(stats.memberRanking.find(r => r.userId === member.user_id)?.recycleDealValue || 0).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {members.length === 0 && (
              <View className="flex flex-col items-center justify-center py-8">
                <Text>👤</Text>
                <Text className="block text-slate-400">暂无成员</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
