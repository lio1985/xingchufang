/**
 * 公共 TypeScript 类型定义
 * 统一管理类型，确保类型安全
 */

// ==================== 通用类型 ====================

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * API 响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 列表项基础接口
 */
export interface BaseListItem {
  id: string;
  created_at: string;
  updated_at?: string;
}

// ==================== 用户相关类型 ====================

/**
 * 用户角色
 */
export type UserRole = 'guest' | 'staff' | 'team_leader' | 'admin';

/**
 * 用户信息
 */
export interface User {
  id: string;
  nickname: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
  role: UserRole;
  team_id?: string;
  team?: Team;
  created_at: string;
  updated_at: string;
}

/**
 * 团队信息
 */
export interface Team {
  id: string;
  name: string;
  leader_id: string;
  members?: User[];
  created_at: string;
}

// ==================== 设备订单相关类型 ====================

/**
 * 设备订单状态
 */
export type EquipmentOrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

/**
 * 设备订单
 */
export interface EquipmentOrder extends BaseListItem {
  title: string;
  description: string;
  equipment_type: string;
  budget?: number;
  location?: string;
  contact_name?: string;
  contact_phone?: string;
  status: EquipmentOrderStatus;
  images?: string[];
  publisher_id: string;
  publisher?: User;
  acceptor_id?: string;
  acceptor?: User;
  completed_at?: string;
}

// ==================== 客户相关类型 ====================

/**
 * 客户状态
 */
export type CustomerStatus = 'active' | 'inactive' | 'follow_up';

/**
 * 客户等级
 */
export type CustomerLevel = 'A' | 'B' | 'C' | 'D';

/**
 * 客户信息
 */
export interface Customer extends BaseListItem {
  name: string;
  phone: string;
  company?: string;
  address?: string;
  status: CustomerStatus;
  level: CustomerLevel;
  last_contact_at?: string;
  next_follow_at?: string;
  notes?: string;
  owner_id: string;
  owner?: User;
  tags?: string[];
}

// ==================== 直播相关类型 ====================

/**
 * 直播状态
 */
export type LiveStatus = 'scheduled' | 'live' | 'ended';

/**
 * 直播信息
 */
export interface LiveSession extends BaseListItem {
  title: string;
  description?: string;
  cover_url?: string;
  status: LiveStatus;
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  duration?: number;
  viewer_count?: number;
  like_count?: number;
  comment_count?: number;
  sales_amount?: number;
  host_id: string;
  host?: User;
}

// ==================== 内容创作相关类型 ====================

/**
 * 内容类型
 */
export type ContentType = 'short_video' | 'article' | 'live_script' | 'product_intro';

/**
 * 内容状态
 */
export type ContentStatus = 'draft' | 'published' | 'archived';

/**
 * 内容创作
 */
export interface Content extends BaseListItem {
  title: string;
  content: string;
  type: ContentType;
  status: ContentStatus;
  tags?: string[];
  author_id: string;
  author?: User;
  published_at?: string;
  view_count?: number;
  like_count?: number;
}

// ==================== 知识库相关类型 ====================

/**
 * 知识库类型
 */
export type KnowledgeType = 'personal' | 'company' | 'product' | 'design';

/**
 * 知识库项目
 */
export interface KnowledgeItem extends BaseListItem {
  title: string;
  content: string;
  type: KnowledgeType;
  tags?: string[];
  attachments?: Attachment[];
  author_id: string;
  author?: User;
  view_count?: number;
}

/**
 * 附件信息
 */
export interface Attachment {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
}

// ==================== 选题规划相关类型 ====================

/**
 * 选题状态
 */
export type TopicStatus = 'idea' | 'planning' | 'executing' | 'completed';

/**
 * 选题信息
 */
export interface Topic extends BaseListItem {
  title: string;
  description?: string;
  status: TopicStatus;
  category?: string;
  tags?: string[];
  priority?: number;
  scheduled_date?: string;
  owner_id: string;
  owner?: User;
  analysis?: TopicAnalysis;
}

/**
 * 选题分析结果
 */
export interface TopicAnalysis {
  creativeAngles?: CreativeAngle[];
  targetAudience?: string;
  keyPoints?: string[];
  suggestedFormat?: string;
  estimatedEngagement?: string;
}

/**
 * 创意角度
 */
export interface CreativeAngle {
  angle: string;
  description: string;
  examples?: string[];
}

// ==================== 消息订阅相关类型 ====================

/**
 * 订阅模板
 */
export interface SubscribeTemplate {
  id: string;
  templateId: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  subscribed: boolean;
  category: string;
}

// ==================== 加载状态类型 ====================

/**
 * 加载状态
 */
export interface LoadingState {
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
}

/**
 * 分页状态
 */
export interface PaginationState {
  page: number;
  hasMore: boolean;
  total: number;
}

// ==================== 表单相关类型 ====================

/**
 * 表单字段错误
 */
export interface FormFieldError {
  field: string;
  message: string;
}

/**
 * 表单状态
 */
export interface FormState<T> {
  values: T;
  errors: FormFieldError[];
  submitting: boolean;
  isValid: boolean;
}

// ==================== 工具类型 ====================

/**
 * 可选属性
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 必选属性
 */
export type Required<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] };

/**
 * 只读属性
 */
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 挑选属性
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * 排除属性
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * 部分属性
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * 非空
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 函数类型
 */
export type Fn<T = void> = () => T;

/**
 * 异步函数类型
 */
export type AsyncFn<T = void> = () => Promise<T>;

/**
 * 事件处理器
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * 键值对
 */
export type KeyValue<T = any> = Record<string, T>;
