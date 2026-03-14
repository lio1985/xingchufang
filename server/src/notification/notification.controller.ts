import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';

// 发送通知DTO
class SendNotificationDto {
  title: string;
  content: string;
  type?: 'system' | 'activity' | 'update';
  targetType?: 'all' | 'single' | 'role';
  targetUsers?: string[];
}

@Controller('notifications')
@UseGuards(ActiveUserGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 发送通知（管理员接口）
   * POST /api/notifications/send
   */
  @Post('send')
  @UseGuards(AdminGuard)
  async sendNotification(@Body() dto: SendNotificationDto, @Request() req) {
    // 这里可以添加管理员权限检查
    const senderId = req.user?.sub;
    return this.notificationService.sendNotification({
      ...dto,
      senderId,
    });
  }

  /**
   * 获取用户通知列表
   * GET /api/notifications?page=1&limit=20
   */
  @Get()
  async getNotifications(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.sub;
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.notificationService.getUserNotifications(userId, pageNum, limitNum);
  }

  /**
   * 标记通知为已读
   * POST /api/notifications/:id/read
   */
  @Post(':id/read')
  async markAsRead(@Param('id') notificationId: string, @Request() req) {
    const userId = req.user?.sub;
    return this.notificationService.markAsRead(notificationId, userId);
  }

  /**
   * 标记所有通知为已读
   * POST /api/notifications/read-all
   */
  @Post('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user?.sub;
    return this.notificationService.markAllAsRead(userId);
  }

  /**
   * 获取未读通知数量（小红点）
   * GET /api/notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user?.sub;
    return this.notificationService.getUnreadCount(userId);
  }

  /**
   * 删除通知（管理员接口）
   * DELETE /api/notifications/:id
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteNotification(@Param('id') notificationId: string) {
    // 这里可以添加管理员权限检查
    return this.notificationService.deleteNotification(notificationId);
  }
}
