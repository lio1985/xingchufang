import { Controller, Get, Post, Delete, Body, Query, Request, UseGuards } from '@nestjs/common';
import { HotTopicFavoritesService } from './hot-topic-favorites.service';
import { HotTopicFavorite, CreateFavoriteDto } from './types';
import { ActiveUserGuard } from '../guards/active-user.guard';

@Controller('hot-topic-favorites')
@UseGuards(ActiveUserGuard)
export class HotTopicFavoritesController {

  constructor(
    private readonly favoritesService: HotTopicFavoritesService
  ) {}

  /**
   * 添加收藏
   */
  @Post()
  async addFavorite(
    @Request() req,
    @Body() body: CreateFavoriteDto
  ) {
    const userId = req.user.sub;
    const result = await this.favoritesService.addFavorite(userId, body);

    return {
      code: 200,
      msg: '收藏成功',
      data: result.data
    };
  }

  /**
   * 取消收藏
   */
  @Delete()
  async removeFavorite(
    @Request() req,
    @Body() body: { topic_id: string }
  ) {
    const userId = req.user.sub;
    await this.favoritesService.removeFavorite(userId, body.topic_id);

    return {
      code: 200,
      msg: '取消收藏成功'
    };
  }

  /**
   * 获取收藏列表
   */
  @Get()
  async getFavorites(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const userId = req.user.sub;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const result = await this.favoritesService.getFavorites(userId, pageNum, limitNum);

    return {
      code: 200,
      msg: 'success',
      data: result
    };
  }

  /**
   * 检查是否已收藏
   */
  @Get('check')
  async checkFavorite(
    @Request() req,
    @Query('topic_id') topicId: string
  ) {
    const userId = req.user.sub;
    const isFavorite = await this.favoritesService.isFavorite(userId, topicId);

    return {
      code: 200,
      msg: 'success',
      data: {
        isFavorite
      }
    };
  }

  /**
   * 批量检查收藏状态
   */
  @Post('batch-check')
  async batchCheckFavorites(
    @Request() req,
    @Body() body: { topic_ids: string[] }
  ) {
    const userId = req.user.sub;
    const result = await this.favoritesService.batchCheckFavorites(userId, body.topic_ids);

    return {
      code: 200,
      msg: 'success',
      data: result
    };
  }

  /**
   * 获取收藏ID列表（供热点列表使用）
   */
  @Get('ids')
  async getFavoriteIds(@Request() req) {
    const userId = req.user.sub;
    const ids = await this.favoritesService.getFavoriteTopicIds(userId);

    return {
      code: 200,
      msg: 'success',
      data: ids
    };
  }
}
