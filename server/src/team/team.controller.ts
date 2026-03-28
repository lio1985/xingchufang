import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TeamService, CreateTeamDto, UpdateTeamDto } from './team.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  /**
   * 创建团队（管理员）
   */
  @Post()
  async createTeam(@Request() req, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(req.user.id, dto);
  }

  /**
   * 获取所有团队列表
   */
  @Get()
  async getAllTeams() {
    return this.teamService.getAllTeams();
  }

  /**
   * 获取当前用户的团队信息（兼容多种路径）
   */
  @Get('my-team')
  async getMyTeam(@Request() req) {
    return this.teamService.getUserTeam(req.user.id);
  }

  /**
   * 获取当前用户的团队信息（兼容前端调用路径）
   */
  @Get('my/team')
  async getMyTeamAlt(@Request() req) {
    return this.teamService.getUserTeam(req.user.id);
  }

  /**
   * 获取当前用户的团队成员
   */
  @Get('my/members')
  async getMyTeamMembers(@Request() req) {
    return this.teamService.getTeamMembers(req.user.id);
  }

  /**
   * 获取当前用户的团队统计
   */
  @Get('my/statistics')
  async getMyTeamStatistics(@Request() req) {
    return this.teamService.getTeamStatistics(req.user.id);
  }

  /**
   * 获取团队详情
   */
  @Get(':id')
  async getTeam(@Param('id') id: string) {
    return this.teamService.getTeam(id);
  }

  /**
   * 更新团队信息
   */
  @Put(':id')
  async updateTeam(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamService.updateTeam(req.user.id, id, dto);
  }

  /**
   * 添加团队成员
   */
  @Post(':id/members')
  async addMember(
    @Request() req,
    @Param('id') id: string,
    @Body('memberId') memberId: string,
  ) {
    return this.teamService.addMember(req.user.id, id, memberId);
  }

  /**
   * 移除团队成员
   */
  @Delete(':id/members/:memberId')
  async removeMember(
    @Request() req,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamService.removeMember(req.user.id, id, memberId);
  }

  /**
   * 转移队长权限
   */
  @Post(':id/transfer-leadership')
  async transferLeadership(
    @Request() req,
    @Param('id') id: string,
    @Body('newLeaderId') newLeaderId: string,
  ) {
    return this.teamService.transferLeadership(req.user.id, id, newLeaderId);
  }
}
