import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // ==================== 公司资料 - 知识分类 ====================

  /**
   * 获取知识分类列表
   */
  @Get('categories')
  async getCategories(@Req() req: any) {
    const data = await this.knowledgeService.getCategories();
    return {
      code: 200,
      msg: '获取成功',
      data,
    };
  }

  /**
   * 创建知识分类（管理员）
   */
  @Post('categories')
  async createCategory(@Req() req: any, @Body() body: any) {
    const userId = req.user.id;
    const data = await this.knowledgeService.createCategory(userId, body);
    return {
      code: 200,
      msg: '创建成功',
      data,
    };
  }

  /**
   * 更新知识分类（管理员）
   */
  @Put('categories/:id')
  async updateCategory(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.id;
    const data = await this.knowledgeService.updateCategory(userId, id, body);
    return {
      code: 200,
      msg: '更新成功',
      data,
    };
  }

  /**
   * 删除知识分类（管理员）
   */
  @Delete('categories/:id')
  async deleteCategory(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.knowledgeService.deleteCategory(userId, id);
    return {
      code: 200,
      msg: '删除成功',
      data: null,
    };
  }

  // ==================== 公司资料 - 知识文章 ====================

  /**
   * 获取知识文章列表
   */
  @Get('articles')
  async getArticles(
    @Req() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const data = await this.knowledgeService.getArticles(
      categoryId,
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
   * 获取知识文章详情
   */
  @Get('articles/:id')
  async getArticleDetail(@Req() req: any, @Param('id') id: string) {
    const data = await this.knowledgeService.getArticleById(id);
    return {
      code: 200,
      msg: '获取成功',
      data,
    };
  }

  /**
   * 创建知识文章
   */
  @Post('articles')
  async createArticle(@Req() req: any, @Body() body: any) {
    const userId = req.user.id;
    const data = await this.knowledgeService.createArticle(userId, body);
    return {
      code: 200,
      msg: '创建成功',
      data,
    };
  }

  /**
   * 更新知识文章
   */
  @Put('articles/:id')
  async updateArticle(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user.id;
    const data = await this.knowledgeService.updateArticle(userId, id, body);
    return {
      code: 200,
      msg: '更新成功',
      data,
    };
  }

  /**
   * 删除知识文章
   */
  @Delete('articles/:id')
  async deleteArticle(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.knowledgeService.deleteArticle(userId, id);
    return {
      code: 200,
      msg: '删除成功',
      data: null,
    };
  }

  // ==================== 公司资料 - 统计 ====================

  /**
   * 获取公司资料统计
   */
  @Get('company-stats')
  async getCompanyStats(@Req() req: any) {
    const data = await this.knowledgeService.getCompanyStats();
    return {
      code: 200,
      msg: '获取成功',
      data,
    };
  }

  // ==================== 原有接口 ====================

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
