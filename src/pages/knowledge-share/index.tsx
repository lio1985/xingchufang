import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Eye, Clock, ThumbsUp, Search } from 'lucide-react-taro';
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
          keyword: searchKeyword
        }
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
      url: `/pages/knowledge-share/detail?id=${item.id}`
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
    <View className="min-h-screen bg-sky-50">
      {/* 顶部标题栏 */}
      <View className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <View className="flex items-center gap-2">
          <BookOpen size={24} color="#60a5fa" />
          <Text className="block text-xl font-bold text-white">知识分享</Text>
        </View>
        <View
          className="bg-blue-500 px-3 py-1.5 rounded-lg flex items-center gap-1 active:opacity-80"
          onClick={handleCreateKnowledge}
        >
          <Plus size={18} color="white" />
          <Text className="block text-sm text-white">分享</Text>
        </View>
      </View>

      {/* 搜索栏 */}
      <View className="px-4 py-3 bg-white">
        <View className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Search size={18} color="#94a3b8" />
          <View className="flex-1">
            <input
              className="w-full bg-transparent text-white text-sm placeholder-slate-400 outline-none"
              placeholder="搜索知识内容..."
              value={searchKeyword}
              onInput={(e) => setSearchKeyword((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  loadKnowledgeList();
                }
              }}
            />
          </View>
        </View>
      </View>

      {/* 知识列表 */}
      <ScrollView className="flex-1" scrollY>
        <View className="p-4">
          {loading ? (
            <View className="text-center py-20">
              <Text className="block text-sm text-slate-500">加载中...</Text>
            </View>
          ) : knowledgeList.length === 0 ? (
            <View className="text-center py-20">
              <BookOpen size={64} color="#334155" />
              <Text className="block text-sm text-slate-500 mt-4">暂无知识分享</Text>
              <View
                className="inline-block mt-4 px-6 py-2 bg-sky-500/20 border border-sky-500/30 rounded-lg"
                onClick={handleCreateKnowledge}
              >
                <Text className="block text-sm text-sky-600">创建第一条知识分享</Text>
              </View>
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              {knowledgeList.map((item) => (
                <View
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 active:scale-[0.99] transition-transform"
                  onClick={() => handleViewDetail(item)}
                >
                  {/* 标题 */}
                  <Text className="block text-lg font-semibold text-white mb-2">
                    {item.title}
                  </Text>

                  {/* 内容摘要 */}
                  <Text className="block text-sm text-slate-500 mb-3 line-clamp-2">
                    {item.content}
                  </Text>

                  {/* 标签 */}
                  {item.tags && item.tags.length > 0 && (
                    <View className="flex flex-wrap gap-2 mb-3">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <View
                          key={idx}
                          className="bg-slate-50 px-2 py-1 rounded"
                        >
                          <Text className="block text-xs text-slate-600">{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 底部信息 */}
                  <View className="flex items-center justify-between text-slate-500">
                    <View className="flex items-center gap-4">
                      <Text className="block text-xs">{item.author}</Text>
                      <View className="flex items-center gap-1">
                        <Clock size={12} />
                        <Text className="block text-xs">{formatTime(item.createdAt)}</Text>
                      </View>
                    </View>
                    <View className="flex items-center gap-3">
                      <View className="flex items-center gap-1">
                        <Eye size={12} />
                        <Text className="block text-xs">{item.viewCount}</Text>
                      </View>
                      <View className="flex items-center gap-1">
                        <ThumbsUp size={12} />
                        <Text className="block text-xs">{item.likeCount}</Text>
                      </View>
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
