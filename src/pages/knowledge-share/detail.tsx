import { View, Text, ScrollView, Image, Audio } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Eye, ThumbsUp, Clock, Trash2, Pencil, Mic, FileText, Download, Star } from 'lucide-react-taro';
import { Network } from '@/network';

interface Attachment {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
}

interface KnowledgeDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorAvatar?: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  tags?: string[];
  attachments?: Attachment[];
  isLiked?: boolean;
  userId?: string;
  isFeatured?: boolean;
}

const KnowledgeShareDetailPage = () => {
  const router = useRouter();
  const [detail, setDetail] = useState<KnowledgeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const id = router.params.id;
    const isAdminParam = router.params.isAdmin === 'true';
    if (!id) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      Taro.navigateBack();
      return;
    }

    setIsAdmin(isAdminParam);
    loadDetail(id);

    const user = Taro.getStorageSync('user');
    if (user) {
      setUserId(user.id);
    }
  }, [router.params]);

  const loadDetail = async (id: string) => {
    try {
      setLoading(true);

      const res = await Network.request({
        url: `/api/knowledge-shares/${id}`,
        method: 'GET'
      });

      if (res.data?.code === 200) {
        setDetail(res.data.data);
      } else {
        Taro.showToast({
          title: res.data?.msg || '加载失败',
          icon: 'none'
        });
        Taro.navigateBack();
      }
    } catch (error) {
      console.error('加载详情失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
      Taro.navigateBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!detail) return;

    try {
      const res = await Network.request({
        url: `/api/knowledge-shares/${detail.id}/like`,
        method: 'POST'
      });

      if (res.data?.code === 200) {
        setDetail({
          ...detail,
          likeCount: detail.isLiked ? detail.likeCount - 1 : detail.likeCount + 1,
          isLiked: !detail.isLiked
        });
        Taro.showToast({
          title: detail.isLiked ? '取消点赞' : '点赞成功',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('点赞失败:', error);
      Taro.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  };

  const handleEdit = () => {
    if (!detail) return;
    Taro.navigateTo({
      url: `/pages/knowledge-share/edit?id=${detail.id}`
    });
  };

  const handleDelete = () => {
    if (!detail) return;

    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条知识分享吗？',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          try {
            const deleteUrl = isAdmin
              ? `/api/admin/knowledge-shares/${detail.id}`
              : `/api/knowledge-shares/${detail.id}`;

            const res = await Network.request({
              url: deleteUrl,
              method: 'DELETE'
            });

            if (res.data?.code === 200) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success',
                success: () => {
                  setTimeout(() => {
                    if (isAdmin) {
                      // 管理员模式返回管理页面
                      Taro.navigateBack();
                    } else {
                      Taro.navigateBack();
                    }
                  }, 1500);
                }
              });
            } else {
              Taro.showToast({
                title: res.data?.msg || '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('删除失败:', error);
            Taro.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  };

  const handleFeature = async () => {
    if (!detail || !isAdmin) return;

    Taro.showModal({
      title: detail.isFeatured ? '取消置顶' : '置顶',
      content: `确定要${detail.isFeatured ? '取消置顶' : '置顶'}这条知识分享吗？`,
      success: async (modalRes) => {
        if (modalRes.confirm) {
          try {
            const res = await Network.request({
              url: `/api/admin/knowledge-shares/${detail.id}/feature`,
              method: 'POST',
              data: { isFeatured: !detail.isFeatured }
            });

            if (res.data?.code === 200) {
              Taro.showToast({
                title: '操作成功',
                icon: 'success'
              });
              setDetail({
                ...detail,
                isFeatured: !detail.isFeatured
              });
            } else {
              Taro.showToast({
                title: res.data?.msg || '操作失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('操作失败:', error);
            Taro.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownloadFile = async (attachment: Attachment) => {
    try {
      Taro.showLoading({ title: '下载中...', mask: true });

      // 先获取最新的预签名 URL
      const urlRes = await Network.request({
        url: '/api/knowledge-shares/file-url',
        method: 'POST',
        data: { fileKey: attachment.fileKey }
      });

      if (urlRes.data?.code === 200 && urlRes.data.data) {
        const downloadUrl = urlRes.data.data.fileUrl;

        if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
          // 小程序端：使用 downloadFile
          const downloadRes = await Network.downloadFile({
            url: downloadUrl,
          });

          if (downloadRes.statusCode === 200) {
            await Taro.openDocument({
              filePath: downloadRes.tempFilePath,
              showMenu: true,
            });
          } else {
            Taro.showToast({
              title: '文件下载失败',
              icon: 'none'
            });
          }
        } else {
          // H5 端：直接打开
          window.open(downloadUrl, '_blank');
        }

        Taro.hideLoading();
      } else {
        Taro.hideLoading();
        Taro.showToast({
          title: '获取下载链接失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('下载失败:', error);
      Taro.hideLoading();
      Taro.showToast({
        title: '下载失败',
        icon: 'none'
      });
    }
  };

  const handlePreviewImage = (current: string, urls: string[]) => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      Taro.previewImage({
        current,
        urls,
      });
    } else {
      // H5 端：新窗口打开
      window.open(current, '_blank');
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (loading) {
    return (
      <View className="min-h-screen bg-sky-50 flex items-center justify-center">
        <Text className="block text-slate-500">加载中...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View className="min-h-screen bg-sky-50 flex items-center justify-center">
        <Text className="block text-slate-500">内容不存在</Text>
      </View>
    );
  }

  const isOwner = detail.userId === userId;

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
          <Text className="block text-lg font-bold text-white">知识分享</Text>
        </View>
        {(isOwner || isAdmin) && (
          <View className="flex items-center gap-2">
            {isOwner && (
              <View
                className="p-2 rounded-lg active:bg-white"
                onClick={handleEdit}
              >
                <Pencil size={20} color="#94a3b8" />
              </View>
            )}
            {isAdmin && (
              <View
                className="p-2 rounded-lg active:bg-white"
                onClick={handleFeature}
              >
                <Star
                  size={20}
                  color={detail?.isFeatured ? '#fbbf24' : '#94a3b8'}
                />
              </View>
            )}
            <View
              className="p-2 rounded-lg active:bg-white"
              onClick={handleDelete}
            >
              <Trash2 size={20} color="#ef4444" />
            </View>
          </View>
        )}
      </View>

      {/* 内容区 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4">
          {/* 标题 */}
          <Text className="block text-2xl font-bold text-white mb-4">
            {detail.title}
          </Text>

          {/* 作者信息 */}
          <View className="flex items-center gap-3 mb-4">
            <View className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Text className="block text-lg font-bold text-white">
                {detail.author.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="block text-base font-semibold text-white">
                {detail.author}
              </Text>
              <View className="flex items-center gap-1">
                <Clock size={12} color="#94a3b8" />
                <Text className="block text-xs text-slate-500">
                  {formatTime(detail.createdAt)}
                </Text>
              </View>
            </View>
            <View className="flex items-center gap-1">
              <Eye size={16} color="#94a3b8" />
              <Text className="block text-sm text-slate-500">
                {detail.viewCount}
              </Text>
            </View>
          </View>

          {/* 分类 */}
          <View className="mb-4">
            <View className="inline-block px-3 py-1 bg-sky-500/20 border border-sky-500/30 rounded-lg">
              <Text className="block text-sm text-blue-300">
                {detail.category || '其他'}
              </Text>
            </View>
          </View>

          {/* 标签 */}
          {detail.tags && detail.tags.length > 0 && (
            <View className="flex flex-wrap gap-2 mb-6">
              {detail.tags.map((tag, index) => (
                <View
                  key={index}
                  className="bg-slate-50 px-3 py-1.5 rounded-lg"
                >
                  <Text className="block text-sm text-slate-600">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 内容 */}
          <View className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
            <Text className="block text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
              {detail.content}
            </Text>
          </View>

          {/* 附件区域 */}
          {detail.attachments && detail.attachments.length > 0 && (
            <View className="mb-6">
              <Text className="block text-sm font-semibold text-white mb-3">
                附件 ({detail.attachments.length})
              </Text>
              <View className="space-y-3">
                {detail.attachments.map((attachment, index) => (
                  <View
                    key={index}
                    className="bg-white rounded-xl border border-slate-200 p-4"
                  >
                    {attachment.fileType === 'image' ? (
                      <View
                        className="cursor-pointer"
                        onClick={() => {
                          const imageUrls = detail.attachments
                            ?.filter(a => a.fileType === 'image')
                            .map(a => a.fileUrl) || [];
                          handlePreviewImage(attachment.fileUrl, imageUrls);
                        }}
                      >
                        <Image
                          src={attachment.fileUrl}
                          className="w-full rounded-lg"
                          mode="widthFix"
                        />
                        <View className="mt-2 flex items-center justify-between">
                          <Text className="block text-sm text-slate-600 truncate flex-1 mr-2">
                            {attachment.fileName}
                          </Text>
                          <Text className="block text-xs text-slate-500">
                            {formatFileSize(attachment.fileSize)}
                          </Text>
                        </View>
                      </View>
                    ) : attachment.fileType === 'audio' ? (
                      <View className="flex items-center gap-3">
                        <View className="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center">
                          <Mic size={24} color="#60a5fa" />
                        </View>
                        <View className="flex-1">
                          <Text className="block text-sm text-white truncate mb-1">
                            {attachment.fileName}
                          </Text>
                          <Text className="block text-xs text-slate-500">
                            {formatFileSize(attachment.fileSize)}
                          </Text>
                        </View>
                        <View className="flex items-center gap-2">
                          {Taro.getEnv() === Taro.ENV_TYPE.WEAPP && (
                            <Audio
                              src={attachment.fileUrl}
                              className="w-32"
                              controls
                            />
                          )}
                          <View
                            className="p-2 rounded-lg bg-white"
                            onClick={() => handleDownloadFile(attachment)}
                          >
                            <Download size={18} color="#94a3b8" />
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View className="flex items-center gap-3">
                        <View className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                          <FileText size={24} color="#94a3b8" />
                        </View>
                        <View className="flex-1 min-w-0">
                          <Text className="block text-sm text-white truncate mb-1">
                            {attachment.fileName}
                          </Text>
                          <Text className="block text-xs text-slate-500">
                            {formatFileSize(attachment.fileSize)}
                          </Text>
                        </View>
                        <View
                          className="p-2 rounded-lg bg-white"
                          onClick={() => handleDownloadFile(attachment)}
                        >
                          <Download size={18} color="#94a3b8" />
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 底部操作栏 */}
          <View className="flex items-center justify-center gap-6 py-4 border-t border-slate-200">
            <View
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                detail.isLiked ? 'bg-pink-500' : 'bg-white'
              }`}
              onClick={handleLike}
            >
              <ThumbsUp size={20} color="white" />
              <Text className="block text-base font-semibold text-white">
                {detail.likeCount}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default KnowledgeShareDetailPage;
