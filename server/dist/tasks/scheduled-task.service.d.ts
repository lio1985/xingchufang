import { UserService } from '../user/user.service';
export interface ScheduledTask {
    id: string;
    userId: string;
    title: string;
    description?: string;
    reminderTime: string;
    repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
    status: 'pending' | 'completed' | 'cancelled';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}
export interface CreateTaskDto {
    userId: string;
    title: string;
    description?: string;
    reminderTime: string;
    repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    reminderTime?: string;
    repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
    status?: 'pending' | 'completed' | 'cancelled';
    isActive?: boolean;
}
export declare class ScheduledTaskService {
    private readonly userService;
    private client;
    constructor(userService: UserService);
    createTask(dto: CreateTaskDto): Promise<ScheduledTask>;
    getUserTasks(currentUserId: string, targetUserId?: string, status?: string, isActive?: boolean, limit?: number, offset?: number): Promise<{
        tasks: ScheduledTask[];
        total: number;
    }>;
    getTaskById(taskId: string, currentUserId: string): Promise<ScheduledTask>;
    updateTask(taskId: string, currentUserId: string, dto: UpdateTaskDto): Promise<ScheduledTask>;
    deleteTask(taskId: string, currentUserId: string): Promise<void>;
    getUpcomingTasks(userId: string, hours?: number): Promise<ScheduledTask[]>;
    completeTask(taskId: string, userId: string): Promise<ScheduledTask>;
    cancelTask(taskId: string, userId: string): Promise<ScheduledTask>;
    toggleTaskActive(taskId: string, userId: string, isActive: boolean): Promise<ScheduledTask>;
    private mapToTask;
}
