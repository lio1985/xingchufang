import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import {
  Upload,
  FileText,
  Image,
  File,
  Presentation,
  Video,
  X,
  Check,
  Loader,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Category {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  contentType: 'text' | 'image_text' | 'pdf' | 'ppt' | 'video' | 'other';
  coverImage: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  tags: string[];
}

export default function CourseEditPage() {
  const router = useRouter();
  const courseId = router.params.id;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    categoryId: '',
    contentType: 'text',
    coverImage: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    duration: 0,
    difficulty: 'beginner',
    status: 'draft',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');

  const loadCategories = async () => {
    try {
      const res = await Network.request({
        url: '/api/course/categories',
        method: 'GET',
      });
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadCourse = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const res = await Network.request({
        url: `/api/course/${courseId}`,
        method: 'GET',
      });

      if (res.data?.data) {
        const course = res.data.data;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          content: course.content || '',
          categoryId: course.category_id || '',
          contentType: course.content_type || 'text',
          coverImage: course.cover_image || '',
          fileUrl: course.file_url || '',
          fileName: course.file_name || '',
          fileSize: course.file_size || 0,
          duration: course.duration || 0,
          difficulty: course.difficulty || 'beginner',
          status: course.status || 'draft',
          tags: course.tags || [],
        });
      }
    } catch (error) {
      console.error('加载课程失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleUploadFile = async () => {
    try {
      const res = await Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'],
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0];
        setUploading(true);

        const uploadRes = await Network.uploadFile({
          url: '/api/course/upload',
          filePath: file.path,
          name: 'file',
        });

        // uploadRes.data 是 string 类型，需要解析
        const resData = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data;
        if (resData?.data) {
          const { url, filename, size, contentType } = resData.data;
          setFormData({
            ...formData,
            fileUrl: url,
            fileName: filename,
            fileSize: size,
            contentType: contentType || 'other',
          });
          Taro.showToast({ title: '上传成功', icon: 'success' });
        }
      }
    } catch (error: any) {
      console.error('上传文件失败:', error);
      Taro.showToast({ title: error.message || '上传失败', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCover = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setUploading(true);

        const uploadRes = await Network.uploadFile({
          url: '/api/upload/image',
          filePath: res.tempFilePaths[0],
          name: 'file',
        });

        // uploadRes.data 是 string 类型，需要解析
        const resData = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data;
        if (resData?.data?.url) {
          setFormData({ ...formData, coverImage: resData.data.url });
          Taro.showToast({ title: '上传成功', icon: 'success' });
        }
      }
    } catch (error: any) {
      console.error('上传封面失败:', error);
      Taro.showToast({ title: error.message || '上传失败', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入课程标题', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      await Network.request({
        url: `/api/course/${courseId}`,
        method: 'PUT',
        data: {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          categoryId: formData.categoryId || undefined,
          contentType: formData.contentType,
          coverImage: formData.coverImage || undefined,
          fileUrl: formData.fileUrl || undefined,
          fileName: formData.fileName || undefined,
          fileSize: formData.fileSize || undefined,
          duration: formData.duration,
          difficulty: formData.difficulty,
          status: publish ? 'published' : formData.status,
          tags: formData.tags,
        },
      });

      Taro.showToast({
        title: publish ? '发布成功' : '保存成功',
        icon: 'success',
      });

      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error: any) {
      console.error('保存课程失败:', error);
      Taro.showToast({ title: error.message || '保存失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  const TypeIcon = getContentTypeIcon(formData.contentType);

  if (loading && !formData.title) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={32} color="#ef4444" className="animate-spin" />
      </View>
    );
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>编辑课程</Text>
          <View style={{ width: '32px' }} />
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 基本信息 */}
          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>基本信息</Text>
            
            {/* 标题 */}
            <View style={{ marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>课程标题 *</Text>
              <input
                style={{
                  width: '100%',
                  height: '44px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#ffffff',
                  outline: 'none',
                }}
                placeholder="请输入课程标题"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </View>

            {/* 描述 */}
            <View style={{ marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>课程简介</Text>
              <View style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
                <Textarea
                  style={{ width: '100%', minHeight: '80px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入课程简介..."
                  value={formData.description}
                  onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
                  maxlength={500}
                />
              </View>
            </View>

            {/* 分类 */}
            <View style={{ marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>课程分类</Text>
              <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <View
                    key={cat.id}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: formData.categoryId === cat.id ? '#ef4444' : '#1e293b',
                      borderRadius: '8px',
                      border: formData.categoryId === cat.id ? '1px solid #ef4444' : '1px solid #334155',
                    }}
                    onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                  >
                    <Text style={{ fontSize: '13px', color: formData.categoryId === cat.id ? '#ffffff' : '#94a3b8' }}>{cat.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 难度 */}
            <View style={{ marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>难度等级</Text>
              <View style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'beginner', label: '入门' },
                  { value: 'intermediate', label: '进阶' },
                  { value: 'advanced', label: '高级' },
                ].map((item) => (
                  <View
                    key={item.value}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: formData.difficulty === item.value ? '#ef4444' : '#1e293b',
                      borderRadius: '8px',
                      border: formData.difficulty === item.value ? '1px solid #ef4444' : '1px solid #334155',
                      textAlign: 'center',
                    }}
                    onClick={() => setFormData({ ...formData, difficulty: item.value as any })}
                  >
                    <Text style={{ fontSize: '13px', color: formData.difficulty === item.value ? '#ffffff' : '#94a3b8' }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 内容类型 */}
          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>内容类型</Text>
            <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { value: 'text', label: '纯文字', icon: FileText },
                { value: 'image_text', label: '图文', icon: Image },
                { value: 'pdf', label: 'PDF', icon: File },
                { value: 'ppt', label: 'PPT', icon: Presentation },
                { value: 'video', label: '视频', icon: Video },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <View
                    key={item.value}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: formData.contentType === item.value ? '#ef4444' : '#1e293b',
                      borderRadius: '8px',
                      border: formData.contentType === item.value ? '1px solid #ef4444' : '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onClick={() => setFormData({ ...formData, contentType: item.value as any })}
                  >
                    <IconComp size={16} color={formData.contentType === item.value ? '#ffffff' : '#94a3b8'} />
                    <Text style={{ fontSize: '13px', color: formData.contentType === item.value ? '#ffffff' : '#94a3b8' }}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 封面图片 */}
          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>封面图片</Text>
            {formData.coverImage ? (
              <View style={{ position: 'relative', width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={formData.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                <View
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setFormData({ ...formData, coverImage: '' })}
                >
                  <X size={14} color="#ffffff" />
                </View>
              </View>
            ) : (
              <View
                style={{
                  width: '120px',
                  height: '90px',
                  backgroundColor: '#1e293b',
                  border: '1px dashed #334155',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={handleUploadCover}
              >
                {uploading ? (
                  <Loader size={24} color="#64748b" className="animate-spin" />
                ) : (
                  <>
                    <Upload size={20} color="#64748b" />
                    <Text style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>上传封面</Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* 课程内容（文字/图文） */}
          {(formData.contentType === 'text' || formData.contentType === 'image_text') && (
            <View style={{ marginBottom: '24px' }}>
              <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>课程内容</Text>
              <View style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
                <Textarea
                  style={{ width: '100%', minHeight: '200px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入课程内容..."
                  value={formData.content}
                  onInput={(e) => setFormData({ ...formData, content: e.detail.value })}
                  maxlength={50000}
                />
              </View>
            </View>
          )}

          {/* 文件上传（PDF/PPT等） */}
          {formData.contentType !== 'text' && formData.contentType !== 'image_text' && (
            <View style={{ marginBottom: '24px' }}>
              <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>课程文件</Text>
              {formData.fileUrl ? (
                <View style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <View style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#ef444420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TypeIcon size={24} color="#ef4444" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formData.fileName}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                      {formatFileSize(formData.fileSize)}
                    </Text>
                  </View>
                  <View
                    style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setFormData({ ...formData, fileUrl: '', fileName: '', fileSize: 0 })}
                  >
                    <X size={18} color="#f87171" />
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px dashed #334155',
                    borderRadius: '8px',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={handleUploadFile}
                >
                  {uploading ? (
                    <Loader size={32} color="#ef4444" className="animate-spin" />
                  ) : (
                    <>
                      <Upload size={32} color="#ef4444" />
                      <Text style={{ fontSize: '14px', color: '#94a3b8', marginTop: '12px' }}>点击上传文件</Text>
                      <Text style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>支持 PDF、PPT、Word、图片等格式</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 预计时长 */}
          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>预计学习时长（分钟）</Text>
            <input
              style={{
                width: '100%',
                height: '44px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '14px',
                color: '#ffffff',
                outline: 'none',
              }}
              type="number"
              placeholder="0"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            />
          </View>

          {/* 标签 */}
          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>标签</Text>
            <View style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {formData.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ef444420',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Text style={{ fontSize: '12px', color: '#ef4444' }}>{tag}</Text>
                  <X size={14} color="#ef4444" onClick={() => handleRemoveTag(tag)} />
                </View>
              ))}
            </View>
            <View style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{
                  flex: 1,
                  height: '36px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#ffffff',
                  outline: 'none',
                }}
                placeholder="输入标签名称"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <View
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={handleAddTag}
              >
                <Check size={18} color="#94a3b8" />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px',
          backgroundColor: '#111827',
          borderTop: '1px solid #1e3a5f',
          display: 'flex',
          gap: '12px',
        }}
      >
        <View
          style={{
            flex: 1,
            height: '44px',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? '0.5' : '1',
          }}
          onClick={() => !loading && handleSubmit(false)}
        >
          <Text style={{ fontSize: '15px', fontWeight: '500', color: '#94a3b8' }}>保存修改</Text>
        </View>
        {formData.status !== 'published' && (
          <View
            style={{
              flex: 1,
              height: '44px',
              backgroundColor: '#ef4444',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? '0.5' : '1',
            }}
            onClick={() => !loading && handleSubmit(true)}
          >
            {loading ? (
              <Loader size={18} color="#ffffff" className="animate-spin" />
            ) : (
              <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff' }}>立即发布</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
