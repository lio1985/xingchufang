import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';

@Controller('api/knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  /**
   * 获取所有知识库分类统计
   */
  @Get('stats')
  async getKnowledgeStats(@Req() req: any) {
    const userId = req.user.id;
    const data = await this.knowledgeService.getKnowledgeStats(userId);
    return {
      code: 200,
      msg: '获取成功',
      data,
    };
  }

  /**
   * 搜索所有知识库
   */
  @Get('search')
  async searchKnowledge(
    @Req() req: any,
    @Query('keyword') keyword?: string,
    @Query('sources') sources?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    const sourceList = sources ? sources.split(',') : ['lexicon', 'knowledge_share', 'product_manual', 'design_knowledge'];
    const data = await this.knowledgeService.searchAllKnowledge(
      userId,
      keyword || '',
      sourceList,
      limit ? parseInt(limit) : 20,
    );
    return {
      code: 200,
      msg: '搜索成功',
      data,
    };
  }

  /**
   * 根据类型获取知识库内容
   */
  @Get('list')
  async getKnowledgeList(
    @Req() req: any,
    @Query('type') type: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const userId = req.user.id;
    const data = await this.knowledgeService.getKnowledgeByType(
      userId,
      type,
      keyword || '',
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
    return {
      code: 200,
      msg: '获取成功',
      data,
    };
  }

  /**
   * 获取选中的知识库内容详情（批量）
   */
  @Get('batch')
  async getKnowledgeByIds(
    @Req() req: any,
    @Query('ids') ids: string,
    @Query('types') types: string,
  ) {
    const userId = req.user.id;
    const idList = ids.split(',');
    const typeList = types.split(',');
    const data = await this.knowledgeService.getKnowledgeByIds(userId, idList, typeList);
    return {
      code: 200,
      msg: '获取成功',
      data,
    };
  }
}
