import { Injectable } from '@nestjs/common';
import { HotTopicsService } from '../hot-topics/hot-topics.service';

@Injectable()
export class HotService {
  // 缓存
  private cache: any = null;
  private cacheTime: number = 0;
  private readonly CACHE_TTL = 60 * 1000; // 60秒缓存

  constructor(
    private readonly hotTopicsService: HotTopicsService
  ) {}

  /**
   * 获取所有平台热点（按平台分组）
   */
  async getAllHot() {
    console.log('[HotService] 获取所有平台热点');

    const now = Date.now();

    // 检查缓存
    if (this.cache && now - this.cacheTime < this.CACHE_TTL) {
      console.log('[HotService] 使用缓存数据');
      return this.cache;
    }

    console.log('[HotService] 缓存过期，重新获取数据');

    try {
      // 使用 getHotList 获取所有热点数据
      const result = await this.getHotList('national', 'all');

      if (!result || !result.list || result.list.length === 0) {
        throw new Error('获取热点数据失败');
      }

      // 按平台分组
      const platformMap = new Map<string, any[]>();

      result.list.forEach((item: any) => {
        const platform = item.platform || '综合';
        if (!platformMap.has(platform)) {
          platformMap.set(platform, []);
        }
        platformMap.get(platform)?.push({
          rank: item.rank,
          title: item.title,
          hot: this.formatHotness(item.hotness),
          url: item.url,
          summary: item.summary,
          category: item.category,
          trend: item.trend,
          isBursting: item.isBursting
        });
      });

      // 构建平台列表
      const platforms: any[] = [];

      // 添加主要平台（即使没有数据也显示）
      const mainPlatforms = [
        { name: '微博', icon: 'weibo' },
        { name: '知乎', icon: 'zhihu' },
        { name: '抖音', icon: 'douyin' },
        { name: 'B站', icon: 'bilibili' },
        { name: '百度', icon: 'baidu' },
        { name: '综合', icon: 'all' }
      ];

      mainPlatforms.forEach(p => {
        const list = platformMap.get(p.name) || [];
        platforms.push({
          platform: p.name,
          icon: p.icon,
          list: list
        });
      });

      // 添加其他平台
      platformMap.forEach((list, platform) => {
        if (!mainPlatforms.find(p => p.name === platform)) {
          platforms.push({
            platform: platform,
            icon: 'other',
            list: list
          });
        }
      });

      const finalResult = {
        updateTime: new Date().toISOString(),
        platforms: platforms
      };

      // 更新缓存
      this.cache = finalResult;
      this.cacheTime = now;

      console.log('[HotService] 获取成功，平台数量:', platforms.length);
      return finalResult;
    } catch (error: any) {
      console.error('[HotService] 获取所有平台热点失败:', error);

      // 如果有缓存，即使过期也返回缓存数据
      if (this.cache) {
        console.log('[HotService] 使用过期缓存数据');
        return this.cache;
      }

      throw error;
    }
  }

  /**
   * 格式化热度值
   */
  private formatHotness(hotness: number): string {
    if (hotness >= 10000) {
      return (hotness / 10000).toFixed(1) + 'w';
    }
    if (hotness >= 1000) {
      return (hotness / 1000).toFixed(1) + 'k';
    }
    return hotness.toString();
  }

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
