import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  Heart,
  RefreshCw,
  Tag,
  ChevronRight,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  tags?: string[];
}

const KnowledgeSharePage = () => {
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  const loadKnowledgeList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await Network.request({
        url: '/api/knowledge-shares',
        method: 'GET',
        data: {
          keyword: searchKeyword,
        },
      });

      if (res.data?.code === 200) {
        setKnowledgeList(res.data.data || []);
      }
    } catch (error) {
      console.error('[KnowledgeShare] 加载失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword]);

  useEffect(() => {
    loadKnowledgeList();
  }, [loadKnowledgeList]);

  const handleCreateKnowledge = () => {
    Taro.navigateTo({ url: '/pages/knowledge-share/create' });
  };

  const handleViewDetail = (item: KnowledgeItem) => {
    Taro.navigateTo({
      url: `/pages/knowledge-share/detail?id=${item.id}`,
    });
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

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#141416' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <BookOpen size={24} color="#a855f7" />
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginLeft: '8px' }}>公司资料</Text>
          </View>
          <View
            style={{ backgroundColor: '#a855f7', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center' }}
            onClick={handleCreateKnowledge}
          >
            <Plus size={16} color="#ffffff" />
            <Text style={{ fontSize: '13px', color: '#ffffff', marginLeft: '4px' }}>新建</Text>
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="#71717a" />
          <Input
            style={{ flex: 1, fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent', marginLeft: '8px' }}
            placeholder="搜索知识内容..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            onConfirm={() => loadKnowledgeList()}
          />
        </View>
        
        {/* 统计 */}
        <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '12px' }}>共 {knowledgeList.length} 条知识</Text>
      </View>

      {/* 知识列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 200px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {loading ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
              <RefreshCw size={32} color="#f59e0b" />
              <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>加载中...</Text>
            </View>
          ) : knowledgeList.length === 0 ? (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
              <View style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={32} color="#52525b" />
              </View>
              <Text style={{ fontSize: '16px', color: '#71717a', display: 'block', marginTop: '16px' }}>
                {searchKeyword ? '没有找到相关知识' : '暂无知识分享'}
              </Text>
              {!searchKeyword && (
                <View
                  style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#a855f7', borderRadius: '20px' }}
                  onClick={handleCreateKnowledge}
                >
                  <Text style={{ fontSize: '14px', color: '#ffffff' }}>创建第一条知识分享</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              {knowledgeList.map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                  onClick={() => handleViewDetail(item)}
                >
                  {/* 标题和分类 */}
                  <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', flex: 1, marginRight: '8px' }}>{item.title}</Text>
                    {item.category && (
                      <View style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(168, 85, 247, 0.2)', flexShrink: 0 }}>
                        <Text style={{ fontSize: '12px', color: '#a855f7' }}>{item.category}</Text>
                      </View>
                    )}
                  </View>

                  {/* 标签 */}
                  {item.tags && item.tags.length > 0 && (
                    <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <View key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={12} color="#71717a" />
                          <Text style={{ fontSize: '12px', color: '#71717a' }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 内容 */}
                  <Text style={{ fontSize: '13px', color: '#a1a1aa', display: 'block', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.content}
                  </Text>

                  {/* 底部信息 */}
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} color="#52525b" />
                        <Text style={{ fontSize: '12px', color: '#71717a' }}>{item.viewCount}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={14} color="#52525b" />
                        <Text style={{ fontSize: '12px', color: '#71717a' }}>{item.likeCount}</Text>
                      </View>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <Text style={{ fontSize: '12px', color: '#52525b' }}>{formatTime(item.createdAt)}</Text>
                      <ChevronRight size={16} color="#52525b" />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default KnowledgeSharePage;
