import { Controller, Get, Put, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LexiconService } from '../database/lexicon/lexicon.service';
import { StatisticsService } from '../statistics/statistics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { ShareRecord, SharePermission } from '../share/types';
import { getSupabaseClient } from '../storage/database/supabase-client';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly lexiconService: LexiconService,
    private readonly statisticsService: StatisticsService,
  ) {}

  /**
   * 获取用户列表
   */
  @Get('users')
  async getUsers(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      console.log('========================================');
      console.log('AdminController.getUsers() 被调用');
      console.log('请求参数:', { page, pageSize, role, status, search });
      console.log('当前用户:', req.user);
      
      const pageNum = page ? parseInt(page.toString()) : 1;
      const limit = pageSize ? parseInt(pageSize.toString()) : 20;
      
      // 处理参数，避免字符串 'undefined'
      const cleanRole = role && role !== 'undefined' && role !== 'all' ? role : undefined;
      const cleanStatus = status && status !== 'undefined' && status !== 'all' ? status : undefined;
      const cleanSearch = search && search !== 'undefined' ? search : undefined;
      
      console.log('清理后的参数:', { cleanRole, cleanStatus, cleanSearch });
      
      // 直接查询数据库，绕过 userService
      console.log('直接查询数据库...');
      const client = getSupabaseClient();
      
      // 构建查询 - 默认不显示 deleted 的用户
      let query = client.from('users').select('*', { count: 'exact' });
      
      // 添加角色筛选
      if (cleanRole) {
        query = query.eq('role', cleanRole);
      }
      
      // 添加状态筛选 - 默认不显示 deleted
      if (cleanStatus) {
        query = query.eq('status', cleanStatus);
      } else {
        // 默认不显示 deleted 的用户
        query = query.neq('status', 'deleted');
      }
      
      // 添加关键词搜索
      if (cleanSearch) {
        query = query.or(`nickname.ilike.%${cleanSearch}%,employee_id.ilike.%${cleanSearch}%`);
      }
      
      // 执行查询获取数据总数
      const countResult = await query;
      const totalCount = countResult.count || 0;
      
      console.log('查询总数结果:', { 
        count: countResult.count, 
        dataLength: countResult.data?.length,
        error: countResult.error 
      });
      
      // 再查询用户数据
      const from = (pageNum - 1) * limit;
      const to = from + limit - 1;
      
      let dataQuery = client.from('users').select('*');
      
      // 添加角色筛选
      if (cleanRole) {
        dataQuery = dataQuery.eq('role', cleanRole);
      }
      
      // 添加状态筛选 - 默认不显示 deleted
      if (cleanStatus) {
        dataQuery = dataQuery.eq('status', cleanStatus);
      } else {
        // 默认不显示 deleted 的用户
        dataQuery = dataQuery.neq('status', 'deleted');
      }
      
      // 添加关键词搜索
      if (cleanSearch) {
        dataQuery = dataQuery.or(`nickname.ilike.%${cleanSearch}%,employee_id.ilike.%${cleanSearch}%`);
      }
      
      const { data: usersData, error: usersError } = await dataQuery
        .order('created_at', { ascending: false })
        .range(from, to);
      
      console.log('直接查询用户数据:', usersData?.length, 'usersError:', usersError);
      
      // 转换数据格式以匹配前端期望
      const transformedUsers = (usersData || []).map(user => ({
        id: user.id,
        username: user.nickname || '未设置昵称',
        avatar: user.avatar_url,
        role: user.role,
        status: user.status,
        employeeId: user.employee_id,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      }));

      console.log('转换后的数据:', {
        total: totalCount || 0,
        usersCount: transformedUsers.length,
      });
      console.log('========================================');

      return {
        code: 200,
        msg: 'success',
        data: {
          users: transformedUsers,
          total: totalCount || 0,
          page: pageNum,
          pageSize: limit,
        },
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return {
        code: 500,
        msg: '获取用户列表失败',
        data: null,
      };
    }
  }

  /**
   * 获取用户详情（包含档案）
   */
  @Get('users/:userId')
  async getUserDetail(@Request() req, @Param('userId') userId: string) {
    try {
      const result = await this.userService.getUserWithProfile(userId);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error) {
      console.error('获取用户详情失败:', error);
      return {
        code: 500,
        msg: '获取用户详情失败',
        data: null,
      };
    }
  }

  /**
   * 修改用户角色
   */
  @Put('users/:userId/role')
  async updateUserRole(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: { role: 'user' | 'admin' },
  ) {
    try {
      const user = await this.userService.updateUserRole(userId, body.role);

      return {
        code: 200,
        msg: '修改成功',
        data: user,
      };
    } catch (error) {
      console.error('修改用户角色失败:', error);
      return {
        code: 500,
        msg: '修改用户角色失败',
        data: null,
      };
    }
  }

  /**
   * 修改用户状态
   */
  @Put('users/:userId/status')
  async updateUserStatus(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: { status: 'active' | 'disabled' | 'deleted' | 'pending' },
  ) {
    try {
      const user = await this.userService.updateUserStatus(userId, body.status);

      return {
        code: 200,
        msg: '修改成功',
        data: user,
      };
    } catch (error) {
      console.error('修改用户状态失败:', error);
      return {
        code: 500,
        msg: '修改用户状态失败',
        data: null,
      };
    }
  }

  /**
   * 修改用户昵称
   */
  @Put('users/:userId/username')
  async updateUserNickname(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: { username: string },
  ) {
    try {
      const user = await this.userService.updateUserNickname(userId, body.username);

      return {
        code: 200,
        msg: '修改成功',
        data: user,
      };
    } catch (error) {
      console.error('修改用户昵称失败:', error);
      return {
        code: 500,
        msg: '修改用户昵称失败',
        data: null,
      };
    }
  }

  /**
   * 获取部门列表
   */
  @Get('departments')
  async getDepartments() {
    try {
      const departments = await this.userService.getDepartments();

      return {
        code: 200,
        msg: 'success',
        data: departments,
      };
    } catch (error) {
      console.error('获取部门列表失败:', error);
      return {
        code: 500,
        msg: '获取部门列表失败',
        data: null,
      };
    }
  }

  /**
   * 获取全局统计
   */
  @Get('statistics/overview')
  async getGlobalStatistics() {
    try {
      const statistics = await this.statisticsService.getGlobalStatistics();
      return {
        code: 200,
        msg: 'success',
        data: statistics,
      };
    } catch (error) {
      console.error('获取全局统计失败:', error);
      return {
        code: 500,
        msg: '获取全局统计失败',
        data: null,
      };
    }
  }

  /**
   * 获取待审核用户数量
   */
  @Get('pending-users/count')
  async getPendingUsersCount() {
    try {
      const client = getSupabaseClient();
      const { count, error } = await client
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) {
        console.error('获取待审核用户数量失败:', error);
        return {
          code: 500,
          msg: '获取待审核用户数量失败',
          data: null,
        };
      }

      return {
        code: 200,
        msg: 'success',
        data: {
          count: count || 0,
        },
      };
    } catch (error) {
      console.error('获取待审核用户数量失败:', error);
      return {
        code: 500,
        msg: '获取待审核用户数量失败',
        data: null,
      };
    }
  }

  /**
   * 设置语料库全局共享
   */
  @Post('lexicons/:lexiconId/force-share')
  async forceShareLexicon(
    @Request() req,
    @Param('lexiconId') lexiconId: string,
    @Body() body: { isGloballyShared: boolean },
  ) {
    try {
      const adminId = req.user.sub;
      const result = await this.lexiconService.forceShareLexicon(
        adminId,
        lexiconId,
        body.isGloballyShared,
      );

      return {
        code: 200,
        msg: body.isGloballyShared ? '设置全局共享成功' : '取消全局共享成功',
        data: result,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message,
        data: null,
      };
    }
  }

  /**
   * 获取所有共享记录
   */
  @Get('share/all-records')
  async getAllShareRecords(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    try {
      const adminId = req.user.sub;
      const records = await this.lexiconService.getAllShareRecords(
        adminId,
        page ? parseInt(page.toString()) : 1,
        pageSize ? parseInt(pageSize.toString()) : 50,
      );

      return {
        code: 200,
        msg: 'success',
        data: records,
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message,
        data: null,
      };
    }
  }

  /**
   * 批量设置全局共享
   */
  @Post('share/batch-set-global')
  async batchSetGlobalShare(
    @Request() req,
    @Body() body: { lexiconIds: string[]; isGloballyShared: boolean },
  ) {
    try {
      const adminId = req.user.sub;
      const { lexiconIds, isGloballyShared } = body;

      if (!lexiconIds || lexiconIds.length === 0) {
        return {
          code: 400,
          msg: '请选择要操作的语料库',
          data: null,
        };
      }

      // 批量处理
      const results = await Promise.allSettled(
        lexiconIds.map((lexiconId) =>
          this.lexiconService.forceShareLexicon(adminId, lexiconId, isGloballyShared),
        ),
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failCount = results.filter((r) => r.status === 'rejected').length;

      return {
        code: 200,
        msg: isGloballyShared
          ? `成功设置 ${successCount} 个，失败 ${failCount} 个`
          : `成功取消 ${successCount} 个，失败 ${failCount} 个`,
        data: {
          total: lexiconIds.length,
          successCount,
          failCount,
        },
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message,
        data: null,
      };
    }
  }

  /**
   * 获取共享统计
   */
  @Get('share/stats')
  async getShareStats(@Request() req) {
    try {
      const adminId = req.user.sub;
      const client = getSupabaseClient();

      // 获取总语料库数
      const { count: totalLexicons } = await client
        .from('lexicons')
        .select('id', { count: 'exact', head: true });

      // 获取共享的语料库数
      const { count: sharedLexicons } = await client
        .from('lexicons')
        .select('id', { count: 'exact', head: true })
        .eq('is_shared', true);

      // 获取全局共享的语料库数
      const { count: globalShared } = await client
        .from('share_permissions')
        .select('id', { count: 'exact', head: true })
        .eq('is_globally_shared', true);

      // 获取最近7天的共享操作数
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentShareActions } = await client
        .from('share_history')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // 获取共享类型的分布
      const { data: shareByScope } = await client
        .from('lexicons')
        .select('share_scope')
        .eq('is_shared', true);

      const shareScopeStats = shareByScope?.reduce((acc: any, item: any) => {
        acc[item.share_scope] = (acc[item.share_scope] || 0) + 1;
        return acc;
      }, {});

      return {
        code: 200,
        msg: 'success',
        data: {
          totalLexicons: totalLexicons || 0,
          sharedLexicons: sharedLexicons || 0,
          globalShared: globalShared || 0,
          recentShareActions: recentShareActions || 0,
          shareScopeStats: shareScopeStats || {},
        },
      };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return {
        code: statusCode,
        msg: error.message,
        data: null,
      };
    }
  }
}
