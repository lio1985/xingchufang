import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Check,
  RefreshCw,
  Target,
  Flame,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-taro';
import { Network } from '@/network';
import KnowledgeSelector from '@/components/KnowledgeSelector';
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

  // 知识库相关状态
  const [showKnowledgeSelector, setShowKnowledgeSelector] = useState(false);
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>([]);
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/topic-questions',
        method: 'GET',
      });

      console.log('[TopicPlanning] 选题数据:', res);

      if (res.data?.code === 200) {
        setTopicQuestions(res.data.data || []);
      }
    } catch (error) {
      console.error('[TopicPlanning] 加载选题失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleKnowledgeChange = (ids: string[], sources: string[]) => {
    setSelectedKnowledgeIds(ids);
    setSelectedKnowledgeSources(sources);
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    try {
      // 存储选中的选题和知识库
      Taro.setStorageSync('selectedTopics', selectedTopics);
      Taro.setStorageSync('selectedKnowledgeIds', selectedKnowledgeIds);
      Taro.setStorageSync('selectedKnowledgeSources', selectedKnowledgeSources);

      Taro.navigateTo({ url: '/pages/content-creation/index' });
      Taro.showToast({ title: '已选择选题', icon: 'success' });
    } catch (error) {
      console.error('[TopicPlanning] 创建失败:', error);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#f87171';
    if (score >= 60) return '#38bdf8';
    if (score >= 40) return '#4ade80';
    return '#71717a';
  };

  return (
    <View className="topic-planning-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top" style={{ marginBottom: '24px' }}>
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#f1f5f9" />
            </View>
            <Text className="header-title">选题策划</Text>
          </View>
        </View>

        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: '24px', color: '#71717a' }}>
            共 {topicQuestions.length} 个选题
          </Text>
          {selectedTopics.length > 0 && (
            <Text style={{ fontSize: '24px', color: '#38bdf8' }}>
              已选 {selectedTopics.length} 个
            </Text>
          )}
        </View>
      </View>

      {/* 知识库选择区域 */}
      <View style={{ padding: '16px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onClick={() => setShowKnowledgeSelector(!showKnowledgeSelector)}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <View style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#38bdf8" />
            </View>
            <View>
              <Text style={{ fontSize: '15px', fontWeight: '500', color: '#ffffff', display: 'block' }}>知识库参考</Text>
              {selectedKnowledgeIds.length > 0 ? (
                <Text style={{ fontSize: '12px', color: '#38bdf8', display: 'block', marginTop: '2px' }}>已选 {selectedKnowledgeIds.length} 条知识内容</Text>
              ) : (
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>选择知识库内容辅助创作</Text>
              )}
            </View>
          </View>
          {showKnowledgeSelector ? <ChevronUp size={20} color="#71717a" /> : <ChevronDown size={20} color="#71717a" />}
        </View>

        {/* 展开的知识库选择器 */}
        {showKnowledgeSelector && (
          <View style={{ marginTop: '12px' }}>
            <KnowledgeSelector
              selectedIds={selectedKnowledgeIds}
              selectedSources={selectedKnowledgeSources}
              onChange={handleKnowledgeChange}
            />
          </View>
        )}
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
            <Text style={{ fontSize: '24px', color: '#94a3b8' }}>
              {selectedTopics.length === topicQuestions.length ? '取消全选' : '全选'}
            </Text>
          </View>
          <View className="action-btn" onClick={loadData}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={20} color="#94a3b8" />
              <Text style={{ fontSize: '24px', color: '#94a3b8' }}>刷新</Text>
            </View>
          </View>
        </View>
      )}

      {/* 选题列表 */}
      <ScrollView scrollY style={{ flex: 1, height: 'calc(100vh - 320px)' }}>
        <View className="content-area">
          {loading ? (
            <View className="loading-state">
              <RefreshCw size={64} color="#38bdf8" />
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
                      <Check size={24} color="#38bdf8" />
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
      </ScrollView>

      {/* 底部操作栏 */}
      {selectedTopics.length > 0 && (
        <View className="bottom-bar">
          <View className="bottom-bar-secondary" onClick={handleClearAll}>
            <Text style={{ fontSize: '28px', color: '#94a3b8' }}>
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
