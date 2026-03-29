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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const lexicon_service_1 = require("../database/lexicon/lexicon.service");
const statistics_service_1 = require("../statistics/statistics.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const admin_guard_1 = require("../guards/admin.guard");
const supabase_client_1 = require("../storage/database/supabase-client");
let AdminController = class AdminController {
    constructor(userService, lexiconService, statisticsService) {
        this.userService = userService;
        this.lexiconService = lexiconService;
        this.statisticsService = statisticsService;
    }
    async getUsers(req, page, pageSize, role, status, search) {
        try {
            console.log('========================================');
            console.log('AdminController.getUsers() 被调用');
            console.log('请求参数:', { page, pageSize, role, status, search });
            console.log('当前用户:', req.user);
            const pageNum = page ? parseInt(page.toString()) : 1;
            const limit = pageSize ? parseInt(pageSize.toString()) : 20;
            const cleanRole = role && role !== 'undefined' && role !== 'all' ? role : undefined;
            const cleanStatus = status && status !== 'undefined' && status !== 'all' ? status : undefined;
            const cleanSearch = search && search !== 'undefined' ? search : undefined;
            console.log('清理后的参数:', { cleanRole, cleanStatus, cleanSearch });
            console.log('直接查询数据库...');
            const client = (0, supabase_client_1.getSupabaseClient)();
            let query = client.from('users').select('*', { count: 'exact' });
            if (cleanRole) {
                query = query.eq('role', cleanRole);
            }
            if (cleanStatus) {
                query = query.eq('status', cleanStatus);
            }
            else {
                query = query.neq('status', 'deleted');
            }
            if (cleanSearch) {
                query = query.or(`nickname.ilike.%${cleanSearch}%,employee_id.ilike.%${cleanSearch}%`);
            }
            const countResult = await query;
            const totalCount = countResult.count || 0;
            console.log('查询总数结果:', {
                count: countResult.count,
                dataLength: countResult.data?.length,
                error: countResult.error
            });
            const from = (pageNum - 1) * limit;
            const to = from + limit - 1;
            let dataQuery = client.from('users').select('*');
            if (cleanRole) {
                dataQuery = dataQuery.eq('role', cleanRole);
            }
            if (cleanStatus) {
                dataQuery = dataQuery.eq('status', cleanStatus);
            }
            else {
                dataQuery = dataQuery.neq('status', 'deleted');
            }
            if (cleanSearch) {
                dataQuery = dataQuery.or(`nickname.ilike.%${cleanSearch}%,employee_id.ilike.%${cleanSearch}%`);
            }
            const { data: usersData, error: usersError } = await dataQuery
                .order('created_at', { ascending: false })
                .range(from, to);
            console.log('直接查询用户数据:', usersData?.length, 'usersError:', usersError);
            const transformedUsers = (usersData || []).map(user => ({
                id: user.id,
                username: user.nickname || '未设置昵称',
                avatar: user.avatar_url,
                role: user.role,
                status: user.status,
                employeeId: user.employee_id,
                createdAt: user.created_at,
                lastLoginAt: user.last_login_at,
            }));
            console.log('转换后的数据:', {
                total: totalCount || 0,
                usersCount: transformedUsers.length,
            });
            console.log('========================================');
            return {
                code: 200,
                msg: 'success',
                data: {
                    users: transformedUsers,
                    total: totalCount || 0,
                    page: pageNum,
                    pageSize: limit,
                },
            };
        }
        catch (error) {
            console.error('获取用户列表失败:', error);
            return {
                code: 500,
                msg: '获取用户列表失败',
                data: null,
            };
        }
    }
    async getUserDetail(req, userId) {
        try {
            const result = await this.userService.getUserWithProfile(userId);
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('获取用户详情失败:', error);
            return {
                code: 500,
                msg: '获取用户详情失败',
                data: null,
            };
        }
    }
    async updateUserRole(req, userId, body) {
        try {
            const user = await this.userService.updateUserRole(userId, body.role);
            return {
                code: 200,
                msg: '修改成功',
                data: user,
            };
        }
        catch (error) {
            console.error('修改用户角色失败:', error);
            return {
                code: 500,
                msg: '修改用户角色失败',
                data: null,
            };
        }
    }
    async updateUserStatus(req, userId, body) {
        try {
            const user = await this.userService.updateUserStatus(userId, body.status);
            return {
                code: 200,
                msg: '修改成功',
                data: user,
            };
        }
        catch (error) {
            console.error('修改用户状态失败:', error);
            return {
                code: 500,
                msg: '修改用户状态失败',
                data: null,
            };
        }
    }
    async updateUserNickname(req, userId, body) {
        try {
            const user = await this.userService.updateUserNickname(userId, body.username);
            return {
                code: 200,
                msg: '修改成功',
                data: user,
            };
        }
        catch (error) {
            console.error('修改用户昵称失败:', error);
            return {
                code: 500,
                msg: '修改用户昵称失败',
                data: null,
            };
        }
    }
    async getDepartments() {
        try {
            const departments = await this.userService.getDepartments();
            return {
                code: 200,
                msg: 'success',
                data: departments,
            };
        }
        catch (error) {
            console.error('获取部门列表失败:', error);
            return {
                code: 500,
                msg: '获取部门列表失败',
                data: null,
            };
        }
    }
    async getGlobalStatistics() {
        try {
            const statistics = await this.statisticsService.getGlobalStatistics();
            return {
                code: 200,
                msg: 'success',
                data: statistics,
            };
        }
        catch (error) {
            console.error('获取全局统计失败:', error);
            return {
                code: 500,
                msg: '获取全局统计失败',
                data: null,
            };
        }
    }
    async getPendingUsersCount() {
        try {
            const client = (0, supabase_client_1.getSupabaseClient)();
            const { count, error } = await client
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            if (error) {
                console.error('获取待审核用户数量失败:', error);
                return {
                    code: 500,
                    msg: '获取待审核用户数量失败',
                    data: null,
                };
            }
            return {
                code: 200,
                msg: 'success',
                data: {
                    count: count || 0,
                },
            };
        }
        catch (error) {
            console.error('获取待审核用户数量失败:', error);
            return {
                code: 500,
                msg: '获取待审核用户数量失败',
                data: null,
            };
        }
    }
    async forceShareLexicon(req, lexiconId, body) {
        try {
            const adminId = req.user.sub;
            const result = await this.lexiconService.forceShareLexicon(adminId, lexiconId, body.isGloballyShared);
            return {
                code: 200,
                msg: body.isGloballyShared ? '设置全局共享成功' : '取消全局共享成功',
                data: result,
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message,
                data: null,
            };
        }
    }
    async getAllShareRecords(req, page, pageSize) {
        try {
            const adminId = req.user.sub;
            const records = await this.lexiconService.getAllShareRecords(adminId, page ? parseInt(page.toString()) : 1, pageSize ? parseInt(pageSize.toString()) : 50);
            return {
                code: 200,
                msg: 'success',
                data: records,
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message,
                data: null,
            };
        }
    }
    async batchSetGlobalShare(req, body) {
        try {
            const adminId = req.user.sub;
            const { lexiconIds, isGloballyShared } = body;
            if (!lexiconIds || lexiconIds.length === 0) {
                return {
                    code: 400,
                    msg: '请选择要操作的语料库',
                    data: null,
                };
            }
            const results = await Promise.allSettled(lexiconIds.map((lexiconId) => this.lexiconService.forceShareLexicon(adminId, lexiconId, isGloballyShared)));
            const successCount = results.filter((r) => r.status === 'fulfilled').length;
            const failCount = results.filter((r) => r.status === 'rejected').length;
            return {
                code: 200,
                msg: isGloballyShared
                    ? `成功设置 ${successCount} 个，失败 ${failCount} 个`
                    : `成功取消 ${successCount} 个，失败 ${failCount} 个`,
                data: {
                    total: lexiconIds.length,
                    successCount,
                    failCount,
                },
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message,
                data: null,
            };
        }
    }
    async getShareStats(req) {
        try {
            const adminId = req.user.sub;
            const client = (0, supabase_client_1.getSupabaseClient)();
            const { count: totalLexicons } = await client
                .from('lexicons')
                .select('id', { count: 'exact', head: true });
            const { count: sharedLexicons } = await client
                .from('lexicons')
                .select('id', { count: 'exact', head: true })
                .eq('is_shared', true);
            const { count: globalShared } = await client
                .from('share_permissions')
                .select('id', { count: 'exact', head: true })
                .eq('is_globally_shared', true);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { count: recentShareActions } = await client
                .from('share_history')
                .select('id', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString());
            const { data: shareByScope } = await client
                .from('lexicons')
                .select('share_scope')
                .eq('is_shared', true);
            const shareScopeStats = shareByScope?.reduce((acc, item) => {
                acc[item.share_scope] = (acc[item.share_scope] || 0) + 1;
                return acc;
            }, {});
            return {
                code: 200,
                msg: 'success',
                data: {
                    totalLexicons: totalLexicons || 0,
                    sharedLexicons: sharedLexicons || 0,
                    globalShared: globalShared || 0,
                    recentShareActions: recentShareActions || 0,
                    shareScopeStats: shareScopeStats || {},
                },
            };
        }
        catch (error) {
            const statusCode = error.status || 500;
            return {
                code: statusCode,
                msg: error.message,
                data: null,
            };
        }
    }
    async getLexicons(req, page, pageSize, category, search) {
        try {
            const client = (0, supabase_client_1.getSupabaseClient)();
            const pageNum = page ? parseInt(page.toString()) : 1;
            const limit = pageSize ? parseInt(pageSize.toString()) : 100;
            const from = (pageNum - 1) * limit;
            const to = from + limit - 1;
            let query = client
                .from('lexicons')
                .select(`
          id,
          title,
          content,
          category,
          type,
          product_id,
          tags,
          user_id,
          is_shared,
          share_scope,
          created_at,
          updated_at,
          users(id, nickname, employee_id)
        `, { count: 'exact' });
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }
            if (search) {
                query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
            }
            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to);
            if (error) {
                console.error('获取语料库列表失败:', error);
                return { success: false, message: '获取语料库列表失败', data: null };
            }
            const transformedData = (data || []).map((item) => ({
                id: item.id,
                name: item.title,
                description: item.content?.substring(0, 100) || '',
                category: item.category,
                itemCount: 1,
                isShared: item.is_shared,
                shareScope: item.share_scope,
                createdAt: item.created_at?.split('T')[0],
                updatedAt: item.updated_at?.split('T')[0],
                createdBy: item.users ? {
                    id: item.users.id,
                    name: item.users.nickname || item.users.employee_id,
                } : null,
            }));
            return {
                success: true,
                data: transformedData,
                total: count || 0,
                page: pageNum,
                pageSize: limit,
            };
        }
        catch (error) {
            console.error('获取语料库列表失败:', error);
            return { success: false, message: '获取语料库列表失败', data: null };
        }
    }
    async deleteLexicon(req, id) {
        try {
            const client = (0, supabase_client_1.getSupabaseClient)();
            const { error } = await client
                .from('lexicons')
                .delete()
                .eq('id', id);
            if (error) {
                return { success: false, message: '删除失败' };
            }
            return { success: true, message: '删除成功' };
        }
        catch (error) {
            console.error('删除语料库失败:', error);
            return { success: false, message: '删除失败' };
        }
    }
    async getSharePermissions(req, page, pageSize) {
        try {
            const client = (0, supabase_client_1.getSupabaseClient)();
            const pageNum = page ? parseInt(page.toString()) : 1;
            const limit = pageSize ? parseInt(pageSize.toString()) : 100;
            const from = (pageNum - 1) * limit;
            const to = from + limit - 1;
            const { data, count, error } = await client
                .from('lexicons')
                .select(`
          id,
          title,
          share_scope,
          is_shared,
          created_at,
          user_id,
          users(id, nickname)
        `, { count: 'exact' })
                .eq('is_shared', true)
                .order('created_at', { ascending: false })
                .range(from, to);
            if (error) {
                console.error('获取共享权限列表失败:', error);
                return { success: false, message: '获取共享权限列表失败', data: null };
            }
            const lexiconIds = (data || []).map((item) => item.id);
            let shareTargets = [];
            if (lexiconIds.length > 0) {
                const { data: targetsData } = await client
                    .from('share_permissions')
                    .select(`
            lexicon_id,
            target_user_id,
            target_department_id,
            users(id, nickname, department_id)
          `)
                    .in('lexicon_id', lexiconIds);
                shareTargets = targetsData || [];
            }
            const transformedData = (data || []).map((item) => {
                const targets = shareTargets.filter((t) => t.lexicon_id === item.id);
                const targetUsers = targets
                    .filter((t) => t.target_user_id)
                    .map((t) => ({
                    id: t.users?.id,
                    name: t.users?.nickname,
                    department: t.users?.department_id,
                }));
                const targetDepartments = targets
                    .filter((t) => t.target_department_id)
                    .map((t) => t.target_department_id);
                return {
                    id: item.id,
                    lexiconId: item.id,
                    lexiconName: item.title,
                    shareScope: item.share_scope,
                    targetUsers: targetUsers,
                    targetDepartments: targetDepartments,
                    createdBy: item.users ? {
                        id: item.users.id,
                        name: item.users.nickname,
                    } : null,
                    createdAt: item.created_at?.split('T')[0],
                };
            });
            return {
                success: true,
                data: transformedData,
                total: count || 0,
                page: pageNum,
                pageSize: limit,
            };
        }
        catch (error) {
            console.error('获取共享权限列表失败:', error);
            return { success: false, message: '获取共享权限列表失败', data: null };
        }
    }
    async revokeSharePermission(req, id) {
        try {
            const client = (0, supabase_client_1.getSupabaseClient)();
            const { error } = await client
                .from('lexicons')
                .update({
                is_shared: false,
                share_scope: 'private',
            })
                .eq('id', id);
            if (error) {
                return { success: false, message: '撤销失败' };
            }
            return { success: true, message: '撤销成功' };
        }
        catch (error) {
            console.error('撤销共享权限失败:', error);
            return { success: false, message: '撤销失败' };
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Put)('users/:userId/role'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Put)('users/:userId/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Put)('users/:userId/username'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserNickname", null);
__decorate([
    (0, common_1.Get)('departments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDepartments", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getGlobalStatistics", null);
__decorate([
    (0, common_1.Get)('pending-users/count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingUsersCount", null);
__decorate([
    (0, common_1.Post)('lexicons/:lexiconId/force-share'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('lexiconId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "forceShareLexicon", null);
__decorate([
    (0, common_1.Get)('share/all-records'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllShareRecords", null);
__decorate([
    (0, common_1.Post)('share/batch-set-global'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "batchSetGlobalShare", null);
__decorate([
    (0, common_1.Get)('share/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getShareStats", null);
__decorate([
    (0, common_1.Get)('lexicons'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLexicons", null);
__decorate([
    (0, common_1.Delete)('lexicons/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteLexicon", null);
__decorate([
    (0, common_1.Get)('share/permissions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSharePermissions", null);
__decorate([
    (0, common_1.Delete)('share/permissions/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "revokeSharePermission", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [user_service_1.UserService,
        lexicon_service_1.LexiconService,
        statistics_service_1.StatisticsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map