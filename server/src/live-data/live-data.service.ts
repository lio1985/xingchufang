import { Injectable, Logger } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

export interface ImportLiveDataDto {
  title: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  totalViews: number;
  peakOnline: number;
  avgOnline: number;
  newFollowers: number;
  shareCount: number;
  totalComments: number;
  totalLikes: number;
  totalGifts: number;
  productClicks: number;
  productExposures: number;
  ordersCount: number;
  gmv: number;
  products?: LiveProductDto[];
}

export interface LiveProductDto {
  productName: string;
  productId?: string;
  productPrice: number;
  exposures: number;
  clicks: number;
  orders: number;
  gmv: number;
}

export interface LiveStream {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  totalViews: number;
  peakOnline: number;
  avgOnline: number;
  newFollowers: number;
  totalComments: number;
  totalLikes: number;
  totalGifts: number;
  productClicks: number;
  productExposures: number;
  ordersCount: number;
  gmv: number;
  createdAt: string;
}

@Injectable()
export class LiveDataService {
  private readonly logger = new Logger(LiveDataService.name);
  private get supabase() {
    return getSupabaseClient();
  }

  /**
   * 导入直播数据
   */
  async importLiveData(userId: string, data: ImportLiveDataDto) {
    this.logger.log(`导入直播数据: userId=${userId}, title=${data.title}`);

    // 1. 创建直播记录
    const { data: liveStream, error } = await this.supabase
      .from('live_streams')
      .insert({
        user_id: userId,
        title: data.title,
        start_time: data.startTime,
        end_time: data.endTime,
        duration_seconds: data.durationSeconds,
        total_views: data.totalViews,
        peak_online: data.peakOnline,
        avg_online: data.avgOnline,
        new_followers: data.newFollowers,
        share_count: data.shareCount,
        total_comments: data.totalComments,
        total_likes: data.totalLikes,
        total_gifts: data.totalGifts,
        product_clicks: data.productClicks,
        product_exposures: data.productExposures,
        orders_count: data.ordersCount,
        gmv: data.gmv,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('导入直播数据失败:', error);
      throw new Error('导入直播数据失败');
    }

    // 2. 如果有商品数据，保存商品明细
    if (data.products && data.products.length > 0) {
      const productsData = data.products.map(p => ({
        live_stream_id: liveStream.id,
        user_id: userId,
        product_name: p.productName,
        product_id: p.productId,
        product_price: p.productPrice,
        exposures: p.exposures,
        clicks: p.clicks,
        orders: p.orders,
        gmv: p.gmv,
      }));

      const { error: productError } = await this.supabase
        .from('live_products')
        .insert(productsData);

      if (productError) {
        this.logger.error('导入商品数据失败:', productError);
      }
    }

    // 3. 更新每日统计
    await this.updateDailyStats(userId, data.startTime);

    return {
      success: true,
      data: liveStream,
      message: '导入成功',
    };
  }

  /**
   * 获取用户的直播列表
   */
  async getLiveStreams(userId: string, page = 1, limit = 20, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('live_streams')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('查询直播列表失败:', error);
      throw new Error('查询直播列表失败');
    }

    return {
      success: true,
      data: {
        list: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
        },
      },
    };
  }

  /**
   * 获取直播详情
   */
  async getLiveStreamDetail(userId: string, liveId: string) {
    const { data: liveStream, error } = await this.supabase
      .from('live_streams')
      .select('*')
      .eq('id', liveId)
      .eq('user_id', userId)
      .single();

    if (error || !liveStream) {
      throw new Error('直播记录不存在');
    }

    // 获取商品明细
    const { data: products } = await this.supabase
      .from('live_products')
      .select('*')
      .eq('live_stream_id', liveId)
      .order('gmv', { ascending: false });

    // 获取分析总结
    const { data: analysis } = await this.supabase
      .from('live_analysis')
      .select('*')
      .eq('live_stream_id', liveId)
      .single();

    return {
      success: true,
      data: {
        ...liveStream,
        products: products || [],
        analysis: analysis || null,
      },
    };
  }

  /**
   * 删除直播记录
   */
  async deleteLiveStream(userId: string, liveId: string) {
    const { error } = await this.supabase
      .from('live_streams')
      .update({ status: 'deleted' })
      .eq('id', liveId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('删除失败');
    }

    return { success: true, message: '删除成功' };
  }

  /**
   * 获取每日统计数据
   */
  async getDailyStats(userId: string, startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('live_daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('stats_date', startDate)
      .lte('stats_date', endDate)
      .order('stats_date', { ascending: false });

    if (error) {
      throw new Error('查询统计数据失败');
    }

    return {
      success: true,
      data: data || [],
    };
  }

  /**
   * 获取汇总统计（用于看板）
   */
  async getDashboardStats(userId: string, period: 'day' | 'week' | 'month' | 'year') {
    let startDate: string;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    const { data, error } = await this.supabase
      .from('live_streams')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('start_time', startDate);

    if (error) {
      throw new Error('查询统计数据失败');
    }

    const stats = data || [];
    
    // 计算汇总数据
    const summary = {
      liveCount: stats.length,
      totalDuration: stats.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
      totalViews: stats.reduce((sum, s) => sum + (s.total_views || 0), 0),
      totalLikes: stats.reduce((sum, s) => sum + (s.total_likes || 0), 0),
      totalComments: stats.reduce((sum, s) => sum + (s.total_comments || 0), 0),
      totalGMV: stats.reduce((sum, s) => sum + parseFloat(s.gmv || 0), 0),
      totalOrders: stats.reduce((sum, s) => sum + (s.orders_count || 0), 0),
      avgOnline: stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + (s.avg_online || 0), 0) / stats.length)
        : 0,
      peakOnline: stats.length > 0
        ? Math.max(...stats.map(s => s.peak_online || 0))
        : 0,
      newFollowers: stats.reduce((sum, s) => sum + (s.new_followers || 0), 0),
    };

    return {
      success: true,
      data: {
        summary,
        trend: stats.map(s => ({
          date: s.start_time,
          views: s.total_views,
          gmv: s.gmv,
          orders: s.orders_count,
        })),
      },
    };
  }

  /**
   * 获取历史平均数据（用于对比分析）
   */
  async getHistoricalAverage(userId: string) {
    const { data, error } = await this.supabase
      .from('live_streams')
      .select('total_views, avg_online, total_comments, orders_count, gmv')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return null;
    }

    const count = data.length;
    return {
      avgViews: Math.round(data.reduce((sum, d) => sum + (d.total_views || 0), 0) / count),
      avgOnline: Math.round(data.reduce((sum, d) => sum + (d.avg_online || 0), 0) / count),
      avgComments: Math.round(data.reduce((sum, d) => sum + (d.total_comments || 0), 0) / count),
      avgOrders: Math.round(data.reduce((sum, d) => sum + (d.orders_count || 0), 0) / count),
      avgGMV: data.reduce((sum, d) => sum + parseFloat(d.gmv || 0), 0) / count,
    };
  }

  /**
   * 管理员：获取所有用户的直播数据
   */
  async getAllLiveStreamsForAdmin(page = 1, limit = 20, userId?: string, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('live_streams')
      .select('*, users!inner(nickname, role)', { count: 'exact' })
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('管理员查询直播列表失败:', error);
      throw new Error('查询失败');
    }

    return {
      success: true,
      data: {
        list: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
        },
      },
    };
  }

  /**
   * 更新每日统计数据
   */
  private async updateDailyStats(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const dateKey = date.toISOString().split('T')[0];

    // 重新计算该日期的统计数据
    const { data: dayStreams } = await this.supabase
      .from('live_streams')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', `${dateKey}T00:00:00`)
      .lt('start_time', `${dateKey}T23:59:59`)
      .eq('status', 'active');

    const stats = dayStreams || [];
    const summary = {
      live_count: stats.length,
      total_duration_seconds: stats.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
      total_views: stats.reduce((sum, s) => sum + (s.total_views || 0), 0),
      peak_online: stats.length > 0 ? Math.max(...stats.map(s => s.peak_online || 0)) : 0,
      new_followers: stats.reduce((sum, s) => sum + (s.new_followers || 0), 0),
      total_comments: stats.reduce((sum, s) => sum + (s.total_comments || 0), 0),
      total_likes: stats.reduce((sum, s) => sum + (s.total_likes || 0), 0),
      total_gmv: stats.reduce((sum, s) => sum + parseFloat(s.gmv || 0), 0),
      total_orders: stats.reduce((sum, s) => sum + (s.orders_count || 0), 0),
    };

    await this.supabase
      .from('live_daily_stats')
      .upsert({
        user_id: userId,
        stats_date: dateKey,
        ...summary,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,stats_date' });
  }
}
