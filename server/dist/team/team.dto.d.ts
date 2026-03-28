export declare class CreateTeamDto {
    name: string;
    description?: string;
    leaderId: string;
}
export declare class UpdateTeamDto {
    name?: string;
    description?: string;
    leaderId?: string;
    isActive?: boolean;
}
export declare class AddTeamMemberDto {
    userId: string;
    role?: string;
}
export declare class UpdateTeamMemberRoleDto {
    role: string;
}
export declare class TeamQueryDto {
    keyword?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
}
export declare class TeamStatisticsQueryDto {
    teamId?: string;
    startDate?: string;
    endDate?: string;
}
