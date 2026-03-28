import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Plus,
  Search,
  FileText,
  Image,
  File,
  Presentation,
  Video,
  Ellipsis,
  Eye,
  Pencil,
  Trash2,
  Archive,
  Send,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  content_type: 'text' | 'image_text' | 'pdf' | 'ppt' | 'video' | 'other';
  status: 'draft' | 'published' | 'archived';
  cover_image?: string;
  category_id?: string;
  category?: Category;
  view_count: number;
  completion_count: number;
  created_at: string;
  updated_at: string;
}

export default function CourseManagePage() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showActions, setShowActions] = useState<string | null>(null);

  const loadCourses = async (isRefresh = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params: any = { page: isRefresh ? 1 : page, limit: 20 };
      if (selectedStatus) params.status = selectedStatus;
      if (keyword) params.keyword = keyword;

      const res = await Network.request({
        url: '/api/course',
        method: 'GET',
        data: params,
      });

      if (res.data?.data) {
        const { list, pagination } = res.data.data;
        setCourses(isRefresh ? list : [...courses, ...list]);
        setTotal(pagination.total);
        setPage((isRefresh ? 1 : page) + 1);
      }
    } catch (error) {
      console.error('加载课程列表失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadCourses(true);
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setCourses([]);
    setPage(1);
    loadCourses(true);
  };

  const handleDelete = async (courseId: string) => {
    try {
      const res = await Taro.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除这个课程吗？',
      });
      
      if (res.confirm) {
        await Network.request({
          url: `/api/course/${courseId}`,
          method: 'DELETE',
        });
        Taro.showToast({ title: '删除成功', icon: 'success' });
        loadCourses(true);
      }
    } catch (error) {
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
    setShowActions(null);
  };

  const handlePublish = async (courseId: string) => {
    try {
      await Network.request({
        url: `/api/course/${courseId}/publish`,
        method: 'POST',
      });
      Taro.showToast({ title: '发布成功', icon: 'success' });
      loadCourses(true);
    } catch (error) {
      Taro.showToast({ title: '发布失败', icon: 'none' });
    }
    setShowActions(null);
  };

  const handleArchive = async (courseId: string) => {
    try {
      await Network.request({
        url: `/api/course/${courseId}/archive`,
        method: 'POST',
      });
      Taro.showToast({ title: '归档成功', icon: 'success' });
      loadCourses(true);
    } catch (error) {
      Taro.showToast({ title: '归档失败', icon: 'none' });
    }
    setShowActions(null);
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

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: '文字',
      image_text: '图文',
      pdf: 'PDF',
      ppt: 'PPT',
      video: '视频',
      other: '其他',
    };
    return labels[type] || '其他';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      draft: { text: '草稿', color: '#fbbf24' },
      published: { text: '已发布', color: '#4ade80' },
      archived: { text: '已归档', color: '#64748b' },
    };
    return labels[status] || { text: '未知', color: '#64748b' };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={18} color="#ef4444" />
          </View>
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>课程管理</Text>
          <View
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => Taro.navigateTo({ url: '/package-admin/pages/admin/course-create/index' })}
          >
            <Plus size={18} color="#ef4444" />
          </View>
        </View>

        {/* Search */}
        <View style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <View style={{ flex: 1, position: 'relative' }}>
            <View style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <Search size={16} color="#64748b" />
            </View>
            <input
              style={{
                width: '100%',
                height: '36px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                paddingLeft: '36px',
                paddingRight: '12px',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
              }}
              placeholder="搜索课程..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </View>
          <View
            style={{
              height: '36px',
              padding: '0 16px',
              backgroundColor: '#ef4444',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleSearch}
          >
            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>搜索</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={{ marginTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <View
            style={{
              padding: '6px 12px',
              backgroundColor: selectedStatus === '' ? '#ef4444' : '#1e293b',
              borderRadius: '16px',
              flexShrink: 0,
            }}
            onClick={() => { setSelectedStatus(''); loadCourses(true); }}
          >
            <Text style={{ fontSize: '12px', color: selectedStatus === '' ? '#ffffff' : '#94a3b8' }}>全部</Text>
          </View>
          <View
            style={{
              padding: '6px 12px',
              backgroundColor: selectedStatus === 'draft' ? '#ef4444' : '#1e293b',
              borderRadius: '16px',
              flexShrink: 0,
            }}
            onClick={() => { setSelectedStatus('draft'); loadCourses(true); }}
          >
            <Text style={{ fontSize: '12px', color: selectedStatus === 'draft' ? '#ffffff' : '#94a3b8' }}>草稿</Text>
          </View>
          <View
            style={{
              padding: '6px 12px',
              backgroundColor: selectedStatus === 'published' ? '#ef4444' : '#1e293b',
              borderRadius: '16px',
              flexShrink: 0,
            }}
            onClick={() => { setSelectedStatus('published'); loadCourses(true); }}
          >
            <Text style={{ fontSize: '12px', color: selectedStatus === 'published' ? '#ffffff' : '#94a3b8' }}>已发布</Text>
          </View>
          <View
            style={{
              padding: '6px 12px',
              backgroundColor: selectedStatus === 'archived' ? '#ef4444' : '#1e293b',
              borderRadius: '16px',
              flexShrink: 0,
            }}
            onClick={() => { setSelectedStatus('archived'); loadCourses(true); }}
          >
            <Text style={{ fontSize: '12px', color: selectedStatus === 'archived' ? '#ffffff' : '#94a3b8' }}>已归档</Text>
          </View>
        </View>
      </View>

      <ScrollView
        scrollY
        style={{ height: 'calc(100vh - 200px)' }}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
        onScrollToLower={() => courses.length < total && loadCourses()}
      >
        {courses.length === 0 && !loading ? (
          <View style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#64748b' }}>暂无课程数据</Text>
            <View
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                borderRadius: '8px',
                display: 'inline-flex',
              }}
              onClick={() => Taro.navigateTo({ url: '/package-admin/pages/admin/course-create/index' })}
            >
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>创建第一个课程</Text>
            </View>
          </View>
        ) : (
          <View style={{ padding: '16px 20px' }}>
            {courses.map((course) => {
              const TypeIcon = getContentTypeIcon(course.content_type);
              const statusInfo = getStatusLabel(course.status);
              
              return (
                <View
                  key={course.id}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1e3a5f',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                    onClick={() => Taro.navigateTo({ url: `/package-admin/pages/admin/course-edit/index?id=${course.id}` })}
                  >
                    {/* Cover */}
                    {course.cover_image ? (
                      <View
                        style={{
                          width: '80px',
                          height: '60px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <img src={course.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      </View>
                    ) : (
                      <View
                        style={{
                          width: '80px',
                          height: '60px',
                          borderRadius: '8px',
                          backgroundColor: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <TypeIcon size={24} color="#64748b" />
                      </View>
                    )}
                    
                    {/* Content */}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {course.title}
                        </Text>
                        <View style={{ padding: '2px 8px', backgroundColor: `${statusInfo.color}20`, borderRadius: '4px' }}>
                          <Text style={{ fontSize: '11px', color: statusInfo.color }}>{statusInfo.text}</Text>
                        </View>
                      </View>
                      
                      <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <View style={{ padding: '2px 6px', backgroundColor: '#1e293b', borderRadius: '4px' }}>
                          <Text style={{ fontSize: '11px', color: '#94a3b8' }}>{getContentTypeLabel(course.content_type)}</Text>
                        </View>
                        {course.category && (
                          <Text style={{ fontSize: '12px', color: '#64748b' }}>{course.category.name}</Text>
                        )}
                      </View>
                      
                      <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} color="#64748b" />
                          <Text style={{ fontSize: '12px', color: '#64748b' }}>{course.view_count}</Text>
                        </View>
                        <Text style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatDate(course.created_at)}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Actions */}
                    <View
                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(showActions === course.id ? null : course.id);
                      }}
                    >
                      <Ellipsis size={18} color="#64748b" />
                    </View>
                  </View>
                  
                  {/* Action Menu */}
                  {showActions === course.id && (
                    <View style={{ borderTop: '1px solid #1e3a5f', padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <View
                        style={{ padding: '6px 12px', backgroundColor: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => { Taro.navigateTo({ url: `/package-admin/pages/admin/course-edit/index?id=${course.id}` }); setShowActions(null); }}
                      >
                        <Pencil size={14} color="#94a3b8" />
                        <Text style={{ fontSize: '12px', color: '#94a3b8' }}>编辑</Text>
                      </View>
                      {course.status === 'draft' && (
                        <View
                          style={{ padding: '6px 12px', backgroundColor: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handlePublish(course.id)}
                        >
                          <Send size={14} color="#4ade80" />
                          <Text style={{ fontSize: '12px', color: '#4ade80' }}>发布</Text>
                        </View>
                      )}
                      {course.status === 'published' && (
                        <View
                          style={{ padding: '6px 12px', backgroundColor: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleArchive(course.id)}
                        >
                          <Archive size={14} color="#fbbf24" />
                          <Text style={{ fontSize: '12px', color: '#fbbf24' }}>归档</Text>
                        </View>
                      )}
                      <View
                        style={{ padding: '6px 12px', backgroundColor: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 size={14} color="#f87171" />
                        <Text style={{ fontSize: '12px', color: '#f87171' }}>删除</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <View
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '30px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
        }}
        onClick={() => Taro.navigateTo({ url: '/package-admin/pages/admin/course-create/index' })}
      >
        <Plus size={28} color="#ffffff" />
      </View>
    </View>
  );
}
