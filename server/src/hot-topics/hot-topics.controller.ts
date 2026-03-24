import { Controller, Get, Post, Query, Body } from '@nestjs/common';
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

  /**
   * 刷新热点数据（清除缓存并重新获取）
   */
  @Post('refresh')
  async refreshHotTopics(@Body() body: { locationMode?: 'national' | 'local'; city?: string }): Promise<any> {
    const { locationMode = 'national', city } = body;

    console.log('=== 刷新 TopHub 热点 ===');

    // 清除缓存
    this.hotTopicsService.clearCache();

    // 重新获取数据
    const topics = await this.hotTopicsService.getHotTopics('all', locationMode, city);

    return {
      code: 200,
      msg: '刷新成功',
      data: {
        topics,
        source: 'TopHub (今日热榜)',
        locationMode,
        city: city || '全国',
        updateTime: new Date().toISOString()
      }
    };
  }

  /**
   * 搜索热点话题
   */
  @Post('search')
  async searchHotTopics(@Body() body: { keyword: string }): Promise<any> {
    const { keyword } = body;

    if (!keyword || keyword.trim().length === 0) {
      return {
        code: 400,
        msg: '请输入搜索关键词',
        data: { topics: [] }
      };
    }

    console.log('=== 搜索热点 ===');
    console.log('搜索关键词:', keyword);

    const topics = await this.hotTopicsService.searchHotTopics(keyword);

    return {
      code: 200,
      msg: 'success',
      data: {
        topics,
        keyword,
        count: topics.length,
        updateTime: new Date().toISOString()
      }
    };
  }

  /**
   * 获取热点详情内容
   */
  @Post('content')
  async getHotTopicContent(@Body() body: { keyword: string; platform: string; category?: string }): Promise<any> {
    const { keyword, platform, category = '' } = body;

    if (!keyword || !platform) {
      return {
        code: 400,
        msg: '缺少必要参数: keyword 或 platform',
        data: null
      };
    }

    console.log('=== 获取热点详情内容 ===');
    console.log('关键词:', keyword);
    console.log('平台:', platform);
    console.log('分类:', category);

    const content = await this.hotTopicsService.getHotTopicContent(keyword, platform, category);

    return {
      code: 200,
      msg: 'success',
      data: { content }
    };
  }

  /**
   * 获取创作角度建议
   */
  @Post('creative-angles')
  async getCreativeAngles(@Body() body: { keyword: string; category?: string }): Promise<any> {
    const { keyword, category = '' } = body;

    if (!keyword) {
      return {
        code: 400,
        msg: '缺少必要参数: keyword',
        data: { angles: [] }
      };
    }

    console.log('=== 获取创作角度建议 ===');
    console.log('关键词:', keyword);
    console.log('分类:', category);

    const angles = await this.hotTopicsService.getCreativeAngles(keyword, category);

    return {
      code: 200,
      msg: 'success',
      data: { angles }
    };
  }

  /**
   * 获取热点时间轴
   */
  @Post('timeline')
  async getTimeline(@Body() body: { hotness: number; publishTime?: string }): Promise<any> {
    const { hotness, publishTime } = body;

    console.log('=== 获取热点时间轴 ===');
    console.log('热度:', hotness);
    console.log('发布时间:', publishTime);

    const timeline = await this.hotTopicsService.getTimeline(hotness, publishTime);

    return {
      code: 200,
      msg: 'success',
      data: { timeline }
    };
  }
}
