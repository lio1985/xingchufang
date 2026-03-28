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

      const res = await Network.request({
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
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '160px',
        background: 'linear-gradient(180deg, #0f1a2e 0%, #0a1628 100%)',
        borderBottom: '1px solid #1e3a5f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingBottom: '12px',
        zIndex: 100,
      }}
      >
        <View style={{ padding: '0 16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={18} color="#f59e0b" />
                </View>
                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>团队管理</Text>
              </View>
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

          {/* 搜索栏 */}
          <View style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'rgba(30, 58, 95, 0.3)',
            borderRadius: '12px',
            border: '1px solid #1e3a5f',
          }}
          >
            <Search size={20} color="#71717a" />
            <Input
              style={{ flex: 1, fontSize: '26px', color: '#f1f5f9' }}
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
      </View>

      {/* 团队列表 */}
      <ScrollView
        scrollY
        style={{ height: 'calc(100vh - 160px)', marginTop: '160px' }}
        onScrollToLower={() => hasMore && fetchTeams()}
      >
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {teams.length === 0 && !loading ? (
            <View style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Users size={80} color="#71717a" />
              <Text style={{ fontSize: '28px', color: '#64748b', marginTop: '16px' }}>暂无团队</Text>
              <Text style={{ fontSize: '24px', color: '#64748b', marginTop: '8px' }}>点击下方按钮创建第一个团队</Text>
              <View
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  backgroundColor: '#38bdf8',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={navigateToCreate}
              >
                <Plus size={20} color="#000" />
                <Text style={{ fontSize: '24px', color: '#000', fontWeight: '600' }}>创建团队</Text>
              </View>
            </View>
          ) : (
            teams.map(team => {
              const isActive = team.is_active;
              return (
                <View
                  key={team.id}
                  style={{
                    backgroundColor: 'rgba(30, 58, 95, 0.3)',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid #1e3a5f',
                  }}
                >
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>{team.name}</Text>
                        <View style={{
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
                        <Text style={{ fontSize: '22px', color: '#64748b', marginTop: '6px' }}>{team.description}</Text>
                      )}
                    </View>
                  </View>

                  {/* 团队信息 */}
                  <View style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={16} color="#71717a" />
                      <Text style={{ fontSize: '22px', color: '#71717a' }}>{team.members?.count || 0} 成员</Text>
                    </View>
                    {team.leader && (
                      <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Text style={{ fontSize: '22px', color: '#71717a' }}>负责人:</Text>
                        <Text style={{ fontSize: '22px', color: '#f59e0b' }}>{team.leader.nickname}</Text>
                      </View>
                    )}
                  </View>

                  {/* 操作按钮 */}
                  <View style={{
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
                      <Text style={{ fontSize: '22px', color: '#94a3b8' }}>{team.is_active ? '禁用' : '启用'}</Text>
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
            })
          )}

          {loading && (
            <View style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
              <RefreshCw size={40} color="#38bdf8" />
            </View>
          )}

          {!loading && teams.length >= 20 && !hasMore && (
            <View style={{ padding: '16px 0', textAlign: 'center' }}>
              <Text style={{ fontSize: '22px', color: '#64748b' }}>没有更多数据了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
