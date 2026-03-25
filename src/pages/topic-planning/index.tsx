import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Check,
  RefreshCw,
  Target,
  Flame,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import './index.css';

interface TopicQuestion {
  question: string;
  source: string;
  category: string;
  hotScore: number;
}

const TopicPlanningPage = () => {
  const [topicQuestions, setTopicQuestions] = useState<TopicQuestion[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/topic-questions',
        method: 'GET',
      });

      if (res.data.code === 200) {
        setTopicQuestions(res.data.data || []);
      }
    } catch (error) {
      console.error('加载选题失败', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicSelection = (question: string) => {
    setSelectedTopics((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };

  const handleSelectAll = () => {
    setSelectedTopics(topicQuestions.map((t) => t.question));
  };

  const handleClearAll = () => {
    setSelectedTopics([]);
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    try {
      Taro.setStorageSync('selectedTopics', selectedTopics);
      Taro.navigateTo({ url: '/pages/content-system/index' });
      Taro.showToast({ title: '已选择选题', icon: 'success' });
    } catch (error) {
      console.error('创建失败', error);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#22c55e';
    return '#71717a';
  };

  return (
    <View className="topic-planning-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top" style={{ marginBottom: '24px' }}>
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#fafafa" />
            </View>
            <Text className="header-title">选题策划</Text>
          </View>
        </View>

        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: '24px', color: '#71717a' }}>
            共 {topicQuestions.length} 个选题
          </Text>
          {selectedTopics.length > 0 && (
            <Text style={{ fontSize: '24px', color: '#f59e0b' }}>
              已选 {selectedTopics.length} 个
            </Text>
          )}
        </View>
      </View>

      {/* 操作栏 */}
      {topicQuestions.length > 0 && (
        <View
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View className="action-btn" onClick={selectedTopics.length === topicQuestions.length ? handleClearAll : handleSelectAll}>
            <Text style={{ fontSize: '24px', color: '#a1a1aa' }}>
              {selectedTopics.length === topicQuestions.length ? '取消全选' : '全选'}
            </Text>
          </View>
          <View className="action-btn" onClick={loadData}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={20} color="#a1a1aa" />
              <Text style={{ fontSize: '24px', color: '#a1a1aa' }}>刷新</Text>
            </View>
          </View>
        </View>
      )}

      {/* 选题列表 */}
      <View className="content-area">
        {loading ? (
          <View className="loading-state">
            <RefreshCw size={64} color="#f59e0b" />
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : topicQuestions.length === 0 ? (
          <View className="empty-state">
            <Target size={80} color="#71717a" />
            <Text className="empty-title">暂无选题数据</Text>
            <Text className="empty-desc">请先配置输入来源</Text>
          </View>
        ) : (
          topicQuestions.map((topic, index) => (
            <View
              key={index}
              className={`topic-card ${selectedTopics.includes(topic.question) ? 'topic-card-selected' : ''}`}
              onClick={() => toggleTopicSelection(topic.question)}
            >
              <View className="topic-header">
                <View className="topic-content">
                  <Text className="topic-title">{topic.question}</Text>
                </View>
                
                <View className={`checkbox ${selectedTopics.includes(topic.question) ? 'checkbox-checked' : ''}`}>
                  {selectedTopics.includes(topic.question) && (
                    <Check size={24} color="#f59e0b" />
                  )}
                </View>
              </View>

              <View className="topic-labels">
                <View className="topic-label label-category">
                  {topic.category || '通用'}
                </View>
                <View className="topic-label label-source">
                  {topic.source || '选题库'}
                </View>
                
                <View className="hot-score">
                  <Flame size={20} color={getScoreColor(topic.hotScore)} />
                  <Text
                    style={{
                      fontSize: '22px',
                      fontWeight: '600',
                      color: getScoreColor(topic.hotScore),
                    }}
                  >
                    {topic.hotScore}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 底部操作栏 */}
      {selectedTopics.length > 0 && (
        <View className="bottom-bar">
          <View className="bottom-bar-secondary" onClick={handleClearAll}>
            <Text style={{ fontSize: '28px', color: '#a1a1aa' }}>
              清空 ({selectedTopics.length})
            </Text>
          </View>
          <View className="bottom-bar-primary" onClick={handleGenerate}>
            <Text style={{ fontSize: '28px', fontWeight: '600', color: '#000' }}>
              开始创作 ({selectedTopics.length})
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TopicPlanningPage;
