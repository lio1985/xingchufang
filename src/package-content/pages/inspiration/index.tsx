import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Plus,
  Lightbulb,
  Search,
  Trash2,
  X,
  Check,
  RefreshCw,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Inspiration {
  id: string;
  content: string;
  tags?: string[];
  category?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

interface Statistics {
  total: number;
  byCategory: Record<string, number>;
  byTag: Record<string, number>;
}

const CATEGORIES = [
  { value: 'content', label: '内容灵感', color: '#f43f5e' },
  { value: 'marketing', label: '营销灵感', color: '#8b5cf6' },
  { value: 'product', label: '产品灵感', color: '#06b6d4' },
  { value: 'story', label: '故事灵感', color: '#f59e0b' },
  { value: 'other', label: '其他', color: '#64748b' },
];

export default function InspirationPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // 表单状态
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCategory, setNewCategory] = useState('content');

  const loadInspirations = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/inspirations',
        method: 'GET',
      });

      if (res.data?.code === 200) {
        let data = res.data.data || [];
        
        // 本地筛选
        if (keyword) {
          data = data.filter((item: Inspiration) => 
            item.content.toLowerCase().includes(keyword.toLowerCase()) ||
            item.tags?.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
          );
        }
        
        if (selectedCategory) {
          data = data.filter((item: Inspiration) => item.category === selectedCategory);
        }
        
        setInspirations(data);
        
        // 计算统计
        const stats: Statistics = {
          total: data.length,
          byCategory: {},
          byTag: {},
        };
        
        data.forEach((item: Inspiration) => {
          if (item.category) {
            stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
          }
          item.tags?.forEach(tag => {
            stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
          });
        });
        
        setStatistics(stats);
      }
    } catch (error) {
      console.error('加载灵感列表失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspirations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleAdd = async () => {
    if (!newContent.trim()) {
      Taro.showToast({ title: '请输入灵感内容', icon: 'none' });
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/inspirations',
        method: 'POST',
        data: {
          content: newContent.trim(),
          tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
          category: newCategory,
          source: '手动记录',
        },
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setShowAddModal(false);
        setNewContent('');
        setNewTags('');
        setNewCategory('content');
        loadInspirations();
      } else {
        throw new Error(res.data?.msg || '添加失败');
      }
    } catch (error: any) {
      Taro.showToast({ title: error.message || '添加失败', icon: 'none' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条灵感吗？',
    });
    
    if (!confirm.confirm) return;

    try {
      const res = await Network.request({
        url: `/api/inspirations/${id}`,
        method: 'DELETE',
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '删除成功', icon: 'success' });
        loadInspirations();
      } else {
        throw new Error(res.data?.msg || '删除失败');
      }
    } catch (error: any) {
      Taro.showToast({ title: error.message || '删除失败', icon: 'none' });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getCategoryInfo = (category?: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[4];
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
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
        onClick={() => setShowAddModal(false)}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: '#111827',
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px calc(24px + env(safe-area-inset-bottom))',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>记录灵感</Text>
            <View onClick={() => setShowAddModal(false)} style={{ padding: '8px' }}>
              <X size={20} color="#64748b" />
            </View>
          </View>

          {/* 内容输入 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>灵感内容</Text>
            <View style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #1e3a5f',
              padding: '12px',
            }}
            >
              <Textarea
                style={{ width: '100%', minHeight: '100px', fontSize: '15px', color: '#f1f5f9' }}
                placeholder="记录你的灵感..."
                value={newContent}
                onInput={(e) => setNewContent(e.detail.value)}
                maxlength={500}
              />
            </View>
          </View>

          {/* 分类选择 */}
          <View style={{ marginBottom: '16px' }}>
            <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>选择分类</Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map((cat) => (
                <View
                  key={cat.value}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: newCategory === cat.value ? cat.color : '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => setNewCategory(cat.value)}
                >
                  <Text style={{ fontSize: '13px', color: newCategory === cat.value ? '#fff' : '#94a3b8' }}>
                    {cat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 标签输入 */}
          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>标签（用逗号分隔）</Text>
            <View style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #1e3a5f',
              padding: '12px',
            }}
            >
              <Textarea
                style={{ width: '100%', minHeight: '60px', fontSize: '15px', color: '#f1f5f9' }}
                placeholder="例如：美食,短视频,热点"
                value={newTags}
                onInput={(e) => setNewTags(e.detail.value)}
                maxlength={100}
              />
            </View>
          </View>

          {/* 提交按钮 */}
          <View
            style={{
              backgroundColor: '#38bdf8',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onClick={handleAdd}
          >
            <Check size={18} color="#000" />
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#000' }}>保存灵感</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <View
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={24} color="#f1f5f9" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>灵感库</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>记录和管理你的灵感</Text>
          </View>
          <View onClick={loadInspirations} style={{ padding: '8px' }}>
            <RefreshCw size={20} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        >
          <Search size={18} color="#64748b" />
          <View style={{ flex: 1 }}>
            <Textarea
              style={{ fontSize: '14px', color: '#f1f5f9', width: '100%' }}
              placeholder="搜索灵感..."
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              onConfirm={loadInspirations}
            />
          </View>
        </View>

        {/* 分类筛选 */}
        <View style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto' }}>
          <View
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: !selectedCategory ? '#38bdf8' : '#1e293b',
              flexShrink: 0,
            }}
            onClick={() => setSelectedCategory('')}
          >
            <Text style={{ fontSize: '13px', color: !selectedCategory ? '#000' : '#94a3b8' }}>全部</Text>
          </View>
          {CATEGORIES.map((cat) => (
            <View
              key={cat.value}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: selectedCategory === cat.value ? cat.color : '#1e293b',
                flexShrink: 0,
              }}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <Text style={{ fontSize: '13px', color: selectedCategory === cat.value ? '#fff' : '#94a3b8' }}>{cat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 统计卡片 */}
      {statistics && (
        <View style={{ padding: '16px 20px', display: 'flex', gap: '12px' }}>
          <View style={{
            flex: 1,
            backgroundColor: '#111827',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #1e3a5f',
          }}
          >
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{statistics.total}</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>总灵感数</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#111827',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #1e3a5f',
          }}
          >
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#38bdf8', display: 'block' }}>
              {Object.keys(statistics.byCategory).length}
            </Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>分类数</Text>
          </View>
        </View>
      )}

      {/* 灵感列表 */}
      <ScrollView scrollY style={{ padding: '0 20px' }}>
        {inspirations.length > 0 ? (
          inspirations.map((item) => {
            const categoryInfo = getCategoryInfo(item.category);
            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: '#111827',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #1e3a5f',
                }}
              >
                {/* 头部 */}
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <View style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: categoryInfo.color + '20',
                    }}
                    >
                      <Text style={{ fontSize: '12px', color: categoryInfo.color }}>{categoryInfo.label}</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(item.created_at)}</Text>
                  </View>
                  <View
                    style={{ padding: '4px' }}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} color="#f87171" />
                  </View>
                </View>

                {/* 内容 */}
                <Text style={{ fontSize: '15px', color: '#f1f5f9', lineHeight: 1.6, display: 'block' }}>
                  {item.content}
                </Text>

                {/* 标签 */}
                {item.tags && item.tags.length > 0 && (
                  <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {item.tags.map((tag, index) => (
                      <View key={index} style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#1e293b',
                      }}
                      >
                        <Text style={{ fontSize: '12px', color: '#94a3b8' }}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ padding: '40px 0', textAlign: 'center' }}>
            <Lightbulb size={48} color="#1e3a5f" />
            <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginTop: '12px' }}>
              {keyword || selectedCategory ? '没有找到匹配的灵感' : '暂无灵感，点击右下角添加'}
            </Text>
          </View>
        )}
        <View style={{ height: '20px' }} />
      </ScrollView>

      {/* 浮动添加按钮 */}
      <View
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '80px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(56, 189, 248, 0.4)',
        }}
        onClick={() => setShowAddModal(true)}
      >
        <Plus size={28} color="#000" />
      </View>

      {/* 添加弹窗 */}
      {renderAddModal()}
    </View>
  );
}
