"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = exports.ResourceType = exports.AuditAction = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_CREATE"] = "user_create";
    AuditAction["USER_UPDATE"] = "user_update";
    AuditAction["USER_DELETE"] = "user_delete";
    AuditAction["USER_DISABLE"] = "user_disable";
    AuditAction["USER_ENABLE"] = "user_enable";
    AuditAction["USER_ROLE_CHANGE"] = "user_role_change";
    AuditAction["USER_APPROVE"] = "user_approve";
    AuditAction["USER_REJECT"] = "user_reject";
    AuditAction["LOGIN_SUCCESS"] = "login_success";
    AuditAction["LOGIN_FAILED"] = "login_failed";
    AuditAction["LOGOUT"] = "logout";
    AuditAction["DATA_CREATE"] = "data_create";
    AuditAction["DATA_UPDATE"] = "data_update";
    AuditAction["DATA_DELETE"] = "data_delete";
    AuditAction["DATA_EXPORT"] = "data_export";
    AuditAction["DATA_IMPORT"] = "data_import";
    AuditAction["PERMISSION_GRANT"] = "permission_grant";
    AuditAction["PERMISSION_REVOKE"] = "permission_revoke";
    AuditAction["SHARE_CREATE"] = "share_create";
    AuditAction["SHARE_DELETE"] = "share_delete";
    AuditAction["SYSTEM_CONFIG_CHANGE"] = "system_config_change";
    AuditAction["ADMIN_ACCESS"] = "admin_access";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["USER"] = "user";
    ResourceType["CUSTOMER"] = "customer";
    ResourceType["RECYCLE_STORE"] = "recycle_store";
    ResourceType["LEXICON"] = "lexicon";
    ResourceType["QUICK_NOTE"] = "quick_note";
    ResourceType["TEAM"] = "team";
    ResourceType["SHARE"] = "share";
    ResourceType["EQUIPMENT_ORDER"] = "equipment_order";
    ResourceType["CONVERSATION"] = "conversation";
    ResourceType["SYSTEM"] = "system";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
let AuditService = class AuditService {
    async log(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        try {
            const { error } = await supabase.from('audit_logs').insert({
                user_id: params.userId,
                action: params.action,
                resource_type: params.resourceType || null,
                resource_id: params.resourceId || null,
                details: params.details || null,
                ip_address: params.ipAddress || null,
                user_agent: params.userAgent || null,
                status: params.status || 'success',
                error_message: params.errorMessage || null,
                created_at: new Date().toISOString(),
            });
            if (error) {
                console.error('记录审计日志失败:', error);
            }
        }
        catch (error) {
            console.error('记录审计日志异常:', error);
        }
    }
    async logBatch(logs) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        try {
            const { error } = await supabase.from('audit_logs').insert(logs.map((log) => ({
                user_id: log.userId,
                action: log.action,
                resource_type: log.resourceType || null,
                resource_id: log.resourceId || null,
                details: log.details || null,
                ip_address: log.ipAddress || null,
                user_agent: log.userAgent || null,
                status: log.status || 'success',
                error_message: log.errorMessage || null,
                created_at: new Date().toISOString(),
            })));
            if (error) {
                console.error('批量记录审计日志失败:', error);
            }
        }
        catch (error) {
            console.error('批量记录审计日志异常:', error);
        }
    }
    async getLogs(params) {
        return this.query(params);
    }
    async query(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const page = params.page || 1;
        const pageSize = params.pageSize || 20;
        try {
            let query = supabase
                .from('audit_logs')
                .select('*', { count: 'exact' });
            if (params.userId) {
                query = query.eq('user_id', params.userId);
            }
            const action = params.action || params.operation;
            if (action) {
                query = query.eq('action', action);
            }
            if (params.resourceType) {
                query = query.eq('resource_type', params.resourceType);
            }
            if (params.resourceId) {
                query = query.eq('resource_id', params.resourceId);
            }
            if (params.status) {
                query = query.eq('status', params.status);
            }
            if (params.startDate) {
                query = query.gte('created_at', params.startDate);
            }
            if (params.endDate) {
                query = query.lte('created_at', params.endDate);
            }
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);
            if (error) {
                throw error;
            }
            return {
                list: data || [],
                total: count || 0,
                page,
                pageSize,
            };
        }
        catch (error) {
            console.error('查询审计日志失败:', error);
            return {
                list: [],
                total: 0,
                page,
                pageSize,
            };
        }
    }
    async getUserLogs(userId, params) {
        const result = await this.query({
            userId,
            startDate: params?.startDate,
            endDate: params?.endDate,
            page: params?.page,
            pageSize: params?.pageSize,
        });
        return result;
    }
    async getUserHistory(userId, page = 1, pageSize = 20) {
        const result = await this.query({ userId, page, pageSize });
        return {
            list: result.list,
            total: result.total,
        };
    }
    async getResourceHistory(resourceType, resourceId, page = 1, pageSize = 20) {
        const result = await this.query({ resourceType, resourceId, page, pageSize });
        return {
            list: result.list,
            total: result.total,
        };
    }
    async getStatistics(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const startDate = params?.startDate;
        const endDate = params?.endDate;
        try {
            let query = supabase.from('audit_logs').select('action, user_id, status');
            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                query = query.lte('created_at', endDate);
            }
            const { data, error } = await query;
            if (error) {
                throw error;
            }
            const actionCounts = {};
            const users = new Set();
            let failedCounts = 0;
            for (const log of data || []) {
                actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
                users.add(log.user_id);
                if (log.status === 'failed') {
                    failedCounts++;
                }
            }
            return {
                totalActions: data?.length || 0,
                actionCounts,
                userCounts: users.size,
                failedCounts,
            };
        }
        catch (error) {
            console.error('获取审计统计失败:', error);
            return {
                totalActions: 0,
                actionCounts: {},
                userCounts: 0,
                failedCounts: 0,
            };
        }
    }
    async deleteLogs(logId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        try {
            const { error } = await supabase
                .from('audit_logs')
                .delete()
                .eq('id', logId);
            if (error) {
                throw error;
            }
        }
        catch (error) {
            console.error('删除审计日志失败:', error);
            throw error;
        }
    }
    async deleteLogsByDateRange(startDate, endDate) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .delete()
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .select('id');
            if (error) {
                throw error;
            }
            return data?.length || 0;
        }
        catch (error) {
            console.error('批量删除审计日志失败:', error);
            throw error;
        }
    }
    async cleanOldLogs(daysToKeep = 90) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            const { data, error } = await supabase
                .from('audit_logs')
                .delete()
                .lt('created_at', cutoffDate.toISOString())
                .select('id');
            if (error) {
                throw error;
            }
            return data?.length || 0;
        }
        catch (error) {
            console.error('清理审计日志失败:', error);
            return 0;
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)()
], AuditService);
//# sourceMappingURL=audit.service.js.map