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
    try {
      // 准备插入数据
      const insertData: Record<string, any> = {
        store_name: dto.store_name,
        user_id: userId,
        first_follow_up_at: dto.first_follow_up_at || new Date().toISOString()
      };

      // 可选字段
      if (dto.phone !== undefined) insertData.phone = dto.phone;
      if (dto.wechat !== undefined) insertData.wechat = dto.wechat;
      if (dto.xiaohongshu !== undefined) insertData.xiaohongshu = dto.xiaohongshu;
      if (dto.douyin !== undefined) insertData.douyin = dto.douyin;
      if (dto.city !== undefined) insertData.city = dto.city;
      if (dto.address !== undefined) insertData.address = dto.address;
      if (dto.location !== undefined) insertData.location = dto.location;
      if (dto.business_type !== undefined) insertData.business_type = dto.business_type;
      if (dto.area_size !== undefined) insertData.area_size = dto.area_size;
      if (dto.open_date !== undefined) insertData.open_date = dto.open_date;
      if (dto.close_reason !== undefined) insertData.close_reason = dto.close_reason;
      if (dto.recycle_status !== undefined) insertData.recycle_status = dto.recycle_status;
      if (dto.estimated_devices !== undefined) insertData.estimated_devices = dto.estimated_devices;
      if (dto.estimated_value !== undefined) insertData.estimated_value = dto.estimated_value;
      if (dto.purchase_price !== undefined) insertData.purchase_price = dto.purchase_price;
      if (dto.transport_cost !== undefined) insertData.transport_cost = dto.transport_cost;
      if (dto.labor_cost !== undefined) insertData.labor_cost = dto.labor_cost;
      if (dto.total_cost !== undefined) insertData.total_cost = dto.total_cost;
      if (dto.recycle_date !== undefined) insertData.recycle_date = dto.recycle_date;
      if (dto.device_count !== undefined) insertData.device_count = dto.device_count;
      if (dto.device_status !== undefined) insertData.device_status = dto.device_status;

      console.log('[RecycleService] Creating store with data:', JSON.stringify(insertData));

      const { data: store, error } = await this.supabase
        .from('recycle_stores')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[RecycleService] Create store error:', error);
        throw new Error(`创建回收门店失败: ${error.message}`);
      }

      // 如果有第一轮跟进内容，创建跟进记录
      if (dto.first_follow_up_content) {
        await this.supabase.from('recycle_follow_ups').insert({
          store_id: store.id,
          user_id: userId,
          follow_up_time: dto.first_follow_up_at || new Date().toISOString(),
          content: dto.first_follow_up_content,
          follow_up_method: dto.first_follow_up_method
        });
      }

      return store;
    } catch (error) {
      console.error('[RecycleService] Create store exception:', error);
      throw error;
    }
  }

  async updateStore(id: string, dto: UpdateRecycleStoreDto, userId: string, isAdmin: boolean) {
    try {
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

      // 准备更新数据
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      // 可选字段
      if (dto.store_name !== undefined) updateData.store_name = dto.store_name;
      if (dto.phone !== undefined) updateData.phone = dto.phone;
      if (dto.wechat !== undefined) updateData.wechat = dto.wechat;
      if (dto.xiaohongshu !== undefined) updateData.xiaohongshu = dto.xiaohongshu;
      if (dto.douyin !== undefined) updateData.douyin = dto.douyin;
      if (dto.city !== undefined) updateData.city = dto.city;
      if (dto.address !== undefined) updateData.address = dto.address;
      if (dto.location !== undefined) updateData.location = dto.location;
      if (dto.business_type !== undefined) updateData.business_type = dto.business_type;
      if (dto.area_size !== undefined) updateData.area_size = dto.area_size;
      if (dto.open_date !== undefined) updateData.open_date = dto.open_date;
      if (dto.close_reason !== undefined) updateData.close_reason = dto.close_reason;
      if (dto.recycle_status !== undefined) updateData.recycle_status = dto.recycle_status;
      if (dto.estimated_devices !== undefined) updateData.estimated_devices = dto.estimated_devices;
      if (dto.estimated_value !== undefined) updateData.estimated_value = dto.estimated_value;
      if (dto.purchase_price !== undefined) updateData.purchase_price = dto.purchase_price;
      if (dto.transport_cost !== undefined) updateData.transport_cost = dto.transport_cost;
      if (dto.labor_cost !== undefined) updateData.labor_cost = dto.labor_cost;
      if (dto.total_cost !== undefined) updateData.total_cost = dto.total_cost;
      if (dto.recycle_date !== undefined) updateData.recycle_date = dto.recycle_date;
      if (dto.device_count !== undefined) updateData.device_count = dto.device_count;
      if (dto.device_status !== undefined) updateData.device_status = dto.device_status;

      // 记录状态变更
      if (dto.recycle_status && dto.recycle_status !== existingStore.recycle_status) {
        console.log(`[RecycleService] Status change: ${existingStore.recycle_status} -> ${dto.recycle_status}`);
      }

      console.log('[RecycleService] Updating store with data:', JSON.stringify(updateData));

      const { data: store, error } = await this.supabase
        .from('recycle_stores')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[RecycleService] Update store error:', error);
        throw new Error(`更新回收门店失败: ${error.message}`);
      }

      return store;
    } catch (error) {
      console.error('[RecycleService] Update store exception:', error);
      throw error;
    }
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
