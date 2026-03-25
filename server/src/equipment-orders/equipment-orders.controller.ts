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
import { AdminGuard } from '../guards/admin.guard';

@Controller('equipment-orders')
@UseGuards(ActiveUserGuard)
export class EquipmentOrdersController {
  constructor(private readonly ordersService: EquipmentOrdersService) {}

  /**
   * 创建订单（管理员）
   */
  @Post()
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
    return this.ordersService.getOrderDetail(id, req.user.id, req.user.role);
  }

  /**
   * 接单
   */
  @Post(':id/take')
  async take(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.takeOrder(id, req.user.id);
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
    return this.ordersService.completeOrder(id, req.user.id, req.user.role);
  }

  /**
   * 关闭订单
   */
  @Post(':id/close')
  async close(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.ordersService.closeOrder(id, req.user.id, req.user.role, reason);
  }

  /**
   * 管理员重新分配
   */
  @Post(':id/reassign')
  async reassign(
    @Param('id') id: string,
    @Body('newUserId') newUserId: string | null,
    @Req() req: any,
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: '只有管理员可以执行此操作' };
    }
    return this.ordersService.reassignOrder(id, newUserId, req.user.id);
  }

  /**
   * 更新订单（管理员）
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOrderDto>,
    @Req() req: any,
  ) {
    if (req.user.role !== 'admin') {
      return { success: false, message: '只有管理员可以执行此操作' };
    }
    return this.ordersService.updateOrder(id, dto);
  }

  /**
   * 删除订单（管理员）
   */
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin') {
      return { success: false, message: '只有管理员可以执行此操作' };
    }
    return this.ordersService.deleteOrder(id);
  }

  /**
   * 获取销售列表（用于转让）
   */
  @Get('sales/list')
  async getSalesList() {
    return this.ordersService.getSalesList();
  }
}
