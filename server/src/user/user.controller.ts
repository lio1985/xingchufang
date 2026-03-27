import { Controller, Post, Body, Get, Put, Request, Query, ParseIntPipe, HttpException, HttpStatus, BadRequestException, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { parseOptionalUUID } from '../utils/uuid.util';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 检查/创建用户
   * 根据 openid 查询用户，不存在则自动创建
   */
  @Post('check-user')
  async checkUser(@Body() body: { openid: string; nickname?: string }) {
    console.log('收到检查用户请求:', { openid: body.openid, nickname: body.nickname });

    // 1. 校验 openid 是否为空
    if (!body.openid) {
      return {
        success: false,
        code: 400,
        msg: 'openid 不能为空',
        data: null
      };
    }

    try {
      // 2. 调用 service 检查/创建用户
      const result = await this.userService.checkOrCreateUser({
        openid: body.openid,
        nickname: body.nickname
      });

      return {
        success: true,
        code: 200,
        msg: result.type === 'existing' ? '用户已存在' : '用户创建成功',
        data: result
      };
    } catch (error) {
      console.error('检查/创建用户失败:', error);
      return {
        success: false,
        code: 500,
        msg: error.message || '检查/创建用户失败',
        data: null
      };
    }
  }

  /**
   * 微信登录
   */
  @Post('login')
  async login(@Body() body: { code: string }) {
    console.log('收到登录请求，code:', body.code);

    if (!body.code) {
      return {
        code: 400,
        msg: '缺少登录凭证',
        data: null
      };
    }

    try {
      const result = await this.userService.wechatLogin(body.code);

      return {
        code: 200,
        msg: '登录成功',
        data: result
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        code: 401,
        msg: error.message || '登录失败',
        data: null
      };
    }
  }

  /**
   * 账号密码登录
   */
  @Post('login-with-password')
  async loginWithPassword(@Body() body: { username: string; password: string }) {
    console.log('收到账号密码登录请求:', { username: body.username });

    if (!body.username || !body.password) {
      return {
        success: false,
        code: 400,
        msg: '账号和密码不能为空',
        data: null
      };
    }

    try {
      const result = await this.userService.loginWithPassword(body.username, body.password);

      return {
        success: true,
        code: 200,
        msg: '登录成功',
        data: result
      };
    } catch (error) {
      console.error('账号密码登录失败:', error);
      return {
        success: false,
        code: 401,
        msg: error.message || '登录失败',
        data: null
      };
    }
  }

  /**
   * 用户注册
   */
  @Post('register')
  async register(@Body() body: { username: string; password: string; nickname?: string }) {
    console.log('收到注册请求:', { username: body.username });

    if (!body.username || !body.password) {
      return {
        success: false,
        code: 400,
        msg: '账号和密码不能为空',
        data: null
      };
    }

    try {
      const result = await this.userService.register(body.username, body.password, body.nickname);

      return {
        success: true,
        code: 200,
        msg: '注册成功，请等待管理员审核',
        data: result
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        success: false,
        code: error.status || 500,
        msg: error.message || '注册失败',
        data: null
      };
    }
  }

  /**
   * 修改密码
   */
  @Post('change-password')
  async changePassword(@Request() req, @Body() body: { oldPassword: string; newPassword: string }) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        success: false,
        code: 401,
        msg: 'Token 无效或已过期',
        data: null
      };
    }

    if (!body.oldPassword || !body.newPassword) {
      return {
        success: false,
        code: 400,
        msg: '原密码和新密码不能为空',
        data: null
      };
    }

    try {
      await this.userService.changePassword(payload.sub, body.oldPassword, body.newPassword);

      return {
        success: true,
        code: 200,
        msg: '密码修改成功',
        data: null
      };
    } catch (error) {
      console.error('修改密码失败:', error);
      return {
        success: false,
        code: error.status || 500,
        msg: error.message || '修改密码失败',
        data: null
      };
    }
  }

  /**
   * 重置密码（无需登录，用于登录页修改密码）
   */
  @Post('reset-password')
  async resetPassword(@Body() body: { userId: string; newPassword: string }) {
    console.log('收到重置密码请求:', { userId: body.userId });

    if (!body.userId || !body.newPassword) {
      return {
        success: false,
        code: 400,
        msg: '用户ID和新密码不能为空',
        data: null
      };
    }

    if (body.newPassword.length < 6) {
      return {
        success: false,
        code: 400,
        msg: '新密码长度至少6位',
        data: null
      };
    }

    try {
      await this.userService.resetPassword(body.userId, body.newPassword);

      return {
        success: true,
        code: 200,
        msg: '密码修改成功',
        data: null
      };
    } catch (error) {
      console.error('重置密码失败:', error);
      return {
        success: false,
        code: error.status || 500,
        msg: error.message || '重置密码失败',
        data: null
      };
    }
  }

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  async getProfile(@Request() req) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      const user = await this.userService.findById(payload.sub);

      if (!user) {
        return {
          code: 404,
          msg: '用户不存在',
          data: null
        };
      }

      return {
        code: 200,
        msg: 'success',
        data: {
          id: user.id,
          openid: user.openid,
          employeeId: user.employee_id,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          role: user.role,
          status: user.status,
        }
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return {
        code: 500,
        msg: '获取用户信息失败',
        data: null
      };
    }
  }

  /**
   * 获取当前用户档案
   */
  @Get('profile/detail')
  async getProfileDetail(@Request() req) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      const profile = await this.userService.getUserProfile(payload.sub);

      return {
        code: 200,
        msg: 'success',
        data: profile
      };
    } catch (error) {
      console.error('获取用户档案失败:', error);
      return {
        code: 500,
        msg: '获取用户档案失败',
        data: null
      };
    }
  }

  /**
   * 更新当前用户档案
   */
  @Put('profile/detail')
  async updateProfileDetail(@Request() req, @Body() body: any) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      const profile = await this.userService.updateUserProfile(payload.sub, body);

      return {
        code: 200,
        msg: '更新成功',
        data: profile
      };
    } catch (error) {
      console.error('更新用户档案失败:', error);
      return {
        code: 500,
        msg: '更新用户档案失败',
        data: null
      };
    }
  }

  /**
   * 获取部门列表（管理员功能）
   */
  @Get('departments')
  async getDepartments(@Request() req) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload || payload.role !== 'admin') {
      return {
        code: 403,
        msg: '权限不足',
        data: null
      };
    }

    try {
      const departments = await this.userService.getDepartments();

      return {
        code: 200,
        msg: 'success',
        data: departments
      };
    } catch (error) {
      console.error('获取部门列表失败:', error);
      return {
        code: 500,
        msg: '获取部门列表失败',
        data: null
      };
    }
  }

  /**
   * 审核用户（管理员功能）
   */
  @Post('audit')
  async auditUser(
    @Request() req,
    @Body() body: { userId: string; status: 'active' | 'disabled' }
  ) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        success: false,
        code: 401,
        msg: 'Token 无效或已过期',
        data: null
      };
    }

    if (payload.role !== 'admin') {
      return {
        success: false,
        code: 403,
        msg: '权限不足，仅管理员可审核用户',
        data: null
      };
    }

    if (!body.userId || !body.status) {
      return {
        success: false,
        code: 400,
        msg: '用户ID和状态不能为空',
        data: null
      };
    }

    if (body.status !== 'active' && body.status !== 'disabled') {
      return {
        success: false,
        code: 400,
        msg: '状态只能是 active 或 disabled',
        data: null
      };
    }

    try {
      await this.userService.auditUser(body.userId, body.status, payload.sub);

      return {
        success: true,
        code: 200,
        msg: body.status === 'active' ? '审核通过' : '已禁用该用户',
        data: null
      };
    } catch (error) {
      console.error('审核用户失败:', error);
      return {
        success: false,
        code: error.status || 500,
        msg: error.message || '审核失败',
        data: null
      };
    }
  }

  /**
   * 开发环境专用：一键将自己提升为管理员
   * 注意：此接口仅用于开发环境，生产环境请移除
   */
  @Post('become-admin')
  async becomeAdmin(@Request() req) {
    console.log('收到become-admin请求');
    console.log('Headers:', JSON.stringify(req.headers));

    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization header缺失或格式错误');
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    console.log('提取的token:', token);

    const payload = await this.userService.validateToken(token);
    console.log('Token验证结果:', payload);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      const user = await this.userService.updateUserRole(payload.sub, 'admin');

      return {
        code: 200,
        msg: '已提升为管理员',
        data: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          role: user.role,
        }
      };
    } catch (error) {
      console.error('提升为管理员失败:', error);
      return {
        code: 500,
        msg: '提升为管理员失败',
        data: null
      };
    }
  }

  /**
   * 获取用户统计数据（管理员功能）
   */
  @Get('statistics')
  async getUserStatistics(@Request() req, @Query('userId') targetUserId?: string) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      // 验证 targetUserId 参数（如果是非法字符串会抛出 400 错误）
      const validatedTargetUserId = parseOptionalUUID(targetUserId, 'userId');

      const statistics = await this.userService.getUserStatistics(payload.sub, validatedTargetUserId || payload.sub);

      return {
        code: 200,
        msg: 'success',
        data: statistics
      };
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
      return {
        code: 500,
        msg: '获取用户统计数据失败',
        data: null
      };
    }
  }

  /**
   * 获取用户操作日志（管理员功能）
   */
  @Get('operation-logs')
  async getOperationLogs(
    @Request() req,
    @Query('userId') targetUserId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('action') action?: string,
  ) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      const logs = await this.userService.getOperationLogs(payload.sub, {
        userId: targetUserId,
        page,
        limit: pageSize,
        action,
      });

      return {
        code: 200,
        msg: 'success',
        data: logs
      };
    } catch (error) {
      console.error('获取操作日志失败:', error);
      return {
        code: 500,
        msg: '获取操作日志失败',
        data: null
      };
    }
  }

  /**
   * 初始化预设账号（管理员和测试账号）
   * POST /api/user/init-default-accounts
   * 用于系统首次部署时创建默认账号
   */
  @Post('init-default-accounts')
  async initDefaultAccounts() {
    console.log('收到初始化预设账号请求');

    try {
      const result = await this.userService.initDefaultAccounts();

      return {
        success: true,
        code: 200,
        msg: '预设账号初始化成功',
        data: {
          admin: {
            username: 'admin',
            password: 'Admin@2025!Secure',
            role: result.admin.role,
            status: result.admin.status,
          },
          test: {
            username: 'test2026',
            password: 'test123456',
            role: result.test.role,
            status: result.test.status,
          },
        }
      };
    } catch (error) {
      console.error('初始化预设账号失败:', error);
      return {
        success: false,
        code: 500,
        msg: error.message || '初始化预设账号失败',
        data: null
      };
    }
  }

  /**
   * 上传头像
   * POST /api/user/upload-avatar
   */
  @Post('upload-avatar')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    console.log('收到上传头像请求');
    console.log('文件信息:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      hasBuffer: !!file?.buffer,
      hasPath: !!file?.path,
    });

    // 验证登录状态
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    // 验证文件
    if (!file) {
      return {
        code: 400,
        msg: '请选择要上传的头像图片',
        data: null
      };
    }

    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        code: 400,
        msg: '只支持 JPG、PNG、GIF、WebP 格式的图片',
        data: null
      };
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        code: 400,
        msg: '图片大小不能超过 5MB',
        data: null
      };
    }

    try {
      // 获取文件内容（支持小程序 file.path 和 H5 file.buffer）
      let fileBuffer: Buffer;
      if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.path) {
        const fs = await import('fs/promises');
        fileBuffer = await fs.readFile(file.path);
      } else {
        return {
          code: 400,
          msg: '无法读取文件内容',
          data: null
        };
      }

      // 调用 service 上传头像
      const result = await this.userService.updateAvatar(payload.sub, fileBuffer, file.originalname, file.mimetype);

      return {
        code: 200,
        msg: '头像上传成功',
        data: result
      };
    } catch (error) {
      console.error('上传头像失败:', error);
      return {
        code: 500,
        msg: error.message || '上传头像失败',
        data: null
      };
    }
  }

  /**
   * 更新在线状态
   * POST /api/user/online-status
   */
  @Post('online-status')
  async updateOnlineStatus(@Request() req, @Body() body: { isOnline: boolean }) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      await this.userService.updateOnlineStatus(payload.sub, body.isOnline);

      return {
        code: 200,
        msg: '状态更新成功',
        data: null
      };
    } catch (error) {
      console.error('更新在线状态失败:', error);
      return {
        code: 500,
        msg: '更新在线状态失败',
        data: null
      };
    }
  }

  /**
   * 获取用户在线状态
   * GET /api/user/online-status?userId=xxx
   */
  @Get('online-status')
  async getOnlineStatus(@Request() req, @Query('userId') targetUserId?: string) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    try {
      const userId = targetUserId || payload.sub;
      const status = await this.userService.getOnlineStatus(userId);

      return {
        code: 200,
        msg: 'success',
        data: status
      };
    } catch (error) {
      console.error('获取在线状态失败:', error);
      return {
        code: 500,
        msg: '获取在线状态失败',
        data: null
      };
    }
  }

  /**
   * 批量获取用户在线状态
   * POST /api/user/online-status/batch
   */
  @Post('online-status/batch')
  async getBatchOnlineStatus(@Request() req, @Body() body: { userIds: string[] }) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        code: 401,
        msg: '未授权',
        data: null
      };
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      return {
        code: 401,
        msg: '无效的登录凭证',
        data: null
      };
    }

    if (!body.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0) {
      return {
        code: 400,
        msg: 'userIds 不能为空',
        data: null
      };
    }

    try {
      const statusMap = await this.userService.getBatchOnlineStatus(body.userIds);

      return {
        code: 200,
        msg: 'success',
        data: statusMap
      };
    } catch (error) {
      console.error('批量获取在线状态失败:', error);
      return {
        code: 500,
        msg: '批量获取在线状态失败',
        data: null
      };
    }
  }
}
