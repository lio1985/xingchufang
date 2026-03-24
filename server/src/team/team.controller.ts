import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TeamService } from './team.service';
import { UserService } from '../user/user.service';
import {
  CreateTeamDto,
  UpdateTeamDto,
  AddTeamMemberDto,
  UpdateTeamMemberRoleDto,
  TeamQueryDto,
  TeamStatisticsQueryDto
} from './team.dto';

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly userService: UserService
  ) {}

  // ========== 团队管理（管理员） ==========

  @Get()
  async getTeams(@Query() query: TeamQueryDto) {
    const result = await this.teamService.getTeams(query);
    return {
      code: 200,
      msg: '获取团队列表成功',
      data: result
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTeam(@Body() dto: CreateTeamDto, @Request() req: any) {
    const userId = await this.getCurrentUserId(req);
    if (!userId) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    // 如果没有指定负责人，使用当前用户作为负责人
    if (!dto.leaderId) {
      dto.leaderId = userId;
    }

    const team = await this.teamService.createTeam(dto, userId);
    return {
      code: 200,
      msg: '创建团队成功',
      data: team
    };
  }

  // ========== 用户端接口（必须在 :id 路由之前定义） ==========

  @Get('my/team')
  async getMyTeam(@Request() req: any) {
    const userId = await this.getCurrentUserId(req);
    if (!userId) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    try {
      const team = await this.teamService.getUserTeam(userId);
      return {
        code: 200,
        msg: '获取我的团队成功',
        data: team
      };
    } catch (error) {
      console.error('[TeamController] Get my team error:', error);
      return {
        code: 500,
        msg: '获取团队信息失败',
        data: null
      };
    }
  }

  @Get('my/members')
  async getMyTeamMembers(@Request() req: any) {
    const userId = await this.getCurrentUserId(req);
    if (!userId) {
      return {
        code: 401,
        msg: '未授权',
        data: []
      };
    }

    try {
      const members = await this.teamService.getUserTeamMembers(userId);
      return {
        code: 200,
        msg: '获取团队成员成功',
        data: members
      };
    } catch (error) {
      console.error('[TeamController] Get my team members error:', error);
      return {
        code: 500,
        msg: '获取团队成员失败',
        data: []
      };
    }
  }

  @Get('my/statistics')
  async getMyTeamStatistics(
    @Request() req: any,
    @Query() query: TeamStatisticsQueryDto
  ) {
    const userId = await this.getCurrentUserId(req);
    if (!userId) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    try {
      const statistics = await this.teamService.getUserTeamStatistics(userId, query);
      return {
        code: 200,
        msg: '获取团队统计成功',
        data: statistics
      };
    } catch (error) {
      console.error('[TeamController] Get my team statistics error:', error);
      return {
        code: 500,
        msg: '获取团队统计失败',
        data: null
      };
    }
  }

  // ========== 团队详情与管理（在 my/* 之后定义） ==========

  @Get(':id')
  async getTeamDetail(@Param('id') id: string) {
    const team = await this.teamService.getTeamDetail(id);
    return {
      code: 200,
      msg: '获取团队详情成功',
      data: team
    };
  }

  @Put(':id')
  async updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    const team = await this.teamService.updateTeam(id, dto);
    return {
      code: 200,
      msg: '更新团队成功',
      data: team
    };
  }

  @Delete(':id')
  async deleteTeam(@Param('id') id: string) {
    await this.teamService.deleteTeam(id);
    return {
      code: 200,
      msg: '删除团队成功',
      data: null
    };
  }

  // ========== 团队成员管理 ==========

  @Get(':id/members')
  async getTeamMembers(@Param('id') id: string) {
    const members = await this.teamService.getTeamMembers(id);
    return {
      code: 200,
      msg: '获取团队成员成功',
      data: members
    };
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addTeamMember(
    @Param('id') id: string,
    @Body() dto: AddTeamMemberDto
  ) {
    const member = await this.teamService.addTeamMember(id, dto);
    return {
      code: 200,
      msg: '添加团队成员成功',
      data: member
    };
  }

  @Put(':id/members/:userId/role')
  async updateTeamMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateTeamMemberRoleDto
  ) {
    const member = await this.teamService.updateTeamMemberRole(id, userId, dto);
    return {
      code: 200,
      msg: '更新成员角色成功',
      data: member
    };
  }

  @Delete(':id/members/:userId')
  async removeTeamMember(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    await this.teamService.removeTeamMember(id, userId);
    return {
      code: 200,
      msg: '移除团队成员成功',
      data: null
    };
  }

  // ========== 团队统计 ==========

  @Get(':id/statistics')
  async getTeamStatistics(
    @Param('id') id: string,
    @Query() query: TeamStatisticsQueryDto
  ) {
    const statistics = await this.teamService.getTeamStatistics(id, query);
    return {
      code: 200,
      msg: '获取团队统计成功',
      data: statistics
    };
  }

  // ========== 私有方法 ==========

  private async getCurrentUserId(req: any): Promise<string | null> {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    
    // 首先尝试验证 token
    const payload = await this.userService.validateToken(token);
    console.log('[TeamController] Token payload:', payload);
    
    if (payload?.sub) {
      return payload.sub;
    }
    
    // 验证失败，尝试解码 token（不验证签名）用于开发测试
    try {
      const base64Payload = token.split('.')[1];
      const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      console.log('[TeamController] Decoded token payload (dev mode):', decodedPayload);
      return decodedPayload?.sub || decodedPayload?.userId || null;
    } catch (decodeError) {
      console.error('[TeamController] Token decode error:', decodeError);
      return null;
    }
  }
}
