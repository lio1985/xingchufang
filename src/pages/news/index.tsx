import { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  GraduationCap,
  Search,
  Clock,
  Play,
  Globe,
} from 'lucide-react-taro';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  siteName?: string;
  publishTime?: string;
}

interface Course {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  category: string;
}

const NewsPage = () => {
  const [keyword, setKeyword] = useState('');
  const [timeRange, setTimeRange] = useState('1d');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);

  // 模拟正在学习的课程
  const ongoingCourses: Course[] = [
    { id: '1', title: '内容创作入门指南', progress: 60, totalLessons: 12, completedLessons: 7, duration: '2小时30分', category: '内容创作' },
    { id: '2', title: '客户沟通技巧', progress: 30, totalLessons: 8, completedLessons: 2, duration: '1小时45分', category: '客户管理' },
    { id: '3', title: '短视频拍摄技巧', progress: 15, totalLessons: 10, completedLessons: 1, duration: '2小时', category: '视频制作' },
  ];

  const handleSearch = async () => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }

    setLoading(true);
    setResults([]);
    setAiSummary('');

    try {
      const response = await Network.request({
        url: '/api/news/search',
        method: 'POST',
        data: { keyword, timeRange }
      });

      if (response.statusCode === 200 && response.data) {
        setResults(response.data.results || []);
        setAiSummary(response.data.summary || '');
      }
    } catch (error) {
      console.error('[CourseTraining] 搜索失败:', error);
      Taro.showToast({ title: '搜索失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url: string) => {
    Taro.setClipboardData({
      data: url,
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  const handleContinueCourse = (course: Course) => {
    Taro.showToast({ title: `继续学习：${course.title}`, icon: 'none' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <GraduationCap size={24} color="#06b6d4" />
          <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginLeft: '8px' }}>课程培训</Text>
        </View>

        {/* 搜索框 */}
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Search size={18} color="#71717a" />
          <Input
            style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
            placeholder="搜索热点资讯..."
            placeholderStyle="color: #52525b"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>

        {/* 时间筛选 */}
        <ScrollView scrollX style={{ width: '100%', whiteSpace: 'nowrap' }}>
          <View style={{ display: 'inline-flex', gap: '8px' }}>
            {[
              { value: '1d', label: '今天' },
              { value: '1w', label: '本周' },
              { value: '1m', label: '本月' },
            ].map((item) => (
              <View
                key={item.value}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: timeRange === item.value ? '#06b6d4' : '#111827',
                  border: timeRange === item.value ? 'none' : '1px solid #1e3a5f'
                }}
                onClick={() => setTimeRange(item.value)}
              >
                <Text style={{ fontSize: '13px', color: timeRange === item.value ? '#ffffff' : '#a1a1aa' }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 220px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 正在学习 */}
          <View style={{ marginBottom: '20px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '12px' }}>正在学习</Text>
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
              {ongoingCourses.map((course, index) => (
                <View
                  key={course.id}
                  style={{
                    padding: '16px',
                    borderBottom: index < ongoingCourses.length - 1 ? '1px solid #1e3a5f' : 'none'
                  }}
                  onClick={() => handleContinueCourse(course)}
                >
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', flex: 1 }}>{course.title}</Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Play size={14} color="#06b6d4" />
                      <Text style={{ fontSize: '12px', color: '#06b6d4' }}>继续</Text>
                    </View>
                  </View>
                  
                  {/* 进度条 */}
                  <View style={{ height: '4px', backgroundColor: '#1e3a5f', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${course.progress}%`, backgroundColor: '#06b6d4', borderRadius: '2px' }} />
                  </View>
                  
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>
                      已完成 {course.completedLessons}/{course.totalLessons} 课时 · {course.progress}%
                    </Text>
                    <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(6, 182, 212, 0.2)' }}>
                      <Text style={{ fontSize: '11px', color: '#06b6d4' }}>{course.category}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* AI 摘要 */}
          {aiSummary && (
            <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Text style={{ fontSize: '16px' }}>✨</Text>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>摘要</Text>
              </View>
              <Text style={{ fontSize: '13px', color: '#a1a1aa', display: 'block', lineHeight: '20px' }}>{aiSummary}</Text>
            </View>
          )}

          {/* 搜索结果或空状态 */}
          {results.length === 0 && !loading && keyword === '' && (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
              <View style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={32} color="#52525b" />
              </View>
              <Text style={{ fontSize: '16px', color: '#71717a', display: 'block', marginTop: '16px' }}>搜索热点资讯</Text>
              <Text style={{ fontSize: '13px', color: '#52525b', display: 'block', marginTop: '8px' }}>输入关键词，发现最新动态</Text>
            </View>
          )}

          {results.length === 0 && !loading && keyword !== '' && (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
              <View style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={32} color="#52525b" />
              </View>
              <Text style={{ fontSize: '16px', color: '#71717a', display: 'block', marginTop: '16px' }}>未找到相关资讯</Text>
              <Text style={{ fontSize: '13px', color: '#52525b', display: 'block', marginTop: '8px' }}>试试其他关键词</Text>
            </View>
          )}

          {results.length > 0 && (
            <View>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '12px' }}>找到 {results.length} 条结果</Text>
              {results.map((item, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1e3a5f',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                >
                  {/* 标题 */}
                  <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '8px' }}>{item.title}</Text>

                  {/* 来源和时间 */}
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {item.siteName && (
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={12} color="#3b82f6" />
                        <Text style={{ fontSize: '12px', color: '#3b82f6' }}>{item.siteName}</Text>
                      </View>
                    )}
                    {item.publishTime && (
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#71717a" />
                        <Text style={{ fontSize: '12px', color: '#71717a' }}>{formatTime(item.publishTime)}</Text>
                      </View>
                    )}
                  </View>

                  {/* 摘要 */}
                  <Text style={{ fontSize: '13px', color: '#a1a1aa', display: 'block', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.snippet}
                  </Text>

                  {/* 链接按钮 */}
                  <View
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: '#1e3a5f', borderRadius: '8px', alignSelf: 'flex-start' }}
                    onClick={() => openUrl(item.url)}
                  >
                    <Text style={{ fontSize: '14px' }}>🔗</Text>
                    <Text style={{ fontSize: '12px', color: '#3b82f6' }}>查看原文</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 加载状态 */}
          {loading && (
            <View style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <Text style={{ fontSize: '14px', color: '#71717a' }}>搜索中...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NewsPage;
