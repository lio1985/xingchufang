import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Search,
  Users,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react-taro';

interface Team {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  leader?: {
    id: string;
    nickname: string;
    avatarUrl?: string;
  };
  members?: { count: number };
}

interface TeamListResponse {
  code: number;
  msg: string;
  data: {
    data: Team[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: '启用中', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  inactive: { label: '已禁用', color: 'text-zinc-500', bg: 'bg-zinc-500/20' },
};

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTeams = async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = reset ? 1 : page;
      const params: Record<string, string | number> = { page: currentPage, pageSize: 20 };
      if (keyword) params.keyword = keyword;

      const res = await Network.request<TeamListResponse>({
        url: '/api/teams',
        method: 'GET',
        data: params,
      });

      console.log('[TeamManagement] Fetch teams response:', res);

      if (res.data.code === 200) {
        const newTeams = res.data.data.data || [];
        setTeams(reset ? newTeams : [...teams, ...newTeams]);
        setHasMore(newTeams.length === 20);
        if (!reset) setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('[TeamManagement] Fetch teams error:', error);
      Taro.showToast({ title: '获取团队列表失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchTeams(true);
  };

  const handleDelete = (team: Team) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除团队"${team.name}"吗？此操作不可恢复。`,
      confirmColor: '#f87171',
      success: (res) => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${team.id}`,
            method: 'DELETE'
          }).then(() => {
            Taro.showToast({ title: '删除成功', icon: 'success' });
            fetchTeams(true);
          }).catch((err) => {
            console.error('[TeamManagement] Delete error:', err);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      },
    });
  };

  const handleToggleStatus = (team: Team) => {
    const newStatus = !team.is_active;
    const actionText = newStatus ? '启用' : '禁用';

    Taro.showModal({
      title: `确认${actionText}`,
      content: `确定要${actionText}团队"${team.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${team.id}`,
            method: 'PUT',
            data: { isActive: newStatus },
          }).then(() => {
            Taro.showToast({ title: `${actionText}成功`, icon: 'success' });
            fetchTeams(true);
          }).catch((err) => {
            console.error('[TeamManagement] Toggle status error:', err);
            Taro.showToast({ title: `${actionText}失败`, icon: 'none' });
          });
        }
      },
    });
  };

  const navigateToDetail = (teamId: string) => {
    Taro.navigateTo({ url: `/pages/admin/team-detail/index?id=${teamId}` });
  };

  const navigateToCreate = () => {
    Taro.navigateTo({ url: '/pages/admin/team-create/index' });
  };

  return (
    <View className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <View className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <View className="flex items-center justify-between px-4 py-3">
          <View className="flex items-center gap-3">
            <View
              className="p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/50 active:bg-zinc-700"
              onClick={() => Taro.navigateBack()}
            >
              <ArrowLeft size={20} color="#38bdf8" />
            </View>
            <View className="flex items-center gap-2">
              <View className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                <Users size={16} color="#38bdf8" />
              </View>
              <Text className="block text-lg font-semibold text-white">团队管理</Text>
            </View>
          </View>
          <View
            className="flex items-center gap-2 px-3 py-2 bg-amber-500 rounded-lg active:bg-amber-600"
            onClick={navigateToCreate}
          >
            <Plus size={16} color="#000" />
            <Text className="block text-sm text-black font-medium">新建团队</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-3">
          <View className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3 py-2 border border-zinc-700/50">
            <Search size={18} color="#71717a" />
            <Input
              className="flex-1 text-sm text-white bg-transparent"
              placeholder="搜索团队名称..."
              placeholderClass="text-zinc-500"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              onConfirm={handleSearch}
            />
            {keyword && (
              <View onClick={() => { setKeyword(''); handleSearch(); }}>
                <Text className="block text-xs text-amber-500">清除</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Team List */}
      <ScrollView
        className="flex-1"
        scrollY
        onScrollToLower={() => hasMore && fetchTeams()}
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <View className="p-4 space-y-3">
          {teams.map((team) => {
            const statusConfig = STATUS_MAP[team.is_active ? 'active' : 'inactive'];
            return (
              <View
                key={team.id}
                className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50"
              >
                <View className="flex items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex items-center gap-2 mb-1">
                      <Text className="block text-base font-semibold text-white">{team.name}</Text>
                      <View className={`px-2 py-0.5 rounded-full ${statusConfig.bg}`}>
                        <Text className={`block text-xs ${statusConfig.color}`}>{statusConfig.label}</Text>
                      </View>
                    </View>
                    {team.description && (
                      <Text className="block text-sm text-zinc-500 mt-1">{team.description}</Text>
                    )}
                  </View>
                </View>

                {/* Team Info */}
                <View className="flex items-center gap-4 mb-4">
                  <View className="flex items-center gap-2">
                    <Users size={14} color="#71717a" />
                    <Text className="block text-sm text-zinc-500">{team.members?.count || 0} 成员</Text>
                  </View>
                  {team.leader && (
                    <View className="flex items-center gap-2">
                      <Text className="block text-sm text-zinc-500">负责人:</Text>
                      <Text className="block text-sm text-amber-500">{team.leader.nickname}</Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex items-center gap-2 pt-3 border-t border-zinc-700/50">
                  <View
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-700/50 rounded-lg active:bg-zinc-700"
                    onClick={() => navigateToDetail(team.id)}
                  >
                    <Pencil size={14} color="#60a5fa" />
                    <Text className="block text-sm text-blue-400">详情</Text>
                  </View>
                  <View
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-700/50 rounded-lg active:bg-zinc-700"
                    onClick={() => handleToggleStatus(team)}
                  >
                    <Text className="block text-sm text-zinc-300">
                      {team.is_active ? '禁用' : '启用'}
                    </Text>
                  </View>
                  <View
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 rounded-lg active:bg-red-500/20 border border-red-500/20"
                    onClick={() => handleDelete(team)}
                  >
                    <Trash2 size={14} color="#f87171" />
                    <Text className="block text-sm text-red-400">删除</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {teams.length === 0 && !loading && (
            <View className="flex flex-col items-center justify-center py-12">
              <View className="w-16 h-16 bg-zinc-800/60 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700/50">
                <Users size={32} color="#71717a" />
              </View>
              <Text className="block text-zinc-500 mb-2">暂无团队</Text>
              <Text className="block text-sm text-zinc-600">点击下方按钮创建第一个团队</Text>
              <View
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-500 rounded-lg"
                onClick={navigateToCreate}
              >
                <Plus size={16} color="#000" />
                <Text className="block text-black font-medium">创建团队</Text>
              </View>
            </View>
          )}

          {loading && (
            <View className="flex items-center justify-center py-4">
              <Text className="block text-zinc-500">加载中...</Text>
            </View>
          )}

          {!hasMore && teams.length > 0 && (
            <View className="flex items-center justify-center py-4">
              <Text className="block text-sm text-zinc-600">没有更多数据了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
