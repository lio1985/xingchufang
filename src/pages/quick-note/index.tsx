import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  X,
  Inbox,
  Pin,
} from 'lucide-react-taro';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isStarred: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const QuickNotePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      setFilteredNotes(
        notes.filter(
          (note) =>
            note.title.toLowerCase().includes(keyword) ||
            note.content.toLowerCase().includes(keyword)
        )
      );
    } else {
      setFilteredNotes(notes);
    }
  }, [notes, searchKeyword]);

  const loadNotes = () => {
    try {
      const localNotes = Taro.getStorageSync('notes') || [];
      setNotes(localNotes);
      setFilteredNotes(localNotes);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    Taro.setStorageSync('notes', updatedNotes);
  };

  const handleAddNote = () => {
    if (!newTitle.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags ? newTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isStarred: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setShowAddDialog(false);
    Taro.showToast({ title: '添加成功', icon: 'success' });
  };

  const handleToggleStar = (id: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, isStarred: !note.isStarred } : note
    );
    saveNotes(updatedNotes);
  };

  const handleDeleteNote = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条笔记吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedNotes = notes.filter((note) => note.id !== id);
          saveNotes(updatedNotes);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const allTags = [...new Set(notes.flatMap((note) => note.tags))];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '120px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#141416', borderBottom: '1px solid #27272a' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => Taro.navigateBack()}
            >
              <ChevronLeft size={24} color="#fafafa" />
            </View>
            <View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>灵感速记</Text>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>{notes.length} 条笔记</Text>
            </View>
          </View>
          
          <View
            style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus size={24} color="#000" />
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#18181b', borderRadius: '12px', padding: '12px 16px', border: '1px solid #27272a' }}>
          <Search size={18} color="#71717a" />
          <Input
            style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
            placeholder="搜索笔记..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <ScrollView scrollX style={{ marginTop: '12px', whiteSpace: 'nowrap' }}>
            <View style={{ display: 'inline-flex', gap: '8px' }}>
              <View
                style={{ padding: '6px 14px', borderRadius: '16px', backgroundColor: !searchKeyword ? 'rgba(245, 158, 11, 0.2)' : '#27272a', border: !searchKeyword ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #27272a' }}
                onClick={() => setSearchKeyword('')}
              >
                <Text style={{ fontSize: '13px', color: !searchKeyword ? '#f59e0b' : '#a1a1aa' }}>全部</Text>
              </View>
              {allTags.map((tag, index) => (
                <View key={index} style={{ padding: '6px 14px', borderRadius: '16px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Text style={{ fontSize: '13px', color: '#f59e0b' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* 笔记列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 200px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {filteredNotes.length === 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
              <View style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #27272a' }}>
                <Inbox size={40} color="#52525b" />
              </View>
              <Text style={{ fontSize: '16px', color: '#71717a', display: 'block', marginBottom: '8px' }}>
                {searchKeyword ? '没有找到相关笔记' : '还没有笔记'}
              </Text>
              {!searchKeyword && (
                <Text style={{ fontSize: '14px', color: '#f59e0b' }} onClick={() => setShowAddDialog(true)}>
                  点击添加第一条笔记
                </Text>
              )}
            </View>
          ) : (
            filteredNotes.map((note) => (
              <View
                key={note.id}
                style={{ backgroundColor: '#18181b', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #27272a' }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      {note.isPinned && <Pin size={14} color="#f59e0b" />}
                      <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'block' }}>{note.title}</Text>
                    </View>
                    <Text style={{ fontSize: '13px', color: '#a1a1aa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.content || '暂无内容'}</Text>
                  </View>
                  
                  <View style={{ display: 'flex', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                    <View
                      style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleToggleStar(note.id)}
                    >
                      {note.isStarred ? (
                        <Star size={18} color="#f59e0b" />
                      ) : (
                        <StarOff size={18} color="#71717a" />
                      )}
                    </View>
                    <View
                      style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </View>
                  </View>
                </View>

                {note.tags.length > 0 && (
                  <View style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {note.tags.map((tag, index) => (
                      <View key={index} style={{ padding: '4px 10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <Text style={{ fontSize: '12px', color: '#f59e0b' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={{ fontSize: '12px', color: '#52525b' }}>{formatTime(note.updatedAt)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 新增笔记弹窗 */}
      {showAddDialog && (
        <View
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowAddDialog(false)}
        >
          <View
            style={{ width: '100%', backgroundColor: '#141416', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View style={{ padding: '20px', borderBottom: '1px solid #27272a' }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>新建笔记</Text>
                <View
                  style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setShowAddDialog(false)}
                >
                  <X size={18} color="#71717a" />
                </View>
              </View>
            </View>

            {/* 表单内容 */}
            <ScrollView scrollY style={{ padding: '20px', maxHeight: '50vh' }}>
              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>标题 *</Text>
                <View style={{ backgroundColor: '#18181b', borderRadius: '12px', padding: '14px', border: '1px solid #27272a' }}>
                  <Input
                    style={{ width: '100%', fontSize: '15px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入标题"
                    placeholderStyle="color: #52525b"
                    value={newTitle}
                    onInput={(e) => setNewTitle(e.detail.value)}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>内容</Text>
                <View style={{ backgroundColor: '#18181b', borderRadius: '12px', padding: '14px', border: '1px solid #27272a' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '120px', fontSize: '15px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入内容..."
                    placeholderStyle="color: #52525b"
                    value={newContent}
                    onInput={(e) => setNewContent(e.detail.value)}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>标签（逗号分隔）</Text>
                <View style={{ backgroundColor: '#18181b', borderRadius: '12px', padding: '14px', border: '1px solid #27272a' }}>
                  <Input
                    style={{ width: '100%', fontSize: '15px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="如：灵感, 工作, 生活"
                    placeholderStyle="color: #52525b"
                    value={newTags}
                    onInput={(e) => setNewTags(e.detail.value)}
                  />
                </View>
              </View>
            </ScrollView>

            {/* 保存按钮 */}
            <View style={{ padding: '20px', borderTop: '1px solid #27272a' }}>
              <View
                style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f59e0b', textAlign: 'center' }}
                onClick={handleAddNote}
              >
                <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0a0a0b' }}>保存笔记</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuickNotePage;
