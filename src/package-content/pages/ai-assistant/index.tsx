import { useState } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Send,
  Sparkles,
  Lightbulb,
  FileText,
  PenTool,
  Target,
  RefreshCw,
  Copy,
  Trash2,
  BookOpen,
  ChevronDown,
  Check,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  knowledgeUsed?: string[];
}

interface KnowledgeSource {
  key: string;
  name: string;
  color: string;
}

const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  { key: 'lexicon', name: '个人语料', color: '#38bdf8' },
  { key: 'knowledge_share', name: '公司资料', color: '#a855f7' },
  { key: 'product_manual', name: '产品手册', color: '#10b981' },
  { key: 'design_knowledge', name: '设计知识', color: '#f59e0b' },
];

const quickActions = [
  { id: 'script', icon: FileText, label: '写脚本', color: '#38bdf8', prompt: '帮我写一个短视频脚本' },
  { id: 'copywriting', icon: PenTool, label: '写文案', color: '#8b5cf6', prompt: '帮我写一段产品文案' },
  { id: 'topic', icon: Target, label: '找选题', color: '#06b6d4', prompt: '帮我找一些热门选题' },
  { id: 'idea', icon: Lightbulb, label: '灵感', color: '#4ade80', prompt: '给我一些写作灵感' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是星小帮，你的写作助手 ✨\n\n我可以帮你：\n• 撰写短视频脚本\n• 撰写产品文案\n• 寻找热门选题\n• 提供写作灵感\n\n有什么我可以帮你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKnowledgePicker, setShowKnowledgePicker] = useState(false);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([]);
  const [knowledgeContext, setKnowledgeContext] = useState<string>('');

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 构建请求数据
      const requestData: any = {
        message: userMessage.content,
        context: messages.slice(-5).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      // 如果选择了知识库，添加上下文
      if (knowledgeContext) {
        requestData.knowledgeContext = knowledgeContext;
        requestData.knowledgeSources = selectedKnowledgeSources;
      }

      // 调用 AI 接口
      const response = await Network.request({
        url: '/api/ai-chat/chat',
        method: 'POST',
        data: requestData,
      });

      if (response.data?.code === 200 && response.data?.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.data.content || response.data.data.reply || '抱歉，我暂时无法回答这个问题。',
          timestamp: new Date(),
          knowledgeUsed: selectedKnowledgeSources.length > 0 ? selectedKnowledgeSources : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // 模拟回复
        const mockReply = generateMockReply(userMessage.content);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: mockReply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI 回复失败:', error);
      // 离线模拟回复
      const mockReply = generateMockReply(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockReply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockReply = (input: string): string => {
    if (input.includes('脚本')) {
      return `好的，我来帮你写一个短视频脚本 📝

【开场】(0-3秒)
"姐妹们，今天分享一个超实用的小技巧！"

【核心内容】(3-50秒)
1. 先介绍背景...
2. 展示具体步骤...
3. 强调关键要点...

【结尾】(50-60秒)
"觉得有用的话记得点赞收藏哦~"

需要我调整风格或内容吗？`;
    }
    if (input.includes('文案')) {
      return `这是一段为你定制的产品文案：

✨ 精选好物，品质之选
每一个细节都经过精心打磨
只为给你最好的体验

🌟 为什么选择它？
• 品质保证，放心使用
• 设计贴心，使用便捷
• 性价比高，值得入手

喜欢这个风格吗？我可以再调整~`;
    }
    if (input.includes('选题') || input.includes('话题')) {
      return `以下是近期热门选题方向 🔥

1️⃣ 美食教程类
   - "3分钟学会一道菜"
   - "厨房小白必看技巧"

2️⃣ 生活妙招类
   - "居家收纳小技巧"
   - "省钱省力小妙招"

3️⃣ 好物推荐类
   - "亲测好用的厨房神器"
   - "提升幸福感的小物"

需要我详细展开哪个方向吗？`;
    }
    if (input.includes('灵感')) {
      return `这里有一些写作灵感 💡

🎬 视频创意
- 拍摄一道传统美食的制作过程
- 分享一个厨房小技巧
- 展示新品食材的创新做法

📝 内容方向
- 季节限定：春季养生食谱
- 节日特辑：周末家庭聚餐
- 挑战类：30天不重样早餐

想深入哪个方向？`;
    }
    return `收到你的消息！我是星小帮，很高兴为你服务 🌟

请告诉我你需要什么帮助：
• 写脚本 - 撰写短视频脚本
• 写文案 - 撰写产品文案
• 找选题 - 发现热门话题
• 灵感 - 获取写作灵感

或者直接描述你的需求~`;
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setInputText(action.prompt);
  };

  const handleCopy = (content: string) => {
    Taro.setClipboardData({
      data: content,
      success: () => {
        Taro.showToast({ title: '已复制', icon: 'success' });
      },
    });
  };

  const handleClear = () => {
    Taro.showModal({
      title: '清空对话',
      content: '确定要清空所有对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          setMessages([
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: '对话已清空，有什么我可以帮你的吗？ ✨',
              timestamp: new Date(),
            },
          ]);
          setKnowledgeContext('');
          setSelectedKnowledgeSources([]);
        }
      },
    });
  };

  const toggleKnowledgeSource = (key: string) => {
    setSelectedKnowledgeSources(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const loadKnowledgeContext = async () => {
    if (selectedKnowledgeSources.length === 0) {
      setKnowledgeContext('');
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/knowledge/search',
        method: 'GET',
        data: {
          sources: selectedKnowledgeSources.join(','),
          limit: 5,
        },
      });

      if (res.data?.code === 200 && res.data?.data) {
        const context = res.data.data
          .map((item: any) => `【${item.title}】\n${item.content || ''}`)
          .join('\n\n');
        setKnowledgeContext(context);
      }
    } catch (error) {
      console.error('加载知识库失败:', error);
    }
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', flexDirection: 'column' }}>
      {/* 页面头部 */}
      <View style={{ 
        padding: '48px 16px 16px', 
        backgroundColor: '#111827', 
        borderBottom: '1px solid #1e3a5f',
        position: 'relative',
      }}
      >
        <View style={{ position: 'absolute', left: '16px', top: '48px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.switchTab({ url: '/pages/tab-content/index' })}
          >
            <ChevronLeft size={24} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#38bdf8' }}>返回</Text>
          </View>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #38bdf8, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
          }}
          >
            <Sparkles size={20} color="#ffffff" />
          </View>
          <Text style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>星小帮</Text>
        </View>
        <Text style={{ 
          fontSize: '12px', 
          color: '#71717a', 
          display: 'block', 
          textAlign: 'center', 
          marginTop: '4px' 
        }}
        >
          写作助手
        </Text>
      </View>

      {/* 快捷操作 */}
      <View style={{ 
        padding: '12px 16px', 
        backgroundColor: '#111827',
        borderBottom: '1px solid #1e3a5f',
      }}
      >
        <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
          <View style={{ display: 'flex', gap: '12px' }}>
            {quickActions.map((action) => (
              <View
                key={action.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '20px',
                  border: '1px solid #1e3a5f',
                }}
                onClick={() => handleQuickAction(action)}
              >
                <action.icon size={16} color={action.color} />
                <Text style={{ fontSize: '13px', color: '#ffffff' }}>{action.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 消息列表 */}
      <ScrollView
        scrollY
        style={{ flex: 1, padding: '16px' }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            {/* 头像 */}
            {message.role === 'assistant' ? (
              <View style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #38bdf8, #f97316)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              >
                <Sparkles size={18} color="#ffffff" />
              </View>
            ) : (
              <View style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1e3a5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              >
                <Text style={{ fontSize: '14px', color: '#71717a' }}>我</Text>
              </View>
            )}

            {/* 消息内容 */}
            <View style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: message.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              backgroundColor: message.role === 'user' ? '#38bdf8' : '#111827',
              border: message.role === 'assistant' ? '1px solid #1e3a5f' : 'none',
            }}
            >
              <Text style={{ 
                fontSize: '14px', 
                color: message.role === 'user' ? '#000000' : '#ffffff',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
              }}
              >
                {message.content}
              </Text>
              <Text style={{
                fontSize: '11px',
                color: message.role === 'user' ? 'rgba(0,0,0,0.5)' : '#64748b',
                display: 'block',
                marginTop: '6px',
              }}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>

            {/* 复制按钮 - 仅助手消息显示 */}
            {message.role === 'assistant' && (
              <View
                style={{ padding: '6px', opacity: 0.6 }}
                onClick={() => handleCopy(message.content)}
              >
                <Copy size={14} color="#71717a" />
              </View>
            )}
          </View>
        ))}

        {/* 加载中 */}
        {isLoading && (
          <View style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}
          >
            <View style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #38bdf8, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            >
              <Sparkles size={18} color="#ffffff" />
            </View>
            <View style={{
              padding: '12px 16px',
              backgroundColor: '#111827',
              borderRadius: '4px 16px 16px 16px',
              border: '1px solid #1e3a5f',
            }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} color="#38bdf8" className="animate-spin" />
                <Text style={{ fontSize: '14px', color: '#71717a' }}>思考中...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部输入区 */}
      <View style={{ 
        padding: '12px 16px', 
        backgroundColor: '#111827',
        borderTop: '1px solid #1e3a5f',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}
      >
        {/* 工具栏 */}
        <View style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
        >
          <View 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: selectedKnowledgeSources.length > 0 ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              borderRadius: '16px',
              border: selectedKnowledgeSources.length > 0 ? '1px solid #38bdf8' : '1px solid transparent',
            }}
            onClick={() => setShowKnowledgePicker(!showKnowledgePicker)}
          >
            <BookOpen size={16} color={selectedKnowledgeSources.length > 0 ? '#38bdf8' : '#71717a'} />
            <Text style={{ fontSize: '13px', color: selectedKnowledgeSources.length > 0 ? '#38bdf8' : '#71717a' }}>
              知识库 {selectedKnowledgeSources.length > 0 ? `(${selectedKnowledgeSources.length})` : ''}
            </Text>
            <ChevronDown size={14} color={selectedKnowledgeSources.length > 0 ? '#38bdf8' : '#71717a'} />
          </View>
          <View onClick={handleClear}>
            <Trash2 size={18} color="#71717a" />
          </View>
        </View>

        {/* 知识库选择器 */}
        {showKnowledgePicker && (
          <View style={{
            backgroundColor: '#0f172a',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '12px',
            border: '1px solid #1e3a5f',
          }}
          >
            <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px', display: 'block' }}>
              选择知识库来源，让回答更精准
            </Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {KNOWLEDGE_SOURCES.map((source) => (
                <View
                  key={source.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    backgroundColor: selectedKnowledgeSources.includes(source.key) ? source.color + '20' : '#1e293b',
                    border: selectedKnowledgeSources.includes(source.key) ? `1px solid ${source.color}` : '1px solid transparent',
                  }}
                  onClick={() => toggleKnowledgeSource(source.key)}
                >
                  {selectedKnowledgeSources.includes(source.key) && <Check size={12} color={source.color} />}
                  <Text style={{ 
                    fontSize: '13px', 
                    color: selectedKnowledgeSources.includes(source.key) ? source.color : '#94a3b8' 
                  }}
                  >
                    {source.name}
                  </Text>
                </View>
              ))}
            </View>
            {selectedKnowledgeSources.length > 0 && (
              <View
                style={{
                  marginTop: '12px',
                  padding: '10px 16px',
                  backgroundColor: '#38bdf8',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  loadKnowledgeContext();
                  setShowKnowledgePicker(false);
                }}
              >
                <Text style={{ fontSize: '13px', color: '#000', fontWeight: '600' }}>确认选择</Text>
              </View>
            )}
          </View>
        )}

        {/* 输入框 */}
        <View style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <View style={{
            flex: 1,
            backgroundColor: '#111827',
            borderRadius: '20px',
            padding: '10px 16px',
            border: '1px solid #1e3a5f',
          }}
          >
            <Textarea
              style={{ 
                width: '100%', 
                minHeight: '24px',
                maxHeight: '100px',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: 'transparent',
              }}
              placeholder="输入你的问题..."
              placeholderStyle="color: #64748b"
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              onConfirm={handleSend}
              adjustPosition
            />
          </View>
          <View
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: inputText.trim() ? '#38bdf8' : '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleSend}
          >
            <Send size={20} color={inputText.trim() ? '#000000' : '#64748b'} />
          </View>
        </View>
      </View>
    </View>
  );
}
