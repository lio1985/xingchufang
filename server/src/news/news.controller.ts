import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('search')
  async search(@Body() body: { keyword: string; timeRange?: string }) {
    try {
      console.log('=== 后端接收请求 ===');
      console.log('Body:', body);
      
      const { keyword, timeRange = '1d' } = body;

      if (!keyword) {
        throw new HttpException('关键词不能为空', HttpStatus.BAD_REQUEST);
      }

      const result = await this.newsService.search(keyword, timeRange);

      console.log('=== 后端返回结果 ===');
      console.log('Summary length:', result.summary?.length || 0);
      console.log('Results count:', result.results?.length || 0);

      return {
        code: 200,
        msg: 'success',
        data: result
      };
    } catch (error) {
      console.error('新闻搜索错误:', error);
      throw new HttpException(
        error.message || '搜索失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
