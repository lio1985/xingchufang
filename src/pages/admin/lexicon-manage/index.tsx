import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

// 语料库数据结构
interface Lexicon {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'enterprise' | 'personal' | 'product';
  userId: string;
  userNickname?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminLexiconManagePage() {
  // 数据状态
  const [lexicons, setLexicons] = useState<Lexicon[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 使用 ref 来跟踪 loading 状态，避免 useCallback 循环依赖
  const loadingRef = useRef(false);

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'enterprise' | 'personal' | 'product'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // 新建/编辑对话框
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedLexicon, setSelectedLexicon] = useState<Lexicon | null>(null);

  // 表单数据
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formType, setFormType] = useState<'enterprise' | 'personal' | 'product'>('personal');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // 分类列表
  const [categories, setCategories] = useState<string[]>([]);

  const typeConfig = {
    enterprise: {
      label: '企业语料库',
      icon: <Text>🏢</Text>,
      color: 'bg-blue-500'
    },
    personal: {
      label: '个人IP语料库',
      icon: <Text>👤</Text>,
      color: 'bg-emerald-500'
    },
    product: {
      label: '产品知识库',
      icon: <Text>📦</Text>,
      color: 'bg-amber-500'
    }
  };

  // 加载语料库列表
  const loadLexicons = useCallback(async () => {
    if (loadingRef.current) return;

    setLoading(true);
    loadingRef.current = true;
    try {
      const params: any = {
        page: 1,
        pageSize: 50,
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      if (categoryFilter) {
        params.category = categoryFilter;
      }

      if (searchKeyword) {
        params.search = searchKeyword;
      }

      const res = await Network.request({
        url: '/api/lexicon',
        method: 'GET',
        data: {
          ...params,
          viewAll: true, // 管理员查看所有用户的语料库
        },
      });

      console.log('语料库列表响应:', res.data);

      if (res.data && res.data.code === 200) {
        const data = res.data.data;
        const lexiconItems = Array.isArray(data.items) ? data.items : []
        setLexicons(lexiconItems);
        setTotal(data.total || lexiconItems.length || 0);
      }
    } catch (error: any) {
      console.error('加载语料库列表失败:', error);
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [typeFilter, categoryFilter, searchKeyword]);

  // 加载分类列表
  const loadCategories = useCallback(async () => {
    try {
      const res = await Network.request({
        url: '/api/lexicon',
        method: 'GET',
        data: { pageSize: 1000 },
      });

      if (res.data && res.data.code === 200) {
        const data = Array.isArray(res.data.data?.items) ? res.data.data.items : []
        const uniqueCategories = [...new Set(data.map((item: Lexicon) => item.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  }, []);

  useEffect(() => {
    loadLexicons();
    loadCategories();
  }, [typeFilter, categoryFilter, searchKeyword, loadLexicons, loadCategories]);

  // 创建语料库
  const handleCreate = async () => {
    if (!formTitle.trim() || !formContent.trim() || !formCategory.trim()) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/lexicon',
        method: 'POST',
        data: {
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory.trim(),
          type: formType,
          tags: formTags,
        },
      });

      console.log('创建语料库响应:', res.data);

      if (res.data && res.data.code === 200) {
        Taro.showToast({
          title: '创建成功',
          icon: 'success'
        });
        resetForm();
        setShowCreateDialog(false);
        loadLexicons();
        loadCategories();
      } else {
        throw new Error(res.data?.msg || '创建失败');
      }
    } catch (error: any) {
      console.error('创建语料库失败:', error);
      Taro.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      });
    }
  };

  // 更新语料库
  const handleUpdate = async () => {
    if (!selectedLexicon || !formTitle.trim() || !formContent.trim() || !formCategory.trim()) {
      return;
    }

    try {
      const res = await Network.request({
        url: `/api/lexicon/${selectedLexicon.id}`,
        method: 'PUT',
        data: {
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory.trim(),
          type: formType,
          tags: formTags,
        },
      });

      console.log('更新语料库响应:', res.data);

      if (res.data && res.data.code === 200) {
        Taro.showToast({
          title: '更新成功',
          icon: 'success'
        });
        resetForm();
        setShowEditDialog(false);
        loadLexicons();
      } else {
        throw new Error(res.data?.msg || '更新失败');
      }
    } catch (error: any) {
      console.error('更新语料库失败:', error);
      Taro.showToast({
        title: error.message || '更新失败',
        icon: 'none'
      });
    }
  };

  // 删除语料库
  const handleDelete = async (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条语料库吗？',
      success: async (confirmRes) => {
        if (confirmRes.confirm) {
          try {
            const result = await Network.request({
              url: `/api/lexicon/${id}`,
              method: 'DELETE',
            });

            console.log('删除语料库响应:', result.data);

            if (result.data && result.data.code === 200) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              });
              loadLexicons();
              loadCategories();
            } else {
              throw new Error(result.data?.msg || '删除失败');
            }
          } catch (error: any) {
            console.error('删除语料库失败:', error);
            Taro.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  };

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !formTags.includes(tagInput.trim())) {
      setFormTags([...formTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setFormTags(formTags.filter(t => t !== tag));
  };

  // 重置表单
  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('');
    setFormType('personal');
    setFormTags([]);
    setTagInput('');
    setSelectedLexicon(null);
  };

  // 打开编辑对话框
  const openEditDialog = (lexicon: Lexicon) => {
    setSelectedLexicon(lexicon);
    setFormTitle(lexicon.title);
    setFormContent(lexicon.content);
    setFormCategory(lexicon.category);
    setFormType(lexicon.type);
    setFormTags(lexicon.tags || []);
    setShowEditDialog(true);
  };

  // 打开详情对话框
  const openDetailDialog = (lexicon: Lexicon) => {
    setSelectedLexicon(lexicon);
    setShowDetailDialog(true);
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
              <Text>💾</Text>
              <Text className="text-white font-semibold text-lg">语料库管理</Text>
            </View>
          </View>
          <View className="flex items-center gap-2">
            <Text className="text-slate-400 text-sm">共 {total} 条</Text>
          </View>
        </View>
      </View>

      {/* 搜索栏 */}
      <View className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <View className="bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
          <Text>🔍</Text>
          <Input
            className="flex-1 bg-transparent text-white"
            placeholder="搜索语料库..."
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

      {/* 筛选栏 */}
      <View className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <View className="flex items-center gap-2">
          <View
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Text>📝</Text>
            <Text className="text-slate-300 text-sm">筛选</Text>
            <Text>▼</Text>
          </View>

          {typeFilter !== 'all' && (
            <View
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-9000/20"
              onClick={() => setTypeFilter('all')}
            >
              <Text className="text-blue-400 text-sm">{typeConfig[typeFilter].label}</Text>
              <Text>✕</Text>
            </View>
          )}

          {categoryFilter && (
            <View
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20"
              onClick={() => setCategoryFilter('')}
            >
              <Text className="text-emerald-400 text-sm">{categoryFilter}</Text>
              <Text>✕</Text>
            </View>
          )}
        </View>

        {showFilters && (
          <View className="mt-3 space-y-3">
            {/* 类型筛选 */}
            <View>
              <Text className="text-slate-400 text-xs block mb-2">类型</Text>
              <View className="flex flex-wrap gap-2">
                <View
                  className={`px-3 py-1.5 rounded-lg text-sm ${typeFilter === 'all' ? 'bg-blue-500' : 'bg-slate-800'}`}
                  onClick={() => setTypeFilter('all')}
                >
                  <Text className={typeFilter === 'all' ? 'text-white' : 'text-slate-300'}>全部</Text>
                </View>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <View
                    key={key}
                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${typeFilter === key ? config.color : 'bg-slate-800'}`}
                    onClick={() => setTypeFilter(key as any)}
                  >
                    {config.icon}
                    <Text className={typeFilter === key ? 'text-white' : 'text-slate-300'}>{config.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 分类筛选 */}
            <View>
              <Text className="text-slate-400 text-xs block mb-2">分类</Text>
              <View className="flex flex-wrap gap-2">
                <View
                  className={`px-3 py-1.5 rounded-lg text-sm ${!categoryFilter ? 'bg-emerald-500' : 'bg-slate-800'}`}
                  onClick={() => setCategoryFilter('')}
                >
                  <Text className={!categoryFilter ? 'text-white' : 'text-slate-300'}>全部</Text>
                </View>
                {categories.map((cat) => (
                  <View
                    key={cat}
                    className={`px-3 py-1.5 rounded-lg text-sm ${categoryFilter === cat ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    <Text className={categoryFilter === cat ? 'text-white' : 'text-slate-300'}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

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

          {!loading && lexicons.length > 0 && lexicons.map((item) => {
            const config = typeConfig[item.type];
            return (
              <View key={item.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <View className="flex items-start justify-between mb-2">
                  <View className="flex-1 min-w-0">
                    <View className="flex items-center gap-2 mb-1">
                      {config.icon}
                      <Text className="text-white font-semibold text-base block truncate">{item.title}</Text>
                    </View>
                    <Text className="text-slate-400 text-xs block">
                      {item.userNickname || item.userId} · {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <View className="flex items-center gap-1 ml-2">
                    <View onClick={() => openDetailDialog(item)}>
                      <Text>👁</Text>
                    </View>
                    <View onClick={() => openEditDialog(item)}>
                      <Text>✏</Text>
                    </View>
                    <View onClick={() => handleDelete(item.id)}>
                      <Text>🗑</Text>
                    </View>
                  </View>
                </View>

                <View className="mb-2">
                  <Text className="text-slate-300 text-sm block line-clamp-2">
                    {item.content}
                  </Text>
                </View>

                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-1">
                    <Text>📂</Text>
                    <Text className="text-slate-400 text-xs">{item.category}</Text>
                  </View>
                  {item.tags && item.tags.length > 0 && (
                    <View className="flex items-center gap-1">
                      <Text>🏷</Text>
                      <Text className="text-slate-400 text-xs">{item.tags.length} 标签</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {!loading && lexicons.length === 0 && (
            <View className="text-center py-12">
              <Text>📄</Text>
              <Text className="text-slate-400 mt-2">暂无语料库</Text>
            </View>
          )}

          {/* 底部空间 */}
          <View className="h-20"></View>
        </View>
      </ScrollView>

      {/* 底部添加按钮 */}
      <View className="fixed bottom-6 right-6">
        <View
          className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }}
        >
          <Text>+</Text>
        </View>
      </View>

      {/* 创建语料库对话框 */}
      {showCreateDialog && (
        <View className="fixed inset-0 bg-black/50 flex items-end z-50">
          <View className="bg-slate-800 w-full rounded-t-3xl max-h-[80vh] overflow-y-auto">
            <View className="p-4 border-b border-slate-700">
              <View className="flex items-center justify-between">
                <Text className="text-white font-semibold text-lg">新建语料库</Text>
                <View onClick={() => setShowCreateDialog(false)}>
                  <Text>✕</Text>
                </View>
              </View>
            </View>

            <View className="p-4 space-y-4">
              {/* 类型选择 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">类型</Text>
                <View className="flex gap-2">
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <View
                      key={key}
                      className={`flex-1 px-3 py-2 rounded-lg text-center ${formType === key ? config.color : 'bg-slate-800'}`}
                      onClick={() => setFormType(key as any)}
                    >
                      <View className="flex items-center justify-center gap-1">
                        {config.icon}
                        <Text className={formType === key ? 'text-white' : 'text-slate-300'} text-sm>{config.label}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* 标题 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">标题</Text>
                <Input
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white"
                  placeholder="请输入标题"
                  value={formTitle}
                  onInput={(e) => setFormTitle(e.detail.value)}
                />
              </View>

              {/* 分类 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">分类</Text>
                <Input
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white"
                  placeholder="请输入分类"
                  value={formCategory}
                  onInput={(e) => setFormCategory(e.detail.value)}
                />
              </View>

              {/* 内容 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">内容</Text>
                <Textarea
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white min-h-[200px]"
                  placeholder="请输入语料库内容"
                  value={formContent}
                  onInput={(e) => setFormContent(e.detail.value)}
                />
              </View>

              {/* 标签 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">标签</Text>
                <View className="bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 mb-2">
                  <Text>🏷</Text>
                  <Input
                    className="flex-1 bg-transparent text-white"
                    placeholder="输入标签后按回车"
                    value={tagInput}
                    onInput={(e) => setTagInput(e.detail.value)}
                    onConfirm={handleAddTag}
                  />
                  <View onClick={handleAddTag}>
                    <Text>+</Text>
                  </View>
                </View>
                {formTags.length > 0 && (
                  <View className="flex flex-wrap gap-2">
                    {formTags.map((tag, index) => (
                      <View
                        key={index}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-9000/20"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <Text className="text-blue-400 text-sm">{tag}</Text>
                        <Text>✕</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* 按钮 */}
              <View className="flex gap-3 pt-2">
                <View
                  className="flex-1 bg-slate-800 rounded-xl py-3 text-center"
                  onClick={() => setShowCreateDialog(false)}
                >
                  <Text className="text-white">取消</Text>
                </View>
                <View
                  className="flex-1 bg-blue-500 rounded-xl py-3 text-center"
                  onClick={handleCreate}
                >
                  <Text className="text-white">创建</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 编辑语料库对话框 */}
      {showEditDialog && selectedLexicon && (
        <View className="fixed inset-0 bg-black/50 flex items-end z-50">
          <View className="bg-slate-800 w-full rounded-t-3xl max-h-[80vh] overflow-y-auto">
            <View className="p-4 border-b border-slate-700">
              <View className="flex items-center justify-between">
                <Text className="text-white font-semibold text-lg">编辑语料库</Text>
                <View onClick={() => setShowEditDialog(false)}>
                  <Text>✕</Text>
                </View>
              </View>
            </View>

            <View className="p-4 space-y-4">
              {/* 类型选择 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">类型</Text>
                <View className="flex gap-2">
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <View
                      key={key}
                      className={`flex-1 px-3 py-2 rounded-lg text-center ${formType === key ? config.color : 'bg-slate-800'}`}
                      onClick={() => setFormType(key as any)}
                    >
                      <View className="flex items-center justify-center gap-1">
                        {config.icon}
                        <Text className={formType === key ? 'text-white' : 'text-slate-300'} text-sm>{config.label}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* 标题 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">标题</Text>
                <Input
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white"
                  placeholder="请输入标题"
                  value={formTitle}
                  onInput={(e) => setFormTitle(e.detail.value)}
                />
              </View>

              {/* 分类 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">分类</Text>
                <Input
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white"
                  placeholder="请输入分类"
                  value={formCategory}
                  onInput={(e) => setFormCategory(e.detail.value)}
                />
              </View>

              {/* 内容 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">内容</Text>
                <Textarea
                  className="w-full bg-slate-800 rounded-xl px-4 py-3 text-white min-h-[200px]"
                  placeholder="请输入语料库内容"
                  value={formContent}
                  onInput={(e) => setFormContent(e.detail.value)}
                />
              </View>

              {/* 标签 */}
              <View>
                <Text className="text-slate-300 text-sm block mb-2">标签</Text>
                <View className="bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 mb-2">
                  <Text>🏷</Text>
                  <Input
                    className="flex-1 bg-transparent text-white"
                    placeholder="输入标签后按回车"
                    value={tagInput}
                    onInput={(e) => setTagInput(e.detail.value)}
                    onConfirm={handleAddTag}
                  />
                  <View onClick={handleAddTag}>
                    <Text>+</Text>
                  </View>
                </View>
                {formTags.length > 0 && (
                  <View className="flex flex-wrap gap-2">
                    {formTags.map((tag, index) => (
                      <View
                        key={index}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-9000/20"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <Text className="text-blue-400 text-sm">{tag}</Text>
                        <Text>✕</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* 按钮 */}
              <View className="flex gap-3 pt-2">
                <View
                  className="flex-1 bg-slate-800 rounded-xl py-3 text-center"
                  onClick={() => setShowEditDialog(false)}
                >
                  <Text className="text-white">取消</Text>
                </View>
                <View
                  className="flex-1 bg-blue-500 rounded-xl py-3 text-center"
                  onClick={handleUpdate}
                >
                  <Text className="text-white">保存</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 详情对话框 */}
      {showDetailDialog && selectedLexicon && (
        <View className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <View className="bg-slate-800 w-full rounded-2xl max-h-[80vh] overflow-y-auto">
            <View className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <View className="flex items-center justify-between">
                <Text className="text-white font-semibold text-lg truncate">{selectedLexicon.title}</Text>
                <View onClick={() => setShowDetailDialog(false)}>
                  <Text>✕</Text>
                </View>
              </View>
            </View>

            <View className="p-4 space-y-4">
              <View className="flex items-center gap-2 mb-4">
                {typeConfig[selectedLexicon.type].icon}
                <Text className="text-slate-300 text-sm">{typeConfig[selectedLexicon.type].label}</Text>
                <Text className="text-slate-400">·</Text>
                <Text className="text-slate-400 text-sm">{selectedLexicon.category}</Text>
              </View>

              <View>
                <Text className="text-white font-semibold text-base block mb-2">内容</Text>
                <Text className="text-slate-300 text-sm block leading-relaxed whitespace-pre-wrap">
                  {selectedLexicon.content}
                </Text>
              </View>

              {selectedLexicon.tags && selectedLexicon.tags.length > 0 && (
                <View>
                  <Text className="text-white font-semibold text-base block mb-2">标签</Text>
                  <View className="flex flex-wrap gap-2">
                    {selectedLexicon.tags.map((tag, index) => (
                      <View
                        key={index}
                        className="px-3 py-1.5 rounded-lg bg-slate-9000/20"
                      >
                        <Text className="text-blue-400 text-sm">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View className="text-slate-400 text-xs pt-4 border-t border-slate-700">
                <Text className="block">
                  创建时间: {new Date(selectedLexicon.createdAt).toLocaleString('zh-CN')}
                </Text>
                <Text className="block mt-1">
                  更新时间: {new Date(selectedLexicon.updatedAt).toLocaleString('zh-CN')}
                </Text>
                <Text className="block mt-1">
                  用户ID: {selectedLexicon.userId}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
