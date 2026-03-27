import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  GraduationCap,
  Search,
  Play,
  ChevronLeft,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  FileText,
  Image,
  File,
  Presentation,
  Video,
  MessageCircle,
  Flame,
  ChevronRight,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  content_type: 'text' | 'image_text' | 'pdf' | 'ppt' | 'video' | 'other';
  cover_image?: string;
  category?: Category;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  view_count: number;
  completion_count: number;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  learning?: {
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
    time_spent: number;
  };
}

interface LearningStats {
  totalCourses: number;
  userStats?: {
    completedCount: number;
    inProgressCount: number;
    totalTimeSpent: number;
  };
}

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState<'learning' | 'explore' | 'category'>('learning');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<LearningStats>({ totalCourses: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 并行加载课程分类和统计数据
      const [categoriesRes, statsRes, coursesRes] = await Promise.all([
        Network.request({ url: '/api/course/categories', method: 'GET' }),
        Network.request({ url: '/api/course/stats/overview', method: 'GET' }),
        Network.request({ url: '/api/course', method: 'GET', data: { limit: 20, status: 'published' } }),
      ]);

      if (categoriesRes.data?.data) {
        setCategories(categoriesRes.data.data);
      }

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }

      if (coursesRes.data?.data?.list) {
        setCourses(coursesRes.data.data.list);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 按分类筛选课程
  const filteredCourses = selectedCategory
    ? courses.filter(c => c.category?.id === selectedCategory)
    : courses;

  // 正在学习的课程
  const ongoingCourses = courses.filter(c => c.learning?.status === 'in_progress');

  // 已完成的课程
  const completedCourses = courses.filter(c => c.learning?.status === 'completed');

  const handleCourseClick = (course: Course) => {
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${course.id}` });
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

  const renderCourseCard = (course: Course, showProgress = true) => {
    const TypeIcon = getContentTypeIcon(course.content_type);
    const progress = course.learning?.progress || 0;
    
    return (
      <View
        key={course.id}
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        {/* 封面区域 */}
        {course.cover_image ? (
          <View style={{ height: '120px', overflow: 'hidden' }}>
            <img src={course.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          </View>
        ) : (
          <View style={{ height: '80px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TypeIcon size={32} color="#64748b" />
          </View>
        )}
        
        <View style={{ padding: '16px' }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', flex: 1 }}>
              {course.title}
            </Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <View
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: `${getDifficultyColor(course.difficulty)}20`,
                }}
              >
                <Text style={{ fontSize: '11px', color: getDifficultyColor(course.difficulty) }}>
                  {getDifficultyLabel(course.difficulty)}
                </Text>
              </View>
            </View>
          </View>

          {course.description && (
            <Text
              style={{
                fontSize: '13px',
                color: '#64748b',
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {course.description}
            </Text>
          )}

          {showProgress && progress > 0 && (
            <View style={{ marginBottom: '12px' }}>
              <View
                style={{
                  height: '6px',
                  backgroundColor: '#1e3a5f',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#ef4444',
                    borderRadius: '3px',
                  }}
                />
              </View>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <Text style={{ fontSize: '12px', color: '#64748b' }}>学习进度</Text>
                <Text style={{ fontSize: '12px', color: '#ef4444' }}>{progress}%</Text>
              </View>
            </View>
          )}

          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#71717a" />
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{formatDuration(course.duration)}</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageCircle size={14} color="#71717a" />
                <Text style={{ fontSize: '12px', color: '#71717a' }}>{course.view_count}人学习</Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                borderRadius: '6px',
              }}
              onClick={() => handleCourseClick(course)}
            >
              <Play size={14} color="#ffffff" />
              <Text style={{ fontSize: '13px', color: '#ffffff' }}>
                {progress > 0 ? '继续学习' : '开始学习'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        {/* 返回按钮和标题 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <View
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={20} color="#ef4444" />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={24} color="#ef4444" />
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>课程培训</Text>
          </View>
        </View>

        {/* 学习统计 */}
        <View
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <View style={{ textAlign: 'center' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
              <Flame size={14} color="#f59e0b" />
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>5</Text>
            </View>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>连续学习</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>
              {stats.userStats?.totalTimeSpent || 0}
            </Text>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>今日(分钟)</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#4ade80' }}>
              {stats.userStats?.completedCount || 0}
            </Text>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>已完成</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#a855f7' }}>{stats.totalCourses}</Text>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>全部课程</Text>
          </View>
        </View>

        {/* Tab 切换 */}
        <View style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'learning', label: '我的学习' },
            { key: 'explore', label: '推荐课程' },
            { key: 'category', label: '课程分类' },
          ].map(tab => (
            <View
              key={tab.key}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: activeTab === tab.key ? '#ef4444' : '#1e293b',
                textAlign: 'center',
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === tab.key ? '#ffffff' : '#94a3b8',
                }}
              >
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 260px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 我的学习 */}
          {activeTab === 'learning' && (
            <>
              {/* 继续学习 */}
              <View style={{ marginBottom: '20px' }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>继续学习</Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={14} color="#ef4444" />
                    <Text style={{ fontSize: '12px', color: '#ef4444' }}>本周 {stats.userStats?.totalTimeSpent || 0} 分钟</Text>
                  </View>
                </View>
                {ongoingCourses.length > 0 ? (
                  ongoingCourses.map(course => renderCourseCard(course, true))
                ) : (
                  <View style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '14px', color: '#64748b' }}>暂无学习中的课程</Text>
                    <View
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        borderRadius: '6px',
                        display: 'inline-flex',
                      }}
                      onClick={() => setActiveTab('explore')}
                    >
                      <Text style={{ fontSize: '13px', color: '#ffffff' }}>去探索课程</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* 已完成 */}
              {completedCourses.length > 0 && (
                <View style={{ marginBottom: '20px' }}>
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>已完成</Text>
                  {completedCourses.slice(0, 3).map(course => renderCourseCard(course, true))}
                </View>
              )}

              {/* 学习成就 */}
              <View
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Award size={20} color="#f59e0b" />
                  <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>学习成就</Text>
                </View>
                <View style={{ display: 'flex', gap: '16px' }}>
                  <View style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                    <Text style={{ fontSize: '24px', marginBottom: '4px' }}>🎯</Text>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>坚持学习</Text>
                    <Text style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>5天</Text>
                  </View>
                  <View style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                    <Text style={{ fontSize: '24px', marginBottom: '4px' }}>📚</Text>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>累计学习</Text>
                    <Text style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>
                      {Math.floor((stats.userStats?.totalTimeSpent || 0) / 60)}小时
                    </Text>
                  </View>
                  <View style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                    <Text style={{ fontSize: '24px', marginBottom: '4px' }}>🏆</Text>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>已完结</Text>
                    <Text style={{ fontSize: '14px', color: '#4ade80', fontWeight: '600' }}>
                      {stats.userStats?.completedCount || 0}门
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* 推荐课程 */}
          {activeTab === 'explore' && (
            <>
              {/* 搜索框 */}
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  border: '1px solid #1e3a5f',
                  marginBottom: '16px',
                }}
              >
                <Search size={18} color="#71717a" />
                <Input
                  style={{ flex: 1, fontSize: '14px', color: '#f1f5f9' }}
                  placeholder="搜索课程..."
                  placeholderStyle="color: #64748b"
                  value={searchKeyword}
                  onInput={e => setSearchKeyword(e.detail.value)}
                />
              </View>

              {/* 课程列表 */}
              {loading ? (
                <View style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Text style={{ fontSize: '14px', color: '#64748b' }}>加载中...</Text>
                </View>
              ) : filteredCourses.length > 0 ? (
                <>
                  <Text style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>全部课程</Text>
                  {filteredCourses.map(course => renderCourseCard(course, false))}
                </>
              ) : (
                <View style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Text style={{ fontSize: '14px', color: '#64748b' }}>暂无课程</Text>
                </View>
              )}
            </>
          )}

          {/* 课程分类 */}
          {activeTab === 'category' && (
            <>
              <Text style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>选择分类浏览课程</Text>
              <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {categories.map(category => {
                  const count = courses.filter(c => c.category?.id === category.id).length;
                  return (
                    <View
                      key={category.id}
                      style={{
                        backgroundColor: selectedCategory === category.id ? '#ef4444' : '#111827',
                        border: selectedCategory === category.id ? '1px solid #ef4444' : '1px solid #1e3a5f',
                        borderRadius: '12px',
                        padding: '20px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                      onClick={() => {
                        setSelectedCategory(selectedCategory === category.id ? '' : category.id);
                        setActiveTab('explore');
                      }}
                    >
                      <View
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : 'rgba(239, 68, 68, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BookOpen size={24} color={selectedCategory === category.id ? '#ffffff' : '#ef4444'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: '15px', fontWeight: '600', color: selectedCategory === category.id ? '#ffffff' : '#f1f5f9' }}>
                          {category.name}
                        </Text>
                        <Text style={{ fontSize: '12px', color: selectedCategory === category.id ? 'rgba(255,255,255,0.7)' : '#64748b', marginTop: '2px' }}>
                          {count} 门课程
                        </Text>
                      </View>
                      <ChevronRight size={16} color={selectedCategory === category.id ? '#ffffff' : '#64748b'} />
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NewsPage;
