import { Injectable } from '@nestjs/common';
import { SearchClient, Config } from 'coze-coding-dev-sdk';

@Injectable()
export class NewsService {
  private searchClient: SearchClient;

  constructor() {
    const config = new Config();
    this.searchClient = new SearchClient(config);
  }

  async search(keyword: string, timeRange: string) {
    console.log('=== 开始 Web Search ===');
    console.log('Keyword:', keyword);
    console.log('Time Range:', timeRange);

    try {
      // 使用 advancedSearch 进行搜索，支持时间范围过滤
      const response = await this.searchClient.advancedSearch(keyword, {
        searchType: 'web',
        count: 10,
        needSummary: true,
        timeRange: timeRange,
      });

      console.log('=== Search Response ===');
      console.log('Summary:', response.summary?.substring(0, 100) || 'No summary');
      console.log('Web items count:', response.web_items?.length || 0);

      // 格式化返回结果
      const results = response.web_items?.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        snippet: item.snippet,
        siteName: item.site_name,
        publishTime: item.publish_time,
      })) || [];

      const summary = response.summary || '';

      return {
        summary,
        results
      };
    } catch (error) {
      console.error('Web Search error:', error);
      throw error;
    }
  }
}
