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
exports.ScheduledTaskService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const user_service_1 = require("../user/user.service");
let ScheduledTaskService = class ScheduledTaskService {
    constructor(userService) {
        this.userService = userService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async createTask(dto) {
        console.log('=== 创建定时任务 ===');
        console.log('用户ID:', dto.userId);
        console.log('标题:', dto.title);
        console.log('提醒时间:', dto.reminderTime);
        const { data, error } = await this.client
            .from('scheduled_tasks')
            .insert({
            user_id: dto.userId,
            title: dto.title,
            description: dto.description,
            reminder_time: dto.reminderTime,
            repeat_type: dto.repeatType || 'none',
            status: 'pending',
            is_active: true,
        })
            .select()
            .single();
        if (error) {
            console.error('创建任务失败:', error);
            throw new Error(`创建任务失败: ${error.message}`);
        }
        console.log('任务创建成功:', data.id);
        return this.mapToTask(data);
    }
    async getUserTasks(currentUserId, targetUserId, status, isActive, limit = 50, offset = 0) {
        console.log('=== 获取用户定时任务 ===');
        console.log('当前用户ID:', currentUserId);
        console.log('目标用户ID:', targetUserId);
        console.log('状态过滤:', status);
        console.log('激活状态:', isActive);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
                throw new common_1.ForbiddenException('无权查看其他用户的任务');
            }
            const queryUserId = targetUserId || currentUserId;
            let query = this.client
                .from('scheduled_tasks')
                .select('*', { count: 'exact' })
                .eq('user_id', queryUserId)
                .order('reminder_time', { ascending: true })
                .range(offset, offset + limit - 1);
            if (status) {
                query = query.eq('status', status);
            }
            if (isActive !== undefined) {
                query = query.eq('is_active', isActive);
            }
            const { data, error, count } = await query;
            if (error) {
                console.error('获取任务列表失败:', error);
                throw new Error(`获取任务列表失败: ${error.message}`);
            }
            console.log(`找到 ${count} 个任务`);
            return {
                tasks: (data || []).map(item => this.mapToTask(item)),
                total: count || 0,
            };
        }
        catch (error) {
            console.error('获取任务列表失败:', error);
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`获取任务列表失败: ${error.message}`);
        }
    }
    async getTaskById(taskId, currentUserId) {
        console.log('=== 获取任务详情 ===');
        console.log('任务ID:', taskId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data, error } = await this.client
                .from('scheduled_tasks')
                .select('*')
                .eq('id', taskId)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException('任务不存在');
            }
            if (!isAdmin && data.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权访问此任务');
            }
            return this.mapToTask(data);
        }
        catch (error) {
            console.error('获取任务详情失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`获取任务详情失败: ${error.message}`);
        }
    }
    async updateTask(taskId, currentUserId, dto) {
        console.log('=== 更新定时任务 ===');
        console.log('任务ID:', taskId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data: task, error: fetchError } = await this.client
                .from('scheduled_tasks')
                .select('*')
                .eq('id', taskId)
                .single();
            if (fetchError || !task) {
                throw new common_1.NotFoundException('任务不存在');
            }
            if (!isAdmin && task.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权修改此任务');
            }
            const updateData = {};
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.reminderTime !== undefined)
                updateData.reminder_time = dto.reminderTime;
            if (dto.repeatType !== undefined)
                updateData.repeat_type = dto.repeatType;
            if (dto.status !== undefined) {
                updateData.status = dto.status;
                if (dto.status === 'completed') {
                    updateData.completed_at = new Date().toISOString();
                }
            }
            if (dto.isActive !== undefined)
                updateData.is_active = dto.isActive;
            const { data, error } = await this.client
                .from('scheduled_tasks')
                .update(updateData)
                .eq('id', taskId)
                .select()
                .single();
            if (error) {
                console.error('更新任务失败:', error);
                throw new Error(`更新任务失败: ${error.message}`);
            }
            console.log('任务更新成功');
            return this.mapToTask(data);
        }
        catch (error) {
            console.error('更新任务失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`更新任务失败: ${error.message}`);
        }
    }
    async deleteTask(taskId, currentUserId) {
        console.log('=== 删除定时任务 ===');
        console.log('任务ID:', taskId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data: task, error: fetchError } = await this.client
                .from('scheduled_tasks')
                .select('*')
                .eq('id', taskId)
                .single();
            if (fetchError || !task) {
                throw new common_1.NotFoundException('任务不存在');
            }
            if (!isAdmin && task.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权删除此任务');
            }
            const { error } = await this.client
                .from('scheduled_tasks')
                .delete()
                .eq('id', taskId);
            if (error) {
                console.error('删除任务失败:', error);
                throw new Error(`删除任务失败: ${error.message}`);
            }
            console.log('任务已删除');
        }
        catch (error) {
            console.error('删除任务失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`删除任务失败: ${error.message}`);
        }
    }
    async getUpcomingTasks(userId, hours = 24) {
        console.log('=== 获取即将到期的任务 ===');
        console.log('用户ID:', userId);
        console.log('时间范围:', hours, '小时');
        const now = new Date();
        const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
        const { data, error } = await this.client
            .from('scheduled_tasks')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .eq('is_active', true)
            .gte('reminder_time', now.toISOString())
            .lte('reminder_time', endTime.toISOString())
            .order('reminder_time', { ascending: true });
        if (error) {
            console.error('获取即将到期任务失败:', error);
            throw new Error(`获取即将到期任务失败: ${error.message}`);
        }
        console.log(`找到 ${data?.length || 0} 个即将到期任务`);
        return (data || []).map(item => this.mapToTask(item));
    }
    async completeTask(taskId, userId) {
        console.log('=== 完成定时任务 ===');
        console.log('任务ID:', taskId);
        return this.updateTask(taskId, userId, {
            status: 'completed',
        });
    }
    async cancelTask(taskId, userId) {
        console.log('=== 取消定时任务 ===');
        console.log('任务ID:', taskId);
        return this.updateTask(taskId, userId, {
            status: 'cancelled',
        });
    }
    async toggleTaskActive(taskId, userId, isActive) {
        console.log('=== 切换任务激活状态 ===');
        console.log('任务ID:', taskId);
        console.log('激活状态:', isActive);
        return this.updateTask(taskId, userId, {
            isActive,
        });
    }
    mapToTask(data) {
        return {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            description: data.description,
            reminderTime: data.reminder_time,
            repeatType: data.repeat_type,
            status: data.status,
            isActive: data.is_active,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            completedAt: data.completed_at,
        };
    }
};
exports.ScheduledTaskService = ScheduledTaskService;
exports.ScheduledTaskService = ScheduledTaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], ScheduledTaskService);
//# sourceMappingURL=scheduled-task.service.js.map