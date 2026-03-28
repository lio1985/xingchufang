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
exports.WorkPlanService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const user_service_1 = require("../user/user.service");
let WorkPlanService = class WorkPlanService {
    constructor(userService) {
        this.userService = userService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async createPlan(dto) {
        console.log('=== 创建工作计划 ===');
        console.log('用户ID:', dto.userId);
        console.log('标题:', dto.title);
        const { data, error } = await this.client
            .from('work_plans')
            .insert({
            user_id: dto.userId,
            title: dto.title,
            description: dto.description,
            start_date: dto.startDate,
            end_date: dto.endDate,
            status: 'draft',
            progress: 0,
        })
            .select()
            .single();
        if (error) {
            console.error('创建工作计划失败:', error);
            throw new Error(`创建工作计划失败: ${error.message}`);
        }
        console.log('工作计划创建成功:', data.id);
        return this.mapToPlan(data);
    }
    async getUserPlans(currentUserId, targetUserId, status, limit = 50, offset = 0) {
        console.log('=== 获取用户工作计划 ===');
        console.log('当前用户ID:', currentUserId);
        console.log('目标用户ID:', targetUserId);
        console.log('状态过滤:', status);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
                throw new common_1.ForbiddenException('无权查看其他用户的工作计划');
            }
            const queryUserId = targetUserId || currentUserId;
            let query = this.client
                .from('work_plans')
                .select('*', { count: 'exact' })
                .eq('user_id', queryUserId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            if (status) {
                query = query.eq('status', status);
            }
            const { data, error, count } = await query;
            if (error) {
                console.error('获取工作计划列表失败:', error);
                throw new Error(`获取工作计划列表失败: ${error.message}`);
            }
            console.log(`找到 ${count} 个工作计划`);
            return {
                plans: (data || []).map(item => this.mapToPlan(item)),
                total: count || 0,
            };
        }
        catch (error) {
            console.error('获取工作计划列表失败:', error);
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`获取工作计划列表失败: ${error.message}`);
        }
    }
    async getPlanById(planId, currentUserId) {
        console.log('=== 获取工作计划详情 ===');
        console.log('计划ID:', planId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data, error } = await this.client
                .from('work_plans')
                .select('*')
                .eq('id', planId)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException('工作计划不存在');
            }
            if (!isAdmin && data.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权访问此工作计划');
            }
            return this.mapToPlan(data);
        }
        catch (error) {
            console.error('获取工作计划详情失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`获取工作计划详情失败: ${error.message}`);
        }
    }
    async updatePlan(planId, currentUserId, dto) {
        console.log('=== 更新工作计划 ===');
        console.log('计划ID:', planId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data: plan, error: fetchError } = await this.client
                .from('work_plans')
                .select('*')
                .eq('id', planId)
                .single();
            if (fetchError || !plan) {
                throw new common_1.NotFoundException('工作计划不存在');
            }
            if (!isAdmin && plan.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权修改此工作计划');
            }
            const updateData = {};
            if (dto.title !== undefined)
                updateData.title = dto.title;
            if (dto.description !== undefined)
                updateData.description = dto.description;
            if (dto.startDate !== undefined)
                updateData.start_date = dto.startDate;
            if (dto.endDate !== undefined)
                updateData.end_date = dto.endDate;
            if (dto.status !== undefined)
                updateData.status = dto.status;
            const { data, error } = await this.client
                .from('work_plans')
                .update(updateData)
                .eq('id', planId)
                .select()
                .single();
            if (error) {
                console.error('更新工作计划失败:', error);
                throw new Error(`更新工作计划失败: ${error.message}`);
            }
            console.log('工作计划更新成功');
            return this.mapToPlan(data);
        }
        catch (error) {
            console.error('更新工作计划失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`更新工作计划失败: ${error.message}`);
        }
    }
    async deletePlan(planId, currentUserId) {
        console.log('=== 删除工作计划 ===');
        console.log('计划ID:', planId);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            const { data: plan, error: fetchError } = await this.client
                .from('work_plans')
                .select('*')
                .eq('id', planId)
                .single();
            if (fetchError || !plan) {
                throw new common_1.NotFoundException('工作计划不存在');
            }
            if (!isAdmin && plan.user_id !== currentUserId) {
                throw new common_1.ForbiddenException('无权删除此工作计划');
            }
            const { error } = await this.client
                .from('work_plans')
                .delete()
                .eq('id', planId);
            if (error) {
                console.error('删除工作计划失败:', error);
                throw new Error(`删除工作计划失败: ${error.message}`);
            }
            console.log('工作计划已删除');
        }
        catch (error) {
            console.error('删除工作计划失败:', error);
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`删除工作计划失败: ${error.message}`);
        }
    }
    async addTaskToPlan(planId, currentUserId, dto) {
        console.log('=== 添加任务到工作计划 ===');
        console.log('计划ID:', planId);
        console.log('任务标题:', dto.title);
        await this.getPlanById(planId, currentUserId);
        const { data, error } = await this.client
            .from('work_plan_tasks')
            .insert({
            plan_id: planId,
            title: dto.title,
            description: dto.description,
            priority: dto.priority || 'medium',
            due_date: dto.dueDate,
            status: 'pending',
        })
            .select()
            .single();
        if (error) {
            console.error('添加任务失败:', error);
            throw new Error(`添加任务失败: ${error.message}`);
        }
        console.log('任务添加成功:', data.id);
        return this.mapToTask(data);
    }
    async getPlanTasks(planId, currentUserId) {
        console.log('=== 获取工作计划的任务列表 ===');
        console.log('计划ID:', planId);
        await this.getPlanById(planId, currentUserId);
        const { data, error } = await this.client
            .from('work_plan_tasks')
            .select('*')
            .eq('plan_id', planId)
            .order('created_at', { ascending: true });
        if (error) {
            console.error('获取任务列表失败:', error);
            throw new Error(`获取任务列表失败: ${error.message}`);
        }
        console.log(`找到 ${data?.length || 0} 个任务`);
        return (data || []).map(item => this.mapToTask(item));
    }
    async updateTask(taskId, planId, currentUserId, dto) {
        console.log('=== 更新任务 ===');
        console.log('任务ID:', taskId);
        console.log('计划ID:', planId);
        const task = await this.getTaskById(taskId, planId, currentUserId);
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.status !== undefined) {
            updateData.status = dto.status;
            if (dto.status === 'completed') {
                updateData.completed_at = new Date().toISOString();
            }
        }
        if (dto.priority !== undefined)
            updateData.priority = dto.priority;
        if (dto.dueDate !== undefined)
            updateData.due_date = dto.dueDate;
        const { data, error } = await this.client
            .from('work_plan_tasks')
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
    async deleteTask(taskId, planId, currentUserId) {
        console.log('=== 删除任务 ===');
        console.log('任务ID:', taskId);
        await this.getTaskById(taskId, planId, currentUserId);
        const { error } = await this.client
            .from('work_plan_tasks')
            .delete()
            .eq('id', taskId);
        if (error) {
            console.error('删除任务失败:', error);
            throw new Error(`删除任务失败: ${error.message}`);
        }
        console.log('任务已删除');
    }
    async getTaskById(taskId, planId, currentUserId) {
        console.log('=== 获取任务详情 ===');
        console.log('任务ID:', taskId);
        const { data, error } = await this.client
            .from('work_plan_tasks')
            .select('*')
            .eq('id', taskId)
            .single();
        if (error || !data) {
            console.error('任务不存在:', error);
            throw new common_1.NotFoundException('任务不存在');
        }
        const plan = await this.getPlanById(planId, currentUserId);
        if (plan.id !== data.plan_id) {
            throw new common_1.BadRequestException('任务不属于该计划');
        }
        return this.mapToTask(data);
    }
    mapToPlan(data) {
        return {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            description: data.description,
            startDate: data.start_date,
            endDate: data.end_date,
            status: data.status,
            progress: data.progress,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
    mapToTask(data) {
        return {
            id: data.id,
            planId: data.plan_id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.due_date,
            completedAt: data.completed_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
};
exports.WorkPlanService = WorkPlanService;
exports.WorkPlanService = WorkPlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], WorkPlanService);
//# sourceMappingURL=work-plan.service.js.map