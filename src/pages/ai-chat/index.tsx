import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  Bot,
  User,
  Image,
  Video,
  FileText,
  Mic,
  Paperclip,
  Send,
  MessageSquare,
  BookOpen,
  Sparkles,
  Loader
} from 'lucide-react-taro';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  fileName: string;
  fileSize: number;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
}

interface Lexicon {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

const AiChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('doubao-seed-2-0-pro-260215');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversationList, setShowConversationList] = useState(false);
  const [lexicons, setLexicons] = useState<Lexicon[]>([]);
  const [showLexiconList, setShowLexiconList] = useState(false);
  const [modelExpanded, setModelExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getUserId = () => {
    const user = Taro.getStorageSync('user');
    if (user && user.id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(user.id)) {
        return user.id;
      }
    }
    
    let userId = Taro.getStorageSync('userId');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!userId || !uuidRegex.test(userId)) {
      console.log('[AI Chat] 生成新的 UUID');
      userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      Taro.setStorageSync('userId', userId);
    }
    
    console.log('[AI Chat] UserId:', userId);
    return userId;
  };

  const loadConversations = useCallback(async () => {
    try {
      const response = await Network.request({
        url: '/api/conversation/list',
        method: 'GET',
      });

      if (response.statusCode === 200 && response.data && response.data.data) {
        setConversations(response.data.data);
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log('对话列表接口暂未部署');
      } else {
        console.error('加载对话列表失败:', error);
      }
    }
  }, []);

  const loadLexicons = async () => {
    try {
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'GET',
      });

      if (response.statusCode === 200 && response.data?.data) {
        const lexiconData = Array.isArray(response.data.data.items) ? response.data.data.items : []
        setLexicons(lexiconData)
      } else {
        setLexicons([])
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log('语料库接口暂未部署');
      } else {
        console.error('加载语料列表失败:', error);
      }
      setLexicons([])
    }
  };

  const createConversation = async (title: string): Promise<string | null> => {
    try {
      const userId = getUserId();
      const response = await Network.request({
        url: '/api/conversation',
        method: 'POST',
        data: {
          userId,
          title,
        },
      });

      console.log('创建对话响应:', JSON.stringify(response.data, null, 2));
      if (response.statusCode === 200 && response.data && response.data.data) {
        console.log('创建对话成功，ID:', response.data.data.id);
        setCurrentConversationId(response.data.data.id);
        await loadConversations();
        return response.data.data.id;
      } else {
        console.log('创建对话条件不满足:', {
          statusCode: response.statusCode,
          hasData: !!response.data,
          hasNestedData: !!(response.data && response.data.data)
        });
      }
    } catch (error) {
      console.error('创建对话失败:', error);
    }
    return null;
  };

  const loadConversationDetail = async (conversationId: string) => {
    try {
      const response = await Network.request({
        url: `/api/conversation/detail/${conversationId}`,
        method: 'GET',
      });

      if (response.statusCode === 200 && response.data && response.data.messages) {
        const msgList: Message[] = response.data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
        }));
        setMessages(msgList);
      }
    } catch (error) {
      console.error('加载对话详情失败:', error);
    }
  };

  const saveMessage = async (role: string, content: string, convId?: string) => {
    const targetConversationId = convId || currentConversationId;
    if (!targetConversationId) return;

    try {
      await Network.request({
        url: '/api/conversation/message',
        method: 'POST',
        data: {
          conversationId: targetConversationId,
          role,
          content,
        },
      });
    } catch (error) {
      console.error('保存消息失败:', error);
    }
  };

  const handleRecordingComplete = useCallback(async (tempFilePath: string, duration: number) => {
    console.log('录音完成，准备上传:', tempFilePath, duration);

    try {
      const userId = getUserId();
      const uploadResult = await uploadFile(tempFilePath, userId);

      Taro.showLoading({ title: '语音识别中...' });

      const transcriptResponse = await Network.request({
        url: '/api/multimedia/transcribe',
        method: 'POST',
        data: {
          audioUrl: uploadResult.url,
        },
      });

      Taro.hideLoading();

      if (transcriptResponse.statusCode === 200 && transcriptResponse.data) {
        const recognizedText = transcriptResponse.data.data?.text || '';
        setInputText(prev => prev + (prev ? ' ' : '') + recognizedText);
        Taro.showToast({ title: '识别成功', icon: 'success' });
      } else {
        throw new Error('语音识别失败');
      }
    } catch (error: any) {
      console.error('处理录音失败:', error);
      Taro.showToast({ title: '语音识别失败', icon: 'none' });
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadLexicons();

    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      recorderManagerRef.current = Taro.getRecorderManager();

      recorderManagerRef.current.onStop((result) => {
        console.log('录音完成:', result);
        handleRecordingComplete(result.tempFilePath, result.duration);
      });

      recorderManagerRef.current.onError((error) => {
        console.error('录音失败:', error);
        Taro.showToast({ title: '录音失败', icon: 'none' });
        setIsRecording(false);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setScrollTop(prev => prev + 100000);
  }, [messages]);

  useEffect(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP && typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!loading && (inputText.trim() || attachments.length > 0)) {
            handleSend();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, loading, attachments.length]);

  const startRecording = () => {
    const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

    if (!isWeapp) {
      Taro.showToast({ title: '语音功能仅在小程序中可用', icon: 'none' });
      return;
    }

    if (!recorderManagerRef.current) {
      Taro.showToast({ title: '录音功能初始化失败', icon: 'none' });
      return;
    }

    setIsRecording(true);
    setRecordingDuration(0);

    recorderManagerRef.current.start({
      format: 'mp3',
      duration: 60000,
    });

    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    Taro.showToast({ title: '开始录音', icon: 'none', duration: 1000 });
  };

  const stopRecording = () => {
    if (!recorderManagerRef.current) return;

    recorderManagerRef.current.stop();

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
  };

  const uploadFile = async (filePath: string, userId: string): Promise<MessageAttachment> => {
    try {
      Taro.showLoading({ title: '上传中...' });

      const uploadResponse = await Network.uploadFile({
        url: '/api/multimedia/upload',
        filePath,
        name: 'file',
        formData: {
          userId,
        },
      });

      Taro.hideLoading();

      console.log('上传响应:', uploadResponse);

      if (uploadResponse.statusCode === 200 && uploadResponse.data) {
        const data = uploadResponse.data as any;

        return {
          id: data.id,
          type: data.type,
          url: data.url,
          fileName: data.originalFilename,
          fileSize: data.fileSize,
        };
      } else {
        throw new Error('上传失败');
      }
    } catch (error: any) {
      Taro.hideLoading();
      console.error('上传文件失败:', error);
      throw error;
    }
  };

  const handleSelectFile = () => {
    setShowActionSheet(true);
  };

  const handleSelectImage = () => {
    setShowActionSheet(false);

    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      Taro.showToast({ title: 'H5端请使用小程序体验完整功能', icon: 'none' });
      return;
    }

    Taro.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        console.log('选择图片:', res.tempFilePaths);

        const userId = getUserId();
        const newAttachments: MessageAttachment[] = [];

        for (const filePath of res.tempFilePaths) {
          try {
            const attachment = await uploadFile(filePath, userId);
            newAttachments.push(attachment);
          } catch (error) {
            console.error('上传图片失败:', error);
            Taro.showToast({ title: '上传图片失败', icon: 'none' });
          }
        }

        if (newAttachments.length > 0) {
          setAttachments(prev => [...prev, ...newAttachments]);
          Taro.showToast({ title: `成功添加 ${newAttachments.length} 个图片`, icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  };

  const handleSelectVideo = () => {
    setShowActionSheet(false);

    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      Taro.showToast({ title: 'H5端请使用小程序体验完整功能', icon: 'none' });
      return;
    }

    Taro.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: async (res) => {
        console.log('选择视频:', res.tempFilePath);

        const userId = getUserId();
        try {
          const attachment = await uploadFile(res.tempFilePath, userId);
          setAttachments(prev => [...prev, attachment]);
          Taro.showToast({ title: '视频添加成功', icon: 'success' });
        } catch (error) {
          console.error('上传视频失败:', error);
          Taro.showToast({ title: '上传视频失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('选择视频失败:', err);
        Taro.showToast({ title: '选择视频失败', icon: 'none' });
      }
    });
  };

  const handleSelectDocument = () => {
    setShowActionSheet(false);

    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      Taro.showToast({ title: 'H5端请使用小程序体验完整功能', icon: 'none' });
      return;
    }

    Taro.chooseMessageFile({
      count: 10,
      type: 'file',
      success: async (res) => {
        console.log('选择文件:', res.tempFiles);

        const userId = getUserId();
        const newAttachments: MessageAttachment[] = [];

        for (const file of res.tempFiles) {
          try {
            const attachment = await uploadFile(file.path, userId);
            newAttachments.push(attachment);
          } catch (error) {
            console.error('上传文件失败:', error);
            Taro.showToast({ title: `上传文件 ${file.name} 失败`, icon: 'none' });
          }
        }

        if (newAttachments.length > 0) {
          setAttachments(prev => [...prev, ...newAttachments]);
          Taro.showToast({ title: `成功添加 ${newAttachments.length} 个文件`, icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        Taro.showToast({ title: '选择文件失败', icon: 'none' });
      }
    });
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!inputText.trim() && attachments.length === 0) || loading) {
      return;
    }

    let conversationId = currentConversationId;
    if (!conversationId) {
      const title = inputText.trim().substring(0, 30) + (inputText.trim().length > 30 ? '...' : '') || '新对话';
      const newConversationId = await createConversation(title);
      if (!newConversationId) {
        Taro.showToast({ title: '创建对话失败', icon: 'none' });
        return;
      }
      conversationId = newConversationId;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setAttachments([]);
    setLoading(true);

    try {
      await saveMessage('user', userMessage.content, conversationId);

      let messageContent = userMessage.content;
      if (userMessage.attachments && userMessage.attachments.length > 0) {
        messageContent += '\n\n[附件信息]\n';
        userMessage.attachments.forEach((att, index) => {
          messageContent += `${index + 1}. ${att.fileName} (${att.type})\n`;
        });
      }

      console.log('=== 前端网络请求 ===');
      console.log('URL:', '/api/ai-chat/message');
      console.log('Method:', 'POST');
      console.log('Body:', {
        message: messageContent,
        userId: getUserId(),
        conversationId,
        model
      });

      const response = await Network.request({
        url: '/api/ai-chat/message',
        method: 'POST',
        data: {
          message: messageContent,
          userId: getUserId(),
          conversationId,
          model
        },
        timeout: 60000
      });

      console.log('=== 前端响应数据 ===');
      console.log('Response:', response);

      if (response.statusCode === 200 && response.data && response.data.data) {
        const responseData = response.data.data;
        const aiMessage: Message = {
          role: 'assistant',
          content: responseData.message || '',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);

        await saveMessage('assistant', aiMessage.content, conversationId);

        if (responseData.recommendedModel && responseData.recommendedModel !== model) {
          console.log('自动切换到推荐模型:', responseData.recommendedModel);
          setModel(responseData.recommendedModel);
          Taro.showToast({
            title: `已切换到 ${getModelLabel(responseData.recommendedModel)}`,
            icon: 'none',
            duration: 1500
          });
        }

        if (responseData.conversationId && responseData.conversationId !== currentConversationId) {
          setCurrentConversationId(responseData.conversationId);
        }
      } else {
        Taro.showToast({ title: '对话失败', icon: 'none' });
      }
    } catch (error) {
      console.error('对话失败:', error);
      Taro.showToast({ title: '对话失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const getModelLabel = (modelValue: string): string => {
    const labels: Record<string, string> = {
      'doubao-seed-2-0-pro-260215': '豆包 Pro',
      'doubao-seed-2-0-lite-260215': '豆包 Lite',
      'doubao-seed-2-0-mini-260215': '豆包 Mini',
      'doubao-seed-1-8-251228': '豆包 1.8',
      'doubao-seed-1-6-thinking-250715': '思考模型',
    };
    return labels[modelValue] || modelValue;
  };

  const handleNewConversation = async () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowConversationList(false);
    const title = '新对话 ' + new Date().toLocaleTimeString();
    await createConversation(title);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setModel(conversation.model);
    await loadConversationDetail(conversation.id);
    setShowConversationList(false);
  };

  const handleDeleteConversation = async (conversationId: string, event: any) => {
    event.stopPropagation();
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个对话吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/conversation/${conversationId}`,
              method: 'DELETE',
            });
            if (currentConversationId === conversationId) {
              setMessages([]);
              setCurrentConversationId(null);
            }
            await loadConversations();
          } catch (error) {
            console.error('删除对话失败:', error);
          }
        }
      }
    });
  };

  const handleInsertLexicon = (lexicon: Lexicon) => {
    setInputText(lexicon.content);
    setShowLexiconList(false);
  };

  const handleSendLexicon = (lexicon: Lexicon) => {
    setInputText(lexicon.content);
    setShowLexiconList(false);
    setTimeout(() => handleSend(), 100);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View className="min-h-screen bg-[#0a0a0b] flex flex-col">
      {/* 对话列表侧边栏 */}
      {showConversationList && (
        <View className="fixed inset-0 z-50 bg-[#0a0a0b]/95">
          <View className="h-full flex flex-col p-4">
            <View className="flex items-center justify-between mb-6">
              <Text className="block text-xl font-bold text-white">对话历史</Text>
              <View
                className="w-10 h-10 bg-zinc-800/60 rounded-xl flex items-center justify-center border border-zinc-700/50 active:bg-zinc-700"
                style={{ touchAction: 'none', zIndex: 10 }}
                onClick={() => setShowConversationList(false)}
              >
                <X size={20} color="#f59e0b" />
              </View>
            </View>

            <View
              className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ touchAction: 'none', zIndex: 10 }}
              onClick={handleNewConversation}
            >
              <Plus size={18} color="#3b82f6" />
              <Text className="block text-sm font-medium text-blue-400">新建对话</Text>
            </View>

            <ScrollView scrollY className="flex-1">
              <View className="flex flex-col gap-2">
                {conversations.map((conv) => (
                  <View
                    key={conv.id}
                    className={`p-4 rounded-xl transition-all ${
                      currentConversationId === conv.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-zinc-800/60 border border-zinc-700/50'
                    }`}
                    style={{ touchAction: 'none', zIndex: 10 }}
                    onClick={() => handleSelectConversation(conv)}
                    onTap={() => handleSelectConversation(conv)}
                  >
                    <View className="flex items-start justify-between mb-2">
                      <Text className={`block text-sm font-medium ${
                        currentConversationId === conv.id ? 'text-blue-400' : 'text-zinc-300'
                      }`}
                      >
                        {conv.title}
                      </Text>
                      <View
                        className="ml-2 p-1 rounded-lg bg-red-500/10 active:bg-red-500/20"
                        style={{
                          padding: '4px',
                          touchAction: 'none',
                          zIndex: 10,
                        }}
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        onTap={(e) => handleDeleteConversation(conv.id, e)}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </View>
                    </View>
                    <View className="flex items-center gap-1">
                      <Clock size={12} color="#71717a" />
                      <Text className="text-xs text-zinc-500">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}

                {conversations.length === 0 && (
                  <View className="flex flex-col items-center justify-center py-10">
                    <MessageSquare size={32} color="#71717a" />
                    <Text className="block text-sm text-zinc-500 mt-2">暂无对话记录</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 语料列表 */}
      {showLexiconList && (
        <View className="fixed inset-0 z-50 bg-[#0a0a0b]/95">
          <View className="h-full flex flex-col p-4">
            <View className="flex items-center justify-between mb-6">
              <Text className="block text-xl font-bold text-white">语料知识库</Text>
              <View
                className="w-10 h-10 bg-zinc-800/60 rounded-xl flex items-center justify-center border border-zinc-700/50 active:bg-zinc-700"
                style={{ touchAction: 'none', zIndex: 10 }}
                onClick={() => setShowLexiconList(false)}
              >
                <X size={20} color="#f59e0b" />
              </View>
            </View>

            <ScrollView scrollY className="flex-1">
              <View className="flex flex-col gap-3">
                {lexicons.map((lexicon) => (
                  <View key={lexicon.id} className="p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
                    <Text className="block text-sm font-medium text-zinc-300 mb-2">{lexicon.title}</Text>
                    <Text className="block text-xs text-zinc-500 mb-3 leading-relaxed">{lexicon.content.substring(0, 100)}...</Text>
                    <View className="flex gap-2">
                      <View
                        className="flex-1 py-2 bg-blue-500/20 rounded-lg flex items-center justify-center active:scale-95 transition-all border border-blue-500/30"
                        style={{ touchAction: 'none', zIndex: 10 }}
                        onClick={() => handleInsertLexicon(lexicon)}
                        onTap={() => handleInsertLexicon(lexicon)}
                      >
                        <Text className="text-xs text-blue-400">插入</Text>
                      </View>
                      <View
                        className="flex-1 py-2 bg-emerald-500/20 rounded-lg flex items-center justify-center active:scale-95 transition-all border border-emerald-500/30"
                        style={{ touchAction: 'none', zIndex: 10 }}
                        onClick={() => handleSendLexicon(lexicon)}
                        onTap={() => handleSendLexicon(lexicon)}
                      >
                        <Text className="text-xs text-emerald-400">发送</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {lexicons.length === 0 && (
                  <View className="flex flex-col items-center justify-center py-10">
                    <BookOpen size={32} color="#71717a" />
                    <Text className="block text-sm text-zinc-500 mt-2">暂无语料</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 头部 */}
      <View className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Sparkles size={20} color="#f59e0b" />
            </View>
            <Text className="block text-xl font-bold text-white">星小帮</Text>
          </View>
          <View className="flex items-center gap-2">
            <View
              className="p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/50 active:bg-zinc-700"
              onClick={() => setShowConversationList(true)}
            >
              <MessageSquare size={18} color="#f59e0b" />
            </View>
            <View
              className="p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/50 active:bg-zinc-700"
              onClick={() => setShowLexiconList(true)}
            >
              <BookOpen size={18} color="#f59e0b" />
            </View>
          </View>
        </View>

        {/* 模型选择折叠区域 */}
        <View
          className="mt-3 bg-zinc-800/50 rounded-xl overflow-hidden transition-all border border-zinc-700/50"
          style={{
            maxHeight: modelExpanded ? '200px' : '48px',
            touchAction: 'none',
            zIndex: 10,
          }}
          onClick={() => setModelExpanded(!modelExpanded)}
          onTap={() => setModelExpanded(!modelExpanded)}
        >
          <View
            className="px-4 py-2 flex items-center justify-between cursor-pointer"
            style={{
              height: '48px',
            }}
          >
            <View className="flex items-center gap-2">
              <Zap size={16} color="#f59e0b" />
              <Text className="text-sm font-medium text-zinc-300">
                {model === 'doubao-seed-2-0-pro-260215' && '豆包 Pro'}
                {model === 'doubao-seed-2-0-lite-260215' && '豆包 Lite'}
                {model === 'doubao-seed-2-0-mini-260215' && '豆包 Mini'}
                {model === 'doubao-seed-1-8-251228' && '豆包 1.8'}
                {model === 'doubao-seed-1-6-thinking-250715' && '思考模型'}
              </Text>
              {model === 'doubao-seed-2-0-pro-260215' && (
                <Text className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">推荐</Text>
              )}
            </View>
            <View className="flex items-center gap-1">
              <Text className="text-xs text-zinc-500">自动选择</Text>
              {modelExpanded ? (
                <ChevronDown size={14} color="#71717a" />
              ) : (
                <ChevronRight size={14} color="#71717a" />
              )}
            </View>
          </View>

          <ScrollView scrollX className="flex gap-2 px-2 pb-2">
            {[
              { value: 'doubao-seed-2-0-pro-260215', label: '豆包 Pro', recommended: true },
              { value: 'doubao-seed-2-0-lite-260215', label: '豆包 Lite', recommended: false },
              { value: 'doubao-seed-2-0-mini-260215', label: '豆包 Mini', recommended: false },
              { value: 'doubao-seed-1-8-251228', label: '豆包 1.8', recommended: false },
              { value: 'doubao-seed-1-6-thinking-250715', label: '思考模型', recommended: false },
            ].map((item) => (
              <View
                key={item.value}
                style={{
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  borderRadius: '6px',
                  backgroundColor: model === item.value ? 'rgba(245, 158, 11, 0.2)' : 'rgba(39, 39, 42, 0.8)',
                  border: model === item.value ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(63, 63, 70, 0.5)',
                  flexShrink: 0,
                  touchAction: 'none',
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setModel(item.value);
                  setModelExpanded(false);
                }}
                onTap={(e) => {
                  e.stopPropagation();
                  setModel(item.value);
                  setModelExpanded(false);
                }}
              >
                <View className="flex items-center gap-1">
                  <Text style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: model === item.value ? '#f59e0b' : '#a1a1aa',
                  }}
                  >
                    {item.label}
                  </Text>
                  {item.recommended && model !== item.value && (
                    <Text className="text-[10px] px-1 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">推荐</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* 对话列表 */}
      <ScrollView
        scrollY
        className="flex-1 px-4 py-4"
        scrollTop={scrollTop}
        scrollWithAnimation
      >
        {messages.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
              <Bot size={40} color="#3b82f6" />
            </View>
            <Text className="block text-base text-zinc-400 mb-2">开始对话</Text>
            <Text className="block text-sm text-zinc-300">我是你的助手，随时为你服务</Text>
          </View>
        ) : (
          <View className="flex flex-col gap-4">
            {messages.map((msg, index) => (
              <View
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <View className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <View
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : 'bg-blue-500/20 border border-blue-500/30'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User size={20} color="#f59e0b" />
                    ) : (
                      <Bot size={20} color="#3b82f6" />
                    )}
                  </View>

                  <View className="flex flex-col">
                    <View
                      className={`px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-none'
                          : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700/50'
                      }`}
                    >
                      {/* 附件展示 */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <View style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {msg.attachments.map((att) => (
                            <View
                              key={att.id}
                              style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {att.type === 'image' && <Image size={32} color="#71717a" />}
                              {att.type === 'video' && <Video size={32} color="#71717a" />}
                              {att.type === 'document' && <FileText size={32} color="#71717a" />}
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 文本内容 */}
                      <Text className="block text-sm leading-relaxed">
                        {msg.content}
                      </Text>
                    </View>
                    <Text className={`text-xs text-zinc-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {loading && (
              <View className="flex justify-start">
                <View className="flex gap-3 max-w-[85%]">
                  <View className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <Bot size={20} color="#3b82f6" />
                  </View>
                  <View className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-700/50">
                    <View className="flex items-center gap-2">
                      <Loader size={14} color="#f59e0b" className="animate-spin" />
                      <Text className="block text-sm text-zinc-400">思考中...</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 底部输入区域 */}
      <View style={{ 
        position: 'fixed', 
        bottom: 50, 
        left: 0, 
        right: 0, 
        background: 'linear-gradient(180deg, rgba(24, 24, 27, 0.95) 0%, rgba(10, 10, 11, 0.98) 100%)', 
        borderTop: '1px solid rgba(39, 39, 42, 0.5)',
        backdropFilter: 'blur(20px)',
        zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
      >
        {/* 附件预览区 */}
        {attachments.length > 0 && (
          <View style={{ 
            padding: '12px 16px 8px',
            borderBottom: '1px solid rgba(39, 39, 42, 0.5)'
          }}
          >
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {attachments.map((att, index) => (
                <View
                  key={att.id}
                  style={{
                    position: 'relative',
                    width: '72px',
                    height: '72px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                    border: '1px solid rgba(63, 63, 70, 0.5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {att.type === 'image' && <Image size={24} color="#71717a" />}
                  {att.type === 'video' && <Video size={24} color="#71717a" />}
                  {att.type === 'document' && <FileText size={24} color="#71717a" />}
                  {/* 删除按钮 */}
                  <View
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      touchAction: 'none',
                      zIndex: 10,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleRemoveAttachment(index)}
                    onTap={() => handleRemoveAttachment(index)}
                  >
                    <X size={12} color="#fff" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 录音状态 */}
        {isRecording && (
          <View style={{
            margin: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}
          >
            <View style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 10px #ef4444',
              animation: 'pulse 1s infinite'
            }}
            />
            <Mic size={16} color="#fca5a5" />
            <Text style={{ fontSize: '14px', color: '#fca5a5', fontWeight: 500 }}>
              正在录音 {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: 'auto' }}>
              点击麦克风停止
            </Text>
          </View>
        )}

        {/* 输入框主体 */}
        <View style={{ padding: '12px 16px 16px', position: 'relative', zIndex: 5 }}>
          <View style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '10px', 
            alignItems: 'flex-end',
            background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.8) 0%, rgba(10, 10, 11, 0.9) 100%)',
            borderRadius: '20px',
            padding: '6px',
            border: '1px solid rgba(63, 63, 70, 0.5)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            position: 'relative',
            zIndex: 5
          }}
          >
            {/* 语音按钮 */}
            {Taro.getEnv() === Taro.ENV_TYPE.WEAPP && (
              <View
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  background: isRecording 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                    : 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 10,
                  boxShadow: isRecording 
                    ? '0 4px 15px rgba(239, 68, 68, 0.4)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                onClick={isRecording ? stopRecording : startRecording}
                onTap={isRecording ? stopRecording : startRecording}
              >
                <Mic size={18} color={isRecording ? '#fff' : '#a1a1aa'} />
              </View>
            )}

            {/* 输入框 */}
            <View style={{ 
              flex: 1, 
              backgroundColor: 'rgba(10, 10, 11, 0.6)', 
              borderRadius: '14px', 
              padding: '10px 14px',
              border: '1px solid rgba(63, 63, 70, 0.3)'
            }}
            >
              <Textarea
                style={{ 
                  width: '100%', 
                  minHeight: '36px', 
                  maxHeight: '100px', 
                  backgroundColor: 'transparent', 
                  color: '#fafafa', 
                  fontSize: '15px',
                  lineHeight: '20px'
                }}
                placeholder="输入消息..."
                placeholderStyle="color: #71717a"
                value={inputText}
                onInput={(e) => setInputText(e.detail.value)}
                maxlength={2000}
                autoHeight
                confirmType="send"
                onConfirm={() => !loading && handleSend()}
              />
            </View>

            {/* 附件按钮 */}
            <View
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'none',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              onClick={handleSelectFile}
              onTap={handleSelectFile}
            >
              <Paperclip size={18} color="#a1a1aa" />
            </View>

            {/* 发送按钮 */}
            <View
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: loading || (!inputText.trim() && attachments.length === 0)
                  ? 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'none',
                cursor: loading || (!inputText.trim() && attachments.length === 0) ? 'not-allowed' : 'pointer',
                position: 'relative',
                zIndex: 10,
                boxShadow: loading || (!inputText.trim() && attachments.length === 0)
                  ? 'none'
                  : '0 4px 15px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => !loading && handleSend()}
              onTap={() => !loading && handleSend()}
            >
              <Send size={18} color={loading || (!inputText.trim() && attachments.length === 0) ? '#71717a' : '#000'} />
            </View>
          </View>
        </View>

        {/* 操作菜单 */}
        {showActionSheet && (
          <View
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'flex-end',
              touchAction: 'none',
            }}
            onClick={() => setShowActionSheet(false)}
            onTap={() => setShowActionSheet(false)}
          >
            <View
              style={{
                width: '100%',
                background: 'linear-gradient(180deg, #18181b 0%, #0a0a0b 100%)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '20px',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* 拖动指示器 */}
              <View style={{
                width: '40px',
                height: '4px',
                backgroundColor: 'rgba(63, 63, 70, 0.5)',
                borderRadius: '2px',
                margin: '0 auto 20px'
              }}
              />
              
              <Text style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#fafafa', 
                marginBottom: '20px', 
                textAlign: 'center' 
              }}
              >
                选择文件类型
              </Text>
              
              <View style={{ display: 'flex', flexDirection: 'row', gap: '12px', justifyContent: 'center' }}>
                {/* 图片选项 */}
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px 16px',
                    background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    touchAction: 'none',
                    cursor: 'pointer'
                  }}
                  onTap={handleSelectImage}
                >
                  <View style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                  >
                    <Image size={24} color="#fff" />
                  </View>
                  <Text style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>图片</Text>
                </View>

                {/* 视频选项 */}
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px 16px',
                    background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    touchAction: 'none',
                    cursor: 'pointer'
                  }}
                  onTap={handleSelectVideo}
                >
                  <View style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                  }}
                  >
                    <Video size={24} color="#fff" />
                  </View>
                  <Text style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>视频</Text>
                </View>

                {/* 文档选项 */}
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px 16px',
                    background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    touchAction: 'none',
                    cursor: 'pointer'
                  }}
                  onTap={handleSelectDocument}
                >
                  <View style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                  }}
                  >
                    <FileText size={24} color="#fff" />
                  </View>
                  <Text style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>文档</Text>
                </View>
              </View>

              {/* 取消按钮 */}
              <View
                style={{
                  marginTop: '16px',
                  padding: '14px',
                  background: 'rgba(63, 63, 70, 0.5)',
                  borderRadius: '12px',
                  touchAction: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onTap={() => setShowActionSheet(false)}
              >
                <Text style={{ fontSize: '16px', color: '#a1a1aa', textAlign: 'center', fontWeight: 500 }}>
                  取消
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default AiChatPage;
