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
    trendChange?: number;
    isBursting?: boolean;
    url?: string;
    category?: string;
    siteName?: string;
    publishTime?: string;
    summary?: string;
    keywords?: string[];
    sentiment?: {
        positive: number;
        negative: number;
        neutral: number;
        controversies?: string[];
    };
    angles?: string[];
    relatedTopics?: HotTopic[];
    timeline?: Array<{
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
