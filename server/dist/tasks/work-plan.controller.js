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
exports.WorkPlanController = void 0;
const common_1 = require("@nestjs/common");
const work_plan_service_1 = require("./work-plan.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const common_2 = require("@nestjs/common");
const uuid_util_1 = require("../utils/uuid.util");
let WorkPlanController = class WorkPlanController {
    constructor(workPlanService) {
        this.workPlanService = workPlanService;
    }
    async createPlan(req, dto) {
        try {
            console.log('=== Controller: 创建工作计划请求 ===');
            console.log('当前用户ID:', req.user?.id);
            console.log('Title:', dto.title);
            if (!req.user?.id || !dto.title) {
                throw new common_1.BadRequestException('用户ID和标题不能为空');
            }
            const plan = await this.workPlanService.createPlan({
                userId: req.user.id,
                ...dto,
            });
            console.log('=== Controller: 工作计划创建成功 ===');
            return {
                code: 200,
                msg: 'success',
                data: plan,
            };
        }
        catch (error) {
            console.error('Controller: 创建工作计划失败:', error);
            throw new common_1.BadRequestException(error.message || '创建工作计划失败');
        }
    }
    async getUserPlans(req, targetUserId, status, limit, offset) {
        try {
            console.log('=== Controller: 获取工作计划列表 ===');
            console.log('当前用户ID:', req.user?.id);
            console.log('目标用户ID:', targetUserId);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const validatedTargetUserId = (0, uuid_util_1.parseOptionalUUID)(targetUserId, 'userId');
            const result = await this.workPlanService.getUserPlans(req.user.id, validatedTargetUserId, status, limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
            console.log('=== Controller: 返回工作计划列表 ===');
            console.log('Total:', result.total);
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('Controller: 获取工作计划列表失败:', error);
            throw new common_1.BadRequestException(error.message || '获取工作计划列表失败');
        }
    }
    async getPlanById(planId, req) {
        try {
            console.log('=== Controller: 获取工作计划详情 ===');
            console.log('PlanId:', planId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const plan = await this.workPlanService.getPlanById(planId, req.user.id);
            console.log('=== Controller: 返回工作计划详情 ===');
            return {
                code: 200,
                msg: 'success',
                data: plan,
            };
        }
        catch (error) {
            console.error('Controller: 获取工作计划详情失败:', error);
            throw new common_1.BadRequestException(error.message || '获取工作计划详情失败');
        }
    }
    async updatePlan(planId, req, dto) {
        try {
            console.log('=== Controller: 更新工作计划 ===');
            console.log('PlanId:', planId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const plan = await this.workPlanService.updatePlan(planId, req.user.id, dto);
            console.log('=== Controller: 工作计划更新成功 ===');
            return {
                code: 200,
                msg: 'success',
                data: plan,
            };
        }
        catch (error) {
            console.error('Controller: 更新工作计划失败:', error);
            throw new common_1.BadRequestException(error.message || '更新工作计划失败');
        }
    }
    async deletePlan(planId, req) {
        try {
            console.log('=== Controller: 删除工作计划 ===');
            console.log('PlanId:', planId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            await this.workPlanService.deletePlan(planId, req.user.id);
            console.log('=== Controller: 工作计划已删除 ===');
            return {
                code: 200,
                msg: 'success',
                data: {
                    message: '工作计划已删除',
                },
            };
        }
        catch (error) {
            console.error('Controller: 删除工作计划失败:', error);
            throw new common_1.BadRequestException(error.message || '删除工作计划失败');
        }
    }
    async addTaskToPlan(planId, req, dto) {
        try {
            console.log('=== Controller: 添加任务到工作计划 ===');
            console.log('PlanId:', planId);
            console.log('TaskTitle:', dto.title);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const task = await this.workPlanService.addTaskToPlan(planId, req.user.id, dto);
            console.log('=== Controller: 任务添加成功 ===');
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            console.error('Controller: 添加任务失败:', error);
            throw new common_1.BadRequestException(error.message || '添加任务失败');
        }
    }
    async getPlanTasks(planId, req) {
        try {
            console.log('=== Controller: 获取工作计划的任务列表 ===');
            console.log('PlanId:', planId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const tasks = await this.workPlanService.getPlanTasks(planId, req.user.id);
            console.log('=== Controller: 返回任务列表 ===');
            console.log('Count:', tasks.length);
            return {
                code: 200,
                msg: 'success',
                data: {
                    tasks,
                    count: tasks.length,
                },
            };
        }
        catch (error) {
            console.error('Controller: 获取任务列表失败:', error);
            throw new common_1.BadRequestException(error.message || '获取任务列表失败');
        }
    }
    async updateTask(planId, taskId, req, dto) {
        try {
            console.log('=== Controller: 更新任务 ===');
            console.log('PlanId:', planId);
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const task = await this.workPlanService.updateTask(taskId, planId, req.user.id, dto);
            console.log('=== Controller: 任务更新成功 ===');
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            console.error('Controller: 更新任务失败:', error);
            throw new common_1.BadRequestException(error.message || '更新任务失败');
        }
    }
    async deleteTask(planId, taskId, req) {
        try {
            console.log('=== Controller: 删除任务 ===');
            console.log('PlanId:', planId);
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            await this.workPlanService.deleteTask(taskId, planId, req.user.id);
            console.log('=== Controller: 任务已删除 ===');
            return {
                code: 200,
                msg: 'success',
                data: {
                    message: '任务已删除',
                },
            };
        }
        catch (error) {
            console.error('Controller: 删除任务失败:', error);
            throw new common_1.BadRequestException(error.message || '删除任务失败');
        }
    }
};
exports.WorkPlanController = WorkPlanController;
__decorate([
    (0, common_1.Post)(),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "getUserPlans", null);
__decorate([
    (0, common_1.Get)(':planId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "getPlanById", null);
__decorate([
    (0, common_1.Put)(':planId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)(':planId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Post)(':planId/tasks'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "addTaskToPlan", null);
__decorate([
    (0, common_1.Get)(':planId/tasks'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "getPlanTasks", null);
__decorate([
    (0, common_1.Put)(':planId/tasks/:taskId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)(':planId/tasks/:taskId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkPlanController.prototype, "deleteTask", null);
exports.WorkPlanController = WorkPlanController = __decorate([
    (0, common_1.Controller)('tasks/work-plans'),
    __metadata("design:paramtypes", [work_plan_service_1.WorkPlanService])
], WorkPlanController);
//# sourceMappingURL=work-plan.controller.js.map