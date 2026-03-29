import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Search,
  ListFilter,
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
      // 构建查询参数，过滤掉 undefined 值
      const params: Record<string, any> = {
        page: pageNum,
        pageSize,
      };
      
      // 只添加有值的参数
      if (roleListFilter !== 'all') {
        params.role = roleListFilter;
      }
      if (statusListFilter !== 'all') {
        params.status = statusListFilter;
      }
      if (searchText) {
        params.search = searchText;
      }

      const res = await Network.request({
        url: '/api/admin/users',
        method: 'GET',
        data: params,
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.2)' };
      case 'pending':
        return { color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.2)' };
      case 'disabled':
        return { color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.2)' };
      default:
        return { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.2)' };
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

  const getRoleBadgeStyle = (role: string) => {
    return role === 'admin' 
      ? { color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' }
      : { color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.2)' };
  };

  const getRoleBadgeText = (role: string) => {
    return role === 'admin' ? '管理员' : '用户';
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>用户管理</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>共 {total} 位用户</Text>
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px' }}>
          <Search size={20} color="#71717a" />
          <Input
            style={{ flex: 1, fontSize: '14px', color: '#ffffff' }}
            placeholder="搜索用户名、姓名、员工ID..."
            placeholderStyle="color: #64748b"
            value={searchText}
            onInput={(e) => handleSearch(e.detail.value)}
          />
          <View
            style={{ padding: '8px', borderRadius: '8px', backgroundColor: showListFilters ? '#38bdf8' : '#1e3a5f' }}
            onClick={() => setShowListFilters(!showListFilters)}
          >
            <ListFilter size={18} color={showListFilters ? '#000' : '#71717a'} />
          </View>
        </View>

        {/* 筛选器 */}
        {showListFilters && (
          <View style={{ marginTop: '16px' }}>
            <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px', display: 'block' }}>角色</Text>
            <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'user', 'admin'].map((role) => (
                <View
                  key={role}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: roleListFilter === role ? '#38bdf8' : '#1e3a5f',
                  }}
                  onClick={() => setRoleListFilter(role as any)}
                >
                  <Text style={{ fontSize: '13px', color: roleListFilter === role ? '#000' : '#94a3b8' }}>
                    {role === 'all' ? '全部' : role === 'user' ? '用户' : '管理员'}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px', marginTop: '12px', display: 'block' }}>状态</Text>
            <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'active', 'pending', 'disabled'].map((status) => (
                <View
                  key={status}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: statusListFilter === status ? '#38bdf8' : '#1e3a5f',
                  }}
                  onClick={() => setStatusListFilter(status as any)}
                >
                  <Text style={{ fontSize: '13px', color: statusListFilter === status ? '#000' : '#94a3b8' }}>
                    {status === 'all' ? '全部' : status === 'active' ? '正常' : status === 'pending' ? '待审核' : '禁用'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 用户列表 */}
      <ScrollView
        scrollY
        style={{ height: 'calc(100vh - 180px)' }}
        onScrollToLower={handleLoadMore}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View style={{ padding: '16px 20px' }}>
          {users.length === 0 && !loading ? (
            <View style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Inbox size={64} color="#71717a" />
              <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '16px' }}>暂无用户数据</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
              {users.map((user, index) => {
                const statusStyle = getStatusBadgeStyle(user.status);
                const roleStyle = getRoleBadgeStyle(user.role);
                return (
                  <View
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 16px',
                      borderBottom: index < users.length - 1 ? '1px solid #1e3a5f' : 'none',
                    }}
                    onClick={() => showUserDetail(user)}
                  >
                    <View style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={22} color="#38bdf8" />
                    </View>

                    <View style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff' }}>{user.username}</Text>
                        {user.employeeId && (
                          <View style={{ padding: '2px 8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '6px' }}>
                            <Text style={{ fontSize: '11px', color: '#10b981', fontFamily: 'monospace' }}>#{user.employeeId}</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <View style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: roleStyle.bgColor }}>
                          <Text style={{ fontSize: '11px', color: roleStyle.color }}>{getRoleBadgeText(user.role)}</Text>
                        </View>
                        <View style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: statusStyle.bgColor }}>
                          <Text style={{ fontSize: '11px', color: statusStyle.color }}>{getStatusBadgeText(user.status)}</Text>
                        </View>
                      </View>
                    </View>

                    <ChevronRight size={18} color="#64748b" />
                  </View>
                );
              })}

              {loading && (
                <View style={{ padding: '20px', textAlign: 'center' }}>
                  <RefreshCw size={24} color="#38bdf8" />
                  <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '8px' }}>加载中...</Text>
                </View>
              )}

              {!loading && users.length >= total && users.length > 0 && (
                <View style={{ padding: '16px', textAlign: 'center' }}>
                  <Text style={{ fontSize: '12px', color: '#64748b' }}>已加载全部数据</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 用户详情弹窗 */}
      {showDetailModal && selectedUser && (
        <View 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}
          onClick={() => setShowDetailModal(false)}
        >
          <View 
            style={{ width: '100%', backgroundColor: '#111827', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>用户详情</Text>
              <View style={{ padding: '8px' }} onClick={() => setShowDetailModal(false)}>
                <X size={20} color="#71717a" />
              </View>
            </View>

            {/* 用户信息 */}
            <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <View style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={28} color="#38bdf8" />
              </View>
              <View>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>
                  {selectedUser.username}
                </Text>
                <View style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <View style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: getRoleBadgeStyle(selectedUser.role).bgColor }}>
                    <Text style={{ fontSize: '12px', color: getRoleBadgeStyle(selectedUser.role).color }}>{getRoleBadgeText(selectedUser.role)}</Text>
                  </View>
                  <View style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: getStatusBadgeStyle(selectedUser.status).bgColor }}>
                    <Text style={{ fontSize: '12px', color: getStatusBadgeStyle(selectedUser.status).color }}>{getStatusBadgeText(selectedUser.status)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 基本信息 */}
            <View style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', display: 'block' }}>基本信息</Text>
              {selectedUser.profile?.realName && (
                <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text style={{ fontSize: '13px', color: '#71717a' }}>姓名</Text>
                  <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{selectedUser.profile.realName}</Text>
                </View>
              )}
              {selectedUser.profile?.department && (
                <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text style={{ fontSize: '13px', color: '#71717a' }}>部门</Text>
                  <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{selectedUser.profile.department}</Text>
                </View>
              )}
              <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <Text style={{ fontSize: '13px', color: '#71717a' }}>注册时间</Text>
                <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>
                  {new Date(selectedUser.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
            </View>

            {/* 用户统计 */}
            {selectedUser.statistics && (
              <View style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', display: 'block' }}>活跃统计</Text>
                <View style={{ display: 'flex', gap: '24px' }}>
                  <View style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '24px', fontWeight: '700', color: '#60a5fa', display: 'block' }}>
                      {selectedUser.statistics.conversationCount}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>对话</Text>
                  </View>
                  <View style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80', display: 'block' }}>
                      {selectedUser.statistics.messageCount}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>消息</Text>
                  </View>
                  <View style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '24px', fontWeight: '700', color: '#a855f7', display: 'block' }}>
                      {selectedUser.statistics.fileCount}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>文件</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 操作按钮 */}
            <View style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selectedUser.status === 'pending' && (
                <>
                  <View
                    style={{ flex: 1, backgroundColor: '#4ade80', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => changeUserStatus(selectedUser.id, 'active')}
                  >
                    <CircleCheck size={18} color="#000" />
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>批准</Text>
                  </View>
                  <View
                    style={{ flex: 1, backgroundColor: '#1e3a5f', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => changeUserStatus(selectedUser.id, 'disabled')}
                  >
                    <CircleX size={18} color="#f87171" />
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f87171' }}>拒绝</Text>
                  </View>
                </>
              )}

              {selectedUser.status === 'active' && (
                <>
                  <View
                    style={{ flex: 1, backgroundColor: '#1e3a5f', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => changeUserStatus(selectedUser.id, 'disabled')}
                  >
                    <CircleX size={18} color="#71717a" />
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>禁用</Text>
                  </View>
                  <View
                    style={{ flex: 1, backgroundColor: '#1e3a5f', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => changeUserRole(selectedUser.id, selectedUser.role === 'admin' ? 'user' : 'admin')}
                  >
                    <Shield size={18} color="#71717a" />
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
                      {selectedUser.role === 'admin' ? '设为用户' : '设为管理员'}
                    </Text>
                  </View>
                </>
              )}

              {selectedUser.status === 'disabled' && (
                <View
                  style={{ width: '100%', backgroundColor: '#4ade80', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => changeUserStatus(selectedUser.id, 'active')}
                >
                  <CircleCheck size={18} color="#000" />
                  <Text style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>恢复</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
