import { TeamService, CreateTeamDto, UpdateTeamDto } from './team.service';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    createTeam(req: any, dto: CreateTeamDto): Promise<any>;
    getAllTeams(): Promise<any[]>;
    getMyTeam(req: any): Promise<any>;
    getMyTeamAlt(req: any): Promise<any>;
    getMyTeamMembers(req: any): Promise<{
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
    getMyTeamStatistics(req: any): Promise<{
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
    getAvailableUsers(req: any, search?: string): Promise<any[]>;
    getTeam(id: string): Promise<any>;
    updateTeam(req: any, id: string, dto: UpdateTeamDto): Promise<any>;
    addMember(req: any, id: string, memberId: string): Promise<{
        success: boolean;
        member: {
            id: any;
            nickname: any;
            avatarUrl: any;
        };
    }>;
    removeMember(req: any, id: string, memberId: string): Promise<{
        success: boolean;
    }>;
    transferLeadership(req: any, id: string, newLeaderId: string): Promise<{
        success: boolean;
    }>;
    getMyTeamTasks(req: any): Promise<{
        id: any;
        title: any;
        description: any;
        status: any;
        priority: any;
        due_date: any;
        created_at: any;
        assignees: any;
    }[]>;
    createTeamTask(req: any, body: any): Promise<any>;
    updateTeamTask(req: any, taskId: string, body: any): Promise<any>;
    deleteTeamTask(req: any, taskId: string): Promise<{
        success: boolean;
    }>;
    getMyTeamAnnouncements(req: any): Promise<{
        id: any;
        title: any;
        content: any;
        priority: any;
        created_at: any;
        author: {
            nickname: any;
            avatar_url: any;
        } | null;
        is_read: boolean;
    }[]>;
    createTeamAnnouncement(req: any, body: any): Promise<any>;
    markAnnouncementRead(req: any, announcementId: string): Promise<{
        success: boolean;
    }>;
    getMyTeamChatMessages(req: any): Promise<{
        id: any;
        content: any;
        type: any;
        sender_id: any;
        sender_name: any;
        sender_avatar: any;
        created_at: any;
    }[]>;
    sendTeamChatMessage(req: any, body: any): Promise<any>;
}
