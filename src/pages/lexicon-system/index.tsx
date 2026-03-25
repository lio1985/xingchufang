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
  Building2,
  User,
  Package,
} from 'lucide-react-taro';

interface Lexicon {
  id: string;
  title: string;
  content: string;
  type: 'enterprise' | 'personal' | 'product';
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
  const [expandedCategory, setExpandedCategory] = useState<'all' | 'none' | 'enterprise' | 'personal' | 'product'>('none');

  // 加载语料库列表
  const loadLexicons = async () => {
    try {
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'GET'
      });

      if (response.data?.code === 200 && response.data?.data) {
        const lexiconData = Array.isArray(response.data.data.items) ? response.data.data.items : [];
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

  // 切换类别折叠/展开
  const toggleCategory = (category: 'enterprise' | 'personal' | 'product') => {
    if (expandedCategory === category) {
      setExpandedCategory('none');
    } else {
      setExpandedCategory(category);
    }
  };

  // 全部折叠/展开
  const toggleAll = () => {
    if (expandedCategory === 'all') {
      setExpandedCategory('none');
    } else {
      setExpandedCategory('all');
    }
  };

  // 处理选择变化
  const handleSelectLexicon = (id: string) => {
    setSelectedLexicons(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
          lexiconIds: selectedLexicons
        }
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
      }
    });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const handleNavigateToManage = () => {
    Taro.navigateTo({ url: '/pages/lexicon-manage/index' });
  };

  // 渲染语料库分类
  const renderCategory = (
    type: 'enterprise' | 'personal' | 'product',
    title: string,
    icon: React.ReactNode,
    color: string
  ) => {
    const filteredLexicons = lexicons.filter(l => l.type === type);
    const isExpanded = expandedCategory === 'all' || expandedCategory === type;

    if (filteredLexicons.length === 0) return null;

    return (
      <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
        <View
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: `${color}10`, borderBottom: isExpanded ? '1px solid #27272a' : 'none' }}
          onClick={() => toggleCategory(type)}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon}
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{title}</Text>
            <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: `${color}20` }}>
              <Text style={{ fontSize: '12px', color }}>{filteredLexicons.length}</Text>
            </View>
          </View>
          {isExpanded ? <ChevronDown size={16} color="#71717a" /> : <ChevronRight size={16} color="#71717a" />}
        </View>

        {isExpanded && (
          <View style={{ padding: '12px' }}>
            {filteredLexicons.map((lexicon) => (
              <View
                key={lexicon.id}
                style={{
                  backgroundColor: selectedLexicons.includes(lexicon.id) ? '#27272a' : '#1a1a1d',
                  border: selectedLexicons.includes(lexicon.id) ? `1px solid ${color}40` : '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px'
                }}
                onClick={() => handleSelectLexicon(lexicon.id)}
              >
                <View style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <View style={{ width: '18px', height: '18px', borderRadius: '4px', border: selectedLexicons.includes(lexicon.id) ? `2px solid ${color}` : '2px solid #52525b', backgroundColor: selectedLexicons.includes(lexicon.id) ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    {selectedLexicons.includes(lexicon.id) && <Text style={{ color: '#000', fontSize: '10px' }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', display: 'block', marginBottom: '4px' }}>{lexicon.title}</Text>
                    {lexicon.category && (
                      <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginBottom: '4px' }}>{lexicon.category}</Text>
                    )}
                    <Text style={{ fontSize: '12px', color: '#a1a1aa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lexicon.content}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#141416' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <MessageSquareText size={24} color="#f59e0b" />
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginLeft: '8px' }}>个人语料</Text>
          </View>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}
            onClick={handleNavigateToManage}
          >
            <Settings size={14} color="#f59e0b" />
            <Text style={{ fontSize: '13px', color: '#f59e0b' }}>管理</Text>
          </View>
        </View>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>语料优化系统</Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 140px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 语料库选择 */}
          <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>选择语料库</Text>
                <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <Text style={{ fontSize: '12px', color: '#3b82f6' }}>已选 {selectedLexicons.length} 个</Text>
                </View>
              </View>
              <View style={{ display: 'flex', alignItems: 'center' }} onClick={toggleAll}>
                <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>{expandedCategory === 'all' ? '全部折叠' : '全部展开'}</Text>
              </View>
            </View>

            {lexicons.length === 0 ? (
              <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
                <View style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquareText size={24} color="#52525b" />
                </View>
                <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>暂无语料库</Text>
                <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginTop: '4px' }}>点击右上角管理按钮添加语料</Text>
              </View>
            ) : (
              <View>
                {renderCategory('enterprise', '企业语料库', <Building2 size={16} color="#22c55e" />, '#22c55e')}
                {renderCategory('personal', '个人IP语料库', <User size={16} color="#3b82f6" />, '#3b82f6')}
                {renderCategory('product', '产品知识库', <Package size={16} color="#a855f7" />, '#a855f7')}
              </View>
            )}
          </View>

          {/* 输入区域 */}
          <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>输入文本</Text>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>{inputText.length}/2000</Text>
            </View>
            <View style={{ backgroundColor: '#27272a', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
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
                  textAlign: 'center'
                }}
                onClick={isProcessing || !inputText.trim() ? undefined : handleOptimize}
              >
                <Text style={{ fontSize: '14px', fontWeight: '600', color: isProcessing || !inputText.trim() ? '#71717a' : '#000000' }}>
                  {isProcessing ? '优化中...' : '开始优化'}
                </Text>
              </View>
              <View
                style={{ width: '48px', backgroundColor: '#27272a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={handleClear}
              >
                <RefreshCw size={18} color="#71717a" />
              </View>
            </View>
          </View>

          {/* 输出区域 */}
          {outputText && (
            <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#22c55e" />
                  <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>优化结果</Text>
                </View>
                <View
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#27272a', borderRadius: '8px' }}
                  onClick={handleCopy}
                >
                  <Copy size={14} color="#a1a1aa" />
                  <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>复制</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#27272a', borderRadius: '8px', padding: '12px' }}>
                <Text style={{ fontSize: '14px', color: '#a1a1aa', display: 'block', lineHeight: '24px' }}>{outputText}</Text>
              </View>
            </View>
          )}

          {/* 使用说明 */}
          <View style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Info size={16} color="#22c55e" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>使用说明</Text>
            </View>
            <Text style={{ fontSize: '13px', color: '#a1a1aa', display: 'block', marginBottom: '8px', lineHeight: '20px' }}>
              选择语料库后，系统会根据选中的语料对文本进行优化，使表达更自然、更专业。
            </Text>
            <View style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>• 企业语料库：确保专业术语统一</Text>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>• 个人IP语料库：保持主播风格</Text>
              <Text style={{ fontSize: '12px', color: '#71717a' }}>• 产品知识库：突出产品卖点</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
