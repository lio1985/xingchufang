import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input, Image } from '@tarojs/components';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image';
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  created_at: string;
  is_mine: boolean;
}

export default function TeamChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/teams/my/chat-messages',
        method: 'GET',
      });
      if (res.data?.code === 200 && res.data?.data) {
        const currentUser = Taro.getStorageSync('user');
        // 标记哪些消息是当前用户的
        const formattedMessages = res.data.data.map((msg: any) => ({
          ...msg,
          is_mine: msg.sender_id === currentUser?.id,
        }));
        setMessages(formattedMessages);
      } else {
        // 后端未返回数据时设置为空数组
        setMessages([]);
      }
    } catch (error) {
      console.error('获取消息失败:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      const currentUser = Taro.getStorageSync('user');
      // 添加消息到列表（模拟）
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        type: 'text',
        sender_id: currentUser?.id || 'me',
        sender_name: currentUser?.nickname || '我',
        created_at: new Date().toISOString(),
        is_mine: true,
      };
      setMessages([...messages, newMessage]);

      // 实际发送消息需要对接后端API
      // await Network.request({
      //   url: '/api/team/chat/send',
      //   method: 'POST',
      //   data: { content, type: 'text' }
      // });
    } catch (error) {
      console.error('发送消息失败:', error);
      Taro.showToast({ title: '发送失败', icon: 'none' });
    } finally {
      setSending(false);
    }
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: () => {
        // 处理图片发送
        Taro.showToast({ title: '功能开发中', icon: 'none' });
      },
    });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          <View
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
            }}
            onClick={() => Taro.navigateBack()}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>团队聊天</Text>
            <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>5人在线</Text>
          </View>
        </View>
      </View>

      {/* 消息列表 */}
      <ScrollView
        scrollY
        style={{ flex: 1, padding: '16px 20px' }}
        scrollIntoView={messages.length > 0 ? `msg-${messages[messages.length - 1].id}` : ''}
      >
        {loading ? (
          <View style={{ textAlign: 'center', padding: '40px' }}>
            <Text style={{ color: '#64748b' }}>加载中...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={{ textAlign: 'center', padding: '40px' }}>
            <Text style={{ color: '#64748b' }}>暂无消息，发送第一条消息吧</Text>
          </View>
        ) : (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                id={`msg-${msg.id}`}
                style={{
                  display: 'flex',
                  flexDirection: msg.is_mine ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                {/* 头像 */}
                <View
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: msg.is_mine ? '#38bdf8' : '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {msg.sender_avatar ? (
                    <Image src={msg.sender_avatar} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  ) : (
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                      {msg.sender_name.charAt(0)}
                    </Text>
                  )}
                </View>

                {/* 消息内容 */}
                <View style={{ maxWidth: '70%' }}>
                  <View
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                      flexDirection: msg.is_mine ? 'row-reverse' : 'row',
                    }}
                  >
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>{msg.sender_name}</Text>
                    <Text style={{ fontSize: '11px', color: '#4b5563' }}>{formatTime(msg.created_at)}</Text>
                  </View>
                  <View
                    style={{
                      padding: '12px 16px',
                      borderRadius: msg.is_mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      backgroundColor: msg.is_mine ? '#38bdf8' : '#1e293b',
                    }}
                  >
                    <Text style={{ fontSize: '14px', color: msg.is_mine ? '#ffffff' : '#e2e8f0', display: 'block' }}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 输入区域 */}
      <View
        style={{
          padding: '12px 20px',
          backgroundColor: '#111827',
          borderTop: '1px solid #1e3a5f',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          {/* 图片按钮 */}
          <View
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onClick={handleChooseImage}
          >
            <ImageIcon size={18} color="#94a3b8" />
          </View>

          {/* 输入框 */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#0a0f1a',
              borderRadius: '20px',
              padding: '10px 16px',
              border: '1px solid #1e3a5f',
            }}
          >
            <Input
              style={{ fontSize: '14px', color: '#ffffff', width: '100%' }}
              placeholder="输入消息..."
              placeholderStyle="color: #64748b"
              value={inputValue}
              onInput={(e) => setInputValue(e.detail.value)}
              onConfirm={handleSend}
              confirmType="send"
            />
          </View>

          {/* 发送按钮 */}
          <View
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: inputValue.trim() ? '#38bdf8' : '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onClick={handleSend}
          >
            <Send size={18} color={inputValue.trim() ? '#ffffff' : '#64748b'} />
          </View>
        </View>
      </View>
    </View>
  );
}
