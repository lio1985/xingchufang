// 版本控制配置
export const APP_CONFIG = {
  VERSION: '2.0.0',
  BUILD_TIME: '2026-03-24 21:31:00',
  LAST_UPDATE: '2026-03-24 21:31:00',
};

// 功能配置
export const FEATURES = {
  // 核心业务
  core: [
    {
      id: 'customer',
      title: '客户管理',
      desc: '客户资料管理与跟进',
      icon: 'Users',
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-600',
      url: '/pages/customer/index',
    },
    {
      id: 'recycle',
      title: '回收业务',
      desc: '厨具设备回收管理',
      icon: 'Recycle',
      color: '#10B981',
      gradient: 'from-emerald-500 to-emerald-600',
      url: '/pages/recycle/index',
    },
  ],
  
  // 次级功能
  secondary: [
    {
      id: 'quick-note',
      title: '灵感速记',
      desc: '快速记录灵感',
      icon: 'Lightbulb',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      url: '/pages/quick-note/index',
    },
    {
      id: 'knowledge-share',
      title: '知识分享',
      desc: '经验技巧分享',
      icon: 'BookOpen',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
      url: '/pages/knowledge-share/index',
    },
    {
      id: 'topic-planning',
      title: '选题策划',
      desc: '发现优质选题',
      icon: 'Sparkles',
      color: '#06B6D4',
      bgColor: '#CFFAFE',
      url: '/pages/topic-planning/index',
    },
    {
      id: 'content-system',
      title: '内容创作',
      desc: '高效内容生成',
      icon: 'PenTool',
      color: '#6366F1',
      bgColor: '#E0E7FF',
      url: '/pages/content-system/index',
    },
    {
      id: 'lexicon-manage',
      title: '语料优化',
      desc: '语料库管理',
      icon: 'TrendingUp',
      color: '#14B8A6',
      bgColor: '#CCFBF1',
      url: '/pages/lexicon-manage/index',
    },
    {
      id: 'viral-system',
      title: '爆款复刻',
      desc: '爆款内容解析',
      icon: 'Sparkles',
      color: '#EC4899',
      bgColor: '#FCE7F3',
      url: '/pages/viral-system/index',
    },
    {
      id: 'live-data',
      title: '直播数据',
      desc: '数据分析复盘',
      icon: 'Video',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      url: '/pages/live-data/dashboard/index',
    },
  ],
};
