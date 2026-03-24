import { Injectable } from '@nestjs/common';

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
}

export interface RecommendedTopic {
  question: string;
  hotness: string;
  type: string;
  platforms: string[];
  category?: string;
  reason?: string;
}

@Injectable()
export class AiAnalysisService {
  // AI分析问题
  async analyzeQuestions(questions: string[]): Promise<AnalysisResult> {
    // 这里可以集成真实的AI服务，暂时使用模拟数据
    const summary = `您共提供了 ${questions.length} 个问题，主要集中在用户关心的装修预算、设计风格、材料选择等核心话题。`;
    
    const keyPoints = [
      '用户关注装修预算分配问题',
      '对不同装修风格有明确偏好',
      '关心环保材料的使用',
      '重视施工质量和服务保障',
      '对智能家居配置有需求'
    ];

    const suggestions = [
      '建议推出"装修预算计算器"工具',
      '提供多种风格案例对比展示',
      '制作环保材料专题内容',
      '强化施工过程透明化展示',
      '增加智能家居产品推荐'
    ];

    return { summary, keyPoints, suggestions };
  }

  // AI推荐选题
  async recommendTopics(
    platforms: string[],
    questions: string[],
    hotTopics: any[],
    preferences?: {
      industries: string[];
      interests: string[];
      newsCategories: string[];
    }
  ): Promise<RecommendedTopic[]> {
    const platformNames: Record<string, string> = {
      douyin: '抖音',
      xiaohongshu: '小红书',
      shipinhao: '视频号'
    };

    const recommendedTopics: RecommendedTopic[] = [];

    // 基于热点推荐
    if (hotTopics.length > 0) {
      const topHotTopics = hotTopics
        .sort((a, b) => b.hotness - a.hotness)
        .slice(0, 5);

      topHotTopics.forEach((topic, index) => {
        const hotnessValue = Math.floor(90 - index * 3 + Math.random() * 5);
        recommendedTopics.push({
          question: topic.title,
          hotness: `热度 ${hotnessValue}`,
          type: 'hot',
          platforms: [topic.source],
          category: topic.category || '热门',
          reason: `该话题在${platformNames[topic.source]}热度达${(topic.hotness / 10000).toFixed(1)}万`
        });
      });
    }

    // 基于问题推荐
    if (questions.length > 0) {
      questions.slice(0, 5).forEach((question, index) => {
        const hotnessValue = Math.floor(85 - index * 4 + Math.random() * 5);
        const selectedPlatforms = platforms.length > 0 ? platforms.slice(0, 2) : ['douyin'];
        recommendedTopics.push({
          question: question,
          hotness: `热度 ${hotnessValue}`,
          type: 'live',
          platforms: selectedPlatforms,
          category: '问题',
          reason: '基于用户关注问题生成'
        });
      });
    }

    // 如果没有推荐，提供默认推荐
    if (recommendedTopics.length === 0) {
      recommendedTopics.push({
        question: '如何优化内容创作效率？',
        hotness: '热度 92',
        type: 'live',
        platforms: platforms.length > 0 ? platforms : ['douyin'],
        category: '效率'
      });
    }

    // 确保返回不超过10个选题
    return recommendedTopics.slice(0, 10);
  }

  // 提取关键词
  private extractKeywords(questions: string[]): string[] {
    const keywords: string[] = [];
    const keywordMap: Record<string, number> = {};

    questions.forEach(question => {
      // 简单关键词提取（实际项目中应使用更复杂的NLP算法）
      const commonKeywords = [
        '预算', '设计', '材料', '施工', '风格',
        '智能家居', '环保', '全屋定制', '收纳', '装修'
      ];

      commonKeywords.forEach(keyword => {
        if (question.includes(keyword)) {
          keywordMap[keyword] = (keywordMap[keyword] || 0) + 1;
        }
      });
    });

    // 按出现频率排序
    Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1])
      .forEach(([keyword]) => keywords.push(keyword));

    return keywords.slice(0, 5);
  }
}
