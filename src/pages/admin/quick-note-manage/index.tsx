import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  RefreshCw,
  Search,
  X,
  Tag,
  Pin,
  Star,
  Trash2,
  User,
  Clock,
  FileText,
  Mic,
  Check,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

// 笔记数据结构
interface Note {
  id: string;
  userId: string;
  userNickname?: string;
  title: string;
  content: string;
  tags: string[];
  isStarred: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  audio?: string;
}

export default function AdminQuickNoteManagePage() {
  // 数据状态
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTag, setActiveTag] = useState('');

  // 批量管理
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // 详情对话框
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // 标签列表
  const [allTags, setAllTags] = useState<string[]>([]);

  // 更新所有标签
  const updateAllTags = useCallback((notesList: Note[]) => {
    const tags = new Set<string>();
    notesList.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  }, []);

  // 加载数据
  const loadData = useCallback(() => {
    setLoading(true);
    try {
      Network.request({
        url: '/api/quick-notes/admin/all',
        method: 'GET',
      }).then((res: any) => {
        console.log('管理员笔记列表响应:', res.data);
        if (res.data && res.data.code === 200) {
          const data = res.data.data;
          const notesList = data.notes || data || [];
          setNotes(notesList);
          updateAllTags(notesList);
        }
      }).catch((error: any) => {
        console.error('从后端加载笔记失败:', error);
        try {
          const localNotes = Taro.getStorageSync('notes') || [];
          setNotes(localNotes);
          updateAllTags(localNotes);
        } catch (e) {
          console.error('从本地存储加载笔记失败:', e);
        }
      }).finally(() => {
        setLoading(false);
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      setLoading(false);
    }
  }, [updateAllTags]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 过滤笔记
  useEffect(() => {
    let filtered = [...notes];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(keyword) ||
        note.content.toLowerCase().includes(keyword)
      );
    }

    if (activeTag) {
      filtered = filtered.filter(note => note.tags.includes(activeTag));
    }

    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    setFilteredNotes(filtered);
  }, [notes, searchKeyword, activeTag]);

  const toggleStar = async (noteId: string) => {
    try {
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, isStarred: !note.isStarred } : note
      );
      setNotes(updatedNotes);

      await Network.request({
        url: `/api/quick-notes/${noteId}/toggle-star`,
        method: 'POST',
      });
    } catch (error: any) {
      console.error('切换星标失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
      setNotes(notes);
    }
  };

  const togglePin = async (noteId: string) => {
    try {
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      );
      setNotes(updatedNotes);

      await Network.request({
        url: `/api/quick-notes/${noteId}/toggle-pin`,
        method: 'POST',
      });
    } catch (error: any) {
      console.error('切换置顶失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
      setNotes(notes);
    }
  };

  const handleDelete = async (noteId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条笔记吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const updatedNotes = notes.filter(note => note.id !== noteId);
            setNotes(updatedNotes);
            updateAllTags(updatedNotes);

            await Network.request({
              url: `/api/quick-notes/${noteId}`,
              method: 'DELETE',
            });

            Taro.showToast({ title: '删除成功', icon: 'success' });
          } catch (error: any) {
            console.error('删除笔记失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
            setNotes(notes);
            updateAllTags(notes);
          }
        }
      }
    });
  };

  const handleBatchDelete = async () => {
    if (selectedNoteIds.length === 0) {
      Taro.showToast({ title: '请选择要删除的笔记', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedNoteIds.length} 条笔记吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const updatedNotes = notes.filter(note => !selectedNoteIds.includes(note.id));
            setNotes(updatedNotes);
            updateAllTags(updatedNotes);
            setSelectedNoteIds([]);
            setIsBatchMode(false);

            await Network.request({
              url: '/api/quick-notes/admin/batch',
              method: 'DELETE',
              data: { ids: selectedNoteIds },
            });

            Taro.showToast({ title: '删除成功', icon: 'success' });
          } catch (error: any) {
            console.error('批量删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const toggleSelect = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const openDetail = (note: Note) => {
    setSelectedNote(note);
    setShowDetailDialog(true);
  };

  const previewImage = (images: string[], index: number) => {
    Taro.previewImage({
      urls: images,
      current: images[index],
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={20} color="#38bdf8" />
          </View>
          <Text className="admin-title">灵感速记管理</Text>
          <View className="admin-action-btn" onClick={loadData}>
            <RefreshCw size={20} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>
      </View>

      {/* 搜索栏和操作区 */}
      <View style={{ backgroundColor: '#0a0f1a', padding: '16px 24px', borderBottom: '1px solid #111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '14px', color: '#71717a' }}>共 {notes.length} 条</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isBatchMode && selectedNoteIds.length > 0 && (
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}
                onClick={handleBatchDelete}
              >
                <Trash2 size={20} color="#f87171" />
                <Text style={{ fontSize: '14px', color: '#f87171' }}>删除 {selectedNoteIds.length}</Text>
              </View>
            )}
            <View
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: isBatchMode ? '#f87171' : '#1e293b',
              }}
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedNoteIds([]);
              }}
            >
              <Text style={{ fontSize: '14px', color: isBatchMode ? '#fff' : '#94a3b8' }}>
                {isBatchMode ? '退出' : '批量'}
              </Text>
            </View>
          </View>
        </View>
        <View className="search-bar-wrapper">
          <Search size={24} color="#64748b" />
          <Input
            className="search-input"
            placeholder="搜索笔记..."
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
      </View>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <View style={{ backgroundColor: '#0a0f1a', padding: '16px 24px', borderBottom: '1px solid #111827' }}>
          <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
            <View style={{ display: 'inline-flex', gap: '12px' }}>
              <View
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  backgroundColor: !activeTag ? '#38bdf8' : '#1e293b',
                }}
                onClick={() => setActiveTag('')}
              >
                <Text style={{ fontSize: '22px', color: !activeTag ? '#000' : '#94a3b8' }}>全部</Text>
              </View>
              {allTags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: activeTag === tag ? '#38bdf8' : '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onClick={() => setActiveTag(tag)}
                >
                  <Tag size={18} color={activeTag === tag ? '#000' : '#71717a'} />
                  <Text style={{ fontSize: '22px', color: activeTag === tag ? '#000' : '#94a3b8' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 内容列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)', marginTop: '160px' }}>
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {loading && (
            <View className="empty-state">
              <RefreshCw size={60} color="#64748b" />
              <Text className="empty-title">加载中...</Text>
            </View>
          )}

          {!loading && filteredNotes.length > 0 && filteredNotes.map((note) => (
            <View
              key={note.id}
              className="admin-card"
              style={{
                borderLeft: note.isPinned ? '4px solid #38bdf8' : undefined,
              }}
            >
              <View style={{ display: 'flex', gap: '16px' }}>
                {isBatchMode && (
                  <View
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: '2px solid',
                      borderColor: selectedNoteIds.includes(note.id) ? '#38bdf8' : '#1e3a5f',
                      backgroundColor: selectedNoteIds.includes(note.id) ? '#38bdf8' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    onClick={() => toggleSelect(note.id)}
                  >
                    {selectedNoteIds.includes(note.id) && <Check size={16} color="#000" />}
                  </View>
                )}

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <View
                      style={{ flex: 1, minWidth: 0 }}
                      onClick={() => openDetail(note)}
                    >
                      <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.title}
                      </Text>
                    </View>

                    {!isBatchMode && (
                      <View style={{ display: 'flex', gap: '12px', marginLeft: '12px' }}>
                        {note.isPinned && <Pin size={20} color="#38bdf8" />}
                        <View onClick={() => toggleStar(note.id)}>
                          <Star size={20} color={note.isStarred ? '#38bdf8' : '#64748b'} />
                        </View>
                        <View onClick={() => togglePin(note.id)}>
                          <Pin size={20} color={note.isPinned ? '#38bdf8' : '#64748b'} />
                        </View>
                        <View onClick={() => handleDelete(note.id)}>
                          <Trash2 size={20} color="#f87171" />
                        </View>
                      </View>
                    )}
                  </View>

                  {note.userNickname && (
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <User size={18} color="#71717a" />
                      <Text style={{ fontSize: '20px', color: '#71717a' }}>{note.userNickname}</Text>
                    </View>
                  )}

                  <View onClick={() => openDetail(note)} style={{ marginBottom: '12px' }}>
                    <Text style={{ fontSize: '22px', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {note.content}
                    </Text>
                  </View>

                  {note.images && note.images.length > 0 && (
                    <View style={{ marginBottom: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                      {note.images.slice(0, 3).map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          mode="aspectFill"
                          style={{ width: '80px', height: '80px', borderRadius: '12px', flexShrink: 0 }}
                          onClick={() => previewImage(note.images!, index)}
                        />
                      ))}
                      {note.images.length > 3 && (
                        <View style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Text style={{ fontSize: '22px', color: '#71717a' }}>+{note.images.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="#64748b" />
                      <Text style={{ fontSize: '20px', color: '#64748b' }}>{formatDate(note.updatedAt)}</Text>
                    </View>
                    {note.tags && note.tags.length > 0 && (
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={18} color="#64748b" />
                        <Text style={{ fontSize: '20px', color: '#64748b' }}>{note.tags.join(', ')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}

          {!loading && filteredNotes.length === 0 && (
            <View className="empty-state">
              <FileText size={80} color="#64748b" />
              <Text className="empty-title">
                {searchKeyword || activeTag ? '未找到匹配的笔记' : '暂无笔记'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 详情对话框 */}
      {showDetailDialog && selectedNote && (
        <View className="modal-overlay">
          <View className="modal-content" style={{ maxHeight: '80vh' }}>
            <View className="modal-header">
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                {selectedNote.isPinned && <Pin size={24} color="#38bdf8" />}
                {selectedNote.isStarred && <Star size={24} color="#38bdf8" />}
                <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedNote.title}
                </Text>
              </View>
              <View style={{ display: 'flex', gap: '12px' }}>
                <View onClick={() => {
                  toggleStar(selectedNote.id);
                  setSelectedNote({ ...selectedNote, isStarred: !selectedNote.isStarred });
                }}
                >
                  <Star size={24} color={selectedNote.isStarred ? '#38bdf8' : '#71717a'} />
                </View>
                <View onClick={() => {
                  togglePin(selectedNote.id);
                  setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned });
                }}
                >
                  <Pin size={24} color={selectedNote.isPinned ? '#38bdf8' : '#71717a'} />
                </View>
                <View onClick={() => setShowDetailDialog(false)}>
                  <X size={28} color="#71717a" />
                </View>
              </View>
            </View>

            <View style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedNote.userNickname && (
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="#71717a" />
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>{selectedNote.userNickname}</Text>
                </View>
              )}

              <View>
                <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', display: 'block', marginBottom: '12px' }}>内容</Text>
                <Text style={{ fontSize: '22px', color: '#94a3b8', display: 'block', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedNote.content}
                </Text>
              </View>

              {selectedNote.images && selectedNote.images.length > 0 && (
                <View>
                  <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', display: 'block', marginBottom: '12px' }}>
                    图片 ({selectedNote.images.length})
                  </Text>
                  <View style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {selectedNote.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        mode="aspectFill"
                        style={{ width: '100%', aspectRatio: '1', borderRadius: '12px' }}
                        onClick={() => previewImage(selectedNote.images!, index)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {selectedNote.audio && (
                <View>
                  <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', display: 'block', marginBottom: '12px' }}>语音</Text>
                  <View style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mic size={24} color="#38bdf8" />
                    <Text style={{ fontSize: '22px', color: '#94a3b8', flex: 1 }}>语音记录</Text>
                    {isWeapp && (
                      <View
                        style={{ padding: '10px 20px', backgroundColor: '#38bdf8', borderRadius: '12px' }}
                        onClick={() => {
                          Taro.playVoice({ filePath: selectedNote.audio! });
                        }}
                      >
                        <Text style={{ fontSize: '22px', color: '#000' }}>播放</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <View>
                  <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', display: 'block', marginBottom: '12px' }}>标签</Text>
                  <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {selectedNote.tags.map((tag, index) => (
                      <View key={index} style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                        <Text style={{ fontSize: '22px', color: '#38bdf8' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={{ fontSize: '20px', color: '#64748b', paddingTop: '16px', borderTop: '1px solid #1e3a5f', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Text style={{ display: 'block' }}>
                  创建时间: {new Date(selectedNote.createdAt).toLocaleString('zh-CN')}
                </Text>
                <Text style={{ display: 'block' }}>
                  更新时间: {new Date(selectedNote.updatedAt).toLocaleString('zh-CN')}
                </Text>
                {selectedNote.userId && (
                  <Text style={{ display: 'block' }}>
                    用户ID: {selectedNote.userId}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
