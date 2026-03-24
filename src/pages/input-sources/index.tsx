import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { Network } from '@/network';

type HotTopicSource = 'douyin' | 'baidu' | 'toutiao' | 'weibo';

interface CustomQuestionInput {
  liveQuestions: string[];
  salesQuestions: string[];
  commentQuestions: string[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
}

const InputSourcesPage = () => {
  // 弹窗状态
  const [showStarredNotesModal, setShowStarredNotesModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showHotTopicsModal, setShowHotTopicsModal] = useState(false);

  // 选中的数据
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedHotTopics, setSelectedHotTopics] = useState<string[]>([]);
  const [selectedHotSources, setSelectedHotSources] = useState<HotTopicSource[]>([]);

  // 原始数据
  const [starredNotes, setStarredNotes] = useState<Note[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionInput>({
    liveQuestions: [],
    salesQuestions: [],
    commentQuestions: []
  });
  const [hotTopics, setHotTopics] = useState<any[]>([]);

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('');

  // 问题编辑状态
  const [editingQuestion, setEditingQuestion] = useState<{ type: keyof CustomQuestionInput; index: number; value: string } | null>(null);
  const [newQuestionInput, setNewQuestionInput] = useState<{ type: keyof CustomQuestionInput | null; value: string }>({ type: null, value: '' });

  const hotTopicSources = [
    { id: 'douyin' as HotTopicSource, name: '抖音', color: 'text-pink-400' },
    { id: 'baidu' as HotTopicSource, name: '百度', color: 'text-blue-400' },
    { id: 'toutiao' as HotTopicSource, name: '今日头条', color: 'text-amber-400' },
    { id: 'weibo' as HotTopicSource, name: '微博', color: 'text-orange-400' }
  ];

  const customQuestionTypes = [
    { id: 'liveQuestions' as keyof CustomQuestionInput, name: '直播间高频问题', description: '客户在直播间问到的高频问题', icon: '📺', color: 'text-purple-400' },
    { id: 'salesQuestions' as keyof CustomQuestionInput, name: '销售对接高频问题', description: '销售与客户对接过程中遇到的问题', icon: '💰', color: 'text-emerald-400' },
    { id: 'commentQuestions' as keyof CustomQuestionInput, name: '私信评论热点话题', description: '私信和评论区遇到的热点话题', icon: '💬', color: 'text-blue-400' }
  ];

  // 加载星标笔记
  const loadStarredNotes = async () => {
    try {
      const notes = Taro.getStorageSync('notes') || [];
      const starred = notes.filter((note: any) => note.isStarred);
      setStarredNotes(starred);
    } catch (error) {
      console.error('加载星标笔记失败', error);
    }
  };

  // 加载配置
  const loadConfig = useCallback(async () => {
    try {
      const res = await Network.request({
        url: '/api/input-sources',
        method: 'GET'
      });
      if (res.data.code === 200 && res.data.data) {
        setCustomQuestions(res.data.data.customQuestions || customQuestions);
        setSelectedHotSources(res.data.data.hotTopicSources || []);
      }
    } catch (error) {
      console.error('加载配置失败', error);
    }
  }, [customQuestions]);

  // 加载热点话题（每次调用都会重新获取）
  const loadHotTopics = async () => {
    try {
      const res = await Network.request({
        url: '/api/hot-topics',
        method: 'GET'
      });
      if (res.data.code === 200) {
        const allTopics = res.data.data.flatMap((item: any) => item.topics);
        setHotTopics(allTopics);
      }
    } catch (error) {
      console.error('加载热点榜单失败', error);
    }
  };

  useEffect(() => {
    loadStarredNotes();
    loadConfig();
  }, [loadConfig]);

  // 打开热点话题弹窗时重新加载热点数据
  const openHotTopicsModal = () => {
    loadHotTopics();
    setShowHotTopicsModal(true);
  };

  // 切换笔记选择
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  // 切换问题选择
  const toggleQuestionSelection = (question: string) => {
    setSelectedQuestions(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  // 切换热点话题选择
  const toggleHotTopicSelection = (topicId: string) => {
    setSelectedHotTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // 切换热点来源选择
  const toggleHotSource = (sourceId: HotTopicSource) => {
    setSelectedHotSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  // 添加问题
  const handleAddQuestion = (type: keyof CustomQuestionInput) => {
    if (!newQuestionInput.value.trim()) {
      Taro.showToast({ title: '请输入问题内容', icon: 'none' });
      return;
    }
    const updatedQuestions = {
      ...customQuestions,
      [type]: [...customQuestions[type], newQuestionInput.value.trim()]
    };
    setCustomQuestions(updatedQuestions);
    setNewQuestionInput({ type: null, value: '' });
    saveQuestions(updatedQuestions);
  };

  // 编辑问题
  const handleEditQuestion = (type: keyof CustomQuestionInput, index: number, value: string) => {
    const updatedQuestions = {
      ...customQuestions,
      [type]: customQuestions[type].map((q, i) => i === index ? value : q)
    };
    setCustomQuestions(updatedQuestions);
    setEditingQuestion(null);
    saveQuestions(updatedQuestions);
  };

  // 删除问题
  const handleDeleteQuestion = (type: keyof CustomQuestionInput, index: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个问题吗？',
      success: (res) => {
        if (res.confirm) {
          const questionToDelete = customQuestions[type][index];
          const updatedQuestions = {
            ...customQuestions,
            [type]: customQuestions[type].filter((_, i) => i !== index)
          };
          setCustomQuestions(updatedQuestions);
          // 从已选列表中移除
          setSelectedQuestions(prev => prev.filter(q => q !== questionToDelete));
          saveQuestions(updatedQuestions);
        }
      }
    });
  };

  // 保存问题到后端
  const saveQuestions = async (questions: CustomQuestionInput) => {
    try {
      await Network.request({
        url: '/api/input-sources',
        method: 'POST',
        data: {
          platforms: selectedHotSources,
          customQuestions: questions,
          hotTopicSources: selectedHotSources
        }
      });
    } catch (error) {
      console.error('保存问题失败', error);
    }
  };

  // 保存配置
  const saveConfig = async () => {
    try {
      const res = await Network.request({
        url: '/api/input-sources',
        method: 'POST',
        data: {
          platforms: selectedHotSources,
          customQuestions,
          hotTopicSources: selectedHotSources
        }
      });
      if (res.data.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '保存失败', icon: 'error' });
      }
    } catch (error) {
      console.error('保存失败', error);
      Taro.showToast({ title: '保存失败', icon: 'error' });
    }
  };

  // 创建本次选题库
  const generateTopics = async () => {
    if (selectedNotes.length === 0 && selectedQuestions.length === 0 && selectedHotTopics.length === 0) {
      Taro.showToast({ title: '请先选择素材来源', icon: 'none' });
      return;
    }

    try {
      const validNotes = selectedNotes
        .map(id => starredNotes.find(n => n.id === id))
        .filter((note): note is Note => !!note && !!(note.title || note.content));

      const noteQuestions = validNotes.map(note => note.title || note.content || '');

      const allQuestions = [...noteQuestions, ...selectedQuestions];

      const selectedHotTopicsData = selectedHotTopics
        .map(id => hotTopics.find(t => t.id === id || t === id))
        .filter((topic): topic is any => !!topic);

      const res = await Network.request({
        url: '/api/ai-analysis/recommend-topics',
        method: 'POST',
        data: {
          platforms: selectedHotSources,
          questions: allQuestions,
          hotTopics: selectedHotTopicsData,
          preferences: {
            industries: [],
            interests: [],
            newsCategories: []
          }
        }
      });

      if (res.data.code === 200) {
        // 将创建的选题保存到 Taro 存储
        Taro.setStorageSync('generatedTopics', res.data.data);
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/systems/index?type=topic&hasGenerated=true'
          });
        }, 1000);
      } else {
        Taro.showToast({ title: '创建失败', icon: 'error' });
      }
    } catch (error) {
      console.error('创建选题库失败', error);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    }
  };

  // 导航到灵感速记页面
  const navigateToQuickNote = () => {
    Taro.navigateTo({
      url: '/pages/quick-note/index'
    });
  };

  // 获取过滤后的热点话题
  const getFilteredHotTopics = () => {
    return hotTopics.filter(topic => {
      if (selectedHotSources.length > 0 && !selectedHotSources.includes(topic.source)) {
        return false;
      }
      if (searchKeyword && !topic.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  return (
    <View className="min-h-screen bg-slate-900 pb-4">
      {/* 头部说明 */}
      <View className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-500/20 p-4">
        <Text className="block text-lg font-semibold text-white mb-1">选择创作素材来源</Text>
        <Text className="block text-sm text-slate-400">点击卡片选择素材，创建专属选题库</Text>
      </View>

      {/* 1. 星标笔记入口 */}
      <View className="p-4">
        <View
          className="bg-slate-800 rounded-xl p-4 border border-slate-700 active:scale-[0.99] transition-all"
          onClick={() => setShowStarredNotesModal(true)}
        >
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-3">
              <View className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl flex items-center justify-center">
                <Text>*</Text>
              </View>
              <View>
                <Text className="block text-base font-semibold text-white mb-1">星标笔记</Text>
                <Text className="block text-xs text-slate-400">
                  已选择 {selectedNotes.length} / {starredNotes.length} 条笔记
                </Text>
              </View>
            </View>
            <Text>›</Text>
          </View>
        </View>
      </View>

      {/* 2. 自定义问题库入口 */}
      <View className="px-4 pb-4">
        <View
          className="bg-slate-800 rounded-xl p-4 border border-slate-700 active:scale-[0.99] transition-all"
          onClick={() => setShowQuestionsModal(true)}
        >
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-3">
              <View className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                <Text>✨</Text>
              </View>
              <View>
                <Text className="block text-base font-semibold text-white mb-1">自定义问题库</Text>
                <Text className="block text-xs text-slate-400">
                  已选择 {selectedQuestions.length} 个问题
                </Text>
              </View>
            </View>
            <Text>›</Text>
          </View>
        </View>
      </View>

      {/* 3. 热点榜单入口 */}
      <View className="px-4 pb-4">
        <View
          className="bg-slate-800 rounded-xl p-4 border border-slate-700 active:scale-[0.99] transition-all"
          onClick={openHotTopicsModal}
        >
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-3">
              <View className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                <Text>^</Text>
              </View>
              <View>
                <Text className="block text-base font-semibold text-white mb-1">热点榜单</Text>
                <Text className="block text-xs text-slate-400">
                  已选择 {selectedHotTopics.length} / {hotTopics.length} 条话题
                </Text>
              </View>
            </View>
            <Text>›</Text>
          </View>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View className="px-4 flex gap-3">
        <View
          className="flex-1 bg-slate-800 text-white text-center py-3 rounded-xl font-medium active:opacity-80"
          onClick={saveConfig}
        >
          保存配置
        </View>
        <View
          className="flex-1 bg-blue-500 text-white text-center py-3 rounded-xl font-medium active:opacity-80"
          onClick={generateTopics}
        >
          创建本次选题库
        </View>
      </View>

      {/* 星标笔记弹窗 */}
      {showStarredNotesModal && (
        <View className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <View className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
            <View className="flex items-center gap-2">
              <Text>*</Text>
              <Text className="block text-lg font-semibold text-white">星标笔记</Text>
              <Text className="block text-sm text-slate-400">
                已选 {selectedNotes.length} / {starredNotes.length}
              </Text>
            </View>
            <View className="flex items-center gap-3">
              <Text
                className="text-sm text-blue-400"
                onClick={() => setSelectedNotes(starredNotes.map(n => n.id))}
              >
                全选
              </Text>
              <View
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"
                onClick={() => setShowStarredNotesModal(false)}
              >
                <Text>✕</Text>
              </View>
            </View>
          </View>

          <ScrollView scrollY className="flex-1 p-4">
            {starredNotes.length > 0 ? (
              <View className="flex flex-col gap-3">
                {starredNotes.map((note) => (
                  <View
                    key={note.id}
                    className={`bg-slate-800 rounded-xl p-4 border-2 ${
                      selectedNotes.includes(note.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700'
                    }`}
                    onClick={() => toggleNoteSelection(note.id)}
                  >
                    <View className="flex items-start gap-3">
                      <View
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedNotes.includes(note.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-700'
                        }`}
                      >
                        {selectedNotes.includes(note.id) && <Text>✓</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        {note.title && (
                          <Text className="block text-sm font-medium text-white mb-1.5">
                            {note.title}
                          </Text>
                        )}
                        {note.content && (
                          <Text className="block text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">
                            {note.content}
                          </Text>
                        )}
                        <Text className="block text-xs text-slate-300">
                          {note.updatedAt || note.createdAt || '刚刚'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="text-center py-12 bg-slate-800 rounded-xl">
                <Text>📄</Text>
                <Text className="block text-slate-400 text-base mt-4 mb-2">
                  还没有星标笔记
                </Text>
                <Text className="block text-slate-300 text-sm mb-4">
                  在灵感速记中添加星标
                </Text>
                <View
                  className="inline-block px-6 py-2 bg-blue-500 rounded-lg active:opacity-80"
                  onClick={() => {
                    setShowStarredNotesModal(false);
                    navigateToQuickNote();
                  }}
                >
                  <Text className="block text-sm text-white">去添加</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View className="bg-slate-800 p-4 border-t border-slate-700">
            <View
              className="bg-blue-500 text-white text-center py-3 rounded-xl font-medium active:opacity-80"
              onClick={() => setShowStarredNotesModal(false)}
            >
              确定
            </View>
          </View>
        </View>
      )}

      {/* 自定义问题库弹窗 */}
      {showQuestionsModal && (
        <View className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <View className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
            <View className="flex items-center gap-2">
              <Text>✨</Text>
              <Text className="block text-lg font-semibold text-white">自定义问题库</Text>
              <Text className="block text-sm text-slate-400">
                已选 {selectedQuestions.length}
              </Text>
            </View>
            <View
              className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"
              onClick={() => {
                setShowQuestionsModal(false);
                setEditingQuestion(null);
                setNewQuestionInput({ type: null, value: '' });
              }}
            >
              <Text>✕</Text>
            </View>
          </View>

          <ScrollView scrollY className="flex-1 p-4">
            <View className="flex flex-col gap-4">
              {customQuestionTypes.map((typeInfo) => {
                const questions = customQuestions[typeInfo.id];
                return (
                  <View key={typeInfo.id} className="bg-slate-800 rounded-xl p-4">
                    <View className="flex items-center gap-2 mb-3">
                      <Text className="block text-xl">{typeInfo.icon}</Text>
                      <Text className={`block text-base font-semibold ${typeInfo.color}`}>
                        {typeInfo.name}
                      </Text>
                      <Text className="block text-xs text-slate-400 ml-auto">
                        {questions.length} 个问题
                      </Text>
                    </View>
                    <Text className="block text-xs text-slate-400 mb-3 leading-relaxed">
                      {typeInfo.description}
                    </Text>

                    {/* 问题列表 */}
                    {questions.length > 0 ? (
                      <View className="flex flex-col gap-2 mb-3">
                        {questions.filter(q => q.trim()).map((question, index) => (
                          <View
                            key={index}
                            className={`rounded-lg p-3 border-2 ${
                              editingQuestion?.type === typeInfo.id && editingQuestion?.index === index
                                ? 'border-blue-500 bg-blue-500/10'
                                : selectedQuestions.includes(question)
                                ? 'border-blue-500/50 bg-blue-500/5'
                                : 'border-slate-700 bg-slate-800'
                            }`}
                          >
                            {editingQuestion?.type === typeInfo.id && editingQuestion?.index === index ? (
                              <View className="flex items-start gap-2">
                                <View style={{ flex: 1 }}>
                                  <View className="bg-slate-800 rounded-lg p-3">
                                    <Input
                                      className="w-full bg-transparent text-white text-sm"
                                      placeholder="输入问题内容"
                                      value={editingQuestion.value}
                                      onInput={(e) => setEditingQuestion({ ...editingQuestion, value: e.detail.value })}
                                    />
                                  </View>
                                </View>
                              </View>
                            ) : (
                              <View className="flex items-start gap-3">
                                <View
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                    selectedQuestions.includes(question)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-slate-700'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleQuestionSelection(question);
                                  }}
                                >
                                  {selectedQuestions.includes(question) && <Text>✓</Text>}
                                </View>
                                <Text className="block text-sm text-slate-300 flex-1 leading-relaxed">
                                  {question}
                                </Text>
                                <View
                                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingQuestion({ type: typeInfo.id, index, value: question });
                                  }}
                                >
                                  <Text>✏️</Text>
                                </View>
                                <View
                                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteQuestion(typeInfo.id, index);
                                  }}
                                >
                                  <Text>🗑️</Text>
                                </View>
                              </View>
                            )}

                            {/* 编辑操作按钮 */}
                            {editingQuestion?.type === typeInfo.id && editingQuestion?.index === index && (
                              <View className="flex gap-2 mt-2">
                                <View
                                  className="flex-1 py-2 bg-blue-500 rounded-lg flex items-center justify-center active:opacity-80"
                                  onClick={() => handleEditQuestion(typeInfo.id, index, editingQuestion.value)}
                                >
                                  <Text className="block text-xs text-white">保存</Text>
                                </View>
                                <View
                                  className="flex-1 py-2 bg-slate-800 rounded-lg flex items-center justify-center active:opacity-80"
                                  onClick={() => setEditingQuestion(null)}
                                >
                                  <Text className="block text-xs text-slate-300">取消</Text>
                                </View>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View className="text-center py-6 bg-slate-800/30 rounded-lg mb-3">
                        <Text className="block text-slate-400 text-xs">
                          暂无问题
                        </Text>
                      </View>
                    )}

                    {/* 添加新问题 */}
                    {newQuestionInput.type === typeInfo.id ? (
                      <View className="bg-slate-800 rounded-lg p-3">
                        <View className="flex items-start gap-2">
                          <View style={{ flex: 1 }}>
                            <View className="bg-slate-800 rounded-lg p-3 mb-2">
                              <Input
                                className="w-full bg-transparent text-white text-sm"
                                placeholder="输入新问题..."
                                value={newQuestionInput.value}
                                onInput={(e) => setNewQuestionInput({ type: typeInfo.id, value: e.detail.value })}
                              />
                            </View>
                            <View className="flex gap-2">
                              <View
                                className="flex-1 py-2 bg-blue-500 rounded-lg flex items-center justify-center active:opacity-80"
                                onClick={() => handleAddQuestion(typeInfo.id)}
                              >
                                <Text className="block text-xs text-white">添加</Text>
                              </View>
                              <View
                                className="flex-1 py-2 bg-slate-700 rounded-lg flex items-center justify-center active:opacity-80"
                                onClick={() => setNewQuestionInput({ type: null, value: '' })}
                              >
                                <Text className="block text-xs text-slate-300">取消</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View
                        className="flex items-center gap-2 py-2 px-3 bg-slate-800 rounded-lg active:opacity-80"
                        onClick={() => setNewQuestionInput({ type: typeInfo.id, value: '' })}
                      >
                        <Text>➕</Text>
                        <Text className="block text-sm text-blue-400">添加问题</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View className="bg-slate-800 p-4 border-t border-slate-700">
            <View
              className="bg-blue-500 text-white text-center py-3 rounded-xl font-medium active:opacity-80"
              onClick={() => {
                setShowQuestionsModal(false);
                setEditingQuestion(null);
                setNewQuestionInput({ type: null, value: '' });
              }}
            >
              确定
            </View>
          </View>
        </View>
      )}

      {/* 热点榜单弹窗 */}
      {showHotTopicsModal && (
        <View className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <View className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
            <View className="flex items-center gap-2">
              <Text>^</Text>
              <Text className="block text-lg font-semibold text-white">热点榜单</Text>
              <Text className="block text-sm text-slate-400">
                已选 {selectedHotTopics.length} / {getFilteredHotTopics().length}
              </Text>
            </View>
            <View
              className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"
              onClick={() => setShowHotTopicsModal(false)}
            >
              <Text>✕</Text>
            </View>
          </View>

          <View className="bg-slate-800 p-4 border-b border-slate-700">
            <Text className="block text-sm text-slate-400 mb-2">选择平台（可多选）</Text>
            <View className="flex flex-wrap gap-2">
              {hotTopicSources.map((source) => (
                <View
                  key={source.id}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedHotSources.includes(source.id)
                      ? 'bg-purple-500/20 border-purple-500 border'
                      : 'bg-slate-800 border-slate-700 border'
                  }`}
                  onClick={() => toggleHotSource(source.id)}
                >
                  {selectedHotSources.includes(source.id) && <Text>✓</Text>}
                  <Text
                    className={`block text-sm ${
                      selectedHotSources.includes(source.id) ? 'text-purple-400' : 'text-slate-300'
                    }`}
                  >
                    {source.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-slate-800 p-4 border-b border-slate-700">
            <View className="bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-2">
              <Text>?</Text>
              <Input
                className="w-full bg-transparent text-white text-sm"
                placeholder="搜索热点话题..."
                value={searchKeyword}
                onInput={(e) => setSearchKeyword(e.detail.value)}
              />
            </View>
          </View>

          <ScrollView scrollY className="flex-1 p-4">
            {getFilteredHotTopics().length > 0 ? (
              <View className="flex flex-col gap-2">
                {getFilteredHotTopics().map((topic, index) => (
                  <View
                    key={topic.id || index}
                    className={`rounded-xl p-4 border-2 ${
                      selectedHotTopics.includes(topic.id || index.toString())
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                    onClick={() => toggleHotTopicSelection(topic.id || index.toString())}
                  >
                    <View className="flex items-start gap-3">
                      <View className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Text className="block text-sm font-bold text-white">
                          {index + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text className="block text-sm font-medium text-white mb-2 leading-relaxed">
                          {topic.title}
                        </Text>
                        <View className="flex items-center gap-2 flex-wrap">
                          <View className="px-2 py-0.5 bg-purple-500/20 rounded">
                            <Text className="block text-xs text-purple-300">
                              {topic.category || '热点'}
                            </Text>
                          </View>
                          {topic.source && (
                            <View className="px-2 py-0.5 bg-slate-9000/20 rounded">
                              <Text className="block text-xs text-blue-300">
                                {hotTopicSources.find(s => s.id === topic.source)?.name}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedHotTopics.includes(topic.id || index.toString())
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-slate-700'
                        }`}
                      >
                        {selectedHotTopics.includes(topic.id || index.toString()) && <Text>✓</Text>}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="text-center py-12 bg-slate-800 rounded-xl">
                <Text>^</Text>
                <Text className="block text-slate-400 text-base mt-4">
                  暂无热点话题
                </Text>
                <Text className="block text-slate-300 text-sm mt-2">
                  请选择平台或搜索关键词
                </Text>
              </View>
            )}
          </ScrollView>

          <View className="bg-slate-800 p-4 border-t border-slate-700">
            <View
              className="bg-purple-500 text-white text-center py-3 rounded-xl font-medium active:opacity-80"
              onClick={() => setShowHotTopicsModal(false)}
            >
              确定
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default InputSourcesPage;
