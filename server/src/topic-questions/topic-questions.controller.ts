import { Controller, Get, Query } from '@nestjs/common';

@Controller('topic-questions')
export class TopicQuestionsController {

  @Get()
  async getTopicQuestions(@Query() query: { platforms?: string; questionType?: string }) {
    // 模拟数据
    const allQuestions = [
      {
        question: '装修预算如何合理分配？',
        hotness: '热度 95',
        type: 'live',
        platforms: ['douyin', 'xiaohongshu']
      },
      {
        question: '小户型收纳技巧有哪些？',
        hotness: '热度 88',
        type: 'sales',
        platforms: ['douyin', 'shipinhao']
      },
      {
        question: '全屋定制需要注意什么？',
        hotness: '热度 82',
        type: 'live',
        platforms: ['xiaohongshu']
      },
      {
        question: '如何选择装修公司？',
        hotness: '热度 76',
        type: 'comment',
        platforms: ['douyin', 'xiaohongshu', 'shipinhao']
      },
      {
        question: '装修材料怎么选才省钱？',
        hotness: '热度 71',
        type: 'sales',
        platforms: ['xiaohongshu']
      },
      {
        question: '网红装修风格推荐',
        hotness: '热度 68',
        type: 'live',
        platforms: ['douyin']
      },
      {
        question: '装修避坑指南',
        hotness: '热度 65',
        type: 'sales',
        platforms: ['douyin', 'xiaohongshu']
      },
      {
        question: '装修流程时间表',
        hotness: '热度 62',
        type: 'comment',
        platforms: ['shipinhao']
      }
    ];

    // 根据查询参数筛选问题
    let filteredQuestions = [...allQuestions];

    // 如果指定了平台，筛选相关问题
    if (query.platforms) {
      const platforms = query.platforms.split(',');
      filteredQuestions = filteredQuestions.filter(q =>
        q.platforms.some(p => platforms.includes(p))
      );
    }

    // 如果指定了问题类型，筛选相关问题
    if (query.questionType) {
      filteredQuestions = filteredQuestions.filter(q => q.type === query.questionType);
    }

    return {
      code: 200,
      msg: 'success',
      data: filteredQuestions
    };
  }
}
