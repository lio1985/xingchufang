"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const jwt_util_1 = require("../utils/jwt.util");
const common_2 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const storage_service_1 = require("../storage/storage.service");
const notification_service_1 = require("../notification/notification.service");
let UserService = UserService_1 = class UserService {
    constructor(storageService, notificationService) {
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
        this.logger = new common_2.Logger(UserService_1.name);
    }
    async generateUniqueEmployeeId() {
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
            const employeeId = (Math.floor(Math.random() * 900000) + 100000).toString();
            const { data, error } = await this.client
                .from('users')
                .select('id')
                .eq('employee_id', employeeId)
                .single();
            if (error && error.code === 'PGRST116') {
                return employeeId;
            }
            else if (!error && data) {
                continue;
            }
            else if (error) {
                this.logger.error('检查员工ID时出错:', error);
                throw new Error('生成员工ID失败');
            }
        }
        throw new Error('无法生成唯一的员工ID，请稍后重试');
    }
    async wechatLogin(code) {
        this.logger.log('收到登录请求，code:', code);
        let openid;
        let unionid;
        if (code.startsWith('mock_code_')) {
            this.logger.warn('检测到 H5 环境模拟登录，跳过微信 API 调用');
            openid = `mock_openid_${code}`;
            unionid = undefined;
        }
        else {
            try {
                const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.TARO_APP_WEAPP_APPID}&secret=${process.env.WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
                this.logger.log('调用微信 API:', wxUrl);
                const wxResponse = await fetch(wxUrl);
                const wxData = await wxResponse.json();
                this.logger.log('微信 API 响应:', wxData);
                if (wxData.errcode) {
                    this.logger.error('微信 API 错误:', wxData);
                    throw new common_1.HttpException(`微信登录失败: ${wxData.errmsg}`, common_1.HttpStatus.UNAUTHORIZED);
                }
                openid = wxData.openid;
                unionid = wxData.unionid;
                if (!openid) {
                    this.logger.error('微信 API 未返回 openid');
                    throw new common_1.HttpException('微信登录失败：未获取到 openid', common_1.HttpStatus.UNAUTHORIZED);
                }
            }
            catch (error) {
                this.logger.error('调用微信 API 失败:', error);
                if (process.env.NODE_ENV === 'development' || !process.env.TARO_APP_WEAPP_APPID) {
                    this.logger.warn('开发环境：使用模拟 openid');
                    openid = `mock_openid_${code}`;
                    unionid = undefined;
                }
                else {
                    throw new common_1.HttpException('微信登录失败', common_1.HttpStatus.UNAUTHORIZED);
                }
            }
        }
        const { data: existingUsers, error: findError } = await this.client
            .from('users')
            .select('*')
            .eq('openid', openid)
            .limit(1);
        if (findError) {
            this.logger.error('查询用户失败:', findError);
            throw new common_1.HttpException('数据库查询失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        let user;
        if (!existingUsers || existingUsers.length === 0) {
            const employeeId = await this.generateUniqueEmployeeId();
            const superAdminOpenid = process.env.SUPER_ADMIN_OPENID;
            const isSuperAdmin = superAdminOpenid && openid === superAdminOpenid;
            const isH5MockLogin = code.startsWith('mock_code_');
            const now = new Date().toISOString();
            const newUser = {
                openid,
                unionid,
                employee_id: employeeId,
                nickname: `用户${Math.random().toString(36).substr(2, 6)}`,
                role: (isSuperAdmin || isH5MockLogin) ? 'admin' : 'user',
                status: 'active',
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
                throw new common_1.HttpException('创建用户失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            user = createdUsers;
            this.logger.log(`新用户注册，用户ID: ${user.id}`);
        }
        else {
            user = existingUsers[0];
            this.logger.log(`用户登录，用户ID: ${user.id}`);
        }
        await this.client
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);
        const tokenPayload = {
            userId: user.id,
            openid: user.openid,
            role: user.role,
            status: user.status,
        };
        const token = jwt_util_1.JwtUtil.generateToken(tokenPayload);
        this.logger.log(`用户登录成功，用户ID: ${user.id}`);
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
    async findByOpenid(openid) {
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
            throw new common_1.HttpException('数据库查询失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return data;
    }
    async findById(id) {
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
            throw new common_1.HttpException('数据库查询失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return data;
    }
    async validateToken(token) {
        try {
            return jwt_util_1.JwtUtil.verifyToken(token);
        }
        catch (error) {
            this.logger.error('Token 验证失败:', error);
            return null;
        }
    }
    async getUserProfile(userId) {
        const { data, error } = await this.client
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
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
                    throw new common_1.HttpException('创建用户档案失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                return createdProfile;
            }
            this.logger.error('查询用户档案失败:', error);
            throw new common_1.HttpException('查询用户档案失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return data;
    }
    async updateUserProfile(userId, profileData) {
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
            throw new common_1.HttpException('更新用户档案失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return data;
    }
    async getAllUsers(page = 1, pageSize = 20, role, status, search) {
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
            throw new common_1.HttpException('获取用户列表失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            users: data || [],
            total: count || 0,
        };
    }
    async updateUserRole(userId, role) {
        try {
            this.logger.log(`开始更新用户角色: userId=${userId}, role=${role}`);
            const now = new Date().toISOString();
            const { data, error } = await this.client
                .from('users')
                .update({ role, updated_at: now })
                .eq('id', userId)
                .select()
                .single();
            if (error) {
                this.logger.error('更新用户角色失败，数据库错误:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    userId,
                    role
                });
                throw new common_1.HttpException(`更新用户角色失败: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!data) {
                this.logger.error('更新用户角色失败，用户不存在:', userId);
                throw new common_1.HttpException('用户不存在', common_1.HttpStatus.NOT_FOUND);
            }
            this.logger.log('更新用户角色成功:', {
                userId,
                oldRole: data.role,
                newRole: role
            });
            return data;
        }
        catch (error) {
            this.logger.error('更新用户角色失败，系统错误:', {
                error: error.message,
                stack: error.stack,
                userId,
                role
            });
            throw error;
        }
    }
    async updateUserStatus(userId, status) {
        try {
            this.logger.log(`开始更新用户状态: userId=${userId}, status=${status}`);
            const now = new Date().toISOString();
            const { data, error } = await this.client
                .from('users')
                .update({ status, updated_at: now })
                .eq('id', userId)
                .select()
                .single();
            if (error) {
                this.logger.error('更新用户状态失败，数据库错误:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    userId,
                    status
                });
                throw new common_1.HttpException(`更新用户状态失败: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!data) {
                this.logger.error('更新用户状态失败，用户不存在:', userId);
                throw new common_1.HttpException('用户不存在', common_1.HttpStatus.NOT_FOUND);
            }
            this.logger.log('更新用户状态成功:', {
                userId,
                oldStatus: data.status,
                newStatus: status
            });
            return data;
        }
        catch (error) {
            this.logger.error('更新用户状态失败，系统错误:', {
                error: error.message,
                stack: error.stack,
                userId,
                status
            });
            throw error;
        }
    }
    async updateUserNickname(userId, nickname) {
        const now = new Date().toISOString();
        const { data, error } = await this.client
            .from('users')
            .update({ nickname, updated_at: now })
            .eq('id', userId)
            .select()
            .single();
        if (error) {
            this.logger.error('更新用户昵称失败:', error);
            throw new common_1.HttpException('更新用户昵称失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return data;
    }
    async isAdmin(userId) {
        const user = await this.findById(userId);
        if (!user) {
            return false;
        }
        return user.role === 'admin';
    }
    async getUserListSimple(options) {
        const { page = 1, limit = 20, role, status, keyword } = options;
        let query = this.client.from('users').select('*', { count: 'exact' });
        if (role && role !== 'all') {
            query = query.eq('role', role);
        }
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        if (keyword) {
            query = query.or(`nickname.ilike.%${keyword}%,openid.ilike.%${keyword}%,employee_id.ilike.%${keyword}%`);
        }
        query = query.order('created_at', { ascending: false });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('获取用户列表失败:', error);
            throw new common_1.HttpException('获取用户列表失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            users: data || [],
            total: count || 0,
        };
    }
    async getUserWithProfile(userId) {
        const user = await this.findById(userId);
        if (!user) {
            return null;
        }
        const profile = await this.getUserProfile(userId);
        return { user, profile };
    }
    async getDepartments() {
        const { data, error } = await this.client
            .from('user_profiles')
            .select('department')
            .not('department', 'is', null)
            .not('department', 'eq', '');
        if (error) {
            this.logger.error('获取部门列表失败:', error);
            throw new common_1.HttpException('获取部门列表失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const departments = [...new Set(data.map((item) => item.department).filter(Boolean))];
        return departments;
    }
    async getUserStatistics(currentUserId, targetUserId) {
        const isAdminUser = await this.isAdmin(currentUserId);
        if (!isAdminUser && currentUserId !== targetUserId) {
            throw new common_1.HttpException('无权限查看', common_1.HttpStatus.FORBIDDEN);
        }
        const user = await this.findById(targetUserId);
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const profile = await this.getUserProfile(targetUserId);
        const { count: conversationCount } = await this.client
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId);
        const { count: messageCount } = await this.client
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId);
        const { count: lexiconCount } = await this.client
            .from('lexicons')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId);
        const { count: fileCount } = await this.client
            .from('multimedia')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId);
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
    async getOperationLogs(currentUserId, options) {
        const { page = 1, limit = 20, userId, action, startDate, endDate } = options;
        const isAdminUser = await this.isAdmin(currentUserId);
        if (!isAdminUser && userId && userId !== currentUserId) {
            throw new common_1.HttpException('无权限查看', common_1.HttpStatus.FORBIDDEN);
        }
        let query = this.client.from('operation_logs').select('*', { count: 'exact' });
        const targetUserId = isAdminUser && userId && userId.trim() !== '' ? userId : currentUserId;
        if (targetUserId && targetUserId.trim() !== '') {
            query = query.eq('user_id', targetUserId);
        }
        if (action) {
            query = query.eq('action', action);
        }
        if (startDate) {
            query = query.gte('created_at', startDate);
        }
        if (endDate) {
            query = query.lte('created_at', endDate);
        }
        query = query.order('created_at', { ascending: false });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('获取操作日志失败:', error);
            throw new common_1.HttpException('获取操作日志失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            logs: data || [],
            total: count || 0,
        };
    }
    async checkOrCreateUser(params) {
        const { openid, nickname } = params;
        this.logger.log(`检查用户: openid=${openid}`);
        const { data: existingUsers, error: findError } = await this.client
            .from('users')
            .select('*')
            .eq('openid', openid)
            .limit(1);
        if (findError) {
            this.logger.error('查询用户失败:', findError);
            throw new common_1.HttpException('数据库查询失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        let user;
        let type;
        if (existingUsers && existingUsers.length > 0) {
            user = existingUsers[0];
            type = 'existing';
            this.logger.log(`用户已存在: ${user.id}`);
            await this.client
                .from('users')
                .update({ last_login_at: new Date().toISOString() })
                .eq('id', user.id);
        }
        else {
            type = 'created';
            const employeeId = await this.generateUniqueEmployeeId();
            const superAdminOpenid = process.env.SUPER_ADMIN_OPENID;
            const isSuperAdmin = superAdminOpenid && openid === superAdminOpenid;
            const isH5MockLogin = openid.startsWith('mock_openid_');
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
                throw new common_1.HttpException('创建用户失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            user = createdUsers;
            this.logger.log(`新用户创建成功: ${user.id}`);
        }
        const tokenPayload = {
            userId: user.id,
            openid: user.openid,
            role: user.role,
            status: user.status,
        };
        const token = jwt_util_1.JwtUtil.generateToken(tokenPayload);
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
    async loginWithPassword(username, password) {
        this.logger.log(`账号密码登录: ${username}`);
        const { data: usersByNickname, error: nicknameError } = await this.client
            .from('users')
            .select('*')
            .eq('nickname', username)
            .eq('status', 'active')
            .limit(1);
        let user;
        if (!nicknameError && usersByNickname && usersByNickname.length > 0) {
            user = usersByNickname[0];
        }
        else {
            const openid = `pwd_${username}`;
            const { data: usersByOpenid, error: findError } = await this.client
                .from('users')
                .select('*')
                .eq('openid', openid)
                .limit(1);
            if (findError) {
                this.logger.error('查询用户失败:', findError);
                throw new common_1.HttpException('数据库查询失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!usersByOpenid || usersByOpenid.length === 0) {
                if (username === 'admin' && password === 'Admin@2025!Secure') {
                    this.logger.log('创建预设管理员账号');
                    return await this.createDefaultAccounts();
                }
                if (username === 'test2026' && password === 'test123456') {
                    this.logger.log('创建预设测试账号');
                    return await this.createDefaultAccounts();
                }
                throw new common_1.HttpException('账号不存在', common_1.HttpStatus.UNAUTHORIZED);
            }
            user = usersByOpenid[0];
        }
        if (!user.password) {
            throw new common_1.HttpException('该账号不支持密码登录', common_1.HttpStatus.UNAUTHORIZED);
        }
        let isPasswordValid = false;
        if (user.password.startsWith('$2') || user.password.startsWith('$2a')) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        }
        else {
            isPasswordValid = user.password === password;
        }
        if (!isPasswordValid) {
            throw new common_1.HttpException('密码错误', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (user.status === 'pending') {
            throw new common_1.HttpException('账号正在等待管理员审核，请耐心等待', common_1.HttpStatus.FORBIDDEN);
        }
        if (user.status === 'disabled') {
            throw new common_1.HttpException('账号已被禁用，请联系管理员', common_1.HttpStatus.FORBIDDEN);
        }
        if (user.status === 'deleted') {
            throw new common_1.HttpException('账号已注销', common_1.HttpStatus.FORBIDDEN);
        }
        await this.client
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);
        const tokenPayload = {
            userId: user.id,
            openid: user.openid,
            role: user.role,
            status: user.status,
        };
        const token = jwt_util_1.JwtUtil.generateToken(tokenPayload);
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
    async createDefaultAccounts() {
        const now = new Date().toISOString();
        const adminEmployeeId = await this.generateUniqueEmployeeId();
        const adminHashedPassword = await bcrypt.hash('Admin@2025!Secure', 10);
        const adminUser = {
            openid: 'pwd_admin',
            employee_id: adminEmployeeId,
            nickname: 'admin',
            password: adminHashedPassword,
            role: 'admin',
            status: 'active',
            created_at: now,
            updated_at: now,
        };
        const { data: createdAdmin, error: adminError } = await this.client
            .from('users')
            .insert(adminUser)
            .select()
            .single();
        if (adminError) {
            this.logger.error('创建管理员账号失败:', adminError);
            throw new common_1.HttpException('创建管理员账号失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await this.client
            .from('user_profiles')
            .insert({
            user_id: createdAdmin.id,
            real_name: '系统管理员',
            created_at: now,
            updated_at: now,
        });
        this.logger.log(`管理员账号创建成功，ID: ${createdAdmin.id}`);
        const testEmployeeId = await this.generateUniqueEmployeeId();
        const testHashedPassword = await bcrypt.hash('test123456', 10);
        const testUser = {
            openid: 'pwd_test2026',
            employee_id: testEmployeeId,
            nickname: 'test2026',
            password: testHashedPassword,
            role: 'user',
            status: 'active',
            created_at: now,
            updated_at: now,
        };
        const { data: createdTest, error: testError } = await this.client
            .from('users')
            .insert(testUser)
            .select()
            .single();
        if (testError) {
            this.logger.error('创建测试账号失败:', testError);
        }
        else {
            await this.client
                .from('user_profiles')
                .insert({
                user_id: createdTest.id,
                real_name: '测试用户',
                created_at: now,
                updated_at: now,
            });
            this.logger.log(`测试账号创建成功，ID: ${createdTest.id}`);
        }
        const tokenPayload = {
            userId: createdAdmin.id,
            openid: createdAdmin.openid,
            role: createdAdmin.role,
            status: createdAdmin.status,
        };
        const token = jwt_util_1.JwtUtil.generateToken(tokenPayload);
        return {
            user: {
                id: createdAdmin.id,
                openid: createdAdmin.openid,
                employeeId: createdAdmin.employee_id,
                nickname: createdAdmin.nickname,
                avatarUrl: createdAdmin.avatar_url,
                role: createdAdmin.role,
                status: createdAdmin.status,
            },
            token,
        };
    }
    async register(username, password, nickname) {
        this.logger.log(`用户注册: ${username}`);
        if (!username || username.length < 3) {
            throw new common_1.HttpException('账号长度至少3位', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!password || password.length < 6) {
            throw new common_1.HttpException('密码长度至少6位', common_1.HttpStatus.BAD_REQUEST);
        }
        const openid = `pwd_${username}`;
        const { data: existingUsers, error: findError } = await this.client
            .from('users')
            .select('*')
            .eq('openid', openid)
            .limit(1);
        if (findError) {
            this.logger.error('查询用户失败:', findError);
            throw new common_1.HttpException('数据库查询失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (existingUsers && existingUsers.length > 0) {
            throw new common_1.HttpException('账号已被注册', common_1.HttpStatus.CONFLICT);
        }
        const employeeId = await this.generateUniqueEmployeeId();
        const now = new Date().toISOString();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            openid,
            employee_id: employeeId,
            nickname: nickname || username,
            role: 'user',
            status: 'pending',
            password: hashedPassword,
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
            throw new common_1.HttpException('注册失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log(`新用户注册成功: ${createdUser.id}`);
        try {
            await this.notifyAdminsForNewUser(createdUser);
        }
        catch (error) {
            this.logger.error('通知管理员失败:', error);
        }
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
    async notifyAdminsForNewUser(newUser) {
        this.logger.log('开始通知管理员有新用户待审核');
        const { data: admins, error } = await this.client
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .eq('status', 'active');
        if (error) {
            this.logger.error('查询管理员失败:', error);
            return;
        }
        if (!admins || admins.length === 0) {
            this.logger.warn('没有找到活跃的管理员用户');
            return;
        }
        this.logger.log(`找到 ${admins.length} 位管理员，准备发送通知`);
        const adminIds = admins.map(admin => admin.id);
        await this.notificationService.sendNotification({
            title: '新用户注册待审核',
            content: `用户「${newUser.nickname || newUser.employee_id}」已完成注册，请及时审核。`,
            type: 'system',
            targetType: 'user',
            targetUsers: adminIds,
        });
        this.logger.log(`已向 ${adminIds.length} 位管理员发送新用户审核通知`);
    }
    async changePassword(userId, oldPassword, newPassword) {
        this.logger.log(`修改密码: ${userId}`);
        if (!newPassword || newPassword.length < 6) {
            throw new common_1.HttpException('新密码长度至少6位', common_1.HttpStatus.BAD_REQUEST);
        }
        const { data: user, error: findError } = await this.client
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (findError || !user) {
            throw new common_1.HttpException('用户不存在', common_1.HttpStatus.NOT_FOUND);
        }
        let isOldPasswordValid = false;
        if (user.password.startsWith('$2')) {
            isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        }
        else {
            isOldPasswordValid = user.password === oldPassword;
        }
        if (!isOldPasswordValid) {
            throw new common_1.HttpException('原密码错误', common_1.HttpStatus.UNAUTHORIZED);
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const { error: updateError } = await this.client
            .from('users')
            .update({ password: hashedNewPassword, updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (updateError) {
            this.logger.error('修改密码失败:', updateError);
            throw new common_1.HttpException('修改密码失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log(`密码修改成功: ${userId}`);
    }
    async resetPassword(userId, newPassword) {
        this.logger.log(`重置密码: ${userId}`);
        if (!newPassword || newPassword.length < 6) {
            throw new common_1.HttpException('新密码长度至少6位', common_1.HttpStatus.BAD_REQUEST);
        }
        const { data: user, error: findError } = await this.client
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();
        if (findError || !user) {
            this.logger.error('用户不存在:', findError);
            throw new common_1.HttpException('用户不存在', common_1.HttpStatus.NOT_FOUND);
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const { error: updateError } = await this.client
            .from('users')
            .update({ password: hashedNewPassword, updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (updateError) {
            this.logger.error('重置密码失败:', updateError);
            throw new common_1.HttpException('重置密码失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log(`密码重置成功: ${userId}`);
    }
    async auditUser(userId, status, operatorId) {
        this.logger.log(`审核用户: ${userId}, 状态: ${status}, 操作员: ${operatorId}`);
        const { data: operator, error: operatorError } = await this.client
            .from('users')
            .select('role')
            .eq('id', operatorId)
            .single();
        if (operatorError || !operator || operator.role !== 'admin') {
            throw new common_1.HttpException('无权限操作', common_1.HttpStatus.FORBIDDEN);
        }
        const { error: updateError } = await this.client
            .from('users')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', userId);
        if (updateError) {
            this.logger.error('审核用户失败:', updateError);
            throw new common_1.HttpException('审核失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log(`用户审核完成: ${userId} -> ${status}`);
    }
    async initDefaultAccounts() {
        this.logger.log('=== 开始初始化预设账号 ===');
        const now = new Date().toISOString();
        const adminPassword = await bcrypt.hash('Admin@2025!Secure', 10);
        let adminUser;
        const { data: existingAdmin } = await this.client
            .from('users')
            .select('*')
            .eq('nickname', 'admin')
            .limit(1);
        if (existingAdmin && existingAdmin.length > 0) {
            const { data: updatedAdmin, error: updateError } = await this.client
                .from('users')
                .update({
                password: adminPassword,
                role: 'admin',
                status: 'active',
                updated_at: now,
            })
                .eq('id', existingAdmin[0].id)
                .select()
                .single();
            if (updateError) {
                this.logger.error('更新管理员账号失败:', updateError);
                throw new common_1.HttpException('更新管理员账号失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            adminUser = updatedAdmin;
            this.logger.log('管理员账号已更新');
        }
        else {
            const adminEmployeeId = await this.generateUniqueEmployeeId();
            const { data: createdAdmin, error: createError } = await this.client
                .from('users')
                .insert({
                openid: 'pwd_admin',
                employee_id: adminEmployeeId,
                nickname: 'admin',
                password: adminPassword,
                role: 'admin',
                status: 'active',
                created_at: now,
                updated_at: now,
            })
                .select()
                .single();
            if (createError) {
                this.logger.error('创建管理员账号失败:', createError);
                throw new common_1.HttpException('创建管理员账号失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            adminUser = createdAdmin;
            this.logger.log(`管理员账号创建成功，ID: ${adminUser.id}`);
            await this.client
                .from('user_profiles')
                .insert({
                user_id: adminUser.id,
                real_name: '系统管理员',
                created_at: now,
                updated_at: now,
            });
        }
        const testPassword = await bcrypt.hash('test123456', 10);
        let testUser;
        const { data: existingTest } = await this.client
            .from('users')
            .select('*')
            .eq('nickname', 'test2026')
            .limit(1);
        if (existingTest && existingTest.length > 0) {
            const { data: updatedTest, error: updateError } = await this.client
                .from('users')
                .update({
                password: testPassword,
                role: 'user',
                status: 'active',
                updated_at: now,
            })
                .eq('id', existingTest[0].id)
                .select()
                .single();
            if (updateError) {
                this.logger.error('更新测试账号失败:', updateError);
                throw new common_1.HttpException('更新测试账号失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            testUser = updatedTest;
            this.logger.log('测试账号已更新');
        }
        else {
            const testEmployeeId = await this.generateUniqueEmployeeId();
            const { data: createdTest, error: createError } = await this.client
                .from('users')
                .insert({
                openid: 'pwd_test2026',
                employee_id: testEmployeeId,
                nickname: 'test2026',
                password: testPassword,
                role: 'user',
                status: 'active',
                created_at: now,
                updated_at: now,
            })
                .select()
                .single();
            if (createError) {
                this.logger.error('创建测试账号失败:', createError);
                throw new common_1.HttpException('创建测试账号失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            testUser = createdTest;
            this.logger.log(`测试账号创建成功，ID: ${testUser.id}`);
            await this.client
                .from('user_profiles')
                .insert({
                user_id: testUser.id,
                real_name: '测试用户',
                created_at: now,
                updated_at: now,
            });
        }
        this.logger.log('=== 预设账号初始化完成 ===');
        return {
            admin: {
                id: adminUser.id,
                nickname: adminUser.nickname,
                role: adminUser.role,
                status: adminUser.status,
            },
            test: {
                id: testUser.id,
                nickname: testUser.nickname,
                role: testUser.role,
                status: testUser.status,
            },
        };
    }
    async updateAvatar(userId, fileBuffer, originalName, mimeType) {
        this.logger.log(`更新用户头像: ${userId}`);
        const fileName = `avatars/${userId}_${Date.now()}_${originalName}`;
        const avatarKey = await this.storageService.uploadFile(fileBuffer, fileName, mimeType);
        this.logger.log(`头像上传成功, key: ${avatarKey}`);
        const avatarUrl = await this.storageService.getFileUrl(avatarKey, 365 * 24 * 60 * 60);
        const now = new Date().toISOString();
        const { error: updateError } = await this.client
            .from('users')
            .update({
            avatar_url: avatarUrl,
            updated_at: now,
        })
            .eq('id', userId);
        if (updateError) {
            this.logger.error('更新用户头像失败:', updateError);
            await this.storageService.deleteFile(avatarKey);
            throw new common_1.HttpException('更新用户头像失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log(`用户头像更新成功: ${userId}`);
        return {
            avatarUrl,
            avatarKey,
        };
    }
    async updateOnlineStatus(userId, isOnline) {
        const now = new Date().toISOString();
        const { error } = await this.client
            .from('users')
            .update({
            is_online: isOnline,
            last_seen_at: now,
            updated_at: now,
        })
            .eq('id', userId);
        if (error) {
            this.logger.error('更新用户在线状态失败:', error);
            throw new common_1.HttpException('更新在线状态失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.logger.log(`用户在线状态更新成功: ${userId}, isOnline: ${isOnline}`);
    }
    async getOnlineStatus(userId) {
        const { data, error } = await this.client
            .from('users')
            .select('is_online, last_seen_at')
            .eq('id', userId)
            .single();
        if (error) {
            this.logger.error('获取用户在线状态失败:', error);
            throw new common_1.HttpException('获取在线状态失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            isOnline: data?.is_online ?? false,
            lastSeenAt: data?.last_seen_at ?? null,
        };
    }
    async getBatchOnlineStatus(userIds) {
        if (!userIds || userIds.length === 0) {
            return {};
        }
        const { data, error } = await this.client
            .from('users')
            .select('id, is_online, last_seen_at')
            .in('id', userIds);
        if (error) {
            this.logger.error('批量获取用户在线状态失败:', error);
            throw new common_1.HttpException('获取在线状态失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const result = {};
        for (const user of data || []) {
            result[user.id] = {
                isOnline: user.is_online ?? false,
                lastSeenAt: user.last_seen_at ?? null,
            };
        }
        return result;
    }
    async getUserList(role, status, page = 1, limit = 50) {
        let query = this.client
            .from('users')
            .select('id, nickname, avatar_url, role, status, employee_id, last_login_at, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);
        if (role) {
            query = query.eq('role', role);
        }
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('获取用户列表失败:', error);
            throw new common_1.HttpException('获取用户列表失败', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            list: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
            },
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => storage_service_1.StorageService))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        notification_service_1.NotificationService])
], UserService);
//# sourceMappingURL=user.service.js.map