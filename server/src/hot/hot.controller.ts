import { Controller, Get, Post, Body, Query, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { HotService } from './hot.service';

@Controller('hot')
export class HotController {
  constructor(private readonly hotService: HotService) {}

  /**
   * 获取所有平台热点（统一接口）
   * GET /api/hot/all
   *
   * 返回格式：
   * {
   *   "success": true,
   *   "message": "ok",
   *   "data": {
   *     "updateTime": "2026-03-14 21:00:00",
   *     "platforms": [
   *       {
   *         "platform": "微博",
   *         "icon": "weibo",
   *         "list": [...]
   *       }
   *     ]
   *   }
   * }
   */
  @Get('all')
  async getAllHot() {
    console.log('[HotController] 获取所有平台热点');

    try {
      const result = await this.hotService.getAllHot();

      return {
        success: true,
        message: 'ok',
        data: result
      };
    } catch (error: any) {
      console.error('[HotController] 获取所有平台热点失败:', error);

      return {
        success: false,
        message: error.message || '热点获取失败',
        data: {
          updateTime: new Date().toISOString(),
          platforms: []
        }
      };
    }
  }

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

  /**
   * 生成AI选题
   * POST /api/hot/generate-topic
   *
   * 参数：
   * - title: 热点标题
   * - platform: 平台
   * - hot: 热度值
   *
   * 返回格式：
   * {
   *   "success": true,
   *   "message": "ok",
   *   "data": {
   *     "topics": [
   *       {
   *         "id": "xxx",
   *         "title": "选题标题",
   *         "contentAngle": "内容角度",
   *         "suitableAccount": "适合账号",
   *         "format": "short",
   *         "keywords": ["关键词1", "关键词2"],
   *         "suggestedTime": "建议发布时间"
   *       }
   *     ]
   *   }
   * }
   */
  @Post('generate-topic')
  async generateTopic(@Body() body: {
    title: string;
    platform?: string;
    hot?: string;
  }) {
    console.log('[HotController] 生成AI选题');
    console.log('热点标题:', body.title);
    console.log('平台:', body.platform);
    console.log('热度:', body.hot);

    try {
      const result = await this.hotService.generateTopic(body.title, body.platform, body.hot);

      return {
        success: true,
        message: '选题生成成功',
        data: result
      };
    } catch (error: any) {
      console.error('[HotController] 生成AI选题失败:', error);

      return {
        success: false,
        message: error.message || '选题生成失败',
        data: {
          topics: []
        }
      };
    }
  }

  /**
   * 生成AI脚本
   * POST /api/hot/generate-script
   *
   * 参数：
   * - topicId: 选题ID
   * - title: 选题标题
   * - contentAngle: 内容角度
   *
   * 返回格式：
   * {
   *   "success": true,
   *   "message": "ok",
   *   "data": {
   *     "id": "xxx",
   *     "fifteenSecond": "15秒脚本内容",
   *     "thirtySecond": "30秒脚本内容",
   *     "sixtySecond": "60秒脚本内容",
   *     "douyinTitles": ["标题1", "标题2", "标题3"],
   *     "commentGuidance": ["引导1", "引导2", "引导3"],
   *     "liveTopics": ["话题1", "话题2", "话题3"],
   *     "suggestedHashtags": ["#标签1", "#标签2"]
   *   }
   * }
   */
  @Post('generate-script')
  async generateScript(@Body() body: {
    topicId?: string;
    title: string;
    contentAngle?: string;
  }) {
    console.log('[HotController] 生成AI脚本');
    console.log('选题标题:', body.title);
    console.log('内容角度:', body.contentAngle);

    try {
      const result = await this.hotService.generateScript(body.title, body.contentAngle);

      return {
        success: true,
        message: '脚本生成成功',
        data: result
      };
    } catch (error: any) {
      console.error('[HotController] 生成AI脚本失败:', error);

      return {
        success: false,
        message: error.message || '脚本生成失败',
        data: null
      };
    }
  }

  /**
   * 添加收藏
   * POST /api/hot/favorite
   *
   * 参数：
   * - hotTitle: 热点标题
   * - platform: 平台
   * - hot: 热度
   * - topicTitle: 选题标题
   * - scriptSummary: 脚本摘要
   * - account: 账号
   * - responsible: 负责人
   * - status: 状态（待拍 / 已拍 / 已发布）
   *
   * 返回格式：
   * {
   *   "code": 200,
   *   "msg": "收藏成功",
   *   "data": { "id": "xxx" }
   * }
   */
  @Post('favorite')
  async addFavorite(@Body() body: {
    hotTitle: string;
    platform?: string;
    hot?: string;
    topicTitle?: string;
    scriptSummary?: string;
    account?: string;
    responsible?: string;
    status?: string;
  }) {
    console.log('[HotController] 添加收藏');
    console.log('热点标题:', body.hotTitle);

    try {
      const result = await this.hotService.addFavorite(body);

      return {
        code: 200,
        msg: '收藏成功',
        data: { id: result.id }
      };
    } catch (error: any) {
      console.error('[HotController] 添加收藏失败:', error);

      return {
        code: 500,
        msg: error.message || '收藏失败',
        data: null
      };
    }
  }

  /**
   * 获取收藏列表
   * GET /api/hot/favorite/list
   *
   * 返回格式：
   * {
   *   "code": 200,
   *   "msg": "ok",
   *   "data": [
   *     {
   *       "id": "xxx",
   *       "hotTitle": "热点标题",
   *       "topicTitle": "选题标题",
   *       "scriptSummary": "脚本摘要",
   *       "account": "账号",
   *       "responsible": "负责人",
   *       "status": "待拍",
   *       "createdAt": "2026-03-14 10:00:00"
   *     }
   *   ]
   * }
   */
  @Get('favorite/list')
  async getFavoriteList() {
    console.log('[HotController] 获取收藏列表');

    try {
      const result = await this.hotService.getFavoriteList();

      return {
        code: 200,
        msg: 'ok',
        data: result
      };
    } catch (error: any) {
      console.error('[HotController] 获取收藏列表失败:', error);

      return {
        code: 500,
        msg: error.message || '获取收藏列表失败',
        data: []
      };
    }
  }

  /**
   * 删除收藏
   * DELETE /api/hot/favorite
   *
   * 参数：
   * - id: 收藏ID
   *
   * 返回格式：
   * {
   *   "code": 200,
   *   "msg": "删除成功",
   *   "data": null
   * }
   */
  @Delete('favorite')
  async deleteFavorite(@Body() body: { id: string }) {
    console.log('[HotController] 删除收藏');
    console.log('收藏ID:', body.id);

    try {
      await this.hotService.deleteFavorite(body.id);

      return {
        code: 200,
        msg: '删除成功',
        data: null
      };
    } catch (error: any) {
      console.error('[HotController] 删除收藏失败:', error);

      return {
        code: 500,
        msg: error.message || '删除失败',
        data: null
      };
    }
  }

  /**
   * 更新收藏状态
   * PUT /api/hot/favorite/status
   *
   * 参数：
   * - id: 收藏ID
   * - status: 新状态（待拍 / 已拍 / 已发布）
   *
   * 返回格式：
   * {
   *   "code": 200,
   *   "msg": "状态已更新",
   *   "data": null
   * }
   */
  @Put('favorite/status')
  async updateFavoriteStatus(@Body() body: { id: string; status: string }) {
    console.log('[HotController] 更新收藏状态');
    console.log('收藏ID:', body.id);
    console.log('新状态:', body.status);

    try {
      await this.hotService.updateFavoriteStatus(body.id, body.status);

      return {
        code: 200,
        msg: '状态已更新',
        data: null
      };
    } catch (error: any) {
      console.error('[HotController] 更新收藏状态失败:', error);

      return {
        code: 500,
        msg: error.message || '更新状态失败',
        data: null
      };
    }
  }
}
