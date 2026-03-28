"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const scheduled_task_service_1 = require("./scheduled-task.service");
const scheduled_task_controller_1 = require("./scheduled-task.controller");
const work_plan_service_1 = require("./work-plan.service");
const work_plan_controller_1 = require("./work-plan.controller");
const user_module_1 = require("../user/user.module");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule],
        controllers: [scheduled_task_controller_1.ScheduledTaskController, work_plan_controller_1.WorkPlanController],
        providers: [scheduled_task_service_1.ScheduledTaskService, work_plan_service_1.WorkPlanService],
        exports: [scheduled_task_service_1.ScheduledTaskService, work_plan_service_1.WorkPlanService],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map