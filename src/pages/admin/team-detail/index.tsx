import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Users,
  Search,
  X,
  User,
  Pencil,
  Crown,
  Check,
  Loader,
  UserPlus
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

interface User {
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
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
        const filteredUsers = users.filter((u: User) => !existingMemberIds.has(u.id));
        
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
  const handleSelectUser = (user: User) => {
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
    }).then(() => {
      Taro.showToast({ title: '添加成功', icon: 'success' });
      handleClearSelection();
      fetchTeamDetail();
    }).catch((err) => {
      console.error('[TeamDetail] Add member error:', err);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    });
  };

  const handleRemoveMember = (userId: string, nickname: string) => {
    Taro.showModal({
      title: '确认移除',
      content: `确定要移除成员"${nickname}"吗？`,
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${teamId}/members/${userId}`,
            method: 'DELETE',
          }).then(() => {
            Taro.showToast({ title: '移除成功', icon: 'success' });
            fetchTeamDetail();
          }).catch((err) => {
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
      success: (res) => {
        if (res.confirm) {
          Network.request({
            url: `/api/teams/${teamId}/members/${userId}/role`,
            method: 'PUT',
            data: { role: 'leader' },
          }).then(() => {
            Taro.showToast({ title: '设置成功', icon: 'success' });
            fetchTeamDetail();
          }).catch((err) => {
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
      <View className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <View className="text-center">
          <Loader size={24} color="#f59e0b" className="animate-spin" />
          <Text className="block text-zinc-500 mt-2">加载中...</Text>
        </View>
      </View>
    );
  }

  if (!team) {
    return (
      <View className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <View className="text-center">
          <Users size={32} color="#71717a" />
          <Text className="block text-zinc-500 mt-2">团队不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <View className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <View className="flex items-center gap-3 px-4 py-3">
          <View
            className="p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/50 active:bg-zinc-700"
            onClick={() => Taro.navigateBack()}
          >
            <ArrowLeft size={20} color="#f59e0b" />
          </View>
          <View className="flex items-center gap-2">
            <View className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
              <Users size={16} color="#f59e0b" />
            </View>
            <Text className="block text-lg font-semibold text-white">{team.name}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" scrollY style={{ height: 'calc(100vh - 60px)' }}>
        {/* Team Info */}
        <View className="p-4">
          {/* Team Info - 编辑模式 */}
          {isEditing ? (
            <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 mb-4">
              <Text className="block text-sm text-zinc-400 mb-1">团队名称 *</Text>
              <Input
                className="text-lg text-white font-semibold bg-zinc-700/50 rounded-lg px-3 py-2 mb-3 border border-zinc-600/50"
                placeholder="输入团队名称"
                placeholderClass="text-zinc-500"
                value={editName}
                onInput={(e) => setEditName(e.detail.value)}
              />
              
              <Text className="block text-sm text-zinc-400 mb-1">描述</Text>
              <Textarea
                className="text-base text-zinc-300 bg-zinc-700/50 rounded-lg px-3 py-2 mb-4 border border-zinc-600/50"
                style={{ width: '100%', minHeight: '80px' }}
                placeholder="输入团队描述（可选）"
                placeholderClass="text-zinc-500"
                value={editDescription}
                onInput={(e) => setEditDescription(e.detail.value)}
                maxlength={200}
              />

              <View className="flex gap-3">
                <View
                  className="flex-1 py-2.5 bg-zinc-700/50 rounded-lg active:bg-zinc-700"
                  onClick={handleCancelEdit}
                >
                  <Text className="block text-center text-sm text-zinc-300">取消</Text>
                </View>
                <View
                  className={`flex-1 py-2.5 rounded-lg ${
                    saving || !editName.trim() ? 'bg-amber-500/50' : 'bg-amber-500 active:bg-amber-600'
                  }`}
                  onClick={handleSaveEdit}
                >
                  <Text className="block text-center text-sm text-black font-medium">
                    {saving ? '保存中...' : '保存'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 mb-4">
              <View className="flex items-center justify-between">
                <View className="flex-1">
                  <Text className="block text-sm text-zinc-500 mb-1">团队名称</Text>
                  <Text className="block text-lg text-white font-semibold">{team.name}</Text>
                </View>
                <View
                  className="px-3 py-1.5 bg-blue-500/20 rounded-lg flex items-center gap-1.5 active:bg-blue-500/30 border border-blue-500/30"
                  onClick={handleStartEdit}
                >
                  <Pencil size={14} color="#3b82f6" />
                  <Text className="block text-sm text-blue-400">编辑</Text>
                </View>
              </View>
              {team.description && (
                <>
                  <Text className="block text-sm text-zinc-500 mb-1 mt-3">描述</Text>
                  <Text className="block text-base text-zinc-300">{team.description}</Text>
                </>
              )}
              <Text className="block text-sm text-zinc-500 mb-1 mt-3">状态</Text>
              <View className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${team.is_active ? 'bg-emerald-500/20' : 'bg-zinc-500/20'}`}>
                {team.is_active && <Check size={12} color="#10b981" />}
                <Text className={`block text-xs ${team.is_active ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {team.is_active ? '启用中' : '已禁用'}
                </Text>
              </View>
            </View>
          )}

          {/* Add Member */}
          <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 mb-4">
            <Text className="block text-base font-semibold text-white mb-3">添加成员</Text>
            
            {!selectedUser ? (
              <>
                {/* 搜索框 */}
                <View className="flex items-center gap-2 mb-3">
                  <View className="flex-1 bg-zinc-700/50 rounded-lg px-3 py-2 flex items-center gap-2 border border-zinc-600/50">
                    <Search size={16} color="#71717a" />
                    <Input
                      className="text-sm text-white bg-transparent flex-1"
                      placeholder="输入用户昵称或6位员工ID搜索"
                      placeholderClass="text-zinc-500"
                      value={searchKeyword}
                      onInput={(e) => setSearchKeyword(e.detail.value)}
                      onConfirm={searchUsers}
                    />
                    {searchKeyword && (
                      <View onClick={() => setSearchKeyword('')}>
                        <X size={16} color="#71717a" />
                      </View>
                    )}
                  </View>
                  <View
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      searching || !searchKeyword.trim()
                        ? 'bg-zinc-700/50'
                        : 'bg-amber-500 active:bg-amber-600'
                    }`}
                    onClick={searchUsers}
                  >
                    <Text className={`block text-sm font-medium ${searching || !searchKeyword.trim() ? 'text-zinc-500' : 'text-black'}`}>
                      {searching ? '搜索中...' : '搜索'}
                    </Text>
                  </View>
                </View>

                {/* 搜索结果 */}
                {showSearchResults && searchResults.length > 0 && (
                  <View className="bg-zinc-700/30 rounded-lg overflow-hidden border border-zinc-600/50">
                    <View className="px-3 py-2 border-b border-zinc-600/50">
                      <Text className="block text-xs text-zinc-500">搜索结果（点击选择）</Text>
                    </View>
                    {searchResults.map((user) => (
                      <View
                        key={user.id}
                        className="flex items-center gap-3 px-3 py-3 border-b border-zinc-600/30 active:bg-zinc-700/50"
                        onClick={() => handleSelectUser(user)}
                      >
                        <View className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                          <Text className="block text-sm text-amber-500">
                            {(user.nickname || '?')[0]}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="block text-sm text-white">
                            {user.nickname || '未设置昵称'}
                          </Text>
                          <View className="flex items-center gap-2">
                            {user.employee_id && (
                              <Text className="block text-xs text-emerald-400 font-mono">
                                #{user.employee_id}
                              </Text>
                            )}
                            <Text className="block text-xs text-zinc-500">
                              ID: {user.id.slice(0, 8)}...
                            </Text>
                          </View>
                        </View>
                        <View className="px-2 py-1 bg-amber-500/20 rounded border border-amber-500/30">
                          <Text className="block text-xs text-amber-500">选择</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* 搜索提示 */}
                {!showSearchResults && !searching && (
                  <Text className="block text-xs text-zinc-500">
                    提示：输入用户昵称或6位员工ID搜索，如「张三」或「123456」
                  </Text>
                )}
              </>
            ) : (
              /* 已选择用户 */
              <View className="bg-zinc-700/30 rounded-lg p-3 border border-zinc-600/50">
                <View className="flex items-center justify-between mb-3">
                  <Text className="block text-sm text-zinc-400">已选择用户</Text>
                  <View onClick={handleClearSelection}>
                    <X size={16} color="#71717a" />
                  </View>
                </View>
                <View className="flex items-center gap-3 mb-3">
                  <View className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <Text className="block text-base text-amber-500">
                      {(selectedUser.nickname || '?')[0]}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="block text-base text-white font-medium">
                      {selectedUser.nickname || '未设置昵称'}
                    </Text>
                    <View className="flex items-center gap-2">
                      {selectedUser.employee_id && (
                        <Text className="block text-xs text-emerald-400 font-mono">
                          #{selectedUser.employee_id}
                        </Text>
                      )}
                      <Text className="block text-xs text-zinc-500">
                        ID: {selectedUser.id}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  className="py-2.5 bg-amber-500 rounded-lg active:bg-amber-600 flex items-center justify-center gap-2"
                  onClick={handleAddMember}
                >
                  <UserPlus size={16} color="#000" />
                  <Text className="block text-sm text-black font-medium">确认添加</Text>
                </View>
              </View>
            )}
          </View>

          {/* Members List */}
          <View className="bg-zinc-800/40 rounded-xl border border-zinc-700/50 overflow-hidden">
            <View className="px-4 py-3 border-b border-zinc-700/50">
              <Text className="block text-base font-semibold text-white">团队成员</Text>
            </View>
            {team.members?.map((member) => (
              <View
                key={member.id}
                className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/30 last:border-b-0"
              >
                <View className="flex items-center gap-3">
                  <View className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
                    <Text className="block text-amber-500 font-semibold">
                      {(member.user?.nickname || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="block text-white font-medium">{member.user?.nickname || '未知用户'}</Text>
                    <View className="flex items-center gap-2 mt-0.5">
                      {member.role === 'leader' ? (
                        <View className="flex items-center gap-1">
                          <Crown size={12} color="#f59e0b" />
                          <Text className="block text-xs text-amber-500">负责人</Text>
                        </View>
                      ) : (
                        <Text className="block text-xs text-zinc-500">成员</Text>
                      )}
                    </View>
                  </View>
                </View>
                <View className="flex items-center gap-2">
                  {member.role !== 'leader' && (
                    <View
                      className="px-3 py-1.5 bg-amber-500/20 rounded-lg active:bg-amber-500/30 border border-amber-500/30"
                      onClick={() => handleSetLeader(member.user_id)}
                    >
                      <Text className="block text-xs text-amber-500">设负责人</Text>
                    </View>
                  )}
                  <View
                    className="p-2 bg-red-500/10 rounded-lg active:bg-red-500/20 border border-red-500/20"
                    onClick={() => handleRemoveMember(member.user_id, member.user?.nickname || '该成员')}
                  >
                    <User size={14} color="#ef4444" />
                  </View>
                </View>
              </View>
            ))}
            {(!team.members || team.members.length === 0) && (
              <View className="flex flex-col items-center justify-center py-8">
                <Users size={32} color="#71717a" />
                <Text className="block text-zinc-500 mt-2">暂无成员</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
