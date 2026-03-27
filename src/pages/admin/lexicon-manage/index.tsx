import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import {
  BookOpen,
  RefreshCw,
  Plus,
  Search,
  ChevronLeft,
  Pencil,
  Trash2,
  Eye,
  Globe,
  Lock,
  Users,
  X,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

interface LexiconItem {
  id: string;
  name: string;
  description: string;
  category: string;
  itemCount: number;
  isShared: boolean;
  shareScope: 'private' | 'department' | 'all';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

const LexiconManagePage = () => {
  const [lexicons, setLexicons] = useState<LexiconItem[]>([]);
  const [filteredLexicons, setFilteredLexicons] = useState<LexiconItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLexiconName, setNewLexiconName] = useState('');
  const [newLexiconDesc, setNewLexiconDesc] = useState('');

  const filterLexicons = useCallback(() => {
    let filtered = lexicons;

    if (searchKeyword) {
      filtered = filtered.filter(
        (item) =>
          item.name.includes(searchKeyword) || item.description.includes(searchKeyword)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredLexicons(filtered);
  }, [lexicons, searchKeyword, categoryFilter]);

  useEffect(() => {
    loadLexicons();
  }, []);

  useEffect(() => {
    filterLexicons();
  }, [filterLexicons]);

  const loadLexicons = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/admin/lexicons',
        data: { page: 1, pageSize: 100 },
      });

      if (response.data?.success && response.data?.data) {
        setLexicons(response.data.data);
      } else {
        // 模拟数据
        setLexicons([
          {
            id: '1',
            name: '产品介绍语料库',
            description: '包含产品推广、特性介绍等内容',
            category: 'product',
            itemCount: 128,
            isShared: true,
            shareScope: 'department',
            createdAt: '2024-01-15',
            updatedAt: '2024-03-20',
            createdBy: { id: 'u1', name: '张三' },
          },
          {
            id: '2',
            name: '客户服务话术',
            description: '客服常用回复和话术模板',
            category: 'service',
            itemCount: 256,
            isShared: true,
            shareScope: 'all',
            createdAt: '2024-02-10',
            updatedAt: '2024-03-18',
            createdBy: { id: 'u2', name: '李四' },
          },
          {
            id: '3',
            name: '营销推广文案',
            description: '营销活动、促销文案集合',
            category: 'marketing',
            itemCount: 89,
            isShared: false,
            shareScope: 'private',
            createdAt: '2024-03-01',
            updatedAt: '2024-03-19',
            createdBy: { id: 'u3', name: '王五' },
          },
        ]);
      }
    } catch (error) {
      console.error('加载语料库失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lexicon: LexiconItem) => {
    const confirm = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除语料库"${lexicon.name}"吗？此操作不可恢复。`,
    });

    if (confirm.confirm) {
      try {
        const response = await Network.request({
          url: `/api/admin/lexicons/${lexicon.id}`,
          method: 'DELETE',
        });

        if (response.data?.success) {
          Taro.showToast({ title: '删除成功', icon: 'success' });
          loadLexicons();
        } else {
          Taro.showToast({ title: response.data?.message || '删除失败', icon: 'none' });
        }
      } catch (error) {
        console.error('删除语料库失败:', error);
        Taro.showToast({ title: '删除失败', icon: 'none' });
      }
    }
  };

  const handleCreate = async () => {
    if (!newLexiconName.trim()) {
      Taro.showToast({ title: '请输入语料库名称', icon: 'none' });
      return;
    }

    try {
      const response = await Network.request({
        url: '/api/admin/lexicons',
        method: 'POST',
        data: {
          name: newLexiconName.trim(),
          description: newLexiconDesc.trim(),
        },
      });

      if (response.data?.success) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setShowCreateModal(false);
        setNewLexiconName('');
        setNewLexiconDesc('');
        loadLexicons();
      } else {
        Taro.showToast({ title: response.data?.message || '创建失败', icon: 'none' });
      }
    } catch (error) {
      console.error('创建语料库失败:', error);
      Taro.showToast({ title: '创建失败', icon: 'none' });
    }
  };

  const categories = [
    { value: 'all', label: '全部', color: '#f59e0b' },
    { value: 'product', label: '产品', color: '#3b82f6' },
    { value: 'service', label: '服务', color: '#22c55e' },
    { value: 'marketing', label: '营销', color: '#ec4899' },
  ];

  const getShareIcon = (scope: string) => {
    switch (scope) {
      case 'all':
        return <Globe size={18} color="#22c55e" />;
      case 'department':
        return <Users size={18} color="#3b82f6" />;
      default:
        return <Lock size={18} color="#71717a" />;
    }
  };

  const getShareLabel = (scope: string) => {
    const map: Record<string, string> = {
      private: '私有',
      department: '部门共享',
      all: '全员可见',
    };
    return map[scope] || '私有';
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={20} color="#f59e0b" />
          </View>
          <Text className="admin-title">语料库管理</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View className="admin-action-btn" onClick={loadLexicons}>
              <RefreshCw size={20} color={loading ? '#52525b' : '#f59e0b'} />
            </View>
            <View
              style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: '#f59e0b',
              }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={24} color="#000" />
            </View>
          </View>
        </View>

        {/* 搜索栏 */}
        <View className="search-bar-wrapper" style={{ marginTop: '16px' }}>
          <Search size={24} color="#52525b" />
          <Input
            className="search-input"
            placeholder="搜索语料库..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
          {searchKeyword && (
            <View onClick={() => setSearchKeyword('')}>
              <X size={24} color="#52525b" />
            </View>
          )}
        </View>

        {/* 分类筛选 */}
        <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          {categories.map((cat) => (
            <View
              key={cat.value}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: categoryFilter === cat.value ? cat.color : '#1e293b',
              }}
              onClick={() => setCategoryFilter(cat.value)}
            >
              <Text
                style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: categoryFilter === cat.value ? '#000' : '#a1a1aa',
                }}
              >
                {cat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 180px)', marginTop: '180px' }}>
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {filteredLexicons.length === 0 ? (
            <View className="empty-state">
              <BookOpen size={80} color="#71717a" />
              <Text className="empty-title">暂无语料库</Text>
              <Text className="empty-desc">点击右上角 + 创建语料库</Text>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredLexicons.map((lexicon) => (
                <View key={lexicon.id} className="admin-card">
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text style={{ fontSize: '26px', fontWeight: '600', color: '#fafafa' }}>
                          {lexicon.name}
                        </Text>
                        {getShareIcon(lexicon.shareScope)}
                      </View>
                      <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                        {lexicon.description}
                      </Text>
                    </View>
                  </View>

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
                    <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Text style={{ fontSize: '20px', color: '#52525b' }}>
                        {lexicon.itemCount} 条内容
                      </Text>
                      <Text style={{ fontSize: '20px', color: '#52525b' }}>
                        {getShareLabel(lexicon.shareScope)}
                      </Text>
                    </View>

                    <View style={{ display: 'flex', gap: '12px' }}>
                      <View
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#1e293b',
                        }}
                        onClick={() => {
                          // 查看详情
                        }}
                      >
                        <Eye size={20} color="#3b82f6" />
                      </View>
                      <View
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#1e293b',
                        }}
                        onClick={() => {
                          Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
                        }}
                      >
                        <Pencil size={20} color="#f59e0b" />
                      </View>
                      <View
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: '#1e293b',
                        }}
                        onClick={() => handleDelete(lexicon)}
                      >
                        <Trash2 size={20} color="#ef4444" />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 创建语料库弹窗 */}
      {showCreateModal && (
        <View className="modal-overlay">
          <View className="modal-content">
            <View className="modal-header">
              <Text style={{ fontSize: '32px', fontWeight: '600', color: '#fafafa' }}>
                创建语料库
              </Text>
              <View onClick={() => setShowCreateModal(false)}>
                <X size={28} color="#71717a" />
              </View>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <View>
                <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
                  语料库名称
                </Text>
                <Input
                  className="form-input input-focus"
                  placeholder="请输入名称"
                  placeholderStyle="color: #52525b"
                  value={newLexiconName}
                  onInput={(e) => setNewLexiconName(e.detail.value)}
                />
              </View>

              <View>
                <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
                  描述（可选）
                </Text>
                <Input
                  className="form-input input-focus"
                  placeholder="请输入描述"
                  placeholderStyle="color: #52525b"
                  value={newLexiconDesc}
                  onInput={(e) => setNewLexiconDesc(e.detail.value)}
                />
              </View>
            </View>

            <View style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <View
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#1e3a5f',
                  textAlign: 'center',
                }}
                onClick={() => setShowCreateModal(false)}
              >
                <Text style={{ fontSize: '24px', color: '#a1a1aa' }}>取消</Text>
              </View>
              <View
                className="action-btn-primary"
                style={{ flex: 1 }}
                onClick={handleCreate}
              >
                <Text className="action-btn-primary-text">创建</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default LexiconManagePage;
