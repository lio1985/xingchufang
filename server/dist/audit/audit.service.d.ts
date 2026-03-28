export declare enum AuditAction {
    USER_CREATE = "user_create",
    USER_UPDATE = "user_update",
    USER_DELETE = "user_delete",
    USER_DISABLE = "user_disable",
    USER_ENABLE = "user_enable",
    USER_ROLE_CHANGE = "user_role_change",
    USER_APPROVE = "user_approve",
    USER_REJECT = "user_reject",
    LOGIN_SUCCESS = "login_success",
    LOGIN_FAILED = "login_failed",
    LOGOUT = "logout",
    DATA_CREATE = "data_create",
    DATA_UPDATE = "data_update",
    DATA_DELETE = "data_delete",
    DATA_EXPORT = "data_export",
    DATA_IMPORT = "data_import",
    PERMISSION_GRANT = "permission_grant",
    PERMISSION_REVOKE = "permission_revoke",
    SHARE_CREATE = "share_create",
    SHARE_DELETE = "share_delete",
    SYSTEM_CONFIG_CHANGE = "system_config_change",
    ADMIN_ACCESS = "admin_access"
}
export declare enum ResourceType {
    USER = "user",
    CUSTOMER = "customer",
    RECYCLE_STORE = "recycle_store",
    LEXICON = "lexicon",
    QUICK_NOTE = "quick_note",
    TEAM = "team",
    SHARE = "share",
    EQUIPMENT_ORDER = "equipment_order",
    CONVERSATION = "conversation",
    SYSTEM = "system"
}
export interface CreateAuditLogParams {
    userId: string;
    action: AuditAction | string;
    resourceType?: ResourceType | string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failed';
    errorMessage?: string;
}
export interface QueryAuditLogsParams {
    userId?: string;
    operation?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
export declare class AuditService {
    log(params: CreateAuditLogParams): Promise<void>;
    logBatch(logs: CreateAuditLogParams[]): Promise<void>;
    getLogs(params: QueryAuditLogsParams): Promise<{
        list: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    query(params: QueryAuditLogsParams): Promise<{
        list: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getUserLogs(userId: string, params?: {
        startDate?: string;
        endDate?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: any[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getUserHistory(userId: string, page?: number, pageSize?: number): Promise<{
        list: any[];
        total: number;
    }>;
    getResourceHistory(resourceType: string, resourceId: string, page?: number, pageSize?: number): Promise<{
        list: any[];
        total: number;
    }>;
    getStatistics(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        totalActions: number;
        actionCounts: Record<string, number>;
        userCounts: number;
        failedCounts: number;
    }>;
    deleteLogs(logId: string): Promise<void>;
    deleteLogsByDateRange(startDate: string, endDate: string): Promise<number>;
    cleanOldLogs(daysToKeep?: number): Promise<number>;
}
