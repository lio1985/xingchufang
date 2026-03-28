import { UserService } from '../user/user.service';
import { LexiconService } from '../database/lexicon/lexicon.service';
import { StatisticsService } from '../statistics/statistics.service';
import { ShareRecord, SharePermission } from '../share/types';
export declare class AdminController {
    private readonly userService;
    private readonly lexiconService;
    private readonly statisticsService;
    constructor(userService: UserService, lexiconService: LexiconService, statisticsService: StatisticsService);
    getUsers(req: any, page?: number, pageSize?: number, role?: string, status?: string, search?: string): Promise<{
        code: number;
        msg: string;
        data: {
            users: {
                id: any;
                username: any;
                avatar: any;
                role: any;
                status: any;
                employeeId: any;
                createdAt: any;
                lastLoginAt: any;
            }[];
            total: number;
            page: number;
            pageSize: number;
        };
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getUserDetail(req: any, userId: string): Promise<{
        code: number;
        msg: string;
        data: {
            user: import("../user/user.service").User;
            profile: import("../user/user.service").UserProfile | null;
        } | null;
    }>;
    updateUserRole(req: any, userId: string, body: {
        role: 'user' | 'admin';
    }): Promise<{
        code: number;
        msg: string;
        data: import("../user/user.service").User;
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    updateUserStatus(req: any, userId: string, body: {
        status: 'active' | 'disabled' | 'deleted' | 'pending';
    }): Promise<{
        code: number;
        msg: string;
        data: import("../user/user.service").User;
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    updateUserNickname(req: any, userId: string, body: {
        username: string;
    }): Promise<{
        code: number;
        msg: string;
        data: import("../user/user.service").User;
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getDepartments(): Promise<{
        code: number;
        msg: string;
        data: string[];
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getGlobalStatistics(): Promise<{
        code: number;
        msg: string;
        data: import("../statistics/statistics.service").GlobalStatistics;
    } | {
        code: number;
        msg: string;
        data: null;
    }>;
    getPendingUsersCount(): Promise<{
        code: number;
        msg: string;
        data: null;
    } | {
        code: number;
        msg: string;
        data: {
            count: number;
        };
    }>;
    forceShareLexicon(req: any, lexiconId: string, body: {
        isGloballyShared: boolean;
    }): Promise<{
        code: number;
        msg: string;
        data: SharePermission;
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getAllShareRecords(req: any, page?: number, pageSize?: number): Promise<{
        code: number;
        msg: string;
        data: ShareRecord[];
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    batchSetGlobalShare(req: any, body: {
        lexiconIds: string[];
        isGloballyShared: boolean;
    }): Promise<{
        code: number;
        msg: string;
        data: {
            total: number;
            successCount: number;
            failCount: number;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
    getShareStats(req: any): Promise<{
        code: number;
        msg: string;
        data: {
            totalLexicons: number;
            sharedLexicons: number;
            globalShared: number;
            recentShareActions: number;
            shareScopeStats: any;
        };
    } | {
        code: any;
        msg: any;
        data: null;
    }>;
}
