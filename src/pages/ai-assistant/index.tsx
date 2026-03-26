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
  Image,
  Video,
  Mic,
  RefreshCw,
  Copy,
  Trash2,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { id: 'script', icon: FileText, label: '写脚本', color: '#f59e0b', prompt: '帮我写一个短视频脚本' },
  { id: 'copywriting', icon: PenTool, label: '写文案', color: '#8b5cf6', prompt: '帮我写一段产品文案' },
  { id: 'topic', icon: Target, label: '找选题', color: '#06b6d4', prompt: '帮我找一些热门选题' },
  { id: 'idea', icon: Lightbulb, label: '灵感', color: '#22c55e', prompt: '给我一些创作灵感' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是星小帮，你的 AI 创作助手 ✨\n\n我可以帮你：\n• 撰写短视频脚本\n• 创作产品文案\n• 寻找热门选题\n• 提供创作灵感\n\n有什么我可以帮你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      // 调用 AI 接口
      const response = await Network.request({
        url: '/api/ai/chat',
        method: 'POST',
        data: {
          message: userMessage.content,
          context: messages.slice(-5).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (response.data?.code === 200 && response.data?.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.data.reply || '抱歉，我暂时无法回答这个问题。',
          timestamp: new Date(),
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
      return `这里有一些创作灵感 💡

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
• 写脚本 - 创作短视频脚本
• 写文案 - 撰写产品文案
• 找选题 - 发现热门话题
• 灵感 - 获取创作灵感

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
        }
      },
    });
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', display: 'flex', flexDirection: 'column' }}>
      {/* 页面头部 */}
      <View style={{ 
        padding: '48px 16px 16px', 
        backgroundColor: '#141416', 
        borderBottom: '1px solid #27272a',
        position: 'relative',
      }}
      >
        <View style={{ position: 'absolute', left: '16px', top: '48px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.switchTab({ url: '/pages/tab-content/index' })}
          >
            <ChevronLeft size={24} color="#f59e0b" />
            <Text style={{ fontSize: '14px', color: '#f59e0b' }}>返回</Text>
          </View>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
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
          AI 智能创作助手
        </Text>
      </View>

      {/* 快捷操作 */}
      <View style={{ 
        padding: '12px 16px', 
        backgroundColor: '#141416',
        borderBottom: '1px solid #27272a',
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
                  border: '1px solid #27272a',
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
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
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
                backgroundColor: '#27272a',
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
              backgroundColor: message.role === 'user' ? '#f59e0b' : '#18181b',
              border: message.role === 'assistant' ? '1px solid #27272a' : 'none',
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
                color: message.role === 'user' ? 'rgba(0,0,0,0.5)' : '#52525b',
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
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            >
              <Sparkles size={18} color="#ffffff" />
            </View>
            <View style={{
              padding: '12px 16px',
              backgroundColor: '#18181b',
              borderRadius: '4px 16px 16px 16px',
              border: '1px solid #27272a',
            }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} color="#f59e0b" className="animate-spin" />
                <Text style={{ fontSize: '14px', color: '#71717a' }}>思考中...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部输入区 */}
      <View style={{ 
        padding: '12px 16px', 
        backgroundColor: '#141416',
        borderTop: '1px solid #27272a',
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
          <View style={{ display: 'flex', gap: '16px' }}>
            <Image size={20} color="#71717a" />
            <Video size={20} color="#71717a" />
            <Mic size={20} color="#71717a" />
          </View>
          <View onClick={handleClear}>
            <Trash2 size={18} color="#71717a" />
          </View>
        </View>

        {/* 输入框 */}
        <View style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <View style={{
            flex: 1,
            backgroundColor: '#18181b',
            borderRadius: '20px',
            padding: '10px 16px',
            border: '1px solid #27272a',
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
              placeholderStyle="color: #52525b"
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
              backgroundColor: inputText.trim() ? '#f59e0b' : '#27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleSend}
          >
            <Send size={20} color={inputText.trim() ? '#000000' : '#52525b'} />
          </View>
        </View>
      </View>
    </View>
  );
}
