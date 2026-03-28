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
exports.RecycleManagementService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let RecycleManagementService = class RecycleManagementService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.supabase = this.databaseService.getClient();
    }
    async getStores(userId, isAdmin, query) {
        const { page = 1, pageSize = 20, status, keyword, orderBy = 'updated_at', order = 'desc' } = query;
        let dbQuery = this.supabase
            .from('recycle_stores')
            .select('*', { count: 'exact' })
            .eq('is_deleted', false);
        if (!isAdmin) {
            dbQuery = dbQuery.eq('user_id', userId);
        }
        if (status) {
            dbQuery = dbQuery.eq('recycle_status', status);
        }
        if (keyword) {
            dbQuery = dbQuery.or(`store_name.ilike.%${keyword}%,phone.ilike.%${keyword}%,wechat.ilike.%${keyword}%`);
        }
        dbQuery = dbQuery.order(orderBy, { ascending: order === 'asc' });
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        dbQuery = dbQuery.range(from, to);
        const { data, error, count } = await dbQuery;
        if (error) {
            console.error('[RecycleService] Get stores error:', error);
            throw new Error(`获取回收门店列表失败: ${error.message}`);
        }
        return {
            data: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize)
        };
    }
    async getStoreDetail(id, userId, isAdmin) {
        const { data: store, error } = await this.supabase
            .from('recycle_stores')
            .select(`*, follow_ups:recycle_follow_ups(*)`)
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (error || !store) {
            throw new common_1.NotFoundException('回收门店不存在');
        }
        if (!isAdmin && store.user_id !== userId) {
            throw new common_1.ForbiddenException('无权查看此门店');
        }
        return store;
    }
    async createStore(dto, userId) {
        const { data: store, error } = await this.supabase
            .from('recycle_stores')
            .insert({
            ...dto,
            user_id: userId,
            first_follow_up_at: dto.firstFollowUpAt || new Date().toISOString()
        })
            .select()
            .single();
        if (error) {
            console.error('[RecycleService] Create store error:', error);
            throw new Error(`创建回收门店失败: ${error.message}`);
        }
        if (dto.firstFollowUpContent) {
            await this.supabase.from('recycle_follow_ups').insert({
                store_id: store.id,
                user_id: userId,
                follow_up_time: dto.firstFollowUpAt || new Date().toISOString(),
                content: dto.firstFollowUpContent,
                follow_up_method: dto.firstFollowUpMethod
            });
        }
        return store;
    }
    async updateStore(id, dto, userId, isAdmin) {
        const { data: existingStore } = await this.supabase
            .from('recycle_stores')
            .select('*')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (!existingStore) {
            throw new common_1.NotFoundException('回收门店不存在');
        }
        if (!isAdmin && existingStore.user_id !== userId) {
            throw new common_1.ForbiddenException('无权修改此门店');
        }
        if (dto.recycle_status && dto.recycle_status !== existingStore.recycle_status) {
            console.log(`[RecycleService] Status change: ${existingStore.recycle_status} -> ${dto.recycle_status}`);
        }
        const { data: store, error } = await this.supabase
            .from('recycle_stores')
            .update(dto)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('[RecycleService] Update store error:', error);
            throw new Error(`更新回收门店失败: ${error.message}`);
        }
        return store;
    }
    async deleteStore(id, userId, isAdmin) {
        const { data: existingStore } = await this.supabase
            .from('recycle_stores')
            .select('*')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (!existingStore) {
            throw new common_1.NotFoundException('回收门店不存在');
        }
        if (!isAdmin && existingStore.user_id !== userId) {
            throw new common_1.ForbiddenException('无权删除此门店');
        }
        const { error } = await this.supabase
            .from('recycle_stores')
            .update({ is_deleted: true })
            .eq('id', id);
        if (error) {
            console.error('[RecycleService] Delete store error:', error);
            throw new Error(`删除回收门店失败: ${error.message}`);
        }
        return { success: true };
    }
    async getFollowUps(storeId, userId, isAdmin) {
        const { data: store } = await this.supabase
            .from('recycle_stores')
            .select('user_id')
            .eq('id', storeId)
            .eq('is_deleted', false)
            .single();
        if (!store) {
            throw new common_1.NotFoundException('门店不存在');
        }
        if (!isAdmin && store.user_id !== userId) {
            throw new common_1.ForbiddenException('无权查看此门店的跟进记录');
        }
        const { data: followUps, error } = await this.supabase
            .from('recycle_follow_ups')
            .select('*')
            .eq('store_id', storeId)
            .order('follow_up_time', { ascending: false });
        if (error) {
            console.error('[RecycleService] Get follow-ups error:', error);
            throw new Error(`获取跟进记录失败: ${error.message}`);
        }
        return followUps || [];
    }
    async createFollowUp(storeId, dto, userId, isAdmin) {
        const { data: store } = await this.supabase
            .from('recycle_stores')
            .select('user_id')
            .eq('id', storeId)
            .eq('is_deleted', false)
            .single();
        if (!store) {
            throw new common_1.NotFoundException('门店不存在');
        }
        if (!isAdmin && store.user_id !== userId) {
            throw new common_1.ForbiddenException('无权为此门店添加跟进记录');
        }
        const { data: followUp, error } = await this.supabase
            .from('recycle_follow_ups')
            .insert({
            store_id: storeId,
            user_id: userId,
            follow_up_time: dto.followUpTime,
            content: dto.content,
            follow_up_method: dto.followUpMethod,
            next_follow_up_plan: dto.nextFollowUpPlan
        })
            .select()
            .single();
        if (error) {
            console.error('[RecycleService] Create follow-up error:', error);
            throw new Error(`创建跟进记录失败: ${error.message}`);
        }
        return followUp;
    }
    async getOverviewStatistics(userId, isAdmin) {
        let query = this.supabase
            .from('recycle_stores')
            .select('*')
            .eq('is_deleted', false);
        if (!isAdmin) {
            query = query.eq('user_id', userId);
        }
        const { data: stores, error } = await query;
        if (error) {
            console.error('[RecycleService] Get overview statistics error:', error);
            throw new Error(`获取统计数据失败: ${error.message}`);
        }
        const allStores = stores || [];
        const statusDistribution = {
            pending: 0,
            contacted: 0,
            assessing: 0,
            negotiating: 0,
            deal: 0,
            recycling: 0,
            completed: 0,
            cancelled: 0
        };
        const businessTypeDistribution = {};
        let totalEstimatedValue = 0;
        allStores.forEach((store) => {
            if (store.recycle_status) {
                statusDistribution[store.recycle_status]++;
            }
            if (store.business_type) {
                businessTypeDistribution[store.business_type] = (businessTypeDistribution[store.business_type] || 0) + 1;
            }
            if (store.estimated_value) {
                totalEstimatedValue += store.estimated_value;
            }
        });
        return {
            total: allStores.length,
            statusDistribution,
            totalEstimatedValue,
            businessTypeDistribution
        };
    }
};
exports.RecycleManagementService = RecycleManagementService;
exports.RecycleManagementService = RecycleManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RecycleManagementService);
//# sourceMappingURL=recycle-management.service.js.map