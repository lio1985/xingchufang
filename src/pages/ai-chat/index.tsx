import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Send, Bot, User, Trash2, Plus, Clock, ChevronLeft, BookOpen, ChevronDown, ChevronRight, Zap, Mic, Paperclip, X, Image as ImageIcon, FileText, Video } from 'lucide-react-taro';
import { Network } from '@/network';
import StarIcon from '@/components/StarIcon';

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
  const [model, setModel] = useState('doubao-seed-1-8-251228');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversationList, setShowConversationList] = useState(false);
  const [lexicons, setLexicons] = useState<Lexicon[]>([]);
  const [showLexiconList, setShowLexiconList] = useState(false);
  const [modelExpanded, setModelExpanded] = useState(false); // 模型选择折叠状态
  const [isRecording, setIsRecording] = useState(false); // 是否正在录音
  const [recordingDuration, setRecordingDuration] = useState(0); // 录音时长（秒）
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]); // 待发送的附件
  const [showActionSheet, setShowActionSheet] = useState(false); // 显示操作菜单
  const scrollViewRef = useRef<any>(null);
  const recorderManagerRef = useRef<Taro.RecorderManager | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取用户ID（优先使用登录时的真实userId，否则使用localStorage）
  const getUserId = () => {
    // 优先使用登录时存储的真实用户ID（UUID格式）
    const user = Taro.getStorageSync('user');
    if (user && user.id) {
      return user.id;
    }
    
    // 其次使用userId storage
    let userId = Taro.getStorageSync('userId');
    
    // 如果没有userId，或者格式不正确（带user_前缀），生成新的UUID
    if (!userId || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // 生成UUID格式的用户ID
      userId = crypto.randomUUID();
      Taro.setStorageSync('userId', userId);
    }
    
    return userId;
  };

  // 加载对话列表
  const loadConversations = useCallback(async () => {
    try {
      const response = await Network.request({
        url: '/api/conversation/list',
        method: 'GET',
      });

      if (response.statusCode === 200 && response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('加载对话列表失败:', error);
    }
  }, []);

  // 加载语料列表
  const loadLexicons = async () => {
    try {
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'GET',
      });

      if (response.statusCode === 200 && response.data?.data) {
        // 后端返回的数据结构是 { items, total, page, pageSize }
        const lexiconData = Array.isArray(response.data.data.items) ? response.data.data.items : []
        setLexicons(lexiconData)
      } else {
        setLexicons([])
      }
    } catch (error) {
      console.error('加载语料列表失败:', error);
      setLexicons([])
    }
  };

  // 创建新对话
  const createConversation = async (title: string) => {
    try {
      const userId = getUserId();
      const response = await Network.request({
        url: '/api/conversation',
        method: 'POST',
        data: {
          userId,
          title,
          model,
        },
      });

      if (response.statusCode === 200 && response.data) {
        setCurrentConversationId(response.data.id);
        await loadConversations();
      }
    } catch (error) {
      console.error('创建对话失败:', error);
    }
  };

  // 加载对话详情
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

  // 保存消息到数据库
  const saveMessage = async (role: string, content: string) => {
    if (!currentConversationId) return;

    try {
      await Network.request({
        url: '/api/conversation/message',
        method: 'POST',
        data: {
          conversationId: currentConversationId,
          role,
          content,
        },
      });
    } catch (error) {
      console.error('保存消息失败:', error);
    }
  };

  // 处理录音完成
  const handleRecordingComplete = useCallback(async (tempFilePath: string, duration: number) => {
    console.log('录音完成，准备上传:', tempFilePath, duration);

    try {
      // 上传文件
      const userId = getUserId();
      const uploadResult = await uploadFile(tempFilePath, userId);

      // 进行语音识别
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

        // 将识别的文本填充到输入框
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

  // 初始化 - 只在组件挂载时运行
  useEffect(() => {
    // 检查登录状态
    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.showModal({
        title: '请先登录',
        content: '使用助手功能需要登录账号，是否立即登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.reLaunch({ url: '/pages/login/index' });
          } else {
            Taro.switchTab({ url: '/pages/index/index' });
          }
        }
      });
      return;
    }

    loadConversations();
    loadLexicons();

    // 初始化录音管理器（仅在小程序端）
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      recorderManagerRef.current = Taro.getRecorderManager();

      // 监听录音停止事件
      recorderManagerRef.current.onStop((result) => {
        console.log('录音完成:', result);
        handleRecordingComplete(result.tempFilePath, result.duration);
      });

      // 监听录音错误事件
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

  // 滚动到底部
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        scrollTop: 99999,
        duration: 300
      });
    }
  }, [messages]);

  // 开始录音
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

    // 开始录音
    recorderManagerRef.current.start({
      format: 'mp3',
      duration: 60000, // 最长60秒
    });

    // 开始计时
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    Taro.showToast({ title: '开始录音', icon: 'none', duration: 1000 });
  };

  // 停止录音
  const stopRecording = () => {
    if (!recorderManagerRef.current) return;

    recorderManagerRef.current.stop();

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
  };

  // 上传文件
  const uploadFile = async (filePath: string, userId: string): Promise<MessageAttachment> => {
    try {
      Taro.showLoading({ title: '上传中...' });

      // 使用Network.uploadFile上传文件
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

  // 选择文件
  const handleSelectFile = () => {
    setShowActionSheet(true);
  };

  // 选择图片
  const handleSelectImage = () => {
    setShowActionSheet(false);

    // H5 端不支持 chooseImage，使用 input 替代
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

  // 选择视频
  const handleSelectVideo = () => {
    setShowActionSheet(false);

    // H5 端不支持 chooseVideo
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

  // 选择文件（文档）
  const handleSelectDocument = () => {
    setShowActionSheet(false);

    // H5 端不支持 chooseMessageFile
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

  // 删除附件
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!inputText.trim() && attachments.length === 0) || loading) {
      return;
    }

    // 如果没有当前对话，创建一个新对话
    if (!currentConversationId) {
      const title = inputText.trim().substring(0, 30) + (inputText.trim().length > 30 ? '...' : '') || '新对话';
      await createConversation(title);
    }

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    // 使用函数式更新确保状态正确
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setAttachments([]);
    setLoading(true);

    try {
      // 保存用户消息
      await saveMessage('user', userMessage.content);

      // 构建消息内容（包含附件信息）
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
        conversationId: currentConversationId,
        model
      });

      const response = await Network.request({
        url: '/api/ai-chat/message',
        method: 'POST',
        data: {
          message: messageContent,
          userId: getUserId(),
          conversationId: currentConversationId,
          model
        },
        timeout: 60000 // 60秒超时，防止长时间无响应
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

        // 保存AI消息
        await saveMessage('assistant', aiMessage.content);

        // 如果有推荐模型，自动切换
        if (responseData.recommendedModel && responseData.recommendedModel !== model) {
          console.log('自动切换到推荐模型:', responseData.recommendedModel);
          setModel(responseData.recommendedModel);
          Taro.showToast({
            title: `已切换到 ${getModelLabel(responseData.recommendedModel)}`,
            icon: 'none',
            duration: 1500
          });
        }

        // 更新当前对话ID
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

  // 获取模型标签
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
    <View className="min-h-screen bg-slate-900 flex flex-col">
      {/* 对话列表侧边栏 */}
      {showConversationList && (
        <View className="fixed inset-0 z-50 bg-slate-900/95">
          <View className="h-full flex flex-col p-4">
            <View className="flex items-center justify-between mb-6">
              <Text className="block text-xl font-bold text-white">对话历史</Text>
              <View
                className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center"
                onClick={() => setShowConversationList(false)}
              >
                <ChevronLeft size={20} color="#94a3b8" />
              </View>
            </View>

            <View
              className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              onClick={handleNewConversation}
            >
              <Plus size={18} color="#60a5fa" />
              <Text className="block text-sm font-medium text-blue-300">新建对话</Text>
            </View>

            <ScrollView scrollY className="flex-1">
              <View className="flex flex-col gap-2">
                {conversations.map((conv) => (
                  <View
                    key={conv.id}
                    className={`p-4 rounded-xl transition-all ${
                      currentConversationId === conv.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <View className="flex items-start justify-between mb-2">
                      <Text className={`block text-sm font-medium ${
                        currentConversationId === conv.id ? 'text-blue-300' : 'text-slate-300'
                      }`}
                      >
                        {conv.title}
                      </Text>
                      <View
                        className="ml-2"
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                      >
                        <Trash2 size={14} color="#64748b" />
                      </View>
                    </View>
                    <View className="flex items-center gap-1">
                      <Clock size={12} color="#64748b" />
                      <Text className="text-xs text-slate-500">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}

                {conversations.length === 0 && (
                  <View className="flex flex-col items-center justify-center py-10">
                    <Text className="block text-sm text-slate-500">暂无对话记录</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 语料列表 */}
      {showLexiconList && (
        <View className="fixed inset-0 z-50 bg-slate-900/95">
          <View className="h-full flex flex-col p-4">
            <View className="flex items-center justify-between mb-6">
              <Text className="block text-xl font-bold text-white">语料知识库</Text>
              <View
                className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center"
                onClick={() => setShowLexiconList(false)}
              >
                <ChevronLeft size={20} color="#94a3b8" />
              </View>
            </View>

            <ScrollView scrollY className="flex-1">
              <View className="flex flex-col gap-3">
                {lexicons.map((lexicon) => (
                  <View key={lexicon.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <Text className="block text-sm font-medium text-slate-300 mb-2">{lexicon.title}</Text>
                    <Text className="block text-xs text-slate-500 mb-3 leading-relaxed">{lexicon.content.substring(0, 100)}...</Text>
                    <View className="flex gap-2">
                      <View
                        className="flex-1 py-2 bg-blue-500/20 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                        onClick={() => handleInsertLexicon(lexicon)}
                      >
                        <Text className="text-xs text-blue-300">插入</Text>
                      </View>
                      <View
                        className="flex-1 py-2 bg-green-500/20 rounded-lg flex items-center justify-center active:scale-95 transition-all"
                        onClick={() => handleSendLexicon(lexicon)}
                      >
                        <Text className="text-xs text-green-300">发送</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {lexicons.length === 0 && (
                  <View className="flex flex-col items-center justify-center py-10">
                    <Text className="block text-sm text-slate-500">暂无语料</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 头部 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <StarIcon size={32} />
            <Text className="block text-xl font-bold text-white">星小帮</Text>
          </View>
          <View className="flex gap-2">
            <View
              className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center active:scale-95 transition-all"
              onClick={() => setShowConversationList(true)}
            >
              <Clock size={18} color="#94a3b8" />
            </View>
            <View
              className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center active:scale-95 transition-all"
              onClick={() => setShowLexiconList(true)}
            >
              <BookOpen size={18} color="#94a3b8" />
            </View>
            <View
              className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center active:scale-95 transition-all"
              onClick={handleNewConversation}
            >
              <Plus size={18} color="#94a3b8" />
            </View>
          </View>
        </View>

        {/* 模型选择折叠区域 */}
        <View
          className="mt-3 bg-slate-800/50 rounded-xl overflow-hidden transition-all"
          style={{
            maxHeight: modelExpanded ? '200px' : '48px',
          }}
          onClick={() => setModelExpanded(!modelExpanded)}
        >
          <View
            className="px-4 py-2 flex items-center justify-between cursor-pointer"
            style={{
              height: '48px',
            }}
          >
            <View className="flex items-center gap-2">
              <Zap size={16} color="#fbbf24" />
              <Text className="text-sm font-medium text-slate-300">
                {model === 'doubao-seed-2-0-pro-260215' && '豆包 Pro'}
                {model === 'doubao-seed-2-0-lite-260215' && '豆包 Lite'}
                {model === 'doubao-seed-2-0-mini-260215' && '豆包 Mini'}
                {model === 'doubao-seed-1-8-251228' && '豆包 1.8'}
                {model === 'doubao-seed-1-6-thinking-250715' && '思考模型'}
              </Text>
              {model === 'doubao-seed-2-0-pro-260215' && (
                <Text className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">推荐</Text>
              )}
            </View>
            <View className="flex items-center gap-1">
              <Text className="text-xs text-slate-500">自动选择</Text>
              {modelExpanded ? (
                <ChevronDown size={14} color="#94a3b8" />
              ) : (
                <ChevronRight size={14} color="#94a3b8" />
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
                  backgroundColor: model === item.value ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 1)',
                  border: model === item.value ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(51, 65, 85, 1)',
                  flexShrink: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setModel(item.value);
                  setModelExpanded(false);
                }}
              >
                <View className="flex items-center gap-1">
                  <Text style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: model === item.value ? '#93c5fd' : '#94a3b8',
                  }}
                  >
                    {item.label}
                  </Text>
                  {item.recommended && model !== item.value && (
                    <Text className="text-[10px] px-1 py-0.5 bg-amber-500/20 text-amber-400 rounded">推荐</Text>
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
        ref={scrollViewRef}
      >
        {messages.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20">
            <View className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Bot size={40} color="#60a5fa" />
            </View>
            <Text className="block text-base text-slate-500 mb-2">开始对话</Text>
            <Text className="block text-sm text-slate-600">我是你的助手，随时为你服务</Text>
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
                        ? 'bg-amber-500/20'
                        : 'bg-blue-500/20'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User size={20} color="#f59e0b" />
                    ) : (
                      <Bot size={20} color="#60a5fa" />
                    )}
                  </View>

                  <View className="flex flex-col">
                    <View
                      className={`px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none'
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
                              }}
                            >
                              {att.type === 'image' && (
                                <Image
                                  src={att.url}
                                  mode="aspectFill"
                                  style={{ width: '100%', height: '100%' }}
                                />
                              )}
                              {att.type === 'video' && (
                                <View className="w-full h-full flex items-center justify-center">
                                  <Video size={32} color="white" />
                                </View>
                              )}
                              {att.type === 'document' && (
                                <View className="w-full h-full flex items-center justify-center">
                                  <FileText size={32} color="white" />
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 文本内容 */}
                      <Text className="block text-sm leading-relaxed">
                        {msg.content}
                      </Text>
                    </View>
                    <Text className={`text-xs text-slate-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {loading && (
              <View className="flex justify-start">
                <View className="flex gap-3 max-w-[85%]">
                  <View className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot size={20} color="#60a5fa" />
                  </View>
                  <View className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none">
                    <Text className="block text-sm text-slate-400">思考中...</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 底部区域 */}
      <View style={{ position: 'fixed', bottom: 50, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.98)', borderTop: '1px solid #334155', zIndex: 40 }}>
        {/* 输入框 */}
        <View style={{ padding: '8px 16px 16px 16px' }}>
          {/* 附件预览 */}
          {attachments.length > 0 && (
            <View style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {attachments.map((att, index) => (
                <View
                  key={att.id}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#1e293b',
                  }}
                >
                  {att.type === 'image' && (
                    <Image
                      src={att.url}
                      mode="aspectFill"
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                  {att.type === 'video' && (
                    <View className="w-full h-full flex items-center justify-center">
                      <Video size={32} color="#60a5fa" />
                    </View>
                  )}
                  {att.type === 'document' && (
                    <View className="w-full h-full flex items-center justify-center">
                      <FileText size={32} color="#60a5fa" />
                    </View>
                  )}
                  <View
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X size={12} color="white" />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 录音状态显示 */}
          {isRecording && (
            <View style={{
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
            >
              <View style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                animation: 'pulse 1s infinite'
              }}
              />
              <Text style={{ fontSize: '13px', color: '#ef4444' }}>
                录音中 {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}

          {/* 输入框和按钮 */}
          <View style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'flex-end' }}>
            {/* 语音按钮 */}
            {Taro.getEnv() === Taro.ENV_TYPE.WEAPP && (
              <View
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: isRecording ? '#ef4444' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <Mic size={20} color="white" />
              </View>
            )}

            {/* 输入框 */}
            <View style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '16px', padding: '12px' }}>
              <Textarea
                style={{ width: '100%', minHeight: '40px', maxHeight: '120px', backgroundColor: 'transparent', color: '#fff', fontSize: '14px' }}
                placeholder="输入消息..."
                value={inputText}
                onInput={(e) => setInputText(e.detail.value)}
                maxlength={2000}
                autoHeight
              />
            </View>

            {/* 文件上传按钮 */}
            <View
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={handleSelectFile}
            >
              <Paperclip size={20} color="#94a3b8" />
            </View>

            {/* 发送按钮 */}
            <View
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: loading || (!inputText.trim() && attachments.length === 0)
                  ? '#334155'
                  : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => !loading && handleSend()}
            >
              <Send size={20} color={loading || (!inputText.trim() && attachments.length === 0) ? '#64748b' : 'white'} />
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'flex-end',
            }}
            onClick={() => setShowActionSheet(false)}
          >
            <View
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '16px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '16px', textAlign: 'center' }}>
                选择文件类型
              </Text>
              <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#334155',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                  onClick={handleSelectImage}
                >
                  <ImageIcon size={24} color="#60a5fa" />
                  <Text style={{ fontSize: '15px', color: '#fff' }}>图片</Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#334155',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                  onClick={handleSelectVideo}
                >
                  <Video size={24} color="#60a5fa" />
                  <Text style={{ fontSize: '15px', color: '#fff' }}>视频</Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#334155',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                  onClick={handleSelectDocument}
                >
                  <FileText size={24} color="#60a5fa" />
                  <Text style={{ fontSize: '15px', color: '#fff' }}>文档</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default AiChatPage;
