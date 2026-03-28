import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import {
  ChevronLeft,
  Search,
  Users,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react-taro';
import '@/styles/pages.css';
import '@/styles/admin.css';

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
      success: res => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${team.id}`,
            method: 'DELETE',
          })
            .then(() => {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              fetchTeams(true);
            })
            .catch(err => {
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
      success: res => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${team.id}`,
            method: 'PUT',
            data: { isActive: newStatus },
          })
            .then(() => {
              Taro.showToast({ title: `${actionText}成功`, icon: 'success' });
              fetchTeams(true);
            })
            .catch(err => {
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
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={22} color="#38bdf8" />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color="#f59e0b" />
            </View>
            <Text className="admin-title">团队管理</Text>
          </View>
          <View
            style={{
              padding: '8px 16px',
              backgroundColor: '#38bdf8',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={navigateToCreate}
          >
            <Plus size={16} color="#000" />
            <Text style={{ fontSize: '22px', color: '#000', fontWeight: '600' }}>新建</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="search-box" style={{ marginTop: '16px' }}>
          <Search size={22} color="#71717a" />
          <Input
            className="search-input"
            placeholder="搜索团队名称..."
            placeholderStyle="color: #64748b"
            value={keyword}
            onInput={e => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
          {keyword && (
            <View onClick={() => setKeyword('')}>
              <X size={20} color="#71717a" />
            </View>
          )}
        </View>
      </View>

      {/* Team List */}
      <ScrollView
        className="flex-1"
        scrollY
        onScrollToLower={() => hasMore && fetchTeams()}
        style={{ height: 'calc(100vh - 160px)', marginTop: '160px' }}
      >
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {teams.length === 0 && !loading ? (
            <View className="empty-state">
              <Users size={80} color="#71717a" />
              <Text className="empty-title">暂无团队</Text>
              <Text className="empty-desc">点击下方按钮创建第一个团队</Text>
              <View
                className="action-btn-primary"
                style={{ marginTop: '20px' }}
                onClick={navigateToCreate}
              >
                <Plus size={24} color="#000" />
                <Text className="action-btn-primary-text" style={{ marginLeft: '8px' }}>
                  创建团队
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teams.map(team => {
                const isActive = team.is_active;
                return (
                  <View key={team.id} className="admin-card">
                    <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>
                            {team.name}
                          </Text>
                          <View
                            style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              backgroundColor: isActive ? 'rgba(74, 222, 128, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            }}
                          >
                            <Text style={{ fontSize: '20px', color: isActive ? '#4ade80' : '#64748b' }}>
                              {isActive ? '启用中' : '已禁用'}
                            </Text>
                          </View>
                        </View>
                        {team.description && (
                          <Text style={{ fontSize: '22px', color: '#64748b', marginTop: '6px' }}>
                            {team.description}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Team Info */}
                    <View style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} color="#71717a" />
                        <Text style={{ fontSize: '22px', color: '#71717a' }}>
                          {team.members?.count || 0} 成员
                        </Text>
                      </View>
                      {team.leader && (
                        <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Text style={{ fontSize: '22px', color: '#71717a' }}>负责人:</Text>
                          <Text style={{ fontSize: '22px', color: '#f59e0b' }}>{team.leader.nickname}</Text>
                        </View>
                      )}
                    </View>

                    {/* Actions */}
                    <View
                      style={{
                        display: 'flex',
                        gap: '10px',
                        paddingTop: '12px',
                        borderTop: '1px solid #1e3a5f',
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#1e293b',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                        onClick={() => navigateToDetail(team.id)}
                      >
                        <Pencil size={16} color="#60a5fa" />
                        <Text style={{ fontSize: '22px', color: '#60a5fa' }}>详情</Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#1e293b',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => handleToggleStatus(team)}
                      >
                        <Text style={{ fontSize: '22px', color: '#94a3b8' }}>
                          {team.is_active ? '禁用' : '启用'}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: 'rgba(248, 113, 113, 0.1)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                        onClick={() => handleDelete(team)}
                      >
                        <Trash2 size={16} color="#f87171" />
                        <Text style={{ fontSize: '22px', color: '#f87171' }}>删除</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {loading && (
            <View className="loading-state">
              <RefreshCw size={48} color="#38bdf8" />
              <Text className="loading-text">加载中...</Text>
            </View>
          )}

          {!loading && teams.length >= 20 && !hasMore && (
            <View style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text style={{ fontSize: '22px', color: '#64748b' }}>没有更多数据了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
