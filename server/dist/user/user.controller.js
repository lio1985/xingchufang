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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const user_service_1 = require("./user.service");
const uuid_util_1 = require("../utils/uuid.util");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async checkUser(body) {
        console.log('收到检查用户请求:', { openid: body.openid, nickname: body.nickname });
        if (!body.openid) {
            return {
                success: false,
                code: 400,
                msg: 'openid 不能为空',
                data: null
            };
        }
        try {
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
        }
        catch (error) {
            console.error('检查/创建用户失败:', error);
            return {
                success: false,
                code: 500,
                msg: error.message || '检查/创建用户失败',
                data: null
            };
        }
    }
    async login(body) {
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
        }
        catch (error) {
            console.error('登录失败:', error);
            return {
                code: 401,
                msg: error.message || '登录失败',
                data: null
            };
        }
    }
    async loginWithPassword(body) {
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
        }
        catch (error) {
            console.error('账号密码登录失败:', error);
            return {
                success: false,
                code: 401,
                msg: error.message || '登录失败',
                data: null
            };
        }
    }
    async register(body) {
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
        }
        catch (error) {
            console.error('注册失败:', error);
            return {
                success: false,
                code: error.status || 500,
                msg: error.message || '注册失败',
                data: null
            };
        }
    }
    async changePassword(req, body) {
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
        }
        catch (error) {
            console.error('修改密码失败:', error);
            return {
                success: false,
                code: error.status || 500,
                msg: error.message || '修改密码失败',
                data: null
            };
        }
    }
    async resetPassword(body) {
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
        }
        catch (error) {
            console.error('重置密码失败:', error);
            return {
                success: false,
                code: error.status || 500,
                msg: error.message || '重置密码失败',
                data: null
            };
        }
    }
    async getProfile(req) {
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
        }
        catch (error) {
            console.error('获取用户信息失败:', error);
            return {
                code: 500,
                msg: '获取用户信息失败',
                data: null
            };
        }
    }
    async getProfileDetail(req) {
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
        }
        catch (error) {
            console.error('获取用户档案失败:', error);
            return {
                code: 500,
                msg: '获取用户档案失败',
                data: null
            };
        }
    }
    async updateProfileDetail(req, body) {
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
        }
        catch (error) {
            console.error('更新用户档案失败:', error);
            return {
                code: 500,
                msg: '更新用户档案失败',
                data: null
            };
        }
    }
    async getDepartments(req) {
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
        }
        catch (error) {
            console.error('获取部门列表失败:', error);
            return {
                code: 500,
                msg: '获取部门列表失败',
                data: null
            };
        }
    }
    async auditUser(req, body) {
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
        }
        catch (error) {
            console.error('审核用户失败:', error);
            return {
                success: false,
                code: error.status || 500,
                msg: error.message || '审核失败',
                data: null
            };
        }
    }
    async becomeAdmin(req) {
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
        }
        catch (error) {
            console.error('提升为管理员失败:', error);
            return {
                code: 500,
                msg: '提升为管理员失败',
                data: null
            };
        }
    }
    async getUserStatistics(req, targetUserId) {
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
            const validatedTargetUserId = (0, uuid_util_1.parseOptionalUUID)(targetUserId, 'userId');
            const statistics = await this.userService.getUserStatistics(payload.sub, validatedTargetUserId || payload.sub);
            return {
                code: 200,
                msg: 'success',
                data: statistics
            };
        }
        catch (error) {
            console.error('获取用户统计数据失败:', error);
            return {
                code: 500,
                msg: '获取用户统计数据失败',
                data: null
            };
        }
    }
    async getOperationLogs(req, targetUserId, page, pageSize, action) {
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
        }
        catch (error) {
            console.error('获取操作日志失败:', error);
            return {
                code: 500,
                msg: '获取操作日志失败',
                data: null
            };
        }
    }
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
        }
        catch (error) {
            console.error('初始化预设账号失败:', error);
            return {
                success: false,
                code: 500,
                msg: error.message || '初始化预设账号失败',
                data: null
            };
        }
    }
    async uploadAvatar(req, file) {
        console.log('收到上传头像请求');
        console.log('文件信息:', {
            originalname: file?.originalname,
            mimetype: file?.mimetype,
            size: file?.size,
            hasBuffer: !!file?.buffer,
            hasPath: !!file?.path,
        });
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
        if (!file) {
            return {
                code: 400,
                msg: '请选择要上传的头像图片',
                data: null
            };
        }
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return {
                code: 400,
                msg: '只支持 JPG、PNG、GIF、WebP 格式的图片',
                data: null
            };
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return {
                code: 400,
                msg: '图片大小不能超过 5MB',
                data: null
            };
        }
        try {
            let fileBuffer;
            if (file.buffer) {
                fileBuffer = file.buffer;
            }
            else if (file.path) {
                const fs = await Promise.resolve().then(() => require('fs/promises'));
                fileBuffer = await fs.readFile(file.path);
            }
            else {
                return {
                    code: 400,
                    msg: '无法读取文件内容',
                    data: null
                };
            }
            const result = await this.userService.updateAvatar(payload.sub, fileBuffer, file.originalname, file.mimetype);
            return {
                code: 200,
                msg: '头像上传成功',
                data: result
            };
        }
        catch (error) {
            console.error('上传头像失败:', error);
            return {
                code: 500,
                msg: error.message || '上传头像失败',
                data: null
            };
        }
    }
    async updateOnlineStatus(req, body) {
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
        }
        catch (error) {
            console.error('更新在线状态失败:', error);
            return {
                code: 500,
                msg: '更新在线状态失败',
                data: null
            };
        }
    }
    async getOnlineStatus(req, targetUserId) {
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
        }
        catch (error) {
            console.error('获取在线状态失败:', error);
            return {
                code: 500,
                msg: '获取在线状态失败',
                data: null
            };
        }
    }
    async getBatchOnlineStatus(req, body) {
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
        }
        catch (error) {
            console.error('批量获取在线状态失败:', error);
            return {
                code: 500,
                msg: '批量获取在线状态失败',
                data: null
            };
        }
    }
    async getUserList(req, role, status, page, limit) {
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
            const pageNum = parseInt(page || '1', 10);
            const limitNum = parseInt(limit || '50', 10);
            const result = await this.userService.getUserList(role, status, pageNum, limitNum);
            return {
                code: 200,
                msg: 'success',
                data: result
            };
        }
        catch (error) {
            console.error('获取用户列表失败:', error);
            return {
                code: 500,
                msg: '获取用户列表失败',
                data: null
            };
        }
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('check-user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "checkUser", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('login-with-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "loginWithPassword", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('profile/detail'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfileDetail", null);
__decorate([
    (0, common_1.Put)('profile/detail'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfileDetail", null);
__decorate([
    (0, common_1.Get)('departments'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getDepartments", null);
__decorate([
    (0, common_1.Post)('audit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "auditUser", null);
__decorate([
    (0, common_1.Post)('become-admin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "becomeAdmin", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserStatistics", null);
__decorate([
    (0, common_1.Get)('operation-logs'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __param(4, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getOperationLogs", null);
__decorate([
    (0, common_1.Post)('init-default-accounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "initDefaultAccounts", null);
__decorate([
    (0, common_1.Post)('upload-avatar'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('online-status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateOnlineStatus", null);
__decorate([
    (0, common_1.Get)('online-status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getOnlineStatus", null);
__decorate([
    (0, common_1.Post)('online-status/batch'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getBatchOnlineStatus", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserList", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map