import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    checkUser(body: {
        openid: string;
        nickname?: string;
    }): Promise<{
        success: boolean;
        code: number;
        msg: string;
        data: {
            type: "existing" | "created";
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
        };
    } | {
        success: boolean;
        code: number;
        msg: any;
        data: null;
    }>;
    login(body: {
        code: string;
    }): Promise<{
        code: number;
        msg: string;
        data: import("./user.service").LoginResponse;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    loginWithPassword(body: {
        username: string;
        password: string;
    }): Promise<{
        success: boolean;
        code: number;
        msg: string;
        data: {
            user: any;
            token: string;
        };
    } | {
        success: boolean;
        code: number;
        msg: any;
        data: null;
    }>;
    register(body: {
        username: string;
        password: string;
        nickname?: string;
    }): Promise<{
        success: boolean;
        code: number;
        msg: string;
        data: {
            user: any;
        };
    } | {
        success: boolean;
        code: any;
        msg: any;
        data: null;
    }>;
    changePassword(req: any, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        code: any;
        msg: any;
        data: null;
    }>;
    resetPassword(body: {
        userId: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        code: any;
        msg: any;
        data: null;
    }>;
    getProfile(req: any): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            id: string;
            openid: string;
            employeeId: string | undefined;
            nickname: string | undefined;
            avatarUrl: string | undefined;
            role: "user" | "admin";
            status: "active" | "disabled" | "deleted" | "pending";
        };
    }>;
    getProfileDetail(req: any): Promise<{
        code: number;
        msg: string;
        data: import("./user.service").UserProfile | null;
    }>;
    updateProfileDetail(req: any, body: any): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: import("./user.service").UserProfile;
    }>;
    getDepartments(req: any): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: string[];
    }>;
    auditUser(req: any, body: {
        userId: string;
        status: 'active' | 'disabled';
    }): Promise<{
        success: boolean;
        code: any;
        msg: any;
        data: null;
    }>;
    becomeAdmin(req: any): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            id: string;
            openid: string;
            nickname: string | undefined;
            role: "user" | "admin";
        };
    }>;
    getUserStatistics(req: any, targetUserId?: string): Promise<{
        code: number;
        msg: string;
        data: any;
    }>;
    getOperationLogs(req: any, targetUserId?: string, page?: number, pageSize?: number, action?: string): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            logs: any[];
            total: number;
        };
    }>;
    initDefaultAccounts(): Promise<{
        success: boolean;
        code: number;
        msg: string;
        data: {
            admin: {
                username: string;
                password: string;
                role: any;
                status: any;
            };
            test: {
                username: string;
                password: string;
                role: any;
                status: any;
            };
        };
    } | {
        success: boolean;
        code: number;
        msg: any;
        data: null;
    }>;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        code: number;
        msg: string;
        data: {
            avatarUrl: string;
            avatarKey: string;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    updateOnlineStatus(req: any, body: {
        isOnline: boolean;
    }): Promise<{
        code: number;
        msg: string;
        data: null;
    }>;
    getOnlineStatus(req: any, targetUserId?: string): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            isOnline: boolean;
            lastSeenAt: string | null;
        };
    }>;
    getBatchOnlineStatus(req: any, body: {
        userIds: string[];
    }): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: Record<string, {
            isOnline: boolean;
            lastSeenAt: string | null;
        }>;
    }>;
    getUserList(req: any, role?: string, status?: string, page?: string, limit?: string): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
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
        };
    }>;
}
