import { Injectable, NotFoundException, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { JwtUtil, TokenPayload } from '../utils/jwt.util';
import { Logger } from '@nestjs/common';

export interface User {
  id: string;
  openid: string;
  nickname?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled' | 'deleted' | 'pending';
  unionid?: string;
  employee_id?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  real_name?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  company?: string;
  employee_id?: string;
  gender?: string;
  birthday?: string;
  address?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    openid: string;
    employeeId?: string;
    nickname?: string;
    avatarUrl?: string;
    role: string;
    status: string;
  };
}

export interface UpdateUserDto {
  nickname?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'disabled' | 'deleted' | 'pending';
}

export interface UpdateUserProfileDto {
  real_name?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  company?: string;
  employee_id?: string;
  gender?: string;
  birthday?: string;
  address?: string;
  bio?: string;
}

@Injectable()
export class UserService {
  private client = getSupabaseClient();
  private readonly logger = new Logger(UserService.name);

  /**
   * 生成唯一的6位数员工ID
   */
  private async generateUniqueEmployeeId(): Promise<string> {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      // 生成6位随机数 (100000-999999)
      const employeeId = (Math.floor(Math.random() * 900000) + 100000).toString();
      
      // 检查是否已存在
      const { data, error } = await this.client
        .from('users')
        .select('id')
        .eq('employee_id', employeeId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // 没有找到记录，说明这个ID可用
        return employeeId;
      } else if (!error && data) {
        // ID已存在，继续尝试
        continue;
      } else if (error) {
        // 其他错误
        this.logger.error('检查员工ID时出错:', error);
        throw new Error('生成员工ID失败');
      }
    }
    throw new Error('无法生成唯一的员工ID，请稍后重试');
  }

  /**
   * 微信登录
   */
  async wechatLogin(code: string): Promise<LoginResponse> {
    this.logger.log('收到登录请求，code:', code);

    // 调用微信 API 获取 openid
    let openid: string;
    let unionid: string | undefined;

    // H5 环境模拟登录检测：如果 code 以 mock_code_ 开头，直接使用模拟登录
    if (code.startsWith('mock_code_')) {
      this.logger.warn('检测到 H5 环境模拟登录，跳过微信 API 调用');
      openid = `mock_openid_${code}`;
      unionid = undefined;
    } else {
      // 真实微信登录：调用微信 API 获取 openid
      try {
        const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.TARO_APP_WEAPP_APPID}&secret=${process.env.WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;

        this.logger.log('调用微信 API:', wxUrl);

        const wxResponse = await fetch(wxUrl);
        const wxData = await wxResponse.json();

        this.logger.log('微信 API 响应:', wxData);

        if (wxData.errcode) {
          this.logger.error('微信 API 错误:', wxData);
          throw new HttpException(`微信登录失败: ${wxData.errmsg}`, HttpStatus.UNAUTHORIZED);
        }

        openid = wxData.openid;
        unionid = wxData.unionid;

        if (!openid) {
          this.logger.error('微信 API 未返回 openid');
          throw new HttpException('微信登录失败：未获取到 openid', HttpStatus.UNAUTHORIZED);
        }
      } catch (error: any) {
        this.logger.error('调用微信 API 失败:', error);

        // 开发环境降级：使用模拟 openid
        if (process.env.NODE_ENV === 'development' || !process.env.TARO_APP_WEAPP_APPID) {
          this.logger.warn('开发环境：使用模拟 openid');
          openid = `mock_openid_${code}`;
          unionid = undefined;
        } else {
          throw new HttpException('微信登录失败', HttpStatus.UNAUTHORIZED);
        }
      }
    }

    // 查找或创建用户
    const { data: existingUsers, error: findError } = await this.client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .limit(1);

    if (findError) {
      this.logger.error('查询用户失败:', findError);
      throw new HttpException('数据库查询失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let user: any;

    if (!existingUsers || existingUsers.length === 0) {
      // 生成唯一的6位数员工ID
      const employeeId = await this.generateUniqueEmployeeId();
      
      // 检查是否是超级管理员（通过环境变量配置）
      const superAdminOpenid = process.env.SUPER_ADMIN_OPENID;
      const isSuperAdmin = superAdminOpenid && openid === superAdminOpenid;

      // H5 环境模拟登录：自动设置为 admin（最简单的方案）
      const isH5MockLogin = code.startsWith('mock_code_');

      // 创建新用户
      const now = new Date().toISOString();
      const newUser = {
        openid,
        unionid,
        employee_id: employeeId,
        nickname: `用户${Math.random().toString(36).substr(2, 6)}`,
        role: (isSuperAdmin || isH5MockLogin) ? 'admin' : 'user', // H5 环境自动设置为 admin
        status: 'active', // 临时方案：所有新用户默认为active，待数据库约束修改后支持pending状态
        created_at: now,
        updated_at: now,
      };

      if (isSuperAdmin) {
        this.logger.log(`超级管理员自动激活: ${openid}`);
      }

      if (isH5MockLogin) {
        this.logger.log(`H5 环境模拟登录，自动设置为管理员: ${openid}`);
      }

      const { data: createdUsers, error: createError } = await this.client
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        this.logger.error('创建用户失败:', createError);
        throw new HttpException('创建用户失败', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      user = createdUsers;
      this.logger.log(`新用户注册，用户ID: ${user.id}`);
    } else {
      user = existingUsers[0];
      this.logger.log(`用户登录，用户ID: ${user.id}`);
    }

    // 更新最后登录时间
    await this.client
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // 使用JWT生成安全的token
    const tokenPayload: Omit<TokenPayload, 'sub'> = {
      userId: user.id,
      openid: user.openid,
      role: user.role,
      status: user.status,
    };
    const token = JwtUtil.generateToken(tokenPayload);

    this.logger.log(`用户登录成功，用户ID: ${user.id}`);

    // 返回 token 和用户信息
    return {
      token,
      user: {
        id: user.id,
        openid: user.openid,
        employeeId: user.employee_id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * 根据 openid 查找用户
   */
  async findByOpenid(openid: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.logger.error('查询用户失败:', error);
      throw new HttpException('数据库查询失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.logger.error('查询用户失败:', error);
      throw new HttpException('数据库查询失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  /**
   * 验证 Token
   */
  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      return JwtUtil.verifyToken(token);
    } catch (error) {
      this.logger.error('Token 验证失败:', error);
      return null;
    }
  }

  /**
   * 获取用户档案
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 档案不存在，创建默认档案
        const now = new Date().toISOString();
        const newProfile = {
          user_id: userId,
          created_at: now,
          updated_at: now,
        };

        const { data: createdProfile, error: createError } = await this.client
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          this.logger.error('创建用户档案失败:', createError);
          throw new HttpException('创建用户档案失败', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return createdProfile;
      }

      this.logger.error('查询用户档案失败:', error);
      throw new HttpException('查询用户档案失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  /**
   * 更新用户档案
   */
  async updateUserProfile(userId: string, profileData: UpdateUserProfileDto): Promise<UserProfile> {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('更新用户档案失败:', error);
      throw new HttpException('更新用户档案失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  /**
   * 获取所有用户（管理员功能）
   */
  async getAllUsers(
    page: number = 1,
    pageSize: number = 20,
    role?: 'user' | 'admin',
    status?: 'active' | 'disabled' | 'deleted' | 'pending',
    search?: string
  ): Promise<{ users: User[]; total: number }> {
    let query = this.client
      .from('users')
      .select('*', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`nickname.ilike.%${search}%,openid.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('获取用户列表失败:', error);
      throw new HttpException('获取用户列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      users: data || [],
      total: count || 0,
    };
  }

  /**
   * 更新用户角色（管理员功能）
   */
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('users')
      .update({ role, updated_at: now })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('更新用户角色失败:', error);
      throw new HttpException('更新用户角色失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  /**
   * 更新用户状态（管理员功能）
   */
  async updateUserStatus(userId: string, status: 'active' | 'disabled' | 'deleted' | 'pending'): Promise<User> {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('users')
      .update({ status, updated_at: now })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('更新用户状态失败:', error);
      throw new HttpException('更新用户状态失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  /**
   * 更新用户昵称（管理员功能）
   */
  async updateUserNickname(userId: string, nickname: string): Promise<User> {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from('users')
      .update({ nickname, updated_at: now })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error('更新用户昵称失败:', error);
      throw new HttpException('更新用户昵称失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  /**
   * 检查用户是否是管理员
   */
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      return false;
    }
    return user.role === 'admin';
  }

  /**
   * 获取用户列表（管理员功能）
   */
  async getUserList(options: {
    page?: number;
    limit?: number;
    role?: 'user' | 'admin' | 'all';
    status?: 'active' | 'disabled' | 'deleted' | 'pending' | 'all';
    keyword?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20, role, status, keyword } = options;

    let query = this.client.from('users').select('*', { count: 'exact' });

    // 角色筛选
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 关键字搜索
    if (keyword) {
      query = query.or(`nickname.ilike.%${keyword}%,openid.ilike.%${keyword}%,employee_id.ilike.%${keyword}%`);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    // 分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('获取用户列表失败:', error);
      throw new HttpException('获取用户列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      users: data || [],
      total: count || 0,
    };
  }

  /**
   * 获取用户及其档案（管理员功能）
   */
  async getUserWithProfile(userId: string): Promise<{ user: User; profile: UserProfile | null } | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const profile = await this.getUserProfile(userId);

    return { user, profile };
  }

  /**
   * 获取部门列表
   */
  async getDepartments(): Promise<string[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('department')
      .not('department', 'is', null)
      .not('department', 'eq', '');

    if (error) {
      this.logger.error('获取部门列表失败:', error);
      throw new HttpException('获取部门列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 去重并返回
    const departments = [...new Set(data.map((item: any) => item.department).filter(Boolean))];
    return departments;
  }

  /**
   * 获取用户统计信息
   */
  async getUserStatistics(currentUserId: string, targetUserId: string): Promise<any> {
    // 检查权限：管理员可以查看所有用户的统计，普通用户只能查看自己的
    const isAdminUser = await this.isAdmin(currentUserId);
    if (!isAdminUser && currentUserId !== targetUserId) {
      throw new HttpException('无权限查看', HttpStatus.FORBIDDEN);
    }

    // 获取用户信息
    const user = await this.findById(targetUserId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取用户档案
    const profile = await this.getUserProfile(targetUserId);

    // 统计对话数
    const { count: conversationCount } = await this.client
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // 统计消息数
    const { count: messageCount } = await this.client
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // 统计语料库数
    const { count: lexiconCount } = await this.client
      .from('lexicons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // 统计文件数
    const { count: fileCount } = await this.client
      .from('multimedia')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // 统计任务数
    const { count: taskCount } = await this.client
      .from('scheduled_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    return {
      user,
      profile,
      statistics: {
        conversationCount: conversationCount || 0,
        messageCount: messageCount || 0,
        lexiconCount: lexiconCount || 0,
        fileCount: fileCount || 0,
        taskCount: taskCount || 0,
      },
    };
  }

  /**
   * 获取操作日志
   */
  async getOperationLogs(
    currentUserId: string,
    options: {
      page?: number;
      limit?: number;
      userId?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ logs: any[]; total: number }> {
    const { page = 1, limit = 20, userId, action, startDate, endDate } = options;

    // 检查权限
    const isAdminUser = await this.isAdmin(currentUserId);
    if (!isAdminUser && userId && userId !== currentUserId) {
      throw new HttpException('无权限查看', HttpStatus.FORBIDDEN);
    }

    let query = this.client.from('operation_logs').select('*', { count: 'exact' });

    // 用户筛选（如果不是管理员，只能查看自己的）
    const targetUserId = isAdminUser && userId && userId.trim() !== '' ? userId : currentUserId;
    if (targetUserId && targetUserId.trim() !== '') {
      query = query.eq('user_id', targetUserId);
    }

    // 操作类型筛选
    if (action) {
      query = query.eq('action', action);
    }

    // 时间范围筛选
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    // 分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('获取操作日志失败:', error);
      throw new HttpException('获取操作日志失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      logs: data || [],
      total: count || 0,
    };
  }

  /**
   * 检查或创建用户
   * 根据 openid 查询用户，不存在则自动创建
   */
  async checkOrCreateUser(params: {
    openid: string;
    nickname?: string;
  }): Promise<{
    type: 'existing' | 'created';
    user: {
      id: string;
      openid: string;
      employeeId?: string;
      nickname?: string;
      avatarUrl?: string;
      role: string;
      status: string;
    };
    token?: string;
  }> {
    const { openid, nickname } = params;

    this.logger.log(`检查用户: openid=${openid}`);

    // 1. 按 openid 查询用户
    const { data: existingUsers, error: findError } = await this.client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .limit(1);

    if (findError) {
      this.logger.error('查询用户失败:', findError);
      throw new HttpException('数据库查询失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let user: any;
    let type: 'existing' | 'created';

    if (existingUsers && existingUsers.length > 0) {
      // 用户已存在
      user = existingUsers[0];
      type = 'existing';
      this.logger.log(`用户已存在: ${user.id}`);

      // 更新最后登录时间
      await this.client
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);
    } else {
      // 用户不存在，创建新用户
      type = 'created';

      // 生成唯一的6位数员工ID
      const employeeId = await this.generateUniqueEmployeeId();

      // 检查是否是超级管理员（通过环境变量配置）
      const superAdminOpenid = process.env.SUPER_ADMIN_OPENID;
      const isSuperAdmin = superAdminOpenid && openid === superAdminOpenid;

      // H5 环境模拟登录：自动设置为 admin
      const isH5MockLogin = openid.startsWith('mock_openid_');

      // 创建新用户
      const now = new Date().toISOString();
      const newUser = {
        openid,
        employee_id: employeeId,
        nickname: nickname || '微信用户',
        role: (isSuperAdmin || isH5MockLogin) ? 'admin' : 'user',
        status: 'active',
        created_at: now,
        updated_at: now,
      };

      if (isSuperAdmin) {
        this.logger.log(`超级管理员自动创建: ${openid}`);
      }

      if (isH5MockLogin) {
        this.logger.log(`H5 环境模拟登录，自动设置为管理员: ${openid}`);
      }

      const { data: createdUsers, error: createError } = await this.client
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        this.logger.error('创建用户失败:', createError);
        throw new HttpException('创建用户失败', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      user = createdUsers;
      this.logger.log(`新用户创建成功: ${user.id}`);
    }

    // 生成 JWT token
    const tokenPayload: Omit<TokenPayload, 'sub'> = {
      userId: user.id,
      openid: user.openid,
      role: user.role,
      status: user.status,
    };
    const token = JwtUtil.generateToken(tokenPayload);

    return {
      type,
      user: {
        id: user.id,
        openid: user.openid,
        employeeId: user.employee_id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  /**
   * 账号密码登录（支持注册用户）
   */
  async loginWithPassword(username: string, password: string): Promise<{ user: any; token: string }> {
    this.logger.log(`账号密码登录: ${username}`);

    // 查找用户
    const openid = `pwd_${username}`;
    const { data: users, error: findError } = await this.client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .limit(1);

    if (findError) {
      this.logger.error('查询用户失败:', findError);
      throw new HttpException('数据库查询失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 检查用户是否存在
    if (!users || users.length === 0) {
      // 兼容旧固定账号
      const validAccounts: Record<string, { password: string; role: 'admin' | 'user'; nickname: string }> = {
        'admin': { password: 'admin123', role: 'admin', nickname: '管理员' },
        'user': { password: 'user123', role: 'user', nickname: '普通用户' },
      };
      const account = validAccounts[username];
      if (account && account.password === password) {
        // 创建旧账号用户
        const employeeId = await this.generateUniqueEmployeeId();
        const now = new Date().toISOString();
        const newUser = {
          openid,
          employee_id: employeeId,
          nickname: account.nickname,
          role: account.role,
          status: 'active',
          password,
          created_at: now,
          updated_at: now,
        };
        const { data: createdUser, error: createError } = await this.client
          .from('users')
          .insert(newUser)
          .select()
          .single();
        if (createError) {
          this.logger.error('创建用户失败:', createError);
          throw new HttpException('登录失败', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // 生成 JWT token
        const tokenPayload: Omit<TokenPayload, 'sub'> = {
          userId: createdUser.id,
          openid: createdUser.openid,
          role: createdUser.role,
          status: createdUser.status,
        };
        const token = JwtUtil.generateToken(tokenPayload);
        return {
          user: {
            id: createdUser.id,
            openid: createdUser.openid,
            employeeId: createdUser.employee_id,
            nickname: createdUser.nickname,
            avatarUrl: createdUser.avatar_url,
            role: createdUser.role,
            status: createdUser.status,
          },
          token,
        };
      }
      throw new HttpException('账号不存在', HttpStatus.UNAUTHORIZED);
    }

    const user = users[0];

    // 验证密码
    if (user.password !== password) {
      throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
    }

    // 检查用户状态
    if (user.status === 'pending') {
      throw new HttpException('账号正在等待管理员审核，请耐心等待', HttpStatus.FORBIDDEN);
    }

    if (user.status === 'disabled') {
      throw new HttpException('账号已被禁用，请联系管理员', HttpStatus.FORBIDDEN);
    }

    if (user.status === 'deleted') {
      throw new HttpException('账号已注销', HttpStatus.FORBIDDEN);
    }

    // 更新最后登录时间
    await this.client
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // 生成 JWT token
    const tokenPayload: Omit<TokenPayload, 'sub'> = {
      userId: user.id,
      openid: user.openid,
      role: user.role,
      status: user.status,
    };
    const token = JwtUtil.generateToken(tokenPayload);

    return {
      user: {
        id: user.id,
        openid: user.openid,
        employeeId: user.employee_id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        role: user.role,
        status: user.status,
      },
      token,
    };
  }

  /**
   * 用户注册
   */
  async register(username: string, password: string, nickname?: string): Promise<{ user: any }> {
    this.logger.log(`用户注册: ${username}`);

    // 验证账号和密码
    if (!username || username.length < 3) {
      throw new HttpException('账号长度至少3位', HttpStatus.BAD_REQUEST);
    }
    if (!password || password.length < 6) {
      throw new HttpException('密码长度至少6位', HttpStatus.BAD_REQUEST);
    }

    // 检查账号是否已存在
    const openid = `pwd_${username}`;
    const { data: existingUsers, error: findError } = await this.client
      .from('users')
      .select('*')
      .eq('openid', openid)
      .limit(1);

    if (findError) {
      this.logger.error('查询用户失败:', findError);
      throw new HttpException('数据库查询失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (existingUsers && existingUsers.length > 0) {
      throw new HttpException('账号已被注册', HttpStatus.CONFLICT);
    }

    // 创建新用户，状态为 pending（等待审核）
    const employeeId = await this.generateUniqueEmployeeId();
    const now = new Date().toISOString();
    const newUser = {
      openid,
      employee_id: employeeId,
      nickname: nickname || username,
      role: 'user',
      status: 'pending', // 新注册用户需要审核
      password, // 明文存储密码（生产环境应加密）
      created_at: now,
      updated_at: now,
    };

    const { data: createdUser, error: createError } = await this.client
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (createError) {
      this.logger.error('创建用户失败:', createError);
      throw new HttpException('注册失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`新用户注册成功: ${createdUser.id}`);

    return {
      user: {
        id: createdUser.id,
        employeeId: createdUser.employee_id,
        nickname: createdUser.nickname,
        role: createdUser.role,
        status: createdUser.status,
      },
    };
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    this.logger.log(`修改密码: ${userId}`);

    // 验证新密码
    if (!newPassword || newPassword.length < 6) {
      throw new HttpException('新密码长度至少6位', HttpStatus.BAD_REQUEST);
    }

    // 查询用户
    const { data: user, error: findError } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (findError || !user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }

    // 验证旧密码
    if (user.password !== oldPassword) {
      throw new HttpException('原密码错误', HttpStatus.UNAUTHORIZED);
    }

    // 更新密码
    const { error: updateError } = await this.client
      .from('users')
      .update({ password: newPassword, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      this.logger.error('修改密码失败:', updateError);
      throw new HttpException('修改密码失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`密码修改成功: ${userId}`);
  }

  /**
   * 管理员审核用户
   */
  async auditUser(userId: string, status: 'active' | 'disabled', operatorId: string): Promise<void> {
    this.logger.log(`审核用户: ${userId}, 状态: ${status}, 操作员: ${operatorId}`);

    // 检查操作员是否为管理员
    const { data: operator, error: operatorError } = await this.client
      .from('users')
      .select('role')
      .eq('id', operatorId)
      .single();

    if (operatorError || !operator || operator.role !== 'admin') {
      throw new HttpException('无权限操作', HttpStatus.FORBIDDEN);
    }

    // 更新用户状态
    const { error: updateError } = await this.client
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      this.logger.error('审核用户失败:', updateError);
      throw new HttpException('审核失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`用户审核完成: ${userId} -> ${status}`);
  }
}
