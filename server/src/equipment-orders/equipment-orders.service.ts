import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { NotificationService } from '../notification/notification.service';
import { PermissionService } from '../permission/permission.service';
import { UserRole, PermissionAction, PermissionResource } from '../permission/permission.constants';

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PUBLISHED = 'published',    // 已发布，待接单
  ACCEPTED = 'accepted',      // 已接单
  TRANSFERRED = 'transferred', // 已转让
  CANCELLING = 'cancelling',  // 取消中（待管理员确认）
  CANCELLED = 'cancelled',    // 已取消
  COMPLETED = 'completed',    // 已完成
}

/**
 * 订单类型枚举
 */
export enum OrderType {
  PURCHASE = 'purchase',      // 求购
  TRANSFER = 'transfer',      // 转让
}

/**
 * 创建订单DTO
 */
export interface CreateOrderDto {
  orderType: OrderType;
  title: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  condition?: string;
  expectedPrice?: number;
  customerName: string;
  customerPhone: string;
  customerWechat?: string;
  customerAddress?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * 跟进记录DTO
 */
export interface FollowUpDto {
  content: string;
  nextFollowUpTime?: string;
}

@Injectable()
export class EquipmentOrdersService {
  private get supabase() {
    return getSupabaseClient();
  }

  constructor(
    private readonly notificationService: NotificationService,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * 生成订单编号
   */
  private async generateOrderNo(orderType: OrderType): Promise<string> {
    const prefix = orderType === OrderType.PURCHASE ? 'QG' : 'ZR';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    
    const { data: todayOrders } = await this.supabase
      .from('equipment_orders')
      .select('order_no')
      .like('order_no', `${prefix}${dateStr}%`)
      .order('created_at', { ascending: false });

    const seq = (todayOrders?.length || 0) + 1;
    return `${prefix}${dateStr}${seq.toString().padStart(3, '0')}`;
  }

  /**
   * 脱敏处理电话号码
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
  }

  /**
   * 脱敏处理微信号
   */
  private maskWechat(wechat: string): string {
    if (!wechat) return wechat;
    if (wechat.length <= 2) return wechat[0] + '***';
    return wechat.substring(0, 2) + '***';
  }

  /**
   * 脱敏处理地址
   */
  private maskAddress(address: string): string {
    if (!address) return address;
    const parts = address.split(/[市区县]/);
    if (parts.length >= 2) {
      return parts[0] + (address.includes('市') ? '市***' : address.includes('区') ? '区***' : '县***');
    }
    return address.substring(0, 6) + '***';
  }

  /**
   * 发布订单（管理员）
   */
  async createOrder(dto: CreateOrderDto, userId: string) {
    // 权限检查
    await this.permissionService.requirePermission(
      userId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.CREATE,
    );

    const orderNo = await this.generateOrderNo(dto.orderType);

    const { data: order, error } = await this.supabase
      .from('equipment_orders')
      .insert({
        order_no: orderNo,
        order_type: dto.orderType,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        brand: dto.brand,
        model: dto.model,
        condition: dto.condition,
        expected_price: dto.expectedPrice,
        customer_name: dto.customerName,
        customer_phone: dto.customerPhone,
        customer_wechat: dto.customerWechat,
        customer_address: dto.customerAddress,
        status: OrderStatus.PUBLISHED,
        priority: dto.priority || 'normal',
        created_by: userId,
        follow_up_records: [],
      })
      .select()
      .single();

    if (error) {
      console.error('创建订单失败:', error);
      throw new BadRequestException(`创建订单失败: ${error.message}`);
    }

    // 推送消息给所有有接单权限的用户
    await this.notifyAllOnPublish(order);

    return { success: true, data: order };
  }

  /**
   * 发布时通知所有有接单权限的用户
   */
  private async notifyAllOnPublish(order: any) {
    const typeText = order.order_type === 'purchase' ? '求购' : '转让';
    
    // 获取所有可以接单的用户（员工、队长、管理员）
    const { data: users } = await this.supabase
      .from('users')
      .select('id')
      .in('role', ['employee', 'team_leader', 'admin'])
      .eq('status', 'active');

    if (users && users.length > 0) {
      await this.notificationService.sendNotification({
        title: `新${typeText}信息`,
        content: `【${order.title}】已发布，请及时查看接单。订单号：${order.order_no}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: users.map(u => u.id),
      });
    }
  }

  /**
   * 获取订单列表
   */
  async getOrders(params: {
    userId: string;
    userRole: string;
    orderType?: OrderType;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }) {
    const { userId, userRole, orderType, status, page = 1, limit = 20 } = params;

    let query = this.supabase
      .from('equipment_orders')
      .select('*', { count: 'exact' });

    // 数据隔离：非管理员只能看到部分数据
    const isAdmin = await this.permissionService.isAdmin(userId);
    const context = await this.permissionService.getUserContext(userId);

    // 游客只能看公开的订单梗要
    if (context?.role === UserRole.GUEST) {
      // 游客可以看到所有已发布的订单，但不能看联系信息
      query = query.eq('status', OrderStatus.PUBLISHED);
    }

    // 筛选条件
    if (orderType) {
      query = query.eq('order_type', orderType);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('获取订单列表失败:', error);
      throw new BadRequestException('获取订单列表失败');
    }

    // 处理权限和脱敏逻辑
    const processedOrders = await Promise.all((orders || []).map(async (order) => {
      const permissionCheck = await this.permissionService.canViewOrderDetail(userId, order.id);
      
      // 判断用户权限
      const isOwner = order.accepted_by === userId;
      const isCreator = order.created_by === userId;

      // 计算操作权限
      const canAccept = (await this.permissionService.canAcceptOrder(userId, order.id)).canAccept;
      const canTransfer = (await this.permissionService.canTransferOrder(userId, order.id)).canTransfer;
      const canCancel = (await this.permissionService.canCancelOrder(userId, order.id)).canCancel;

      // 脱敏处理
      if (!permissionCheck.canViewContact) {
        return {
          ...order,
          customer_phone: this.maskPhone(order.customer_phone || ''),
          customer_wechat: this.maskWechat(order.customer_wechat || ''),
          customer_address: this.maskAddress(order.customer_address || ''),
          canViewDetail: permissionCheck.canView,
          canViewContact: false,
          canAccept,
          canTransfer,
          canCancel,
        };
      }

      return {
        ...order,
        canViewDetail: true,
        canViewContact: true,
        canAccept,
        canTransfer,
        canCancel,
      };
    }));

    return {
      success: true,
      data: {
        list: processedOrders,
        pagination: { page, limit, total: count || 0 },
      },
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: string, userId: string) {
    const permissionCheck = await this.permissionService.canViewOrderDetail(userId, orderId);
    
    if (!permissionCheck.canView) {
      throw new ForbiddenException(permissionCheck.reason || '无权查看此订单');
    }

    const { data: order, error } = await this.supabase
      .from('equipment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new BadRequestException('订单不存在');
    }

    // 计算操作权限
    const canAccept = (await this.permissionService.canAcceptOrder(userId, orderId)).canAccept;
    const canTransfer = (await this.permissionService.canTransferOrder(userId, orderId)).canTransfer;
    const cancelCheck = await this.permissionService.canCancelOrder(userId, orderId);

    // 脱敏处理
    if (!permissionCheck.canViewContact) {
      return {
        success: true,
        data: {
          ...order,
          customer_phone: this.maskPhone(order.customer_phone || ''),
          customer_wechat: this.maskWechat(order.customer_wechat || ''),
          customer_address: this.maskAddress(order.customer_address || ''),
          canViewDetail: true,
          canViewContact: false,
          canAccept,
          canTransfer,
          canCancel: cancelCheck.canCancel,
          needAdminConfirm: cancelCheck.needAdminConfirm,
        },
      };
    }

    return {
      success: true,
      data: {
        ...order,
        canViewDetail: true,
        canViewContact: true,
        canAccept,
        canTransfer,
        canCancel: cancelCheck.canCancel,
        needAdminConfirm: cancelCheck.needAdminConfirm,
      },
    };
  }

  /**
   * 接单（原子操作，防止抢单）
   */
  async acceptOrder(orderId: string, userId: string) {
    // 权限检查
    const permissionCheck = await this.permissionService.canAcceptOrder(userId, orderId);
    if (!permissionCheck.canAccept) {
      throw new ForbiddenException(permissionCheck.reason || '无权接单');
    }

    // 原子操作接单
    const { data: order, error } = await this.supabase
      .from('equipment_orders')
      .update({
        status: OrderStatus.ACCEPTED,
        accepted_by: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', OrderStatus.PUBLISHED)
      .is('accepted_by', null)
      .select()
      .single();

    if (error || !order) {
      throw new BadRequestException('接单失败，订单可能已被其他人接走');
    }

    // 推送消息
    await this.notifyOnAccept(order, userId);

    return { success: true, data: order, message: '接单成功' };
  }

  /**
   * 接单时通知
   */
  private async notifyOnAccept(order: any, userId: string) {
    const typeText = order.order_type === 'purchase' ? '求购' : '转让';
    
    // 获取所有管理员
    const { data: admins } = await this.supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('status', 'active');

    const targetUsers: string[] = [userId];
    if (admins) {
      targetUsers.push(...admins.map(a => a.id));
    }

    await this.notificationService.sendNotification({
      title: `订单已被接单`,
      content: `【${order.title}】已被接单。订单号：${order.order_no}`,
      type: 'activity',
      targetType: 'single',
      targetUsers: [...new Set(targetUsers)],
    });
  }

  /**
   * 转让订单
   */
  async transferOrder(orderId: string, fromUserId: string, toUserId: string, reason?: string) {
    // 权限检查
    const permissionCheck = await this.permissionService.canTransferOrder(fromUserId, orderId);
    if (!permissionCheck.canTransfer) {
      throw new ForbiddenException(permissionCheck.reason || '无权转让订单');
    }

    // 检查目标用户是否有接单权限
    const canAccept = await this.permissionService.hasPermission(
      toUserId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.ACCEPT_ORDER,
    );
    if (!canAccept) {
      throw new BadRequestException('目标用户没有接单权限');
    }

    // 获取当前订单
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    // 更新订单
    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update({
        accepted_by: toUserId,
        status: OrderStatus.TRANSFERRED,
        transferred_to: toUserId,
        transferred_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      throw new BadRequestException('转让订单失败');
    }

    // 记录转让历史
    await this.supabase.from('order_transfers').insert({
      order_id: orderId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      transfer_reason: reason,
    });

    // 推送消息
    await this.notifyOnTransfer(order, fromUserId, toUserId);

    return { success: true, message: '转让成功' };
  }

  /**
   * 转让时通知
   */
  private async notifyOnTransfer(order: any, fromUserId: string, toUserId: string) {
    const { data: admins } = await this.supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('status', 'active');

    const targetUsers: string[] = [fromUserId, toUserId];
    if (admins) {
      targetUsers.push(...admins.map(a => a.id));
    }

    await this.notificationService.sendNotification({
      title: '订单转让通知',
      content: `【${order.title}】已转让。订单号：${order.order_no}`,
      type: 'activity',
      targetType: 'single',
      targetUsers: [...new Set(targetUsers)],
    });
  }

  /**
   * 申请取消订单
   */
  async requestCancel(orderId: string, userId: string, reason: string) {
    const cancelCheck = await this.permissionService.canCancelOrder(userId, orderId);
    if (!cancelCheck.canCancel) {
      throw new ForbiddenException(cancelCheck.reason || '无权取消订单');
    }

    const isAdmin = await this.permissionService.isAdmin(userId);

    // 管理员可以直接取消
    if (isAdmin && !cancelCheck.needAdminConfirm) {
      return this.cancelOrder(orderId, userId, reason);
    }

    // 非管理员需要申请，进入待确认状态
    const { error } = await this.supabase
      .from('equipment_orders')
      .update({
        status: OrderStatus.CANCELLING,
        cancel_reason: reason,
        cancel_requested_by: userId,
      })
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('申请取消失败');
    }

    // 通知管理员审批
    await this.notifyAdminsOnCancelRequest(orderId, reason);

    return { success: true, message: '已提交取消申请，等待管理员确认' };
  }

  /**
   * 通知管理员有取消申请
   */
  private async notifyAdminsOnCancelRequest(orderId: string, reason: string) {
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('title, order_no')
      .eq('id', orderId)
      .single();

    const { data: admins } = await this.supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('status', 'active');

    if (admins && admins.length > 0) {
      await this.notificationService.sendNotification({
        title: '订单取消申请',
        content: `【${order?.title}】申请取消，原因：${reason}。订单号：${order?.order_no}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: admins.map(a => a.id),
      });
    }
  }

  /**
   * 确认取消订单（管理员）
   */
  async confirmCancel(orderId: string, adminId: string, approved: boolean) {
    // 权限检查
    await this.permissionService.requirePermission(
      adminId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.CONFIRM_CANCEL,
    );

    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('status, cancel_requested_by')
      .eq('id', orderId)
      .single();

    if (!order || order.status !== OrderStatus.CANCELLING) {
      throw new BadRequestException('订单状态不正确');
    }

    if (approved) {
      // 批准取消
      await this.supabase
        .from('equipment_orders')
        .update({
          status: OrderStatus.CANCELLED,
          cancel_confirmed_by: adminId,
          cancel_confirmed_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // 通知申请人
      if (order.cancel_requested_by) {
        await this.notificationService.sendNotification({
          title: '订单取消已批准',
          content: `您的取消申请已批准。`,
          type: 'activity',
          targetType: 'single',
          targetUsers: [order.cancel_requested_by],
        });
      }
    } else {
      // 拒绝取消，恢复状态
      await this.supabase
        .from('equipment_orders')
        .update({
          status: OrderStatus.ACCEPTED,
          cancel_reason: null,
          cancel_requested_by: null,
        })
        .eq('id', orderId);

      // 通知申请人
      if (order.cancel_requested_by) {
        await this.notificationService.sendNotification({
          title: '订单取消被拒绝',
          content: `您的取消申请被拒绝，订单已恢复。`,
          type: 'activity',
          targetType: 'single',
          targetUsers: [order.cancel_requested_by],
        });
      }
    }

    return { success: true, message: approved ? '已批准取消' : '已拒绝取消' };
  }

  /**
   * 直接取消订单（管理员）
   */
  async cancelOrder(orderId: string, adminId: string, reason?: string) {
    await this.permissionService.requirePermission(
      adminId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.CANCEL_ORDER,
    );

    const { error } = await this.supabase
      .from('equipment_orders')
      .update({
        status: OrderStatus.CANCELLED,
        cancel_reason: reason,
        cancel_confirmed_by: adminId,
        cancel_confirmed_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('取消订单失败');
    }

    return { success: true, message: '订单已取消' };
  }

  /**
   * 完成订单
   */
  async completeOrder(orderId: string, userId: string) {
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('accepted_by, status')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    const isAdmin = await this.permissionService.isAdmin(userId);
    const isOwner = order.accepted_by === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('只有接单人或管理员才能完成订单');
    }

    if (order.status !== OrderStatus.ACCEPTED && order.status !== OrderStatus.TRANSFERRED) {
      throw new BadRequestException('当前订单状态不能完成');
    }

    const { error } = await this.supabase
      .from('equipment_orders')
      .update({
        status: OrderStatus.COMPLETED,
        completed_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('完成订单失败');
    }

    await this.notifyOnComplete(orderId);

    return { success: true, message: '订单已完成' };
  }

  /**
   * 完成时通知
   */
  private async notifyOnComplete(orderId: string) {
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('title, order_no')
      .eq('id', orderId)
      .single();

    const { data: admins } = await this.supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('status', 'active');

    if (admins && admins.length > 0) {
      await this.notificationService.sendNotification({
        title: '订单已完成',
        content: `【${order?.title}】已完成。订单号：${order?.order_no}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: admins.map(a => a.id),
      });
    }
  }

  /**
   * 添加跟进记录
   */
  async addFollowUp(orderId: string, userId: string, dto: FollowUpDto) {
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('accepted_by, follow_up_records')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    const isAdmin = await this.permissionService.isAdmin(userId);
    if (order.accepted_by !== userId && !isAdmin) {
      throw new ForbiddenException('只有接单人才能添加跟进记录');
    }

    const newRecord = {
      id: Date.now().toString(),
      content: dto.content,
      nextFollowUpTime: dto.nextFollowUpTime,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    const records = order.follow_up_records || [];
    records.push(newRecord);

    const { error } = await this.supabase
      .from('equipment_orders')
      .update({ follow_up_records: records })
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('添加跟进记录失败');
    }

    return { success: true, data: newRecord };
  }

  /**
   * 更新订单（管理员）
   */
  async updateOrder(orderId: string, dto: Partial<CreateOrderDto>, userId: string) {
    await this.permissionService.requirePermission(
      userId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.UPDATE,
    );

    const updateData: any = {};
    
    if (dto.title) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category) updateData.category = dto.category;
    if (dto.brand) updateData.brand = dto.brand;
    if (dto.model) updateData.model = dto.model;
    if (dto.condition) updateData.condition = dto.condition;
    if (dto.expectedPrice !== undefined) updateData.expected_price = dto.expectedPrice;
    if (dto.customerName) updateData.customer_name = dto.customerName;
    if (dto.customerPhone) updateData.customer_phone = dto.customerPhone;
    if (dto.customerWechat !== undefined) updateData.customer_wechat = dto.customerWechat;
    if (dto.customerAddress !== undefined) updateData.customer_address = dto.customerAddress;
    if (dto.priority) updateData.priority = dto.priority;

    const { error } = await this.supabase
      .from('equipment_orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('更新订单失败');
    }

    return { success: true, message: '更新成功' };
  }

  /**
   * 删除订单（管理员）
   */
  async deleteOrder(orderId: string, userId: string) {
    await this.permissionService.requirePermission(
      userId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.DELETE,
    );

    const { error } = await this.supabase
      .from('equipment_orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('删除订单失败');
    }

    return { success: true, message: '删除成功' };
  }

  /**
   * 获取可接单用户列表（用于转让选择）
   */
  async getAvailableUsers() {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, nickname, employee_id, role')
      .in('role', ['employee', 'team_leader', 'admin'])
      .eq('status', 'active');

    if (error) {
      throw new BadRequestException('获取用户列表失败');
    }

    return { success: true, data: users || [] };
  }

  /**
   * 管理员强制重新分配订单
   */
  async reassignOrder(orderId: string, newUserId: string | null, adminId: string) {
    await this.permissionService.requirePermission(
      adminId,
      PermissionResource.EQUIPMENT_ORDER,
      PermissionAction.MANAGE_USER,
    );

    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('accepted_by, status')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    const oldUserId = order.accepted_by;

    const updateData: any = {
      accepted_by: newUserId,
    };

    if (!newUserId) {
      // 回收订单
      updateData.status = OrderStatus.PUBLISHED;
      updateData.accepted_at = null;
    } else if (order.status === OrderStatus.PUBLISHED) {
      // 直接分配
      updateData.status = OrderStatus.ACCEPTED;
      updateData.accepted_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('equipment_orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('重新分配失败');
    }

    // 记录转让历史
    if (oldUserId && newUserId && oldUserId !== newUserId) {
      await this.supabase.from('order_transfers').insert({
        order_id: orderId,
        from_user_id: oldUserId,
        to_user_id: newUserId,
        transfer_reason: '管理员强制重新分配',
      });
    }

    await this.notifyOnReassign(orderId, oldUserId, newUserId);

    return { success: true, message: '操作成功' };
  }

  /**
   * 重新分配时通知
   */
  private async notifyOnReassign(orderId: string, oldUserId: string | null, newUserId: string | null) {
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('title, order_no')
      .eq('id', orderId)
      .single();

    const targetUsers: string[] = [];
    if (oldUserId) targetUsers.push(oldUserId);
    if (newUserId) targetUsers.push(newUserId);

    if (targetUsers.length > 0) {
      await this.notificationService.sendNotification({
        title: '订单重新分配通知',
        content: `【${order?.title}】已被管理员重新分配。订单号：${order?.order_no}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: targetUsers,
      });
    }
  }
}
