import { PermissionService } from '../permission/permission.service';
export interface CreateTeamDto {
    name: string;
    description?: string;
    leaderId: string;
}
export interface UpdateTeamDto {
    name?: string;
    description?: string;
    leaderId?: string;
}
export declare class TeamService {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    createTeam(userId: string, dto: CreateTeamDto): Promise<any>;
    updateTeam(userId: string, teamId: string, dto: UpdateTeamDto): Promise<any>;
    transferLeadership(currentUserId: string, teamId: string, newLeaderId: string): Promise<{
        success: boolean;
    }>;
    addMember(userId: string, teamId: string, memberId: string): Promise<{
        success: boolean;
        member: {
            id: any;
            nickname: any;
            avatarUrl: any;
        };
    }>;
    removeMember(userId: string, teamId: string, memberId: string): Promise<{
        success: boolean;
    }>;
    getTeam(teamId: string): Promise<any>;
    getAllTeams(): Promise<any[]>;
    isTeamLeaderOfTeam(userId: string, teamId: string): Promise<boolean>;
    getUserTeam(userId: string): Promise<any>;
    getTeamMembers(userId: string): Promise<{
        id: any;
        user_id: any;
        role: string;
        joined_at: any;
        user: {
            id: any;
            nickname: any;
            avatarUrl: any;
        };
    }[]>;
    getTeamStatistics(userId: string): Promise<{
        teamId: any;
        teamName: any;
        memberCount: number;
        totalCustomers: number;
        activeCustomers: number;
        totalRecycleStores: number;
        totalDealValue: any;
        memberRanking: {
            userId: any;
            name: any;
            role: string;
            customerCount: number;
            recycleDealValue: any;
            contributionRate: number;
        }[];
    } | null>;
    getAvailableUsers(userId: string, search?: string): Promise<any[]>;
}
