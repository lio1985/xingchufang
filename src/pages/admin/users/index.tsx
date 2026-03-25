import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Search,
  ListListFilter,
  RefreshCw,
  ChevronRight,
  User,
  Shield,
  CircleCheck,
  CircleX,
  X,
  Inbox,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

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
  const [roleListFilter, setRoleListFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusListFilter, setStatusListFilter] = useState<'all' | 'active' | 'pending' | 'disabled' | 'deleted'>('all');
  const [showListFilters, setShowListFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
          role: roleListFilter === 'all' ? undefined : roleListFilter,
          status: statusListFilter === 'all' ? undefined : statusListFilter,
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
  }, [roleListFilter, statusListFilter, searchText]);

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
    try {
      const res = await Network.request({
        url: `/api/admin/users/${userId}/role`,
        method: 'PUT',
        data: { role: newRole },
      });

      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '角色已修改', icon: 'success' });
        handleRefresh();
      }
    } catch (error: any) {
      Taro.showToast({ title: error.message || '修改失败', icon: 'none' });
    }
  };

  const changeUserStatus = async (userId: string, newStatus: 'active' | 'disabled' | 'deleted') => {
    try {
      const res = await Network.request({
        url: `/api/admin/users/${userId}/status`,
        method: 'PUT',
        data: { status: newStatus },
      });

      if (res.data && res.data.code === 200) {
        Taro.showToast({ title: '状态已修改', icon: 'success' });
        handleRefresh();
        if (selectedUser?.id === userId) {
          setShowDetailModal(false);
        }
      }
    } catch (error: any) {
      Taro.showToast({ title: error.message || '修改失败', icon: 'none' });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'disabled':
        return 'status-disabled';
      default:
        return 'status-disabled';
    }
  };

  const getStatusBadgeText = (status: string) => {
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

  const getRoleBadgeClass = (role: string) => {
    return role === 'admin' ? 'status-admin' : 'status-active';
  };

  const getRoleBadgeText = (role: string) => {
    return role === 'admin' ? '管理员' : '用户';
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header" style={{ paddingBottom: '16px' }}>
        <View className="admin-header-content">
          <Text className="admin-title">用户管理</Text>
          <View
            style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#1a1a1d' }}
            onClick={handleRefresh}
          >
            <RefreshCw size={24} color={loading ? '#52525b' : '#f59e0b'} />
          </View>
        </View>

        {/* 搜索框 */}
        <View className="search-box" style={{ marginTop: '16px' }}>
          <Search size={28} color="#71717a" />
          <Input
            className="search-input"
            placeholder="搜索用户名、姓名、员工ID..."
            placeholderStyle="color: #52525b"
            value={searchText}
            onInput={(e) => handleSearch(e.detail.value)}
          />
          <View
            style={{ padding: '8px', borderRadius: '8px', backgroundColor: showListFilters ? '#f59e0b' : '#1a1a1d' }}
            onClick={() => setShowListFilters(!showListFilters)}
          >
            <ListFilter size={20} color={showListFilters ? '#000' : '#71717a'} />
          </View>
        </View>

        {/* 筛选器 */}
        {showListFilters && (
          <View style={{ marginTop: '16px' }}>
            <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
              角色
            </Text>
            <View className="filter-bar">
              <View
                className={`filter-item ${roleListFilter === 'all' ? 'filter-item-active' : ''}`}
                onClick={() => setRoleListFilter('all')}
              >
                全部
              </View>
              <View
                className={`filter-item ${roleListFilter === 'user' ? 'filter-item-active' : ''}`}
                onClick={() => setRoleListFilter('user')}
              >
                用户
              </View>
              <View
                className={`filter-item ${roleListFilter === 'admin' ? 'filter-item-active' : ''}`}
                onClick={() => setRoleListFilter('admin')}
              >
                管理员
              </View>
            </View>

            <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', marginTop: '12px', display: 'block' }}>
              状态
            </Text>
            <View className="filter-bar">
              <View
                className={`filter-item ${statusListFilter === 'all' ? 'filter-item-active' : ''}`}
                onClick={() => setStatusListFilter('all')}
              >
                全部
              </View>
              <View
                className={`filter-item ${statusListFilter === 'active' ? 'filter-item-active' : ''}`}
                onClick={() => setStatusListFilter('active')}
              >
                正常
              </View>
              <View
                className={`filter-item ${statusListFilter === 'pending' ? 'filter-item-active' : ''}`}
                onClick={() => setStatusListFilter('pending')}
              >
                待审核
              </View>
              <View
                className={`filter-item ${statusListFilter === 'disabled' ? 'filter-item-active' : ''}`}
                onClick={() => setStatusListFilter('disabled')}
              >
                禁用
              </View>
            </View>
          </View>
        )}

        {/* 统计信息 */}
        <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <Text style={{ fontSize: '22px', color: '#71717a' }}>共 {total} 位用户</Text>
          <Text style={{ fontSize: '22px', color: '#71717a' }}>第 {page} 页</Text>
        </View>
      </View>

      {/* 用户列表 */}
      <ScrollView
        className="flex-1"
        scrollY
        style={{ height: 'calc(100vh - 200px)', marginTop: '200px' }}
        onScrollToLower={handleLoadMore}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {users.length === 0 && !loading ? (
            <View className="empty-state">
              <Inbox size={80} color="#71717a" />
              <Text className="empty-title">暂无用户数据</Text>
            </View>
          ) : (
            users.map((user) => (
              <View key={user.id} className="user-list-item" onClick={() => showUserDetail(user)}>
                <View className="user-avatar">
                  <User size={28} color="#f59e0b" />
                </View>

                <View className="user-info">
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text className="user-name">{user.username}</Text>
                    {user.employeeId && (
                      <View
                        style={{
                          padding: '2px 8px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '6px',
                        }}
                      >
                        <Text style={{ fontSize: '18px', color: '#10b981', fontFamily: 'monospace' }}>
                          #{user.employeeId}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <View className={`status-badge ${getRoleBadgeClass(user.role)}`}>
                      {getRoleBadgeText(user.role)}
                    </View>
                    <View className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                      {getStatusBadgeText(user.status)}
                    </View>
                  </View>
                  {user.profile?.realName && (
                    <Text className="user-meta">{user.profile.realName}</Text>
                  )}
                </View>

                <ChevronRight size={24} color="#52525b" />
              </View>
            ))
          )}

          {loading && (
            <View className="loading-state">
              <RefreshCw size={48} color="#f59e0b" />
              <Text className="loading-text">加载中...</Text>
            </View>
          )}

          {!loading && users.length >= total && users.length > 0 && (
            <View style={{ textAlign: 'center', padding: '16px 0' }}>
              <Text style={{ fontSize: '22px', color: '#52525b' }}>已加载全部数据</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 用户详情弹窗 */}
      {showDetailModal && selectedUser && (
        <View className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">用户详情</Text>
              <View onClick={() => setShowDetailModal(false)}>
                <X size={28} color="#71717a" />
              </View>
            </View>

            {/* 用户信息 */}
            <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <View className="user-avatar" style={{ width: '80px', height: '80px' }}>
                <User size={36} color="#f59e0b" />
              </View>
              <View>
                <Text style={{ fontSize: '32px', fontWeight: '700', color: '#fafafa', display: 'block' }}>
                  {selectedUser.username}
                </Text>
                <View style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <View className={`status-badge ${getRoleBadgeClass(selectedUser.role)}`}>
                    {getRoleBadgeText(selectedUser.role)}
                  </View>
                  <View className={`status-badge ${getStatusBadgeClass(selectedUser.status)}`}>
                    {getStatusBadgeText(selectedUser.status)}
                  </View>
                </View>
              </View>
            </View>

            {/* 基本信息 */}
            <View className="admin-card" style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', marginBottom: '12px', display: 'block' }}>
                基本信息
              </Text>
              {selectedUser.profile?.realName && (
                <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>姓名</Text>
                  <Text style={{ fontSize: '22px', color: '#fafafa' }}>{selectedUser.profile.realName}</Text>
                </View>
              )}
              {selectedUser.profile?.department && (
                <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>部门</Text>
                  <Text style={{ fontSize: '22px', color: '#fafafa' }}>{selectedUser.profile.department}</Text>
                </View>
              )}
              <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <Text style={{ fontSize: '22px', color: '#71717a' }}>注册时间</Text>
                <Text style={{ fontSize: '22px', color: '#fafafa' }}>
                  {new Date(selectedUser.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
            </View>

            {/* 用户统计 */}
            {selectedUser.statistics && (
              <View className="admin-card" style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', marginBottom: '12px', display: 'block' }}>
                  活跃统计
                </Text>
                <View style={{ display: 'flex', gap: '24px' }}>
                  <View style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                      {selectedUser.statistics.conversationCount}
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>对话</Text>
                  </View>
                  <View style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>
                      {selectedUser.statistics.messageCount}
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>消息</Text>
                  </View>
                  <View style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '32px', fontWeight: '700', color: '#a855f7' }}>
                      {selectedUser.statistics.fileCount}
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a' }}>文件</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 操作按钮 */}
            <View className="action-buttons">
              {selectedUser.status === 'pending' && (
                <>
                  <View
                    className="action-button action-button-primary"
                    onClick={() => changeUserStatus(selectedUser.id, 'active')}
                  >
                    <CircleCheck size={20} color="#000" />
                    <Text style={{ marginLeft: '8px' }}>批准</Text>
                  </View>
                  <View
                    className="action-button action-button-danger"
                    onClick={() => changeUserStatus(selectedUser.id, 'disabled')}
                  >
                    <CircleX size={20} color="#ef4444" />
                    <Text style={{ marginLeft: '8px' }}>拒绝</Text>
                  </View>
                </>
              )}

              {selectedUser.status === 'active' && (
                <>
                  <View
                    className="action-button action-button-secondary"
                    onClick={() => changeUserStatus(selectedUser.id, 'disabled')}
                  >
                    <CircleX size={20} color="#71717a" />
                    <Text style={{ marginLeft: '8px' }}>禁用</Text>
                  </View>
                  <View
                    className="action-button action-button-secondary"
                    onClick={() => changeUserRole(selectedUser.id, selectedUser.role === 'admin' ? 'user' : 'admin')}
                  >
                    <Shield size={20} color="#71717a" />
                    <Text style={{ marginLeft: '8px' }}>
                      {selectedUser.role === 'admin' ? '设为用户' : '设为管理员'}
                    </Text>
                  </View>
                </>
              )}

              {selectedUser.status === 'disabled' && (
                <View
                  className="action-button action-button-primary"
                  style={{ width: '100%' }}
                  onClick={() => changeUserStatus(selectedUser.id, 'active')}
                >
                  <CircleCheck size={20} color="#000" />
                  <Text style={{ marginLeft: '8px' }}>恢复</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
