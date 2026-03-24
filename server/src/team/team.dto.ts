import { IsString, IsOptional, IsUUID, IsEnum, IsBoolean } from 'class-validator';

// 创建团队
export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  leaderId: string;
}

// 更新团队
export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// 添加团队成员
export class AddTeamMemberDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(['leader', 'member'])
  role?: string = 'member';
}

// 更新团队成员角色
export class UpdateTeamMemberRoleDto {
  @IsEnum(['leader', 'member'])
  role: string;
}

// 团队查询
export class TeamQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  pageSize?: number = 20;
}

// 团队统计查询
export class TeamStatisticsQueryDto {
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;
}
