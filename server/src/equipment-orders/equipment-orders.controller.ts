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
import { EquipmentOrdersService, CreateOrderDto, FollowUpDto, OrderType, OrderStatus } from './equipment-orders.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('equipment-orders')
@UseGuards(OptionalAuthGuard)
export class EquipmentOrdersController {
  constructor(private readonly ordersService: EquipmentOrdersService) {}

  /**
   * 创建订单（管理员）
   */
  @Post()
  @UseGuards(ActiveUserGuard, AdminGuard)
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.createOrder(dto, req.user.id);
  }

  /**
   * 获取订单列表
   */
  @Get()
  async getList(
    @Query('orderType') orderType?: OrderType,
    @Query('status') status?: OrderStatus,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Req() req?: any,
  ) {
    // 游客模式返回空数据
    if (!req.user?.id) {
      return {
        success: true,
        data: {
          list: [],
          pagination: { page: 1, limit: 20, total: 0 },
        },
      };
    }
    
    return this.ordersService.getOrders({
      userId: req.user.id,
      userRole: req.user.role,
      orderType,
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  async getDetail(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.getOrderDetail(id, req.user.id);
  }

  /**
   * 接单
   */
  @Post(':id/accept')
  async accept(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.acceptOrder(id, req.user.id);
  }

  /**
   * 转让订单
   */
  @Post(':id/transfer')
  async transfer(
    @Param('id') id: string,
    @Body('toUserId') toUserId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.ordersService.transferOrder(id, req.user.id, toUserId, reason);
  }

  /**
   * 申请取消订单
   */
  @Post(':id/request-cancel')
  async requestCancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.ordersService.requestCancel(id, req.user.id, reason);
  }

  /**
   * 确认取消订单（管理员）
   */
  @Post(':id/confirm-cancel')
  @UseGuards(AdminGuard)
  async confirmCancel(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
    @Req() req: any,
  ) {
    return this.ordersService.confirmCancel(id, req.user.id, approved);
  }

  /**
   * 添加跟进记录
   */
  @Post(':id/follow-up')
  async addFollowUp(
    @Param('id') id: string,
    @Body() dto: FollowUpDto,
    @Req() req: any,
  ) {
    return this.ordersService.addFollowUp(id, req.user.id, dto);
  }

  /**
   * 完成订单
   */
  @Post(':id/complete')
  async complete(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.completeOrder(id, req.user.id);
  }

  /**
   * 管理员重新分配
   */
  @Post(':id/reassign')
  @UseGuards(AdminGuard)
  async reassign(
    @Param('id') id: string,
    @Body('newUserId') newUserId: string | null,
    @Req() req: any,
  ) {
    return this.ordersService.reassignOrder(id, newUserId, req.user.id);
  }

  /**
   * 更新订单（管理员）
   */
  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOrderDto>,
    @Req() req: any,
  ) {
    return this.ordersService.updateOrder(id, dto, req.user.id);
  }

  /**
   * 删除订单（管理员）
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.deleteOrder(id, req.user.id);
  }

  /**
   * 获取可接单用户列表（用于转让）
   */
  @Get('users/available')
  async getAvailableUsers() {
    return this.ordersService.getAvailableUsers();
  }
}
