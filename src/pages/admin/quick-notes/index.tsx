import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  ChevronLeft,
  StickyNote,
  Plus,
  Search,
  Trash2,
  RefreshCw,
  X,
  Clock,
  User,
} from 'lucide-react-taro';

interface QuickNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName?: string;
  isPinned?: boolean;
  tags?: string[];
}

export default function AdminQuickNotesPage() {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/admin/quick-notes',
        data: { keyword },
      });

      console.log('快速笔记响应:', res.data);

      if (res.statusCode === 200 && res.data?.data) {
        setNotes(res.data.data);
      }
    } catch (error) {
      console.error('加载笔记失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      Taro.showToast({ title: '请输入笔记内容', icon: 'none' });
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/admin/quick-notes',
        method: 'POST',
        data: { content: newNoteContent },
      });

      if (res.statusCode === 200 || res.data?.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setShowAddModal(false);
        setNewNoteContent('');
        loadNotes();
      }
    } catch (error) {
      console.error('添加笔记失败:', error);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条笔记吗？',
      confirmColor: '#f87171',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/admin/quick-notes/${noteId}`,
              method: 'DELETE',
            });
            Taro.showToast({ title: '删除成功', icon: 'success' });
            loadNotes();
          } catch (error) {
            console.error('删除笔记失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 页面头部 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'linear-gradient(180deg, #0f1a2e 0%, #0a1628 100%)',
        borderBottom: '1px solid #1e3a5f',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '12px',
        zIndex: 100,
      }}
      >
        <View style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 16px',
        }}
        >
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
              <StickyNote size={18} color="#f59e0b" />
            </View>
            <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>快速笔记</Text>
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
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} color="#000" />
            <Text style={{ fontSize: '22px', color: '#000', fontWeight: '600' }}>新建</Text>
          </View>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={{
        position: 'fixed',
        top: '80px',
        left: 0,
        right: 0,
        padding: '12px 16px',
        backgroundColor: '#0a0f1a',
        borderBottom: '1px solid #1e3a5f',
        zIndex: 99,
      }}
      >
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
            placeholder="搜索笔记内容..."
            placeholderStyle="color: #64748b"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
          />
          {keyword && (
            <View onClick={() => setKeyword('')}>
              <X size={20} color="#71717a" />
            </View>
          )}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)', marginTop: '160px' }}>
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notes.length === 0 && !loading ? (
            <View style={{
              padding: '40px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            >
              <StickyNote size={80} color="#71717a" />
              <Text style={{ fontSize: '28px', color: '#64748b', marginTop: '16px' }}>暂无笔记</Text>
              <Text style={{ fontSize: '24px', color: '#64748b', marginTop: '8px' }}>点击右上角添加新笔记</Text>
            </View>
          ) : (
            notes.map((note) => (
              <View
                key={note.id}
                style={{
                  backgroundColor: 'rgba(30, 58, 95, 0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #1e3a5f',
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="#38bdf8" />
                    <Text style={{ fontSize: '22px', color: '#94a3b8' }}>{note.userName || '未知用户'}</Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#71717a" />
                    <Text style={{ fontSize: '20px', color: '#64748b' }}>{formatDate(note.createdAt)}</Text>
                  </View>
                </View>

                <Text style={{ fontSize: '26px', color: '#f1f5f9', lineHeight: '1.6', marginBottom: '12px' }}>
                  {note.content}
                </Text>

                {note.tags && note.tags.length > 0 && (
                  <View style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {note.tags.map((tag, idx) => (
                      <View
                        key={idx}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          borderRadius: '8px',
                        }}
                      >
                        <Text style={{ fontSize: '20px', color: '#38bdf8' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

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
                      padding: '10px',
                      backgroundColor: 'rgba(248, 113, 113, 0.1)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={16} color="#f87171" />
                    <Text style={{ fontSize: '22px', color: '#f87171' }}>删除</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {loading && (
            <View style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
              <RefreshCw size={48} color="#38bdf8" />
            </View>
          )}
        </View>
      </ScrollView>

      {/* 添加笔记弹窗 */}
      {showAddModal && (
        <View style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        >
          <View style={{
            width: '90%',
            backgroundColor: '#0f1a2e',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #1e3a5f',
          }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Text style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9' }}>添加笔记</Text>
              <View onClick={() => setShowAddModal(false)}>
                <X size={24} color="#64748b" />
              </View>
            </View>

            <View style={{
              backgroundColor: 'rgba(30, 58, 95, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              border: '1px solid #1e3a5f',
            }}
            >
              <Textarea
                style={{ width: '100%', minHeight: '150px', fontSize: '26px', color: '#f1f5f9' }}
                placeholder="输入笔记内容..."
                placeholderStyle="color: #64748b"
                value={newNoteContent}
                onInput={(e) => setNewNoteContent(e.detail.value)}
              />
            </View>

            <View style={{ display: 'flex', gap: '12px' }}>
              <View style={{ flex: 1 }}>
                <Button
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    borderRadius: '10px',
                    fontSize: '26px',
                  }}
                  onClick={() => setShowAddModal(false)}
                >
                  取消
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: '#38bdf8',
                    color: '#000',
                    borderRadius: '10px',
                    fontSize: '26px',
                  }}
                  onClick={handleAddNote}
                >
                  保存
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
