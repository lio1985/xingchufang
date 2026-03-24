/**
 * 共享相关类型定义
 */

export type ShareScope = 'custom' | 'all' | 'department';

export interface ShareLexiconRequest {
  lexiconId: string;
  shareScope: ShareScope;
  sharedWithUsers?: string[];
}

export interface SharedLexiconInfo {
  isShared: boolean;
  shareScope: ShareScope;
  sharedWithUsers: string[];
  sharedAt: string | null;
  sharedBy: string | null;
}

export interface SharePermission {
  id: string;
  resourceType: string;
  resourceId: string;
  isGloballyShared: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface ShareRecord {
  lexiconId: string;
  lexiconTitle: string;
  userId: string;
  userName: string;
  isShared: boolean;
  shareScope: ShareScope;
  sharedWithUsers: string[];
  isGloballyShared: boolean;
  sharedAt: string | null;
}

export interface CanAccessResult {
  canAccess: boolean;
  reason?: string;
}

export interface ShareHistory {
  id: string;
  lexiconId: string;
  operatorId: string;
  operatorName: string;
  shareType: 'user_share' | 'admin_share';
  shareScope: ShareScope | 'global';
  sharedWithUsers: string[];
  isGlobalShare: boolean;
  action: 'share' | 'unshare';
  previousConfig: ShareLexiconRequest | null;
  newConfig: ShareLexiconRequest | null;
  createdAt: string;
}
