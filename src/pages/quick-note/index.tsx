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
import '@/styles/pages.css';
import './index.css';

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
    <View className="quick-note-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top">
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#fafafa" />
            </View>
            <View className="header-title-group">
              <Text className="header-title">灵感速记</Text>
              <Text className="header-subtitle">{notes.length} 条笔记</Text>
            </View>
          </View>
          
          <View className="add-note-btn" onClick={() => setShowAddDialog(true)}>
            <Plus size={40} color="#000" />
          </View>
        </View>

        {/* 搜索框 */}
        <View className="search-box">
          <Search size={28} color="#71717a" />
          <Input
            className="search-input"
            placeholder="搜索笔记..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <ScrollView scrollX className="tags-scroll">
            <View className="tags-container">
              <View
                className={`tag-item ${!searchKeyword ? 'tag-item-active' : ''}`}
                onClick={() => setSearchKeyword('')}
              >
                全部
              </View>
              {allTags.map((tag, index) => (
                <View key={index} className="tag-item">
                  {tag}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* 笔记列表 */}
      <View className="content-area">
        {filteredNotes.length === 0 ? (
          <View className="empty-state">
            <Inbox size={80} color="#71717a" />
            <Text className="empty-title">
              {searchKeyword ? '没有找到相关笔记' : '还没有笔记'}
            </Text>
            {!searchKeyword && (
              <Text className="empty-action" onClick={() => setShowAddDialog(true)}>
                点击添加第一条笔记
              </Text>
            )}
          </View>
        ) : (
          filteredNotes.map((note) => (
            <View key={note.id} className="note-card">
              <View className="note-header">
                <View className="note-content">
                  <Text className="note-title">
                    {note.isPinned && <Pin size={20} color="#f59e0b" />}
                    {note.title}
                  </Text>
                  <Text className="note-desc">{note.content || '暂无内容'}</Text>
                </View>
                
                <View className="note-actions">
                  <View
                    className="note-action-btn"
                    onClick={() => handleToggleStar(note.id)}
                  >
                    {note.isStarred ? (
                      <Star size={28} color="#f59e0b" />
                    ) : (
                      <StarOff size={28} color="#71717a" />
                    )}
                  </View>
                  <View
                    className="note-action-btn"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={28} color="#ef4444" />
                  </View>
                </View>
              </View>

              {note.tags.length > 0 && (
                <View className="note-tags">
                  {note.tags.map((tag, index) => (
                    <View key={index} className="note-tag">
                      {tag}
                    </View>
                  ))}
                </View>
              )}

              <Text className="note-time">{formatTime(note.updatedAt)}</Text>
            </View>
          ))
        )}
      </View>

      {/* 新增笔记弹窗 */}
      {showAddDialog && (
        <View className="modal-overlay" onClick={() => setShowAddDialog(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">新建笔记</Text>
              <View onClick={() => setShowAddDialog(false)}>
                <X size={28} color="#71717a" />
              </View>
            </View>

            <View className="form-group">
              <Text className="form-label">标题</Text>
              <Input
                className="form-input"
                placeholder="请输入标题"
                placeholderStyle="color: #52525b"
                value={newTitle}
                onInput={(e) => setNewTitle(e.detail.value)}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">内容</Text>
              <Textarea
                className="form-input form-textarea"
                placeholder="请输入内容..."
                placeholderStyle="color: #52525b"
                value={newContent}
                onInput={(e) => setNewContent(e.detail.value)}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">标签（逗号分隔）</Text>
              <Input
                className="form-input"
                placeholder="如：灵感, 工作, 生活"
                placeholderStyle="color: #52525b"
                value={newTags}
                onInput={(e) => setNewTags(e.detail.value)}
              />
            </View>

            <View className="action-btn-primary" onClick={handleAddNote}>
              <Text className="action-btn-primary-text">保存笔记</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuickNotePage;
