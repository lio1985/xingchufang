import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
// Emoji 图标常量

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
      // 尝试从后端加载所有用户的笔记
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
        // 如果后端加载失败，尝试从本地存储加载（兼容旧版本）
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

  // 切换星标
  const toggleStar = async (noteId: string) => {
    try {
      // 更新本地状态
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, isStarred: !note.isStarred } : note
      );
      setNotes(updatedNotes);

      // 同步到后端
      await Network.request({
        url: `/api/quick-notes/${noteId}/toggle-star`,
        method: 'POST',
      });
    } catch (error: any) {
      console.error('切换星标失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
      // 恢复状态
      setNotes(notes);
    }
  };

  // 切换置顶
  const togglePin = async (noteId: string) => {
    try {
      // 更新本地状态
      const updatedNotes = notes.map(note =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      );
      setNotes(updatedNotes);

      // 同步到后端
      await Network.request({
        url: `/api/quick-notes/${noteId}/toggle-pin`,
        method: 'POST',
      });
    } catch (error: any) {
      console.error('切换置顶失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
      // 恢复状态
      setNotes(notes);
    }
  };

  // 删除笔记
  const handleDelete = async (noteId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条笔记吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 更新本地状态
            const updatedNotes = notes.filter(note => note.id !== noteId);
            setNotes(updatedNotes);
            updateAllTags(updatedNotes);

            // 同步到后端
            await Network.request({
              url: `/api/quick-notes/${noteId}`,
              method: 'DELETE',
            });

            Taro.showToast({ title: '删除成功', icon: 'success' });
          } catch (error: any) {
            console.error('删除笔记失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
            // 恢复状态
            setNotes(notes);
            updateAllTags(notes);
          }
        }
      }
    });
  };

  // 批量删除
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
            // 更新本地状态
            const updatedNotes = notes.filter(note => !selectedNoteIds.includes(note.id));
            setNotes(updatedNotes);
            updateAllTags(updatedNotes);
            setSelectedNoteIds([]);
            setIsBatchMode(false);

            // 同步到后端
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

  // 切换批量选择
  const toggleSelect = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  // 查看详情
  const openDetail = (note: Note) => {
    setSelectedNote(note);
    setShowDetailDialog(true);
  };

  // 预览图片
  const previewImage = (images: string[], index: number) => {
    Taro.previewImage({
      urls: images,
      current: images[index],
    });
  };

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部导航栏 */}
      <View className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View onClick={() => Taro.navigateBack()}>
              <Text>←</Text>
            </View>
            <View className="flex items-center gap-2">
              <Text>✨</Text>
              <Text className="text-white font-semibold text-lg">灵感速记管理</Text>
            </View>
          </View>
          <View className="flex items-center gap-2">
            {isBatchMode ? (
              <View
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20"
                onClick={handleBatchDelete}
              >
                <Text>🗑️</Text>
                <Text className="text-red-400 text-sm">删除 {selectedNoteIds.length}</Text>
              </View>
            ) : (
              <Text className="text-slate-400 text-sm">共 {notes.length} 条</Text>
            )}
            <View
              className="bg-slate-800 px-3 py-1.5 rounded-lg"
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedNoteIds([]);
              }}
            >
              <Text className="text-slate-300 text-sm">
                {isBatchMode ? '退出' : '批量'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 搜索栏 */}
      <View className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <View className="bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
          <Text>?</Text>
          <Input
            className="flex-1 bg-transparent text-white"
            placeholder="搜索笔记..."
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
          {searchKeyword && (
            <View onClick={() => setSearchKeyword('')}>
              <Text>✕</Text>
            </View>
          )}
        </View>
      </View>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <View className="bg-slate-800 px-4 py-3 border-b border-slate-700">
          <ScrollView
            scrollX
            className="whitespace-nowrap"
          >
            <View className="flex gap-2">
              <View
                className={`px-3 py-1.5 rounded-lg text-sm ${!activeTag ? 'bg-amber-500' : 'bg-slate-800'}`}
                onClick={() => setActiveTag('')}
              >
                <Text className={!activeTag ? 'text-white' : 'text-slate-300'}>全部</Text>
              </View>
              {allTags.map((tag) => (
                <View
                  key={tag}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${activeTag === tag ? 'bg-amber-500' : 'bg-slate-800'}`}
                  onClick={() => setActiveTag(tag)}
                >
                  <Text>🏷️</Text>
                  <Text className={activeTag === tag ? 'text-white' : 'text-slate-300'}>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 内容列表 */}
      <ScrollView
        className="flex-1"
        scrollY
        style={{ height: 'calc(100vh - 280rpx)' }}
      >
        <View className="px-4 py-3 space-y-3">
          {loading && (
            <View className="text-center py-12">
              <Text className="text-slate-400">加载中...</Text>
            </View>
          )}

          {!loading && filteredNotes.length > 0 && filteredNotes.map((note) => (
            <View
              key={note.id}
              className={`bg-slate-800 rounded-xl p-4 border border-slate-700 ${note.isPinned ? 'border-amber-500/30' : ''}`}
            >
              <View className="flex items-start gap-3">
                {/* 批量选择复选框 */}
                {isBatchMode && (
                  <View
                    className="mt-1"
                    onClick={() => toggleSelect(note.id)}
                  >
                    {selectedNoteIds.includes(note.id) ? (
                      <Text>✓</Text>
                    ) : (
                      <Text>⬜</Text>
                    )}
                  </View>
                )}

                <View className="flex-1 min-w-0">
                  {/* 标题和操作按钮 */}
                  <View className="flex items-start justify-between mb-2">
                    <View
                      className="flex-1 min-w-0"
                      onClick={() => openDetail(note)}
                    >
                      <Text className="text-white font-semibold text-base block truncate">{note.title}</Text>
                    </View>

                    {!isBatchMode && (
                      <View className="flex items-center gap-1 ml-2">
                        {note.isPinned && (
                          <Text>📌</Text>
                        )}
                        <View onClick={() => toggleStar(note.id)}>
                          {note.isStarred ? (
                            <Text>*</Text>
                          ) : (
                            <Text>*</Text>
                          )}
                        </View>
                        <View onClick={() => togglePin(note.id)}>
                          <Text>📌</Text>
                        </View>
                        <View onClick={() => handleDelete(note.id)}>
                          <Text>🗑️</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* 用户信息 */}
                  {note.userNickname && (
                    <View className="flex items-center gap-1 mb-2">
                      <Text>👤</Text>
                      <Text className="text-slate-400 text-xs">{note.userNickname}</Text>
                    </View>
                  )}

                  {/* 内容 */}
                  <View className="mb-2" onClick={() => openDetail(note)}>
                    <Text className="text-slate-300 text-sm block line-clamp-2">
                      {note.content}
                    </Text>
                  </View>

                  {/* 图片预览 */}
                  {note.images && note.images.length > 0 && (
                    <View className="mb-2">
                      <View className="flex gap-2 overflow-x-auto">
                        {note.images.slice(0, 3).map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            mode="aspectFill"
                            className="w-20 h-20 rounded-lg flex-shrink-0"
                            onClick={() => previewImage(note.images!, index)}
                          />
                        ))}
                        {note.images.length > 3 && (
                          <View className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Text className="text-slate-400 text-sm">+{note.images.length - 3}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* 底部信息 */}
                  <View className="flex items-center justify-between">
                    <View className="flex items-center gap-1">
                      <Text>🕐</Text>
                      <Text className="text-slate-400 text-xs">{formatDate(note.updatedAt)}</Text>
                    </View>
                    {note.tags && note.tags.length > 0 && (
                      <View className="flex items-center gap-1">
                        <Text>🏷️</Text>
                        <Text className="text-slate-400 text-xs">{note.tags.join(', ')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}

          {!loading && filteredNotes.length === 0 && (
            <View className="text-center py-12">
              <Text>📄</Text>
              <Text className="text-slate-400 mt-2">
                {searchKeyword || activeTag ? '未找到匹配的笔记' : '暂无笔记'}
              </Text>
            </View>
          )}

          {/* 底部空间 */}
          <View className="h-20"></View>
        </View>
      </ScrollView>

      {/* 详情对话框 */}
      {showDetailDialog && selectedNote && (
        <View className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <View className="bg-slate-800 w-full rounded-2xl max-h-[80vh] overflow-y-auto">
            <View className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <View className="flex items-center justify-between">
                <View className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedNote.isPinned && (
                    <Text>📌</Text>
                  )}
                  {selectedNote.isStarred && (
                    <Text>*</Text>
                  )}
                  <Text className="text-white font-semibold text-lg truncate">{selectedNote.title}</Text>
                </View>
                <View className="flex items-center gap-2">
                  <View onClick={() => {
                    toggleStar(selectedNote.id);
                    setSelectedNote({ ...selectedNote, isStarred: !selectedNote.isStarred });
                  }}
                  >
                    {selectedNote.isStarred ? (
                      <Text>*</Text>
                    ) : (
                      <Text>*</Text>
                    )}
                  </View>
                  <View onClick={() => {
                    togglePin(selectedNote.id);
                    setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned });
                  }}
                  >
                    <Text>📌</Text>
                  </View>
                  <View onClick={() => setShowDetailDialog(false)}>
                    <Text>✕</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="p-4 space-y-4">
              {/* 用户信息 */}
              {selectedNote.userNickname && (
                <View className="flex items-center gap-2">
                  <Text>👤</Text>
                  <Text className="text-slate-400 text-sm">{selectedNote.userNickname}</Text>
                </View>
              )}

              {/* 内容 */}
              <View>
                <Text className="text-white font-semibold text-base block mb-2">内容</Text>
                <Text className="text-slate-300 text-sm block leading-relaxed whitespace-pre-wrap">
                  {selectedNote.content}
                </Text>
              </View>

              {/* 图片 */}
              {selectedNote.images && selectedNote.images.length > 0 && (
                <View>
                  <Text className="text-white font-semibold text-base block mb-2">图片 ({selectedNote.images.length})</Text>
                  <View className="grid grid-cols-3 gap-2">
                    {selectedNote.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        mode="aspectFill"
                        className="w-full aspect-square rounded-lg"
                        onClick={() => previewImage(selectedNote.images!, index)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* 音频 */}
              {selectedNote.audio && (
                <View>
                  <Text className="text-white font-semibold text-base block mb-2">语音</Text>
                  <View className="bg-slate-800 rounded-xl p-3 flex items-center gap-2">
                    <Text>🎤</Text>
                    <Text className="text-slate-300 text-sm flex-1">语音记录</Text>
                    {isWeapp && (
                      <View
                        className="bg-amber-500 px-3 py-1.5 rounded-lg"
                        onClick={() => {
                          Taro.playVoice({ filePath: selectedNote.audio! });
                        }}
                      >
                        <Text className="text-white text-sm">播放</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* 标签 */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <View>
                  <Text className="text-white font-semibold text-base block mb-2">标签</Text>
                  <View className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, index) => (
                      <View key={index} className="px-3 py-1.5 rounded-lg bg-amber-500/20">
                        <Text className="text-amber-400 text-sm">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 时间信息 */}
              <View className="text-slate-400 text-xs pt-4 border-t border-slate-700 space-y-1">
                <Text className="block">
                  创建时间: {new Date(selectedNote.createdAt).toLocaleString('zh-CN')}
                </Text>
                <Text className="block">
                  更新时间: {new Date(selectedNote.updatedAt).toLocaleString('zh-CN')}
                </Text>
                {selectedNote.userId && (
                  <Text className="block">
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
