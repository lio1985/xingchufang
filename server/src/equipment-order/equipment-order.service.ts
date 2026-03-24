import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getSupabaseClient, getSupabaseAdminClient } from '../storage/database/supabase-client';
import { NotificationService } from '../notification/notification.service';

export interface EquipmentOrder {
  id: string;
  order_no: string;
  order_type: 'transfer' | 'purchase';
  title: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  condition: string;
  expected_price: number;
  actual_price: number;
  customer_name: string;
  customer_phone: string;
  customer_wechat: string;
  customer_address: string;
  status: string;
  priority: string;
  taken_by: string;
  taken_at: string;
  completed_at: string;
  closed_at: string;
  closed_reason: string;
  follow_up_records: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
  // 关联数据
  creator?: { id: string; nickname: string };
  taker?: { id: string; nickname: string };
}

export interface MaskedOrder extends Omit<EquipmentOrder, 'customer_phone' | 'customer_wechat' | 'customer_address'> {
  customer_phone?: string;
  customer_wechat?: string;
  customer_address?: string;
}

export interface CreateOrderDto {
  order_type: 'transfer' | 'purchase';
  title: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  condition?: string;
  expected_price?: number;
  customer_name: string;
  customer_phone: string;
  customer_wechat?: string;
  customer_address?: string;
  priority?: string;
}

export interface UpdateOrderDto {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  condition?: string;
  expected_price?: number;
  actual_price?: number;
  priority?: string;
  status?: string;
}

export interface TransferOrderDto {
  to_user_id: string;
  reason?: string;
}

@Injectable()
export class EquipmentOrderService {
  private get supabase() {
    // 使用 Admin 客户端来访问 equipment_orders 表（绕过 Supabase Schema 缓存问题）
    return getSupabaseAdminClient();
  }

  constructor(private notificationService: NotificationService) {}

  /**
   * 生成订单编号
   */
  private async generateOrderNo(orderType: string): Promise<string> {
    const prefix = orderType === 'transfer' ? 'TRF' : 'PUR';
    
    const { data } = await this.supabase
      .from('equipment_orders')
      .select('order_no')
      .like('order_no', `${prefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    let seq = 1;
    if (data && data.length > 0) {
      const lastNo = data[0].order_no;
      const lastSeq = parseInt(lastNo.replace(prefix, ''), 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(8, '0')}`;
  }

  /**
   * 脱敏联系方式
   */
  private maskContactInfo(order: EquipmentOrder): MaskedOrder {
    const masked = { ...order };
    if (order.customer_phone) {
      masked.customer_phone = order.customer_phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    if (order.customer_wechat) {
      masked.customer_wechat = '***' + order.customer_wechat.slice(-4);
    }
    if (order.customer_address) {
      const addr = order.customer_address;
      masked.customer_address = addr.length > 10 ? addr.slice(0, 6) + '****' + addr.slice(-4) : '****';
    }
    return masked;
  }

  /**
   * 获取用户角色
   */
  private async getUserRole(userId: string): Promise<{ role: string; employeeId?: string }> {
    const { data } = await this.supabase
      .from('users')
      .select('role, employee_id')
      .eq('id', userId)
      .single();
    return data || { role: 'user' };
  }

  /**
   * 获取所有销售人员（用于消息推送）
   */
  private async getSalesUsers(): Promise<string[]> {
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .eq('role', 'user')
      .eq('status', 'active');
    return (data || []).map(u => u.id);
  }

  /**
   * 获取所有管理员
   */
  private async getAdminUsers(): Promise<string[]> {
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('status', 'active');
    return (data || []).map(u => u.id);
  }

  /**
   * 创建订单
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    const userRole = await this.getUserRole(userId);
    if (userRole.role !== 'admin') {
      throw new ForbiddenException('只有管理员可以发布信息');
    }

    const orderNo = await this.generateOrderNo(dto.order_type);

    const { data, error } = await this.supabase
      .from('equipment_orders')
      .insert({
        order_no: orderNo,
        order_type: dto.order_type,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        brand: dto.brand,
        model: dto.model,
        condition: dto.condition,
        expected_price: dto.expected_price,
        customer_name: dto.customer_name,
        customer_phone: dto.customer_phone,
        customer_wechat: dto.customer_wechat,
        customer_address: dto.customer_address,
        priority: dto.priority || 'normal',
        status: 'published',
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('创建订单失败:', error);
      throw new BadRequestException('创建失败: ' + error.message);
    }

    // 推送给所有销售
    const salesUsers = await this.getSalesUsers();
    if (salesUsers.length > 0) {
      await this.notificationService.sendNotification({
        title: `📢 新${dto.order_type === 'transfer' ? '设备转让' : '求购'}信息`,
        content: `${dto.title} - 点击查看详情并接单`,
        type: 'activity',
        targetType: 'single',
        targetUsers: salesUsers,
        senderId: userId,
      });
    }

    return { success: true, data };
  }

  /**
   * 获取订单列表
   */
  async getOrderList(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      orderType?: string;
      keyword?: string;
      myOrders?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 20, status, orderType, keyword, myOrders } = options;
    const userRole = await this.getUserRole(userId);
    const isAdmin = userRole.role === 'admin';

    let query = this.supabase
      .from('equipment_orders')
      .select('*, creator:users!equipment_orders_created_by_fkey(nickname), taker:users!equipment_orders_taken_by_fkey(nickname)', { count: 'exact' });

    // 管理员可见所有订单，销售只能看自己的
    if (!isAdmin) {
      if (myOrders) {
        query = query.eq('taken_by', userId);
      } else {
        query = query.eq('status', 'published');
      }
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (orderType) {
      query = query.eq('order_type', orderType);
    }

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,customer_name.ilike.%${keyword}%`);
    }

    query = query.order('created_at', { ascending: false });
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('获取订单列表失败:', error);
      throw new BadRequestException('获取列表失败');
    }

    // 脱敏处理
    const list = (data || []).map(order => {
      const masked = this.maskContactInfo(order);
      delete masked.customer_phone;
      delete masked.customer_wechat;
      delete masked.customer_address;
      return {
        ...masked,
        customer_phone: '****',
        customer_wechat: '****',
        customer_address: '****',
      };
    });

    return {
      success: true,
      data: {
        list,
        pagination: { page, limit, total: count || 0 },
      },
    };
  }

  /**
   * 获取订单详情（权限控制）
   */
  async getOrderDetail(userId: string, orderId: string) {
    const userRole = await this.getUserRole(userId);
    const isAdmin = userRole.role === 'admin';

    const { data, error } = await this.supabase
      .from('equipment_orders')
      .select('*, creator:users!equipment_orders_created_by_fkey(id, nickname), taker:users!equipment_orders_taken_by_fkey(id, nickname)')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      throw new NotFoundException('订单不存在');
    }

    // 权限判断：管理员可看完整信息，接单人可看完整信息，其他人看脱敏信息
    const isTaker = data.taken_by === userId;
    const canViewFull = isAdmin || isTaker;

    let result: MaskedOrder | EquipmentOrder;
    if (canViewFull) {
      result = data;
    } else {
      result = this.maskContactInfo(data);
    }

    return {
      success: true,
      data: {
        ...result,
        canViewFull,
        canTake: data.status === 'published',
        canTransfer: isTaker && ['taken', 'in_progress'].includes(data.status),
        canComplete: isTaker && data.status === 'in_progress',
        canClose: isAdmin || isTaker,
        canEdit: isAdmin,
      },
    };
  }

  /**
   * 接单（原子操作，防止并发）
   */
  async takeOrder(userId: string, orderId: string) {
    const userRole = await this.getUserRole(userId);
    if (userRole.role === 'admin') {
      throw new ForbiddenException('管理员不能接单');
    }

    // 使用 RPC 原子操作接单
    const { data, error } = await this.supabase.rpc('take_order_atomically', {
      p_order_id: orderId,
      p_user_id: userId,
    });

    if (error) {
      console.error('接单失败:', error);
      throw new BadRequestException(error.message || '接单失败');
    }

    if (!data) {
      throw new BadRequestException('该订单已被他人接单');
    }

    // 获取订单信息用于通知
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('*, taker:users!equipment_orders_taken_by_fkey(nickname)')
      .eq('id', orderId)
      .single();

    // 通知管理员
    const admins = await this.getAdminUsers();
    if (admins.length > 0) {
      await this.notificationService.sendNotification({
        title: '📋 订单已被接单',
        content: `${order?.title} 被 ${order?.taker?.nickname || '未知'} 接单`,
        type: 'activity',
        targetType: 'single',
        targetUsers: admins,
        senderId: userId,
      });
    }

    // 通知接单人自己
    await this.notificationService.sendNotification({
      title: '✅ 接单成功',
      content: `您已成功接单: ${order?.title}。请查看完整客户信息并跟进。`,
      type: 'activity',
      targetType: 'single',
      targetUsers: [userId],
      senderId: userId,
    });

    return { success: true, message: '接单成功', data: order };
  }

  /**
   * 转让订单
   */
  async transferOrder(userId: string, orderId: string, dto: TransferOrderDto) {
    // 获取订单信息
    const { data: order, error: orderError } = await this.supabase
      .from('equipment_orders')
      .select('*, taker:users!equipment_orders_taken_by_fkey(id)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查权限：只有接单人可以转让
    if (order.taken_by !== userId) {
      throw new ForbiddenException('只有当前接单人可以转让');
    }

    if (!['taken', 'in_progress'].includes(order.status)) {
      throw new BadRequestException('当前状态不允许转让');
    }

    // 检查目标用户是否存在
    const { data: targetUser } = await this.supabase
      .from('users')
      .select('id, nickname, role')
      .eq('id', dto.to_user_id)
      .single();

    if (!targetUser || targetUser.role === 'admin') {
      throw new BadRequestException('目标用户不存在或无法转让给管理员');
    }

    // 开启事务：更新订单 + 记录转让
    const now = new Date().toISOString();

    // 1. 记录转让
    const { error: transferError } = await this.supabase
      .from('order_transfers')
      .insert({
        order_id: orderId,
        from_user_id: userId,
        to_user_id: dto.to_user_id,
        transfer_reason: dto.reason,
      });

    if (transferError) {
      throw new BadRequestException('记录转让失败');
    }

    // 2. 更新订单
    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update({
        taken_by: dto.to_user_id,
        updated_at: now,
      })
      .eq('id', orderId);

    if (updateError) {
      throw new BadRequestException('转让失败');
    }

    // 通知管理员
    const admins = await this.getAdminUsers();
    if (admins.length > 0) {
      await this.notificationService.sendNotification({
        title: '🔄 订单已转让',
        content: `${order.title} 已转让给 ${targetUser.nickname}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: admins,
        senderId: userId,
      });
    }

    // 通知原接单人
    await this.notificationService.sendNotification({
      title: '📤 订单已转出',
      content: `您已将 ${order.title} 转让给 ${targetUser.nickname}`,
      type: 'activity',
      targetType: 'single',
      targetUsers: [userId],
      senderId: userId,
    });

    // 通知新接单人
    await this.notificationService.sendNotification({
      title: '📥 收到新转让订单',
      content: `${order.title} 已转让给您，请查看完整客户信息并跟进`,
      type: 'activity',
      targetType: 'single',
      targetUsers: [dto.to_user_id],
      senderId: userId,
    });

    return { success: true, message: '转让成功' };
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(userId: string, orderId: string, status: string, reason?: string) {
    const userRole = await this.getUserRole(userId);
    const isAdmin = userRole.role === 'admin';

    const { data: order, error } = await this.supabase
      .from('equipment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new NotFoundException('订单不存在');
    }

    const isTaker = order.taken_by === userId;

    // 权限检查
    if (status === 'in_progress' && !isAdmin && !isTaker) {
      throw new ForbiddenException('无权限');
    }

    if (status === 'completed' && !isTaker && !isAdmin) {
      throw new ForbiddenException('只有接单人可标记完成');
    }

    if (status === 'closed' && !isAdmin && !isTaker) {
      throw new ForbiddenException('无权限关闭');
    }

    if (status === 'cancelled' && !isAdmin) {
      throw new ForbiddenException('只有管理员可取消');
    }

    const now = new Date().toISOString();
    const updates: any = {
      status,
      updated_at: now,
    };

    if (status === 'completed') {
      updates.completed_at = now;
    }
    if (status === 'closed' || status === 'cancelled') {
      updates.closed_at = now;
      updates.closed_reason = reason;
    }

    const { error: updateError } = await this.supabase
      .from('equipment_orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('更新失败');
    }

    // 通知管理员
    const admins = await this.getAdminUsers();
    const statusText: Record<string, string> = {
      in_progress: '进行中',
      completed: '已完成',
      closed: '已关闭',
      cancelled: '已取消',
    };

    if (admins.length > 0) {
      await this.notificationService.sendNotification({
        title: `📋 订单状态更新`,
        content: `${order.title} 已更新为: ${statusText[status] || status}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: admins,
        senderId: userId,
      });
    }

    // 如果完成/关闭，通知接单人
    if (isTaker && ['completed', 'closed'].includes(status)) {
      await this.notificationService.sendNotification({
        title: `✅ 订单${statusText[status]}`,
        content: `${order.title} 已${statusText[status]}`,
        type: 'activity',
        targetType: 'single',
        targetUsers: [userId],
        senderId: userId,
      });
    }

    return { success: true, message: '状态更新成功' };
  }

  /**
   * 管理员重分配订单
   */
  async reassignOrder(userId: string, orderId: string, newUserId: string, reason?: string) {
    const userRole = await this.getUserRole(userId);
    if (userRole.role !== 'admin') {
      throw new ForbiddenException('只有管理员可以重分配');
    }

    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const oldTakerId = order.taken_by;

    // 记录转让
    await this.supabase.from('order_transfers').insert({
      order_id: orderId,
      from_user_id: oldTakerId || userId,
      to_user_id: newUserId,
      transfer_reason: `管理员重分配: ${reason || ''}`,
    });

    // 更新订单
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('equipment_orders')
      .update({
        taken_by: newUserId,
        updated_at: now,
      })
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('重分配失败');
    }

    // 获取新接单人信息
    const { data: newUser } = await this.supabase
      .from('users')
      .select('nickname')
      .eq('id', newUserId)
      .single();

    // 通知原接单人（如果有）
    if (oldTakerId) {
      await this.notificationService.sendNotification({
        title: '📋 订单被回收',
        content: `${order.title} 已被管理员回收并重新分配`,
        type: 'activity',
        targetType: 'single',
        targetUsers: [oldTakerId],
        senderId: userId,
      });
    }

    // 通知新接单人
    await this.notificationService.sendNotification({
      title: '📥 收到新分配订单',
      content: `${order.title} 已被管理员分配给您，请查看完整客户信息并跟进`,
      type: 'activity',
      targetType: 'single',
      targetUsers: [newUserId],
      senderId: userId,
    });

    return { success: true, message: '重分配成功' };
  }

  /**
   * 添加跟进记录
   */
  async addFollowUp(userId: string, orderId: string, content: string) {
    const { data: order } = await this.supabase
      .from('equipment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    const isAdmin = (await this.getUserRole(userId)).role === 'admin';
    const isTaker = order.taken_by === userId;

    if (!isAdmin && !isTaker) {
      throw new ForbiddenException('无权限添加跟进记录');
    }

    const now = new Date().toISOString();
    const records = order.follow_up_records || [];
    records.push({
      id: Date.now().toString(),
      userId,
      content,
      createdAt: now,
    });

    const { error } = await this.supabase
      .from('equipment_orders')
      .update({
        follow_up_records: records,
        updated_at: now,
      })
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('添加跟进记录失败');
    }

    return { success: true, message: '添加成功' };
  }

  /**
   * 删除订单（管理员）
   */
  async deleteOrder(userId: string, orderId: string) {
    const userRole = await this.getUserRole(userId);
    if (userRole.role !== 'admin') {
      throw new ForbiddenException('只有管理员可以删除');
    }

    const { error } = await this.supabase
      .from('equipment_orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      throw new BadRequestException('删除失败');
    }

    return { success: true, message: '删除成功' };
  }

  /**
   * 获取可转让的用户列表
   */
  async getTransferableUsers(userId: string) {
    const userRole = await this.getUserRole(userId);
    if (userRole.role === 'admin') {
      return { success: true, data: [] }; // 管理员不参与转让
    }

    const { data } = await this.supabase
      .from('users')
      .select('id, nickname, employee_id')
      .eq('role', 'user')
      .eq('status', 'active')
      .neq('id', userId);

    return { success: true, data: data || [] };
  }

  /**
   * 获取我的订单列表
   */
  async getMyOrders(userId: string, options: { page?: number; limit?: number; status?: string } = {}) {
    const { page = 1, limit = 20, status } = options;

    let query = this.supabase
      .from('equipment_orders')
      .select('*, creator:users!equipment_orders_created_by_fkey(nickname)', { count: 'exact' })
      .eq('taken_by', userId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('taken_at', { ascending: false });
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException('获取列表失败');
    }

    // 获取完整信息
    const orderIds = (data || []).map(o => o.id);
    let fullOrders = data || [];

    if (orderIds.length > 0) {
      const { data: fullData } = await this.supabase
        .from('equipment_orders')
        .select('*')
        .in('id', orderIds);

      fullOrders = fullData || data || [];
    }

    return {
      success: true,
      data: {
        list: fullOrders,
        pagination: { page, limit, total: count || 0 },
      },
    };
  }
}
