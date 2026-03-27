import { useState } from 'react';
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
  Video,
  MessageCircle,
  Target,
  ChartBarBig,
  Star,
  ChevronRight,
  Flame,
} from 'lucide-react-taro';

interface Course {
  id: string;
  title: string;
  description?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  category: string;
  coverUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor?: string;
  rating?: number;
}

interface LearningStats {
  todayMinutes: number;
  weekMinutes: number;
  totalCourses: number;
  completedCourses: number;
  streak: number;
  totalMinutes: number;
}

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState<'learning' | 'explore' | 'category'>('learning');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [stats] = useState<LearningStats>({
    todayMinutes: 45,
    weekMinutes: 180,
    totalCourses: 8,
    completedCourses: 3,
    streak: 5,
    totalMinutes: 1260,
  });

  // 正在学习的课程
  const ongoingCourses: Course[] = [
    {
      id: '1',
      title: '内容创作入门指南',
      description: '掌握内容创作的核心技巧，从选题到发布的完整流程',
      progress: 60,
      totalLessons: 12,
      completedLessons: 7,
      duration: '2小时30分',
      category: '内容创作',
      difficulty: 'beginner',
      instructor: '张老师',
      rating: 4.8,
    },
    {
      id: '2',
      title: '客户沟通技巧',
      description: '提升与客户沟通的能力，建立良好的客户关系',
      progress: 30,
      totalLessons: 8,
      completedLessons: 2,
      duration: '1小时45分',
      category: '客户管理',
      difficulty: 'intermediate',
      instructor: '李老师',
      rating: 4.6,
    },
    {
      id: '3',
      title: '短视频拍摄技巧',
      description: '学习短视频拍摄的专业技巧，打造高质量内容',
      progress: 15,
      totalLessons: 10,
      completedLessons: 1,
      duration: '2小时',
      category: '视频制作',
      difficulty: 'intermediate',
      instructor: '王老师',
      rating: 4.9,
    },
  ];

  // 推荐课程
  const recommendedCourses: Course[] = [
    {
      id: '4',
      title: '销售话术进阶',
      description: '高级销售技巧，提升成交率',
      progress: 0,
      totalLessons: 15,
      completedLessons: 0,
      duration: '3小时',
      category: '销售技巧',
      difficulty: 'advanced',
      rating: 4.7,
    },
    {
      id: '5',
      title: '平台运营全攻略',
      description: '从零开始学习各平台运营技巧',
      progress: 0,
      totalLessons: 20,
      completedLessons: 0,
      duration: '4小时',
      category: '平台运营',
      difficulty: 'beginner',
      rating: 4.5,
    },
    {
      id: '6',
      title: '产品知识深度解读',
      description: '全面了解产品特性与卖点',
      progress: 0,
      totalLessons: 10,
      completedLessons: 0,
      duration: '2小时',
      category: '产品知识',
      difficulty: 'beginner',
      rating: 4.8,
    },
  ];

  // 课程分类
  const categories = [
    { id: 'content', name: '内容创作', icon: FileText, color: '#60a5fa', count: 12 },
    { id: 'customer', name: '客户管理', icon: MessageCircle, color: '#4ade80', count: 8 },
    { id: 'sales', name: '销售技巧', icon: Target, color: '#f59e0b', count: 15 },
    { id: 'product', name: '产品知识', icon: BookOpen, color: '#a855f7', count: 6 },
    { id: 'video', name: '视频制作', icon: Video, color: '#ec4899', count: 9 },
    { id: 'operation', name: '平台运营', icon: ChartBarBig, color: '#06b6d4', count: 11 },
  ];

  const handleCourseClick = (course: Course) => {
    Taro.showToast({ title: `即将上线：${course.title}`, icon: 'none' });
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

  const renderCourseCard = (course: Course, showProgress = true) => (
    <View
      key={course.id}
      style={{
        backgroundColor: '#111827',
        border: '1px solid #1e3a5f',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
      }}
      onClick={() => handleCourseClick(course)}
    >
      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', flex: 1 }}>
          {course.title}
        </Text>
        <View
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: `${getDifficultyColor(course.difficulty)}20`,
          }}
        >
          <Text style={{ fontSize: '12px', color: getDifficultyColor(course.difficulty) }}>
            {getDifficultyLabel(course.difficulty)}
          </Text>
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

      {showProgress && course.progress > 0 && (
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
                width: `${course.progress}%`,
                backgroundColor: '#06b6d4',
                borderRadius: '3px',
              }}
            />
          </View>
          <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b' }}>
              已完成 {course.completedLessons}/{course.totalLessons} 课时
            </Text>
            <Text style={{ fontSize: '12px', color: '#06b6d4' }}>{course.progress}%</Text>
          </View>
        </View>
      )}

      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color="#71717a" />
            <Text style={{ fontSize: '12px', color: '#71717a' }}>{course.duration}</Text>
          </View>
          {course.rating && (
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color="#f59e0b" />
              <Text style={{ fontSize: '12px', color: '#f59e0b' }}>{course.rating}</Text>
            </View>
          )}
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Play size={14} color="#06b6d4" />
          <Text style={{ fontSize: '13px', color: '#06b6d4' }}>
            {course.progress > 0 ? '继续学习' : '开始学习'}
          </Text>
        </View>
      </View>
    </View>
  );

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
            <ChevronLeft size={20} color="#38bdf8" />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={24} color="#06b6d4" />
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
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>{stats.streak}</Text>
            </View>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>连续学习</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#06b6d4' }}>{stats.todayMinutes}</Text>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>今日(分钟)</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#4ade80' }}>{stats.completedCourses}</Text>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>已完成</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#a855f7' }}>{stats.totalCourses}</Text>
            <Text style={{ fontSize: '11px', color: '#64748b' }}>在学</Text>
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
                backgroundColor: activeTab === tab.key ? '#06b6d4' : '#1e293b',
                textAlign: 'center',
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === tab.key ? '#000' : '#94a3b8',
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
                    <TrendingUp size={14} color="#06b6d4" />
                    <Text style={{ fontSize: '12px', color: '#06b6d4' }}>本周 {stats.weekMinutes} 分钟</Text>
                  </View>
                </View>
                {ongoingCourses.map(course => renderCourseCard(course, true))}
              </View>

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
                    <Text style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>{stats.streak}天</Text>
                  </View>
                  <View style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                    <Text style={{ fontSize: '24px', marginBottom: '4px' }}>📚</Text>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>累计学习</Text>
                    <Text style={{ fontSize: '14px', color: '#06b6d4', fontWeight: '600' }}>{Math.floor(stats.totalMinutes / 60)}小时</Text>
                  </View>
                  <View style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#1e293b', borderRadius: '10px' }}>
                    <Text style={{ fontSize: '24px', marginBottom: '4px' }}>🏆</Text>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>已完结</Text>
                    <Text style={{ fontSize: '14px', color: '#4ade80', fontWeight: '600' }}>{stats.completedCourses}门</Text>
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

              {/* 推荐课程列表 */}
              <Text style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>为你推荐</Text>
              {recommendedCourses.map(course => renderCourseCard(course, false))}

              {/* 热门课程 */}
              <View style={{ marginTop: '20px' }}>
                <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>热门课程</Text>
                {ongoingCourses.slice(0, 2).map(course => renderCourseCard(course, false))}
              </View>
            </>
          )}

          {/* 课程分类 */}
          {activeTab === 'category' && (
            <>
              <Text style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>选择分类浏览课程</Text>
              <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {categories.map(category => (
                  <View
                    key={category.id}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #1e3a5f',
                      borderRadius: '12px',
                      padding: '20px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    onClick={() => Taro.showToast({ title: `${category.name}课程即将上线`, icon: 'none' })}
                  >
                    <View
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: `${category.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <category.icon size={24} color={category.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>{category.name}</Text>
                      <Text style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{category.count} 门课程</Text>
                    </View>
                    <ChevronRight size={16} color="#64748b" />
                  </View>
                ))}
              </View>

              {/* 学习路径推荐 */}
              <View
                style={{
                  marginTop: '24px',
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Target size={18} color="#f59e0b" />
                  <Text style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>推荐学习路径</Text>
                </View>
                <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                  根据您的角色和业务需求，我们为您规划了系统化的学习路径，帮助您快速提升专业技能。
                </Text>
                <View
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View>
                    <Text style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '500' }}>内容创作达人</Text>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>6门课程 · 约8小时</Text>
                  </View>
                  <ChevronRight size={18} color="#38bdf8" />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NewsPage;
