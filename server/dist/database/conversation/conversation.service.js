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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../storage/database/supabase-client");
const user_service_1 = require("../../user/user.service");
const uuid_1 = require("uuid");
const pg_1 = require("pg");
const GUEST_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const pgPool = new pg_1.Pool({
    connectionString: process.env.PGDATABASE_URL,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
});
let ConversationService = class ConversationService {
    constructor(userService) {
        this.userService = userService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    toUuid(userId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(userId)) {
            return userId;
        }
        return (0, uuid_1.v5)(userId, GUEST_NAMESPACE);
    }
    async getList(currentUserId, targetUserId) {
        console.log('=== 获取对话列表 ===');
        console.log('当前用户ID (原始):', currentUserId);
        console.log('目标用户ID (原始):', targetUserId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
                throw new common_1.ForbiddenException('无权查看其他用户的对话');
            }
            const queryUserId = this.toUuid(targetUserId || currentUserId);
            console.log('查询用户ID (转换后):', queryUserId);
            const result = await pgPool.query('SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC', [queryUserId]);
            console.log(`找到 ${result.rows.length} 个对话`);
            return result.rows;
        }
        catch (error) {
            console.error('获取对话列表失败:', error);
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || '获取对话列表失败');
        }
    }
    async getDetail(conversationId, currentUserId) {
        console.log('=== 获取对话详情 ===');
        console.log('对话ID:', conversationId);
        console.log('当前用户ID:', currentUserId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data, error } = await this.client
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new common_1.NotFoundException('对话不存在');
                }
                throw new Error(error.message);
            }
            if (!isAdmin && data.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权访问此对话');
            }
            const { data: messages, error: msgError } = await this.client
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
            if (msgError)
                throw new Error(msgError.message);
            console.log(`找到 ${messages?.length || 0} 条消息`);
            return { ...data, messages };
        }
        catch (error) {
            console.error('获取对话详情失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || '获取对话详情失败');
        }
    }
    async create(body) {
        console.log('=== 创建对话 ===');
        console.log('原始用户ID:', body.userId);
        const userId = this.toUuid(body.userId);
        console.log('转换后用户ID:', userId);
        console.log('标题:', body.title);
        try {
            const query = `
        INSERT INTO conversations (user_id, title)
        VALUES ($1, $2)
        RETURNING id, user_id, title, created_at, updated_at
      `;
            const values = [userId, body.title];
            const result = await pgPool.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('创建对话失败：没有返回数据');
            }
            const data = result.rows[0];
            console.log('对话创建成功:', data.id);
            return data;
        }
        catch (err) {
            console.error('创建对话异常:', err);
            throw new Error(err?.message || '创建对话失败');
        }
    }
    async addMessage(body) {
        console.log('=== 添加消息 ===');
        console.log('对话ID:', body.conversationId);
        console.log('角色:', body.role);
        const { data, error } = await this.client
            .from('messages')
            .insert({
            conversation_id: body.conversationId,
            role: body.role,
            content: body.content,
            metadata: body.metadata,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        console.log('消息添加成功:', data.id);
        return data;
    }
    async delete(conversationId, currentUserId) {
        console.log('=== 删除对话 ===');
        console.log('对话ID:', conversationId);
        console.log('当前用户ID:', currentUserId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data, error: fetchError } = await this.client
                .from('conversations')
                .select('user_id')
                .eq('id', conversationId)
                .single();
            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    throw new common_1.NotFoundException('对话不存在');
                }
                throw new Error(fetchError.message);
            }
            if (!isAdmin && data.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权删除此对话');
            }
            const { error } = await this.client
                .from('conversations')
                .delete()
                .eq('id', conversationId);
            if (error)
                throw new Error(error.message);
            console.log('对话已删除');
            return { success: true };
        }
        catch (error) {
            console.error('删除对话失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message || '删除对话失败');
        }
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map