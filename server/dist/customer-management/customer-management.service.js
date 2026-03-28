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
exports.CustomerManagementService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let CustomerManagementService = class CustomerManagementService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.supabase = this.databaseService.getClient();
    }
    async getCustomers(userId, isAdmin, query) {
        const { page = 1, pageSize = 20, status, customerType, orderBelonging, keyword, orderBy = 'updated_at', order = 'desc' } = query;
        let dbQuery = this.supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('is_deleted', false);
        if (!isAdmin) {
            dbQuery = dbQuery.eq('user_id', userId);
        }
        else if (query.userId && query.userId.trim() !== '') {
            dbQuery = dbQuery.eq('user_id', query.userId);
        }
        if (status) {
            dbQuery = dbQuery.eq('status', status);
        }
        if (customerType) {
            dbQuery = dbQuery.eq('customer_type', customerType);
        }
        if (orderBelonging) {
            dbQuery = dbQuery.eq('order_belonging', orderBelonging);
        }
        if (query.orderStatus) {
            dbQuery = dbQuery.eq('order_status', query.orderStatus);
        }
        if (keyword) {
            dbQuery = dbQuery.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%,wechat.ilike.%${keyword}%`);
        }
        dbQuery = dbQuery.order(orderBy, { ascending: order === 'asc' });
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        dbQuery = dbQuery.range(from, to);
        const { data, error, count } = await dbQuery;
        if (error) {
            console.error('[CustomerService] Get customers error:', error);
            throw new Error(`获取客户列表失败: ${error.message}`);
        }
        return {
            data: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize)
        };
    }
    async getCustomerDetail(id, userId, isAdmin) {
        const { data: customer, error } = await this.supabase
            .from('customers')
            .select(`*, follow_ups:customer_follow_ups(*), status_history:customer_status_history(*)`)
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (error || !customer) {
            throw new common_1.NotFoundException('客户不存在');
        }
        if (!isAdmin && customer.user_id !== userId) {
            throw new common_1.ForbiddenException('无权查看此客户');
        }
        return customer;
    }
    async createCustomer(dto, userId) {
        const { data: customer, error } = await this.supabase
            .from('customers')
            .insert({
            ...dto,
            user_id: userId,
            first_follow_up_at: dto.firstFollowUpAt || new Date().toISOString()
        })
            .select()
            .single();
        if (error) {
            console.error('[CustomerService] Create customer error:', error);
            throw new Error(`创建客户失败: ${error.message}`);
        }
        if (dto.firstFollowUpContent) {
            await this.supabase.from('customer_follow_ups').insert({
                customer_id: customer.id,
                user_id: userId,
                follow_up_time: dto.firstFollowUpAt || new Date().toISOString(),
                content: dto.firstFollowUpContent,
                follow_up_method: dto.firstFollowUpMethod || 'other'
            });
        }
        return customer;
    }
    async updateCustomer(id, dto, userId, isAdmin) {
        const { data: existing } = await this.supabase
            .from('customers')
            .select('user_id, status')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (!existing) {
            throw new common_1.NotFoundException('客户不存在');
        }
        if (!isAdmin && existing.user_id !== userId) {
            throw new common_1.ForbiddenException('无权修改此客户');
        }
        if (dto.status && dto.status !== existing.status) {
            await this.supabase.from('customer_status_history').insert({
                customer_id: id,
                user_id: userId,
                old_status: existing.status,
                new_status: dto.status,
                reason: dto.statusChangeReason
            });
        }
        const { data: customer, error } = await this.supabase
            .from('customers')
            .update({
            ...dto,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('[CustomerService] Update customer error:', error);
            throw new Error(`更新客户失败: ${error.message}`);
        }
        return customer;
    }
    async deleteCustomer(id, userId, isAdmin) {
        const { data: existing } = await this.supabase
            .from('customers')
            .select('user_id')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (!existing) {
            throw new common_1.NotFoundException('客户不存在');
        }
        if (!isAdmin && existing.user_id !== userId) {
            throw new common_1.ForbiddenException('无权删除此客户');
        }
        const { error } = await this.supabase
            .from('customers')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) {
            console.error('[CustomerService] Delete customer error:', error);
            throw new Error(`删除客户失败: ${error.message}`);
        }
    }
    async createFollowUp(customerId, dto, userId, isAdmin) {
        const { data: customer } = await this.supabase
            .from('customers')
            .select('user_id')
            .eq('id', customerId)
            .eq('is_deleted', false)
            .single();
        if (!customer) {
            throw new common_1.NotFoundException('客户不存在');
        }
        if (!isAdmin && customer.user_id !== userId) {
            throw new common_1.ForbiddenException('无权为此客户添加跟进记录');
        }
        const { data: followUp, error } = await this.supabase
            .from('customer_follow_ups')
            .insert({
            customer_id: customerId,
            user_id: userId,
            follow_up_time: dto.followUpTime,
            content: dto.content,
            follow_up_method: dto.followUpMethod,
            next_follow_up_plan: dto.nextFollowUpPlan
        })
            .select()
            .single();
        if (error) {
            console.error('[CustomerService] Create follow-up error:', error);
            throw new Error(`创建跟进记录失败: ${error.message}`);
        }
        return followUp;
    }
    async getFollowUps(customerId, userId, isAdmin) {
        const { data: customer } = await this.supabase
            .from('customers')
            .select('user_id')
            .eq('id', customerId)
            .eq('is_deleted', false)
            .single();
        if (!customer) {
            throw new common_1.NotFoundException('客户不存在');
        }
        if (!isAdmin && customer.user_id !== userId) {
            throw new common_1.ForbiddenException('无权查看此客户的跟进记录');
        }
        const { data: followUps, error } = await this.supabase
            .from('customer_follow_ups')
            .select('*')
            .eq('customer_id', customerId)
            .order('follow_up_time', { ascending: false });
        if (error) {
            console.error('[CustomerService] Get follow-ups error:', error);
            throw new Error(`获取跟进记录失败: ${error.message}`);
        }
        return followUps || [];
    }
    async getStatistics(userId, isAdmin) {
        let query = this.supabase
            .from('customers')
            .select('status, order_status, estimated_amount')
            .eq('is_deleted', false);
        if (!isAdmin) {
            query = query.eq('user_id', userId);
        }
        const { data: customers, error } = await query;
        if (error) {
            console.error('[CustomerService] Get statistics error:', error);
            throw new Error(`获取统计数据失败: ${error.message}`);
        }
        const total = customers?.length || 0;
        const normal = customers?.filter(c => c.status === 'normal').length || 0;
        const atRisk = customers?.filter(c => c.status === 'at_risk').length || 0;
        const lost = customers?.filter(c => c.status === 'lost').length || 0;
        const inProgress = customers?.filter(c => c.order_status === 'in_progress').length || 0;
        const completed = customers?.filter(c => c.order_status === 'completed').length || 0;
        const totalAmount = customers?.reduce((sum, c) => sum + (parseFloat(c.estimated_amount) || 0), 0) || 0;
        return {
            total,
            statusDistribution: { normal, atRisk, lost },
            orderDistribution: { inProgress, completed },
            totalEstimatedAmount: totalAmount,
            conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
        };
    }
    async getWeeklyStatistics(userId, isAdmin) {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        let query = this.supabase
            .from('customers')
            .select('created_at, status, estimated_amount')
            .eq('is_deleted', false)
            .gte('created_at', weekStart.toISOString());
        if (!isAdmin) {
            query = query.eq('user_id', userId);
        }
        const { data: customers, error } = await query;
        if (error) {
            console.error('[CustomerService] Get weekly statistics error:', error);
            throw new Error(`获取周统计失败: ${error.message}`);
        }
        const dailyStats = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyStats[dateStr] = { new: 0, followUp: 0 };
        }
        customers?.forEach(c => {
            const dateStr = c.created_at.split('T')[0];
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].new++;
            }
        });
        return {
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: now.toISOString().split('T')[0],
            newCustomers: customers?.length || 0,
            dailyStats,
            totalAmount: customers?.reduce((sum, c) => sum + (parseFloat(c.estimated_amount) || 0), 0) || 0
        };
    }
    async getMonthlyStatistics(userId, isAdmin) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        let query = this.supabase
            .from('customers')
            .select('created_at, status, order_status, estimated_amount')
            .eq('is_deleted', false)
            .gte('created_at', monthStart.toISOString());
        if (!isAdmin) {
            query = query.eq('user_id', userId);
        }
        const { data: customers, error } = await query;
        if (error) {
            console.error('[CustomerService] Get monthly statistics error:', error);
            throw new Error(`获取月统计失败: ${error.message}`);
        }
        return {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            newCustomers: customers?.length || 0,
            statusDistribution: {
                normal: customers?.filter(c => c.status === 'normal').length || 0,
                atRisk: customers?.filter(c => c.status === 'at_risk').length || 0,
                lost: customers?.filter(c => c.status === 'lost').length || 0
            },
            completedOrders: customers?.filter(c => c.order_status === 'completed').length || 0,
            totalAmount: customers?.reduce((sum, c) => sum + (parseFloat(c.estimated_amount) || 0), 0) || 0
        };
    }
    async getStatisticsBySales() {
        const { data: stats, error } = await this.supabase
            .from('customers')
            .select('user_id, status, order_status, estimated_amount, users(name)')
            .eq('is_deleted', false);
        if (error) {
            console.error('[CustomerService] Get statistics by sales error:', error);
            throw new Error(`获取销售统计失败: ${error.message}`);
        }
        const salesMap = {};
        stats?.forEach(c => {
            const userId = c.user_id;
            if (!salesMap[userId]) {
                salesMap[userId] = {
                    name: Array.isArray(c.users) && c.users[0]?.name ? c.users[0].name : '未知',
                    total: 0,
                    normal: 0,
                    atRisk: 0,
                    lost: 0,
                    completed: 0,
                    totalAmount: 0
                };
            }
            salesMap[userId].total++;
            if (c.status === 'normal')
                salesMap[userId].normal++;
            if (c.status === 'at_risk')
                salesMap[userId].atRisk++;
            if (c.status === 'lost')
                salesMap[userId].lost++;
            if (c.order_status === 'completed')
                salesMap[userId].completed++;
            salesMap[userId].totalAmount += parseFloat(c.estimated_amount) || 0;
        });
        return Object.entries(salesMap).map(([userId, data]) => ({
            userId,
            ...data,
            conversionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : '0'
        }));
    }
};
exports.CustomerManagementService = CustomerManagementService;
exports.CustomerManagementService = CustomerManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CustomerManagementService);
//# sourceMappingURL=customer-management.service.js.map