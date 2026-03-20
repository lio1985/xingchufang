import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ActiveUserGuard } from '../../guards/active-user.guard';
import { OptionalAuthGuard } from '../../guards/optional-auth.guard';
import { parseOptionalUUID } from '../../utils/uuid.util';

@Controller('conversation')
@UseGuards(OptionalAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('list')
  async getList(
    @Req() req: any,
    @Query('userId') targetUserId?: string,
  ) {
    try {
      // 游客模式返回空数据
      if (!req.user?.id) {
        return { code: 200, msg: 'success', data: [] };
      }
      
      // 验证 targetUserId 参数
      const validatedTargetUserId = parseOptionalUUID(targetUserId);
      const data = await this.conversationService.getList(req.user.id, validatedTargetUserId);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      return { code: 500, msg: error.message || '获取对话列表失败', data: null };
    }
  }

  @Get('detail/:conversationId')
  async getDetail(
    @Param('conversationId') conversationId: string,
    @Req() req: any,
  ) {
    try {
      // 游客模式返回空数据
      if (!req.user?.id) {
        return { code: 200, msg: 'success', data: null };
      }
      
      const data = await this.conversationService.getDetail(conversationId, req.user.id);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      return { code: 500, msg: error.message || '获取对话详情失败', data: null };
    }
  }

  @Post()
  @UseGuards(ActiveUserGuard)
  async create(
    @Req() req: any,
    @Body() body: { title: string; model: string },
  ) {
    try {
      if (!req.user?.id) {
        return { code: 400, msg: '用户ID不能为空', data: null };
      }
      const data = await this.conversationService.create({
        userId: req.user.id,
        title: body.title,
        model: body.model,
      });
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      return { code: 500, msg: error.message || '创建对话失败', data: null };
    }
  }

  @Post('message')
  @UseGuards(ActiveUserGuard)
  async addMessage(@Body() body: { conversationId: string; role: string; content: string; metadata?: any }) {
    try {
      const data = await this.conversationService.addMessage(body);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      return { code: 500, msg: error.message || '添加消息失败', data: null };
    }
  }

  @Delete(':conversationId')
  @UseGuards(ActiveUserGuard)
  async delete(
    @Param('conversationId') conversationId: string,
    @Req() req: any,
  ) {
    try {
      if (!req.user?.id) {
        return { code: 400, msg: '用户ID不能为空', data: null };
      }
      const data = await this.conversationService.delete(conversationId, req.user.id);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      return { code: 500, msg: error.message || '删除对话失败', data: null };
    }
  }
}
