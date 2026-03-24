import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';

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

  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      setFilteredNotes(notes.filter(note =>
        note.title.toLowerCase().includes(keyword) ||
        note.content.toLowerCase().includes(keyword)
      ));
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
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
    const updatedNotes = notes.map(note =>
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
          const updatedNotes = notes.filter(note => note.id !== id);
          saveNotes(updatedNotes);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
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

  const allTags = [...new Set(notes.flatMap(note => note.tags))];

  return (
    <View style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0b',
      paddingBottom: '120px'
    }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <View style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <View 
              style={{ padding: '8px' }}
              onClick={() => Taro.navigateBack()}
            >
              <Text style={{ fontSize: '32px', color: '#fafafa' }}>←</Text>
            </View>
            <View>
              <Text style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                color: '#fafafa'
              }}>
                灵感速记
              </Text>
              <Text style={{ 
                fontSize: '22px', 
                color: '#71717a',
                marginTop: '4px'
              }}>
                {notes.length} 条笔记
              </Text>
            </View>
          </View>
          <View 
            style={{
              width: '88px',
              height: '88px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}
            onClick={() => setShowAddDialog(true)}
          >
            +
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{
          backgroundColor: '#141416',
          borderRadius: '16px',
          border: '1px solid #27272a',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Text style={{ fontSize: '28px', color: '#71717a' }}>🔍</Text>
          <Input
            style={{ 
              flex: 1,
              fontSize: '28px', 
              color: '#fafafa'
            }}
            placeholder="搜索笔记..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <ScrollView 
            scrollX 
            style={{ marginTop: '20px', width: '100%' }}
            showHorizontalScrollIndicator={false}
          >
            <View style={{ display: 'flex', gap: '12px', paddingRight: '32px' }}>
              <View
                style={{
                  flexShrink: 0,
                  padding: '12px 20px',
                  backgroundColor: !searchKeyword ? '#f59e0b' : '#141416',
                  color: !searchKeyword ? '#000' : '#a1a1aa',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: '500'
                }}
                onClick={() => setSearchKeyword('')}
              >
                全部
              </View>
              {allTags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    flexShrink: 0,
                    padding: '12px 20px',
                    backgroundColor: '#141416',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    fontSize: '24px',
                    color: '#a1a1aa'
                  }}
                >
                  {tag}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* 笔记列表 */}
      <View style={{ padding: '32px' }}>
        {filteredNotes.length === 0 ? (
          <View style={{ 
            textAlign: 'center', 
            paddingTop: '120px' 
          }}>
            <Text style={{ fontSize: '80px' }}>💡</Text>
            <Text style={{ 
              fontSize: '28px', 
              color: '#71717a',
              marginTop: '24px',
              display: 'block'
            }}>
              {searchKeyword ? '没有找到相关笔记' : '还没有笔记'}
            </Text>
            {!searchKeyword && (
              <Text 
                style={{ 
                  fontSize: '24px', 
                  color: '#f59e0b',
                  marginTop: '16px'
                }}
                onClick={() => setShowAddDialog(true)}
              >
                点击添加第一条笔记
              </Text>
            )}
          </View>
        ) : (
          filteredNotes.map((note) => (
            <View
              key={note.id}
              style={{
                backgroundColor: '#141416',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '16px',
                border: '1px solid #27272a'
              }}
            >
              <View style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: '30px', 
                    fontWeight: '600', 
                    color: '#fafafa',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    {note.isPinned && <Text style={{ color: '#f59e0b' }}>📌 </Text>}
                    {note.title}
                  </Text>
                  <Text style={{ 
                    fontSize: '24px', 
                    color: '#71717a',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {note.content || '暂无内容'}
                  </Text>
                </View>
                <View style={{ 
                  display: 'flex', 
                  gap: '16px',
                  marginLeft: '16px'
                }}>
                  <Text 
                    style={{ fontSize: '28px' }}
                    onClick={() => handleToggleStar(note.id)}
                  >
                    {note.isStarred ? '⭐' : '☆'}
                  </Text>
                  <Text 
                    style={{ fontSize: '28px', color: '#ef4444' }}
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    🗑
                  </Text>
                </View>
              </View>
              
              {note.tags.length > 0 && (
                <View style={{ 
                  display: 'flex', 
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '12px'
                }}>
                  {note.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        color: '#f59e0b'
                      }}
                    >
                      {tag}
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={{ 
                fontSize: '20px', 
                color: '#52525b'
              }}>
                {formatTime(note.updatedAt)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* 新增笔记弹窗 */}
      {showAddDialog && (
        <View style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}
          onClick={() => setShowAddDialog(false)}
        >
          <View 
            style={{
              width: '100%',
              backgroundColor: '#141416',
              borderRadius: '32px 32px 0 0',
              padding: '32px',
              maxHeight: '80vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <View style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <Text style={{ 
                fontSize: '32px', 
                fontWeight: '600', 
                color: '#fafafa'
              }}>
                新建笔记
              </Text>
              <Text 
                style={{ fontSize: '28px', color: '#71717a' }}
                onClick={() => setShowAddDialog(false)}
              >
                ✕
              </Text>
            </View>

            <View style={{ marginBottom: '24px' }}>
              <Text style={{ 
                fontSize: '24px', 
                color: '#a1a1aa',
                marginBottom: '12px',
                display: 'block'
              }}>
                标题
              </Text>
              <Input
                style={{
                  backgroundColor: '#1a1a1d',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  fontSize: '28px',
                  color: '#fafafa',
                  border: '1px solid #27272a'
                }}
                placeholder="请输入标题"
                placeholderStyle="color: #52525b"
                value={newTitle}
                onInput={(e) => setNewTitle(e.detail.value)}
              />
            </View>

            <View style={{ marginBottom: '24px' }}>
              <Text style={{ 
                fontSize: '24px', 
                color: '#a1a1aa',
                marginBottom: '12px',
                display: 'block'
              }}>
                内容
              </Text>
              <Textarea
                style={{
                  width: '100%',
                  backgroundColor: '#1a1a1d',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  fontSize: '28px',
                  color: '#fafafa',
                  border: '1px solid #27272a',
                  minHeight: '200px',
                  boxSizing: 'border-box'
                }}
                placeholder="请输入内容..."
                placeholderStyle="color: #52525b"
                value={newContent}
                onInput={(e) => setNewContent(e.detail.value)}
              />
            </View>

            <View style={{ marginBottom: '32px' }}>
              <Text style={{ 
                fontSize: '24px', 
                color: '#a1a1aa',
                marginBottom: '12px',
                display: 'block'
              }}>
                标签（逗号分隔）
              </Text>
              <Input
                style={{
                  backgroundColor: '#1a1a1d',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  fontSize: '28px',
                  color: '#fafafa',
                  border: '1px solid #27272a'
                }}
                placeholder="如：灵感, 工作, 生活"
                placeholderStyle="color: #52525b"
                value={newTags}
                onInput={(e) => setNewTags(e.detail.value)}
              />
            </View>

            <View
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center'
              }}
              onClick={handleAddNote}
            >
              <Text style={{ 
                fontSize: '32px', 
                fontWeight: '600',
                color: '#000'
              }}>
                保存笔记
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuickNotePage;
