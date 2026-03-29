import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Upload,
  Image as ImageIcon,
  Music,
  Video,
  FileText,
  Trash2,
  Mic,
  RefreshCw,
  ChevronRight,
  Calendar,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface MultimediaResource {
  id: string;
  userId: string;
  type: 'image' | 'audio' | 'video' | 'document';
  fileKey: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  duration?: number;
  transcript?: string;
  createdAt: string;
  url?: string;
}

const TYPE_CONFIG = {
  image: { label: '图片', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.15)' },
  audio: { label: '音频', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.15)' },
  video: { label: '视频', color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.15)' },
  document: { label: '文档', color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.15)' },
};

export default function MultimediaPage() {
  const [resources, setResources] = useState<MultimediaResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'audio' | 'video' | 'document'>('all');
  const [selectedResource, setSelectedResource] = useState<MultimediaResource | null>(null);

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/multimedia/list',
        method: 'GET',
      });

      console.log('[Multimedia] 加载资源响应:', res);

      if (res.data?.code === 200) {
        let data = res.data.data?.resources || [];
        
        if (activeTab !== 'all') {
          data = data.filter((item: MultimediaResource) => item.type === activeTab);
        }
        
        setResources(data);
      }
    } catch (error) {
      console.error('[Multimedia] 加载资源失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image', 'video'],
        sourceType: ['album', 'camera'],
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0];
        await uploadFile(file.tempFilePath, file.fileType || 'image');
      }
    } catch (err: any) {
      // 尝试选择普通文件
      try {
        const fileRes = await Taro.chooseMessageFile({
          count: 1,
          type: 'file',
        });
        
        if (fileRes.tempFiles && fileRes.tempFiles.length > 0) {
          const file = fileRes.tempFiles[0];
          await uploadFile(file.path, 'document');
        }
      } catch (fileErr: any) {
        if (!fileErr.errMsg?.includes('cancel')) {
          console.error('选择文件失败:', fileErr);
        }
      }
    }
  };

  const uploadFile = async (filePath: string, fileType: string) => {
    setUploading(true);
    try {
      console.log('[Multimedia] 开始上传文件:', filePath);

      const uploadRes = await Network.uploadFile({
        url: '/api/multimedia/upload',
        filePath: filePath,
        name: 'file',
        formData: {
          transcribeAudio: fileType === 'audio' ? 'true' : 'false',
        },
      });

      console.log('[Multimedia] 上传响应:', uploadRes);

      if (uploadRes.statusCode === 200) {
        const data = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data;
        
        if (data.code === 200) {
          Taro.showToast({ title: '上传成功', icon: 'success' });
          loadResources();
        } else {
          Taro.showToast({ title: data.msg || '上传失败', icon: 'none' });
        }
      }
    } catch (err: any) {
      console.error('[Multimedia] 上传失败:', err);
      Taro.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resource: MultimediaResource) => {
    try {
      const confirm = await Taro.showModal({
        title: '确认删除',
        content: `确定要删除 "${resource.originalFilename}" 吗？`,
      });

      if (confirm.confirm) {
        const res = await Network.request({
          url: `/api/multimedia/${resource.id}`,
          method: 'DELETE',
        });

        if (res.data?.code === 200) {
          Taro.showToast({ title: '已删除', icon: 'success' });
          loadResources();
          setSelectedResource(null);
        }
      }
    } catch (error) {
      console.error('[Multimedia] 删除失败:', error);
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'audio': return Music;
      case 'video': return Video;
      default: return FileText;
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'image', label: '图片' },
    { key: 'audio', label: '音频' },
    { key: 'video', label: '视频' },
    { key: 'document', label: '文档' },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 顶部导航 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: '#111827',
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft:  16,
        zIndex: 100,
      }}
      >
        
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#f1f5f9' }}>
          多媒体管理
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab 栏 */}
      <View style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        backgroundColor: '#111827',
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        zIndex: 99,
      }}
      >
        <ScrollView scrollX style={{ paddingLeft:  8 }}>
          <View style={{ flexDirection: 'row', paddingTop:  12, gap: 8 }}>
            {tabs.map(tab => (
              <View
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  paddingLeft:  16,
                  paddingTop:  8,
                  borderRadius: 20,
                  backgroundColor: activeTab === tab.key ? '#38bdf8' : 'transparent',
                  borderWidth: 1,
                  borderColor: activeTab === tab.key ? '#38bdf8' : '#334155',
                }}
              >
                <Text style={{
                  color: activeTab === tab.key ? '#0c4a6e' : '#94a3b8',
                  fontSize: 14,
                  fontWeight: '500',
                }}
                >
                  {tab.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 主内容区 */}
      <ScrollView
        scrollY
        style={{ marginTop: 112, padding: 16, paddingBottom: 120 }}
      >
        {/* 上传区域 */}
        <View
          onClick={handleUpload}
          style={{
            backgroundColor: uploading ? '#1e3a5f' : 'rgba(56, 189, 248, 0.1)',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            marginBottom: 16,
            borderWidth: 2,
            borderColor: uploading ? '#334155' : '#38bdf8',
            borderStyle: 'dashed',
          }}
        >
          {uploading ? (
            <RefreshCw size={28} color="#38bdf8" />
          ) : (
            <Upload size={28} color="#38bdf8" />
          )}
          <Text style={{ color: '#f1f5f9', fontSize: 15, marginTop: 10, fontWeight: '500' }}>
            {uploading ? '上传中...' : '上传文件'}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
            支持图片、音频、视频和文档
          </Text>
        </View>

        {/* 资源列表 */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop:  40 }}>
            <RefreshCw size={24} color="#38bdf8" />
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>加载中...</Text>
          </View>
        ) : resources.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop:  60 }}>
            <ImageIcon size={48} color="#334155" />
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16 }}>暂无资源</Text>
            <Text style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>点击上方上传文件</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {resources.map(item => {
              const TypeIcon = getTypeIcon(item.type);
              const typeConfig = TYPE_CONFIG[item.type];
              
              return (
                <View
                  key={item.id}
                  onClick={() => setSelectedResource(item)}
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#1e3a5f',
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                    {/* 缩略图/图标 */}
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      backgroundColor: typeConfig.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                    >
                      {item.type === 'image' && item.url ? (
                        <Image
                          src={item.url}
                          mode="aspectFill"
                          style={{ width: 56, height: 56 }}
                        />
                      ) : (
                        <TypeIcon size={24} color={typeConfig.color} />
                      )}
                    </View>
                    
                    {/* 文件信息 */}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: '#f1f5f9', fontSize: 15, fontWeight: '500' }} numberOfLines={1}>
                        {item.originalFilename}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View style={{
                          paddingLeft:  8,
                          paddingTop:  2,
                          borderRadius: 4,
                          backgroundColor: typeConfig.bgColor,
                        }}
                        >
                          <Text style={{ color: typeConfig.color, fontSize: 11 }}>
                            {typeConfig.label}
                          </Text>
                        </View>
                        <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>
                          {formatFileSize(item.fileSize)}
                        </Text>
                      </View>
                    </View>
                    
                    <ChevronRight size={18} color="#64748b" />
                  </View>
                  
                  {/* 音频转录文本 */}
                  {item.type === 'audio' && item.transcript && (
                    <View style={{
                      paddingLeft:  16,
                      paddingBottom: 16,
                    }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                      >
                        <Mic size={14} color="#fbbf24" />
                        <Text style={{ color: '#fbbf24', fontSize: 12, marginLeft: 6 }}>
                          语音转文字
                        </Text>
                      </View>
                      <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 20 }} numberOfLines={2}>
                        {item.transcript}
                      </Text>
                    </View>
                  )}
                  
                  {/* 时间 */}
                  <View style={{
                    paddingLeft:  16,
                    paddingBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  >
                    <Calendar size={14} color="#64748b" />
                    <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 6 }}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 详情弹窗 */}
      {selectedResource && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 200,
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedResource(null)}
        >
          <View
            style={{
              backgroundColor: '#111827',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 48,
            }}
            onClick={e => e.stopPropagation()}
          >
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2 }} />
            </View>
            
            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
              {selectedResource.originalFilename}
            </Text>
            
            <View style={{ gap: 12 }}>
              <View
                onClick={() => {
                  if (selectedResource.url) {
                    Taro.previewImage({ urls: [selectedResource.url] });
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#1e3a5f',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <ImageIcon size={20} color="#38bdf8" />
                <Text style={{ color: '#38bdf8', fontSize: 15, marginLeft: 12 }}>查看文件</Text>
              </View>
              
              <View
                onClick={() => handleDelete(selectedResource)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(248, 113, 113, 0.15)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Trash2 size={20} color="#f87171" />
                <Text style={{ color: '#f87171', fontSize: 15, marginLeft: 12 }}>删除文件</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
