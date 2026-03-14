import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { HotService } from './hot.service';

@Controller('hot')
export class HotController {
  constructor(private readonly hotService: HotService) {}

  /**
   * 获取热点列表（统一接口）
   * GET /api/hot/list
   * 
   * 参数：
   * - scope: national | city (默认 national)
   * - platform: all | weibo | zhihu | douyin | bilibili (默认 all)
   * 
   * 返回格式：
   * {
   *   "success": true,
   *   "message": "ok",
   *   "data": {
   *     "source": "server_proxy",
   *     "scope": "national",
   *     "platform": "all",
   *     "list": [...]
   *   }
   * }
   */
  @Get('list')
  async getHotList(
    @Query('scope') scope: 'national' | 'city' = 'national',
    @Query('platform') platform: 'all' | 'weibo' | 'zhihu' | 'douyin' | 'bilibili' = 'all'
  ) {
    console.log('[HotController] 获取热点列表');
    console.log('scope:', scope);
    console.log('platform:', platform);

    try {
      const result = await this.hotService.getHotList(scope, platform);

      return {
        success: true,
        message: 'ok',
        data: result
      };
    } catch (error: any) {
      console.error('[HotController] 获取热点列表失败:', error);

      return {
        success: false,
        message: error.message || '热点获取失败',
        errorCode: 'HOT_FETCH_ERROR',
        data: {
          list: []
        }
      };
    }
  }
}
