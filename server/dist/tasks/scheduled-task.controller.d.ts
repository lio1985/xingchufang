import { ScheduledTaskService, CreateTaskDto, UpdateTaskDto } from './scheduled-task.service';
export declare class ScheduledTaskController {
    private readonly scheduledTaskService;
    constructor(scheduledTaskService: ScheduledTaskService);
    createTask(req: any, dto: Omit<CreateTaskDto, 'userId'>): Promise<{
        code: number;
        msg: string;
        data: import("./scheduled-task.service").ScheduledTask;
    }>;
    getUserTasks(req: any, targetUserId?: string, status?: string, isActive?: string, limit?: string, offset?: string): Promise<{
        code: number;
        msg: string;
        data: {
            tasks: import("./scheduled-task.service").ScheduledTask[];
            total: number;
        };
    }>;
    getTaskById(taskId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: import("./scheduled-task.service").ScheduledTask;
    }>;
    updateTask(taskId: string, req: any, dto: UpdateTaskDto): Promise<{
        code: number;
        msg: string;
        data: import("./scheduled-task.service").ScheduledTask;
    }>;
    deleteTask(taskId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    }>;
    completeTask(taskId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: import("./scheduled-task.service").ScheduledTask;
    }>;
    cancelTask(taskId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: import("./scheduled-task.service").ScheduledTask;
    }>;
    toggleTaskActive(taskId: string, req: any, isActive: boolean): Promise<{
        code: number;
        msg: string;
        data: import("./scheduled-task.service").ScheduledTask;
    }>;
    getUpcomingTasks(req: any, hours?: string): Promise<{
        code: number;
        msg: string;
        data: {
            tasks: import("./scheduled-task.service").ScheduledTask[];
            count: number;
        };
    }>;
}
