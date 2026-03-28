import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
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
  ArrowRight,
  Sparkles,
} from 'lucide-react-taro';
import { Network } from '@/network';

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

// 平台选项
const PLATFORM_OPTIONS = [
  { value: '公众号', label: '公众号' },
  { value: '小红书', label: '小红书' },
  { value: '抖音', label: '抖音' },
  { value: '视频号', label: '视频号' },
  { value: '微博', label: '微博' },
  { value: 'B站', label: 'B站' },
];

// 内容类型选项
const CONTENT_TYPE_OPTIONS = [
  { value: '图文', label: '图文' },
  { value: '视频', label: '视频' },
  { value: '直播', label: '直播' },
  { value: '短图文', label: '短图文' },
];

const QuickNotePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // 转化为选题的弹窗状态
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [convertingNote, setConvertingNote] = useState<Note | null>(null);
  const [convertPlatform, setConvertPlatform] = useState('公众号');
  const [convertContentType, setConvertContentType] = useState('图文');
  const [isConverting, setIsConverting] = useState(false);

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

  // 打开转化为选题弹窗
  const openConvertDialog = (note: Note) => {
    setConvertingNote(note);
    setConvertPlatform('公众号');
    setConvertContentType('图文');
    setShowConvertDialog(true);
  };

  // 执行转化为选题
  const handleConvertToTopic = async () => {
    if (!convertingNote) return;
    
    setIsConverting(true);
    try {
      // 调用后端创建选题
      const res = await Network.request({
        url: '/api/topics',
        method: 'POST',
        data: {
          title: convertingNote.title,
          description: convertingNote.content,
          platform: convertPlatform,
          content_type: convertContentType,
          tags: convertingNote.tags,
          inspiration_data: {
            type: 'quick_note',
            note_id: convertingNote.id,
            source: '灵感速记',
          },
        },
      });

      console.log('[QuickNote] 创建选题结果:', res);

      if (res.data?.code === 200) {
        const topicId = res.data.data?.id;
        
        // 标记笔记已转化为选题
        const updatedNotes = notes.map((note) =>
          note.id === convertingNote.id
            ? { ...note, convertedToTopic: true, topicId }
            : note
        );
        saveNotes(updatedNotes);

        setShowConvertDialog(false);
        Taro.showToast({ title: '已转化为选题', icon: 'success' });

        // 延迟跳转到选题策划页面
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/topic-planning/index' });
        }, 500);
      } else {
        Taro.showToast({ title: res.data?.msg || '创建失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[QuickNote] 转化失败:', error);
      Taro.showToast({ title: '转化失败', icon: 'none' });
    } finally {
      setIsConverting(false);
    }
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
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '120px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => Taro.navigateBack()}
            >
              <ChevronLeft size={24} color="#f1f5f9" />
            </View>
            <View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>灵感速记</Text>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>{notes.length} 条笔记</Text>
            </View>
          </View>
          
          <View
            style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #38bdf8 0%, #fb923c 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus size={24} color="#000" />
          </View>
        </View>

        {/* 流程提示 */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <Text style={{ fontSize: '12px', color: '#38bdf8' }}>灵感速记</Text>
          </View>
          <ArrowRight size={14} color="#71717a" />
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#71717a' }} />
            <Text style={{ fontSize: '12px', color: '#71717a' }}>选题策划</Text>
          </View>
          <ArrowRight size={14} color="#71717a" />
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#71717a' }} />
            <Text style={{ fontSize: '12px', color: '#71717a' }}>内容创作</Text>
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#111827', borderRadius: '12px', padding: '12px 16px', border: '1px solid #1e3a5f' }}>
          <Search size={18} color="#71717a" />
          <Input
            style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
            placeholder="搜索笔记..."
            placeholderStyle="color: #64748b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <ScrollView scrollX style={{ marginTop: '12px', whiteSpace: 'nowrap' }}>
            <View style={{ display: 'inline-flex', gap: '8px' }}>
              <View
                style={{ padding: '6px 14px', borderRadius: '16px', backgroundColor: !searchKeyword ? 'rgba(245, 158, 11, 0.2)' : '#1e3a5f', border: !searchKeyword ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #1e3a5f' }}
                onClick={() => setSearchKeyword('')}
              >
                <Text style={{ fontSize: '13px', color: !searchKeyword ? '#38bdf8' : '#94a3b8' }}>全部</Text>
              </View>
              {allTags.map((tag, index) => (
                <View key={index} style={{ padding: '6px 14px', borderRadius: '16px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Text style={{ fontSize: '13px', color: '#38bdf8' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* 笔记列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 280px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {filteredNotes.length === 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
              <View style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #1e3a5f' }}>
                <Inbox size={40} color="#64748b" />
              </View>
              <Text style={{ fontSize: '16px', color: '#71717a', display: 'block', marginBottom: '8px' }}>
                {searchKeyword ? '没有找到相关笔记' : '还没有笔记'}
              </Text>
              {!searchKeyword && (
                <Text style={{ fontSize: '14px', color: '#38bdf8' }} onClick={() => setShowAddDialog(true)}>
                  点击添加第一条笔记
                </Text>
              )}
            </View>
          ) : (
            filteredNotes.map((note) => (
              <View
                key={note.id}
                style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #1e3a5f' }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      {note.isPinned && <Pin size={14} color="#38bdf8" />}
                      {(note as any).convertedToTopic && (
                        <View style={{ padding: '2px 6px', backgroundColor: 'rgba(74, 222, 128, 0.2)', borderRadius: '4px' }}>
                          <Text style={{ fontSize: '10px', color: '#4ade80' }}>已转选题</Text>
                        </View>
                      )}
                      <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'block' }}>{note.title}</Text>
                    </View>
                    <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.content || '暂无内容'}</Text>
                  </View>
                  
                  <View style={{ display: 'flex', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                    <View
                      style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleToggleStar(note.id)}
                    >
                      {note.isStarred ? (
                        <Star size={18} color="#38bdf8" />
                      ) : (
                        <StarOff size={18} color="#71717a" />
                      )}
                    </View>
                    <View
                      style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 size={18} color="#f87171" />
                    </View>
                  </View>
                </View>

                {note.tags.length > 0 && (
                  <View style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {note.tags.map((tag, index) => (
                      <View key={index} style={{ padding: '4px 10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <Text style={{ fontSize: '12px', color: '#38bdf8' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 底部操作区 */}
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
                  <Text style={{ fontSize: '12px', color: '#64748b' }}>{formatTime(note.updatedAt)}</Text>
                  
                  {/* 转化为选题按钮 */}
                  {(note as any).convertedToTopic ? (
                    <View
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => Taro.navigateTo({ url: '/pages/topic-planning/index' })}
                    >
                      <Text style={{ fontSize: '13px', color: '#4ade80' }}>查看选题</Text>
                      <ArrowRight size={14} color="#4ade80" />
                    </View>
                  ) : (
                    <View
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#38bdf8',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => openConvertDialog(note)}
                    >
                      <Sparkles size={14} color="#000" />
                      <Text style={{ fontSize: '13px', fontWeight: '500', color: '#000' }}>转化为选题</Text>
                    </View>
                  )}
                </View>
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
            style={{ width: '100%', backgroundColor: '#111827', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View style={{ padding: '20px', borderBottom: '1px solid #1e3a5f' }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>新建笔记</Text>
                <View
                  style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setShowAddDialog(false)}
                >
                  <X size={18} color="#71717a" />
                </View>
              </View>
            </View>

            {/* 表单内容 */}
            <ScrollView scrollY style={{ padding: '20px', maxHeight: '50vh' }}>
              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>标题 *</Text>
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '12px', padding: '14px', border: '1px solid #1e3a5f' }}>
                  <Input
                    style={{ width: '100%', fontSize: '15px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入标题"
                    placeholderStyle="color: #64748b"
                    value={newTitle}
                    onInput={(e) => setNewTitle(e.detail.value)}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>内容</Text>
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '12px', padding: '14px', border: '1px solid #1e3a5f' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '120px', fontSize: '15px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入内容..."
                    placeholderStyle="color: #64748b"
                    value={newContent}
                    onInput={(e) => setNewContent(e.detail.value)}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>标签（逗号分隔）</Text>
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '12px', padding: '14px', border: '1px solid #1e3a5f' }}>
                  <Input
                    style={{ width: '100%', fontSize: '15px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="如：灵感, 工作, 生活"
                    placeholderStyle="color: #64748b"
                    value={newTags}
                    onInput={(e) => setNewTags(e.detail.value)}
                  />
                </View>
              </View>
            </ScrollView>

            {/* 保存按钮 */}
            <View style={{ padding: '20px', borderTop: '1px solid #1e3a5f' }}>
              <View
                style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#38bdf8', textAlign: 'center' }}
                onClick={handleAddNote}
              >
                <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0a0f1a' }}>保存笔记</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 转化为选题弹窗 */}
      {showConvertDialog && convertingNote && (
        <View
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowConvertDialog(false)}
        >
          <View
            style={{ width: '100%', backgroundColor: '#111827', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View style={{ padding: '20px', borderBottom: '1px solid #1e3a5f' }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} color="#fbbf24" />
                  <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>转化为选题</Text>
                </View>
                <View
                  style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setShowConvertDialog(false)}
                >
                  <X size={18} color="#71717a" />
                </View>
              </View>
            </View>

            {/* 灵感预览 */}
            <View style={{ padding: '16px 20px', borderBottom: '1px solid #1e3a5f' }}>
              <View style={{ padding: '12px', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <Text style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '4px', display: 'block' }}>灵感来源</Text>
                <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>{convertingNote.title}</Text>
                {convertingNote.content && (
                  <Text style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>{convertingNote.content.substring(0, 100)}{convertingNote.content.length > 100 ? '...' : ''}</Text>
                )}
              </View>
            </View>

            {/* 选择平台和内容类型 */}
            <ScrollView scrollY style={{ padding: '20px', maxHeight: '40vh' }}>
              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>发布平台</Text>
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '12px', padding: '14px', border: '1px solid #1e3a5f' }}>
                  <Picker
                    mode="selector"
                    range={PLATFORM_OPTIONS}
                    rangeKey="label"
                    value={PLATFORM_OPTIONS.findIndex(p => p.value === convertPlatform)}
                    onChange={(e) => {
                      const idx = e.detail.value;
                      setConvertPlatform(PLATFORM_OPTIONS[idx].value);
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '15px', color: '#ffffff' }}>
                        {PLATFORM_OPTIONS.find(p => p.value === convertPlatform)?.label}
                      </Text>
                      <View style={{ transform: 'rotate(90deg)' }}>
                        <ChevronLeft size={16} color="#71717a" />
                      </View>
                    </View>
                  </Picker>
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>内容类型</Text>
                <View style={{ backgroundColor: '#0a0f1a', borderRadius: '12px', padding: '14px', border: '1px solid #1e3a5f' }}>
                  <Picker
                    mode="selector"
                    range={CONTENT_TYPE_OPTIONS}
                    rangeKey="label"
                    value={CONTENT_TYPE_OPTIONS.findIndex(c => c.value === convertContentType)}
                    onChange={(e) => {
                      const idx = e.detail.value;
                      setConvertContentType(CONTENT_TYPE_OPTIONS[idx].value);
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '15px', color: '#ffffff' }}>
                        {CONTENT_TYPE_OPTIONS.find(c => c.value === convertContentType)?.label}
                      </Text>
                      <View style={{ transform: 'rotate(90deg)' }}>
                        <ChevronLeft size={16} color="#71717a" />
                      </View>
                    </View>
                  </Picker>
                </View>
              </View>
            </ScrollView>

            {/* 确认按钮 */}
            <View style={{ padding: '20px', borderTop: '1px solid #1e3a5f' }}>
              <View
                style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#38bdf8', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={isConverting ? undefined : handleConvertToTopic}
              >
                {isConverting ? (
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0a0f1a' }}>转化中...</Text>
                ) : (
                  <>
                    <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0a0f1a' }}>创建选题并跳转</Text>
                    <ArrowRight size={18} color="#0a0f1a" />
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuickNotePage;
