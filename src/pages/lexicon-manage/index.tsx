import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import {
  User,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FileText,
  Clock,
  ChevronLeft,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Lexicon {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'personal';
  created_at: string;
  updated_at?: string;
}

export default function LexiconManagePage() {
  const [lexicons, setLexicons] = useState<Lexicon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLexicon, setEditingLexicon] = useState<Lexicon | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  const [saving, setSaving] = useState(false);

  // 加载语料列表
  const loadLexicons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'GET',
        data: { type: 'personal' },
      });

      if (response.statusCode === 200 && response.data?.data) {
        const lexiconData = Array.isArray(response.data.data.items)
          ? response.data.data.items
          : [];
        setLexicons(lexiconData);
      } else {
        setLexicons([]);
      }
    } catch (error) {
      console.error('加载语料列表失败:', error);
      setLexicons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLexicons();
  }, [loadLexicons]);

  // 打开添加弹窗
  const handleOpenAddModal = () => {
    setEditingLexicon(null);
    setFormData({ title: '', content: '', category: '' });
    setShowAddModal(true);
  };

  // 打开编辑弹窗
  const handleOpenEditModal = (lexicon: Lexicon) => {
    setEditingLexicon(lexicon);
    setFormData({
      title: lexicon.title,
      content: lexicon.content,
      category: lexicon.category || '',
    });
    setShowAddModal(true);
  };

  // 保存语料
  const handleSave = async () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!formData.content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    try {
      setSaving(true);
      const saveData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category.trim(),
        type: 'personal',
      };

      if (editingLexicon) {
        await Network.request({
          url: `/api/lexicon/${editingLexicon.id}`,
          method: 'PUT',
          data: saveData,
        });
        Taro.showToast({ title: '修改成功', icon: 'success' });
      } else {
        await Network.request({
          url: '/api/lexicon',
          method: 'POST',
          data: saveData,
        });
        Taro.showToast({ title: '添加成功', icon: 'success' });
      }

      setShowAddModal(false);
      await loadLexicons();
    } catch (error) {
      console.error('保存失败:', error);
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  // 删除语料
  const handleDelete = (lexicon: Lexicon) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${lexicon.title}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/lexicon/${lexicon.id}`,
              method: 'DELETE',
            });
            Taro.showToast({ title: '删除成功', icon: 'success' });
            await loadLexicons();
          } catch (error) {
            console.error('删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  // 过滤语料
  const filteredLexicons = lexicons.filter(
    (item) =>
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  // 统计信息
  const totalCount = lexicons.length;
  const todayCount = lexicons.filter((item) => {
    const today = new Date().toDateString();
    return new Date(item.created_at).toDateString() === today;
  }).length;

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f', position: 'relative' }}>
        {/* 返回按钮 */}
        <View style={{ position: 'absolute', left: '16px', top: '48px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <ChevronLeft size={24} color="#f59e0b" />
            <Text style={{ fontSize: '14px', color: '#f59e0b' }}>返回</Text>
          </View>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={24} color="#3b82f6" />
            </View>
            <View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>个人IP语料库</Text>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>管理你的个人风格语料</Text>
            </View>
          </View>
          <View
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={handleOpenAddModal}
          >
            <Plus size={16} color="#0a0f1a" />
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0a0f1a' }}>添加</Text>
          </View>
        </View>

        {/* 数据统计 */}
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{totalCount}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>总语料数</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', display: 'block' }}>{todayCount}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>今日新增</Text>
          </View>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={{ padding: '16px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#111827',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #1e3a5f',
          }}
        >
          <Search size={18} color="#71717a" />
          <View style={{ flex: 1 }}>
            <Textarea
              style={{ width: '100%', minHeight: '20px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
              placeholder="搜索语料..."
              placeholderStyle="color: #52525b"
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
          {searchKeyword && (
            <View onClick={() => setSearchKeyword('')}>
              <X size={16} color="#71717a" />
            </View>
          )}
        </View>
      </View>

      {/* 语料列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 280px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {loading ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text style={{ color: '#71717a' }}>加载中...</Text>
            </View>
          ) : filteredLexicons.length === 0 ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <View
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid #1e3a5f',
                }}
              >
                <FileText size={28} color="#52525b" />
              </View>
              <Text style={{ color: '#71717a', fontSize: '14px', display: 'block' }}>暂无语料</Text>
              <Text style={{ color: '#52525b', fontSize: '12px', display: 'block', marginTop: '4px' }}>点击右上角添加按钮创建</Text>
            </View>
          ) : (
            filteredLexicons.map((lexicon) => (
              <View
                key={lexicon.id}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                      {lexicon.title}
                    </Text>
                    {lexicon.category && (
                      <View style={{ display: 'inline-flex', padding: '2px 8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px', marginBottom: '8px' }}>
                        <Text style={{ fontSize: '11px', color: '#3b82f6' }}>{lexicon.category}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <View
                      style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleOpenEditModal(lexicon)}
                    >
                      <Pencil size={14} color="#a1a1aa" />
                    </View>
                    <View
                      style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDelete(lexicon)}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </View>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: '13px',
                    color: '#a1a1aa',
                    display: 'block',
                    lineHeight: '20px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {lexicon.content.length > 100 ? lexicon.content.substring(0, 100) + '...' : lexicon.content}
                </Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid #1e3a5f', paddingTop: '12px' }}>
                  <Clock size={12} color="#52525b" />
                  <Text style={{ fontSize: '12px', color: '#52525b' }}>
                    {new Date(lexicon.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#111827',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              maxHeight: '80vh',
            }}
          >
            {/* 弹窗头部 */}
            <View style={{ padding: '20px', borderBottom: '1px solid #1e3a5f' }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  {editingLexicon ? '编辑语料' : '添加语料'}
                </Text>
                <View
                  style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={16} color="#a1a1aa" />
                </View>
              </View>
            </View>

            {/* 表单内容 */}
            <ScrollView scrollY style={{ padding: '20px', maxHeight: '50vh' }}>
              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>标题 *</Text>
                <View style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '24px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入标题"
                    placeholderStyle="color: #52525b"
                    value={formData.title}
                    onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
                    maxlength={100}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>分类标签</Text>
                <View style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '24px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="如：口头禅、专业术语、风格表达"
                    placeholderStyle="color: #52525b"
                    value={formData.category}
                    onInput={(e) => setFormData({ ...formData, category: e.detail.value })}
                    maxlength={50}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>内容 *</Text>
                <View style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '120px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入语料内容..."
                    placeholderStyle="color: #52525b"
                    value={formData.content}
                    onInput={(e) => setFormData({ ...formData, content: e.detail.value })}
                    maxlength={2000}
                  />
                </View>
                <Text style={{ fontSize: '12px', color: '#52525b', marginTop: '4px', display: 'block', textAlign: 'right' }}>
                  {formData.content.length}/2000
                </Text>
              </View>
            </ScrollView>

            {/* 保存按钮 */}
            <View style={{ padding: '20px', borderTop: '1px solid #1e3a5f' }}>
              <View
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: saving ? '#1e3a5f' : '#f59e0b',
                  textAlign: 'center',
                }}
                onClick={saving ? undefined : handleSave}
              >
                <Text style={{ fontSize: '15px', fontWeight: '600', color: saving ? '#71717a' : '#0a0f1a' }}>
                  {saving ? '保存中...' : '保存'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
