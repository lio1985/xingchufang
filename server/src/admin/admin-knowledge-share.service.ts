import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

@Injectable()
export class AdminKnowledgeShareService {
  // 获取知识分享列表（管理员）
  async findAll(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    category?: string;
    status?: 'published' | 'draft';
    authorId?: string;
    startDate?: string;
    endDate?: string;
    attachmentType?: 'image' | 'file' | 'audio' | 'none';
    sortBy?: string;
    sortOrder?: string;
  }) {
    const supabase = getSupabaseClient();
    const {
      page = 1,
      pageSize = 20,
      keyword,
      category,
      status,
      authorId,
      startDate,
      endDate,
      attachmentType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('knowledge_shares')
      .select(`
        id,
        title,
        category,
        tags,
        view_count,
        like_count,
        is_published,
        is_featured,
        created_at,
        attachments,
        user_id,
        users!inner (
          id,
          nickname,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_deleted', false);

    // 关键词搜索
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    // 分类筛选
    if (category) {
      query = query.eq('category', category);
    }

    // 状态筛选
    if (status) {
      query = query.eq('is_published', status === 'published');
    }

    // 作者筛选
    if (authorId && authorId.trim() !== '') {
      query = query.eq('user_id', authorId);
    }

    // 时间范围筛选
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // 附件类型筛选
    if (attachmentType) {
      if (attachmentType === 'none') {
        query = query.or('attachments.is.null');
      } else {
        // 使用 JSONB 查询
        query = query.contains('attachments', [{ fileType: attachmentType }]);
      }
    }

    // 排序
    const dbSortBy = this.mapSortField(sortBy);
    query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

    // 分页
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    const items = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      author: {
        id: item.users?.id,
        nickname: item.users?.nickname || '匿名用户',
        avatar: item.users?.avatar_url || ''
      },
      category: item.category || '其他',
      tags: item.tags || [],
      isPublished: item.is_published,
      viewCount: item.view_count || 0,
      likeCount: item.like_count || 0,
      attachmentCount: (item.attachments || []).length,
      createdAt: item.created_at,
      isFeatured: item.is_featured || false
    }));

    return {
      items,
      total: count || 0,
      page,
      pageSize
    };
  }

  // 删除知识分享（管理员）
  async remove(id: string) {
    const supabase = getSupabaseClient();

    // 检查是否存在
    const { data: existing } = await supabase
      .from('knowledge_shares')
      .select('id')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!existing) {
      throw new Error('知识分享不存在');
    }

    // 软删除
    const { error } = await supabase
      .from('knowledge_shares')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`删除失败: ${error.message}`);
    }
  }

  // 批量删除知识分享（管理员）
  async batchRemove(ids: string[]) {
    const supabase = getSupabaseClient();

    const results = await Promise.allSettled(
      ids.map(id => this.remove(id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedIds: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failedIds.push(ids[index]);
      }
    });

    return {
      successCount,
      failedCount: failedIds.length,
      failedIds
    };
  }

  // 置顶/取消置顶（管理员）
  async feature(id: string, isFeatured: boolean) {
    const supabase = getSupabaseClient();

    // 检查是否存在
    const { data: existing } = await supabase
      .from('knowledge_shares')
      .select('id')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!existing) {
      throw new Error('知识分享不存在');
    }

    const updateData: any = {
      is_featured: isFeatured,
      updated_at: new Date().toISOString()
    };

    if (isFeatured) {
      updateData.featured_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('knowledge_shares')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`操作失败: ${error.message}`);
    }
  }

  // 获取知识分享统计数据摘要
  async getSummary() {
    const supabase = getSupabaseClient();

    // 总数
    const { count: totalCount } = await supabase
      .from('knowledge_shares')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    // 已发布数
    const { count: publishedCount } = await supabase
      .from('knowledge_shares')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .eq('is_published', true);

    // 未发布数
    const { count: draftCount } = await supabase
      .from('knowledge_shares')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .eq('is_published', false);

    // 本周新增数
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weeklyNewCount } = await supabase
      .from('knowledge_shares')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', weekAgo.toISOString());

    // 总浏览量和总点赞数
    const { data: stats } = await supabase
      .from('knowledge_shares')
      .select('view_count, like_count')
      .eq('is_deleted', false);

    const totalViewCount = stats?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
    const totalLikeCount = stats?.reduce((sum, item) => sum + (item.like_count || 0), 0) || 0;

    // 活跃作者数（最近30天发布过）
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const { count: activeAuthorCount } = await supabase
      .from('knowledge_shares')
      .select('user_id', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', monthAgo.toISOString());

    return {
      totalCount: totalCount || 0,
      publishedCount: publishedCount || 0,
      draftCount: draftCount || 0,
      weeklyNewCount: weeklyNewCount || 0,
      totalViewCount,
      totalLikeCount,
      activeAuthorCount: activeAuthorCount || 0
    };
  }

  // 获取综合统计数据
  async getStats() {
    const supabase = getSupabaseClient();

    // 基础统计
    const summary = await this.getSummary();

    // 本月新增数
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const { count: monthlyNewCount } = await supabase
      .from('knowledge_shares')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', monthAgo.toISOString());

    // 分类统计
    const { data: categoryData } = await supabase
      .from('knowledge_shares')
      .select('category')
      .eq('is_deleted', false);

    const categoryStats: Record<string, number> = {};
    categoryData?.forEach((item: any) => {
      const category = item.category || '其他';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    // 附件类型统计
    const { data: attachmentData } = await supabase
      .from('knowledge_shares')
      .select('attachments')
      .eq('is_deleted', false);

    const attachmentStats = {
      withImage: 0,
      withFile: 0,
      withAudio: 0,
      noAttachment: 0
    };

    attachmentData?.forEach((item: any) => {
      const attachments = item.attachments || [];
      if (attachments.length === 0) {
        attachmentStats.noAttachment++;
      } else {
        const hasImage = attachments.some((a: any) => a.fileType === 'image');
        const hasFile = attachments.some((a: any) => a.fileType === 'file');
        const hasAudio = attachments.some((a: any) => a.fileType === 'audio');

        if (hasImage) attachmentStats.withImage++;
        if (hasFile) attachmentStats.withFile++;
        if (hasAudio) attachmentStats.withAudio++;
      }
    });

    // 附件数量分布
    const attachmentCountStats = {
      '1': 0,
      '2-5': 0,
      '6-10': 0,
      '10+': 0
    };

    attachmentData?.forEach((item: any) => {
      const count = (item.attachments || []).length;
      if (count === 0) return;
      if (count === 1) {
        attachmentCountStats['1']++;
      } else if (count <= 5) {
        attachmentCountStats['2-5']++;
      } else if (count <= 10) {
        attachmentCountStats['6-10']++;
      } else {
        attachmentCountStats['10+']++;
      }
    });

    return {
      ...summary,
      monthlyNewCount: monthlyNewCount || 0,
      categoryStats,
      attachmentStats,
      attachmentCountStats
    };
  }

  // 获取趋势数据
  async getTrend(days: number) {
    const supabase = getSupabaseClient();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const { data, error } = await supabase
      .from('knowledge_shares')
      .select('created_at')
      .eq('is_deleted', false)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    // 按日期聚合
    const dailyStats: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = 0;
    }

    (data || []).forEach((item: any) => {
      const dateStr = item.created_at.split('T')[0];
      if (dailyStats.hasOwnProperty(dateStr)) {
        dailyStats[dateStr]++;
      }
    });

    const daily = Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count
    }));

    const total = daily.reduce((sum, item) => sum + item.count, 0);

    return { daily, total };
  }

  // 获取热门知识分享排行
  async getTop(type: 'view' | 'like', limit: number) {
    const supabase = getSupabaseClient();

    const sortBy = type === 'view' ? 'view_count' : 'like_count';

    const { data, error } = await supabase
      .from('knowledge_shares')
      .select(`
        id,
        title,
        category,
        ${sortBy},
        created_at,
        user_id,
        users!inner (
          id,
          nickname,
          avatar_url
        )
      `)
      .eq('is_deleted', false)
      .eq('is_published', true)
      .order(sortBy, { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    return {
      items: (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        author: {
          id: item.users?.id,
          nickname: item.users?.nickname || '匿名用户',
          avatar: item.users?.avatar_url || ''
        },
        viewCount: item.view_count || 0,
        likeCount: item.like_count || 0,
        category: item.category || '其他',
        createdAt: item.created_at
      }))
    };
  }

  // 获取活跃作者排行
  async getTopAuthors(limit: number) {
    const supabase = getSupabaseClient();

    // 最近30天发布过知识分享的作者
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('knowledge_shares')
      .select(`
        user_id,
        users!inner (
          id,
          nickname,
          avatar_url
        )
      `)
      .eq('is_deleted', false)
      .gte('created_at', monthAgo.toISOString());

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    // 聚合作者数据
    const authorMap = new Map();

    (data || []).forEach((item: any) => {
      const userId = item.user_id;
      const author = item.users;

      if (!authorMap.has(userId)) {
        authorMap.set(userId, {
          id: userId,
          nickname: author?.nickname || '匿名用户',
          avatar: author?.avatar_url || '',
          shareCount: 0,
          totalViewCount: 0,
          totalLikeCount: 0,
          lastActiveAt: ''
        });
      }

      const authorData = authorMap.get(userId);
      authorData.shareCount++;
      authorData.totalViewCount += item.view_count || 0;
      authorData.totalLikeCount += item.like_count || 0;

      if (!authorData.lastActiveAt || item.created_at > authorData.lastActiveAt) {
        authorData.lastActiveAt = item.created_at;
      }
    });

    // 排序并取前N名
    const sorted = Array.from(authorMap.values())
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, limit);

    return {
      items: sorted
    };
  }

  // 映射排序字段
  private mapSortField(field: string): string {
    const fieldMap: Record<string, string> = {
      createdAt: 'created_at',
      viewCount: 'view_count',
      likeCount: 'like_count',
      title: 'title'
    };
    return fieldMap[field] || 'created_at';
  }

  // 获取待审核列表
  async getPending(params: { page: number; pageSize: number }) {
    const supabase = getSupabaseClient();
    const { page = 1, pageSize = 20 } = params;
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from('knowledge_shares')
      .select(`
        id,
        title,
        category,
        tags,
        view_count,
        like_count,
        created_at,
        attachments,
        user_id,
        users!inner (
          id,
          nickname,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_deleted', false)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    const items = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      author: {
        id: item.users?.id,
        nickname: item.users?.nickname || '匿名用户',
        avatar: item.users?.avatar_url || ''
      },
      category: item.category || '其他',
      tags: item.tags || [],
      viewCount: item.view_count || 0,
      likeCount: item.like_count || 0,
      attachmentCount: (item.attachments || []).length,
      createdAt: item.created_at
    }));

    return {
      items,
      total: count || 0,
      page,
      pageSize
    };
  }

  // 审核通过
  async approve(id: string, approverId: string) {
    const supabase = getSupabaseClient();

    // 检查是否存在
    const { data: existing } = await supabase
      .from('knowledge_shares')
      .select('id')
      .eq('id', id)
      .eq('approval_status', 'pending')
      .eq('is_deleted', false)
      .single();

    if (!existing) {
      throw new Error('知识分享不存在或已审核');
    }

    const { error } = await supabase
      .from('knowledge_shares')
      .update({
        approval_status: 'approved',
        is_published: true,
        approved_at: new Date().toISOString(),
        approved_by: approverId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`操作失败: ${error.message}`);
    }
  }

  // 驳回
  async reject(id: string, reason: string, approverId: string) {
    const supabase = getSupabaseClient();

    // 检查是否存在
    const { data: existing } = await supabase
      .from('knowledge_shares')
      .select('id')
      .eq('id', id)
      .eq('approval_status', 'pending')
      .eq('is_deleted', false)
      .single();

    if (!existing) {
      throw new Error('知识分享不存在或已审核');
    }

    const { error } = await supabase
      .from('knowledge_shares')
      .update({
        approval_status: 'rejected',
        is_published: false,
        approve_reason: reason,
        approved_at: new Date().toISOString(),
        approved_by: approverId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`操作失败: ${error.message}`);
    }
  }

  // 获取时间分析数据
  async getTimeAnalysis(days: number) {
    const supabase = getSupabaseClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const { data, error } = await supabase
      .from('knowledge_shares')
      .select('created_at')
      .eq('is_deleted', false)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    // 按小时统计（0-23小时）
    const hourlyStats = Array(24).fill(0);
    // 按星期统计（0=周日, 1=周一, ..., 6=周六）
    const weeklyStats = Array(7).fill(0);
    // 按日期统计
    const dailyStats: Record<string, number> = {};

    (data || []).forEach((item: any) => {
      const date = new Date(item.created_at);
      const hour = date.getHours();
      const day = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      hourlyStats[hour]++;
      weeklyStats[day]++;
      dailyStats[dateStr] = (dailyStats[dateStr] || 0) + 1;
    });

    // 星期名称
    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    return {
      hourly: hourlyStats.map((count, hour) => ({
        hour: `${hour}:00`,
        count
      })),
      weekly: weeklyStats.map((count, day) => ({
        day: weekNames[day],
        count
      })),
      daily: Object.entries(dailyStats).map(([date, count]) => ({
        date,
        count
      }))
    };
  }

  // 批量导出
  async batchExport(ids: string[]) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('knowledge_shares')
      .select(`
        id,
        title,
        category,
        content,
        tags,
        view_count,
        like_count,
        is_published,
        created_at,
        updated_at,
        user_id,
        users!inner (
          id,
          nickname,
          avatar_url
        )
      `)
      .in('id', ids)
      .eq('is_deleted', false);

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    // 生成 CSV 格式
    const headers = ['ID', '标题', '分类', '作者', '浏览量', '点赞数', '状态', '创建时间'];
    const rows = (data || []).map((item: any) => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      item.category || '其他',
      item.users?.nickname || '匿名用户',
      item.view_count || 0,
      item.like_count || 0,
      item.is_published ? '已发布' : '草稿',
      item.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return {
      filename: `knowledge_shares_${new Date().toISOString().split('T')[0]}.csv`,
      content: csvContent,
      mimeType: 'text/csv',
      count: data?.length || 0
    };
  }

  // 导出统计报告
  async exportReport() {
    const summary = await this.getSummary();
    const stats = await this.getStats();
    const trend = await this.getTrend(30);
    const topView = await this.getTop('view', 10);
    const topLike = await this.getTop('like', 10);
    const topAuthors = await this.getTopAuthors(10);

    // 生成 Markdown 报告
    const report = `# 知识分享统计报告

生成时间：${new Date().toLocaleString('zh-CN')}

## 核心指标

- 总知识分享数：${summary.totalCount}
- 已发布数：${summary.publishedCount}
- 未发布数：${summary.draftCount}
- 本周新增：${summary.weeklyNewCount}
- 总浏览量：${summary.totalViewCount}
- 总点赞数：${summary.totalLikeCount}
- 活跃作者数：${summary.activeAuthorCount}

## 分类分布

${Object.entries(stats.categoryStats || {}).map(([category, count]: [string, any]) =>
  `- ${category}：${count}`
).join('\n')}

## 附件统计

- 有图片：${stats.attachmentStats?.withImage || 0}
- 有文件：${stats.attachmentStats?.withFile || 0}
- 有录音：${stats.attachmentStats?.withAudio || 0}
- 无附件：${stats.attachmentStats?.noAttachment || 0}

## 热门知识分享（按浏览量）

${(topView.items || []).map((item: any, index: number) =>
  `${index + 1}. ${item.title} - ${item.viewCount} 浏览`
).join('\n')}

## 热门知识分享（按点赞数）

${(topLike.items || []).map((item: any, index: number) =>
  `${index + 1}. ${item.title} - ${item.likeCount} 点赞`
).join('\n')}

## 活跃作者排行

${(topAuthors.items || []).map((item: any, index: number) =>
  `${index + 1}. ${item.nickname} - ${item.shareCount} 条知识分享，${item.totalViewCount} 浏览`
).join('\n')}

---

*报告由系统自动生成*
`;

    return {
      filename: `knowledge_share_report_${new Date().toISOString().split('T')[0]}.md`,
      content: report,
      mimeType: 'text/markdown'
    };
  }
}
