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
exports.ScheduledTaskController = void 0;
const common_1 = require("@nestjs/common");
const scheduled_task_service_1 = require("./scheduled-task.service");
const active_user_guard_1 = require("../guards/active-user.guard");
const common_2 = require("@nestjs/common");
const uuid_util_1 = require("../utils/uuid.util");
let ScheduledTaskController = class ScheduledTaskController {
    constructor(scheduledTaskService) {
        this.scheduledTaskService = scheduledTaskService;
    }
    async createTask(req, dto) {
        try {
            console.log('=== Controller: 创建定时任务请求 ===');
            console.log('当前用户ID:', req.user?.id);
            console.log('Title:', dto.title);
            if (!req.user?.id || !dto.title || !dto.reminderTime) {
                throw new common_1.BadRequestException('用户ID、标题和提醒时间不能为空');
            }
            const task = await this.scheduledTaskService.createTask({
                userId: req.user.id,
                ...dto,
            });
            console.log('=== Controller: 任务创建成功 ===');
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            console.error('Controller: 创建任务失败:', error);
            throw new common_1.BadRequestException(error.message || '创建任务失败');
        }
    }
    async getUserTasks(req, targetUserId, status, isActive, limit, offset) {
        try {
            console.log('=== Controller: 获取任务列表 ===');
            console.log('当前用户ID:', req.user?.id);
            console.log('目标用户ID:', targetUserId);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const validatedTargetUserId = (0, uuid_util_1.parseOptionalUUID)(targetUserId, 'userId');
            const result = await this.scheduledTaskService.getUserTasks(req.user.id, validatedTargetUserId, status, isActive === 'true' ? true : isActive === 'false' ? false : undefined, limit ? parseInt(limit) : 50, offset ? parseInt(offset) : 0);
            console.log('=== Controller: 返回任务列表 ===');
            console.log('Total:', result.total);
            return {
                code: 200,
                msg: 'success',
                data: result,
            };
        }
        catch (error) {
            console.error('Controller: 获取任务列表失败:', error);
            throw new common_1.BadRequestException(error.message || '获取任务列表失败');
        }
    }
    async getTaskById(taskId, req) {
        try {
            console.log('=== Controller: 获取任务详情 ===');
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const task = await this.scheduledTaskService.getTaskById(taskId, req.user.id);
            console.log('=== Controller: 返回任务详情 ===');
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            console.error('Controller: 获取任务详情失败:', error);
            throw new common_1.BadRequestException(error.message || '获取任务详情失败');
        }
    }
    async updateTask(taskId, req, dto) {
        try {
            console.log('=== Controller: 更新任务 ===');
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const task = await this.scheduledTaskService.updateTask(taskId, req.user.id, dto);
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
    async deleteTask(taskId, req) {
        try {
            console.log('=== Controller: 删除任务 ===');
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            await this.scheduledTaskService.deleteTask(taskId, req.user.id);
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
    async completeTask(taskId, req) {
        try {
            console.log('=== Controller: 完成任务 ===');
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const task = await this.scheduledTaskService.completeTask(taskId, req.user.id);
            console.log('=== Controller: 任务已完成 ===');
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            console.error('Controller: 完成任务失败:', error);
            throw new common_1.BadRequestException(error.message || '完成任务失败');
        }
    }
    async cancelTask(taskId, req) {
        try {
            console.log('=== Controller: 取消任务 ===');
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const task = await this.scheduledTaskService.cancelTask(taskId, req.user.id);
            console.log('=== Controller: 任务已取消 ===');
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            console.error('Controller: 取消任务失败:', error);
            throw new common_1.BadRequestException(error.message || '取消任务失败');
        }
    }
    async toggleTaskActive(taskId, req, isActive) {
        try {
            console.log('=== Controller: 切换任务激活状态 ===');
            console.log('TaskId:', taskId);
            console.log('当前用户ID:', req.user?.id);
            console.log('IsActive:', isActive);
            if (!req.user?.id) {
                throw new common_1.BadRequestException('用户ID不能为空');
            }
            const task = await this.scheduledTaskService.toggleTaskActive(taskId, req.user.id, isActive);
            console.log('=== Controller: 任务状态已切换 ===');
            return {
                code: 200,
                msg: 'success',
                data: task,
            };
        }
        catch (error) {
            console.error('Controller: 切换任务状态失败:', error);
            throw new common_1.BadRequestException(error.message || '切换任务状态失败');
        }
    }
    async getUpcomingTasks(req, hours) {
        try {
            console.log('=== Controller: 获取即将到期任务 ===');
            console.log('当前用户ID:', req.user?.id);
            console.log('Hours:', hours);
            const tasks = await this.scheduledTaskService.getUpcomingTasks(req.user.id, hours ? parseInt(hours) : 24);
            console.log('=== Controller: 返回即将到期任务 ===');
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
            console.error('Controller: 获取即将到期任务失败:', error);
            throw new common_1.BadRequestException(error.message || '获取即将到期任务失败');
        }
    }
};
exports.ScheduledTaskController = ScheduledTaskController;
__decorate([
    (0, common_1.Post)(),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('isActive')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "getUserTasks", null);
__decorate([
    (0, common_1.Get)(':taskId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "getTaskById", null);
__decorate([
    (0, common_1.Put)(':taskId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)(':taskId'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "deleteTask", null);
__decorate([
    (0, common_1.Post)(':taskId/complete'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "completeTask", null);
__decorate([
    (0, common_1.Post)(':taskId/cancel'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "cancelTask", null);
__decorate([
    (0, common_1.Post)(':taskId/toggle'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "toggleTaskActive", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, common_2.UseGuards)(active_user_guard_1.ActiveUserGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ScheduledTaskController.prototype, "getUpcomingTasks", null);
exports.ScheduledTaskController = ScheduledTaskController = __decorate([
    (0, common_1.Controller)('tasks/scheduled'),
    __metadata("design:paramtypes", [scheduled_task_service_1.ScheduledTaskService])
], ScheduledTaskController);
//# sourceMappingURL=scheduled-task.controller.js.map