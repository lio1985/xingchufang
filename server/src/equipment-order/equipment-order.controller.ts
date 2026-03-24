import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { EquipmentOrderService, CreateOrderDto, UpdateOrderDto, TransferOrderDto } from './equipment-order.service';
import { JwtUtil, TokenPayload } from '../utils/jwt.util';

@Controller('equipment-orders')
export class EquipmentOrderController {
  constructor(private readonly service: EquipmentOrderService) {}

  private getUserId(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('请先登录');
    }
    const token = authorization.replace('Bearer ', '');
    const payload = JwtUtil.verifyToken(token) as TokenPayload;
    if (!payload) {
      throw new UnauthorizedException('Token无效');
    }
    return payload.userId;
  }

  /**
   * 获取订单列表
   */
  @Get()
  async getList(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('orderType') orderType?: string,
    @Query('keyword') keyword?: string,
    @Query('myOrders') myOrders?: string,
  ) {
    const userId = this.getUserId(auth);
    return this.service.getOrderList(userId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      orderType,
      keyword,
      myOrders: myOrders === 'true',
    });
  }

  /**
   * 获取我的订单
   */
  @Get('my')
  async getMyOrders(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const userId = this.getUserId(auth);
    return this.service.getMyOrders(userId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
    });
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  async getDetail(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(auth);
    return this.service.getOrderDetail(userId, id);
  }

  /**
   * 创建订单（管理员）
   */
  @Post()
  async create(
    @Headers('authorization') auth: string,
    @Body() dto: CreateOrderDto,
  ) {
    const userId = this.getUserId(auth);
    return this.service.createOrder(userId, dto);
  }

  /**
   * 更新订单（管理员）
   */
  @Put(':id')
  async update(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    const userId = this.getUserId(auth);
    // 管理员才能编辑
    return this.service.updateOrderStatus(userId, id, dto.status || '');
  }

  /**
   * 接单
   */
  @Post(':id/take')
  async take(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(auth);
    return this.service.takeOrder(userId, id);
  }

  /**
   * 转让订单
   */
  @Post(':id/transfer')
  async transfer(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() dto: TransferOrderDto,
  ) {
    const userId = this.getUserId(auth);
    return this.service.transferOrder(userId, id, dto);
  }

  /**
   * 获取可转让用户列表
   */
  @Get('users/transferable')
  async getTransferableUsers(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    return this.service.getTransferableUsers(userId);
  }

  /**
   * 更新订单状态
   */
  @Put(':id/status')
  async updateStatus(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    const userId = this.getUserId(auth);
    return this.service.updateOrderStatus(userId, id, body.status, body.reason);
  }

  /**
   * 管理员重分配
   */
  @Post(':id/reassign')
  async reassign(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { newUserId: string; reason?: string },
  ) {
    const userId = this.getUserId(auth);
    return this.service.reassignOrder(userId, id, body.newUserId, body.reason);
  }

  /**
   * 添加跟进记录
   */
  @Post(':id/followup')
  async addFollowUp(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    const userId = this.getUserId(auth);
    return this.service.addFollowUp(userId, id, body.content);
  }

  /**
   * 删除订单（管理员）
   */
  @Delete(':id')
  async delete(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(auth);
    return this.service.deleteOrder(userId, id);
  }
}
