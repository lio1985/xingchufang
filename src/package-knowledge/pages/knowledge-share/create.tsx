import { View, Text, ScrollView, Textarea, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  ChevronLeft,
  Save,
  X,
  Image as ImageIcon,
  FileText,
  Mic,
  Trash2,
  Upload,
  Tag,
  FolderOpen,
  Lock,
} from 'lucide-react-taro';

interface Attachment {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
}

// 分类选项
const categoryOptions = [
  { id: 'equipment', name: '商厨设备维修维保' },
  { id: 'policies', name: '公司规章制度' },
  { id: 'sales', name: '销售技巧' },
  { id: 'product', name: '产品知识' },
  { id: 'other', name: '其他' },
];

const KnowledgeShareCreatePage = () => {
  // 权限检查：需要登录且为员工及以上角色
  const { canAccess, loading: authLoading, isGuest, goToLogin } = useAuthGuard({ 
    requireLogin: true,
    requiredRole: 'employee',
    forbiddenMessage: '创建知识分享需要登录员工账号'
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
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
    let interval: ReturnType<typeof setInterval>;
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
          category: category || '其他',
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

  const selectedCategoryName = categoryOptions.find(c => c.id === category)?.name || '请选择分类';

  // 权限加载中
  if (authLoading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>加载中...</Text>
      </View>
    );
  }

  // 无权限时显示提示
  if (!canAccess) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <View style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <Lock size={40} color="#f87171" />
        </View>
        <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
          {isGuest ? '请先登录' : '无权限访问'}
        </Text>
        <Text style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', marginBottom: '32px' }}>
          {isGuest ? '创建知识分享需要登录员工账号' : '您没有权限创建知识分享'}
        </Text>
        <View
          style={{ backgroundColor: '#38bdf8', borderRadius: '12px', padding: '14px 32px' }}
          onClick={isGuest ? goToLogin : () => Taro.navigateBack()}
        >
          <Text style={{ fontSize: '16px', fontWeight: '500', color: '#0a0f1a' }}>
            {isGuest ? '去登录' : '返回'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* 顶部导航栏 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        backgroundColor: '#111827',
        borderBottom: '1px solid #1e3a5f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 100
      }}
      >
        <View style={{ display: 'flex', alignItems: 'center' }} onClick={() => Taro.navigateBack()}>
          <ChevronLeft size={24} color="#ffffff" />
        </View>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>新建知识</Text>
        <View
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: loading || uploading ? '#1e3a5f' : '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onClick={handleSave}
        >
          <Save size={16} color={loading || uploading ? '#71717a' : '#0a0f1a'} />
          <Text style={{ fontSize: '14px', fontWeight: '500', color: loading || uploading ? '#71717a' : '#0a0f1a' }}>
            {loading ? '保存中' : '保存'}
          </Text>
        </View>
      </View>

      {/* 表单内容 */}
      <ScrollView scrollY style={{ marginTop: '48px', height: 'calc(100vh - 148px)' }}>
        <View style={{ padding: '20px' }}>
          {/* 标题输入 */}
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>标题 *</Text>
            <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
              <Input
                style={{ width: '100%', backgroundColor: 'transparent', color: '#ffffff', fontSize: '15px' }}
                placeholder="请输入知识标题"
                placeholderStyle="color: #64748b"
                value={title}
                maxlength={100}
                onInput={(e) => setTitle(e.detail.value)}
              />
            </View>
            <Text style={{ fontSize: '12px', color: '#64748b', textAlign: 'right', display: 'block', marginTop: '8px' }}>{title.length}/100</Text>
          </View>

          {/* 分类选择 */}
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>分类</Text>
            <View
              style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={16} color="#71717a" />
                <Text style={{ fontSize: '15px', color: category ? '#ffffff' : '#64748b' }}>{selectedCategoryName}</Text>
              </View>
            </View>

            {/* 分类选项 */}
            {showCategoryPicker && (
              <View style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryOptions.map((cat) => (
                  <View
                    key={cat.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: category === cat.id ? 'rgba(245, 158, 11, 0.2)' : '#0a0f1a',
                      border: category === cat.id ? '1px solid #38bdf8' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onClick={() => { setCategory(cat.id); setShowCategoryPicker(false); }}
                  >
                    <Text style={{ fontSize: '14px', color: category === cat.id ? '#38bdf8' : '#94a3b8' }}>{cat.name}</Text>
                    {category === cat.id && <Text style={{ color: '#38bdf8' }}>✓</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 标签输入 */}
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} color="#38bdf8" />
                <Text style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>标签</Text>
              </View>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>最多5个</Text>
            </View>

            {/* 已添加的标签 */}
            {tags.length > 0 && (
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Text style={{ fontSize: '13px', color: '#38bdf8' }}>{tag}</Text>
                    <View onClick={() => handleRemoveTag(index)}>
                      <X size={14} color="#38bdf8" />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 标签输入框 */}
            <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Input
                style={{ flex: 1, backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px' }}
                placeholder="输入标签"
                placeholderStyle="color: #64748b"
                value={tagInput}
                maxlength={20}
                onInput={(e) => setTagInput(e.detail.value)}
              />
              <View
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: tagInput.trim() ? '#38bdf8' : '#1e3a5f'
                }}
                onClick={handleAddTag}
              >
                <Text style={{ fontSize: '13px', color: tagInput.trim() ? '#0a0f1a' : '#71717a' }}>添加</Text>
              </View>
            </View>
          </View>

          {/* 附件上传 */}
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={14} color="#60a5fa" />
                <Text style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>附件</Text>
              </View>
              <Text style={{ fontSize: '12px', color: '#64748b' }}>{attachments.length}/20</Text>
            </View>

            {/* 上传按钮 */}
            <View style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <View
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: uploading ? '#1e3a5f' : 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={handleChooseImage}
              >
                <ImageIcon size={16} color="#60a5fa" />
                <Text style={{ fontSize: '13px', color: '#60a5fa' }}>图片</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: uploading ? '#1e3a5f' : 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={handleChooseFile}
              >
                <FileText size={16} color="#4ade80" />
                <Text style={{ fontSize: '13px', color: '#4ade80' }}>文件</Text>
              </View>
              {isWeapp && (
                <View
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                    border: isRecording ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onClick={isRecording ? handleStopRecord : handleStartRecord}
                >
                  <Mic size={16} color={isRecording ? '#f87171' : '#a855f7'} />
                  <Text style={{ fontSize: '13px', color: isRecording ? '#f87171' : '#a855f7' }}>
                    {isRecording ? formatRecordingTime(recordingTime) : '录音'}
                  </Text>
                </View>
              )}
            </View>

            {/* 录音预览 */}
            {audioPath && (
              <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mic size={16} color="#a855f7" />
                    <Text style={{ fontSize: '13px', color: '#a855f7' }}>录音已就绪</Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <View
                      style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#a855f7' }}
                      onClick={handleUploadAudio}
                    >
                      <Text style={{ fontSize: '12px', color: '#ffffff' }}>上传</Text>
                    </View>
                    <View onClick={handleRemoveAudio}>
                      <Trash2 size={16} color="#71717a" />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 附件列表 */}
            {attachments.length > 0 && (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attachments.map((attachment, index) => (
                  <View
                    key={index}
                    style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <View style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: attachment.fileType === 'image' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    >
                      {attachment.fileType === 'image' ? (
                        <ImageIcon size={18} color="#60a5fa" />
                      ) : attachment.fileType === 'audio' ? (
                        <Mic size={18} color="#a855f7" />
                      ) : (
                        <FileText size={18} color="#4ade80" />
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: '13px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {attachment.fileName}
                      </Text>
                      <Text style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                        {formatFileSize(attachment.fileSize)}
                      </Text>
                    </View>
                    <View onClick={() => handleRemoveAttachment(index)}>
                      <Trash2 size={16} color="#71717a" />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 提示文本 */}
            {attachments.length === 0 && !audioPath && !isRecording && (
              <View style={{ padding: '16px', textAlign: 'center' }}>
                <Text style={{ fontSize: '12px', color: '#64748b' }}>支持上传图片、文档，小程序支持录音</Text>
              </View>
            )}
          </View>

          {/* 内容输入 */}
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <Text style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>内容 *</Text>
            <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '12px' }}>
              <Textarea
                style={{ width: '100%', minHeight: '200px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '14px', lineHeight: '22px' }}
                placeholder="请详细描述您的知识内容..."
                placeholderStyle="color: #64748b"
                value={content}
                maxlength={5000}
                onInput={(e) => setContent(e.detail.value)}
              />
            </View>
            <Text style={{ fontSize: '12px', color: '#64748b', textAlign: 'right', display: 'block', marginTop: '8px' }}>{content.length}/5000</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111827',
        borderTop: '1px solid #1e3a5f',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}
      >
        <View
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#1e3a5f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => Taro.navigateBack()}
        >
          <Text style={{ fontSize: '15px', color: '#94a3b8' }}>取消</Text>
        </View>
        <View
          style={{
            flex: 2,
            height: '44px',
            borderRadius: '12px',
            backgroundColor: loading || uploading ? '#1e3a5f' : '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={handleSave}
        >
          <Save size={18} color={loading || uploading ? '#71717a' : '#0a0f1a'} />
          <Text style={{ fontSize: '15px', fontWeight: '600', color: loading || uploading ? '#71717a' : '#0a0f1a' }}>
            {loading ? '保存中...' : uploading ? '上传中...' : '发布知识'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default KnowledgeShareCreatePage;
