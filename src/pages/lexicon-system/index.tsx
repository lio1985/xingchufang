import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  MessageSquareText,
  RefreshCw,
  Copy,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  User,
  ChevronLeft,
} from 'lucide-react-taro';

interface Lexicon {
  id: string;
  title: string;
  content: string;
  type: 'personal';
  category?: string;
  created_at: string;
}

export default function LexiconSystemPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 语料库相关状态
  const [lexicons, setLexicons] = useState<Lexicon[]>([]);
  const [selectedLexicons, setSelectedLexicons] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // 加载语料库列表
  const loadLexicons = async () => {
    try {
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'GET',
        data: { type: 'personal' },
      });

      if (response.data?.code === 200 && response.data?.data) {
        const lexiconData = Array.isArray(response.data.data.items)
          ? response.data.data.items
          : [];
        setLexicons(lexiconData);
      } else {
        setLexicons([]);
      }
    } catch (error) {
      console.error('[LexiconSystem] 加载失败:', error);
      setLexicons([]);
    }
  };

  useEffect(() => {
    loadLexicons();
  }, []);

  // 处理选择变化
  const handleSelectLexicon = (id: string) => {
    setSelectedLexicons((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedLexicons.length === lexicons.length) {
      setSelectedLexicons([]);
    } else {
      setSelectedLexicons(lexicons.map((l) => l.id));
    }
  };

  const handleOptimize = async () => {
    if (!inputText.trim()) {
      Taro.showToast({ title: '请输入要优化的文本', icon: 'none' });
      return;
    }

    if (selectedLexicons.length === 0) {
      Taro.showToast({ title: '请至少选择一个语料库', icon: 'none' });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await Network.request({
        url: '/api/lexicon/optimize',
        method: 'POST',
        data: {
          inputText,
          lexiconIds: selectedLexicons,
        },
      });

      if (response.data?.code === 200 && response.data?.data) {
        setOutputText(response.data.data.optimizedText);
        Taro.showToast({ title: '优化成功', icon: 'success' });
      } else {
        Taro.showToast({ title: response.data?.msg || '优化失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[LexiconSystem] 优化失败:', error);
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) {
      Taro.showToast({ title: '没有可复制的内容', icon: 'none' });
      return;
    }

    Taro.setClipboardData({
      data: outputText,
      success: () => {
        Taro.showToast({ title: '复制成功', icon: 'success' });
      },
    });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const handleNavigateToManage = () => {
    Taro.navigateTo({ url: '/pages/lexicon-manage/index' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#141416', position: 'relative' }}>
        {/* 返回按钮 */}
        <View style={{ position: 'absolute', left: '16px', top: '48px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <ChevronLeft size={24} color="#f59e0b" />
            <Text style={{ fontSize: '14px', color: '#f59e0b' }}>返回</Text>
          </View>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquareText size={24} color="#3b82f6" />
            </View>
            <View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>个人语料</Text>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>语料优化系统</Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
            }}
            onClick={handleNavigateToManage}
          >
            <Settings size={14} color="#f59e0b" />
            <Text style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '500' }}>管理</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 语料库选择 */}
          <View
            style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              marginBottom: '16px',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderBottom: isExpanded ? '1px solid #27272a' : 'none',
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={18} color="#3b82f6" />
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>个人IP语料库</Text>
                <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <Text style={{ fontSize: '12px', color: '#3b82f6' }}>{lexicons.length} 条</Text>
                </View>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <Text style={{ fontSize: '12px', color: '#22c55e' }}>已选 {selectedLexicons.length}</Text>
                </View>
                {isExpanded ? <ChevronDown size={16} color="#71717a" /> : <ChevronRight size={16} color="#71717a" />}
              </View>
            </View>

            {isExpanded && (
              <View style={{ padding: '12px' }}>
                {lexicons.length === 0 ? (
                  <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
                    <View
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '24px',
                        backgroundColor: '#27272a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <MessageSquareText size={24} color="#52525b" />
                    </View>
                    <Text style={{ fontSize: '14px', color: '#71717a', display: 'block' }}>暂无语料库</Text>
                    <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginTop: '4px' }}>
                      点击右上角管理按钮添加语料
                    </Text>
                  </View>
                ) : (
                  <View>
                    {/* 全选按钮 */}
                    <View
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        marginBottom: '8px',
                        backgroundColor: '#0a0a0b',
                        borderRadius: '8px',
                      }}
                      onClick={handleSelectAll}
                    >
                      <Text style={{ fontSize: '13px', color: '#a1a1aa' }}>
                        {selectedLexicons.length === lexicons.length ? '取消全选' : '全选'}
                      </Text>
                      <Text style={{ fontSize: '12px', color: '#52525b' }}>
                        {selectedLexicons.length}/{lexicons.length}
                      </Text>
                    </View>

                    {lexicons.map((lexicon) => (
                      <View
                        key={lexicon.id}
                        style={{
                          backgroundColor: selectedLexicons.includes(lexicon.id) ? '#27272a' : '#1a1a1d',
                          border: selectedLexicons.includes(lexicon.id)
                            ? '1px solid rgba(59, 130, 246, 0.4)'
                            : '1px solid #27272a',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px',
                        }}
                        onClick={() => handleSelectLexicon(lexicon.id)}
                      >
                        <View style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <View
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: selectedLexicons.includes(lexicon.id)
                                ? '2px solid #3b82f6'
                                : '2px solid #52525b',
                              backgroundColor: selectedLexicons.includes(lexicon.id) ? '#3b82f6' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            {selectedLexicons.includes(lexicon.id) && (
                              <Text style={{ color: '#000', fontSize: '10px' }}>✓</Text>
                            )}
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#ffffff',
                                display: 'block',
                                marginBottom: '4px',
                              }}
                            >
                              {lexicon.title}
                            </Text>
                            {lexicon.category && (
                              <Text
                                style={{
                                  fontSize: '11px',
                                  color: '#71717a',
                                  display: 'block',
                                  marginBottom: '4px',
                                }}
                              >
                                {lexicon.category}
                              </Text>
                            )}
                            <Text
                              style={{
                                fontSize: '12px',
                                color: '#a1a1aa',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {lexicon.content}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 输入区域 */}
          <View
            style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>输入文本</Text>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>{inputText.length}/2000</Text>
            </View>
            <View style={{ backgroundColor: '#0a0a0b', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
              <Textarea
                style={{ width: '100%', minHeight: '100px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                placeholder="请输入需要优化的文本..."
                placeholderStyle="color: #52525b"
                value={inputText}
                onInput={(e) => setInputText(e.detail.value)}
                maxlength={2000}
              />
            </View>
            <View style={{ display: 'flex', gap: '8px' }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: isProcessing || !inputText.trim() ? '#27272a' : '#f59e0b',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center',
                }}
                onClick={isProcessing || !inputText.trim() ? undefined : handleOptimize}
              >
                <Text
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isProcessing || !inputText.trim() ? '#71717a' : '#0a0a0b',
                  }}
                >
                  {isProcessing ? '优化中...' : '开始优化'}
                </Text>
              </View>
              <View
                style={{
                  width: '48px',
                  backgroundColor: '#27272a',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={handleClear}
              >
                <RefreshCw size={18} color="#71717a" />
              </View>
            </View>
          </View>

          {/* 输出区域 */}
          {outputText && (
            <View
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#22c55e" />
                  <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>优化结果</Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    backgroundColor: '#27272a',
                    borderRadius: '8px',
                  }}
                  onClick={handleCopy}
                >
                  <Copy size={14} color="#a1a1aa" />
                  <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>复制</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#0a0a0b', borderRadius: '8px', padding: '12px' }}>
                <Text style={{ fontSize: '14px', color: '#a1a1aa', display: 'block', lineHeight: '24px' }}>
                  {outputText}
                </Text>
              </View>
            </View>
          )}

          {/* 使用说明 */}
          <View
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Info size={16} color="#3b82f6" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>使用说明</Text>
            </View>
            <Text
              style={{
                fontSize: '13px',
                color: '#a1a1aa',
                display: 'block',
                marginBottom: '8px',
                lineHeight: '20px',
              }}
            >
              选择语料库后，系统会根据你的个人IP风格对文本进行优化，使表达更符合你的个人特色。
            </Text>
            <View style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>• 保持你的语言风格和表达习惯</Text>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>• 融入你的口头禅和专业术语</Text>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>• 确保内容符合你的人设定位</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
