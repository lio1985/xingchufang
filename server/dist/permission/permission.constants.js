"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAN_ACCEPT_ORDER_ROLES = exports.ADMIN_ROLES = exports.DEFAULT_ROLE = exports.ORDER_STATUS_TRANSITIONS = exports.DATA_ISOLATION_RULES = exports.ROLE_PERMISSIONS = exports.PermissionResource = exports.PermissionAction = exports.DataVisibility = exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["GUEST"] = "guest";
    UserRole["EMPLOYEE"] = "employee";
    UserRole["TEAM_LEADER"] = "team_leader";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var DataVisibility;
(function (DataVisibility) {
    DataVisibility["PRIVATE"] = "private";
    DataVisibility["TEAM"] = "team";
    DataVisibility["PUBLIC"] = "public";
})(DataVisibility || (exports.DataVisibility = DataVisibility = {}));
var PermissionAction;
(function (PermissionAction) {
    PermissionAction["CREATE"] = "create";
    PermissionAction["READ"] = "read";
    PermissionAction["UPDATE"] = "update";
    PermissionAction["DELETE"] = "delete";
    PermissionAction["ACCEPT_ORDER"] = "accept_order";
    PermissionAction["TRANSFER_ORDER"] = "transfer_order";
    PermissionAction["CANCEL_ORDER"] = "cancel_order";
    PermissionAction["VIEW_CONTACT"] = "view_contact";
    PermissionAction["CONFIRM_CANCEL"] = "confirm_cancel";
    PermissionAction["MANAGE_TEAM"] = "manage_team";
    PermissionAction["ASSIGN_MEMBER"] = "assign_member";
    PermissionAction["MANAGE_USER"] = "manage_user";
    PermissionAction["ACTIVATE_USER"] = "activate_user";
    PermissionAction["SUSPEND_USER"] = "suspend_user";
    PermissionAction["CHANGE_ROLE"] = "change_role";
    PermissionAction["MANAGE_CONTENT"] = "manage_content";
    PermissionAction["APPROVE_CONTENT"] = "approve_content";
})(PermissionAction || (exports.PermissionAction = PermissionAction = {}));
var PermissionResource;
(function (PermissionResource) {
    PermissionResource["USER"] = "user";
    PermissionResource["TEAM"] = "team";
    PermissionResource["EQUIPMENT_ORDER"] = "equipment_order";
    PermissionResource["LEXICON"] = "lexicon";
    PermissionResource["QUICK_NOTE"] = "quick_note";
    PermissionResource["KNOWLEDGE_SHARE"] = "knowledge_share";
    PermissionResource["CUSTOMER"] = "customer";
    PermissionResource["RECYCLING"] = "recycling";
    PermissionResource["AUDIT_LOG"] = "audit_log";
    PermissionResource["KNOWLEDGE"] = "knowledge";
    PermissionResource["FILE_PARSER"] = "file_parser";
    PermissionResource["CONTENT_CREATION"] = "content_creation";
    PermissionResource["AI_ASSISTANT"] = "ai_assistant";
})(PermissionResource || (exports.PermissionResource = PermissionResource = {}));
exports.ROLE_PERMISSIONS = {
    [UserRole.GUEST]: {
        [PermissionResource.USER]: [PermissionAction.READ],
        [PermissionResource.TEAM]: [],
        [PermissionResource.EQUIPMENT_ORDER]: [PermissionAction.READ],
        [PermissionResource.LEXICON]: [PermissionAction.READ],
        [PermissionResource.QUICK_NOTE]: [],
        [PermissionResource.KNOWLEDGE_SHARE]: [PermissionAction.READ],
        [PermissionResource.CUSTOMER]: [],
        [PermissionResource.RECYCLING]: [],
        [PermissionResource.AUDIT_LOG]: [],
        [PermissionResource.KNOWLEDGE]: [],
        [PermissionResource.FILE_PARSER]: [],
        [PermissionResource.CONTENT_CREATION]: [],
        [PermissionResource.AI_ASSISTANT]: [],
    },
    [UserRole.EMPLOYEE]: {
        [PermissionResource.USER]: [PermissionAction.READ],
        [PermissionResource.TEAM]: [PermissionAction.READ],
        [PermissionResource.EQUIPMENT_ORDER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.ACCEPT_ORDER,
            PermissionAction.TRANSFER_ORDER,
            PermissionAction.CANCEL_ORDER,
        ],
        [PermissionResource.LEXICON]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.QUICK_NOTE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.KNOWLEDGE_SHARE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.CUSTOMER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
        ],
        [PermissionResource.RECYCLING]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
        ],
        [PermissionResource.AUDIT_LOG]: [],
        [PermissionResource.KNOWLEDGE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
        ],
        [PermissionResource.FILE_PARSER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
        ],
        [PermissionResource.CONTENT_CREATION]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
        ],
        [PermissionResource.AI_ASSISTANT]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
        ],
    },
    [UserRole.TEAM_LEADER]: {
        [PermissionResource.USER]: [PermissionAction.READ, PermissionAction.UPDATE],
        [PermissionResource.TEAM]: [PermissionAction.READ, PermissionAction.MANAGE_TEAM],
        [PermissionResource.EQUIPMENT_ORDER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.ACCEPT_ORDER,
            PermissionAction.TRANSFER_ORDER,
            PermissionAction.CANCEL_ORDER,
            PermissionAction.VIEW_CONTACT,
        ],
        [PermissionResource.LEXICON]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.QUICK_NOTE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.KNOWLEDGE_SHARE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.CUSTOMER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.RECYCLING]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.AUDIT_LOG]: [PermissionAction.READ],
        [PermissionResource.KNOWLEDGE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
        ],
        [PermissionResource.FILE_PARSER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
        ],
        [PermissionResource.CONTENT_CREATION]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
        ],
        [PermissionResource.AI_ASSISTANT]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
        ],
    },
    [UserRole.ADMIN]: {
        [PermissionResource.USER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
            PermissionAction.MANAGE_USER,
            PermissionAction.ACTIVATE_USER,
            PermissionAction.SUSPEND_USER,
            PermissionAction.CHANGE_ROLE,
        ],
        [PermissionResource.TEAM]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
            PermissionAction.MANAGE_TEAM,
            PermissionAction.ASSIGN_MEMBER,
        ],
        [PermissionResource.EQUIPMENT_ORDER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
            PermissionAction.ACCEPT_ORDER,
            PermissionAction.TRANSFER_ORDER,
            PermissionAction.CANCEL_ORDER,
            PermissionAction.VIEW_CONTACT,
            PermissionAction.CONFIRM_CANCEL,
        ],
        [PermissionResource.LEXICON]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
            PermissionAction.APPROVE_CONTENT,
        ],
        [PermissionResource.QUICK_NOTE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.KNOWLEDGE_SHARE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
            PermissionAction.APPROVE_CONTENT,
        ],
        [PermissionResource.CUSTOMER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.RECYCLING]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.AUDIT_LOG]: [PermissionAction.READ],
        [PermissionResource.KNOWLEDGE]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.FILE_PARSER]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.CONTENT_CREATION]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
        ],
        [PermissionResource.AI_ASSISTANT]: [
            PermissionAction.CREATE,
            PermissionAction.READ,
            PermissionAction.UPDATE,
            PermissionAction.DELETE,
            PermissionAction.MANAGE_CONTENT,
        ],
    },
};
exports.DATA_ISOLATION_RULES = {
    [UserRole.GUEST]: {
        canViewPrivateData: false,
        canViewTeamData: false,
        canViewPublicData: true,
        maskedFields: ['phone', 'real_name', 'id_card', 'address'],
    },
    [UserRole.EMPLOYEE]: {
        canViewPrivateData: true,
        canViewTeamData: true,
        canViewPublicData: true,
        maskedFields: [],
    },
    [UserRole.TEAM_LEADER]: {
        canViewPrivateData: true,
        canViewTeamData: true,
        canViewPublicData: true,
        maskedFields: [],
    },
    [UserRole.ADMIN]: {
        canViewPrivateData: true,
        canViewTeamData: true,
        canViewPublicData: true,
        maskedFields: [],
    },
};
exports.ORDER_STATUS_TRANSITIONS = {
    published: ['accepted', 'cancelled'],
    accepted: ['transferred', 'cancelling'],
    transferred: ['completed'],
    cancelling: ['cancelled', 'accepted'],
    cancelled: [],
    completed: [],
};
exports.DEFAULT_ROLE = UserRole.GUEST;
exports.ADMIN_ROLES = [UserRole.ADMIN];
exports.CAN_ACCEPT_ORDER_ROLES = [UserRole.EMPLOYEE, UserRole.TEAM_LEADER, UserRole.ADMIN];
//# sourceMappingURL=permission.constants.js.map