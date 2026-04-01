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
    let prevStartDate: string;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        prevStartDate = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        prevStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    this.logger.log(`Querying live_streams for userId=${userId}, startDate=${startDate}`);

    try {
      // 当前周期数据
      const { data, error } = await this.supabase
        .from('live_streams')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('start_time', startDate);

      if (error) {
        this.logger.error('Supabase查询错误:', error);
        throw new Error(`查询统计数据失败: ${error.message}`);
      }

      // 上一周期数据（用于对比）
      const { data: prevData } = await this.supabase
        .from('live_streams')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('start_time', prevStartDate)
        .lt('start_time', startDate);

      const stats = data || [];
      const prevStats = prevData || [];

      // 计算总观看时长（分钟）
      const totalDurationMinutes = stats.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60;
      const totalViews = stats.reduce((sum, s) => sum + (s.total_views || 0), 0);
      const avgWatchDuration = totalViews > 0 ? Math.round((totalDurationMinutes / totalViews) * 60) : 0; // 秒

      // 计算转化率
      const totalProductClicks = stats.reduce((sum, s) => sum + (s.product_clicks || 0), 0);
      const totalProductExposures = stats.reduce((sum, s) => sum + (s.product_exposures || 0), 0);
      const conversionRate = totalProductExposures > 0 ? (totalProductClicks / totalProductExposures) * 100 : 0;

      // 计算互动率
      const totalLikes = stats.reduce((sum, s) => sum + (s.total_likes || 0), 0);
      const totalComments = stats.reduce((sum, s) => sum + (s.total_comments || 0), 0);
      const interactionRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

      // 计算粉丝转化率
      const newFollowers = stats.reduce((sum, s) => sum + (s.new_followers || 0), 0);
      const followerConversionRate = totalViews > 0 ? (newFollowers / totalViews) * 100 : 0;

      // 用户重点关注的新指标
      const exposureCount = stats.reduce((sum, s) => sum + (s.product_exposures || 0), 0); // 曝光人数
      const enterRoomCount = totalViews; // 进入直播间人数
      const avgOnline = stats.length > 0 
        ? Math.round(stats.reduce((sum, s) => sum + (s.avg_online || 0), 0) / stats.length)
        : 0; // 平均在线人数
      const peakOnline = stats.length > 0 ? Math.max(...stats.map(s => s.peak_online || 0)) : 0; // 在线峰值
      // 互动人数 = 评论人数 + 点赞人数（用评论数和点赞数估算）
      const interactionCount = totalComments + totalLikes; 
      // 私信人数（暂无数据，用分享数估算或返回0）
      const privateMessageCount = stats.reduce((sum, s) => sum + (s.share_count || 0), 0);
      // 进房率 = 进入直播间人数 / 曝光人数
      const enterRoomRate = exposureCount > 0 ? (enterRoomCount / exposureCount) * 100 : 0;

      // 当前周期汇总
      const gmv = stats.reduce((sum, s) => sum + parseFloat(s.gmv || 0), 0);
      const ordersCount = stats.reduce((sum, s) => sum + (s.orders_count || 0), 0);

      // 上一周期汇总
      const prevGMV = prevStats.reduce((sum, s) => sum + parseFloat(s.gmv || 0), 0);
      const prevOrdersCount = prevStats.reduce((sum, s) => sum + (s.orders_count || 0), 0);
      const prevTotalViews = prevStats.reduce((sum, s) => sum + (s.total_views || 0), 0);
      const prevNewFollowers = prevStats.reduce((sum, s) => sum + (s.new_followers || 0), 0);
      const prevExposureCount = prevStats.reduce((sum, s) => sum + (s.product_exposures || 0), 0);

      return {
        success: true,
        data: {
          // 原有指标
          totalViews,
          peakOnline,
          avgOnline,
          newFollowers,
          totalComments,
          totalLikes,
          ordersCount,
          gmv,
          avgWatchDuration,
          conversionRate,
          interactionRate,
          followerConversionRate,
          streamCount: stats.length,
          // 用户重点关注的新指标
          exposureCount,           // 曝光人数
          enterRoomCount,          // 进入直播间人数
          onlinePeak: peakOnline,  // 在线峰值（别名）
          interactionCount,        // 互动人数
          privateMessageCount,     // 私信人数
          enterRoomRate,           // 进房率 (%)
          // 上期对比数据
          prevPeriod: {
            gmv: prevGMV,
            ordersCount: prevOrdersCount,
            totalViews: prevTotalViews,
            newFollowers: prevNewFollowers,
            exposureCount: prevExposureCount,
          },
          // 趋势数据
          trend: stats.map(s => ({
            date: s.start_time,
            views: s.total_views,
            gmv: s.gmv,
            orders: s.orders_count,
          })),
        },
      };
    } catch (err) {
      this.logger.error('getDashboardStats error:', err);
      // 返回空数据而不是报错
      return {
        success: true,
        data: {
          totalViews: 0,
          peakOnline: 0,
          avgOnline: 0,
          newFollowers: 0,
          totalComments: 0,
          totalLikes: 0,
          ordersCount: 0,
          gmv: 0,
          avgWatchDuration: 0,
          conversionRate: 0,
          interactionRate: 0,
          followerConversionRate: 0,
          streamCount: 0,
          // 用户重点关注的新指标（默认值）
          exposureCount: 0,
          enterRoomCount: 0,
          onlinePeak: 0,
          interactionCount: 0,
          privateMessageCount: 0,
          enterRoomRate: 0,
          prevPeriod: { gmv: 0, ordersCount: 0, totalViews: 0, newFollowers: 0, exposureCount: 0 },
          trend: [],
        },
      };
    }
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
    try {
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
        // 返回空数据而不是报错
        return {
          success: true,
          data: {
            list: [],
            pagination: { page, limit, total: 0 },
          },
        };
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
    } catch (err) {
      this.logger.error('getAllLiveStreamsForAdmin error:', err);
      return {
        success: true,
        data: {
          list: [],
          pagination: { page, limit, total: 0 },
        },
      };
    }
  }

  /**
   * 管理员：获取直播数据统计
   */
  async getAdminStats(userId?: string, startDate?: string, endDate?: string) {
    try {
      let query = this.supabase
        .from('live_streams')
        .select('*, users!inner(nickname, email)', { count: 'exact' })
        .eq('status', 'active');

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
        this.logger.error('获取统计数据失败:', error);
        // 返回默认值而不是报错
        return {
          success: true,
          data: {
            totalStreams: 0,
            totalUsers: 0,
            totalGMV: 0,
            totalOrders: 0,
            totalViews: 0,
            avgGMVPerStream: 0,
            avgWatchDuration: 0,
            conversionRate: 0,
            interactionRate: 0,
            exposureCount: 0,
            enterRoomCount: 0,
            onlinePeak: 0,
            avgOnline: 0,
            newFollowers: 0,
            interactionCount: 0,
            privateMessageCount: 0,
            enterRoomRate: 0,
          },
        };
      }

      const stats = data || [];
      const uniqueUsers = new Set(stats.map((item: any) => item.user_id));
      const totalGMV = stats.reduce((sum: number, item: any) => sum + (item.gmv || 0), 0);
      const totalViews = stats.reduce((sum: number, item: any) => sum + (item.total_views || 0), 0);
      const totalOrders = stats.reduce((sum: number, item: any) => sum + (item.orders_count || 0), 0);
      const totalDuration = stats.reduce((sum: number, item: any) => sum + (item.duration_seconds || 0), 0);
      const totalComments = stats.reduce((sum: number, item: any) => sum + (item.total_comments || 0), 0);
      const totalLikes = stats.reduce((sum: number, item: any) => sum + (item.total_likes || 0), 0);
      const totalProductClicks = stats.reduce((sum: number, item: any) => sum + (item.product_clicks || 0), 0);
      const totalProductExposures = stats.reduce((sum: number, item: any) => sum + (item.product_exposures || 0), 0);

      // 用户重点关注的新指标
      const exposureCount = totalProductExposures;  // 曝光人数
      const enterRoomCount = totalViews;            // 进入直播间人数
      const avgOnline = stats.length > 0
        ? Math.round(stats.reduce((sum: number, item: any) => sum + (item.avg_online || 0), 0) / stats.length)
        : 0;  // 平均在线人数
      const onlinePeak = stats.length > 0
        ? Math.max(...stats.map((s: any) => s.peak_online || 0))
        : 0;  // 在线峰值
      const newFollowers = stats.reduce((sum: number, item: any) => sum + (item.new_followers || 0), 0);  // 新增粉丝数
      const interactionCount = totalComments + totalLikes;  // 互动人数（评论+点赞）
      const privateMessageCount = stats.reduce((sum: number, item: any) => sum + (item.share_count || 0), 0);  // 私信人数（暂用分享数）
      const enterRoomRate = exposureCount > 0 ? (enterRoomCount / exposureCount) * 100 : 0;  // 进房率

      return {
        success: true,
        data: {
          totalStreams: stats.length,
          totalUsers: uniqueUsers.size,
          totalGMV,
          totalOrders,
          totalViews,
          avgGMVPerStream: stats.length > 0 ? totalGMV / stats.length : 0,
          avgWatchDuration: totalViews > 0 ? Math.round((totalDuration / totalViews) * 60) : 0,
          conversionRate: totalProductExposures > 0 ? (totalProductClicks / totalProductExposures) * 100 : 0,
          interactionRate: totalViews > 0 ? ((totalComments + totalLikes) / totalViews) * 100 : 0,
          // 用户重点关注的新指标
          exposureCount,
          enterRoomCount,
          onlinePeak,
          avgOnline,
          newFollowers,
          interactionCount,
          privateMessageCount,
          enterRoomRate,
        },
      };
    } catch (err) {
      this.logger.error('getAdminStats error:', err);
      return {
        success: true,
        data: {
          totalStreams: 0,
          totalUsers: 0,
          totalGMV: 0,
          totalOrders: 0,
          totalViews: 0,
          avgGMVPerStream: 0,
          avgWatchDuration: 0,
          conversionRate: 0,
          interactionRate: 0,
          exposureCount: 0,
          enterRoomCount: 0,
          onlinePeak: 0,
          avgOnline: 0,
          newFollowers: 0,
          interactionCount: 0,
          privateMessageCount: 0,
          enterRoomRate: 0,
        },
      };
    }
  }

  /**
   * 管理员：导出直播数据
   */
  async exportLiveDataForAdmin(format: 'csv' | 'json', userId?: string, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('live_streams')
      .select('*, users!inner(nickname, email, role)')
      .eq('status', 'active')
      .order('start_time', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('导出直播数据失败:', error);
      throw new Error('导出失败');
    }

    const exportData = (data || []).map((item: any) => ({
      id: item.id,
      直播标题: item.title,
      主播昵称: item.users?.nickname || '',
      主播邮箱: item.users?.email || '',
      开始时间: item.start_time,
      结束时间: item.end_time,
      直播时长_秒: item.duration_seconds,
      总观看人数: item.total_views,
      最高在线: item.peak_online,
      平均在线: item.avg_online,
      新增粉丝: item.new_followers,
      分享次数: item.share_count,
      评论数: item.total_comments,
      点赞数: item.total_likes,
      礼物数: item.total_gifts,
      商品点击: item.product_clicks,
      商品曝光: item.product_exposures,
      订单数: item.orders_count,
      GMV: item.gmv,
      创建时间: item.created_at,
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `live-data-${timestamp}.${format}`;

    if (format === 'csv') {
      // 定义固定的CSV表头（解决空数据时没有表头的问题）
      const headers = [
        'id', '直播标题', '主播昵称', '主播邮箱', '开始时间', '结束时间',
        '直播时长_秒', '总观看人数', '最高在线', '平均在线', '新增粉丝',
        '分享次数', '评论数', '点赞数', '礼物数', '商品点击', '商品曝光',
        '订单数', 'GMV', '创建时间'
      ];

      const csvRows = [
        '\uFEFF' + headers.join(','), // BOM + headers
        ...exportData.map(row =>
          headers.map(header => {
            const value = (row as any)[header];
            // 处理包含逗号或换行符的值
            if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        ),
      ];

      return {
        data: csvRows.join('\n'),
        filename,
        contentType: 'text/csv; charset=utf-8',
      };
    }

    return {
      data: JSON.stringify({
        exportTime: new Date().toISOString(),
        recordCount: exportData.length,
        data: exportData,
      }, null, 2),
      filename,
      contentType: 'application/json',
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
