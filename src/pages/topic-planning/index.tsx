import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Input, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Plus,
  Search,
  ListFilter,
  Pencil,
  Trash2,
  Sparkles,
  Flame,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  X,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  PenLine,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import './index.css';

// 选题接口
interface Topic {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  platform: string;
  content_type: string;
  status: 'draft' | 'in_progress' | 'published' | 'archived';
  priority: number;
  tags: string[] | null;
  target_audience: string | null;
  key_points: string | null;
  ai_analysis: Record<string, any> | null;
  inspiration_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// 热点数据接口
interface HotTopic {
  id: string;
  title: string;
  hotness: number;
  source: string;
  category: string;
  trend: string;
}

// 统计数据接口
interface Statistics {
  total: number;
  byStatus: {
    draft: number;
    in_progress: number;
    published: number;
    archived: number;
  };
  byCategory: Record<string, number>;
  byPlatform: Record<string, number>;
}

// 状态配置
const STATUS_CONFIG = {
  draft: { label: '草稿', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)' },
  in_progress: { label: '进行中', color: '#38bdf8', bgColor: 'rgba(56, 189, 248, 0.2)' },
  published: { label: '已发布', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.2)' },
  archived: { label: '已归档', color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.2)' },
};

// 平台选项
const PLATFORM_OPTIONS = [
  { value: '公众号', label: '公众号' },
  { value: '小红书', label: '小红书' },
  { value: '抖音', label: '抖音' },
  { value: '视频号', label: '视频号' },
  { value: '微博', label: '微博' },
  { value: 'B站', label: 'B站' },
];

// 内容类型选项
const CONTENT_TYPE_OPTIONS = [
  { value: '图文', label: '图文' },
  { value: '视频', label: '视频' },
  { value: '直播', label: '直播' },
  { value: '短图文', label: '短图文' },
];

const TopicPlanningPage = () => {
  // 选题列表状态
  const [topics, setTopics] = useState<Topic[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 热点数据
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [hotTopicsLoading, setHotTopicsLoading] = useState(false);
  const [showInspiration, setShowInspiration] = useState(true);

  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [aiAnalysisLoading, setAIAnalysisLoading] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    platform: '公众号',
    content_type: '图文',
    target_audience: '',
    key_points: '',
    tags: '',
    inspiration_data: null as Record<string, any> | null,
  });

  // AI 分析结果
  const [aiAnalysisResult, setAIAnalysisResult] = useState<Record<string, any> | null>(null);

  // 加载选题列表
  const loadTopics = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/topics',
        method: 'GET',
        data: {
          page: pageNum,
          pageSize,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          platform: filterPlatform !== 'all' ? filterPlatform : undefined,
          search: searchKeyword || undefined,
        },
      });

      console.log('[TopicPlanning] 选题数据:', res);

      if (res.data?.code === 200) {
        const data = res.data.data;
        if (pageNum === 1) {
          setTopics(data.items || []);
        } else {
          setTopics(prev => [...prev, ...(data.items || [])]);
        }
        setTotal(data.total || 0);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('[TopicPlanning] 加载选题失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPlatform, searchKeyword]);

  // 加载统计数据
  const loadStatistics = useCallback(async () => {
    try {
      const res = await Network.request({
        url: '/api/topics/statistics',
        method: 'GET',
      });

      if (res.data?.code === 200) {
        setStatistics(res.data.data);
      }
    } catch (error) {
      console.error('[TopicPlanning] 加载统计失败:', error);
    }
  }, []);

  // 加载热点数据
  const loadHotTopics = useCallback(async () => {
    setHotTopicsLoading(true);
    try {
      const res = await Network.request({
        url: '/api/hot-topics',
        method: 'GET',
      });

      if (res.data?.code === 200) {
        const hotTopicsData = res.data.data?.topics || [];
        setHotTopics(hotTopicsData.slice(0, 10)); // 只取前10条
      }
    } catch (error) {
      console.error('[TopicPlanning] 加载热点失败:', error);
    } finally {
      setHotTopicsLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadTopics(1);
    loadStatistics();
    loadHotTopics();
  }, [loadTopics, loadStatistics, loadHotTopics]);

  // 创建选题
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入选题标题', icon: 'none' });
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/topics',
        method: 'POST',
        data: {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category.trim() || null,
          platform: formData.platform,
          content_type: formData.content_type,
          target_audience: formData.target_audience.trim() || null,
          key_points: formData.key_points.trim() || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
          inspiration_data: formData.inspiration_data,
        },
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setShowCreateModal(false);
        resetForm();
        loadTopics(1);
        loadStatistics();
      }
    } catch (error) {
      console.error('[TopicPlanning] 创建选题失败:', error);
      Taro.showToast({ title: '创建失败', icon: 'none' });
    }
  };

  // 更新选题
  const handleUpdate = async () => {
    if (!currentTopic || !formData.title.trim()) {
      Taro.showToast({ title: '请输入选题标题', icon: 'none' });
      return;
    }

    try {
      const res = await Network.request({
        url: `/api/topics/${currentTopic.id}`,
        method: 'PUT',
        data: {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category.trim() || null,
          platform: formData.platform,
          content_type: formData.content_type,
          target_audience: formData.target_audience.trim() || null,
          key_points: formData.key_points.trim() || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        },
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '更新成功', icon: 'success' });
        setShowEditModal(false);
        resetForm();
        loadTopics(1);
      }
    } catch (error) {
      console.error('[TopicPlanning] 更新选题失败:', error);
      Taro.showToast({ title: '更新失败', icon: 'none' });
    }
  };

  // 删除选题
  const handleDelete = async (id: string) => {
    const result = await Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个选题吗？',
    });

    if (!result.confirm) return;

    try {
      const res = await Network.request({
        url: `/api/topics/${id}`,
        method: 'DELETE',
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '删除成功', icon: 'success' });
        loadTopics(1);
        loadStatistics();
      }
    } catch (error) {
      console.error('[TopicPlanning] 删除选题失败:', error);
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  // AI 分析选题
  const handleAIAnalysis = async (topic: Topic) => {
    setCurrentTopic(topic);
    setAIAnalysisResult(topic.ai_analysis);
    setShowAIAnalysisModal(true);

    // 如果没有分析过，则调用分析接口
    if (!topic.ai_analysis) {
      setAIAnalysisLoading(true);
      try {
        const res = await Network.request({
          url: `/api/topics/${topic.id}/analyze`,
          method: 'POST',
        });

        if (res.data?.code === 200) {
          setAIAnalysisResult(res.data.data);
          // 更新列表中的数据
          setTopics(prev => prev.map(t => 
            t.id === topic.id ? { ...t, ai_analysis: res.data.data } : t
          ));
        }
      } catch (error) {
        console.error('[TopicPlanning] AI分析失败:', error);
        Taro.showToast({ title: '分析失败', icon: 'none' });
      } finally {
        setAIAnalysisLoading(false);
      }
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      platform: '公众号',
      content_type: '图文',
      target_audience: '',
      key_points: '',
      tags: '',
      inspiration_data: null,
    });
    setCurrentTopic(null);
  };

  // 打开编辑弹窗
  const openEditModal = (topic: Topic) => {
    setCurrentTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description || '',
      category: topic.category || '',
      platform: topic.platform,
      content_type: topic.content_type,
      target_audience: topic.target_audience || '',
      key_points: topic.key_points || '',
      tags: topic.tags ? topic.tags.join(', ') : '',
      inspiration_data: topic.inspiration_data,
    });
    setShowEditModal(true);
  };

  // 从热点创建选题
  const createFromHotTopic = (hotTopic: HotTopic) => {
    setFormData({
      title: hotTopic.title,
      description: `来源：${hotTopic.source} 热点`,
      category: hotTopic.category || '',
      platform: '公众号',
      content_type: '图文',
      target_audience: '',
      key_points: '',
      tags: '',
      inspiration_data: {
        type: 'hot_topic',
        source: hotTopic.source,
        category: hotTopic.category,
        hotness: hotTopic.hotness,
        trend: hotTopic.trend,
      },
    });
    setShowCreateModal(true);
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? '刚刚' : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    }
  };

  // 渲染统计卡片
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View style={{ 
        padding: '16px 20px', 
        backgroundColor: '#111827',
        borderBottom: '1px solid #1e3a5f'
      }}
      >
        <View style={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          gap: '8px'
        }}
        >
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', display: 'block' }}>
              {statistics.total}
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>全部</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '28px', fontWeight: '600', color: '#71717a', display: 'block' }}>
              {statistics.byStatus.draft}
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>草稿</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '28px', fontWeight: '600', color: '#38bdf8', display: 'block' }}>
              {statistics.byStatus.in_progress}
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>进行中</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '28px', fontWeight: '600', color: '#4ade80', display: 'block' }}>
              {statistics.byStatus.published}
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>已发布</Text>
          </View>
        </View>
      </View>
    );
  };

  // 渲染热点区域
  const renderHotTopics = () => (
    <View style={{ 
      backgroundColor: '#111827',
      borderBottom: '1px solid #1e3a5f'
    }}
    >
      <View 
        style={{ 
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onClick={() => setShowInspiration(!showInspiration)}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <View style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(248, 113, 113, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          >
            <Flame size={18} color="#f87171" />
          </View>
          <View>
            <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>
              灵感数据参考
            </Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>
              实时热点 · 点击创建选题
            </Text>
          </View>
        </View>
        {showInspiration ? <ChevronUp size={20} color="#71717a" /> : <ChevronDown size={20} color="#71717a" />}
      </View>

      {showInspiration && (
        <View style={{ padding: '0 20px 16px' }}>
          {hotTopicsLoading ? (
            <View style={{ textAlign: 'center', padding: '20px 0' }}>
              <RefreshCw size={24} color="#38bdf8" />
            </View>
          ) : hotTopics.length > 0 ? (
            <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
              {hotTopics.map((topic, index) => (
                <View
                  key={topic.id || index}
                  style={{
                    display: 'inline-block',
                    marginRight: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    minWidth: '200px',
                    maxWidth: '280px',
                  }}
                  onClick={() => createFromHotTopic(topic)}
                >
                  <Text style={{ 
                    fontSize: '14px', 
                    color: '#ffffff', 
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  >
                    {topic.title}
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>{topic.source}</Text>
                    <TrendingUp size={12} color="#f87171" />
                    <Text style={{ fontSize: '12px', color: '#f87171' }}>
                      {topic.hotness > 1000000 ? `${(topic.hotness / 1000000).toFixed(1)}M` : 
                       topic.hotness > 1000 ? `${(topic.hotness / 1000).toFixed(0)}K` : topic.hotness}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', display: 'block', padding: '20px 0' }}>
              暂无热点数据
            </Text>
          )}
        </View>
      )}
    </View>
  );

  // 渲染筛选器
  const renderFilters = () => (
    <View style={{ 
      padding: '12px 20px', 
      backgroundColor: '#111827',
      borderBottom: '1px solid #1e3a5f'
    }}
    >
      <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* 搜索框 */}
        <View style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#1e293b', 
          borderRadius: '12px',
          padding: '10px 16px'
        }}
        >
          <Search size={18} color="#71717a" />
          <Input
            style={{ 
              flex: 1, 
              marginLeft: '8px', 
              fontSize: '14px', 
              color: '#ffffff',
              backgroundColor: 'transparent'
            }}
            placeholder="搜索选题..."
            placeholderStyle="color: #71717a"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            onConfirm={() => loadTopics(1)}
          />
          {searchKeyword && (
            <View onClick={() => { setSearchKeyword(''); loadTopics(1); }}>
              <X size={16} color="#71717a" />
            </View>
          )}
        </View>

        {/* 筛选按钮 */}
        <View 
          style={{ 
            padding: '10px',
            backgroundColor: showFilters ? '#38bdf8' : '#1e293b',
            borderRadius: '12px'
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <ListFilter size={18} color={showFilters ? '#000' : '#71717a'} />
        </View>
      </View>

      {/* 展开的筛选选项 */}
      {showFilters && (
        <View style={{ marginTop: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Text style={{ fontSize: '12px', color: '#71717a', width: '48px' }}>状态</Text>
            <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
              <View style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'all', label: '全部' },
                  { value: 'draft', label: '草稿' },
                  { value: 'in_progress', label: '进行中' },
                  { value: 'published', label: '已发布' },
                  { value: 'archived', label: '已归档' },
                ].map(item => (
                  <View
                    key={item.value}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: filterStatus === item.value ? '#38bdf8' : '#1e293b',
                      borderRadius: '8px',
                    }}
                    onClick={() => { setFilterStatus(item.value); loadTopics(1); }}
                  >
                    <Text style={{ 
                      fontSize: '13px', 
                      color: filterStatus === item.value ? '#000' : '#94a3b8',
                      whiteSpace: 'nowrap'
                    }}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ fontSize: '12px', color: '#71717a', width: '48px' }}>平台</Text>
            <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
              <View style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'all', label: '全部' },
                  ...PLATFORM_OPTIONS,
                ].map(item => (
                  <View
                    key={item.value}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: filterPlatform === item.value ? '#38bdf8' : '#1e293b',
                      borderRadius: '8px',
                    }}
                    onClick={() => { setFilterPlatform(item.value); loadTopics(1); }}
                  >
                    <Text style={{ 
                      fontSize: '13px', 
                      color: filterPlatform === item.value ? '#000' : '#94a3b8',
                      whiteSpace: 'nowrap'
                    }}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  // 渲染选题卡片
  const renderTopicCard = (topic: Topic) => {
    const statusConfig = STATUS_CONFIG[topic.status] || STATUS_CONFIG.draft;

    return (
      <View key={topic.id} style={{ 
        margin: '16px 20px',
        padding: '16px',
        backgroundColor: '#111827',
        borderRadius: '16px',
        border: '1px solid #1e3a5f'
      }}
      >
        {/* 标题和状态 */}
        <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <View style={{ flex: 1, marginRight: '12px' }}>
            <Text style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#ffffff', 
              display: 'block',
              lineHeight: '24px'
            }}
            >
              {topic.title}
            </Text>
          </View>
          <View style={{ 
            padding: '4px 10px',
            backgroundColor: statusConfig.bgColor,
            borderRadius: '8px',
            flexShrink: 0
          }}
          >
            <Text style={{ fontSize: '12px', color: statusConfig.color, fontWeight: '500' }}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* 描述 */}
        {topic.description && (
          <Text style={{ 
            fontSize: '14px', 
            color: '#94a3b8', 
            display: 'block',
            marginBottom: '12px',
            lineHeight: '20px'
          }}
          >
            {topic.description}
          </Text>
        )}

        {/* 标签行 */}
        <View style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {/* 来源标识 */}
          {topic.inspiration_data?.type === 'quick_note' ? (
            <View
              style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Lightbulb size={12} color="#fbbf24" />
              <Text style={{ fontSize: '12px', color: '#fbbf24' }}>灵感来源</Text>
            </View>
          ) : topic.inspiration_data?.type === 'hot_topic' ? (
            <View
              style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Flame size={12} color="#f87171" />
              <Text style={{ fontSize: '12px', color: '#f87171' }}>热点来源</Text>
            </View>
          ) : (
            <View
              style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(113, 113, 122, 0.2)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <PenLine size={12} color="#71717a" />
              <Text style={{ fontSize: '12px', color: '#71717a' }}>手动创建</Text>
            </View>
          )}
          <View style={{ 
            padding: '4px 10px', 
            backgroundColor: 'rgba(56, 189, 248, 0.2)', 
            borderRadius: '6px' 
          }}
          >
            <Text style={{ fontSize: '12px', color: '#38bdf8' }}>{topic.platform}</Text>
          </View>
          <View style={{ 
            padding: '4px 10px', 
            backgroundColor: 'rgba(74, 222, 128, 0.2)', 
            borderRadius: '6px' 
          }}
          >
            <Text style={{ fontSize: '12px', color: '#4ade80' }}>{topic.content_type}</Text>
          </View>
          {topic.category && (
            <View style={{ 
              padding: '4px 10px', 
              backgroundColor: 'rgba(168, 85, 247, 0.2)', 
              borderRadius: '6px' 
            }}
            >
              <Text style={{ fontSize: '12px', color: '#a855f7' }}>{topic.category}</Text>
            </View>
          )}
          {topic.ai_analysis && (
            <View style={{ 
              padding: '4px 10px', 
              backgroundColor: 'rgba(251, 191, 36, 0.2)', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            >
              <Sparkles size={12} color="#fbbf24" />
              <Text style={{ fontSize: '12px', color: '#fbbf24' }}>已分析</Text>
            </View>
          )}
        </View>

        {/* 底部信息和操作 */}
        <View style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #1e293b'
        }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color="#71717a" />
            <Text style={{ fontSize: '12px', color: '#71717a' }}>
              {formatTime(topic.updated_at)}
            </Text>
          </View>

          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 下一步：开始创作 */}
            <View
              style={{ 
                padding: '6px 12px', 
                backgroundColor: '#38bdf8', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => {
                // 将选题信息存储到 Storage
                Taro.setStorageSync('selectedTopicForCreation', {
                  id: topic.id,
                  title: topic.title,
                  description: topic.description,
                  category: topic.category,
                  platform: topic.platform,
                  content_type: topic.content_type,
                  target_audience: topic.target_audience,
                  key_points: topic.key_points,
                  ai_analysis: topic.ai_analysis,
                });
                // 跳转到内容创作页面
                Taro.navigateTo({ url: '/pages/content-creation/index' });
              }}
            >
              <Text style={{ fontSize: '13px', fontWeight: '500', color: '#000' }}>下一步</Text>
              <ArrowRight size={14} color="#000" />
            </View>

            {/* 分析按钮 */}
            <View
              style={{ 
                padding: '6px', 
                backgroundColor: '#1e293b', 
                borderRadius: '8px'
              }}
              onClick={() => handleAIAnalysis(topic)}
            >
              <Sparkles size={16} color={topic.ai_analysis ? '#fbbf24' : '#38bdf8'} />
            </View>

            {/* 编辑按钮 */}
            <View
              style={{ padding: '6px', backgroundColor: '#1e293b', borderRadius: '8px' }}
              onClick={() => openEditModal(topic)}
            >
              <Pencil size={16} color="#38bdf8" />
            </View>

            {/* 删除按钮 */}
            <View
              style={{ padding: '6px', backgroundColor: '#1e293b', borderRadius: '8px' }}
              onClick={() => handleDelete(topic.id)}
            >
              <Trash2 size={16} color="#f87171" />
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 渲染创建/编辑弹窗
  const renderFormModal = (isEdit: boolean) => {
    if (!showCreateModal && !showEditModal) return null;
    if (isEdit && !showEditModal) return null;
    if (!isEdit && !showCreateModal) return null;

    return (
      <View style={{
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
        <View style={{
          width: '100%',
          maxHeight: '80vh',
          backgroundColor: '#111827',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px',
        }}
        >
          {/* 弹窗头部 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
              {isEdit ? '编辑选题' : '新建选题'}
            </Text>
            <View onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); resetForm(); }}>
              <X size={24} color="#71717a" />
            </View>
          </View>

          <ScrollView scrollY style={{ maxHeight: '60vh' }}>
            {/* 标题 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                选题标题 *
              </Text>
              <View style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '12px', 
                padding: '12px 16px' 
              }}
              >
                <Input
                  style={{ fontSize: '15px', color: '#ffffff', width: '100%' }}
                  placeholder="输入选题标题"
                  placeholderStyle="color: #71717a"
                  value={formData.title}
                  onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
                />
              </View>
            </View>

            {/* 描述 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                选题描述
              </Text>
              <View style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '12px', 
                padding: '12px 16px' 
              }}
              >
                <Textarea
                  style={{ fontSize: '15px', color: '#ffffff', width: '100%', minHeight: '80px' }}
                  placeholder="输入选题描述（可选）"
                  placeholderStyle="color: #71717a"
                  value={formData.description}
                  onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
                />
              </View>
            </View>

            {/* 平台和内容类型 */}
            <View style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                  发布平台
                </Text>
                <View style={{ 
                  backgroundColor: '#1e293b', 
                  borderRadius: '12px', 
                  padding: '12px 16px' 
                }}
                >
                  <Picker
                    mode="selector"
                    range={PLATFORM_OPTIONS}
                    rangeKey="label"
                    value={PLATFORM_OPTIONS.findIndex(p => p.value === formData.platform)}
                    onChange={(e) => {
                      const idx = e.detail.value;
                      setFormData({ ...formData, platform: PLATFORM_OPTIONS[idx].value });
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '15px', color: '#ffffff' }}>
                        {PLATFORM_OPTIONS.find(p => p.value === formData.platform)?.label || '选择平台'}
                      </Text>
                      <ChevronDown size={16} color="#71717a" />
                    </View>
                  </Picker>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                  内容类型
                </Text>
                <View style={{ 
                  backgroundColor: '#1e293b', 
                  borderRadius: '12px', 
                  padding: '12px 16px' 
                }}
                >
                  <Picker
                    mode="selector"
                    range={CONTENT_TYPE_OPTIONS}
                    rangeKey="label"
                    value={CONTENT_TYPE_OPTIONS.findIndex(c => c.value === formData.content_type)}
                    onChange={(e) => {
                      const idx = e.detail.value;
                      setFormData({ ...formData, content_type: CONTENT_TYPE_OPTIONS[idx].value });
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '15px', color: '#ffffff' }}>
                        {CONTENT_TYPE_OPTIONS.find(c => c.value === formData.content_type)?.label || '选择类型'}
                      </Text>
                      <ChevronDown size={16} color="#71717a" />
                    </View>
                  </Picker>
                </View>
              </View>
            </View>

            {/* 分类 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                选题分类
              </Text>
              <View style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '12px', 
                padding: '12px 16px' 
              }}
              >
                <Input
                  style={{ fontSize: '15px', color: '#ffffff', width: '100%' }}
                  placeholder="如：产品推广、行业干货、用户故事"
                  placeholderStyle="color: #71717a"
                  value={formData.category}
                  onInput={(e) => setFormData({ ...formData, category: e.detail.value })}
                />
              </View>
            </View>

            {/* 目标受众 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                目标受众
              </Text>
              <View style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '12px', 
                padding: '12px 16px' 
              }}
              >
                <Input
                  style={{ fontSize: '15px', color: '#ffffff', width: '100%' }}
                  placeholder="如：25-35岁职场人士"
                  placeholderStyle="color: #71717a"
                  value={formData.target_audience}
                  onInput={(e) => setFormData({ ...formData, target_audience: e.detail.value })}
                />
              </View>
            </View>

            {/* 核心要点 */}
            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                核心要点
              </Text>
              <View style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '12px', 
                padding: '12px 16px' 
              }}
              >
                <Textarea
                  style={{ fontSize: '15px', color: '#ffffff', width: '100%', minHeight: '80px' }}
                  placeholder="列出内容的核心要点"
                  placeholderStyle="color: #71717a"
                  value={formData.key_points}
                  onInput={(e) => setFormData({ ...formData, key_points: e.detail.value })}
                />
              </View>
            </View>

            {/* 标签 */}
            <View style={{ marginBottom: '24px' }}>
              <Text style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                标签（用逗号分隔）
              </Text>
              <View style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '12px', 
                padding: '12px 16px' 
              }}
              >
                <Input
                  style={{ fontSize: '15px', color: '#ffffff', width: '100%' }}
                  placeholder="如：营销, 增长, 案例"
                  placeholderStyle="color: #71717a"
                  value={formData.tags}
                  onInput={(e) => setFormData({ ...formData, tags: e.detail.value })}
                />
              </View>
            </View>
          </ScrollView>

          {/* 提交按钮 */}
          <View style={{ display: 'flex', gap: '12px' }}>
            <View
              style={{ 
                flex: 1, 
                padding: '14px', 
                backgroundColor: '#1e293b', 
                borderRadius: '12px',
                textAlign: 'center'
              }}
              onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); resetForm(); }}
            >
              <Text style={{ fontSize: '15px', color: '#94a3b8' }}>取消</Text>
            </View>
            <View
              style={{ 
                flex: 1, 
                padding: '14px', 
                backgroundColor: '#38bdf8', 
                borderRadius: '12px',
                textAlign: 'center'
              }}
              onClick={isEdit ? handleUpdate : handleCreate}
            >
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
                {isEdit ? '保存' : '创建'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // 渲染分析弹窗
  const renderAIAnalysisModal = () => {
    if (!showAIAnalysisModal || !currentTopic) return null;

    return (
      <View style={{
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
        <View style={{
          width: '100%',
          maxHeight: '85vh',
          backgroundColor: '#111827',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px',
        }}
        >
          {/* 弹窗头部 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#fbbf24" />
              <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>选题分析报告</Text>
            </View>
            <View onClick={() => { setShowAIAnalysisModal(false); setAIAnalysisResult(null); }}>
              <X size={24} color="#71717a" />
            </View>
          </View>

          {/* 选题标题 */}
          <View style={{ 
            padding: '12px 16px', 
            backgroundColor: '#1e293b', 
            borderRadius: '12px',
            marginBottom: '16px'
          }}
          >
            <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px', display: 'block' }}>选题</Text>
            <Text style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>{currentTopic.title}</Text>
          </View>

          <ScrollView scrollY style={{ maxHeight: '55vh' }}>
            {aiAnalysisLoading ? (
              <View style={{ textAlign: 'center', padding: '40px 0' }}>
                <RefreshCw size={32} color="#38bdf8" />
                <Text style={{ fontSize: '14px', color: '#71717a', marginTop: '12px', display: 'block' }}>
                  正在分析中...
                </Text>
              </View>
            ) : aiAnalysisResult ? (
              <View>
                {/* 创意角度 */}
                {aiAnalysisResult.creativeAngles && (
                  <View style={{ marginBottom: '20px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>
                      💡 创意角度建议
                    </Text>
                    {(aiAnalysisResult.creativeAngles as any[]).map((angle, idx) => (
                      <View key={idx} style={{ 
                        padding: '12px', 
                        backgroundColor: '#1e293b', 
                        borderRadius: '12px',
                        marginBottom: '8px'
                      }}
                      >
                        <Text style={{ fontSize: '14px', fontWeight: '500', color: '#38bdf8', display: 'block' }}>
                          {angle.angle}
                        </Text>
                        <Text style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                          {angle.description}
                        </Text>
                        {angle.example && (
                          <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px', display: 'block' }}>
                            示例：{angle.example}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* 推荐关键词 */}
                {aiAnalysisResult.suggestedKeywords && (
                  <View style={{ marginBottom: '20px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>
                      🏷️ 推荐关键词
                    </Text>
                    <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(aiAnalysisResult.suggestedKeywords as string[]).map((keyword, idx) => (
                        <View key={idx} style={{ 
                          padding: '6px 12px', 
                          backgroundColor: 'rgba(56, 189, 248, 0.2)', 
                          borderRadius: '8px' 
                        }}
                        >
                          <Text style={{ fontSize: '13px', color: '#38bdf8' }}>{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 内容结构建议 */}
                {aiAnalysisResult.contentStructure && (
                  <View style={{ marginBottom: '20px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>
                      📝 内容结构建议
                    </Text>
                    <View style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '12px' }}>
                      <Text style={{ fontSize: '13px', color: '#4ade80', marginBottom: '8px', display: 'block' }}>
                        开头建议：
                      </Text>
                      <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', display: 'block' }}>
                        {aiAnalysisResult.contentStructure.introduction}
                      </Text>

                      <Text style={{ fontSize: '13px', color: '#4ade80', marginBottom: '8px', display: 'block' }}>
                        主要要点：
                      </Text>
                      {(aiAnalysisResult.contentStructure.mainPoints as string[] || []).map((point, idx) => (
                        <Text key={idx} style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                          {idx + 1}. {point}
                        </Text>
                      ))}

                      <Text style={{ fontSize: '13px', color: '#4ade80', marginTop: '12px', marginBottom: '8px', display: 'block' }}>
                        结尾建议：
                      </Text>
                      <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block' }}>
                        {aiAnalysisResult.contentStructure.conclusion}
                      </Text>
                    </View>
                  </View>
                )}

                {/* 平台优化建议 */}
                {aiAnalysisResult.platformOptimization && (
                  <View style={{ marginBottom: '20px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>
                      📱 平台优化建议
                    </Text>
                    <View style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '12px' }}>
                      {aiAnalysisResult.platformOptimization.title && (
                        <>
                          <Text style={{ fontSize: '13px', color: '#a855f7', marginBottom: '4px', display: 'block' }}>
                            优化标题：
                          </Text>
                          <Text style={{ fontSize: '14px', color: '#ffffff', marginBottom: '12px', display: 'block' }}>
                            {aiAnalysisResult.platformOptimization.title}
                          </Text>
                        </>
                      )}
                      {aiAnalysisResult.platformOptimization.coverSuggestion && (
                        <>
                          <Text style={{ fontSize: '13px', color: '#a855f7', marginBottom: '4px', display: 'block' }}>
                            封面建议：
                          </Text>
                          <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', display: 'block' }}>
                            {aiAnalysisResult.platformOptimization.coverSuggestion}
                          </Text>
                        </>
                      )}
                      {aiAnalysisResult.platformOptimization.formatTips && (
                        <>
                          <Text style={{ fontSize: '13px', color: '#a855f7', marginBottom: '4px', display: 'block' }}>
                            格式建议：
                          </Text>
                          <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block' }}>
                            {aiAnalysisResult.platformOptimization.formatTips}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                )}

                {/* 原始内容（如果解析失败） */}
                {aiAnalysisResult.rawContent && (
                  <View style={{ marginBottom: '20px' }}>
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>
                      📄 分析结果
                    </Text>
                    <View style={{ padding: '12px', backgroundColor: '#1e293b', borderRadius: '12px' }}>
                      <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '20px', display: 'block' }}>
                        {aiAnalysisResult.rawContent}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text style={{ fontSize: '14px', color: '#71717a' }}>暂无分析结果</Text>
              </View>
            )}
          </ScrollView>

          {/* 底部操作 */}
          <View style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <View
              style={{ 
                flex: 1, 
                padding: '14px', 
                backgroundColor: '#1e293b', 
                borderRadius: '12px',
                textAlign: 'center'
              }}
              onClick={() => { setShowAIAnalysisModal(false); setAIAnalysisResult(null); }}
            >
              <Text style={{ fontSize: '15px', color: '#94a3b8' }}>关闭</Text>
            </View>
            <View
              style={{ 
                flex: 1, 
                padding: '14px', 
                backgroundColor: '#38bdf8', 
                borderRadius: '12px',
                textAlign: 'center'
              }}
              onClick={() => {
                // 复制分析结果到剪贴板
                if (aiAnalysisResult) {
                  Taro.setClipboardData({
                    data: JSON.stringify(aiAnalysisResult, null, 2)
                  });
                  Taro.showToast({ title: '已复制', icon: 'success' });
                }
              }}
            >
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>复制结果</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="topic-planning-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top" style={{ marginBottom: '16px' }}>
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#f1f5f9" />
            </View>
            <Text className="header-title">选题策划</Text>
          </View>
          <View
            style={{
              padding: '10px 16px',
              backgroundColor: '#38bdf8',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => { resetForm(); setShowCreateModal(true); }}
          >
            <Plus size={18} color="#000" />
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>新建选题</Text>
          </View>
        </View>

        {/* 流程进度条 */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderRadius: '10px',
          }}
        >
          <View
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => Taro.navigateTo({ url: '/pages/quick-note/index' })}
          >
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#71717a' }} />
            <Text style={{ fontSize: '12px', color: '#71717a' }}>灵感速记</Text>
          </View>
          <ArrowRight size={14} color="#71717a" />
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <Text style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>选题策划</Text>
          </View>
          <ArrowRight size={14} color="#71717a" />
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#71717a' }} />
            <Text style={{ fontSize: '12px', color: '#71717a' }}>内容创作</Text>
          </View>
        </View>
      </View>

      {/* 统计卡片 */}
      {renderStatistics()}

      {/* 灵感数据参考 */}
      {renderHotTopics()}

      {/* 筛选器 */}
      {renderFilters()}

      {/* 选题列表 */}
      <ScrollView 
        scrollY 
        style={{ flex: 1, height: 'calc(100vh - 380px)' }}
        onScrollToLower={() => {
          if (topics.length < total && !loading) {
            loadTopics(page + 1);
          }
        }}
      >
        <View style={{ paddingBottom: '100px' }}>
          {loading && topics.length === 0 ? (
            <View className="loading-state">
              <RefreshCw size={48} color="#38bdf8" />
              <Text className="loading-text">加载中...</Text>
            </View>
          ) : topics.length === 0 ? (
            <View className="empty-state">
              <Target size={64} color="#71717a" />
              <Text className="empty-title">暂无选题</Text>
              <Text className="empty-desc">点击右上角「新建选题」开始创作</Text>
            </View>
          ) : (
            <View>
              {topics.map(topic => renderTopicCard(topic))}
              {loading && topics.length > 0 && (
                <View style={{ textAlign: 'center', padding: '20px' }}>
                  <RefreshCw size={24} color="#38bdf8" />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 创建弹窗 */}
      {renderFormModal(false)}

      {/* 编辑弹窗 */}
      {renderFormModal(true)}

      {/* 分析弹窗 */}
      {renderAIAnalysisModal()}
    </View>
  );
};

export default TopicPlanningPage;
