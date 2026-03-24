import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseService } from '../database/database.service';
import {
  CreateRecycleStoreDto,
  UpdateRecycleStoreDto,
  CreateFollowUpDto,
  RecycleStoreQueryDto
} from './recycle-management.dto';

@Injectable()
export class RecycleManagementService {
  private supabase: SupabaseClient;

  constructor(private readonly databaseService: DatabaseService) {
    this.supabase = this.databaseService.getClient();
  }

  // ========== 回收门店CRUD ==========

  async getStores(userId: string, isAdmin: boolean, query: RecycleStoreQueryDto) {
    const { page = 1, pageSize = 20, status, keyword, orderBy = 'updated_at', order = 'desc' } = query;

    let dbQuery = this.supabase
      .from('recycle_stores')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

    // 非管理员只能看自己的数据
    if (!isAdmin) {
      dbQuery = dbQuery.eq('user_id', userId);
    }

    // 筛选条件
    if (status) {
      dbQuery = dbQuery.eq('recycle_status', status);
    }
    if (keyword) {
      dbQuery = dbQuery.or(`store_name.ilike.%${keyword}%,phone.ilike.%${keyword}%,wechat.ilike.%${keyword}%`);
    }

    // 排序和分页
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

  async getStoreDetail(id: string, userId: string, isAdmin: boolean) {
    const { data: store, error } = await this.supabase
      .from('recycle_stores')
      .select(`*, follow_ups:recycle_follow_ups(*)`)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error || !store) {
      throw new NotFoundException('回收门店不存在');
    }

    // 权限检查
    if (!isAdmin && store.user_id !== userId) {
      throw new ForbiddenException('无权查看此门店');
    }

    return store;
  }

  async createStore(dto: CreateRecycleStoreDto, userId: string) {
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

    // 如果有第一轮跟进内容，创建跟进记录
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

  async updateStore(id: string, dto: UpdateRecycleStoreDto, userId: string, isAdmin: boolean) {
    // 检查门店是否存在
    const { data: existingStore } = await this.supabase
      .from('recycle_stores')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!existingStore) {
      throw new NotFoundException('回收门店不存在');
    }

    // 权限检查
    if (!isAdmin && existingStore.user_id !== userId) {
      throw new ForbiddenException('无权修改此门店');
    }

    // 记录状态变更
    if (dto.recycle_status && dto.recycle_status !== existingStore.recycle_status) {
      // 可以在这里添加状态变更历史记录
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

  async deleteStore(id: string, userId: string, isAdmin: boolean) {
    // 检查门店是否存在
    const { data: existingStore } = await this.supabase
      .from('recycle_stores')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!existingStore) {
      throw new NotFoundException('回收门店不存在');
    }

    // 权限检查
    if (!isAdmin && existingStore.user_id !== userId) {
      throw new ForbiddenException('无权删除此门店');
    }

    // 软删除
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

  // ========== 跟进记录 ==========

  async getFollowUps(storeId: string, userId: string, isAdmin: boolean) {
    // 检查门店权限
    const { data: store } = await this.supabase
      .from('recycle_stores')
      .select('user_id')
      .eq('id', storeId)
      .eq('is_deleted', false)
      .single();

    if (!store) {
      throw new NotFoundException('门店不存在');
    }
    if (!isAdmin && store.user_id !== userId) {
      throw new ForbiddenException('无权查看此门店的跟进记录');
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

  async createFollowUp(storeId: string, dto: CreateFollowUpDto, userId: string, isAdmin: boolean) {
    // 检查门店权限
    const { data: store } = await this.supabase
      .from('recycle_stores')
      .select('user_id')
      .eq('id', storeId)
      .eq('is_deleted', false)
      .single();

    if (!store) {
      throw new NotFoundException('门店不存在');
    }
    if (!isAdmin && store.user_id !== userId) {
      throw new ForbiddenException('无权为此门店添加跟进记录');
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

  // ========== 统计数据 ==========

  async getOverviewStatistics(userId: string, isAdmin: boolean) {
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
    const statusDistribution: Record<string, number> = {
      pending: 0,
      contacted: 0,
      assessing: 0,
      negotiating: 0,
      deal: 0,
      recycling: 0,
      completed: 0,
      cancelled: 0
    };
    const businessTypeDistribution: Record<string, number> = {};
    let totalEstimatedValue = 0;

    allStores.forEach((store) => {
      // 状态分布
      if (store.recycle_status) {
        statusDistribution[store.recycle_status]++;
      }
      // 业务类别分布
      if (store.business_type) {
        businessTypeDistribution[store.business_type] = (businessTypeDistribution[store.business_type] || 0) + 1;
      }
      // 预估价值
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
}
