export interface InputSourceConfig {
  platforms: PlatformType[];
  customQuestions: CustomQuestionInput;
  hotTopicSources: HotTopicSource[];
}

export type PlatformType = 'douyin' | 'xiaohongshu' | 'shipinhao';

export interface CustomQuestionInput {
  liveQuestions: string[];
  salesQuestions: string[];
  commentQuestions: string[];
}

export type HotTopicSource = 'douyin' | 'baidu' | 'toutiao' | 'weibo' | 'zhihu' | 'bilibili' | 'juejin' | 'github' | 'all';

export interface HotTopic {
  id: string;
  source: HotTopicSource;
  title: string;
  hotness: number;
  trend: 'up' | 'down' | 'stable';
  trendChange?: number; // 趋势变化百分比
  isBursting?: boolean; // 是否正在爆发
  url?: string;
  category?: string;
  siteName?: string;
  publishTime?: string;
  summary?: string; // 摘要预览
  keywords?: string[]; // 关键词列表
  sentiment?: { // 舆情分析
    positive: number; // 正面比例
    negative: number; // 负面比例
    neutral: number; // 中性比例
    controversies?: string[]; // 争议点
  };
  angles?: string[]; // 创作角度建议
  relatedTopics?: HotTopic[]; // 相关热点
  timeline?: Array<{ // 热点时间轴
    time: string;
    hotness: number;
    event: string;
  }>;
}

export interface InputSourcesResponse {
  code: number;
  msg: string;
  data: InputSourceConfig | null;
}

export interface HotTopicsResponse {
  code: number;
  msg: string;
  data: {
    source: HotTopicSource;
    topics: HotTopic[];
    updateTime: string;
  }[];
}
