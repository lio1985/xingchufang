import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HotTopicsService } from '../hot-topics/hot-topics.service';

@Injectable()
export class HotService {
  constructor(private readonly hotTopicsService: HotTopicsService) {}

  /**
   * 获取热点列表
   */
  async getHotList(
    scope: 'national' | 'city' = 'national',
    platform: 'all' | 'weibo' | 'zhihu' | 'douyin' | 'bilibili' = 'all'
  ) {
    console.log('[HotService] 获取热点列表');
    console.log('scope:', scope);
    console.log('platform:', platform);

    try {
      // 调用 HotTopicsService 获取数据
      // 注意：HotTopicsService 期望 locationMode 为 'national' | 'local'
      const locationMode = scope === 'city' ? 'local' : 'national';

      const hotTopics = await this.hotTopicsService.getHotTopics(
        'all',
        locationMode,
        scope === 'city' ? '全国' : undefined
      );

      // 转换为统一格式
      const list = hotTopics.map((item: any, index: number) => {
        // 计算趋势
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (item.trendChange && item.trendChange > 5) {
          trend = 'up';
        } else if (item.trendChange && item.trendChange < -5) {
          trend = 'down';
        }

        // 计算排名变化
        const rankChange = item.rankChange || 0;

        return {
          id: item.id || `hot_${index}`,
          rank: index + 1,
          rankChange: rankChange,
          title: item.keyword || item.title,
          hotness: item.hotness || item.score,
          trend: trend,
          platform: item.platform || '综合',
          url: item.url || '',
          summary: item.summary || item.description,
          publishTime: item.publishTime || item.time,
          category: item.category || '',
          keywords: item.keywords || [],
          isBursting: item.isBursting || false
        };
      });

      return {
        source: 'server_proxy' as const,
        scope: scope,
        platform: platform,
        list: list
      };
    } catch (error: any) {
      console.error('[HotService] 获取热点列表失败:', error);

      // 如果获取失败，返回空列表而不是抛出异常
      return {
        source: 'server_proxy' as const,
        scope: scope,
        platform: platform,
        list: []
      };
    }
  }
}
