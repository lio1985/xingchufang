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
exports.DataExportService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
const supabase_client_1 = require("../storage/database/supabase-client");
const permission_service_1 = require("../permission/permission.service");
const permission_constants_1 = require("../permission/permission.constants");
let DataExportService = class DataExportService {
    constructor(permissionService) {
        this.permissionService = permissionService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
        this.s3Storage = new coze_coding_dev_sdk_1.S3Storage({
            bucketName: process.env.COZE_BUCKET_NAME || '',
            region: 'cn-beijing',
        });
    }
    async getAvailableScopeOptions(userId) {
        const context = await this.permissionService.getUserContext(userId);
        if (!context) {
            throw new common_1.ForbiddenException('用户不存在');
        }
        const options = [];
        options.push({
            value: 'self',
            label: '个人数据',
            description: '仅导出您自己创建的数据',
            allowedRoles: ['employee', 'team_leader', 'admin'],
        });
        if (context.role === permission_constants_1.UserRole.TEAM_LEADER || context.role === permission_constants_1.UserRole.ADMIN) {
            options.push({
                value: 'team',
                label: '团队数据',
                description: '导出您及团队成员的数据',
                allowedRoles: ['team_leader', 'admin'],
            });
        }
        if (context.role === permission_constants_1.UserRole.ADMIN) {
            options.push({
                value: 'all',
                label: '全部数据',
                description: '导出系统中的所有数据',
                allowedRoles: ['admin'],
            });
        }
        return options;
    }
    async getAvailableTeams(userId) {
        const context = await this.permissionService.getUserContext(userId);
        if (!context) {
            throw new common_1.ForbiddenException('用户不存在');
        }
        if (context.role === permission_constants_1.UserRole.ADMIN) {
            const { data: teams, error } = await this.client
                .from('teams')
                .select('id, name, leader_id')
                .eq('is_deleted', false);
            if (error) {
                console.error('[DataExport] 获取团队列表失败:', error);
                return [];
            }
            const teamsWithCount = await Promise.all((teams || []).map(async (team) => {
                const { count } = await this.client
                    .from('team_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('team_id', team.id);
                return {
                    ...team,
                    memberCount: count || 0,
                };
            }));
            return teamsWithCount;
        }
        if (context.role === permission_constants_1.UserRole.TEAM_LEADER) {
            const { data: teams, error } = await this.client
                .from('teams')
                .select('id, name, leader_id')
                .eq('leader_id', userId)
                .eq('is_deleted', false);
            if (error) {
                console.error('[DataExport] 获取团队列表失败:', error);
                return [];
            }
            const teamsWithCount = await Promise.all((teams || []).map(async (team) => {
                const { count } = await this.client
                    .from('team_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('team_id', team.id);
                return {
                    ...team,
                    memberCount: count || 0,
                };
            }));
            return teamsWithCount;
        }
        return [];
    }
    async validateExportScope(userId, scope, teamId) {
        const context = await this.permissionService.getUserContext(userId);
        if (!context) {
            throw new common_1.ForbiddenException('用户不存在');
        }
        if (scope === 'all' && context.role !== permission_constants_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('只有管理员可以导出全部数据');
        }
        if (scope === 'team') {
            if (context.role !== permission_constants_1.UserRole.ADMIN && context.role !== permission_constants_1.UserRole.TEAM_LEADER) {
                throw new common_1.ForbiddenException('只有团队队长或管理员可以导出团队数据');
            }
            if (context.role === permission_constants_1.UserRole.TEAM_LEADER && teamId) {
                const { data: team } = await this.client
                    .from('teams')
                    .select('leader_id')
                    .eq('id', teamId)
                    .single();
                if (!team || team.leader_id !== userId) {
                    throw new common_1.ForbiddenException('您只能导出自己负责的团队数据');
                }
            }
        }
    }
    async getUserIdsForScope(userId, scope, teamId) {
        if (scope === 'self') {
            return [userId];
        }
        if (scope === 'team') {
            let queryTeamId = teamId;
            if (!queryTeamId) {
                const { data: team } = await this.client
                    .from('teams')
                    .select('id')
                    .eq('leader_id', userId)
                    .eq('is_deleted', false)
                    .single();
                if (team) {
                    queryTeamId = team.id;
                }
                else {
                    const { data: membership } = await this.client
                        .from('team_members')
                        .select('team_id')
                        .eq('user_id', userId)
                        .single();
                    if (membership) {
                        queryTeamId = membership.team_id;
                    }
                }
            }
            if (!queryTeamId) {
                return [userId];
            }
            const { data: members } = await this.client
                .from('team_members')
                .select('user_id')
                .eq('team_id', queryTeamId);
            const { data: team } = await this.client
                .from('teams')
                .select('leader_id')
                .eq('id', queryTeamId)
                .single();
            const userIds = new Set();
            (members || []).forEach((m) => userIds.add(m.user_id));
            if (team?.leader_id) {
                userIds.add(team.leader_id);
            }
            return Array.from(userIds);
        }
        return [];
    }
    async createExportTask(userId, config) {
        const scope = config.scope || 'self';
        await this.validateExportScope(userId, scope, config.teamId);
        const taskId = (0, uuid_1.v4)();
        const fileName = `export_${config.dataType}_${new Date().toISOString().split('T')[0]}.${config.format}`;
        const { data: task, error } = await this.client
            .from('export_tasks')
            .insert({
            id: taskId,
            data_type: config.dataType,
            format: config.format,
            scope: scope,
            team_id: config.teamId,
            status: 'pending',
            file_name: fileName,
            created_by: userId,
        })
            .select()
            .single();
        if (error) {
            throw new Error('创建导出任务失败');
        }
        this.processExportTask(taskId, config, userId, fileName).catch((err) => {
            console.error('处理导出任务失败:', err);
        });
        return this.mapTaskToExportTask(task);
    }
    async processExportTask(taskId, config, userId, fileName) {
        let fileKey = null;
        try {
            await this.client
                .from('export_tasks')
                .update({ status: 'processing', started_at: new Date().toISOString() })
                .eq('id', taskId);
            const scope = config.scope || 'self';
            const userIds = await this.getUserIdsForScope(userId, scope, config.teamId);
            let data;
            let recordCount = 0;
            switch (config.dataType) {
                case 'users':
                    data = await this.exportUsers(config, userIds);
                    break;
                case 'lexicons':
                    data = await this.exportLexicons(config, userIds);
                    break;
                case 'logs':
                    data = await this.exportLogs(config, userIds);
                    break;
                case 'customers':
                    data = await this.exportCustomers(config, userIds);
                    break;
                case 'recycles':
                    data = await this.exportRecycles(config, userIds);
                    break;
                case 'equipment_orders':
                    data = await this.exportEquipmentOrders(config, userIds);
                    break;
                case 'all':
                    data = await this.exportAll(config, userIds);
                    break;
                default:
                    throw new Error('不支持的数据类型');
            }
            recordCount = Array.isArray(data) ? data.length : 1;
            let content;
            let contentType;
            if (config.format === 'json') {
                content = JSON.stringify(data, null, 2);
                contentType = 'application/json';
            }
            else {
                content = this.convertToCSV(data);
                contentType = 'text/csv';
            }
            const fileBuffer = Buffer.from(content, 'utf8');
            fileKey = await this.s3Storage.uploadFile({
                fileContent: fileBuffer,
                fileName: `exports/${fileName}`,
                contentType: contentType,
            });
            const downloadUrl = await this.s3Storage.generatePresignedUrl({
                key: fileKey,
                expireTime: 3600,
            });
            const fileSize = fileBuffer.length;
            await this.client
                .from('export_tasks')
                .update({
                status: 'completed',
                download_url: downloadUrl,
                file_key: fileKey,
                file_size: fileSize,
                record_count: recordCount,
                completed_at: new Date().toISOString(),
            })
                .eq('id', taskId);
        }
        catch (error) {
            console.error('导出任务处理失败:', error);
            await this.client
                .from('export_tasks')
                .update({
                status: 'failed',
                error: error.message || '导出失败',
                completed_at: new Date().toISOString(),
            })
                .eq('id', taskId);
        }
    }
    async exportUsers(config, userIds) {
        let query = this.client
            .from('users')
            .select('id, openid, nickname, avatar_url, role, status, created_at, last_login_at');
        if (userIds.length > 0) {
            query = query.in('id', userIds);
        }
        if (config.timeRange) {
            query = query
                .gte('created_at', config.timeRange.startDate)
                .lte('created_at', config.timeRange.endDate);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error('导出用户数据失败');
        }
        return data || [];
    }
    async exportLexicons(config, userIds) {
        let query = this.client
            .from('lexicons')
            .select('id, title, content, category, type, user_id, created_at, is_shared, share_scope, shared_at');
        if (userIds.length > 0) {
            query = query.in('user_id', userIds);
        }
        if (config.timeRange) {
            query = query
                .gte('created_at', config.timeRange.startDate)
                .lte('created_at', config.timeRange.endDate);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error('导出语料库数据失败');
        }
        return data || [];
    }
    async exportLogs(config, userIds) {
        let query = this.client
            .from('operation_logs')
            .select('id, user_id, action, resource_type, resource_id, created_at');
        if (userIds.length > 0) {
            query = query.in('user_id', userIds);
        }
        if (config.timeRange) {
            query = query
                .gte('created_at', config.timeRange.startDate)
                .lte('created_at', config.timeRange.endDate);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error('导出操作日志失败');
        }
        return data || [];
    }
    async exportCustomers(config, userIds) {
        let query = this.client
            .from('customers')
            .select('id, name, phone, wechat, address, status, user_id, created_at, updated_at');
        if (userIds.length > 0) {
            query = query.in('user_id', userIds);
        }
        if (config.timeRange) {
            query = query
                .gte('created_at', config.timeRange.startDate)
                .lte('created_at', config.timeRange.endDate);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error('导出客户数据失败');
        }
        return data || [];
    }
    async exportRecycles(config, userIds) {
        let query = this.client
            .from('recycle_stores')
            .select('id, store_name, phone, wechat, address, recycle_status, user_id, created_at')
            .eq('is_deleted', false);
        if (userIds.length > 0) {
            query = query.in('user_id', userIds);
        }
        if (config.timeRange) {
            query = query
                .gte('created_at', config.timeRange.startDate)
                .lte('created_at', config.timeRange.endDate);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error('导出回收门店数据失败');
        }
        return data || [];
    }
    async exportEquipmentOrders(config, userIds) {
        let query = this.client
            .from('equipment_orders')
            .select('id, order_no, title, customer_name, status, accepted_by, created_at');
        if (userIds.length > 0) {
            query = query.or(`created_by.in.(${userIds.join(',')}),accepted_by.in.(${userIds.join(',')})`);
        }
        if (config.timeRange) {
            query = query
                .gte('created_at', config.timeRange.startDate)
                .lte('created_at', config.timeRange.endDate);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error('导出获客订单数据失败');
        }
        return data || [];
    }
    async exportAll(config, userIds) {
        const users = await this.exportUsers(config, userIds);
        const lexicons = await this.exportLexicons(config, userIds);
        const logs = await this.exportLogs(config, userIds);
        const customers = await this.exportCustomers(config, userIds);
        const recycles = await this.exportRecycles(config, userIds);
        const equipmentOrders = await this.exportEquipmentOrders(config, userIds);
        return {
            users,
            lexicons,
            logs,
            customers,
            recycles,
            equipmentOrders,
            exportTime: new Date().toISOString(),
        };
    }
    convertToCSV(data) {
        if (!data || data.length === 0) {
            return '';
        }
        const flattenData = data.map((row) => {
            const flat = {};
            for (const key of Object.keys(row)) {
                const value = row[key];
                if (value === null || value === undefined) {
                    flat[key] = '';
                }
                else if (typeof value === 'object') {
                    flat[key] = JSON.stringify(value);
                }
                else {
                    flat[key] = value;
                }
            }
            return flat;
        });
        const headers = Object.keys(flattenData[0]);
        const rows = flattenData.map((row) => headers
            .map((header) => {
            let value = row[header];
            return String(value).replace(/"/g, '""');
        })
            .join(','));
        return [headers.join(','), ...rows].join('\n');
    }
    async downloadExportFile(taskId, userId) {
        const { data: task, error } = await this.client
            .from('export_tasks')
            .select('*')
            .eq('id', taskId)
            .single();
        if (error || !task) {
            throw new common_1.NotFoundException('导出任务不存在');
        }
        if (task.created_by !== userId) {
            const isAdmin = await this.permissionService.isAdmin(userId);
            if (!isAdmin) {
                throw new common_1.ForbiddenException('无权下载此文件');
            }
        }
        if (task.status !== 'completed') {
            throw new common_1.ForbiddenException('导出任务尚未完成');
        }
        let downloadUrl = task.download_url;
        if (task.file_key) {
            downloadUrl = await this.s3Storage.generatePresignedUrl({
                key: task.file_key,
                expireTime: 3600,
            });
            await this.client
                .from('export_tasks')
                .update({ download_url: downloadUrl })
                .eq('id', taskId);
        }
        return {
            downloadUrl: downloadUrl,
            fileName: task.file_name,
        };
    }
    async getExportTaskStatus(taskId, userId) {
        const { data: task, error } = await this.client
            .from('export_tasks')
            .select('*')
            .eq('id', taskId)
            .single();
        if (error || !task) {
            throw new common_1.NotFoundException('导出任务不存在');
        }
        if (task.created_by !== userId) {
            const isAdmin = await this.permissionService.isAdmin(userId);
            if (!isAdmin) {
                throw new common_1.ForbiddenException('无权查看此任务');
            }
        }
        return this.mapTaskToExportTask(task);
    }
    async getExportHistory(userId, page, pageSize) {
        const isAdmin = await this.permissionService.isAdmin(userId);
        const currentPage = page || 1;
        const currentPageSize = pageSize || 20;
        const from = (currentPage - 1) * currentPageSize;
        const to = from + currentPageSize - 1;
        let query = this.client
            .from('export_tasks')
            .select('*');
        if (!isAdmin) {
            query = query.eq('created_by', userId);
        }
        const { data, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error) {
            throw new Error('获取导出历史失败');
        }
        return (data || []).map((task) => this.mapTaskToExportTask(task));
    }
    async getExportStats(userId) {
        const isAdmin = await this.permissionService.isAdmin(userId);
        let query = this.client
            .from('export_tasks')
            .select('status, file_size');
        if (!isAdmin) {
            query = query.eq('created_by', userId);
        }
        const { data: tasks, error } = await query;
        if (error) {
            throw new Error('获取导出统计失败');
        }
        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter((t) => t.status === 'completed').length || 0;
        const pendingTasks = tasks?.filter((t) => t.status === 'pending').length || 0;
        const failedTasks = tasks?.filter((t) => t.status === 'failed').length || 0;
        const totalExportSize = tasks?.reduce((sum, t) => sum + (t.file_size || 0), 0) || 0;
        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            failedTasks,
            totalExportSize,
        };
    }
    mapTaskToExportTask(task) {
        return {
            id: task.id,
            dataType: task.data_type,
            format: task.format,
            scope: task.scope || 'self',
            fileName: task.file_name,
            status: task.status,
            downloadUrl: task.download_url,
            fileSize: task.file_size || 0,
            recordCount: task.record_count || 0,
            createdAt: task.created_at,
            completedAt: task.completed_at,
            error: task.error,
            createdBy: task.created_by,
        };
    }
};
exports.DataExportService = DataExportService;
exports.DataExportService = DataExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], DataExportService);
//# sourceMappingURL=data-export.service.js.map