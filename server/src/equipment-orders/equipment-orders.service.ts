import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { NotificationService } from '../notification/notification.service';

// 订单状态枚举
export enum OrderStatus {
  PUBLISHED = 'published',   // 已发布，待接单
  TAKEN = 'taken',          // 已接单
  COMPLETED = 'completed',  // 已完成
  CLOSED = 'closed',        // 已关闭
}

// 订单类型枚举
export enum OrderType {
  PURCHASE = 'purchase',    // 求购
  TRANSFER = 'transfer',    // 转让
}

// 创建订单DTO
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

// 跟进记录DTO
export interface FollowUpDto {
  content: string;
  nextFollowUpTime?: string;
}

@Injectable()
export class EquipmentOrdersService {
  private get supabase() {
    return getSupabaseClient();
  }

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 生成订单编号
   */
  private async generateOrderNo(orderType: OrderType): Promise<string> {
    const prefix = orderType === OrderType.PURCHASE ? 'QG' : 'ZR';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    
    // 查询今天的订单数量
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
    // 只显示省市区，隐藏详细地址
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
      throw new Error(`创建订单失败: ${error.message}`);
    }

    // 推送消息给所有销售
    await this.notifyAllSalesOnPublish(order);

    return { success: true, data: order };
  }

  /**
   * 发布时通知所有销售
   */
  private async notifyAllSalesOnPublish(order: any) {
    const typeText = order.order_type === 'purchase' ? '求购' : '转让';
    
    // 获取所有销售角色的用户
    const { data: salesUsers } = await this.supabase
      .from('users')
      .select('id')
      .eq('role', 'user')
      .eq('status', 'active');

    if (salesUsers && salesUsers.length > 0) {
      const userIds = salesUsers.map(u => u.id);
      
      await this.notificationService.sendNotification({
        title: `新${typeText}信息`,
        content: `【${order.title}】已发布，请及时查看接单。订单号：${order.order_no}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: userIds,
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
      throw new Error('获取订单列表失败');
    }

    // 处理脱敏逻辑
    const processedOrders = (orders || []).map(order => {
      const isOwner = order.taken_by === userId;
      const isAdmin = userRole === 'admin';

      // 未接单：所有人只能看脱敏信息
      // 已接单：只有接单人和管理员可以看完整信息
      if (order.status === OrderStatus.PUBLISHED || (!isOwner && !isAdmin)) {
        return {
          ...order,
          customer_phone: this.maskPhone(order.customer_phone || ''),
          customer_wechat: this.maskWechat(order.customer_wechat || ''),
          customer_address: this.maskAddress(order.customer_address || ''),
          canViewDetail: false,
          canTake: order.status === OrderStatus.PUBLISHED,
          canTransfer: false,
        };
      }

      // 接单人或管理员可以看完整信息
      return {
        ...order,
        canViewDetail: true,
        canTake: false,
        canTransfer: isOwner && order.status === OrderStatus.TAKEN,
      };
    });

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
  async getOrderDetail(orderId: string, userId: string, userRole: string) {
    const { data: order, error } = await this.supabase
      .from('equipment_orders')
      .select('*, order_transfers(*)')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('获取订单详情失败:', error);
      throw new Error('获取订单详情失败');
    }

    if (!order) {
      throw new Error('订单不存在');
    }

    const isOwner = order.taken_by === userId;
    const isAdmin = userRole === 'admin';

    // 权限判断
    const canViewDetail = isAdmin || isOwner || order.status === OrderStatus.PUBLISHED;
    const canTake = order.status === OrderStatus.PUBLISHED;
    const canTransfer = isOwner && order.status === OrderStatus.TAKEN;
    const canComplete = isOwner && order.status === OrderStatus.TAKEN;
    const canClose = isAdmin || isOwner;
    const canEdit = isAdmin;

    // 脱敏处理
    if (order.status === OrderStatus.PUBLISHED || (!isOwner && !isAdmin)) {
      return {
        success: true,
        data: {
          ...order,
          customer_phone: this.maskPhone(order.customer_phone || ''),
          customer_wechat: this.maskWechat(order.customer_wechat || ''),
          customer_address: this.maskAddress(order.customer_address || ''),
          canViewDetail: false,
          canTake,
          canTransfer: false,
          canComplete: false,
          canClose: false,
          canEdit,
        },
      };
    }

    return {
      success: true,
      data: {
        ...order,
        canViewDetail: true,
        canTake: false,
        canTransfer,
        canComplete,
        canClose,
        canEdit,
      },
    };
  }

  /**
   * 接单（原子操作，防止抢单）
   */
  async takeOrder(orderId: string, userId: string) {
    // 使用 PostgreSQL 的原子更新确保只有一人能接单
    const { data: order, error } = await this.supabase
      .from('equipment_orders')
      .update({
        status: OrderStatus.TAKEN,
        taken_by: userId,
        taken_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', OrderStatus.PUBLISHED) // 只能接已发布的
      .is('taken_by', null) // 确保没有人接单
      .select()
      .single();

    if (error || !order) {
      console.error('接单失败:', error);
      throw new Error('接单失败，订单可能已被其他人接走');
    }

    // 推送消息给管理员和接单人
    await this.notifyOnTake(order, userId);

    return { success: true, data: order, message: '接单成功' };
  }

  /**
   * 接单时通知管理员和接单人
   */
  private async notifyOnTake(order: any, userId: string) {
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
    // 验证订单状态和权限
    const { data: order, error: fetchError } = await this.supabase
      .from('equipment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new Error('订单不存在');
    }

    if (order.taken_by !== fromUserId) {
      throw new Error('只有当前接单人才能转让订单');
    }

    if (order.status !== OrderStatus.TAKEN) {
      throw new Error('只能转让已接单状态的订单');
    }

    // 更新订单接单人
    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update({ taken_by: toUserId })
      .eq('id', orderId);

    if (updateError) {
      console.error('转让订单失败:', updateError);
      throw new Error('转让订单失败');
    }

    // 记录转让历史
    const { error: transferError } = await this.supabase
      .from('order_transfers')
      .insert({
        order_id: orderId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        transfer_reason: reason,
      });

    if (transferError) {
      console.error('记录转让历史失败:', transferError);
    }

    // 推送消息给管理员和新旧接单人
    await this.notifyOnTransfer(order, fromUserId, toUserId);

    return { success: true, message: '转让成功' };
  }

  /**
   * 转让时通知相关人
   */
  private async notifyOnTransfer(order: any, fromUserId: string, toUserId: string) {
    // 获取所有管理员
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
   * 添加跟进记录
   */
  async addFollowUp(orderId: string, userId: string, dto: FollowUpDto) {
    const { data: order, error: fetchError } = await this.supabase
      .from('equipment_orders')
      .select('taken_by, follow_up_records')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new Error('订单不存在');
    }

    if (order.taken_by !== userId) {
      throw new Error('只有接单人才能添加跟进记录');
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

    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update({ follow_up_records: records })
      .eq('id', orderId);

    if (updateError) {
      console.error('添加跟进记录失败:', updateError);
      throw new Error('添加跟进记录失败');
    }

    return { success: true, data: newRecord };
  }

  /**
   * 完成订单
   */
  async completeOrder(orderId: string, userId: string, userRole: string) {
    const { data: order, error: fetchError } = await this.supabase
      .from('equipment_orders')
      .select('taken_by')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new Error('订单不存在');
    }

    if (order.taken_by !== userId && userRole !== 'admin') {
      throw new Error('只有接单人或管理员才能完成订单');
    }

    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update({
        status: OrderStatus.COMPLETED,
        completed_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('完成订单失败:', updateError);
      throw new Error('完成订单失败');
    }

    // 通知管理员
    await this.notifyOnComplete(orderId);

    return { success: true, message: '订单已完成' };
  }

  /**
   * 完成时通知管理员
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
   * 关闭订单
   */
  async closeOrder(orderId: string, userId: string, userRole: string, reason?: string) {
    const { data: order, error: fetchError } = await this.supabase
      .from('equipment_orders')
      .select('taken_by')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new Error('订单不存在');
    }

    if (order.taken_by !== userId && userRole !== 'admin') {
      throw new Error('只有接单人或管理员才能关闭订单');
    }

    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update({
        status: OrderStatus.CLOSED,
        closed_at: new Date().toISOString(),
        closed_reason: reason,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('关闭订单失败:', updateError);
      throw new Error('关闭订单失败');
    }

    // 通知管理员
    await this.notifyOnClose(orderId);

    return { success: true, message: '订单已关闭' };
  }

  /**
   * 关闭时通知管理员
   */
  private async notifyOnClose(orderId: string) {
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
        title: '订单已关闭',
        content: `【${order?.title}】已关闭。订单号：${order?.order_no}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: admins.map(a => a.id),
      });
    }
  }

  /**
   * 管理员强制回收/重新分配
   */
  async reassignOrder(orderId: string, newUserId: string | null, adminId: string) {
    const { data: order, error: fetchError } = await this.supabase
      .from('equipment_orders')
      .select('taken_by, status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new Error('订单不存在');
    }

    const oldUserId = order.taken_by;

    // 更新订单
    const updateData: any = {
      taken_by: newUserId,
    };

    if (!newUserId) {
      // 回收订单，重置为已发布状态
      updateData.status = OrderStatus.PUBLISHED;
      updateData.taken_at = null;
    } else if (order.status === OrderStatus.PUBLISHED) {
      // 直接分配
      updateData.status = OrderStatus.TAKEN;
      updateData.taken_at = new Date().toISOString();
    }

    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('重新分配失败:', updateError);
      throw new Error('重新分配失败');
    }

    // 记录转让历史
    if (oldUserId && newUserId && oldUserId !== newUserId) {
      await this.supabase
        .from('order_transfers')
        .insert({
          order_id: orderId,
          from_user_id: oldUserId,
          to_user_id: newUserId,
          transfer_reason: '管理员强制重新分配',
        });
    }

    // 通知相关销售
    await this.notifyOnReassign(orderId, oldUserId, newUserId);

    return { success: true, message: '操作成功' };
  }

  /**
   * 重新分配时通知相关人
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

  /**
   * 更新订单（管理员）
   */
  async updateOrder(orderId: string, dto: Partial<CreateOrderDto>) {
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
      console.error('更新订单失败:', error);
      throw new Error('更新订单失败');
    }

    return { success: true, message: '更新成功' };
  }

  /**
   * 删除订单（管理员）
   */
  async deleteOrder(orderId: string) {
    const { error } = await this.supabase
      .from('equipment_orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('删除订单失败:', error);
      throw new Error('删除订单失败');
    }

    return { success: true, message: '删除成功' };
  }

  /**
   * 获取销售列表（用于转让选择）
   */
  async getSalesList() {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, nickname, employee_id')
      .eq('role', 'user')
      .eq('status', 'active');

    if (error) {
      console.error('获取销售列表失败:', error);
      throw new Error('获取销售列表失败');
    }

    return { success: true, data: users || [] };
  }
}
