export declare enum UserRole {
    GUEST = "guest",
    EMPLOYEE = "employee",
    TEAM_LEADER = "team_leader",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export declare enum DataVisibility {
    PRIVATE = "private",
    TEAM = "team",
    PUBLIC = "public"
}
export declare enum PermissionAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    ACCEPT_ORDER = "accept_order",
    TRANSFER_ORDER = "transfer_order",
    CANCEL_ORDER = "cancel_order",
    VIEW_CONTACT = "view_contact",
    CONFIRM_CANCEL = "confirm_cancel",
    MANAGE_TEAM = "manage_team",
    ASSIGN_MEMBER = "assign_member",
    MANAGE_USER = "manage_user",
    ACTIVATE_USER = "activate_user",
    SUSPEND_USER = "suspend_user",
    CHANGE_ROLE = "change_role",
    MANAGE_CONTENT = "manage_content",
    APPROVE_CONTENT = "approve_content"
}
export declare enum PermissionResource {
    USER = "user",
    TEAM = "team",
    EQUIPMENT_ORDER = "equipment_order",
    LEXICON = "lexicon",
    QUICK_NOTE = "quick_note",
    KNOWLEDGE_SHARE = "knowledge_share",
    CUSTOMER = "customer",
    RECYCLING = "recycling",
    AUDIT_LOG = "audit_log",
    KNOWLEDGE = "knowledge",
    FILE_PARSER = "file_parser",
    CONTENT_CREATION = "content_creation",
    AI_ASSISTANT = "ai_assistant"
}
export declare const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionResource, PermissionAction[]>>;
export declare const DATA_ISOLATION_RULES: {
    guest: {
        canViewPrivateData: boolean;
        canViewTeamData: boolean;
        canViewPublicData: boolean;
        maskedFields: string[];
    };
    employee: {
        canViewPrivateData: boolean;
        canViewTeamData: boolean;
        canViewPublicData: boolean;
        maskedFields: never[];
    };
    team_leader: {
        canViewPrivateData: boolean;
        canViewTeamData: boolean;
        canViewPublicData: boolean;
        maskedFields: never[];
    };
    admin: {
        canViewPrivateData: boolean;
        canViewTeamData: boolean;
        canViewPublicData: boolean;
        maskedFields: never[];
    };
};
export declare const ORDER_STATUS_TRANSITIONS: {
    published: string[];
    accepted: string[];
    transferred: string[];
    cancelling: string[];
    cancelled: never[];
    completed: never[];
};
export declare const DEFAULT_ROLE = UserRole.GUEST;
export declare const ADMIN_ROLES: UserRole[];
export declare const CAN_ACCEPT_ORDER_ROLES: UserRole[];
