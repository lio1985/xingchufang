"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentOrdersService = exports.OrderType = exports.OrderStatus = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const notification_service_1 = require("../notification/notification.service");
const permission_service_1 = require("../permission/permission.service");
const permission_constants_1 = require("../permission/permission.constants");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PUBLISHED"] = "published";
    OrderStatus["ACCEPTED"] = "accepted";
    OrderStatus["TRANSFERRED"] = "transferred";
    OrderStatus["CANCELLING"] = "cancelling";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["COMPLETED"] = "completed";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType["PURCHASE"] = "purchase";
    OrderType["TRANSFER"] = "transfer";
})(OrderType || (exports.OrderType = OrderType = {}));
let EquipmentOrdersService = class EquipmentOrdersService {
    get supabase() {
        return (0, supabase_client_1.getSupabaseClient)();
    }
    constructor(notificationService, permissionService) {
        this.notificationService = notificationService;
        this.permissionService = permissionService;
    }
    async generateOrderNo(orderType) {
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
    maskPhone(phone) {
        if (!phone || phone.length < 7)
            return phone;
        return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
    }
    maskWechat(wechat) {
        if (!wechat)
            return wechat;
        if (wechat.length <= 2)
            return wechat[0] + '***';
        return wechat.substring(0, 2) + '***';
    }
    maskAddress(address) {
        if (!address)
            return address;
        const parts = address.split(/[市区县]/);
        if (parts.length >= 2) {
            return parts[0] + (address.includes('市') ? '市***' : address.includes('区') ? '区***' : '县***');
        }
        return address.substring(0, 6) + '***';
    }
    async createOrder(dto, userId) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.CREATE);
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
            throw new common_1.BadRequestException(`创建订单失败: ${error.message}`);
        }
        await this.notifyAllOnPublish(order);
        return { success: true, data: order };
    }
    async notifyAllOnPublish(order) {
        const typeText = order.order_type === 'purchase' ? '求购' : '转让';
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
                targetType: 'user',
                targetUsers: users.map(u => u.id),
            });
        }
    }
    async getOrders(params) {
        const { userId, userRole, orderType, status, page = 1, limit = 20 } = params;
        let query = this.supabase
            .from('equipment_orders')
            .select('*', { count: 'exact' });
        const isAdmin = await this.permissionService.isAdmin(userId);
        const context = await this.permissionService.getUserContext(userId);
        if (context?.role === permission_constants_1.UserRole.GUEST) {
            query = query.eq('status', OrderStatus.PUBLISHED);
        }
        if (orderType) {
            query = query.eq('order_type', orderType);
        }
        if (status) {
            query = query.eq('status', status);
        }
        query = query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);
        const { data: orders, error, count } = await query;
        if (error) {
            console.error('获取订单列表失败:', error);
            throw new common_1.BadRequestException('获取订单列表失败');
        }
        const processedOrders = await Promise.all((orders || []).map(async (order) => {
            const permissionCheck = await this.permissionService.canViewOrderDetail(userId, order.id);
            const isOwner = order.accepted_by === userId;
            const isCreator = order.created_by === userId;
            const canAccept = (await this.permissionService.canAcceptOrder(userId, order.id)).canAccept;
            const canTransfer = (await this.permissionService.canTransferOrder(userId, order.id)).canTransfer;
            const canCancel = (await this.permissionService.canCancelOrder(userId, order.id)).canCancel;
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
    async getOrderDetail(orderId, userId) {
        const permissionCheck = await this.permissionService.canViewOrderDetail(userId, orderId);
        if (!permissionCheck.canView) {
            throw new common_1.ForbiddenException(permissionCheck.reason || '无权查看此订单');
        }
        const { data: order, error } = await this.supabase
            .from('equipment_orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (error || !order) {
            throw new common_1.BadRequestException('订单不存在');
        }
        const canAccept = (await this.permissionService.canAcceptOrder(userId, orderId)).canAccept;
        const canTransfer = (await this.permissionService.canTransferOrder(userId, orderId)).canTransfer;
        const cancelCheck = await this.permissionService.canCancelOrder(userId, orderId);
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
    async acceptOrder(orderId, userId) {
        const permissionCheck = await this.permissionService.canAcceptOrder(userId, orderId);
        if (!permissionCheck.canAccept) {
            throw new common_1.ForbiddenException(permissionCheck.reason || '无权接单');
        }
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
            throw new common_1.BadRequestException('接单失败，订单可能已被其他人接走');
        }
        await this.createRecycleStoreFromOrder(order, userId);
        await this.notifyOnAccept(order, userId);
        return { success: true, data: order, message: '接单成功，已自动创建获客登记' };
    }
    async createRecycleStoreFromOrder(order, userId) {
        try {
            const { data: existingStore } = await this.supabase
                .from('recycle_stores')
                .select('id')
                .eq('equipment_order_id', order.id)
                .eq('is_deleted', false)
                .single();
            if (existingStore) {
                console.log('[EquipmentOrders] 获客登记已存在，跳过创建:', existingStore.id);
                return;
            }
            const storeData = {
                store_name: order.customer_name || '未命名门店',
                phone: order.customer_phone || '',
                wechat: order.customer_wechat || '',
                address: order.customer_address || '',
                city: this.extractCity(order.customer_address),
                business_type: order.category || '其他',
                recycle_status: 'pending',
                equipment_order_id: order.id,
                user_id: userId,
                first_follow_up_at: new Date().toISOString(),
                estimated_devices: order.description || '',
            };
            const { data: store, error: storeError } = await this.supabase
                .from('recycle_stores')
                .insert(storeData)
                .select()
                .single();
            if (storeError) {
                console.error('[EquipmentOrders] 创建获客登记失败:', storeError);
            }
            else {
                console.log('[EquipmentOrders] 自动创建获客登记成功:', store.id);
                await this.supabase
                    .from('equipment_orders')
                    .update({ recycle_store_id: store.id })
                    .eq('id', order.id);
            }
        }
        catch (err) {
            console.error('[EquipmentOrders] 创建获客登记异常:', err);
        }
    }
    extractCity(address) {
        if (!address)
            return '';
        const cityMatch = address.match(/(北京市|上海市|天津市|重庆市|.*省.*市|.*市)/);
        if (cityMatch) {
            return cityMatch[1];
        }
        return address.substring(0, 20);
    }
    async notifyOnAccept(order, userId) {
        const typeText = order.order_type === 'purchase' ? '求购' : '转让';
        const { data: admins } = await this.supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .eq('status', 'active');
        const targetUsers = [userId];
        if (admins) {
            targetUsers.push(...admins.map(a => a.id));
        }
        await this.notificationService.sendNotification({
            title: `订单已被接单`,
            content: `【${order.title}】已被接单。订单号：${order.order_no}`,
            type: 'activity',
            targetType: 'user',
            targetUsers: [...new Set(targetUsers)],
        });
    }
    async transferOrder(orderId, fromUserId, toUserId, reason) {
        const permissionCheck = await this.permissionService.canTransferOrder(fromUserId, orderId);
        if (!permissionCheck.canTransfer) {
            throw new common_1.ForbiddenException(permissionCheck.reason || '无权转让订单');
        }
        const canAccept = await this.permissionService.hasPermission(toUserId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.ACCEPT_ORDER);
        if (!canAccept) {
            throw new common_1.BadRequestException('目标用户没有接单权限');
        }
        const { data: order } = await this.supabase
            .from('equipment_orders')
            .select('*')
            .eq('id', orderId)
            .single();
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
            throw new common_1.BadRequestException('转让订单失败');
        }
        await this.supabase.from('order_transfers').insert({
            order_id: orderId,
            from_user_id: fromUserId,
            to_user_id: toUserId,
            transfer_reason: reason,
        });
        await this.notifyOnTransfer(order, fromUserId, toUserId);
        return { success: true, message: '转让成功' };
    }
    async notifyOnTransfer(order, fromUserId, toUserId) {
        const { data: admins } = await this.supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .eq('status', 'active');
        const targetUsers = [fromUserId, toUserId];
        if (admins) {
            targetUsers.push(...admins.map(a => a.id));
        }
        await this.notificationService.sendNotification({
            title: '订单转让通知',
            content: `【${order.title}】已转让。订单号：${order.order_no}`,
            type: 'activity',
            targetType: 'user',
            targetUsers: [...new Set(targetUsers)],
        });
    }
    async requestCancel(orderId, userId, reason) {
        const cancelCheck = await this.permissionService.canCancelOrder(userId, orderId);
        if (!cancelCheck.canCancel) {
            throw new common_1.ForbiddenException(cancelCheck.reason || '无权取消订单');
        }
        const isAdmin = await this.permissionService.isAdmin(userId);
        if (isAdmin && !cancelCheck.needAdminConfirm) {
            return this.cancelOrder(orderId, userId, reason);
        }
        const { error } = await this.supabase
            .from('equipment_orders')
            .update({
            status: OrderStatus.CANCELLING,
            cancel_reason: reason,
            cancel_requested_by: userId,
        })
            .eq('id', orderId);
        if (error) {
            throw new common_1.BadRequestException('申请取消失败');
        }
        await this.notifyAdminsOnCancelRequest(orderId, reason);
        return { success: true, message: '已提交取消申请，等待管理员确认' };
    }
    async notifyAdminsOnCancelRequest(orderId, reason) {
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
                targetType: 'user',
                targetUsers: admins.map(a => a.id),
            });
        }
    }
    async confirmCancel(orderId, adminId, approved) {
        await this.permissionService.requirePermission(adminId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.CONFIRM_CANCEL);
        const { data: order } = await this.supabase
            .from('equipment_orders')
            .select('status, cancel_requested_by')
            .eq('id', orderId)
            .single();
        if (!order || order.status !== OrderStatus.CANCELLING) {
            throw new common_1.BadRequestException('订单状态不正确');
        }
        if (approved) {
            await this.supabase
                .from('equipment_orders')
                .update({
                status: OrderStatus.CANCELLED,
                cancel_confirmed_by: adminId,
                cancel_confirmed_at: new Date().toISOString(),
            })
                .eq('id', orderId);
            if (order.cancel_requested_by) {
                await this.notificationService.sendNotification({
                    title: '订单取消已批准',
                    content: `您的取消申请已批准。`,
                    type: 'activity',
                    targetType: 'user',
                    targetUsers: [order.cancel_requested_by],
                });
            }
        }
        else {
            await this.supabase
                .from('equipment_orders')
                .update({
                status: OrderStatus.ACCEPTED,
                cancel_reason: null,
                cancel_requested_by: null,
            })
                .eq('id', orderId);
            if (order.cancel_requested_by) {
                await this.notificationService.sendNotification({
                    title: '订单取消被拒绝',
                    content: `您的取消申请被拒绝，订单已恢复。`,
                    type: 'activity',
                    targetType: 'user',
                    targetUsers: [order.cancel_requested_by],
                });
            }
        }
        return { success: true, message: approved ? '已批准取消' : '已拒绝取消' };
    }
    async cancelOrder(orderId, adminId, reason) {
        await this.permissionService.requirePermission(adminId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.CANCEL_ORDER);
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
            throw new common_1.BadRequestException('取消订单失败');
        }
        return { success: true, message: '订单已取消' };
    }
    async completeOrder(orderId, userId) {
        const { data: order } = await this.supabase
            .from('equipment_orders')
            .select('accepted_by, status')
            .eq('id', orderId)
            .single();
        if (!order) {
            throw new common_1.BadRequestException('订单不存在');
        }
        const isAdmin = await this.permissionService.isAdmin(userId);
        const isOwner = order.accepted_by === userId;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('只有接单人或管理员才能完成订单');
        }
        if (order.status !== OrderStatus.ACCEPTED && order.status !== OrderStatus.TRANSFERRED) {
            throw new common_1.BadRequestException('当前订单状态不能完成');
        }
        const { error } = await this.supabase
            .from('equipment_orders')
            .update({
            status: OrderStatus.COMPLETED,
            completed_at: new Date().toISOString(),
        })
            .eq('id', orderId);
        if (error) {
            throw new common_1.BadRequestException('完成订单失败');
        }
        await this.notifyOnComplete(orderId);
        return { success: true, message: '订单已完成' };
    }
    async notifyOnComplete(orderId) {
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
                targetType: 'user',
                targetUsers: admins.map(a => a.id),
            });
        }
    }
    async addFollowUp(orderId, userId, dto) {
        const { data: order } = await this.supabase
            .from('equipment_orders')
            .select('accepted_by, follow_up_records')
            .eq('id', orderId)
            .single();
        if (!order) {
            throw new common_1.BadRequestException('订单不存在');
        }
        const isAdmin = await this.permissionService.isAdmin(userId);
        if (order.accepted_by !== userId && !isAdmin) {
            throw new common_1.ForbiddenException('只有接单人才能添加跟进记录');
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
            throw new common_1.BadRequestException('添加跟进记录失败');
        }
        return { success: true, data: newRecord };
    }
    async updateOrder(orderId, dto, userId) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.UPDATE);
        const updateData = {};
        if (dto.title)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.category)
            updateData.category = dto.category;
        if (dto.brand)
            updateData.brand = dto.brand;
        if (dto.model)
            updateData.model = dto.model;
        if (dto.condition)
            updateData.condition = dto.condition;
        if (dto.expectedPrice !== undefined)
            updateData.expected_price = dto.expectedPrice;
        if (dto.customerName)
            updateData.customer_name = dto.customerName;
        if (dto.customerPhone)
            updateData.customer_phone = dto.customerPhone;
        if (dto.customerWechat !== undefined)
            updateData.customer_wechat = dto.customerWechat;
        if (dto.customerAddress !== undefined)
            updateData.customer_address = dto.customerAddress;
        if (dto.priority)
            updateData.priority = dto.priority;
        const { error } = await this.supabase
            .from('equipment_orders')
            .update(updateData)
            .eq('id', orderId);
        if (error) {
            throw new common_1.BadRequestException('更新订单失败');
        }
        return { success: true, message: '更新成功' };
    }
    async deleteOrder(orderId, userId) {
        await this.permissionService.requirePermission(userId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.DELETE);
        const { error } = await this.supabase
            .from('equipment_orders')
            .delete()
            .eq('id', orderId);
        if (error) {
            throw new common_1.BadRequestException('删除订单失败');
        }
        return { success: true, message: '删除成功' };
    }
    async getAvailableUsers() {
        const { data: users, error } = await this.supabase
            .from('users')
            .select('id, nickname, employee_id, role')
            .in('role', ['employee', 'team_leader', 'admin'])
            .eq('status', 'active');
        if (error) {
            throw new common_1.BadRequestException('获取用户列表失败');
        }
        return { success: true, data: users || [] };
    }
    async reassignOrder(orderId, newUserId, adminId) {
        await this.permissionService.requirePermission(adminId, permission_constants_1.PermissionResource.EQUIPMENT_ORDER, permission_constants_1.PermissionAction.MANAGE_USER);
        const { data: order } = await this.supabase
            .from('equipment_orders')
            .select('accepted_by, status')
            .eq('id', orderId)
            .single();
        if (!order) {
            throw new common_1.BadRequestException('订单不存在');
        }
        const oldUserId = order.accepted_by;
        const updateData = {
            accepted_by: newUserId,
        };
        if (!newUserId) {
            updateData.status = OrderStatus.PUBLISHED;
            updateData.accepted_at = null;
        }
        else if (order.status === OrderStatus.PUBLISHED) {
            updateData.status = OrderStatus.ACCEPTED;
            updateData.accepted_at = new Date().toISOString();
        }
        const { error } = await this.supabase
            .from('equipment_orders')
            .update(updateData)
            .eq('id', orderId);
        if (error) {
            throw new common_1.BadRequestException('重新分配失败');
        }
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
    async notifyOnReassign(orderId, oldUserId, newUserId) {
        const { data: order } = await this.supabase
            .from('equipment_orders')
            .select('title, order_no')
            .eq('id', orderId)
            .single();
        const targetUsers = [];
        if (oldUserId)
            targetUsers.push(oldUserId);
        if (newUserId)
            targetUsers.push(newUserId);
        if (targetUsers.length > 0) {
            await this.notificationService.sendNotification({
                title: '订单重新分配通知',
                content: `【${order?.title}】已被管理员重新分配。订单号：${order?.order_no}`,
                type: 'activity',
                targetType: 'user',
                targetUsers: targetUsers,
            });
        }
    }
};
exports.EquipmentOrdersService = EquipmentOrdersService;
exports.EquipmentOrdersService = EquipmentOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        permission_service_1.PermissionService])
], EquipmentOrdersService);
//# sourceMappingURL=equipment-orders.service.js.map