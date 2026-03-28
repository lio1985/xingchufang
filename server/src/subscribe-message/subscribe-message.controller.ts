import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { SubscribeMessageService } from './subscribe-message.service';
import { ActiveUserGuard } from '../guards/active-user.guard';

@Controller('subscribe')
export class SubscribeMessageController {
  constructor(private readonly subscribeService: SubscribeMessageService) {}

  /**
   * 订阅消息
   * POST /api/subscribe/subscribe
   */
  @Post('subscribe')
  @UseGuards(ActiveUserGuard)
  async subscribe(
    @Request() req,
    @Body() body: { templateId: string; wxTemplateId: string }
  ) {
    const userId = req.user?.sub;
    return this.subscribeService.subscribe(userId, body.templateId, body.wxTemplateId);
  }

  /**
   * 取消订阅
   * POST /api/subscribe/unsubscribe
   */
  @Post('unsubscribe')
  @UseGuards(ActiveUserGuard)
  async unsubscribe(
    @Request() req,
    @Body() body: { templateId: string }
  ) {
    const userId = req.user?.sub;
    return this.subscribeService.unsubscribe(userId, body.templateId);
  }

  /**
   * 获取订阅状态
   * GET /api/subscribe/status
   */
  @Get('status')
  @UseGuards(ActiveUserGuard)
  async getStatus(@Request() req) {
    const userId = req.user?.sub;
    return this.subscribeService.getSubscribeStatus(userId);
  }

  /**
   * 发送订阅消息（管理员或系统调用）
   * POST /api/subscribe/send
   */
  @Post('send')
  @UseGuards(ActiveUserGuard)
  async send(
    @Body() body: {
      userId: string;
      templateId: string;
      data: Record<string, { value: string }>;
      page?: string;
    }
  ) {
    return this.subscribeService.sendSubscribeMessage(
      body.userId,
      body.templateId,
      body.data,
      body.page
    );
  }

  /**
   * 批量发送订阅消息
   * POST /api/subscribe/batch-send
   */
  @Post('batch-send')
  @UseGuards(ActiveUserGuard)
  async batchSend(
    @Body() body: {
      userIds: string[];
      templateId: string;
      data: Record<string, { value: string }>;
      page?: string;
    }
  ) {
    return this.subscribeService.batchSendSubscribeMessage(
      body.userIds,
      body.templateId,
      body.data,
      body.page
    );
  }
}
