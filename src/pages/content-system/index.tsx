import { View, Text, ScrollView, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { PenTool, Check, Copy, RefreshCw, ChevronRight, Play, ImagePlus, FileText, Bot, Pencil, Sparkles, X } from 'lucide-react-taro';
import { Network } from '@/network';

const ContentSystemPage = () => {
  const [activeTab, setActiveTab] = useState<'topic' | 'freestyle'>('topic');

  // 基于选题的创作
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, 'A' | 'B'>>({});
  const [editingContent, setEditingContent] = useState<{ id: string; content: string } | null>(null);
  const [rewritingId, setRewritingId] = useState<string | null>(null);
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [rewritePrompt, setRewritePrompt] = useState('');
  const [currentRewriteId, setCurrentRewriteId] = useState<string | null>(null);

  // 自由创作
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [freestyleResult, setFreestyleResult] = useState<any>(null);
  const [isFreestyleGenerating, setIsFreestyleGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === 'topic') {
      loadSelectedTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadSelectedTopics = () => {
    try {
      const topics = Taro.getStorageSync('selectedTopics') || [];
      setSelectedTopics(topics);
      if (topics.length > 0) {
        generateContent(topics);
      }
    } catch (error) {
      console.error('加载选题失败', error);
    }
  };

  const generateContent = async (topics: string[]) => {
    if (topics.length === 0) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await Network.request({
        url: '/api/content-generation/generate',
        method: 'POST',
        data: {
          topics,
          platform: '通用',
          style: '标准版',
          length: 'medium'
        }
      });

      if (res.data.code === 200) {
        setGeneratedContents(res.data.data || []);
        Taro.showToast({ title: '生成成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '生成失败', icon: 'error' });
      }
    } catch (error) {
      console.error('生成内容失败', error);
      Taro.showToast({ title: '生成失败', icon: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedTopics.length > 0) {
      generateContent(selectedTopics);
    }
  };

  const handleVariantSelect = (contentId: string, variant: 'A' | 'B') => {
    setSelectedVariant(prev => ({
      ...prev,
      [contentId]: variant
    }));
  };

  const handleEditStart = (contentId: string, content: string) => {
    setEditingContent({ id: contentId, content });
  };

  const handleEditSave = () => {
    if (editingContent) {
      setGeneratedContents(prev =>
        prev.map(item =>
          item.id === editingContent.id
            ? { ...item, content: editingContent.content }
            : item
        )
      );
      setEditingContent(null);
      Taro.showToast({ title: '保存成功', icon: 'success' });
    }
  };

  const handleRewrite = (contentId: string) => {
    setCurrentRewriteId(contentId);
    setRewritePrompt('');
    setShowRewriteModal(true);
  };

  const executeRewrite = async () => {
    if (!rewritePrompt.trim()) {
      Taro.showToast({ title: '请输入改写需求', icon: 'none' });
      return;
    }

    if (!currentRewriteId) return;

    const currentContent = generatedContents.find(item => item.id === currentRewriteId);
    if (!currentContent) return;

    setShowRewriteModal(false);
    setRewritingId(currentRewriteId);

    try {
      const res = await Network.request({
        url: '/api/content-rewrite/rewrite',
        method: 'POST',
        data: {
          content: currentContent.content,
          prompt: rewritePrompt
        }
      });

      if (res.data.code === 200) {
        setGeneratedContents(prev =>
          prev.map(item =>
            item.id === currentRewriteId
              ? { ...item, content: res.data.data.rewrittenContent }
              : item
          )
        );
        Taro.showToast({ title: '改写成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '改写失败', icon: 'error' });
      }
    } catch (error) {
      console.error('改写失败', error);
      Taro.showToast({ title: '改写失败', icon: 'error' });
    } finally {
      setRewritingId(null);
      setCurrentRewriteId(null);
      setRewritePrompt('');
    }
  };

  const handleCopy = (content: string) => {
    Taro.setClipboardData({ data: content });
    Taro.showToast({ title: '已复制', icon: 'success' });
  };

  // 自由创作
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        setUploadedImage(res.tempFilePaths[0]);
      }
    });
  };

  const handleGenerateFreestyle = async () => {
    if (!inputText.trim() && !uploadedImage) {
      Taro.showToast({ title: '请输入文字或上传图片', icon: 'none' });
      return;
    }

    setIsFreestyleGenerating(true);
    try {
      const data: any = {
        style: '标准',
        platform: '通用'
      };

      if (inputText.trim()) {
        data.text = inputText;
      }

      if (uploadedImage) {
        // 上传图片并获取 URL
        const uploadRes = await Network.uploadFile({
          url: '/api/upload',
          filePath: uploadedImage,
          name: 'file'
        });

        const uploadData = JSON.parse(uploadRes.data);
        if (uploadData.code === 200) {
          data.imageUrl = uploadData.data.url;
        }
      }

      const res = await Network.request({
        url: '/api/freestyle-generation/generate',
        method: 'POST',
        data
      });

      if (res.data.code === 200) {
        setFreestyleResult(res.data.data);
        Taro.showToast({ title: '生成成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '生成失败', icon: 'error' });
      }
    } catch (error) {
      console.error('生成失败', error);
      Taro.showToast({ title: '生成失败', icon: 'error' });
    } finally {
      setIsFreestyleGenerating(false);
    }
  };

  return (
    <View className="min-h-screen bg-slate-900 pb-4">
      {/* 顶部导航 */}
      <View className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
        <View className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <PenTool size={16} color="#60a5fa" />
        </View>
        <Text className="block text-base font-semibold text-white">内容创作</Text>
      </View>

      {/* Tab 切换 */}
      <View className="bg-slate-800/50 px-4 py-2 flex gap-4 border-b border-slate-700">
        <View
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'topic'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400'
          }`}
          onClick={() => setActiveTab('topic')}
        >
          <FileText size={16} />
          <Text className="block text-sm font-medium">基于选题</Text>
        </View>
        <View
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'freestyle'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400'
          }`}
          onClick={() => setActiveTab('freestyle')}
        >
          <Sparkles size={16} />
          <Text className="block text-sm font-medium">自由创作</Text>
        </View>
      </View>

      <ScrollView scrollY className="flex-1">
        <View className="p-4">
          {/* 基于选题的创作 */}
          {activeTab === 'topic' && (
            <View className="flex flex-col gap-4">
              {/* 已选选题 */}
              {selectedTopics.length > 0 && (
                <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <Text className="block text-sm font-semibold text-white mb-3">
                    已选择 {selectedTopics.length} 个选题
                  </Text>
                  <View className="flex flex-col gap-2">
                    {selectedTopics.map((topic, index) => (
                      <View
                        key={index}
                        className="flex items-start gap-2 py-2 px-3 bg-slate-700/50 rounded-lg"
                      >
                        <Check size={14} color="#22c55e" />
                        <Text className="block text-sm text-slate-300 flex-1">
                          {topic}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 生成中 */}
              {isGenerating && (
                <View className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30 p-6">
                  <View className="flex flex-col items-center gap-3">
                    <RefreshCw size={32} color="#60a5fa" className="animate-spin" />
                    <Text className="block text-white font-medium">
                      正在生成 AB 方案...
                    </Text>
                    <Text className="block text-slate-400 text-sm">
                      请稍候，这可能需要几秒钟
                    </Text>
                  </View>
                </View>
              )}

              {/* 生成的内容 */}
              {!isGenerating && generatedContents.length > 0 && (
                <View className="flex flex-col gap-6">
                  {generatedContents
                    .filter((_, index) => index % 2 === 0)
                    .map((contentA, index) => {
                      const contentB = generatedContents[index * 2 + 1];
                      const variant = selectedVariant[contentA.id] || 'A';
                      const currentContent = variant === 'A' ? contentA : contentB;

                      return (
                        <View key={index} className="bg-slate-800 rounded-xl border-2 border-slate-700 p-4">
                          {/* 选题标题 */}
                          <View className="flex items-center gap-2 mb-4">
                            <View className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Play size={14} color="#60a5fa" />
                            </View>
                            <Text className="block text-base font-semibold text-white">
                              {currentContent.topic}
                            </Text>
                          </View>

                          {/* AB 方案选择 */}
                          <View className="flex gap-2 mb-4">
                            <View
                              className={`flex-1 py-2 px-4 rounded-lg text-center transition-all ${
                                variant === 'A'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                              onClick={() => handleVariantSelect(contentA.id, 'A')}
                            >
                              <Text className="block text-sm font-medium">方案 A</Text>
                            </View>
                            <View
                              className={`flex-1 py-2 px-4 rounded-lg text-center transition-all ${
                                variant === 'B'
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                              onClick={() => handleVariantSelect(contentA.id, 'B')}
                            >
                              <Text className="block text-sm font-medium">方案 B</Text>
                            </View>
                          </View>

                          {/* 内容展示/编辑 */}
                          {editingContent?.id === currentContent.id ? (
                            <View className="mb-4">
                              <View className="bg-slate-900/50 rounded-lg p-4 mb-3">
                                <Textarea
                                  className="w-full bg-transparent text-white text-sm min-h-[200px]"
                                  value={editingContent?.content || ''}
                                  onInput={(e) => setEditingContent({ id: editingContent?.id || currentContent.id, content: e.detail.value })}
                                />
                              </View>
                              <View className="flex gap-2">
                                <View
                                  className="flex-1 py-2 bg-blue-500 rounded-lg text-center active:opacity-80"
                                  onClick={handleEditSave}
                                >
                                  <Text className="block text-sm text-white">保存</Text>
                                </View>
                                <View
                                  className="flex-1 py-2 bg-slate-700 rounded-lg text-center active:opacity-80"
                                  onClick={() => setEditingContent(null)}
                                >
                                  <Text className="block text-sm text-slate-300">取消</Text>
                                </View>
                              </View>
                            </View>
                          ) : (
                            <View className="bg-slate-900/50 rounded-lg p-4 mb-4">
                              <Text className="block text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {currentContent.content}
                              </Text>
                            </View>
                          )}

                          {/* 操作按钮 */}
                          <View className="flex flex-wrap gap-2">
                            {!editingContent && (
                              <View
                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 rounded-lg active:scale-95 transition-all"
                                onClick={() => handleEditStart(currentContent.id, currentContent.content)}
                              >
                                <Pencil size={14} color="#94a3b8" />
                                <Text className="block text-xs text-slate-300">手动改写</Text>
                              </View>
                            )}
                            <View
                              className={`flex items-center gap-1.5 px-3 py-2 bg-slate-700 rounded-lg active:scale-95 transition-all ${
                                rewritingId === currentContent.id ? 'opacity-50' : ''
                              }`}
                              onClick={() => handleRewrite(currentContent.id)}
                            >
                              <Bot size={14} color="#94a3b8" />
                              <Text className="block text-xs text-slate-300">
                                {rewritingId === currentContent.id ? '改写中...' : '改写'}
                              </Text>
                            </View>
                            <View
                              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 rounded-lg active:scale-95 transition-all"
                              onClick={() => handleCopy(currentContent.content)}
                            >
                              <Copy size={14} color="#94a3b8" />
                              <Text className="block text-xs text-slate-300">复制</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

              {/* 空状态 */}
              {!isGenerating && generatedContents.length === 0 && (
                <View className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
                  <PenTool size={48} color="#475569" />
                  <Text className="block text-slate-500 text-base mt-4 mb-2">
                    暂无生成的内容
                  </Text>
                  <Text className="block text-slate-600 text-sm">
                    请在选题策划页面选择选题并确认
                  </Text>
                </View>
              )}

              {/* 重新生成按钮 */}
              {!isGenerating && generatedContents.length > 0 && (
                <View className="flex gap-3">
                  <View
                    className="flex-1 bg-slate-700 text-white text-center py-3 rounded-xl font-medium active:opacity-80 flex items-center justify-center gap-2"
                    onClick={handleRegenerate}
                  >
                    <RefreshCw size={18} />
                    <Text className="block">重新生成</Text>
                  </View>
                </View>
              )}

              {/* 返回按钮 */}
              <View>
                <View
                  className="bg-slate-800 text-slate-300 text-center py-3 rounded-xl font-medium active:opacity-80 flex items-center justify-center gap-2"
                  onClick={() => Taro.navigateBack()}
                >
                  <ChevronRight size={18} className="rotate-180" />
                  <Text className="block">返回选题策划</Text>
                </View>
              </View>
            </View>
          )}

          {/* 自由创作 */}
          {activeTab === 'freestyle' && (
            <View className="flex flex-col gap-4">
              {/* 输入区域 */}
              <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <Text className="block text-base font-semibold text-white mb-4">输入内容</Text>

                {/* 文字输入 */}
                <View className="mb-4">
                  <View className="bg-slate-700/50 rounded-lg p-3">
                    <Textarea
                      className="w-full bg-transparent text-white text-sm min-h-[100px]"
                      placeholder="输入您的语料文字，系统将为您进行二次创作..."
                      value={inputText}
                      onInput={(e) => setInputText(e.detail.value)}
                    />
                  </View>
                </View>

                {/* 图片上传 */}
                <View>
                  <Text className="block text-sm text-slate-400 mb-2">或上传图片</Text>
                  {uploadedImage ? (
                    <View className="relative">
                      <Image
                        src={uploadedImage}
                        mode="aspectFill"
                        className="w-full h-40 rounded-lg"
                      />
                      <View
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center"
                        onClick={() => setUploadedImage(null)}
                      >
                        <X size={16} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View
                      className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center active:border-blue-500 transition-all"
                      onClick={handleChooseImage}
                    >
                      <ImagePlus size={32} color="#64748b" />
                      <Text className="block text-sm text-slate-400 mt-2">点击上传图片</Text>
                    </View>
                  )}
                </View>

                {/* 生成按钮 */}
                <View
                  className={`mt-4 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2 transition-all ${
                    isFreestyleGenerating
                      ? 'bg-slate-700 text-slate-400'
                      : 'bg-blue-500 text-white active:opacity-80'
                  }`}
                  onClick={handleGenerateFreestyle}
                >
                  {isFreestyleGenerating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <Text className="block">生成中...</Text>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <Text className="block">内容创作</Text>
                    </>
                  )}
                </View>
              </View>

              {/* 生成结果 */}
              {freestyleResult && (
                <View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <Text className="block text-base font-semibold text-white mb-4">生成结果</Text>

                  {/* 内容展示 */}
                  <View className="bg-slate-900/50 rounded-lg p-4 mb-4">
                    <Text className="block text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {freestyleResult.content}
                    </Text>
                  </View>

                  {/* 操作按钮 */}
                  <View className="flex gap-2">
                    <View
                      className="flex-1 py-2 bg-blue-500 rounded-lg text-center active:opacity-80"
                      onClick={() => handleCopy(freestyleResult.content)}
                    >
                      <Text className="block text-sm text-white">复制</Text>
                    </View>
                    <View
                      className="flex-1 py-2 bg-slate-700 rounded-lg text-center active:opacity-80"
                      onClick={() => setFreestyleResult(null)}
                    >
                      <Text className="block text-sm text-slate-300">清除</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* AI改写对话框 */}
      {showRewriteModal && (
        <View className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end">
          <View className="bg-slate-800 rounded-t-3xl p-6 border-t border-slate-700" style={{ maxHeight: '80vh' }}>
            <View className="flex items-center justify-between mb-5">
              <View className="flex items-center gap-3">
                <View className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Bot size={20} color="#60a5fa" />
                </View>
                <View>
                  <Text className="block text-lg font-semibold text-white">内容改写</Text>
                  <Text className="block text-xs text-slate-400">描述您的改写需求</Text>
                </View>
              </View>
              <View
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700/60 active:opacity-70"
                onClick={() => setShowRewriteModal(false)}
              >
                <X size={20} color="#94a3b8" />
              </View>
            </View>

            {/* 快捷改写标签 */}
            <View className="mb-4">
              <Text className="block text-sm text-slate-400 mb-3">快捷选择</Text>
              <ScrollView scrollX className="flex gap-2">
                <View
                  className="flex-shrink-0 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full active:bg-blue-500/20"
                  onClick={() => setRewritePrompt('请改写得更专业、更正式，增加数据支持和权威引用')}
                >
                  <Text className="block text-xs text-blue-300">更专业</Text>
                </View>
                <View
                  className="flex-shrink-0 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full active:bg-blue-500/20"
                  onClick={() => setRewritePrompt('请改写得更轻松、更亲切，增加幽默感和趣味性')}
                >
                  <Text className="block text-xs text-emerald-300">更轻松</Text>
                </View>
                <View
                  className="flex-shrink-0 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full active:bg-blue-500/20"
                  onClick={() => setRewritePrompt('请精简内容，去除冗余信息，保留核心观点')}
                >
                  <Text className="block text-xs text-amber-300">更简洁</Text>
                </View>
                <View
                  className="flex-shrink-0 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full active:bg-blue-500/20"
                  onClick={() => setRewritePrompt('请增加情感表达，让内容更有感染力')}
                >
                  <Text className="block text-xs text-pink-300">更有感染力</Text>
                </View>
              </ScrollView>
            </View>

            {/* 输入框 */}
            <View className="mb-4">
              <Text className="block text-sm text-slate-400 mb-2">详细描述</Text>
              <View className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
                <Textarea
                  style={{ width: '100%', minHeight: '200px', backgroundColor: 'transparent', color: '#fff', fontSize: '15px', lineHeight: '1.6' }}
                  placeholder="例如：请帮我改写得更专业一点，增加数据支持，语气要更亲切..."
                  value={rewritePrompt}
                  onInput={(e) => setRewritePrompt(e.detail.value)}
                  maxlength={500}
                />
                <Text className="block text-xs text-slate-500 mt-2 text-right">
                  {rewritePrompt.length}/500
                </Text>
              </View>
            </View>

            {/* 操作按钮 */}
            <View className="flex gap-3">
              <View
                className="flex-1 py-4 bg-slate-700/60 rounded-2xl text-center active:opacity-70"
                onClick={() => setShowRewriteModal(false)}
              >
                <Text className="block text-base text-slate-300 font-medium">取消</Text>
              </View>
              <View
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-center active:opacity-80 shadow-lg shadow-blue-500/20"
                onClick={executeRewrite}
              >
                <Text className="block text-base text-white font-medium">开始改写</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ContentSystemPage;
