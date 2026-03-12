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
   * 清除缓存并重新加载热点数据
   */
  @Post('content')
  async getHotTopicContent(@Body() body: { keyword: string; platform: string; category: string }) {
    try {
      const { keyword, platform, category = '' } = body;

      if (!keyword || !platform) {
        return {
          code: 400,
          msg: '参数不完整',
          data: null,
        };
      }

      const content = await this.hotTopicsService.getHotTopicContent(keyword, platform, category);

      return {
        code: 200,
        msg: '获取成功',
        data: {
          keyword,
          platform,
          category,
          content,
        },
      };
    } catch (error) {
      console.error('获取热点详情内容失败:', error);
      return {
        code: 500,
        msg: '获取失败',
        data: null,
      };
    }
  }

  /**
   * 获取创作角度建议
   */
  @Post('creative-angles')
  async getCreativeAngles(@Body() body: { keyword: string; category: string }) {
    try {
      const { keyword, category = '' } = body;

      if (!keyword) {
        return {
          code: 400,
          msg: '关键词不能为空',
          data: null,
        };
      }

      const angles = this.hotTopicsService.generateCreativeAngles(keyword, category);

      return {
        code: 200,
        msg: '获取成功',
        data: {
          keyword,
          category,
          angles,
        },
      };
    } catch (error) {
      console.error('获取创作角度建议失败:', error);
      return {
        code: 500,
        msg: '获取失败',
        data: null,
      };
    }
  }

  /**
   * 获取相关热点推荐
   */
  @Post('related-topics')
  async getRelatedTopics(@Body() body: { topicId: string; allTopics: any[] }) {
    try {
      const { topicId, allTopics } = body;

      if (!topicId || !allTopics || !Array.isArray(allTopics)) {
        return {
          code: 400,
          msg: '参数不完整',
          data: null,
        };
      }

      const currentTopic = allTopics.find((t: any) => t.id === topicId);
      if (!currentTopic) {
        return {
          code: 404,
          msg: '话题不存在',
          data: null,
        };
      }

      const relatedTopics = this.hotTopicsService.getRelatedTopics(currentTopic, allTopics);

      return {
        code: 200,
        msg: '获取成功',
        data: {
          relatedTopics,
        },
      };
    } catch (error) {
      console.error('获取相关热点推荐失败:', error);
      return {
        code: 500,
        msg: '获取失败',
        data: null,
      };
    }
  }

  /**
   * 获取热点时间轴
   */
  @Post('timeline')
  async getTimeline(@Body() body: { hotness: number; publishTime: string }) {
    try {
      const { hotness, publishTime } = body;

      if (!hotness) {
        return {
          code: 400,
          msg: '热度值不能为空',
          data: null,
        };
      }

      const timeline = this.hotTopicsService.generateTimeline(hotness, publishTime);

      return {
        code: 200,
        msg: '获取成功',
        data: {
          timeline,
        },
      };
    } catch (error) {
      console.error('获取热点时间轴失败:', error);
      return {
        code: 500,
        msg: '获取失败',
        data: null,
      };
    }
  }

  @Post('refresh')
  async refreshHotTopics(@Query() query: { locationMode?: 'national' | 'local'; city?: string }): Promise<any> {
    const { locationMode = 'national', city } = query;

    console.log('=== 刷新 TopHub 热点 ===');

    this.hotTopicsService.clearCache();
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
}
