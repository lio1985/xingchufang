import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Plus,
  Search,
  BookOpen,
  Eye,
  Heart,
  RefreshCw,
  Tag,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import './index.css';

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
      console.error('加载知识分享失败:', error);
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
    <View className="knowledge-share-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top">
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#fafafa" />
            </View>
            <View className="header-title-group">
              <Text className="header-title">知识分享</Text>
              <Text className="header-subtitle">{knowledgeList.length} 条知识</Text>
            </View>
          </View>

          <View className="primary-action-btn" onClick={handleCreateKnowledge}>
            <Plus size={40} color="#000" />
          </View>
        </View>

        {/* 搜索框 */}
        <View className="search-box">
          <Search size={28} color="#71717a" />
          <Input
            className="search-input"
            placeholder="搜索知识内容..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            onConfirm={() => loadKnowledgeList()}
          />
        </View>
      </View>

      {/* 知识列表 */}
      <ScrollView className="flex-1" scrollY style={{ height: 'calc(100vh - 200px)' }}>
        <View className="content-area">
          {loading ? (
            <View className="loading-state">
              <RefreshCw size={64} color="#f59e0b" />
              <Text className="loading-text">加载中...</Text>
            </View>
          ) : knowledgeList.length === 0 ? (
            <View className="empty-state">
              <View className="empty-icon">
                <BookOpen size={56} color="#f59e0b" />
              </View>
              <Text className="empty-title">
                {searchKeyword ? '没有找到相关知识' : '暂无知识分享'}
              </Text>
              {!searchKeyword && (
                <Text className="empty-action" onClick={handleCreateKnowledge}>
                  创建第一条知识分享
                </Text>
              )}
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {knowledgeList.map((item) => (
                <View
                  key={item.id}
                  className="knowledge-card"
                  onClick={() => handleViewDetail(item)}
                >
                  <View className="knowledge-header">
                    <Text className="knowledge-title">{item.title}</Text>
                    {item.category && (
                      <View className="knowledge-category">{item.category}</View>
                    )}
                  </View>

                  {item.tags && item.tags.length > 0 && (
                    <View className="knowledge-tags">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <View key={idx} className="knowledge-tag">
                          <Tag size={14} color="#71717a" />
                          <Text style={{ marginLeft: '4px', fontSize: '20px' }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text className="knowledge-content">{item.content}</Text>

                  <View className="knowledge-footer">
                    <View className="knowledge-meta">
                      <View className="knowledge-meta-item">
                        <Eye size={18} color="#52525b" />
                        <Text>{item.viewCount}</Text>
                      </View>
                      <View className="knowledge-meta-item">
                        <Heart size={18} color="#52525b" />
                        <Text>{item.likeCount}</Text>
                      </View>
                    </View>
                    <Text className="knowledge-time">{formatTime(item.createdAt)}</Text>
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
