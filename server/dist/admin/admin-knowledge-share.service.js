"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminKnowledgeShareService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
let AdminKnowledgeShareService = class AdminKnowledgeShareService {
    async findAll(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { page = 1, pageSize = 20, keyword, category, status, authorId, startDate, endDate, attachmentType, sortBy = 'createdAt', sortOrder = 'desc' } = params;
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
        if (keyword) {
            query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (status) {
            query = query.eq('is_published', status === 'published');
        }
        if (authorId && authorId.trim() !== '') {
            query = query.eq('user_id', authorId);
        }
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }
        if (attachmentType) {
            if (attachmentType === 'none') {
                query = query.or('attachments.is.null');
            }
            else {
                query = query.contains('attachments', [{ fileType: attachmentType }]);
            }
        }
        const dbSortBy = this.mapSortField(sortBy);
        query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });
        query = query.range(offset, offset + pageSize - 1);
        const { data, error, count } = await query;
        if (error) {
            throw new Error(`查询失败: ${error.message}`);
        }
        const items = (data || []).map((item) => ({
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
    async remove(id) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: existing } = await supabase
            .from('knowledge_shares')
            .select('id')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (!existing) {
            throw new Error('知识分享不存在');
        }
        const { error } = await supabase
            .from('knowledge_shares')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) {
            throw new Error(`删除失败: ${error.message}`);
        }
    }
    async batchRemove(ids) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const results = await Promise.allSettled(ids.map(id => this.remove(id)));
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failedIds = [];
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
    async feature(id, isFeatured) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: existing } = await supabase
            .from('knowledge_shares')
            .select('id')
            .eq('id', id)
            .eq('is_deleted', false)
            .single();
        if (!existing) {
            throw new Error('知识分享不存在');
        }
        const updateData = {
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
    async getSummary() {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { count: totalCount } = await supabase
            .from('knowledge_shares')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false);
        const { count: publishedCount } = await supabase
            .from('knowledge_shares')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false)
            .eq('is_published', true);
        const { count: draftCount } = await supabase
            .from('knowledge_shares')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false)
            .eq('is_published', false);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: weeklyNewCount } = await supabase
            .from('knowledge_shares')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false)
            .gte('created_at', weekAgo.toISOString());
        const { data: stats } = await supabase
            .from('knowledge_shares')
            .select('view_count, like_count')
            .eq('is_deleted', false);
        const totalViewCount = stats?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
        const totalLikeCount = stats?.reduce((sum, item) => sum + (item.like_count || 0), 0) || 0;
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
    async getStats() {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const summary = await this.getSummary();
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const { count: monthlyNewCount } = await supabase
            .from('knowledge_shares')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false)
            .gte('created_at', monthAgo.toISOString());
        const { data: categoryData } = await supabase
            .from('knowledge_shares')
            .select('category')
            .eq('is_deleted', false);
        const categoryStats = {};
        categoryData?.forEach((item) => {
            const category = item.category || '其他';
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
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
        attachmentData?.forEach((item) => {
            const attachments = item.attachments || [];
            if (attachments.length === 0) {
                attachmentStats.noAttachment++;
            }
            else {
                const hasImage = attachments.some((a) => a.fileType === 'image');
                const hasFile = attachments.some((a) => a.fileType === 'file');
                const hasAudio = attachments.some((a) => a.fileType === 'audio');
                if (hasImage)
                    attachmentStats.withImage++;
                if (hasFile)
                    attachmentStats.withFile++;
                if (hasAudio)
                    attachmentStats.withAudio++;
            }
        });
        const attachmentCountStats = {
            '1': 0,
            '2-5': 0,
            '6-10': 0,
            '10+': 0
        };
        attachmentData?.forEach((item) => {
            const count = (item.attachments || []).length;
            if (count === 0)
                return;
            if (count === 1) {
                attachmentCountStats['1']++;
            }
            else if (count <= 5) {
                attachmentCountStats['2-5']++;
            }
            else if (count <= 10) {
                attachmentCountStats['6-10']++;
            }
            else {
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
    async getTrend(days) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
        const dailyStats = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyStats[dateStr] = 0;
        }
        (data || []).forEach((item) => {
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
    async getTop(type, limit) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
            items: (data || []).map((item) => ({
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
    async getTopAuthors(limit) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
        const authorMap = new Map();
        (data || []).forEach((item) => {
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
        const sorted = Array.from(authorMap.values())
            .sort((a, b) => b.shareCount - a.shareCount)
            .slice(0, limit);
        return {
            items: sorted
        };
    }
    mapSortField(field) {
        const fieldMap = {
            createdAt: 'created_at',
            viewCount: 'view_count',
            likeCount: 'like_count',
            title: 'title'
        };
        return fieldMap[field] || 'created_at';
    }
    async getPending(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
        const items = (data || []).map((item) => ({
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
    async approve(id, approverId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
    async reject(id, reason, approverId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
    async getTimeAnalysis(days) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
        const hourlyStats = Array(24).fill(0);
        const weeklyStats = Array(7).fill(0);
        const dailyStats = {};
        (data || []).forEach((item) => {
            const date = new Date(item.created_at);
            const hour = date.getHours();
            const day = date.getDay();
            const dateStr = date.toISOString().split('T')[0];
            hourlyStats[hour]++;
            weeklyStats[day]++;
            dailyStats[dateStr] = (dailyStats[dateStr] || 0) + 1;
        });
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
    async batchExport(ids) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
        const headers = ['ID', '标题', '分类', '作者', '浏览量', '点赞数', '状态', '创建时间'];
        const rows = (data || []).map((item) => [
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
    async exportReport() {
        const summary = await this.getSummary();
        const stats = await this.getStats();
        const trend = await this.getTrend(30);
        const topView = await this.getTop('view', 10);
        const topLike = await this.getTop('like', 10);
        const topAuthors = await this.getTopAuthors(10);
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

${Object.entries(stats.categoryStats || {}).map(([category, count]) => `- ${category}：${count}`).join('\n')}

## 附件统计

- 有图片：${stats.attachmentStats?.withImage || 0}
- 有文件：${stats.attachmentStats?.withFile || 0}
- 有录音：${stats.attachmentStats?.withAudio || 0}
- 无附件：${stats.attachmentStats?.noAttachment || 0}

## 热门知识分享（按浏览量）

${(topView.items || []).map((item, index) => `${index + 1}. ${item.title} - ${item.viewCount} 浏览`).join('\n')}

## 热门知识分享（按点赞数）

${(topLike.items || []).map((item, index) => `${index + 1}. ${item.title} - ${item.likeCount} 点赞`).join('\n')}

## 活跃作者排行

${(topAuthors.items || []).map((item, index) => `${index + 1}. ${item.nickname} - ${item.shareCount} 条知识分享，${item.totalViewCount} 浏览`).join('\n')}

---

*报告由系统自动生成*
`;
        return {
            filename: `knowledge_share_report_${new Date().toISOString().split('T')[0]}.md`,
            content: report,
            mimeType: 'text/markdown'
        };
    }
};
exports.AdminKnowledgeShareService = AdminKnowledgeShareService;
exports.AdminKnowledgeShareService = AdminKnowledgeShareService = __decorate([
    (0, common_1.Injectable)()
], AdminKnowledgeShareService);
//# sourceMappingURL=admin-knowledge-share.service.js.map