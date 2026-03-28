import { TokenPayload } from '../utils/jwt.util';
import { StorageService } from '../storage/storage.service';
export interface User {
    id: string;
    openid: string;
    nickname?: string;
    avatar_url?: string;
    role: 'user' | 'admin';
    status: 'active' | 'disabled' | 'deleted' | 'pending';
    unionid?: string;
    employee_id?: string;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
}
export interface UserProfile {
    id: string;
    user_id: string;
    real_name?: string;
    phone?: string;
    email?: string;
    department?: string;
    position?: string;
    company?: string;
    employee_id?: string;
    gender?: string;
    birthday?: string;
    address?: string;
    bio?: string;
    created_at: string;
    updated_at: string;
}
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        openid: string;
        employeeId?: string;
        nickname?: string;
        avatarUrl?: string;
        role: string;
        status: string;
    };
}
export interface UpdateUserDto {
    nickname?: string;
    avatar_url?: string;
    role?: 'user' | 'admin';
    status?: 'active' | 'disabled' | 'deleted' | 'pending';
}
export interface UpdateUserProfileDto {
    real_name?: string;
    phone?: string;
    email?: string;
    department?: string;
    position?: string;
    company?: string;
    employee_id?: string;
    gender?: string;
    birthday?: string;
    address?: string;
    bio?: string;
}
export declare class UserService {
    private readonly storageService;
    private client;
    private readonly logger;
    constructor(storageService: StorageService);
    private generateUniqueEmployeeId;
    wechatLogin(code: string): Promise<LoginResponse>;
    findByOpenid(openid: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    validateToken(token: string): Promise<TokenPayload | null>;
    getUserProfile(userId: string): Promise<UserProfile | null>;
    updateUserProfile(userId: string, profileData: UpdateUserProfileDto): Promise<UserProfile>;
    getAllUsers(page?: number, pageSize?: number, role?: 'user' | 'admin', status?: 'active' | 'disabled' | 'deleted' | 'pending', search?: string): Promise<{
        users: User[];
        total: number;
    }>;
    updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User>;
    updateUserStatus(userId: string, status: 'active' | 'disabled' | 'deleted' | 'pending'): Promise<User>;
    updateUserNickname(userId: string, nickname: string): Promise<User>;
    isAdmin(userId: string): Promise<boolean>;
    getUserListSimple(options: {
        page?: number;
        limit?: number;
        role?: 'user' | 'admin' | 'all';
        status?: 'active' | 'disabled' | 'deleted' | 'pending' | 'all';
        keyword?: string;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    getUserWithProfile(userId: string): Promise<{
        user: User;
        profile: UserProfile | null;
    } | null>;
    getDepartments(): Promise<string[]>;
    getUserStatistics(currentUserId: string, targetUserId: string): Promise<any>;
    getOperationLogs(currentUserId: string, options: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        logs: any[];
        total: number;
    }>;
    checkOrCreateUser(params: {
        openid: string;
        nickname?: string;
    }): Promise<{
        type: 'existing' | 'created';
        user: {
            id: string;
            openid: string;
            employeeId?: string;
            nickname?: string;
            avatarUrl?: string;
            role: string;
            status: string;
        };
        token?: string;
    }>;
    loginWithPassword(username: string, password: string): Promise<{
        user: any;
        token: string;
    }>;
    private createDefaultAccounts;
    register(username: string, password: string, nickname?: string): Promise<{
        user: any;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    resetPassword(userId: string, newPassword: string): Promise<void>;
    auditUser(userId: string, status: 'active' | 'disabled', operatorId: string): Promise<void>;
    initDefaultAccounts(): Promise<{
        admin: any;
        test: any;
    }>;
    updateAvatar(userId: string, fileBuffer: Buffer, originalName: string, mimeType: string): Promise<{
        avatarUrl: string;
        avatarKey: string;
    }>;
    updateOnlineStatus(userId: string, isOnline: boolean): Promise<void>;
    getOnlineStatus(userId: string): Promise<{
        isOnline: boolean;
        lastSeenAt: string | null;
    }>;
    getBatchOnlineStatus(userIds: string[]): Promise<Record<string, {
        isOnline: boolean;
        lastSeenAt: string | null;
    }>>;
    getUserList(role?: string, status?: string, page?: number, limit?: number): Promise<{
        list: {
            id: any;
            nickname: any;
            avatar_url: any;
            role: any;
            status: any;
            employee_id: any;
            last_login_at: any;
            created_at: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
}
