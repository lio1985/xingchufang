/**
 * 用户角色枚举
 */
export enum UserRole {
  GUEST = 'guest',           // 游客
  EMPLOYEE = 'employee',     // 员工
  TEAM_LEADER = 'team_leader', // 团队队长
  ADMIN = 'admin',           // 管理员
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',         // 已激活
  INACTIVE = 'inactive',     // 未激活
  SUSPENDED = 'suspended',   // 已停用
}

/**
 * 数据可见性枚举
 */
export enum DataVisibility {
  PRIVATE = 'private',       // 私有 - 仅自己可见
  TEAM = 'team',             // 团队可见
  PUBLIC = 'public',         // 公开 - 所有人可见
}

/**
 * 权限操作枚举
 */
export enum PermissionAction {
  // 通用操作
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  // 订单相关
  ACCEPT_ORDER = 'accept_order',
  TRANSFER_ORDER = 'transfer_order',
  CANCEL_ORDER = 'cancel_order',
  VIEW_CONTACT = 'view_contact',
  CONFIRM_CANCEL = 'confirm_cancel',

  // 团队相关
  MANAGE_TEAM = 'manage_team',
  ASSIGN_MEMBER = 'assign_member',

  // 用户管理
  MANAGE_USER = 'manage_user',
  ACTIVATE_USER = 'activate_user',
  SUSPEND_USER = 'suspend_user',
  CHANGE_ROLE = 'change_role',

  // 内容管理
  MANAGE_CONTENT = 'manage_content',
  APPROVE_CONTENT = 'approve_content',
}

/**
 * 权限资源枚举
 */
export enum PermissionResource {
  // 用户管理
  USER = 'user',

  // 团队管理
  TEAM = 'team',

  // 设备订单
  EQUIPMENT_ORDER = 'equipment_order',

  // 内容资料
  LEXICON = 'lexicon',
  QUICK_NOTE = 'quick_note',
  KNOWLEDGE_SHARE = 'knowledge_share',

  // 客户管理
  CUSTOMER = 'customer',

  // 回收业务
  RECYCLING = 'recycling',

  // 审计日志
  AUDIT_LOG = 'audit_log',

  // 知识库
  KNOWLEDGE = 'knowledge',

  // 文件解析
  FILE_PARSER = 'file_parser',

  // 内容创作
  CONTENT_CREATION = 'content_creation',

  // AI 功能
  AI_ASSISTANT = 'ai_assistant',
}

/**
 * 角色权限映射表
 * 定义每个角色对各资源的操作权限
 */
export const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionResource, PermissionAction[]>> = {
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
    [PermissionResource.KNOWLEDGE]: [PermissionAction.READ],
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
      PermissionAction.READ,
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

/**
 * 数据隔离规则
 */
export const DATA_ISOLATION_RULES = {
  // 游客只能看到公开内容
  [UserRole.GUEST]: {
    canViewPrivateData: false,
    canViewTeamData: false,
    canViewPublicData: true,
    maskedFields: ['phone', 'real_name', 'id_card', 'address'],
  },

  // 员工可以看到自己和团队数据
  [UserRole.EMPLOYEE]: {
    canViewPrivateData: true,  // 仅自己的
    canViewTeamData: true,
    canViewPublicData: true,
    maskedFields: [],  // 自己的数据不脱敏
  },

  // 团队队长可以查看团队成员数据
  [UserRole.TEAM_LEADER]: {
    canViewPrivateData: true,  // 自己和团队成员的
    canViewTeamData: true,
    canViewPublicData: true,
    maskedFields: [],
  },

  // 管理员可以看到所有数据
  [UserRole.ADMIN]: {
    canViewPrivateData: true,
    canViewTeamData: true,
    canViewPublicData: true,
    maskedFields: [],
  },
};

/**
 * 订单状态流转规则
 */
export const ORDER_STATUS_TRANSITIONS = {
  published: ['accepted', 'cancelled'],      // 已发布 -> 已接单/已取消
  accepted: ['transferred', 'cancelling'],   // 已接单 -> 已转让/取消中
  transferred: ['completed'],                // 已转让 -> 已完成
  cancelling: ['cancelled', 'accepted'],     // 取消中 -> 已取消/已接单（拒绝取消）
  cancelled: [],                             // 已取消 -> 终态
  completed: [],                             // 已完成 -> 终态
};

/**
 * 默认角色
 */
export const DEFAULT_ROLE = UserRole.GUEST;

/**
 * 管理员角色
 */
export const ADMIN_ROLES = [UserRole.ADMIN];

/**
 * 可接单角色
 */
export const CAN_ACCEPT_ORDER_ROLES = [UserRole.EMPLOYEE, UserRole.TEAM_LEADER, UserRole.ADMIN];
