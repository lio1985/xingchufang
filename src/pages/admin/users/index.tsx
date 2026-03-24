import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled' | 'deleted' | 'pending';
  employeeId?: string;
  createdAt: string;
  lastLoginAt?: string;
  profile?: {
    realName?: string;
    department?: string;
    position?: string;
    email?: string;
    phone?: string;
  };
  statistics?: {
    conversationCount: number;
    messageCount: number;
    fileCount: number;
    lexiconCount?: number;
    workPlanCount?: number;
  };
}

interface UserListResponse {
  users: UserInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'disabled' | 'deleted'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const loadUsers = async (pageNum: number = 1) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/admin/users',
        method: 'GET',
        data: {
          page: pageNum,
          pageSize,
          role: roleFilter === 'all' ? undefined : roleFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchText || undefined,
        },
      });

      console.log('用户列表响应:', res.data);

      if (res.data && res.data.data) {
        const response = res.data.data as UserListResponse;
        if (pageNum === 1) {
          setUsers(response.users);
        } else {
          setUsers([...users, ...response.users]);
        }
        setTotal(response.total);
        setPage(pageNum);
      }
    } catch (error: any) {
      console.error('加载用户列表失败:', error);
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, searchText]);

  const handleRefresh = () => {
    setPage(1);
    loadUsers(1);
  };

  const handleLoadMore = () => {
    if (users.length < total && !loading) {
      loadUsers(page + 1);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const showUserDetail = (user: UserInfo) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const changeUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    console.log('修改角色被调用:', userId, newRole);
    try {
      const res = await Network.request({
        url: `/api/admin/users/${userId}/role`,
        method: 'PUT',
        data: { role: newRole },
      });

      console.log('修改角色响应:', res.data);

      if (res.data && res.data.code === 200) {
        Taro.showToast({
          title: '角色已修改',
          icon: 'success',
        });
        handleRefresh();
      } else {
        Taro.showToast({
          title: res.data?.msg || '修改失败',
          icon: 'none',
        });
      }
    } catch (error: any) {
      console.error('修改角色失败:', error);
      Taro.showToast({
        title: error.message || '修改失败',
        icon: 'none',
      });
    }
  };

  const changeUserStatus = async (userId: string, newStatus: 'active' | 'disabled' | 'deleted') => {
    console.log('修改状态被调用:', userId, newStatus);
    try {
      const res = await Network.request({
        url: `/api/admin/users/${userId}/status`,
        method: 'PUT',
        data: { status: newStatus },
      });

      console.log('修改状态响应:', res.data);

      if (res.data && res.data.code === 200) {
        Taro.showToast({
          title: '状态已修改',
          icon: 'success',
        });
        handleRefresh();
        if (selectedUser?.id === userId) {
          setShowDetailModal(false);
        }
      } else {
        const errorMsg = res.data?.msg || '修改失败';
        console.error('修改状态失败:', errorMsg);
        Taro.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('修改状态异常:', error);
      Taro.showToast({
        title: error.message || '网络错误，请稍后重试',
        icon: 'none',
        duration: 3000,
      });
    }
  };

  // 查看用户对话记录
  const viewUserConversations = (userId: string) => {
    Taro.navigateTo({
      url: `/pages/admin/user-data/index?type=conversations&userId=${userId}`
    });
  };

  // 查看用户语料库
  const viewUserLexicons = (userId: string) => {
    Taro.navigateTo({
      url: `/pages/admin/user-data/index?type=lexicons&userId=${userId}`
    });
  };

  // 查看用户文件
  const viewUserFiles = (userId: string) => {
    Taro.navigateTo({
      url: `/pages/admin/user-data/index?type=files&userId=${userId}`
    });
  };

  // 查看用户任务
  const viewUserTasks = (userId: string) => {
    Taro.navigateTo({
      url: `/pages/admin/user-data/index?type=tasks&userId=${userId}`
    });
  };

  // 修改用户昵称
  const handleUpdateNickname = async (userId: string, nicknameValue: string) => {
    if (!nicknameValue.trim()) {
      Taro.showToast({
        title: '昵称不能为空',
        icon: 'none',
      });
      return;
    }

    try {
      const res = await Network.request({
        url: `/api/admin/users/${userId}/username`,
        method: 'PUT',
        data: { username: nicknameValue },
      });

      console.log('修改昵称响应:', res.data);

      if (res.data && res.data.code === 200) {
        Taro.showToast({
          title: '昵称已修改',
          icon: 'success',
        });
        setEditingNickname(false);
        setNewNickname('');
        handleRefresh();
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, username: nicknameValue });
        }
      }
    } catch (error: any) {
      console.error('修改昵称失败:', error);
      Taro.showToast({
        title: error.message || '修改失败',
        icon: 'none',
      });
    }
  };

  // 查看用户操作日志
  const viewUserAuditLogs = (userId: string) => {
    Taro.navigateTo({
      url: `/pages/admin/user-data/index?type=audit&userId=${userId}`
    });
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? '管理员' : '用户';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return '正常';
      case 'pending':
        return '待审核';
      case 'disabled':
        return '禁用';
      case 'deleted':
        return '已删除';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'disabled':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部搜索栏 */}
      <View className="sticky top-0 z-10 bg-slate-800 px-4 py-3 border-b border-slate-700">
        <View className="flex items-center gap-3">
          <View className="flex-1 bg-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <Text>🔍</Text>
            <Input
              className="flex-1 text-white bg-transparent placeholder-slate-400"
              placeholder="搜索用户名、姓名、员工ID..."
              value={searchText}
              onInput={(e) => handleSearch(e.detail.value)}
            />
          </View>
          <View
            className="bg-slate-800 rounded-lg px-3 py-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Text>📝</Text>
          </View>
        </View>

        {/* 筛选器 */}
        {showFilters && (
          <View className="mt-3 flex gap-2">
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                roleFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setRoleFilter('all')}
            >
              <Text className="block">全部角色</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                roleFilter === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setRoleFilter('user')}
            >
              <Text className="block">用户</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                roleFilter === 'admin'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setRoleFilter('admin')}
            >
              <Text className="block">管理员</Text>
            </View>
          </View>
        )}

        {/* 状态筛选 */}
        {showFilters && (
          <View className="mt-2 flex gap-2">
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              <Text className="block">全部状态</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('active')}
            >
              <Text className="block">正常</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              <Text className="block">待审核</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'disabled'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('disabled')}
            >
              <Text className="block">禁用</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'deleted'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('deleted')}
            >
              <Text className="block">已删除</Text>
            </View>
          </View>
        )}

        {/* 统计信息 */}
        <View className="mt-3 flex justify-between text-slate-400 text-sm">
          <Text className="block">共 {total} 位用户</Text>
          <Text className="block">第 {page} 页</Text>
        </View>
      </View>

      {/* 用户列表 */}
      <ScrollView
        className="flex-1"
        scrollY
        onScrollToLower={handleLoadMore}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View className="px-4 py-3 space-y-3">
          {users.map((user) => (
            <View
              key={user.id}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
              onClick={() => showUserDetail(user)}
            >
              <View className="flex items-start gap-3">
                <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Text>👤</Text>
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex items-center gap-2 mb-1">
                    <Text className="text-white font-semibold truncate">{user.username}</Text>
                    {user.employeeId && (
                      <View className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-mono">
                        #{user.employeeId}
                      </View>
                    )}
                    <View className={`px-2 py-0.5 rounded text-xs ${getRoleColor(user.role)}`}>
                      {getRoleBadge(user.role)}
                    </View>
                    <View className={`px-2 py-0.5 rounded text-xs ${getStatusColor(user.status)}`}>
                      {getStatusBadge(user.status)}
                    </View>
                  </View>
                  {user.profile?.realName && (
                    <Text className="text-slate-400 text-sm block">{user.profile.realName}</Text>
                  )}
                  {user.profile?.department && (
                    <Text className="text-slate-400 text-sm block">{user.profile.department}</Text>
                  )}
                  <Text className="text-slate-300 text-xs block mt-1">
                    注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                </View>
                <Text>▼</Text>
              </View>

              {/* 用户统计 */}
              {user.statistics && (
                <View className="mt-3 pt-3 border-t border-slate-700 flex gap-4 text-xs">
                  <View className="flex items-center gap-1">
                    <Text className="text-slate-400">对话:</Text>
                    <Text className="text-blue-400 font-semibold">{user.statistics.conversationCount}</Text>
                  </View>
                  <View className="flex items-center gap-1">
                    <Text className="text-slate-400">消息:</Text>
                    <Text className="text-green-400 font-semibold">{user.statistics.messageCount}</Text>
                  </View>
                  <View className="flex items-center gap-1">
                    <Text className="text-slate-400">文件:</Text>
                    <Text className="text-purple-400 font-semibold">{user.statistics.fileCount}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View className="text-center py-4">
              <Text className="text-slate-400">加载中...</Text>
            </View>
          )}

          {!loading && users.length === 0 && (
            <View className="text-center py-12">
              <Text>👤</Text>
              <Text className="text-slate-400 block">暂无用户数据</Text>
            </View>
          )}

          {!loading && users.length >= total && users.length > 0 && (
            <View className="text-center py-4">
              <Text className="text-slate-400">已加载全部数据</Text>
            </View>
          )}
        </View>

        {/* 底部空间 */}
        <View className="h-20"></View>
      </ScrollView>

      {/* 用户详情弹窗 */}
      {showDetailModal && selectedUser && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'flex-end',
        }}
        >
          {/* 背景遮罩 */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 51,
            }}
            onClick={() => setShowDetailModal(false)}
          />
          {/* 内容区域 */}
          <View
            style={{
              position: 'relative',
              zIndex: 52,
              width: '100%',
              backgroundColor: '#1e293b',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '16px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <View className="flex justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">用户详情</Text>
              <View onClick={() => setShowDetailModal(false)}>
                <Text className="text-slate-400 text-2xl">×</Text>
              </View>
            </View>

            {/* 基本信息 */}
            <View className="mb-4">
              <View className="flex items-center gap-3 mb-3">
                <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Text>👤</Text>
                </View>
                <View className="flex-1">
                  {editingNickname ? (
                    <View className="flex gap-2">
                      <View className="flex-1 bg-slate-800 rounded-lg px-3 py-2">
                        <Input
                          className="text-white"
                          value={newNickname}
                          onInput={(e) => setNewNickname(e.detail.value)}
                          placeholder="请输入新昵称"
                        />
                      </View>
                      <View
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => handleUpdateNickname(selectedUser.id, newNickname)}
                      >
                        <Text>保存</Text>
                      </View>
                      <View
                        className="bg-slate-700 text-white px-4 py-2 rounded-lg"
                        onClick={() => {
                          setEditingNickname(false);
                          setNewNickname('');
                        }}
                      >
                        <Text>取消</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="flex items-center gap-2">
                      <View className="flex-1">
                        <Text className="text-white font-bold text-lg block">{selectedUser.username}</Text>
                        <Text className="text-slate-400 text-sm block">
                          {selectedUser.profile?.realName || '未设置姓名'}
                        </Text>
                      </View>
                      <View
                        className="bg-slate-800 px-3 py-1 rounded-lg"
                        onClick={() => {
                          setEditingNickname(true);
                          setNewNickname(selectedUser.username);
                        }}
                      >
                        <Text className="text-slate-400 text-sm">编辑</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              <View className="flex gap-2 mb-3">
                {selectedUser.employeeId && (
                  <View className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm font-mono">
                    #{selectedUser.employeeId}
                  </View>
                )}
                <View className={`px-3 py-1 rounded text-sm ${getRoleColor(selectedUser.role)}`}>
                  {getRoleBadge(selectedUser.role)}
                </View>
                <View className={`px-3 py-1 rounded text-sm ${getStatusColor(selectedUser.status)}`}>
                  {getStatusBadge(selectedUser.status)}
                </View>
              </View>
            </View>

            {/* 档案信息 */}
            <View className="bg-slate-800 rounded-lg p-4 mb-4">
              <Text className="text-white font-semibold mb-3 block">档案信息</Text>
              {selectedUser.employeeId && (
                <View className="mb-2">
                  <Text className="text-slate-400 text-sm block">员工ID</Text>
                  <Text className="text-emerald-400 font-mono">#{selectedUser.employeeId}</Text>
                </View>
              )}
              {selectedUser.profile?.realName && (
                <View className="mb-2">
                  <Text className="text-slate-400 text-sm block">真实姓名</Text>
                  <Text className="text-white">{selectedUser.profile.realName}</Text>
                </View>
              )}
              {selectedUser.profile?.department && (
                <View className="mb-2">
                  <Text className="text-slate-400 text-sm block">部门</Text>
                  <Text className="text-white">{selectedUser.profile.department}</Text>
                </View>
              )}
              {selectedUser.profile?.position && (
                <View className="mb-2">
                  <Text className="text-slate-400 text-sm block">职位</Text>
                  <Text className="text-white">{selectedUser.profile.position}</Text>
                </View>
              )}
              {selectedUser.profile?.email && (
                <View className="mb-2">
                  <Text className="text-slate-400 text-sm block">邮箱</Text>
                  <Text className="text-white">{selectedUser.profile.email}</Text>
                </View>
              )}
              {selectedUser.profile?.phone && (
                <View className="mb-2">
                  <Text className="text-slate-400 text-sm block">电话</Text>
                  <Text className="text-white">{selectedUser.profile.phone}</Text>
                </View>
              )}
              <View className="mb-2">
                <Text className="text-slate-400 text-sm block">注册时间</Text>
                <Text className="text-white">
                  {new Date(selectedUser.createdAt).toLocaleString('zh-CN')}
                </Text>
              </View>
              {selectedUser.lastLoginAt && (
                <View className="mb-2">
                  <Text className="text-slate-400 text-sm block">最后登录</Text>
                  <Text className="text-white">
                    {new Date(selectedUser.lastLoginAt).toLocaleString('zh-CN')}
                  </Text>
                </View>
              )}
            </View>

            {/* 用户数据统计 */}
            {selectedUser.statistics && (
              <View className="bg-slate-800 rounded-lg p-4 mb-4">
                <Text className="text-white font-semibold mb-3 block">数据统计</Text>
                <View className="grid grid-cols-3 gap-3">
                  <View className="bg-slate-700 rounded-lg p-3 text-center">
                    <Text className="text-2xl font-bold text-blue-400 block">
                      {selectedUser.statistics.conversationCount}
                    </Text>
                    <Text className="text-slate-400 text-xs block">对话</Text>
                  </View>
                  <View className="bg-slate-700 rounded-lg p-3 text-center">
                    <Text className="text-2xl font-bold text-green-400 block">
                      {selectedUser.statistics.messageCount}
                    </Text>
                    <Text className="text-slate-400 text-xs block">消息</Text>
                  </View>
                  <View className="bg-slate-700 rounded-lg p-3 text-center">
                    <Text className="text-2xl font-bold text-purple-400 block">
                      {selectedUser.statistics.fileCount}
                    </Text>
                    <Text className="text-slate-400 text-xs block">文件</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 查看用户数据 */}
            <View className="bg-slate-800 rounded-lg p-4 mb-4">
              <Text className="text-white font-semibold mb-3 block">查看用户数据</Text>
              <View className="space-y-2">
                <View
                  className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
                  onClick={() => viewUserConversations(selectedUser.id)}
                >
                  <View className="flex items-center gap-3">
                    <Text className="text-xl">💬</Text>
                    <Text className="text-white">对话记录</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">查看 {selectedUser.statistics?.conversationCount || 0} 条</Text>
                </View>
                <View
                  className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
                  onClick={() => viewUserLexicons(selectedUser.id)}
                >
                  <View className="flex items-center gap-3">
                    <Text className="text-xl">📚</Text>
                    <Text className="text-white">语料库</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">查看 {selectedUser.statistics?.lexiconCount || 0} 个</Text>
                </View>
                <View
                  className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
                  onClick={() => viewUserFiles(selectedUser.id)}
                >
                  <View className="flex items-center gap-3">
                    <Text className="text-xl">📁</Text>
                    <Text className="text-white">文件上传</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">查看 {selectedUser.statistics?.fileCount || 0} 个</Text>
                </View>
                <View
                  className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
                  onClick={() => viewUserTasks(selectedUser.id)}
                >
                  <View className="flex items-center gap-3">
                    <Text className="text-xl">✅</Text>
                    <Text className="text-white">任务计划</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">查看 {selectedUser.statistics?.workPlanCount || 0} 个</Text>
                </View>
                <View
                  className="bg-slate-700 rounded-lg p-3 flex items-center justify-between"
                  onClick={() => viewUserAuditLogs(selectedUser.id)}
                >
                  <View className="flex items-center gap-3">
                    <Text className="text-xl">📋</Text>
                    <Text className="text-white">操作日志</Text>
                  </View>
                  <Text className="text-slate-400 text-sm">查看详细记录</Text>
                </View>
              </View>
            </View>

            {/* 操作按钮 */}
            {selectedUser.status !== 'deleted' && (
              <View className="space-y-3">
                <Text className="text-white font-semibold block">操作</Text>

                {/* 修改角色 */}
                <View className="bg-slate-800 rounded-lg p-4">
                  <Text className="text-slate-400 text-sm mb-2 block">修改角色</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                    <View
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        backgroundColor: selectedUser.role === 'user' ? '#475569' : '#3b82f6',
                        color: selectedUser.role === 'user' ? '#94a3b8' : '#ffffff',
                        borderRadius: '8px',
                        textAlign: 'center',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        console.log('点击设为用户按钮，当前角色:', selectedUser.role);
                        if (selectedUser.role !== 'user') {
                          changeUserRole(selectedUser.id, 'user');
                        } else {
                          Taro.showToast({
                            title: '用户已经是用户角色',
                            icon: 'none',
                          });
                        }
                      }}
                    >
                      <Text className="block">设为用户</Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        backgroundColor: selectedUser.role === 'admin' ? '#475569' : '#9333ea',
                        color: selectedUser.role === 'admin' ? '#94a3b8' : '#ffffff',
                        borderRadius: '8px',
                        textAlign: 'center',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        console.log('点击设为管理员按钮，当前角色:', selectedUser.role);
                        if (selectedUser.role !== 'admin') {
                          changeUserRole(selectedUser.id, 'admin');
                        } else {
                          Taro.showToast({
                            title: '用户已经是管理员',
                            icon: 'none',
                          });
                        }
                      }}
                    >
                      <Text className="block">设为管理员</Text>
                    </View>
                  </View>
                </View>

                {/* 修改状态 */}
                <View className="bg-slate-800 rounded-lg p-4">
                  <Text className="text-slate-400 text-sm mb-2 block">修改状态</Text>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap' }}>
                    {(selectedUser.status as 'active' | 'disabled' | 'deleted') !== 'active' && (
                      <View
                        style={{
                          flex: 1,
                          minWidth: '80px',
                          padding: '8px 16px',
                          backgroundColor: '#22c55e',
                          color: '#ffffff',
                          borderRadius: '8px',
                          textAlign: 'center',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => {
                          console.log('点击激活按钮，当前状态:', selectedUser.status);
                          changeUserStatus(selectedUser.id, 'active');
                        }}
                      >
                        <Text className="block">激活</Text>
                      </View>
                    )}
                    {(selectedUser.status as 'active' | 'disabled' | 'deleted') !== 'disabled' && (
                      <View
                        style={{
                          flex: 1,
                          minWidth: '80px',
                          padding: '8px 16px',
                          backgroundColor: '#eab308',
                          color: '#ffffff',
                          borderRadius: '8px',
                          textAlign: 'center',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => {
                          console.log('点击禁用按钮，当前状态:', selectedUser.status);
                          changeUserStatus(selectedUser.id, 'disabled');
                        }}
                      >
                        <Text className="block">禁用</Text>
                      </View>
                    )}
                    {(selectedUser.status as 'active' | 'disabled' | 'deleted') !== 'deleted' && (
                      <View
                        style={{
                          flex: 1,
                          minWidth: '80px',
                          padding: '8px 16px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          borderRadius: '8px',
                          textAlign: 'center',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => {
                          console.log('点击删除按钮，当前状态:', selectedUser.status);
                          Taro.showModal({
                            title: '确认删除',
                            content: '确定要删除该用户吗？此操作不可恢复。',
                            success: (res) => {
                              if (res.confirm) {
                                changeUserStatus(selectedUser.id, 'deleted');
                              }
                            }
                          });
                        }}
                      >
                        <Text className="block">删除</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
