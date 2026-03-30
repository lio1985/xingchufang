import { useState, useEffect } from 'react';
import { View, Text, ScrollView, RichText } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import {
  Clock,
  BookOpen,
  Award,
  FileText,
  Image,
  File,
  Presentation,
  Video,
  Play,
  Check,
  Heart,
  Download,
  MessageCircle,
  Calendar,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Course {
  id: string;
  title: string;
  description?: string;
  content?: string;
  content_type: 'text' | 'image_text' | 'pdf' | 'ppt' | 'video' | 'other';
  cover_image?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  view_count: number;
  completion_count: number;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  category?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    nickname: string;
    avatar_url?: string;
  };
  created_at: string;
  learning?: {
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
    time_spent: number;
    last_position?: number;
  };
}

export default function CourseDetailPage() {
  const router = useRouter();
  const courseId = router.params.id;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const loadCourseDetail = async () => {
    if (!courseId) {
      Taro.showToast({ title: '课程ID不存在', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const res = await Network.request({
        url: `/api/course/${courseId}`,
        method: 'GET',
      });

      if (res.data?.data) {
        setCourse(res.data.data);
      }
    } catch (error) {
      console.error('加载课程详情失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleStartLearning = async () => {
    if (!course) return;

    setUpdatingProgress(true);
    try {
      // 更新学习状态为进行中
      await Network.request({
        url: `/api/course/${course.id}/learning`,
        method: 'POST',
        data: {
          status: 'in_progress',
          progress: course.learning?.progress || 5,
        },
      });

      // 重新加载课程信息
      await loadCourseDetail();

      Taro.showToast({ title: '开始学习', icon: 'success' });
    } catch (error) {
      console.error('更新学习状态失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleCompleteCourse = async () => {
    if (!course) return;

    setUpdatingProgress(true);
    try {
      await Network.request({
        url: `/api/course/${course.id}/learning`,
        method: 'POST',
        data: {
          status: 'completed',
          progress: 100,
        },
      });

      await loadCourseDetail();
      Taro.showToast({ title: '恭喜完成学习！', icon: 'success' });
    } catch (error) {
      console.error('更新学习状态失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!course) return;

    try {
      const res = await Network.request({
        url: `/api/course/${course.id}/favorite`,
        method: 'POST',
      });

      if (res.data?.data) {
        setIsFavorite(res.data.data.isFavorite);
        Taro.showToast({
          title: res.data.data.isFavorite ? '已收藏' : '已取消收藏',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return FileText;
      case 'image_text': return Image;
      case 'pdf': return File;
      case 'ppt': return Presentation;
      case 'video': return Video;
      default: return FileText;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const map: Record<string, string> = {
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级',
    };
    return map[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    const map: Record<string, string> = {
      beginner: '#4ade80',
      intermediate: '#f59e0b',
      advanced: '#f87171',
    };
    return map[difficulty] || '#71717a';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#64748b' }}>加载中...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#64748b' }}>课程不存在</Text>
      </View>
    );
  }

  const TypeIcon = getContentTypeIcon(course.content_type);
  const progress = course.learning?.progress || 0;
  const isCompleted = course.learning?.status === 'completed';
  const isInProgress = course.learning?.status === 'in_progress';

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* 封面区域 */}
      <View style={{ position: 'relative', height: '200px', backgroundColor: '#1e293b' }}>
        {course.cover_image ? (
          <img src={course.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        ) : (
          <View style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TypeIcon size={64} color="#64748b" />
          </View>
        )}
        {/* 遮罩层 */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))',
          }}
        />
        {/* 返回按钮 */}
        
        {/* 标题 */}
        <View style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', marginBottom: '8px' }}>
            {course.title}
          </Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: `${getDifficultyColor(course.difficulty)}30`,
              }}
            >
              <Text style={{ fontSize: '12px', color: getDifficultyColor(course.difficulty) }}>
                {getDifficultyLabel(course.difficulty)}
              </Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} color="#94a3b8" />
              <Text style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDuration(course.duration)}</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageCircle size={14} color="#94a3b8" />
              <Text style={{ fontSize: '12px', color: '#94a3b8' }}>{course.view_count}人学习</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 300px)' }}>
        <View style={{ padding: '16px' }}>
          {/* 学习进度 */}
          {(isInProgress || isCompleted) && (
            <View
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>学习进度</Text>
                <Text style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>{progress}%</Text>
              </View>
              <View
                style={{
                  height: '8px',
                  backgroundColor: '#1e3a5f',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: isCompleted ? '#4ade80' : '#ef4444',
                    borderRadius: '4px',
                  }}
                />
              </View>
              {isCompleted && (
                <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                  <Check size={16} color="#4ade80" />
                  <Text style={{ fontSize: '13px', color: '#4ade80' }}>已完成学习</Text>
                </View>
              )}
            </View>
          )}

          {/* 课程简介 */}
          {course.description && (
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>课程简介</Text>
              <Text style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '24px' }}>{course.description}</Text>
            </View>
          )}

          {/* 课程信息 */}
          <View
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>课程信息</Text>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="#64748b" />
                <View>
                  <Text style={{ fontSize: '11px', color: '#64748b' }}>分类</Text>
                  <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{course.category?.name || '未分类'}</Text>
                </View>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#64748b" />
                <View>
                  <Text style={{ fontSize: '11px', color: '#64748b' }}>难度</Text>
                  <Text style={{ fontSize: '13px', color: getDifficultyColor(course.difficulty) }}>
                    {getDifficultyLabel(course.difficulty)}
                  </Text>
                </View>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#64748b" />
                <View>
                  <Text style={{ fontSize: '11px', color: '#64748b' }}>时长</Text>
                  <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{formatDuration(course.duration)}</Text>
                </View>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#64748b" />
                <View>
                  <Text style={{ fontSize: '11px', color: '#64748b' }}>更新时间</Text>
                  <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{formatDate(course.created_at)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 标签 */}
          {course.tags && course.tags.length > 0 && (
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>标签</Text>
              <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {course.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      borderRadius: '16px',
                    }}
                  >
                    <Text style={{ fontSize: '12px', color: '#ef4444' }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 课程内容（文字/图文） */}
          {(course.content_type === 'text' || course.content_type === 'image_text') && course.content && (
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>课程内容</Text>
              <View
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <RichText
                  nodes={course.content}
                  style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '24px' }}
                />
              </View>
            </View>
          )}

          {/* 文件资源（PDF/PPT等） */}
          {course.file_url && course.content_type !== 'text' && course.content_type !== 'image_text' && (
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>课程资源</Text>
              <View
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <View
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TypeIcon size={24} color="#ef4444" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#f1f5f9',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {course.file_name || '课程文件'}
                  </Text>
                  {course.file_size && (
                    <Text style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {formatFileSize(course.file_size)}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={async () => {
                    if (course.file_url) {
                      try {
                        const res = await Network.downloadFile({
                          url: course.file_url,
                        });
                        if (res.statusCode === 200 && res.tempFilePath) {
                          Taro.openDocument({
                            filePath: res.tempFilePath,
                            fail: () => {
                              Taro.showToast({ title: '打开文件失败', icon: 'none' });
                            },
                          });
                        }
                      } catch {
                        Taro.showToast({ title: '下载失败', icon: 'none' });
                      }
                    }
                  }}
                >
                  <Download size={18} color="#ef4444" />
                </View>
              </View>
            </View>
          )}

          {/* 作者信息 */}
          {course.creator && (
            <View
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <View
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  backgroundColor: '#1e293b',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {course.creator.avatar_url ? (
                  <img src={course.creator.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : (
                  <Text style={{ fontSize: '16px', color: '#64748b' }}>
                    {(course.creator.nickname || '用户').charAt(0)}
                  </Text>
                )}
              </View>
              <View>
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>{course.creator.nickname || '未知作者'}</Text>
                <Text style={{ fontSize: '12px', color: '#64748b' }}>课程发布者</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          backgroundColor: '#111827',
          borderTop: '1px solid #1e3a5f',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* 收藏按钮 */}
        <View
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: isFavorite ? 'rgba(239, 68, 68, 0.15)' : '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleToggleFavorite}
        >
          <Heart size={20} color={isFavorite ? '#ef4444' : '#64748b'} />
        </View>

        {/* 主操作按钮 */}
        {isCompleted ? (
          <View
            style={{
              flex: 1,
              height: '44px',
              backgroundColor: '#4ade80',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Check size={18} color="#ffffff" />
            <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>已完成学习</Text>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              height: '44px',
              backgroundColor: '#ef4444',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: updatingProgress ? '0.6' : '1',
            }}
            onClick={() => {
              if (isInProgress) {
                handleCompleteCourse();
              } else {
                handleStartLearning();
              }
            }}
          >
            <Play size={18} color="#ffffff" />
            <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>
              {isInProgress ? '完成学习' : '开始学习'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
