import { Controller, Get, Query } from '@nestjs/common';
import { HotTopicsService } from './hot-topics.service';

@Controller('hot-topics')
export class HotTopicsController {

  constructor(
    private readonly hotTopicsService: HotTopicsService
  ) {}

  /**
   * 获取所有热点话题（TopHub聚合）
   */
  @Get()
  async getHotTopics(@Query() query: { locationMode?: 'national' | 'local'; city?: string }): Promise<any> {
    const { locationMode = 'national', city } = query;

    console.log('=== 获取 TopHub 热点 ===');
    console.log('位置模式:', locationMode);
    console.log('城市:', city || '全国');

    const topics = await this.hotTopicsService.getHotTopics('all', locationMode, city);

    return {
      code: 200,
      msg: 'success',
      data: {
        topics,
        source: 'TopHub (今日热榜)',
        locationMode,
        city: city || '全国',
        updateTime: new Date().toISOString()
      }
    };
  }
}
