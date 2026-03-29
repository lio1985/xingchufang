import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TeamService, CreateTeamDto, UpdateTeamDto } from './team.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('teams')
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
   * 获取可添加到团队的用户列表
   * 队长或管理员可调用
   */
  @Get('available-users')
  async getAvailableUsers(@Request() req, @Query('search') search?: string) {
    return this.teamService.getAvailableUsers(req.user.id, search);
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

  /**
   * 获取团队任务列表
   */
  @Get('my/tasks')
  async getMyTeamTasks(@Request() req) {
    return this.teamService.getTeamTasks(req.user.id);
  }

  /**
   * 创建团队任务
   */
  @Post('my/tasks')
  async createTeamTask(@Request() req, @Body() body: any) {
    return this.teamService.createTeamTask(req.user.id, body);
  }

  /**
   * 更新团队任务
   */
  @Put('my/tasks/:taskId')
  async updateTeamTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() body: any,
  ) {
    return this.teamService.updateTeamTask(req.user.id, taskId, body);
  }

  /**
   * 删除团队任务
   */
  @Delete('my/tasks/:taskId')
  async deleteTeamTask(@Request() req, @Param('taskId') taskId: string) {
    return this.teamService.deleteTeamTask(req.user.id, taskId);
  }

  /**
   * 获取团队公告列表
   */
  @Get('my/announcements')
  async getMyTeamAnnouncements(@Request() req) {
    return this.teamService.getTeamAnnouncements(req.user.id);
  }

  /**
   * 创建团队公告
   */
  @Post('my/announcements')
  async createTeamAnnouncement(@Request() req, @Body() body: any) {
    return this.teamService.createTeamAnnouncement(req.user.id, body);
  }

  /**
   * 标记公告已读
   */
  @Post('my/announcements/:announcementId/read')
  async markAnnouncementRead(
    @Request() req,
    @Param('announcementId') announcementId: string,
  ) {
    return this.teamService.markAnnouncementRead(req.user.id, announcementId);
  }

  /**
   * 获取团队聊天消息
   */
  @Get('my/chat-messages')
  async getMyTeamChatMessages(@Request() req) {
    return this.teamService.getTeamChatMessages(req.user.id);
  }

  /**
   * 发送团队聊天消息
   */
  @Post('my/chat-messages')
  async sendTeamChatMessage(@Request() req, @Body() body: any) {
    return this.teamService.sendTeamChatMessage(req.user.id, body);
  }
}
