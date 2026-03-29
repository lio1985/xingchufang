import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import { Network } from '@/network';
import {
  Users,
  Search,
  X,
  User,
  Pencil,
  Crown,
  Check,
  LoaderCircle,
  UserPlus,
} from 'lucide-react-taro';
import '@/styles/pages.css';
import '@/styles/admin.css';

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

interface TeamDetail {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  leader?: {
    id: string;
    nickname: string;
  };
  members?: TeamMember[];
}

interface UserItem {
  id: string;
  nickname?: string;
  avatar_url?: string;
  role: string;
  status: string;
  employee_id?: string;
}

export default function TeamDetail() {
  const router = useRouter();
  const teamId = router.params.id;
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 用户搜索相关状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<UserItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 编辑团队相关状态
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teamId) fetchTeamDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // 搜索用户
  const searchUsers = async () => {
    if (!searchKeyword.trim()) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }

    setSearching(true);
    try {
      const res = await Network.request({
        url: '/api/admin/users',
        method: 'GET',
        data: {
          search: searchKeyword,
          status: 'active',
          page: 1,
          pageSize: 20,
        },
      });

      console.log('[TeamDetail] Search users response:', res);

      if (res.data.code === 200 && res.data.data) {
        const users = res.data.data.users || [];
        // 过滤掉已在团队中的成员
        const existingMemberIds = new Set(team?.members?.map(m => m.user_id) || []);
        const filteredUsers = users.filter((u: UserItem) => !existingMemberIds.has(u.id));

        setSearchResults(filteredUsers);
        setShowSearchResults(true);

        if (filteredUsers.length === 0) {
          Taro.showToast({ title: '未找到可添加的用户', icon: 'none' });
        }
      }
    } catch (error) {
      console.error('[TeamDetail] Search users error:', error);
      Taro.showToast({ title: '搜索用户失败', icon: 'none' });
    } finally {
      setSearching(false);
    }
  };

  // 选择用户
  const handleSelectUser = (user: UserItem) => {
    setSelectedUser(user);
    setShowSearchResults(false);
  };

  // 清除选择
  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchKeyword('');
    setSearchResults([]);
  };

  const fetchTeamDetail = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: `/api/teams/${teamId}`,
        method: 'GET',
      });
      console.log('[TeamDetail] Fetch response:', res);
      if (res.data.code === 200) {
        setTeam(res.data.data);
      }
    } catch (error) {
      console.error('[TeamDetail] Fetch error:', error);
      Taro.showToast({ title: '获取团队详情失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    const userId = selectedUser?.id;
    if (!userId) {
      Taro.showToast({ title: '请先搜索并选择用户', icon: 'none' });
      return;
    }

    Network.request({
      url: `/api/teams/${teamId}/members`,
      method: 'POST',
      data: { userId },
    })
      .then(() => {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        handleClearSelection();
        fetchTeamDetail();
      })
      .catch(err => {
        console.error('[TeamDetail] Add member error:', err);
        Taro.showToast({ title: '添加失败', icon: 'none' });
      });
  };

  const handleRemoveMember = (userId: string, nickname: string) => {
    Taro.showModal({
      title: '确认移除',
      content: `确定要移除成员"${nickname}"吗？`,
      confirmColor: '#f87171',
      success: res => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${teamId}/members/${userId}`,
            method: 'DELETE',
          })
            .then(() => {
              Taro.showToast({ title: '移除成功', icon: 'success' });
              fetchTeamDetail();
            })
            .catch(err => {
              console.error('[TeamDetail] Remove member error:', err);
              Taro.showToast({ title: '移除失败', icon: 'none' });
            });
        }
      },
    });
  };

  const handleSetLeader = (userId: string) => {
    Taro.showModal({
      title: '确认设置负责人',
      content: '确定要将该成员设为团队负责人吗？',
      success: res => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${teamId}/members/${userId}/role`,
            method: 'PUT',
            data: { role: 'leader' },
          })
            .then(() => {
              Taro.showToast({ title: '设置成功', icon: 'success' });
              fetchTeamDetail();
            })
            .catch(err => {
              console.error('[TeamDetail] Set leader error:', err);
              Taro.showToast({ title: '设置失败', icon: 'none' });
            });
        }
      },
    });
  };

  // 开始编辑
  const handleStartEdit = () => {
    setEditName(team?.name || '');
    setEditDescription(team?.description || '');
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
    setEditDescription('');
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Taro.showToast({ title: '团队名称不能为空', icon: 'none' });
      return;
    }

    setSaving(true);
    try {
      const res = await Network.request({
        url: `/api/teams/${teamId}`,
        method: 'PUT',
        data: {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        },
      });

      if (res.data.code === 200) {
        Taro.showToast({ title: '更新成功', icon: 'success' });
        setIsEditing(false);
        fetchTeamDetail();
      } else {
        Taro.showToast({ title: res.data.msg || '更新失败', icon: 'none' });
      }
    } catch (err) {
      console.error('[TeamDetail] Update team error:', err);
      Taro.showToast({ title: '更新失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <View style={{ textAlign: 'center' }}>
          <LoaderCircle size={32} color="#38bdf8" />
          <Text style={{ fontSize: '24px', color: '#71717a', marginTop: '12px', display: 'block' }}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!team) {
    return (
      <View className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <View style={{ textAlign: 'center' }}>
          <Users size={48} color="#71717a" />
          <Text style={{ fontSize: '24px', color: '#71717a', marginTop: '12px', display: 'block' }}>团队不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          
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
            <Text className="admin-title">{team.name}</Text>
          </View>
          <View style={{ width: '36px' }} />
        </View>
      </View>

      <ScrollView style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }} scrollY>
        <View style={{ padding: '16px' }}>
          {/* Team Info - 编辑模式 */}
          {isEditing ? (
            <View className="admin-card">
              <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
                团队名称 <Text style={{ color: '#f87171' }}>*</Text>
              </Text>
              <Input
                className="form-input input-focus"
                placeholder="输入团队名称"
                placeholderStyle="color: #64748b"
                value={editName}
                onInput={e => setEditName(e.detail.value)}
              />

              <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', marginTop: '16px', display: 'block' }}>
                描述
              </Text>
              <View
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  border: '1px solid #1e3a5f',
                }}
              >
                <Textarea
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '16px',
                    fontSize: '26px',
                    color: '#f1f5f9',
                    backgroundColor: 'transparent',
                  }}
                  placeholder="输入团队描述（可选）"
                  placeholderStyle="color: #64748b"
                  value={editDescription}
                  onInput={e => setEditDescription(e.detail.value)}
                  maxlength={200}
                />
              </View>

              <View style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <View
                  className="action-button action-button-secondary"
                  onClick={handleCancelEdit}
                >
                  <Text>取消</Text>
                </View>
                <View
                  className="action-button action-button-primary"
                  style={{ opacity: saving || !editName.trim() ? 0.6 : 1 }}
                  onClick={handleSaveEdit}
                >
                  <Text>{saving ? '保存中...' : '保存'}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="admin-card">
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '22px', color: '#64748b', marginBottom: '4px', display: 'block' }}>
                    团队名称
                  </Text>
                  <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9' }}>{team.name}</Text>
                </View>
                <View
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(96, 165, 250, 0.15)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onClick={handleStartEdit}
                >
                  <Pencil size={16} color="#60a5fa" />
                  <Text style={{ fontSize: '22px', color: '#60a5fa' }}>编辑</Text>
                </View>
              </View>
              {team.description && (
                <>
                  <Text style={{ fontSize: '22px', color: '#64748b', marginBottom: '4px', marginTop: '16px', display: 'block' }}>
                    描述
                  </Text>
                  <Text style={{ fontSize: '24px', color: '#94a3b8' }}>{team.description}</Text>
                </>
              )}
              <Text style={{ fontSize: '22px', color: '#64748b', marginBottom: '4px', marginTop: '16px', display: 'block' }}>
                状态
              </Text>
              <View
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: team.is_active ? 'rgba(74, 222, 128, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                }}
              >
                {team.is_active && <Check size={14} color="#4ade80" />}
                <Text style={{ fontSize: '20px', color: team.is_active ? '#4ade80' : '#64748b' }}>
                  {team.is_active ? '启用中' : '已禁用'}
                </Text>
              </View>
            </View>
          )}

          {/* Add Member */}
          <View className="admin-card">
            <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
              添加成员
            </Text>

            {!selectedUser ? (
              <>
                {/* 搜索框 */}
                <View style={{ display: 'flex', gap: '12px' }}>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid #1e3a5f',
                    }}
                  >
                    <Search size={18} color="#71717a" />
                    <Input
                      style={{ flex: 1, fontSize: '24px', color: '#f1f5f9' }}
                      placeholder="输入用户昵称或员工ID"
                      placeholderStyle="color: #64748b"
                      value={searchKeyword}
                      onInput={e => setSearchKeyword(e.detail.value)}
                      onConfirm={searchUsers}
                    />
                    {searchKeyword && (
                      <View onClick={() => setSearchKeyword('')}>
                        <X size={18} color="#71717a" />
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      padding: '12px 20px',
                      backgroundColor: searching ? '#1e3a5f' : '#38bdf8',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={searchUsers}
                  >
                    <Text style={{ fontSize: '24px', color: searching ? '#64748b' : '#000', fontWeight: '600' }}>
                      {searching ? '搜索中' : '搜索'}
                    </Text>
                  </View>
                </View>

                {/* 搜索结果 */}
                {showSearchResults && searchResults.length > 0 && (
                  <View style={{ marginTop: '16px' }}>
                    <Text style={{ fontSize: '20px', color: '#64748b', marginBottom: '10px', display: 'block' }}>
                      搜索结果（点击选择）
                    </Text>
                    <View style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {searchResults.map(user => (
                        <View
                          key={user.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: '#1e293b',
                            borderRadius: '10px',
                            border: '1px solid #1e3a5f',
                          }}
                          onClick={() => handleSelectUser(user)}
                        >
                          <View
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ fontSize: '20px', color: '#f59e0b' }}>
                              {(user.nickname || '?')[0]}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: '24px', color: '#f1f5f9' }}>
                              {user.nickname || '未设置昵称'}
                            </Text>
                            <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {user.employee_id && (
                                <Text style={{ fontSize: '20px', color: '#10b981' }}>
                                  #{user.employee_id}
                                </Text>
                              )}
                              <Text style={{ fontSize: '18px', color: '#64748b' }}>
                                ID: {user.id.slice(0, 8)}...
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              padding: '8px 14px',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              borderRadius: '8px',
                            }}
                          >
                            <Text style={{ fontSize: '20px', color: '#38bdf8' }}>选择</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 搜索提示 */}
                {!showSearchResults && !searching && (
                  <Text style={{ fontSize: '20px', color: '#64748b', marginTop: '12px' }}>
                    提示：输入用户昵称或6位员工ID搜索
                  </Text>
                )}
              </>
            ) : (
              /* 已选择用户 */
              <View style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #1e3a5f' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>已选择用户</Text>
                  <View onClick={handleClearSelection}>
                    <X size={18} color="#71717a" />
                  </View>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <View
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: '24px', color: '#f59e0b' }}>
                      {(selectedUser.nickname || '?')[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>
                      {selectedUser.nickname || '未设置昵称'}
                    </Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {selectedUser.employee_id && (
                        <Text style={{ fontSize: '20px', color: '#10b981' }}>
                          #{selectedUser.employee_id}
                        </Text>
                      )}
                      <Text style={{ fontSize: '18px', color: '#64748b' }}>
                        ID: {selectedUser.id}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  className="action-btn-primary"
                  onClick={handleAddMember}
                >
                  <UserPlus size={20} color="#000" />
                  <Text className="action-btn-primary-text" style={{ marginLeft: '8px' }}>确认添加</Text>
                </View>
              </View>
            )}
          </View>

          {/* Members List */}
          <View className="admin-card">
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>团队成员</Text>
            </View>
            {team.members?.map(member => (
              <View
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #1e3a5f',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <View
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: '20px', color: '#f59e0b', fontWeight: '600' }}>
                      {(member.user?.nickname || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>
                      {member.user?.nickname || '未知用户'}
                    </Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      {member.role === 'leader' ? (
                        <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Crown size={14} color="#f59e0b" />
                          <Text style={{ fontSize: '20px', color: '#f59e0b' }}>负责人</Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: '20px', color: '#64748b' }}>成员</Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {member.role !== 'leader' && (
                    <View
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        borderRadius: '8px',
                      }}
                      onClick={() => handleSetLeader(member.user_id)}
                    >
                      <Text style={{ fontSize: '20px', color: '#f59e0b' }}>设负责人</Text>
                    </View>
                  )}
                  <View
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(248, 113, 113, 0.15)',
                      borderRadius: '8px',
                    }}
                    onClick={() => handleRemoveMember(member.user_id, member.user?.nickname || '该成员')}
                  >
                    <User size={16} color="#f87171" />
                  </View>
                </View>
              </View>
            ))}
            {(!team.members || team.members.length === 0) && (
              <View style={{ textAlign: 'center', padding: '32px 0' }}>
                <Users size={48} color="#71717a" />
                <Text style={{ fontSize: '24px', color: '#71717a', marginTop: '12px', display: 'block' }}>暂无成员</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
