import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TopicsService, CreateTopicDto, UpdateTopicDto, TopicQueryDto } from './topics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  /**
   * 获取选题列表
   */
  @Get()
  async getAll(@Req() req: any, @Query() query: TopicQueryDto) {
    console.log('=== 获取选题列表 ===');
    console.log('用户ID:', req.user.id);
    console.log('查询参数:', query);

    const result = await this.topicsService.getAll(req.user.id, query);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * 获取统计数据
   */
  @Get('statistics')
  async getStatistics(@Req() req: any) {
    console.log('=== 获取选题统计 ===');
    console.log('用户ID:', req.user.id);

    const statistics = await this.topicsService.getStatistics(req.user.id);

    return {
      code: 200,
      msg: 'success',
      data: statistics,
    };
  }

  /**
   * 获取单个选题
   */
  @Get(':id')
  async getById(@Req() req: any, @Param('id') id: string) {
    console.log('=== 获取选题详情 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题ID:', id);

    const topic = await this.topicsService.getById(req.user.id, id);

    return {
      code: 200,
      msg: 'success',
      data: topic,
    };
  }

  /**
   * 创建选题
   */
  @Post()
  async create(@Req() req: any, @Body() dto: CreateTopicDto) {
    try {
      console.log('=== 创建选题 ===');
      console.log('用户ID:', req.user.id);
      console.log('选题数据:', dto);

      const topic = await this.topicsService.create(req.user.id, dto);

      return {
        code: 200,
        msg: '创建成功',
        data: topic,
      };
    } catch (error) {
      console.error('[TopicsController] 创建选题失败:', error);
      return {
        code: 500,
        msg: error.message || '创建失败',
        data: null,
      };
    }
  }

  /**
   * 更新选题
   */
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTopicDto
  ) {
    console.log('=== 更新选题 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题ID:', id);
    console.log('更新数据:', dto);

    const topic = await this.topicsService.update(req.user.id, id, dto);

    return {
      code: 200,
      msg: '更新成功',
      data: topic,
    };
  }

  /**
   * 删除选题
   */
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    console.log('=== 删除选题 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题ID:', id);

    await this.topicsService.delete(req.user.id, id);

    return {
      code: 200,
      msg: '删除成功',
      data: null,
    };
  }

  /**
   * AI分析选题
   */
  @Post(':id/analyze')
  async analyzeWithAI(@Req() req: any, @Param('id') id: string) {
    console.log('=== AI分析选题 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题ID:', id);

    const analysis = await this.topicsService.analyzeWithAI(req.user.id, id);

    return {
      code: 200,
      msg: '分析完成',
      data: analysis,
    };
  }

  /**
   * 批量更新状态
   */
  @Post('batch/status')
  async batchUpdateStatus(
    @Req() req: any,
    @Body() body: { ids: string[]; status: 'draft' | 'in_progress' | 'published' | 'archived' }
  ) {
    console.log('=== 批量更新状态 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题IDs:', body.ids);
    console.log('新状态:', body.status);

    await this.topicsService.batchUpdateStatus(req.user.id, body.ids, body.status);

    return {
      code: 200,
      msg: '批量更新成功',
      data: null,
    };
  }
}
