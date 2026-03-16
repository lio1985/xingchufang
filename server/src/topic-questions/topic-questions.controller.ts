import { Controller, Get, Query } from '@nestjs/common';

@Controller('topic-questions')
export class TopicQuestionsController {

  @Get()
  async getTopicQuestions(@Query() query: { platforms?: string; questionType?: string }) {
    // 返回空数组，清除默认内容
    return {
      code: 200,
      msg: 'success',
      data: []
    };
  }
}
