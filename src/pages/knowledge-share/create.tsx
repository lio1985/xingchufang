import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Save, X, Mic, MicOff, Image as ImageIcon, FileText, Trash2 } from 'lucide-react-taro';
import { Network } from '@/network';

interface Attachment {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
}

const KnowledgeShareCreatePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 录音相关
  const [recorderManager, setRecorderManager] = useState<Taro.RecorderManager | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPath, setAudioPath] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

  useEffect(() => {
    // CRITICAL: 只在小程序端初始化 RecorderManager
    if (isWeapp) {
      const manager = Taro.getRecorderManager();

      manager.onStart(() => {
        console.log('录音开始');
        setIsRecording(true);
        setRecordingTime(0);
      });

      manager.onStop((res) => {
        console.log('录音结束', res.tempFilePath);
        setAudioPath(res.tempFilePath);
        setIsRecording(false);
        setRecordingTime(0);
      });

      manager.onError((err) => {
        console.error('录音错误', err);
        Taro.showToast({ title: '录音失败', icon: 'none' });
        setIsRecording(false);
      });

      setRecorderManager(manager);
    }
  }, [isWeapp]);

  // 录音计时器
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (tags.includes(tagInput.trim())) {
      Taro.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    if (tags.length >= 5) {
      Taro.showToast({ title: '最多添加5个标签', icon: 'none' });
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // 选择文件
  const handleChooseFile = async () => {
    const maxAttachments = 20;
    const remainingCount = maxAttachments - attachments.length;

    if (remainingCount <= 0) {
      Taro.showToast({ title: `最多上传 ${maxAttachments} 个附件`, icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseMessageFile({
        count: Math.min(5, remainingCount),
        type: 'file',
        extension: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        await uploadFiles(res.tempFiles.map(file => ({
          filePath: file.path,
          name: file.name,
          size: file.size,
        })));
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      if ((error as any).errMsg?.includes('cancel')) {
        return;
      }
      Taro.showToast({ title: '选择文件失败', icon: 'none' });
    }
  };

  // 选择图片
  const handleChooseImage = async () => {
    const maxImages = 9;
    const imageCount = attachments.filter(a => a.fileType === 'image').length;

    if (imageCount >= maxImages) {
      Taro.showToast({ title: `最多上传 ${maxImages} 张图片`, icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: Math.min(maxImages - imageCount, maxImages),
        sizeType: ['compressed', 'original'],
        sourceType: ['album', 'camera'],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        // CRITICAL: tempFiles 在某些平台（如 H5）可能是 undefined
        const files = res.tempFilePaths.map((path, index) => {
          const tempFile = (res.tempFiles?.[index] as any);
          return {
            filePath: path,
            name: tempFile?.name || `image_${Date.now()}_${index}.jpg`,
            size: tempFile?.size || 0,
          };
        });
        await uploadFiles(files);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      if ((error as any).errMsg?.includes('cancel')) {
        return;
      }
      Taro.showToast({ title: '选择图片失败', icon: 'none' });
    }
  };

  // 上传文件
  const uploadFiles = async (files: Array<{ filePath: string; name: string; size: number }>) => {
    if (uploading) {
      Taro.showToast({ title: '正在上传中...', icon: 'none' });
      return;
    }

    try {
      setUploading(true);
      Taro.showLoading({ title: '上传中...', mask: true });

      const uploadPromises = files.map(file =>
        Network.uploadFile({
          url: '/api/knowledge-shares/upload',
          filePath: file.filePath,
          name: 'file',
        })
      );

      const results = await Promise.all(uploadPromises);

      const newAttachments: Attachment[] = [];

      results.forEach((res, index) => {
        try {
          const parsedData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          if (parsedData?.code === 200 && parsedData.data) {
            newAttachments.push(parsedData.data);
          } else {
            console.error(`文件 ${files[index].name} 上传失败:`, parsedData);
            Taro.showToast({ title: `${files[index].name} 上传失败`, icon: 'none' });
          }
        } catch (error) {
          console.error(`解析文件 ${files[index].name} 响应失败:`, error);
          Taro.showToast({ title: `${files[index].name} 上传失败`, icon: 'none' });
        }
      });

      if (newAttachments.length > 0) {
        setAttachments([...attachments, ...newAttachments]);
        Taro.showToast({
          title: `成功上传 ${newAttachments.length} 个文件`,
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      Taro.showToast({ title: '上传失败，请重试', icon: 'none' });
    } finally {
      setUploading(false);
      Taro.hideLoading();
    }
  };

  // 删除附件
  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // 开始录音
  const handleStartRecord = () => {
    if (!isWeapp) {
      Taro.showToast({ title: '录音功能仅在小程序中可用', icon: 'none' });
      return;
    }

    if (audioPath) {
      Taro.showModal({
        title: '提示',
        content: '已有录音，重新录音将覆盖原有录音，是否继续？',
        success: (res) => {
          if (res.confirm) {
            setAudioPath('');
            startRecording();
          }
        },
      });
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    recorderManager?.start({
      format: 'mp3',
      sampleRate: 16000,
      numberOfChannels: 1,
    });
  };

  // 停止录音
  const handleStopRecord = () => {
    recorderManager?.stop();
  };

  // 上传录音
  const handleUploadAudio = async () => {
    if (!audioPath) return;

    try {
      setUploading(true);
      Taro.showLoading({ title: '上传中...', mask: true });

      const res = await Network.uploadFile({
        url: '/api/knowledge-shares/upload',
        filePath: audioPath,
        name: 'file',
      });

      try {
        const parsedData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (parsedData?.code === 200 && parsedData.data) {
          setAttachments([...attachments, parsedData.data]);
          setAudioPath('');
          Taro.showToast({
            title: '录音上传成功',
            icon: 'success',
          });
        } else {
          Taro.showToast({
            title: parsedData?.msg || '上传失败',
            icon: 'none',
          });
        }
      } catch (error) {
        console.error('解析录音上传响应失败:', error);
        Taro.showToast({
          title: '上传失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('上传录音失败:', error);
      Taro.showToast({ title: '上传失败，请重试', icon: 'none' });
    } finally {
      setUploading(false);
      Taro.hideLoading();
    }
  };

  // 删除录音
  const handleRemoveAudio = () => {
    setAudioPath('');
    Taro.showToast({ title: '已删除录音', icon: 'success' });
  };

  // 保存
  const handleSave = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    if (!content.trim() && attachments.length === 0) {
      Taro.showToast({ title: '请输入内容或上传附件', icon: 'none' });
      return;
    }

    if (content.trim() && content.trim().length < 10) {
      Taro.showToast({ title: '内容至少10个字符', icon: 'none' });
      return;
    }

    try {
      setLoading(true);

      const res = await Network.request({
        url: '/api/knowledge-shares',
        method: 'POST',
        data: {
          title: title.trim(),
          content: content.trim(),
          category: category.trim() || '其他',
          tags,
          attachments,
        }
      });

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '创建成功',
          icon: 'success',
          success: () => {
            setTimeout(() => {
              Taro.navigateBack();
            }, 1500);
          }
        });
      } else {
        Taro.showToast({
          title: res.data?.msg || '创建失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('创建知识分享失败:', error);
      Taro.showToast({
        title: '创建失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="min-h-screen bg-sky-50">
      {/* 顶部导航栏 */}
      <View className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <View
          className="flex items-center gap-2"
          onClick={() => Taro.navigateBack()}
        >
          <ArrowLeft size={24} color="#94a3b8" />
        </View>
        <View className="flex items-center gap-2">
          <BookOpen size={24} color="#60a5fa" />
          <Text className="block text-lg font-bold text-white">创建知识分享</Text>
        </View>
        <View
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 ${loading || uploading ? 'bg-slate-100 opacity-50' : 'bg-blue-500'}`}
          onClick={handleSave}
        >
          <Save size={18} color="white" />
          <Text className="block text-sm text-white">
            {loading ? '保存中...' : uploading ? '上传中...' : '保存'}
          </Text>
        </View>
      </View>

      {/* 表单内容 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4">
          {/* 标题输入 */}
          <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <Text className="block text-sm font-semibold text-white mb-3">标题</Text>
            <View className="bg-white rounded-lg px-4 py-3">
              <input
                className="w-full bg-transparent text-white text-base placeholder-slate-400 outline-none"
                placeholder="请输入知识分享标题"
                value={title}
                maxLength={100}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
              />
            </View>
            <Text className="block text-xs text-slate-500 mt-2 text-right">{title.length}/100</Text>
          </View>

          {/* 分类输入 */}
          <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <Text className="block text-sm font-semibold text-white mb-3">分类</Text>
            <View className="bg-white rounded-lg px-4 py-3">
              <input
                className="w-full bg-transparent text-white text-base placeholder-slate-400 outline-none"
                placeholder="如：运营技巧、内容创作等"
                value={category}
                maxLength={50}
                onInput={(e) => setCategory((e.target as HTMLInputElement).value)}
              />
            </View>
          </View>

          {/* 标签输入 */}
          <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <Text className="block text-sm font-semibold text-white mb-3">标签（最多5个）</Text>
            {tags.length > 0 && (
              <View className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    className="bg-sky-500/20 border border-sky-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Text className="block text-sm text-blue-300">{tag}</Text>
                    <View
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/50"
                      onClick={() => handleRemoveTag(index)}
                    >
                      <X size={10} color="#93c5fd" />
                    </View>
                  </View>
                ))}
              </View>
            )}
            <View className="bg-white rounded-lg px-4 py-3 flex items-center gap-2">
              <input
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-400 outline-none"
                placeholder="输入标签后按回车添加"
                value={tagInput}
                maxLength={20}
                onInput={(e) => setTagInput((e.target as HTMLInputElement).value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                  }
                }}
              />
              <View
                className={`px-3 py-1.5 rounded-lg ${tagInput.trim() ? 'bg-blue-500' : 'bg-slate-100'}`}
                onClick={handleAddTag}
              >
                <Text className="block text-xs text-white">添加</Text>
              </View>
            </View>
          </View>

          {/* 附件上传 */}
          <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <View className="flex items-center justify-between mb-3">
              <Text className="block text-sm font-semibold text-white">附件</Text>
              <Text className="block text-xs text-slate-500">
                {attachments.length}/20
              </Text>
            </View>

            {/* 上传按钮 */}
            <View className="flex flex-wrap gap-2 mb-3">
              <View
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${uploading ? 'bg-slate-100 opacity-50' : 'bg-blue-500'}`}
                onClick={handleChooseImage}
              >
                <ImageIcon size={18} color="white" />
                <Text className="block text-sm text-white">图片</Text>
              </View>
              <View
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${uploading ? 'bg-slate-100 opacity-50' : 'bg-blue-500'}`}
                onClick={handleChooseFile}
              >
                <FileText size={18} color="white" />
                <Text className="block text-sm text-white">文件</Text>
              </View>
              {isWeapp && (
                <View
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${uploading ? 'bg-slate-100 opacity-50' : 'bg-blue-500'}`}
                  onClick={isRecording ? handleStopRecord : handleStartRecord}
                >
                  {isRecording ? (
                    <>
                      <MicOff size={18} color="white" />
                      <Text className="block text-sm text-white">{formatRecordingTime(recordingTime)}</Text>
                    </>
                  ) : (
                    <>
                      <Mic size={18} color="white" />
                      <Text className="block text-sm text-white">录音</Text>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* 录音预览 */}
            {audioPath && (
              <View className="bg-white rounded-lg p-3 mb-3">
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-2">
                    <Text className="block text-sm text-blue-300">录音已就绪</Text>
                  </View>
                  <View className="flex items-center gap-2">
                    <View
                      className={`px-3 py-1.5 rounded-lg ${uploading ? 'bg-slate-100 opacity-50' : 'bg-blue-500'}`}
                      onClick={handleUploadAudio}
                    >
                      <Text className="block text-xs text-white">上传</Text>
                    </View>
                    <View
                      className="p-1.5 rounded-lg bg-slate-100"
                      onClick={handleRemoveAudio}
                    >
                      <X size={14} color="#94a3b8" />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 附件列表 */}
            {attachments.length > 0 && (
              <View className="space-y-2">
                {attachments.map((attachment, index) => (
                  <View
                    key={index}
                    className="bg-white rounded-lg p-3 flex items-center gap-3"
                  >
                    {attachment.fileType === 'image' ? (
                      <Image
                        src={attachment.fileUrl}
                        className="w-12 h-12 rounded object-cover"
                        mode="aspectFill"
                      />
                    ) : attachment.fileType === 'audio' ? (
                      <View className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center">
                        <Mic size={20} color="#94a3b8" />
                      </View>
                    ) : (
                      <View className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center">
                        <FileText size={20} color="#94a3b8" />
                      </View>
                    )}
                    <View className="flex-1 min-w-0">
                      <Text className="block text-sm text-white truncate">
                        {attachment.fileName}
                      </Text>
                      <Text className="block text-xs text-slate-500">
                        {formatFileSize(attachment.fileSize)}
                      </Text>
                    </View>
                    <View
                      className="p-1.5 rounded-lg bg-slate-100"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 提示文本 */}
            {attachments.length === 0 && !audioPath && !isRecording && (
              <Text className="block text-xs text-slate-500 text-center py-4">
                支持上传图片、文档等文件，小程序支持录音
              </Text>
            )}
          </View>

          {/* 内容输入 */}
          <View className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <Text className="block text-sm font-semibold text-white mb-3">内容</Text>
            <View className="bg-white rounded-lg p-4">
              <textarea
                className="w-full min-h-[300px] bg-transparent text-white text-base placeholder-slate-400 outline-none leading-relaxed"
                placeholder="请详细描述您的知识分享内容..."
                value={content}
                maxLength={5000}
                onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
              />
            </View>
            <Text className="block text-xs text-slate-500 mt-2 text-right">{content.length}/5000</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default KnowledgeShareCreatePage;
