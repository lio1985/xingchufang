import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/topic-questions',
        method: 'GET'
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
    setSelectedTopics(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const handleSelectAll = () => {
    setSelectedTopics(topicQuestions.map(t => t.question));
  };

  const handleClearAll = () => {
    setSelectedTopics([]);
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      Taro.showToast({ title: '请先选择选题', icon: 'none' });
      return;
    }

    setIsGenerating(true);
    try {
      Taro.setStorageSync('selectedTopics', selectedTopics);
      Taro.navigateTo({ url: '/pages/content-system/index' });
      Taro.showToast({ title: '已选择选题', icon: 'success' });
    } catch (error) {
      console.error('创建失败', error);
      Taro.showToast({ title: '创建失败', icon: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#22c55e';
    return '#71717a';
  };

  return (
    <View style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0b',
      paddingBottom: '140px'
    }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <View style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <View 
            style={{ padding: '8px' }}
            onClick={() => Taro.navigateBack()}
          >
            <Text style={{ fontSize: '32px', color: '#fafafa' }}>←</Text>
          </View>
          <Text style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: '#fafafa'
          }}>
            选题策划
          </Text>
        </View>

        <View style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{ 
            fontSize: '24px', 
            color: '#71717a'
          }}>
            共 {topicQuestions.length} 个选题
          </Text>
          {selectedTopics.length > 0 && (
            <Text style={{ 
              fontSize: '24px', 
              color: '#f59e0b'
            }}>
              已选 {selectedTopics.length} 个
            </Text>
          )}
        </View>
      </View>

      {/* 操作栏 */}
      {topicQuestions.length > 0 && (
        <View style={{
          padding: '24px 32px',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View 
            style={{
              padding: '12px 20px',
              backgroundColor: '#141416',
              borderRadius: '12px',
              border: '1px solid #27272a'
            }}
            onClick={selectedTopics.length === topicQuestions.length ? handleClearAll : handleSelectAll}
          >
            <Text style={{ 
              fontSize: '24px', 
              color: '#a1a1aa'
            }}>
              {selectedTopics.length === topicQuestions.length ? '取消全选' : '全选'}
            </Text>
          </View>
          <View 
            style={{
              padding: '12px 20px',
              backgroundColor: '#141416',
              borderRadius: '12px',
              border: '1px solid #27272a'
            }}
            onClick={loadData}
          >
            <Text style={{ fontSize: '24px', color: '#a1a1aa' }}>🔄 刷新</Text>
          </View>
        </View>
      )}

      {/* 选题列表 */}
      <View style={{ padding: '32px' }}>
        {loading ? (
          <View style={{ 
            textAlign: 'center', 
            paddingTop: '120px' 
          }}>
            <Text style={{ fontSize: '64px' }}>⏳</Text>
            <Text style={{ 
              fontSize: '28px', 
              color: '#71717a',
              marginTop: '24px'
            }}>
              加载中...
            </Text>
          </View>
        ) : topicQuestions.length === 0 ? (
          <View style={{ 
            textAlign: 'center', 
            paddingTop: '120px' 
          }}>
            <Text style={{ fontSize: '80px' }}>🎯</Text>
            <Text style={{ 
              fontSize: '28px', 
              color: '#71717a',
              marginTop: '24px'
            }}>
              暂无选题数据
            </Text>
            <Text style={{ 
              fontSize: '24px', 
              color: '#52525b',
              marginTop: '16px'
            }}>
              请先配置输入来源
            </Text>
          </View>
        ) : (
          topicQuestions.map((topic, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#141416',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '16px',
                border: '1px solid #27272a',
                borderLeftWidth: '4px',
                borderLeftColor: selectedTopics.includes(topic.question) ? '#f59e0b' : '#27272a'
              }}
              onClick={() => toggleTopicSelection(topic.question)}
            >
              <View style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: '28px', 
                    fontWeight: '600', 
                    color: '#fafafa',
                    display: 'block',
                    lineHeight: '1.4'
                  }}>
                    {topic.question}
                  </Text>
                </View>
                <View style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: selectedTopics.includes(topic.question) 
                    ? 'rgba(245, 158, 11, 0.2)' 
                    : '#1a1a1d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '16px'
                }}>
                  <Text style={{ fontSize: '24px' }}>
                    {selectedTopics.includes(topic.question) ? '✓' : ''}
                  </Text>
                </View>
              </View>

              <View style={{ 
                display: 'flex', 
                gap: '16px',
                alignItems: 'center'
              }}>
                <View style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  fontSize: '20px',
                  color: '#3b82f6'
                }}>
                  {topic.category || '通用'}
                </View>
                <View style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px',
                  fontSize: '20px',
                  color: '#22c55e'
                }}>
                  {topic.source || '选题库'}
                </View>
                <View style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: 'auto'
                }}>
                  <Text style={{ 
                    fontSize: '20px',
                    color: getScoreColor(topic.hotScore)
                  }}>
                    🔥
                  </Text>
                  <Text style={{ 
                    fontSize: '22px',
                    fontWeight: '600',
                    color: getScoreColor(topic.hotScore)
                  }}>
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
        <View style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#141416',
          borderTop: '1px solid #27272a',
          padding: '24px 32px',
          display: 'flex',
          gap: '16px',
          zIndex: 100
        }}>
          <View 
            style={{
              flex: 1,
              padding: '24px',
              backgroundColor: '#1a1a1d',
              borderRadius: '16px',
              border: '1px solid #27272a',
              textAlign: 'center'
            }}
            onClick={handleClearAll}
          >
            <Text style={{ 
              fontSize: '28px', 
              color: '#a1a1aa'
            }}>
              清空 ({selectedTopics.length})
            </Text>
          </View>
          <View 
            style={{
              flex: 2,
              padding: '24px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
              borderRadius: '16px',
              textAlign: 'center'
            }}
            onClick={handleGenerate}
          >
            <Text style={{ 
              fontSize: '28px', 
              fontWeight: '600',
              color: '#000'
            }}>
              开始创作 ({selectedTopics.length})
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TopicPlanningPage;
