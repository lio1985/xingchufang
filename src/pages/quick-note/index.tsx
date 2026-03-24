import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Image, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
// 笔记数据结构
interface Note {
  id: string;
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

const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

const QuickNotePage = () => {
  // 笔记列表状态
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTag, setActiveTag] = useState('');

  // 批量管理
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // 快速新建笔记对话框
  const [showQuickNoteDialog, setShowQuickNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteImages, setNewNoteImages] = useState<string[]>([]);
  const [newNoteAudio, setNewNoteAudio] = useState('');
  const [newNoteTags, setNewNoteTags] = useState<string[]>([]);
  const [isGeneratingNewTags, setIsGeneratingNewTags] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // 录音状态
  const [recorderManager, setRecorderManager] = useState<Taro.RecorderManager | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // 编辑笔记
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // 标签输入
  const [tagInput, setTagInput] = useState('');

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 初始化录音管理器
  useEffect(() => {
    if (isWeapp) {
      const manager = Taro.getRecorderManager();

      manager.onStart(() => {
        console.log('录音开始');
        setIsRecording(true);
      });

      manager.onStop((res) => {
        console.log('录音结束', res.tempFilePath);
        setIsRecording(false);
        setNewNoteAudio(res.tempFilePath);
      });

      manager.onError((err) => {
        console.error('录音错误', err);
        Taro.showToast({ title: '录音失败', icon: 'none' });
        setIsRecording(false);
      });

      setRecorderManager(manager);
    }
  }, []);

  // 过滤笔记
  useEffect(() => {
    let filtered = notes;

    // 搜索过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(keyword) ||
        note.content.toLowerCase().includes(keyword)
      );
    }

    // 标签过滤
    if (activeTag) {
      filtered = filtered.filter(note => note.tags.includes(activeTag));
    }

    // 排序：置顶优先，然后按时间倒序
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    setFilteredNotes(filtered);
  }, [notes, searchKeyword, activeTag]);

  // 加载数据
  const loadData = () => {
    try {
      const localNotes = Taro.getStorageSync('notes') || [];
      setNotes(localNotes);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  // 保存数据
  const saveData = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    Taro.setStorageSync('notes', updatedNotes);
  };

  // 开始录音
  const handleStartRecord = () => {
    if (!isWeapp) {
      Taro.showToast({ title: '仅支持小程序录音', icon: 'none' });
      return;
    }
    recorderManager?.start({
      format: 'mp3',
      sampleRate: 16000
    });
  };

  // 停止录音
  const handleStopRecord = () => {
    recorderManager?.stop();
  };

  // 选择图片
  const handleChooseImages = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      setNewNoteImages([...newNoteImages, ...res.tempFilePaths]);
    } catch (error) {
      console.error('选择图片失败', error);
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setNewNoteImages(newNoteImages.filter((_, i) => i !== index));
  };

  // 创建笔记
  const handleCreateNote = () => {
    if (!newNoteContent.trim() && newNoteImages.length === 0 && !newNoteAudio) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim() || '无标题',
      content: newNoteContent,
      tags: newNoteTags,
      isStarred: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: newNoteImages,
      audio: newNoteAudio
    };

    saveData([newNote, ...notes]);
    resetNewNoteForm();
    setShowQuickNoteDialog(false);
    Taro.showToast({ title: '创建成功', icon: 'success' });
  };

  // 重置新建表单
  const resetNewNoteForm = () => {
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteImages([]);
    setNewNoteAudio('');
    setNewNoteTags([]);
  };

  // 切换星标
  const toggleStar = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isStarred: !note.isStarred } : note
    );
    saveData(updatedNotes);
  };

  // 切换置顶
  const togglePin = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    );
    saveData(updatedNotes);
  };

  // 删除笔记
  const deleteNote = (noteId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条笔记吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedNotes = notes.filter(note => note.id !== noteId);
          saveData(updatedNotes);
          Taro.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  };

  // 批量删除笔记
  const handleBatchDelete = () => {
    if (selectedNoteIds.length === 0) {
      Taro.showToast({ title: '请选择笔记', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedNoteIds.length} 条笔记吗？`,
      success: (res) => {
        if (res.confirm) {
          const updatedNotes = notes.filter(note => !selectedNoteIds.includes(note.id));
          saveData(updatedNotes);
          setIsBatchMode(false);
          setSelectedNoteIds([]);
          Taro.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  };

  // 切换选择笔记
  const toggleSelectNote = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedNoteIds.length === filteredNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(filteredNotes.map(note => note.id));
    }
  };

  // 打开编辑对话框
  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setShowEditDialog(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingNote) return;

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? {
            ...note,
            title: newNoteTitle.trim() || '无标题',
            content: newNoteContent,
            updatedAt: new Date().toISOString()
          }
        : note
    );

    saveData(updatedNotes);
    setShowEditDialog(false);
    setEditingNote(null);
    resetNewNoteForm();
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  // 添加标签
  const addTag = () => {
    if (!editingNote || !tagInput.trim()) return;

    const tag = tagInput.trim();
    const updatedNotes = notes.map(note =>
      note.id === editingNote.id && !note.tags.includes(tag)
        ? { ...note, tags: [...note.tags, tag] }
        : note
    );

    saveData(updatedNotes);
    setTagInput('');
  };

  // 创建标签（新建笔记）
  const generateTagsForNewNote = async () => {
    if (!newNoteContent.trim()) {
      Taro.showToast({ title: '请先输入内容', icon: 'none' });
      return;
    }

    setIsGeneratingNewTags(true);

    try {
      const res = await Network.request({
        url: '/api/quick-note/generate-tags',
        method: 'POST',
        data: {
          content: newNoteContent
        }
      });

      if (res.data.code === 200 && res.data.data.tags) {
        const newTags = res.data.data.tags;
        setNewNoteTags(prev => [...new Set([...prev, ...newTags])]);
        Taro.showToast({ title: `已创建 ${newTags.length} 个标签`, icon: 'success' });
      } else {
        Taro.showToast({ title: '创建失败', icon: 'error' });
      }
    } catch (error) {
      console.error('创建标签失败', error);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    } finally {
      setIsGeneratingNewTags(false);
    }
  };

  // 删除新建笔记的标签
  const removeNewNoteTag = (tag: string) => {
    setNewNoteTags(prev => prev.filter(t => t !== tag));
  };

  // 创建标题
  const generateTitle = async () => {
    if (!newNoteContent.trim()) {
      Taro.showToast({ title: '请先输入内容', icon: 'none' });
      return;
    }

    setIsGeneratingTitle(true);

    try {
      const res = await Network.request({
        url: '/api/quick-note/generate-title',
        method: 'POST',
        data: {
          content: newNoteContent
        }
      });

      if (res.data.code === 200 && res.data.data.title) {
        setNewNoteTitle(res.data.data.title);
        Taro.showToast({ title: '标题创建成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '创建失败', icon: 'error' });
      }
    } catch (error) {
      console.error('创建标题失败', error);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // 删除标签
  const removeTag = (tag: string) => {
    if (!editingNote) return;

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? { ...note, tags: note.tags.filter(t => t !== tag) }
        : note
    );

    saveData(updatedNotes);
  };

  // 获取所有标签
  const getAllTags = () => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  // 格式化时间
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 头部 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-4">
        <View className="flex items-center gap-3 mb-4">
          <Text className="block text-xl font-bold text-white flex-1">灵感速记</Text>
          <View
            className="px-4 py-2 bg-slate-800 rounded-xl flex items-center gap-2 active:scale-95 transition-all"
            onClick={() => setIsBatchMode(!isBatchMode)}
          >
            <Text>✓</Text>
            <Text className="block text-sm text-slate-300">
              {isBatchMode ? '取消' : '批量管理'}
            </Text>
          </View>
          <View
            className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            onClick={() => setShowQuickNoteDialog(true)}
          >
            <Text>+</Text>
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Text>🔍</Text>
          <View style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '12px', paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' }}>
            <Input
              style={{ width: '100%', backgroundColor: 'transparent', color: '#fff', fontSize: '16px' }}
              placeholder="搜索笔记..."
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
        </View>

        {/* 标签筛选 */}
        <ScrollView scrollX className="mt-3 flex gap-2">
          <View
            className={`px-4 py-2 rounded-xl flex-shrink-0 transition-all ${
              !activeTag
                ? 'bg-amber-500/20 border border-amber-500/30'
                : 'bg-slate-800 border border-slate-700'
            }`}
            onClick={() => setActiveTag('')}
          >
            <Text className={`text-sm font-medium ${!activeTag ? 'text-amber-300' : 'text-slate-400'}`}>
              全部
            </Text>
          </View>
          {getAllTags().map(tag => (
            <View
              key={tag}
              className={`px-4 py-2 rounded-xl flex-shrink-0 transition-all ${
                activeTag === tag
                  ? 'bg-slate-9000/20 border border-sky-500/30'
                  : 'bg-slate-800 border border-slate-700'
              }`}
              onClick={() => setActiveTag(tag)}
            >
              <Text className={`text-sm font-medium ${activeTag === tag ? 'text-blue-300' : 'text-slate-400'}`}>
                {tag}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 批量操作栏 */}
      {isBatchMode && selectedNoteIds.length > 0 && (
        <View className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <Text className="block text-sm text-slate-300">已选择 {selectedNoteIds.length} 条笔记</Text>
          <View className="flex gap-2">
            <View
              className="px-4 py-2 bg-slate-800 rounded-xl active:scale-95 transition-all"
              onClick={toggleSelectAll}
            >
              <Text className="block text-sm text-slate-300">
                {selectedNoteIds.length === filteredNotes.length ? '取消全选' : '全选'}
              </Text>
            </View>
            <View
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl active:scale-95 transition-all"
              onClick={handleBatchDelete}
            >
              <Text className="block text-sm text-red-300">删除</Text>
            </View>
          </View>
        </View>
      )}

      {/* 笔记列表 */}
      <ScrollView scrollY className="flex-1 px-4 py-4">
        {filteredNotes.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Text>📄</Text>
            </View>
            <Text className="block text-base text-slate-400 mb-2">暂无笔记</Text>
            <Text className="block text-sm text-slate-300">点击右上角 + 创建第一条笔记</Text>
          </View>
        ) : (
          <View className="flex flex-col gap-3">
            {filteredNotes.map(note => (
              <View
                key={note.id}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-4 active:scale-[0.99] transition-all"
                onLongPress={() => {
                  if (!isBatchMode) {
                    // 长按显示操作菜单
                    Taro.showActionSheet({
                      itemList: ['编辑', '删除', note.isStarred ? '取消星标' : '添加星标', note.isPinned ? '取消置顶' : '置顶'],
                      success: (res) => {
                        if (res.tapIndex === 0) openEditDialog(note);
                        if (res.tapIndex === 1) deleteNote(note.id);
                        if (res.tapIndex === 2) toggleStar(note.id);
                        if (res.tapIndex === 3) togglePin(note.id);
                      }
                    });
                  }
                }}
              >
                {/* 批量选择模式 */}
                {isBatchMode && (
                  <View className="absolute top-4 right-4">
                    <View
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectNote(note.id);
                      }}
                    >
                      {selectedNoteIds.includes(note.id) ? (
                        <Text>✓</Text>
                      ) : (
                        <Text>□</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* 置顶标记 */}
                {note.isPinned && (
                  <View className="flex items-center gap-1 mb-2">
                    <Text>📍</Text>
                    <Text className="block text-xs text-amber-400">置顶</Text>
                  </View>
                )}

                {/* 标题和内容 */}
                <View className="mb-3">
                  <Text className="block text-base font-bold text-white mb-2">{note.title}</Text>
                  {note.content && (
                    <Text className="block text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {note.content}
                    </Text>
                  )}
                </View>

                {/* 图片 */}
                {note.images && note.images.length > 0 && (
                  <ScrollView scrollX className="mb-3">
                    <View className="flex gap-2">
                      {note.images.map((img, index) => (
                        <Text>🖼</Text>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {/* 音频 */}
                {note.audio && (
                  <View className="flex items-center gap-2 mb-3 bg-slate-800/60 rounded-xl px-3 py-2">
                    <Text>🎤</Text>
                    <Text className="block text-xs text-slate-400">录音</Text>
                  </View>
                )}

                {/* 标签 */}
                {note.tags && note.tags.length > 0 && (
                  <View className="flex flex-wrap gap-2 mb-3">
                    {note.tags.map(tag => (
                      <View
                        key={tag}
                        className="px-3 py-1 bg-slate-800/60 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTag(tag);
                        }}
                      >
                        <Text className="block text-xs text-slate-400">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 底部信息 */}
                <View className="flex items-center justify-between">
                  <Text className="block text-xs text-slate-400">{formatTime(note.updatedAt)}</Text>
                  <View className="flex items-center gap-3">
                    {note.isStarred ? (
                      <Star size={18} color="#f59e0b" onClick={(e) => { e.stopPropagation(); toggleStar(note.id); }} />
                    ) : (
                      <StarOff size={18} color="#64748b" onClick={(e) => { e.stopPropagation(); toggleStar(note.id); }} />
                    )}
                    <Pencil size={18} color="#64748b" onClick={(e) => { e.stopPropagation(); openEditDialog(note); }} />
                    <Trash2 size={18} color="#64748b" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 快速新建笔记对话框 */}
      {showQuickNoteDialog && (
        <View
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 50 }}
          onClick={() => setShowQuickNoteDialog(false)}
        >
          <View
            className="bg-slate-800 rounded-3xl p-6 w-[92%] max-h-[85vh] overflow-auto shadow-2xl"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* 标题栏 */}
          <View className="flex items-center justify-between mb-6">
            <View className="flex items-center gap-3">
              <View className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Text>📄</Text>
              </View>
              <View>
                <Text className="block text-xl font-bold text-white">新建笔记</Text>
                <Text className="block text-xs text-slate-400">记录您的灵感瞬间</Text>
              </View>
            </View>
            <View
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 active:opacity-70"
              onClick={() => setShowQuickNoteDialog(false)}
            >
              <Text>✕</Text>
            </View>
          </View>

          {/* 标题输入 */}
          <View className="mb-5">
            <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <View style={{ flex: 1, padding: '12px 16px' }} className="bg-slate-900/60 rounded-2xl border border-slate-700/60">
                <Input
                  style={{ width: '100%', backgroundColor: 'transparent', color: '#e2e8f0', fontSize: '17px', height: '44px', lineHeight: '44px' }}
                  placeholder="标题（可选）"
                  placeholderClass="text-slate-400"
                  placeholderStyle="color: #64748b; font-size: 17px;"
                  value={newNoteTitle}
                  onInput={(e) => setNewNoteTitle(e.detail.value)}
                />
              </View>
              <View
                className="w-16 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center active:from-amber-500/30 active:to-orange-500/30 transition-all"
                onClick={isGeneratingTitle ? undefined : generateTitle}
              >
                {isGeneratingTitle ? (
                  <Text>✨</Text>
                ) : (
                  <Text>✨</Text>
                )}
              </View>
            </View>
          </View>

          {/* 内容输入 */}
          <View className="mb-5">
            <View className="bg-slate-900/60 rounded-2xl border border-slate-700/60" style={{ padding: '16px' }}>
              <Textarea
                style={{ width: '100%', height: '300px', backgroundColor: 'transparent', color: '#e2e8f0', fontSize: '16px', lineHeight: '1.6' }}
                placeholder="输入内容..."
                placeholderClass="text-slate-400"
                placeholderStyle="color: #64748b; font-size: 16px;"
                value={newNoteContent}
                onInput={(e) => setNewNoteContent(e.detail.value)}
                autoHeight={false}
              />
              <Text className="block text-xs text-slate-400 mt-2 text-right">
                {newNoteContent.length} 字
              </Text>
            </View>
          </View>

          {/* 标签 */}
          <View className="mb-5">
            <Text className="block text-sm font-bold text-white mb-3">标签</Text>
            {newNoteTags.length > 0 && (
              <View className="flex flex-wrap gap-2 mb-3">
                {newNoteTags.map(tag => (
                  <View key={tag} className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center gap-2">
                    <Text className="block text-xs text-amber-300">#{tag}</Text>
                    <X size={12} color="#fbbf24" onClick={() => removeNewNoteTag(tag)} />
                  </View>
                ))}
              </View>
            )}
            {/* 创建标签按钮 */}
            <View
              className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                isGeneratingNewTags
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 opacity-70'
                  : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 active:from-amber-500/20 active:to-orange-500/20'
              }`}
              onClick={isGeneratingNewTags ? undefined : generateTagsForNewNote}
            >
              {isGeneratingNewTags ? (
                <>
                  <Text className="block text-sm text-amber-300 font-medium">正在创建标签...</Text>
                </>
              ) : (
                <>
                  <Text>✨</Text>
                  <Text className="block text-sm text-amber-300 font-medium">创建标签</Text>
                </>
              )}
            </View>
          </View>

          {/* 图片预览 */}
          {newNoteImages.length > 0 && (
            <ScrollView scrollX className="mb-5">
              <View className="flex gap-3">
                {newNoteImages.map((img, index) => (
                  <View key={index} className="relative w-24 h-24 flex-shrink-0">
                    <Text>🖼</Text>
                    <View
                      className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center active:bg-black/90"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Text>✕</Text>
                    </View>
                  </View>
                ))}
                <View
                  className="w-24 h-24 bg-slate-900/60 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-dashed border-slate-700"
                  onClick={handleChooseImages}
                >
                  <Text>🖼</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* 音频预览 */}
          {newNoteAudio && (
            <View className="mb-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 px-4 py-4 flex items-center gap-3">
              <View className="w-10 h-10 bg-slate-9000/20 rounded-full flex items-center justify-center">
                <Text>🎤</Text>
              </View>
              <Text className="block text-sm text-slate-300 flex-1">录音已完成</Text>
              <View
                className="px-4 py-2 bg-red-500/20 rounded-xl active:bg-red-500/30"
                onClick={() => setNewNoteAudio('')}
              >
                <Text className="block text-xs text-red-300 font-medium">删除</Text>
              </View>
            </View>
          )}

          {/* 操作按钮 */}
          <View className="flex gap-3 mb-6">
            <View
              className="flex-1 py-3.5 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700/50 active:bg-slate-800/70 transition-all"
              onClick={handleChooseImages}
            >
              <Text>🖼</Text>
              <Text className="block text-sm text-slate-300 ml-2 font-medium">图片</Text>
            </View>
            {isWeapp && (
              <View
                className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center transition-all border ${
                  isRecording
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-slate-800 border-slate-700/50 active:bg-slate-800/70'
                }`}
                onClick={isRecording ? handleStopRecord : handleStartRecord}
              >
                <Text>🎤</Text>
                <Text className={`block text-sm ml-2 font-medium ${isRecording ? 'text-red-300' : 'text-slate-300'}`}>
                  {isRecording ? '停止录音' : '语音'}
                </Text>
              </View>
            )}
          </View>

          {/* 保存按钮 */}
          <View
            className={`w-full py-4 rounded-2xl flex items-center justify-center transition-all ${
              !newNoteContent.trim() && newNoteImages.length === 0 && !newNoteAudio
                ? 'bg-slate-800 text-slate-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 active:scale-[0.98]'
            }`}
            onClick={handleCreateNote}
          >
            <Text className="block text-base font-bold">保存笔记</Text>
          </View>
          </View>
        </View>
      )}

      {/* 编辑笔记对话框 */}
      {showEditDialog && (
        <View
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 50 }}
          onClick={() => setShowEditDialog(false)}
        >
          <View
            className="bg-slate-800 rounded-3xl p-6 w-[92%] max-h-[85vh] overflow-auto shadow-2xl"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* 标题栏 */}
          <View className="flex items-center justify-between mb-6">
            <View className="flex items-center gap-3">
              <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Text>✏</Text>
              </View>
              <View>
                <Text className="block text-xl font-bold text-white">编辑笔记</Text>
                <Text className="block text-xs text-slate-400">修改您的内容</Text>
              </View>
            </View>
            <View
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 active:opacity-70"
              onClick={() => setShowEditDialog(false)}
            >
              <Text>✕</Text>
            </View>
          </View>

          {/* 标题 */}
          <View className="mb-5">
            <View className="bg-slate-900/60 rounded-2xl border border-slate-700/60" style={{ padding: '16px' }}>
              <Input
                style={{ width: '100%', backgroundColor: 'transparent', color: '#e2e8f0', fontSize: '18px', height: '52px', lineHeight: '52px' }}
                placeholder="标题"
                placeholderClass="text-slate-400"
                placeholderStyle="color: #64748b; font-size: 18px;"
                value={newNoteTitle}
                onInput={(e) => setNewNoteTitle(e.detail.value)}
              />
            </View>
          </View>

          {/* 内容 */}
          <View className="mb-5">
            <View className="bg-slate-900/60 rounded-2xl border border-slate-700/60" style={{ padding: '16px' }}>
              <Textarea
                style={{ width: '100%', height: '300px', backgroundColor: 'transparent', color: '#e2e8f0', fontSize: '16px', lineHeight: '1.6' }}
                placeholder="内容..."
                placeholderClass="text-slate-400"
                placeholderStyle="color: #64748b; font-size: 16px;"
                value={newNoteContent}
                onInput={(e) => setNewNoteContent(e.detail.value)}
                autoHeight={false}
              />
            </View>
          </View>

          {/* 标签 */}
          <View className="mb-5">
            <Text className="block text-sm font-bold text-white mb-3">标签</Text>
            {editingNote?.tags && editingNote.tags.length > 0 && (
              <View className="flex flex-wrap gap-2 mb-3">
                {editingNote.tags.map(tag => (
                  <View key={tag} className="px-3 py-1.5 bg-slate-9000/20 border border-sky-500/30 rounded-xl flex items-center gap-2">
                    <Text className="block text-xs text-blue-300">#{tag}</Text>
                    <X size={12} color="#60a5fa" onClick={() => removeTag(tag)} />
                  </View>
                ))}
              </View>
            )}
            <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginBottom: '12px' }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '16px', padding: '12px 16px' }}>
                <Input
                  style={{ width: '100%', backgroundColor: 'transparent', color: '#fff', fontSize: '15px' }}
                  placeholder="添加标签..."
                  placeholderClass="text-slate-400"
                  placeholderStyle="color: #64748b; font-size: 15px;"
                  value={tagInput}
                  onInput={(e) => setTagInput(e.detail.value)}
                />
              </View>
              <View
                className="px-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                onClick={addTag}
              >
                <Text className="block text-sm text-white font-medium">添加</Text>
              </View>
            </View>
          </View>

          {/* 保存按钮 */}
          <View
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
            onClick={handleSaveEdit}
          >
            <Text className="block text-base font-bold text-white">保存修改</Text>
          </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuickNotePage;
