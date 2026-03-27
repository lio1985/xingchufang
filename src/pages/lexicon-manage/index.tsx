import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FileText,
  Clock,
  ChevronLeft,
  Upload,
  File,
  Loader,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Lexicon {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'personal';
  created_at: string;
  updated_at?: string;
}

export default function LexiconManagePage() {
  const [lexicons, setLexicons] = useState<Lexicon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLexicon, setEditingLexicon] = useState<Lexicon | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 加载语料列表
  const loadLexicons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Network.request({
        url: '/api/lexicon',
        method: 'GET',
        data: { type: 'personal' },
      });

      if (response.statusCode === 200 && response.data?.data) {
        const lexiconData = Array.isArray(response.data.data.items)
          ? response.data.data.items
          : [];
        setLexicons(lexiconData);
      } else {
        setLexicons([]);
      }
    } catch (error) {
      console.error('加载语料列表失败:', error);
      setLexicons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLexicons();
  }, [loadLexicons]);

  // 打开添加弹窗
  const handleOpenAddModal = () => {
    setEditingLexicon(null);
    setFormData({ title: '', content: '', category: '' });
    setShowAddModal(true);
  };

  // 打开编辑弹窗
  const handleOpenEditModal = (lexicon: Lexicon) => {
    setEditingLexicon(lexicon);
    setFormData({
      title: lexicon.title,
      content: lexicon.content,
      category: lexicon.category || '',
    });
    setShowAddModal(true);
  };

  // 保存语料
  const handleSave = async () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!formData.content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    try {
      setSaving(true);
      const saveData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category.trim(),
        type: 'personal',
      };

      if (editingLexicon) {
        await Network.request({
          url: `/api/lexicon/${editingLexicon.id}`,
          method: 'PUT',
          data: saveData,
        });
        Taro.showToast({ title: '修改成功', icon: 'success' });
      } else {
        await Network.request({
          url: '/api/lexicon',
          method: 'POST',
          data: saveData,
        });
        Taro.showToast({ title: '添加成功', icon: 'success' });
      }

      setShowAddModal(false);
      await loadLexicons();
    } catch (error) {
      console.error('保存失败:', error);
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  // 删除语料
  const handleDelete = (lexicon: Lexicon) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${lexicon.title}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await Network.request({
              url: `/api/lexicon/${lexicon.id}`,
              method: 'DELETE',
            });
            Taro.showToast({ title: '删除成功', icon: 'success' });
            await loadLexicons();
          } catch (error) {
            console.error('删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  // 选择并上传文件
  const handleUploadFile = async () => {
    try {
      const res = await Taro.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['doc', 'docx', 'pdf', 'txt'],
      });

      if (res.errMsg !== 'chooseMessageFile:ok' || !res.tempFiles?.length) {
        return;
      }

      const file = res.tempFiles[0];
      const fileExt = file.path.split('.').pop()?.toLowerCase();

      // 检查文件类型
      if (!['doc', 'docx', 'pdf', 'txt'].includes(fileExt || '')) {
        Taro.showToast({ title: '仅支持 Word、PDF、TXT 文件', icon: 'none' });
        return;
      }

      // 检查文件大小（限制 10MB）
      if (file.size > 10 * 1024 * 1024) {
        Taro.showToast({ title: '文件大小不能超过 10MB', icon: 'none' });
        return;
      }

      setUploading(true);
      Taro.showLoading({ title: '上传中...', mask: true });

      // 上传文件
      const uploadRes = await Network.uploadFile({
        url: '/api/lexicon/upload-file',
        filePath: file.path,
        name: 'file',
      });

      Taro.hideLoading();

      console.log('[LexiconManage] 上传响应:', uploadRes);

      // 解析上传响应
      let responseData: any = {};
      if (typeof uploadRes.data === 'string') {
        try {
          responseData = JSON.parse(uploadRes.data);
        } catch (e) {
          console.error('[LexiconManage] 解析响应失败:', e);
        }
      } else if (uploadRes.data && typeof uploadRes.data === 'object') {
        responseData = uploadRes.data;
      }

      if (responseData.code === 200 && responseData.data) {
        const { fileUrl, fileType } = responseData.data;

        // 自动创建语料记录
        const fileName = file.path.split('/').pop() || '上传文件';
        const title = fileName.replace(/\.[^/.]+$/, ''); // 移除扩展名

        // 弹窗让用户填写标题和分类
        setFormData({
          title,
          content: `【上传文件】\n文件类型：${fileType === 'word' ? 'Word文档' : fileType === 'pdf' ? 'PDF文档' : '文本文件'}\n文件链接：${fileUrl}`,
          category: fileType === 'word' ? 'Word文档' : fileType === 'pdf' ? 'PDF文档' : '文本文件',
        });
        setShowAddModal(true);
        Taro.showToast({ title: '文件上传成功', icon: 'success' });
      } else {
        Taro.showToast({ title: responseData.msg || '上传失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[LexiconManage] 上传失败:', error);
      Taro.hideLoading();
      Taro.showToast({ title: '上传失败，请重试', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  // 过滤语料
  const filteredLexicons = lexicons.filter(
    (item) =>
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  // 统计信息
  const totalCount = lexicons.length;
  const todayCount = lexicons.filter((item) => {
    const today = new Date().toDateString();
    return new Date(item.created_at).toDateString() === today;
  }).length;

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '100px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f', position: 'relative' }}>
        {/* 返回按钮 */}
        <View style={{ position: 'absolute', left: '16px', top: '48px' }}>
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => {
              const pages = Taro.getCurrentPages();
              if (pages.length > 1) {
                Taro.navigateBack();
              } else {
                Taro.redirectTo({ url: '/pages/lexicon-system/index' });
              }
            }}
          >
            <ChevronLeft size={24} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#38bdf8' }}>返回</Text>
          </View>
        </View>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>个人IP语料库</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>管理你的个人风格语料</Text>
          </View>
          <View style={{ display: 'flex', gap: '8px' }}>
            <View
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={handleUploadFile}
            >
              {uploading ? (
                <Loader size={16} color="#60a5fa" />
              ) : (
                <Upload size={16} color="#60a5fa" />
              )}
              <Text style={{ fontSize: '13px', fontWeight: '500', color: '#60a5fa' }}>上传文件</Text>
            </View>
            <View
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={handleOpenAddModal}
            >
              <Plus size={16} color="#0a0f1a" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0a0f1a' }}>添加</Text>
            </View>
          </View>
        </View>

        {/* 数据统计 */}
        <View style={{ display: 'flex', gap: '12px' }}>
          <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{totalCount}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>总语料数</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#60a5fa', display: 'block' }}>{todayCount}</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>今日新增</Text>
          </View>
        </View>

        {/* 支持的文件类型提示 */}
        <View style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <File size={14} color="#64748b" />
          <Text style={{ fontSize: '12px', color: '#64748b' }}>支持上传 Word、PDF、TXT 文件，最大 10MB</Text>
        </View>
      </View>

      {/* 搜索栏 */}
      <View style={{ padding: '16px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#111827',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #1e3a5f',
          }}
        >
          <Search size={18} color="#71717a" />
          <View style={{ flex: 1 }}>
            <Textarea
              style={{ width: '100%', minHeight: '20px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
              placeholder="搜索语料..."
              placeholderStyle="color: #64748b"
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
          {searchKeyword && (
            <View onClick={() => setSearchKeyword('')}>
              <X size={16} color="#71717a" />
            </View>
          )}
        </View>
      </View>

      {/* 语料列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 320px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {loading ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text style={{ color: '#71717a' }}>加载中...</Text>
            </View>
          ) : filteredLexicons.length === 0 ? (
            <View style={{ textAlign: 'center', padding: '40px 0' }}>
              <View
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid #1e3a5f',
                }}
              >
                <FileText size={28} color="#64748b" />
              </View>
              <Text style={{ color: '#71717a', fontSize: '14px', display: 'block' }}>暂无语料</Text>
              <Text style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>点击上传文件或添加按钮创建</Text>
            </View>
          ) : (
            filteredLexicons.map((lexicon) => (
              <View
                key={lexicon.id}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                      {lexicon.title}
                    </Text>
                    {lexicon.category && (
                      <View style={{ display: 'inline-flex', padding: '2px 8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px', marginBottom: '8px' }}>
                        <Text style={{ fontSize: '11px', color: '#60a5fa' }}>{lexicon.category}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <View
                      style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleOpenEditModal(lexicon)}
                    >
                      <Pencil size={14} color="#94a3b8" />
                    </View>
                    <View
                      style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDelete(lexicon)}
                    >
                      <Trash2 size={14} color="#f87171" />
                    </View>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    display: 'block',
                    lineHeight: '20px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {lexicon.content.length > 100 ? lexicon.content.substring(0, 100) + '...' : lexicon.content}
                </Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid #1e3a5f', paddingTop: '12px' }}>
                  <Clock size={12} color="#64748b" />
                  <Text style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(lexicon.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#111827',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              maxHeight: '80vh',
            }}
          >
            {/* 弹窗头部 */}
            <View style={{ padding: '20px', borderBottom: '1px solid #1e3a5f' }}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                  {editingLexicon ? '编辑语料' : '添加语料'}
                </Text>
                <View
                  style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={16} color="#94a3b8" />
                </View>
              </View>
            </View>

            {/* 表单内容 */}
            <ScrollView scrollY style={{ padding: '20px', maxHeight: '50vh' }}>
              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>标题 *</Text>
                <View style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '24px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入标题"
                    placeholderStyle="color: #64748b"
                    value={formData.title}
                    onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
                    maxlength={100}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>分类标签</Text>
                <View style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '24px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="如：口头禅、专业术语、风格表达"
                    placeholderStyle="color: #64748b"
                    value={formData.category}
                    onInput={(e) => setFormData({ ...formData, category: e.detail.value })}
                    maxlength={50}
                  />
                </View>
              </View>

              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>内容 *</Text>
                <View style={{ backgroundColor: '#111827', borderRadius: '10px', padding: '12px', border: '1px solid #1e3a5f' }}>
                  <Textarea
                    style={{ width: '100%', minHeight: '120px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                    placeholder="请输入语料内容..."
                    placeholderStyle="color: #64748b"
                    value={formData.content}
                    onInput={(e) => setFormData({ ...formData, content: e.detail.value })}
                    maxlength={2000}
                  />
                </View>
                <Text style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block', textAlign: 'right' }}>
                  {formData.content.length}/2000
                </Text>
              </View>
            </ScrollView>

            {/* 保存按钮 */}
            <View style={{ padding: '20px', borderTop: '1px solid #1e3a5f' }}>
              <View
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: saving ? '#1e3a5f' : '#38bdf8',
                  textAlign: 'center',
                }}
                onClick={saving ? undefined : handleSave}
              >
                <Text style={{ fontSize: '15px', fontWeight: '600', color: saving ? '#71717a' : '#0a0f1a' }}>
                  {saving ? '保存中...' : '保存'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
