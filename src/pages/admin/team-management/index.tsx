import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import { ChevronLeft, Users, UserPlus, Search, Trash2, Pencil } from 'lucide-react-taro';

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
  inactive: { label: '已禁用', color: 'text-gray-400', bg: 'bg-gray-500/20' },
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
      confirmColor: '#ef4444',
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
    <View className="min-h-screen bg-sky-50">
      {/* Header */}
      <View className="sticky top-0 z-50 bg-sky-50/95 backdrop-blur-md border-b border-slate-800">
        <View className="flex items-center justify-between px-4 py-3">
          <View className="flex items-center gap-3">
            <View
              className="p-2 bg-white rounded-lg active:bg-white transition-colors"
              onClick={() => Taro.navigateBack()}
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </View>
            <Text className="block text-lg font-semibold text-white">团队管理</Text>
          </View>
          <View
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg active:bg-blue-700 transition-colors"
            onClick={navigateToCreate}
          >
            <UserPlus size={16} className="text-white" />
            <Text className="block text-sm text-white">新建团队</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-3">
          <View className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
            <Search size={18} className="text-slate-500" />
            <Input
              className="flex-1 text-sm text-white bg-transparent"
              placeholder="搜索团队名称..."
              placeholderClass="text-slate-500"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              onConfirm={handleSearch}
            />
            {keyword && (
              <View onClick={() => { setKeyword(''); handleSearch(); }}>
                <Text className="block text-xs text-slate-500">清除</Text>
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
                className="bg-sky-50 rounded-xl p-4 border border-slate-800"
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
                      <Text className="block text-sm text-slate-500 mt-1">{team.description}</Text>
                    )}
                  </View>
                </View>

                {/* Team Info */}
                <View className="flex items-center gap-4 mb-4">
                  <View className="flex items-center gap-2">
                    <Users size={14} className="text-slate-500" />
                    <Text className="block text-sm text-slate-500">{team.members?.count || 0} 成员</Text>
                  </View>
                  {team.leader && (
                    <View className="flex items-center gap-2">
                      <Text className="block text-sm text-slate-500">负责人:</Text>
                      <Text className="block text-sm text-sky-600">{team.leader.nickname}</Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <View
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white rounded-lg active:bg-white transition-colors"
                    onClick={() => navigateToDetail(team.id)}
                  >
                    <Pencil size={14} className="text-sky-600" />
                    <Text className="block text-sm text-sky-600">详情</Text>
                  </View>
                  <View
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white rounded-lg active:bg-white transition-colors"
                    onClick={() => handleToggleStatus(team)}
                  >
                    <Text className="block text-sm text-slate-600">
                      {team.is_active ? '禁用' : '启用'}
                    </Text>
                  </View>
                  <View
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 rounded-lg active:bg-red-500/30 transition-colors"
                    onClick={() => handleDelete(team)}
                  >
                    <Trash2 size={14} className="text-red-400" />
                    <Text className="block text-sm text-red-400">删除</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {teams.length === 0 && !loading && (
            <View className="flex flex-col items-center justify-center py-12">
              <Users size={48} className="text-slate-600 mb-4" />
              <Text className="block text-slate-500 mb-2">暂无团队</Text>
              <Text className="block text-sm text-slate-500">点击下方按钮创建第一个团队</Text>
              <View
                className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
                onClick={navigateToCreate}
              >
                <Text className="block text-white">创建团队</Text>
              </View>
            </View>
          )}

          {loading && (
            <View className="flex items-center justify-center py-4">
              <Text className="block text-slate-500">加载中...</Text>
            </View>
          )}

          {!hasMore && teams.length > 0 && (
            <View className="flex items-center justify-center py-4">
              <Text className="block text-sm text-slate-500">没有更多数据了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
