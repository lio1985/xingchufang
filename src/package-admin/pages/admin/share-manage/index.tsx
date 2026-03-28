import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import {
  Link2,
  RefreshCw,
  Search,
  ChevronLeft,
  X,
  Globe,
  Lock,
  Users,
  Building2,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

interface SharePermission {
  id: string;
  lexiconId: string;
  lexiconName: string;
  shareScope: 'private' | 'department' | 'all' | 'custom';
  targetUsers: Array<{
    id: string;
    name: string;
    department: string;
  }>;
  targetDepartments: string[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

const ShareManagePage = () => {
  const [permissions, setPermissions] = useState<SharePermission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<SharePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');

  const filterPermissions = useCallback(() => {
    let filtered = permissions;

    if (searchKeyword) {
      filtered = filtered.filter((item) =>
        item.lexiconName.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (scopeFilter !== 'all') {
      filtered = filtered.filter((item) => item.shareScope === scopeFilter);
    }

    setFilteredPermissions(filtered);
  }, [permissions, searchKeyword, scopeFilter]);

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [filterPermissions]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/admin/share/permissions',
        data: { page: 1, pageSize: 100 },
      });

      if (response.data?.success && response.data?.data) {
        setPermissions(response.data.data);
      } else {
        // 模拟数据
        setPermissions([
          {
            id: '1',
            lexiconId: 'l1',
            lexiconName: '产品介绍语料库',
            shareScope: 'department',
            targetUsers: [],
            targetDepartments: ['市场部', '销售部'],
            createdBy: { id: 'u1', name: '张三' },
            createdAt: '2024-03-20',
          },
          {
            id: '2',
            lexiconId: 'l2',
            lexiconName: '客户服务话术',
            shareScope: 'all',
            targetUsers: [],
            targetDepartments: [],
            createdBy: { id: 'u2', name: '李四' },
            createdAt: '2024-03-18',
          },
          {
            id: '3',
            lexiconId: 'l3',
            lexiconName: '营销推广文案',
            shareScope: 'custom',
            targetUsers: [
              { id: 'u1', name: '张三', department: '市场部' },
              { id: 'u2', name: '李四', department: '销售部' },
            ],
            targetDepartments: [],
            createdBy: { id: 'u3', name: '王五' },
            createdAt: '2024-03-19',
          },
        ]);
      }
    } catch (error) {
      console.error('加载共享权限失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (permission: SharePermission) => {
    const confirm = await Taro.showModal({
      title: '撤销共享',
      content: `确定要撤销"${permission.lexiconName}"的共享权限吗？`,
    });

    if (confirm.confirm) {
      try {
        const response = await Network.request({
          url: `/api/admin/share/permissions/${permission.id}`,
          method: 'DELETE',
        });

        if (response.data?.success) {
          Taro.showToast({ title: '撤销成功', icon: 'success' });
          loadPermissions();
        } else {
          Taro.showToast({ title: response.data?.message || '撤销失败', icon: 'none' });
        }
      } catch (error) {
        console.error('撤销共享失败:', error);
        Taro.showToast({ title: '撤销失败', icon: 'none' });
      }
    }
  };

  const scopeFilters = [
    { value: 'all', label: '全部', color: '#38bdf8' },
    { value: 'private', label: '私有', color: '#71717a' },
    { value: 'department', label: '部门', color: '#60a5fa' },
    { value: 'all-users', label: '全员', color: '#4ade80' },
    { value: 'custom', label: '指定', color: '#ec4899' },
  ];

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'all':
        return <Globe size={24} color="#4ade80" />;
      case 'department':
        return <Building2 size={24} color="#60a5fa" />;
      case 'custom':
        return <Users size={24} color="#ec4899" />;
      default:
        return <Lock size={24} color="#71717a" />;
    }
  };

  const getScopeLabel = (scope: string) => {
    const map: Record<string, string> = {
      private: '私有',
      department: '部门共享',
      all: '全员可见',
      custom: '指定用户',
    };
    return map[scope] || '私有';
  };

  const getScopeBgColor = (scope: string) => {
    switch (scope) {
      case 'all':
        return 'rgba(34, 197, 94, 0.1)';
      case 'department':
        return 'rgba(59, 130, 246, 0.1)';
      case 'custom':
        return 'rgba(236, 72, 153, 0.1)';
      default:
        return 'rgba(113, 113, 122, 0.1)';
    }
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={22} color="#38bdf8" />
          </View>
          <Text className="admin-title">共享管理</Text>
          <View
            className="admin-action-btn"
            onClick={loadPermissions}
          >
            <RefreshCw size={22} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>

        {/* 搜索栏 */}
        <View className="search-bar-wrapper" style={{ marginTop: '16px' }}>
          <Search size={24} color="#64748b" />
          <Input
            className="search-input"
            placeholder="搜索语料库..."
            placeholderStyle="color: #64748b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
          {searchKeyword && (
            <View onClick={() => setSearchKeyword('')}>
              <X size={24} color="#64748b" />
            </View>
          )}
        </View>

        {/* 范围筛选 */}
        <ScrollView scrollX style={{ marginTop: '16px', whiteSpace: 'nowrap' }}>
          <View style={{ display: 'inline-flex', gap: '12px', paddingRight: '24px' }}>
            {scopeFilters.map((filter) => (
              <View
                key={filter.value}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  backgroundColor: scopeFilter === filter.value ? filter.color : '#1e293b',
                  flexShrink: 0,
                }}
                onClick={() => setScopeFilter(filter.value)}
              >
                <Text
                  style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    color: scopeFilter === filter.value ? '#000' : '#94a3b8',
                  }}
                >
                  {filter.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)', marginTop: '160px' }}>
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {filteredPermissions.length === 0 ? (
            <View className="empty-state">
              <Link2 size={80} color="#71717a" />
              <Text className="empty-title">暂无共享记录</Text>
              <Text className="empty-desc">语料库共享权限将显示在这里</Text>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPermissions.map((permission) => (
                <View key={permission.id} className="admin-card">
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>
                        {permission.lexiconName}
                      </Text>
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        backgroundColor: getScopeBgColor(permission.shareScope),
                      }}
                    >
                      {getScopeIcon(permission.shareScope)}
                      <Text style={{ fontSize: '20px', color: '#94a3b8' }}>
                        {getScopeLabel(permission.shareScope)}
                      </Text>
                    </View>
                  </View>

                  {/* 共享对象详情 */}
                  {permission.shareScope === 'department' && permission.targetDepartments.length > 0 && (
                    <View style={{ marginTop: '12px' }}>
                      <Text style={{ fontSize: '20px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
                        共享部门
                      </Text>
                      <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {permission.targetDepartments.map((dept, index) => (
                          <View
                            key={index}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            }}
                          >
                            <Text style={{ fontSize: '20px', color: '#60a5fa' }}>{dept}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {permission.shareScope === 'custom' && permission.targetUsers.length > 0 && (
                    <View style={{ marginTop: '12px' }}>
                      <Text style={{ fontSize: '20px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
                        共享用户
                      </Text>
                      <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {permission.targetUsers.map((user) => (
                          <View
                            key={user.id}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(236, 72, 153, 0.1)',
                            }}
                          >
                            <Text style={{ fontSize: '20px', color: '#ec4899' }}>{user.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #1e3a5f',
                    }}
                  >
                    <Text style={{ fontSize: '20px', color: '#64748b' }}>
                      创建者: {permission.createdBy.name} · {permission.createdAt}
                    </Text>
                    <View
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      }}
                      onClick={() => handleRevoke(permission)}
                    >
                      <Text style={{ fontSize: '22px', color: '#f87171' }}>撤销共享</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ShareManagePage;
